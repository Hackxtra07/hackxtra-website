import { connectDB } from '@/lib/mongodb';
import { User, Admin, Session } from '@/lib/models';
import { signToken, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getClientIp } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const sessionId = request.cookies.get('sessionId')?.value;

        if (!sessionId) {
            return createErrorResponse('No active session found', 401);
        }

        await connectDB();
        const ip = getClientIp(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const session = await Session.findOne({
            sessionId,
            isValid: true
        });

        if (!session || session.expiresAt < new Date()) {
            return createErrorResponse('Session expired or invalid', 401);
        }

        // ── Device Footprint Check ──────────────────────────────────────────
        // Auto-login only works if the device footprint matches
        if (session.userAgent && session.userAgent !== userAgent) {
            console.warn(`Auto-login footprint mismatch: ${session.userAgent} !== ${userAgent}`);
            return createErrorResponse('Security verification failed. Please log in again.', 401);
        }

        // Fetch user data
        let user;
        if (session.userModel === 'Admin') {
            user = await Admin.findById(session.userId);
        } else {
            user = await User.findById(session.userId);
        }

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        const token = signToken(user.email, sessionId);

        // Update lastActive
        await Session.updateOne(
            { _id: session._id },
            { $set: { lastActive: new Date(), ipAddress: ip } }
        );

        return createSuccessResponse({
            token,
            user: {
                id: user._id,
                username: (user as any).username || (user as any).name,
                email: user.email,
                role: (user as any).role || 'admin',
                isPro: (user as any).isPro || (session.userModel === 'Admin'),
            }
        });
    } catch (error) {
        console.error('Session check error:', error);
        return createErrorResponse('Internal server error', 500);
    }
}
