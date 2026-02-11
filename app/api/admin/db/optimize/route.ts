import { NextRequest } from 'next/server';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { optimizeDatabase } from '@/lib/db-optimize';

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate Request
        const auth = await authenticateRequest(request);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized. Admin access required.', 401);
        }

        // 2. Perform Optimization
        const results = await optimizeDatabase();

        // 3. Summarize results
        const summary = results.reduce((acc, curr) => {
            acc.totalBefore += curr.before.storageSize;
            acc.totalAfter += curr.after.storageSize;
            acc.reclaimed += (curr.before.storageSize - curr.after.storageSize);
            return acc;
        }, { totalBefore: 0, totalAfter: 0, reclaimed: 0 });

        return createSuccessResponse({
            success: true,
            message: 'Database optimization completed successfully.',
            summary: {
                totalBeforeMB: (summary.totalBefore / 1024 / 1024).toFixed(2),
                totalAfterMB: (summary.totalAfter / 1024 / 1024).toFixed(2),
                reclaimedMB: (summary.reclaimed / 1024 / 1024).toFixed(2)
            },
            details: results
        });
    } catch (error) {
        console.error('Database optimization API error:', error);
        return createErrorResponse('Failed to optimize database', 500);
    }
}
