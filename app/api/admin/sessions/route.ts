import { connectDB } from '@/lib/mongodb';
import { Session, User, Admin } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        // Fetch all sessions and populate user details
        const sessions = await Session.find().sort({ createdAt: -1 }).lean();

        const enrichedSessions = await Promise.all(sessions.map(async (session: any) => {
            let userData = null;
            if (session.userModel === 'User') {
                userData = await User.findById(session.userId).select('username email').lean();
            } else if (session.userModel === 'Admin') {
                userData = await Admin.findById(session.userId).select('name email').lean();
            }

            return {
                ...session,
                user: userData
            };
        }));

        return createSuccessResponse(enrichedSessions);
    } catch (error) {
        console.error('Fetch sessions error:', error);
        return createErrorResponse('Failed to fetch sessions', 500);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return createErrorResponse('Session ID is required', 400);
        }

        await connectDB();

        const session = await Session.findOneAndUpdate(
            { sessionId },
            { $set: { isValid: false } },
            { new: true }
        );

        if (!session) {
            return createErrorResponse('Session not found', 404);
        }

        return createSuccessResponse({ message: 'Session revoked successfully' });
    } catch (error) {
        console.error('Revoke session error:', error);
        return createErrorResponse('Failed to revoke session', 500);
    }
}
