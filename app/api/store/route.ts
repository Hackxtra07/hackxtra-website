import { connectDB } from '@/lib/mongodb';
import { StoreItem, User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse, getAuthenticatedUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check if user is admin to see all items, otherwise only active
        const user = await authenticateRequest(request); // Optional auth for viewing

        let filter = { isActive: true };
        if (user && user.role === 'admin') {
            filter = {}; // Admin sees all
        }

        const items = await StoreItem.find(filter).sort({ createdAt: -1 });

        // Hide 'value' field for non-admins if not purchased (but for listing we might just hide it always)
        // Actually, for the store listing, we definitely should NOT return the 'value' (code/link)
        // The 'value' should only be revealed after purchase.

        const sanitizedItems = items.map(item => {
            if (user && user.role === 'admin') return item;

            const { value, ...rest } = item.toObject();
            return rest;
        });

        return createSuccessResponse(sanitizedItems);
    } catch (error) {
        console.error('Fetch store items error:', error);
        return createErrorResponse('Failed to fetch store items', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        const newItem = new StoreItem(body);
        await newItem.save();

        return createSuccessResponse(newItem, 201);
    } catch (error) {
        console.error('Create store item error:', error);
        return createErrorResponse('Failed to create store item', 500);
    }
}
