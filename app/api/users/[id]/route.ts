import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        const user = await User.findById(id);

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        return createSuccessResponse(user);
    } catch (error) {
        console.error('Fetch user error:', error);
        return createErrorResponse('Failed to fetch user', 500);
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        const user = await User.findById(id);

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        // Update fields
        user.username = body.username || user.username;
        user.email = body.email || user.email;
        user.points = body.points !== undefined ? body.points : user.points;
        user.badges = body.badges || user.badges;
        user.country = body.country || user.country;
        user.role = body.role || user.role;
        user.bio = body.bio || user.bio;
        user.socialLinks = body.socialLinks || user.socialLinks;
        user.avatarColor = body.avatarColor || user.avatarColor;
        user.change = body.change || user.change;
        if (body.isPro !== undefined) user.isPro = body.isPro;
        if (body.subscriptionExpiresAt !== undefined) user.subscriptionExpiresAt = body.subscriptionExpiresAt;

        // Only update password if provided
        if (body.password) {
            user.password = body.password;
        }

        await user.save();

        return createSuccessResponse(user);
    } catch (error) {
        console.error('Update user error:', error);
        return createErrorResponse('Failed to update user', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        return createSuccessResponse({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return createErrorResponse('Failed to delete user', 500);
    }
}
