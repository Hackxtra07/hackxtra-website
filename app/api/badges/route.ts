import { connectDB } from '@/lib/mongodb';
import { Badge } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { recordAdminAction } from '@/lib/admin-logger';

export async function GET() {
    try {
        await connectDB();
        const badges = await Badge.find().sort({ createdAt: -1 });
        return createSuccessResponse(badges);
    } catch (error) {
        console.error('Fetch badges error:', error);
        return createErrorResponse('Failed to fetch badges', 500);
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

        // Check for existing badge with same name
        const existing = await Badge.findOne({ name: body.name });
        if (existing) {
            return createErrorResponse('Badge with this name already exists', 400);
        }

        const badge = new Badge(body);
        await badge.save();

        // Record admin action
        await recordAdminAction(
            request,
            auth,
            'CREATE',
            'Badge',
            badge._id.toString(),
            { name: badge.name }
        );

        return createSuccessResponse(badge, 201);
    } catch (error) {
        console.error('Create badge error:', error);
        return createErrorResponse('Failed to create badge', 500);
    }
}
