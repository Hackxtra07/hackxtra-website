import { connectDB } from '@/lib/mongodb';
import { User, Challenge } from '@/lib/models';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();

        // 1. Active Hackers (Total users)
        const activeHackers = await User.countDocuments();

        // 2. Challenges Solved (Sum of solvedChallenges array lengths)
        // Using aggregation for efficiency if the user base grows
        const solvedChallengesStats = await User.aggregate([
            { $project: { solvedCount: { $size: { $ifNull: ["$solvedChallenges", []] } } } },
            { $group: { _id: null, totalSolved: { $sum: "$solvedCount" } } }
        ]);
        const challengesSolved = solvedChallengesStats[0]?.totalSolved || 0;

        // 3. Points Awarded (Sum of all user points)
        const pointsStats = await User.aggregate([
            { $group: { _id: null, totalPoints: { $sum: "$points" } } }
        ]);
        const totalPointsAwarded = pointsStats[0]?.totalPoints || 0;

        return createSuccessResponse({
            activeHackers,
            challengesSolved,
            totalPointsAwarded
        });
    } catch (error) {
        console.error('Leaderboard stats error:', error);
        return createErrorResponse('Failed to fetch leaderboard stats', 500);
    }
}
