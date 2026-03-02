import { NextRequest } from 'next/server';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/auth/2fa/disable
 * Verify current TOTP token and disable 2FA for the authenticated user.
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        if (rateLimit(ip, '2fa-disable', { limit: 5, windowMs: 60_000 })) {
            return createErrorResponse('Too many requests. Please wait.', 429);
        }

        const auth = await authenticateRequest(request);
        if (!auth) return createErrorResponse('Unauthorized', 401);

        const { token } = await request.json();
        if (!token) return createErrorResponse('TOTP token is required', 400);

        await connectDB();
        const user = await User.findOne({ email: auth.email }).select('+twoFA.secret +twoFA.enabled');
        if (!user) return createErrorResponse('User not found', 404);

        if (!user.twoFA?.enabled || !user.twoFA.secret) {
            return createErrorResponse('2FA is not enabled on this account', 400);
        }

        const { verify } = await import('otplib');
        const result = await verify({ token, secret: user.twoFA.secret });
        if (!result.valid) {
            return createErrorResponse('Invalid TOTP code. 2FA not disabled.', 401);
        }

        await User.findOneAndUpdate(
            { email: auth.email },
            {
                $set: { 'twoFA.enabled': false },
                $unset: { 'twoFA.secret': '', 'twoFA.pendingSecret': '' },
            }
        );

        return createSuccessResponse({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('2FA disable error:', error);
        return createErrorResponse('Failed to disable 2FA', 500);
    }
}
