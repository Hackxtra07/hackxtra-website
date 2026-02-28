import { connectDB } from '@/lib/mongodb';
import { User, Session } from '@/lib/models';
import { signToken, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await request.json();

        if (!email || !password) {
            return createErrorResponse('Missing email or password', 400);
        }

        // Explicitly select password since it has select: false
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return createErrorResponse('Invalid credentials', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return createErrorResponse('Invalid credentials', 401);
        }

        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await Session.create({
            userId: user._id,
            userModel: 'User',
            sessionId,
            expiresAt,
            userAgent: request.headers.get('user-agent') || undefined,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        });

        const token = signToken(user.email, sessionId);

        return createSuccessResponse({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isPro: user.isPro,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return createErrorResponse('Login failed', 500);
    }
}
