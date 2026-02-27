import { connectDB } from '@/lib/mongodb';
import { Challenge, User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
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

        // 2. Initial Checks
        if (user.solvedChallenges.includes(challengeId)) {
            return createErrorResponse('Challenge already solved', 400);
        }

        // 3. Verify Flag (Case sensitive usually, but depends on CTF style. Let's keep it strict)
        if (flag.trim() !== challenge.flag) {
            return createErrorResponse('Incorrect flag', 400);
        }

        // 4. Update Stats
        user.points += challenge.points;
        user.solvedChallenges.push(challengeId);

        // 5. Badge Logic (Automated)
        const { awardBadges } = await import('@/lib/badge-utils');
        const newBadges = await awardBadges(user._id);

        await user.save();

        // 6. Delete challenge after solve (requested feature)
        await Challenge.findByIdAndDelete(challengeId);

        // 7. Replenish challenges if count is low
        const { replenishChallenges } = await import('@/lib/challenge-utils');
        await replenishChallenges();

        return createSuccessResponse({
            message: 'Correct flag!',
            pointsAwarded: challenge.points,
            newTotal: user.points,
            newBadges: newBadges // Frontend can display "Badge Unlocked!" toast
        });

    } catch (error) {
        console.error('Submit challenge error:', error);
        return createErrorResponse('Submission failed', 500);
    }
}
