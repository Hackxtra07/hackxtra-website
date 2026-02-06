import { connectDB } from '@/lib/mongodb';
import { StoreItem } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const item = await StoreItem.findById(id);

        if (!item) {
            return createErrorResponse('Item not found', 404);
        }

        // Auth check - if admin return everything, if user, cleanse it?
        // Actually, for editing, only admin should call this. 
        // For detailed view on store, maybe user calls it?
        // For now let's assume this is primarily for admin or detailed view that DOES NOT show the value unless purchased.
        // But since purchases are handled via separate logic that returns the value, let's keep this safe.

        const user = await authenticateRequest(request);
        const isAdmin = user && user.role === 'admin';

        if (isAdmin) {
            return createSuccessResponse(item);
        } else {
            // Sanitize for public
            const { value, ...rest } = item.toObject();
            return createSuccessResponse(rest);
        }

    } catch (error) {
        return createErrorResponse('Failed to fetch item', 500);
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const updatedItem = await StoreItem.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return createErrorResponse('Item not found', 404);
        }

        return createSuccessResponse(updatedItem);
    } catch (error) {
        console.error('Update item error:', error);
        return createErrorResponse('Failed to update item', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const { id } = await params;
        const deletedItem = await StoreItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return createErrorResponse('Item not found', 404);
        }

        return createSuccessResponse({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        return createErrorResponse('Failed to delete item', 500);
    }
}
