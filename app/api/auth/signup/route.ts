import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { signToken, createErrorResponse, createSuccessResponse } from '@/lib/auth';
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

        const token = signToken(user.email);

        return createSuccessResponse({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isPro: user.isPro,
            }
        }, 201);
    } catch (error) {
        console.error('Signup error:', error);
        return createErrorResponse('Signup failed', 500);
    }
}
