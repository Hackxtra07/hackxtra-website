import { connectDB } from '@/lib/mongodb';
import { Challenge, User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { rateLimit, getClientIp, getRateLimitRetryAfter } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // ── IP Rate Limit: 10 submissions per minute ──────────────────────────
        const ip = getClientIp(request);
        if (rateLimit(ip, 'challenge-submit', { limit: 10, windowMs: 60_000 })) {
            const retryAfter = getRateLimitRetryAfter(ip, 'challenge-submit');
            return createErrorResponse(`Too many submissions. Try again in ${retryAfter}s.`, 429);
        }

        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const { challengeId, flag } = await request.json();

        // 1. Fetch Challenge & User
        const challenge = await Challenge.findById(challengeId).select('+flag');
        if (!challenge) return createErrorResponse('Challenge not found', 404);

        const user = await User.findOne({ email: auth.email });
        if (!user) return createErrorResponse('User not found', 404);

        // 2. Already solved?
        if (user.solvedChallenges.map((id: any) => id.toString()).includes(challengeId)) {
            return createErrorResponse('Challenge already solved', 400);
        }

        // 3. Verify Flag
        if (flag.trim() !== challenge.flag) {
            // ── 2-Tries Replace Logic ─────────────────────────────────────────
            if (!user.challengeAttempts) {
                user.challengeAttempts = [];
            }

            let attemptEntry = user.challengeAttempts.find(
                (a: { challengeId: string }) => a.challengeId === challengeId
            );

            if (!attemptEntry) {
                // First wrong attempt
                user.challengeAttempts.push({ challengeId, attempts: 1 });
                await user.save();
                return NextResponse.json({ error: 'Incorrect flag', attemptsLeft: 1 }, { status: 400 });
            }

            attemptEntry.attempts += 1;

            // After 2 wrong attempts → replace the challenge
            if (attemptEntry.attempts >= 2) {
                // Pick a random replacement (not this challenge, not already solved)
                const solvedIds = user.solvedChallenges.map((id: any) => id.toString());
                const [replacement] = await Challenge.aggregate([
                    {
                        $match: {
                            $and: [
                                { _id: { $ne: challenge._id } },
                                { _id: { $nin: solvedIds } },
                            ],
                        },
                    },
                    { $sample: { size: 1 } },
                ]);

                attemptEntry.replacedBy = replacement?._id?.toString() || null;
                await user.save();

                // Delete the original challenge
                await Challenge.findByIdAndDelete(challengeId);

                // Replenish pool if needed
                const { replenishChallenges } = await import('@/lib/challenge-utils');
                await replenishChallenges();

                return NextResponse.json(
                    {
                        error: 'Incorrect flag',
                        replaced: true,
                        newChallengeId: replacement?._id || null,
                        message: 'Challenge replaced after 2 wrong attempts.',
                    },
                    { status: 400 }
                );
            }

            // First wrong attempt saved on 2nd call (race guard)
            await user.save();
            return NextResponse.json({ error: 'Incorrect flag', attemptsLeft: 2 - attemptEntry.attempts }, { status: 400 });
        }

        // 4. Correct — Update Stats
        user.points += challenge.points;
        user.solvedChallenges.push(challengeId);

        // Remove attempt entry now that it's solved
        if (user.challengeAttempts) {
            user.challengeAttempts = user.challengeAttempts.filter(
                (a: { challengeId: string }) => a.challengeId !== challengeId
            );
        }

        // 5. Badge Logic
        const { awardBadges } = await import('@/lib/badge-utils');
        const newBadges = await awardBadges(user._id);

        await user.save();

        // 6. Delete challenge after solve
        await Challenge.findByIdAndDelete(challengeId);

        // 7. Replenish challenges if count is low
        const { replenishChallenges } = await import('@/lib/challenge-utils');
        await replenishChallenges();

        return createSuccessResponse({
            message: 'Correct flag!',
            pointsAwarded: challenge.points,
            newTotal: user.points,
            newBadges,
        });
    } catch (error) {
        console.error('Submit challenge error:', error);
        return createErrorResponse('Submission failed', 500);
    }
}
