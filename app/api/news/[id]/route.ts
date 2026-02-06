import { connectDB } from '@/lib/mongodb';
import { News } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const newsItem = await News.findById(id);

        if (!newsItem) {
            return createErrorResponse('News item not found', 404);
        }

        // We might want to restrict unpublished news, but for now, 
        // IF it's unpublished and the user is NOT admin, we should maybe hide it?
        // Let's keep it simple: if it's dynamic route, we just return it. 
        // The frontend list view handles the filtering.
        // Or strictly:
        // if (!newsItem.isPublished) {
        //    const user = await authenticateRequest(request);
        //    if (!user || user.role !== 'admin') { return createErrorResponse('Not found', 404); }
        // }

        return createSuccessResponse(newsItem);
    } catch (error) {
        console.error('Fetch news item error:', error);
        return createErrorResponse('Failed to fetch news item', 500);
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

        const updatedNews = await News.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedNews) {
            return createErrorResponse('News item not found', 404);
        }

        return createSuccessResponse({ success: true, data: updatedNews });
    } catch (error) {
        console.error('Update news error:', error);
        return createErrorResponse('Failed to update news', 500);
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
        const deletedNews = await News.findByIdAndDelete(id);

        if (!deletedNews) {
            return createErrorResponse('News item not found', 404);
        }

        return createSuccessResponse({ success: true, message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Delete news error:', error);
        return createErrorResponse('Failed to delete news', 500);
    }
}
