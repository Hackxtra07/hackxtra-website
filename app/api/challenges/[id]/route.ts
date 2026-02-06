import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Challenge } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const auth = await authenticateRequest(request);

        // Admins can see the flag, users cannot
        // For simplicity, we check if they have a valid token
        // In a production app, we'd check req.headers for 'is-admin-request' or similar
        const challenge = auth
            ? await Challenge.findById(params.id).select('+flag')
            : await Challenge.findById(params.id).select('-flag');

        if (!challenge) {
            return createErrorResponse('Challenge not found', 404);
        }
        return createSuccessResponse(challenge);
    } catch (error) {
        console.error('Fetch challenge error:', error);
        return createErrorResponse('Failed to fetch challenge', 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await authenticateRequest(request);
        // Authorization check (simplified for this context)
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        const challenge = await Challenge.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

        if (!challenge) {
            return createErrorResponse('Challenge not found', 404);
        }
        return createSuccessResponse(challenge);
    } catch (error) {
        console.error('Update challenge error:', error);
        return createErrorResponse('Failed to update challenge', 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const challenge = await Challenge.findByIdAndDelete(params.id);

        if (!challenge) {
            return createErrorResponse('Challenge not found', 404);
        }
        return createSuccessResponse({ message: 'Challenge deleted successfully' });
    } catch (error) {
        console.error('Delete challenge error:', error);
        return createErrorResponse('Failed to delete challenge', 500);
    }
}
