import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse, getAuthenticatedUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        const userRecord = await User.findById(user._id).select('points');

        if (!userRecord) {
            return createErrorResponse('User not found', 404);
        }

        return createSuccessResponse({ points: userRecord.points });
    } catch (error) {
        console.error('Fetch points error:', error);
        return createErrorResponse('Failed to fetch points', 500);
    }
}
