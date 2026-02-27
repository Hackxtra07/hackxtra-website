import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';
import { Badge, User } from '../lib/models';
import { awardBadges } from '../lib/badge-utils';
import mongoose from 'mongoose';

async function verifyBadgeAutomation() {
    try {
        console.log('Connecting to DB...');
        await connectDB();

        // 1. Create a Test Badge
        const testBadgeName = 'Verification Badge ' + Date.now();
        console.log(`Creating test badge: ${testBadgeName}`);

        const badge = new Badge({
            name: testBadgeName,
            description: 'Automated verification badge.',
            icon: 'Award',
            requirements: {
                minSolved: 1
            }
        });
        await badge.save();

        // 2. Find a test user (or use a mock ID if needed, but better to use a real user for full chain test)
        // Let's just find any user
        const user = await User.findOne();
        if (!user) {
            console.log('No user found to test with.');
            return;
        }

        console.log(`Testing with user: ${user.username}`);
        console.log(`Initial badges: ${user.badges.join(', ') || 'None'}`);

        // 3. Ensure user meets requirements (has at least 1 solved challenge)
        if (user.solvedChallenges.length === 0) {
            console.log('User has no solved challenges. Adding a dummy solve...');
            // In a real environment we'd use a real challenge ID, but for testing logic:
            user.solvedChallenges.push(new mongoose.Types.ObjectId());
            await user.save();
        }

        // 4. Trigger awardBadges
        console.log('Running awardBadges...');
        const newlyAwarded = await awardBadges(user._id);

        console.log('Newly awarded badges:', newlyAwarded);

        // 5. Verify
        const updatedUser = await User.findById(user._id);
        if (updatedUser?.badges.includes(testBadgeName)) {
            console.log('SUCCESS: Badge was automatically awarded!');
        } else {
            console.log('FAILURE: Badge was not awarded.');
        }

        // Cleanup (Optional)
        // await Badge.findByIdAndDelete(badge._id);

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        mongoose.disconnect();
    }
}

verifyBadgeAutomation();
