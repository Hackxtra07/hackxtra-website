import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AdminLog } from '@/lib/models';
import { authenticateRequest, createErrorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        // Get query parameters for pagination and filtering
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const action = searchParams.get('action');
        const targetType = searchParams.get('targetType');

        const query: any = {};
        if (action) query.action = action;
        if (targetType) query.targetType = targetType;

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AdminLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AdminLog.countDocuments(query)
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('Fetch Logs Error:', error);
        return createErrorResponse(error.message || 'Failed to fetch logs', 500);
    }
}
