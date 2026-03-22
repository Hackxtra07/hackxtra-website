import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/lib/models';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * GET /api/users/[id]/certificates
 * Returns a list of certificates issued to a specific user.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        
        const certificates = await Certificate.find({ userId: id }).sort({ issuedAt: -1 });

        return createSuccessResponse(certificates);
    } catch (error) {
        console.error('Fetch user certificates error:', error);
        return createErrorResponse('Failed to fetch certificates', 500);
    }
}
