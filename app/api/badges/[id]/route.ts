import { connectDB } from '@/lib/mongodb';
import { Badge } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        // Check if updating to a name that already exists
        if (body.name) {
            const existing = await Badge.findOne({ name: body.name, _id: { $ne: params.id } });
            if (existing) {
                return createErrorResponse('Badge with this name already exists', 400);
            }
        }

        const badge = await Badge.findByIdAndUpdate(params.id, body, { new: true });
        if (!badge) {
            return createErrorResponse('Badge not found', 404);
        }

        return createSuccessResponse(badge);
    } catch (error) {
        console.error('Update badge error:', error);
        return createErrorResponse('Failed to update badge', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        const badge = await Badge.findByIdAndDelete(params.id);
        if (!badge) {
            return createErrorResponse('Badge not found', 404);
        }

        return createSuccessResponse({ message: 'Badge deleted successfully' });
    } catch (error) {
        console.error('Delete badge error:', error);
        return createErrorResponse('Failed to delete badge', 500);
    }
}
