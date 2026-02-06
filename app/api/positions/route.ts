import { connectDB } from '@/lib/mongodb';
import { Position } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check for admin auth to see all, otherwise only see open? 
        // For simplicity, public sees all for now, or filter by isOpen=true?
        // Let's filter by isOpen=true for public, but maybe admin wants to see all.
        // We can pass a query param ?all=true if admin.

        // For now, let's just return all and let frontend filter, or default to all.
        // Actually best practice: public only sees open.
        // But for admin panel CRUD we need to see all.

        const url = new URL(request.url);
        const isAdminView = url.searchParams.get('admin') === 'true';

        let filter = {};
        if (!isAdminView) {
            filter = { isOpen: true };
        }

        const positions = await Position.find(filter).sort({ createdAt: -1 });
        return createSuccessResponse(positions);
    } catch (error) {
        console.error('Fetch positions error:', error);
        return createErrorResponse('Failed to fetch positions', 500);
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

        const position = await Position.create(body);
        return createSuccessResponse(position, 201);
    } catch (error) {
        console.error('Create position error:', error);
        return createErrorResponse('Failed to create position', 500);
    }
}
