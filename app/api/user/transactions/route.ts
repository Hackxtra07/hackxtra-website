import { connectDB } from '@/lib/mongodb';
import { Transaction } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        // Fetch transactions for this user
        const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });

        return createSuccessResponse(transactions);
    } catch (error) {
        console.error('Fetch transactions error:', error);
        return createErrorResponse('Failed to fetch transactions', 500);
    }
}
