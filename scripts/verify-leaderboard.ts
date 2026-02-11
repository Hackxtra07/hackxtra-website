import { connectDB } from '../lib/mongodb';
import { User } from '../lib/models';

async function verify() {
    try {
        await connectDB();
        console.log('Connected to Database');

        // 1. Check Global Stats logic
        const activeHackers = await User.countDocuments();
        const solvedChallengesStats = await User.aggregate([
            { $project: { solvedCount: { $size: { $ifNull: ["$solvedChallenges", []] } } } },
            { $group: { _id: null, totalSolved: { $sum: "$solvedCount" } } }
        ]);
        const challengesSolved = solvedChallengesStats[0]?.totalSolved || 0;

        const pointsStats = await User.aggregate([
            { $group: { _id: null, totalPoints: { $sum: "$points" } } }
        ]);
        const totalPointsAwarded = pointsStats[0]?.totalPoints || 0;

        console.log('--- Global Stats Verification ---');
        console.log(`Active Hackers: ${activeHackers}`);
        console.log(`Challenges Solved: ${challengesSolved}`);
        console.log(`Total Points Awarded: ${totalPointsAwarded}`);

        // 2. Check Rank Calculation logic for a sample user
        const sampleUser = await User.findOne().sort({ points: -1 });
        if (sampleUser) {
            const rank = await User.countDocuments({ points: { $gt: sampleUser.points } }) + 1;
            console.log('\n--- Rank Verification ---');
            console.log(`Sample User: ${sampleUser.username}`);
            console.log(`Points: ${sampleUser.points}`);
            console.log(`Calculated Rank: ${rank}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
