import { connectDB } from '@/lib/mongodb';
import { User, Session } from '@/lib/models';
import { signToken, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { rateLimit, getClientIp, getRateLimitRetryAfter } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // ── IP Rate Limit: 5 login attempts per 60s ──────────────────────────
        const ip = getClientIp(request);
        if (rateLimit(ip, 'user-login', { limit: 5, windowMs: 60_000 })) {
            const retryAfter = getRateLimitRetryAfter(ip, 'user-login');
            return createErrorResponse(`Too many login attempts. Try again in ${retryAfter}s.`, 429);
        }

        await connectDB();
        const { email, password, totpCode } = await request.json();

        if (!email || !password) {
            return createErrorResponse('Missing email or password', 400);
        }

        // Explicitly select password + twoFA since they have select: false
        const user = await User.findOne({ email }).select('+password +twoFA.secret +twoFA.enabled');

        if (!user) {
            return createErrorResponse('Invalid credentials', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return createErrorResponse('Invalid credentials', 401);
        }

        // ── 2FA check ────────────────────────────────────────────────────────
        if (user.twoFA?.enabled && user.twoFA.secret) {
            if (!totpCode) {
                // Signal to frontend that 2FA is required
                return createSuccessResponse({ requires2FA: true }, 200);
            }
            const { verify } = await import('otplib');
            const verifyResult = await verify({ token: totpCode, secret: user.twoFA.secret });
            const isValid = verifyResult.valid;
            if (!isValid) {
                return createErrorResponse('Invalid 2FA code', 401);
            }
        }

        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await Session.create({
            userId: user._id,
            userModel: 'User',
            sessionId,
            expiresAt,
            userAgent: request.headers.get('user-agent') || undefined,
            ipAddress: ip,
        });

        const token = signToken(user.email, sessionId);

        const response = createSuccessResponse({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isPro: user.isPro,
            }
        });

        // Set session cookie for auto-login/middleware
        response.cookies.set('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return createErrorResponse('Login failed', 500);
    }
}
