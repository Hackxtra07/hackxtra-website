import { NextRequest } from 'next/server';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * GET /api/auth/2fa/setup
 * Generate a new TOTP secret + QR code for the authenticated user.
 * Stores the secret as pendingSecret until confirmed via POST.
 */
export async function GET(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        if (rateLimit(ip, '2fa-setup', { limit: 5, windowMs: 60_000 })) {
            return createErrorResponse('Too many requests. Please wait.', 429);
        }

        const auth = await authenticateRequest(request);
        if (!auth) return createErrorResponse('Unauthorized', 401);

        const { generateSecret, generateURI } = await import('otplib');
        const QRCode = (await import('qrcode')).default;

        const secret = generateSecret();
        const otpauth = generateURI({ issuer: 'HackXtras', label: auth.email, secret });
        const qrDataUrl = await QRCode.toDataURL(otpauth);

        await connectDB();
        await User.findOneAndUpdate(
            { email: auth.email },
            { $set: { 'twoFA.pendingSecret': secret } }
        );

        return createSuccessResponse({ qrDataUrl, secret });
    } catch (error) {
        console.error('2FA setup GET error:', error);
        return createErrorResponse('Failed to generate 2FA secret', 500);
    }
}

/**
 * POST /api/auth/2fa/setup
 * Confirm a TOTP code against the pendingSecret to activate 2FA.
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        if (rateLimit(ip, '2fa-setup-confirm', { limit: 10, windowMs: 60_000 })) {
            return createErrorResponse('Too many requests. Please wait.', 429);
        }

        const auth = await authenticateRequest(request);
        if (!auth) return createErrorResponse('Unauthorized', 401);

        const { token } = await request.json();
        if (!token) return createErrorResponse('TOTP token is required', 400);

        await connectDB();
        const user = await User.findOne({ email: auth.email }).select('+twoFA.pendingSecret +twoFA.secret +twoFA.enabled');
        if (!user) return createErrorResponse('User not found', 404);

        const pendingSecret = user.twoFA?.pendingSecret;
        if (!pendingSecret) {
            return createErrorResponse('No pending 2FA setup found. Start setup again.', 400);
        }

        const { verify } = await import('otplib');
        const result = await verify({ token, secret: pendingSecret });
        if (!result.valid) {
            return createErrorResponse('Invalid TOTP code. Please try again.', 401);
        }

        // Promote pendingSecret → secret and enable 2FA
        await User.findOneAndUpdate(
            { email: auth.email },
            {
                $set: {
                    'twoFA.secret': pendingSecret,
                    'twoFA.enabled': true,
                },
                $unset: { 'twoFA.pendingSecret': '' },
            }
        );

        return createSuccessResponse({ message: '2FA enabled successfully' });
    } catch (error) {
        console.error('2FA setup POST error:', error);
        return createErrorResponse('Failed to enable 2FA', 500);
    }
}
