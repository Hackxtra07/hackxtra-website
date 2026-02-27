import { connectDB } from './mongodb';
import { Badge, User, Challenge } from './models';

/**
 * Automatically evaluates and awards badges to a user based on their current progress.
 * @param userId - The ID of the user to evaluate
 * @returns An array of newly awarded badge names
 */
export async function awardBadges(userId: string) {
    try {
        await connectDB();

        // 1. Fetch user and all available badges
        const user = await User.findById(userId);
        if (!user) return [];

        const allBadges = await Badge.find();
        if (!allBadges.length) return [];

        // 2. Identify badges the user doesn't already have
        const missingBadges = allBadges.filter(badge => !user.badges.includes(badge.name));
        if (!missingBadges.length) return [];

        // 3. Gather stats for current user if needed for requirements
        // Count solved challenges by category once to avoid repeated queries
        let categoryCounts: Record<string, number> = {};
        const needsCategoryChecks = missingBadges.some(b =>
            b.requirements?.categoryRequirements && b.requirements.categoryRequirements.length > 0
        );

        if (needsCategoryChecks && user.solvedChallenges.length > 0) {
            const solvedChallenges = await Challenge.find({ _id: { $in: user.solvedChallenges } }).select('category');
            solvedChallenges.forEach(ch => {
                categoryCounts[ch.category] = (categoryCounts[ch.category] || 0) + 1;
            });
        }

        const newBadges: string[] = [];

        // 4. Evaluate each missing badge
        for (const badge of missingBadges) {
            const req = badge.requirements;
            if (!req) continue;

            let meetsAll = true;

            // Total Solved Requirement
            if (req.minSolved && user.solvedChallenges.length < req.minSolved) {
                meetsAll = false;
            }

            // Points Requirement
            if (req.minPoints && user.points < req.minPoints) {
                meetsAll = false;
            }

            // Pro Requirement
            if (req.requirePro && !user.isPro) {
                meetsAll = false;
            }

            // Category Requirements
            if (req.categoryRequirements && req.categoryRequirements.length > 0) {
                for (const catReq of req.categoryRequirements) {
                    if ((categoryCounts[catReq.category] || 0) < catReq.minCount) {
                        meetsAll = false;
                        break;
                    }
                }
            }

            // If all requirements met, add to new badges
            if (meetsAll) {
                newBadges.push(badge.name);
            }
        }

        // 5. Update user if new badges awarded
        if (newBadges.length > 0) {
            user.badges.push(...newBadges);
            await user.save();
        }

        return newBadges;
    } catch (error) {
        console.error('Error awarding badges:', error);
        return [];
    }
}
