import { connectDB } from '@/lib/mongodb';
import { Session } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        if (!auth.sessionId) {
            return createErrorResponse('No active session found in token', 400);
        }

        await connectDB();

        // Invalidate the session
        const session = await Session.findOneAndUpdate(
            { sessionId: auth.sessionId },
            { $set: { isValid: false } },
            { new: true }
        );

        if (!session) {
            return createErrorResponse('Session not found', 404);
        }

        return createSuccessResponse({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return createErrorResponse('Logout failed', 500);
    }
}
