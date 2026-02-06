import { connectDB } from '@/lib/mongodb';
import { News } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const url = new URL(request.url);
        const isAdminRequest = url.searchParams.get('admin') === 'true';

        // Check authentication if admin request
        let user: any = null;
        if (isAdminRequest) {
            user = await authenticateRequest(request);
            if (!user || user.role !== 'admin') {
                return createErrorResponse('Unauthorized', 401);
            }
        }

        const query = isAdminRequest ? {} : { isPublished: true };
        const sort = { publishedAt: -1, createdAt: -1 };

        const news = await News.find(query).sort(sort);

        return createSuccessResponse({ success: true, data: news });
    } catch (error) {
        console.error('Fetch news error:', error);
        return createErrorResponse('Failed to fetch news', 500);
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

        // Basic validation
        if (!body.title || !body.content || !body.author) {
            return createErrorResponse('Missing required fields', 400);
        }

        const newNews = await News.create(body);

        return createSuccessResponse({ success: true, data: newNews }, 201);
    } catch (error) {
        console.error('Create news error:', error);
        return createErrorResponse('Failed to create news', 500);
    }
}
