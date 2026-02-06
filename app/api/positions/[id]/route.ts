import { connectDB } from '@/lib/mongodb';
import { Position } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        const position = await Position.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        if (!position) {
            return createErrorResponse('Position not found', 404);
        }

        return createSuccessResponse(position);
    } catch (error) {
        console.error('Update position error:', error);
        return createErrorResponse('Failed to update position', 500);
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
        const position = await Position.findByIdAndDelete(id);

        if (!position) {
            return createErrorResponse('Position not found', 404);
        }

        return createSuccessResponse({ message: 'Position deleted successfully' });
    } catch (error) {
        console.error('Delete position error:', error);
        return createErrorResponse('Failed to delete position', 500);
    }
}
