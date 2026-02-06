import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        // Sort by points descending to generate leaderboard
        const users = await User.find().sort({ points: -1 });
        return createSuccessResponse(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        return createErrorResponse('Failed to fetch users', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        // Check for existing username
        const existing = await User.findOne({ username: body.username });
        if (existing) {
            return createErrorResponse('Username already exists', 400);
        }

        const user = new User(body);
        await user.save();

        return createSuccessResponse(user, 201);
    } catch (error) {
        console.error('Create user error:', error);
        return createErrorResponse('Failed to create user', 500);
    }
}
