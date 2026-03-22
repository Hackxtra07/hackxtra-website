import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * GET /api/users/[id]/public
 * Returns public-safe user profile data.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        
        // Select only public-safe fields
        const user = await User.findById(id).select(
            'username points badges country avatarColor bio socialLinks isPro createdAt solvedChallenges'
        );

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        return createSuccessResponse(user);
    } catch (error) {
        console.error('Fetch public user error:', error);
        return createErrorResponse('Failed to fetch public profile', 500);
    }
}
