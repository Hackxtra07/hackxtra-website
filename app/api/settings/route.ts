import { connectDB } from '@/lib/mongodb';
import { Settings } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        // Singleton pattern: get the first document or create default
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ contactEmail: 'admin@example.com' });
        }
        return createSuccessResponse(settings);
    } catch (error) {
        console.error('Fetch settings error:', error);
        return createErrorResponse('Failed to fetch settings', 500);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        // Update the singleton settings document
        // We use findOneAndUpdate with upsert to ensure only one exists or is updated
        const settings = await Settings.findOneAndUpdate({}, body, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        });

        return createSuccessResponse(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        return createErrorResponse('Failed to update settings', 500);
    }
}
