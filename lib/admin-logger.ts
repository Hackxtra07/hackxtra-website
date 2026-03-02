import { NextRequest } from 'next/server';
import { AdminLog } from './models';
import { connectDB } from './mongodb';

/**
 * Record an administrative action in the Audit Logs
 */
export async function recordAdminAction(
    request: NextRequest,
    admin: { _id: any; name: string; email: string },
    action: string,
    targetType: string,
    targetId?: string,
    details?: any
) {
    try {
        await connectDB();

        const ipAddress = request.headers.get('x-forwarded-for') || (request as any).ip || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const logEntry = new AdminLog({
            adminId: admin._id,
            adminName: admin.name || admin.email,
            action,
            targetType,
            targetId,
            details: typeof details === 'object' ? JSON.stringify(details) : details,
            ipAddress,
            userAgent,
        });

        await logEntry.save();
        console.log(`[AdminLog] ${admin.email} performed ${action} on ${targetType}${targetId ? ` (${targetId})` : ''}`);
        return logEntry;
    } catch (error) {
        console.error('Failed to record admin action:', error);
        // We don't throw here to avoid failing the primary request due to logging failure
        return null;
    }
}
