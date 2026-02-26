import { Challenge } from './models';
import { challengePool } from './challenge-pool';

const REPLENISH_THRESHOLD = 8;
const BATCH_SIZE = 4;

export async function replenishChallenges() {
    try {
        // 1. Check current challenge count
        const currentCount = await Challenge.countDocuments();

        if (currentCount >= REPLENISH_THRESHOLD) {
            return { replenished: false, count: 0 };
        }

        // 2. Fetch existing titles to avoid duplicates
        const existingChallenges = await Challenge.find().select('title');
        const existingTitles = new Set(existingChallenges.map(c => c.title));

        // 3. Filter pool for new challenges
        const availablePool = challengePool.filter(c => !existingTitles.has(c.title));

        if (availablePool.length === 0) {
            console.log("Replenish: No new challenges available in pool.");
            return { replenished: false, count: 0 };
        }

        // 4. Select random challenges from available pool
        const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
        const toAdd = shuffled.slice(0, Math.min(BATCH_SIZE, shuffled.length));

        // 5. Insert into database
        if (toAdd.length > 0) {
            await Challenge.insertMany(toAdd);
            console.log(`Replenished ${toAdd.length} challenges.`);
            return { replenished: true, count: toAdd.length };
        }

        return { replenished: false, count: 0 };
    } catch (error) {
        console.error('Replenish challenges error:', error);
        throw error;
    }
}
