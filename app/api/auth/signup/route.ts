import { connectDB } from '@/lib/mongodb';
import { User, Session } from '@/lib/models';
import { signToken, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getClientIp } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return createErrorResponse('Missing required fields', 400);
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return createErrorResponse('Username or email already exists', 400);
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const ip = getClientIp(request);
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
        }, 201);

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
        console.error('Signup error:', error);
        return createErrorResponse('Signup failed', 500);
    }
}
