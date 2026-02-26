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

        // 5. Badge Logic
        const solvedCount = user.solvedChallenges.length;
        const newBadges: string[] = [];

        // Milestone Badges
        if (solvedCount === 1 && !user.badges.includes('First Blood')) newBadges.push('First Blood');
        if (solvedCount === 5 && !user.badges.includes('Script Kiddie')) newBadges.push('Script Kiddie');
        if (solvedCount === 10 && !user.badges.includes('Hacker')) newBadges.push('Hacker');
        if (solvedCount === 25 && !user.badges.includes('Elite')) newBadges.push('Elite');
        if (solvedCount === 50 && !user.badges.includes('God Mode')) newBadges.push('God Mode');

        // Category Badges (Requires fetching all solved challenges to count categories, efficient enough for this scale)
        // Only run this check if we haven't already earned the badge for this category
        // Optimization: Just load the categories of solved challenges if needed, but for now simple fetch is okay
        // OR better: Just check the current challenge's category and count previous solves in that category

        // Let's do a quick aggregate count for the current category
        const solvedDocs = await Challenge.find({ _id: { $in: user.solvedChallenges } }).select('category');
        const categoryCount = solvedDocs.filter(c => c.category === challenge.category).length;

        if (challenge.category === 'Web' && categoryCount >= 5 && !user.badges.includes('Web Master')) newBadges.push('Web Master');
        if (challenge.category === 'Crypto' && categoryCount >= 5 && !user.badges.includes('Crypto King')) newBadges.push('Crypto King');
        if (challenge.category === 'Forensics' && categoryCount >= 5 && !user.badges.includes('Forensics Expert')) newBadges.push('Forensics Expert');

        if (newBadges.length > 0) {
            user.badges.push(...newBadges);
        }

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
