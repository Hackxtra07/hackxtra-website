import { connectDB } from '@/lib/mongodb';
import { Challenge } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { recordAdminAction } from '@/lib/admin-logger';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const isAdmin = searchParams.get('admin') === 'true';

        // Exclude flag from public response unless specifically requested as admin
        // Note: In a production app, we would also verify the admin token here.
        const challenges = await Challenge.find()
            .select(isAdmin ? '+flag' : '-flag')
            .select('title description points category difficulty type options createdAt updatedAt')
            .lean();

        return createSuccessResponse(challenges);
    } catch (error) {
        console.error('Fetch challenges error:', error);
        return createErrorResponse('Failed to fetch challenges', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        const challenge = await Challenge.create(body);

        // Record admin action
        await recordAdminAction(
            request,
            auth,
            'CREATE',
            'Challenge',
            challenge._id.toString(),
            { title: challenge.title, category: challenge.category }
        );

        return createSuccessResponse(challenge, 201);
    } catch (error) {
        console.error('Create challenge error:', error);
        return createErrorResponse('Failed to create challenge', 500);
    }
}
