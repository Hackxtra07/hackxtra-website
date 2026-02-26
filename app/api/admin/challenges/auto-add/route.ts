import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Challenge } from '@/lib/models';
import { challengePool } from '@/lib/challenge-pool';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        // 1. Fetch existing titles to avoid duplicates
        const existingChallenges = await Challenge.find().select('title');
        const existingTitles = new Set(existingChallenges.map(c => c.title));

        // 2. Filter pool for new challenges
        const availablePool = challengePool.filter(c => !existingTitles.has(c.title));

        if (availablePool.length === 0) {
            return createErrorResponse('No new challenges available in pool.', 400);
        }

        // 3. Select 10 random challenges from available pool (more than standard replenishment)
        const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
        const toAdd = shuffled.slice(0, Math.min(10, shuffled.length));

        // 4. Insert into database
        if (toAdd.length > 0) {
            await Challenge.insertMany(toAdd);
            return createSuccessResponse({
                message: `Successfully added ${toAdd.length} challenges.`,
                count: toAdd.length
            });
        }

        return createErrorResponse('Nothing to add', 400);
    } catch (error) {
        console.error('Auto-add challenges error:', error);
        return createErrorResponse('Internal Server Error', 500);
    }
}
