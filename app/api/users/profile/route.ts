import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const user = await User.findOne({ email: auth.email });

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        // Calculate Rank
        const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1;

        return createSuccessResponse({
            ...user.toObject(),
            rank
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return createErrorResponse('Failed to fetch profile', 500);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        // Prevent updating sensitive fields
        delete body.password;
        delete body.email;
        delete body.role;
        delete body.points; // Points handled by admin only
        delete body.badges; // Badges handled by admin only

        const user = await User.findOneAndUpdate(
            { email: auth.email },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        return createSuccessResponse(user);
    } catch (error) {
        console.error('Profile update error:', error);
        return createErrorResponse('Failed to update profile', 500);
    }
}
