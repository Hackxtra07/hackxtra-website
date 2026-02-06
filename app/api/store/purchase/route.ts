import { connectDB } from '@/lib/mongodb';
import { StoreItem, User, Transaction } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return createErrorResponse('Unauthorized', 401);
        }

        const { itemId } = await request.json();
        if (!itemId) {
            return createErrorResponse('Item ID is required', 400);
        }

        await connectDB();

        try {
            console.log('Starting purchase for user:', user._id);
            const item = await StoreItem.findById(itemId);
            if (!item) {
                console.error('Item not found:', itemId);
                throw new Error('Item not found');
            }

            if (!item.isActive) {
                console.error('Item not active:', item.title);
                throw new Error('Item is no longer available');
            }

            if (item.stock !== -1 && item.stock <= 0) {
                console.error('Item out of stock:', item.title);
                throw new Error('Out of stock');
            }

            const userRecord = await User.findById(user._id);
            if (!userRecord) {
                console.error('User record not found for ID:', user._id);
                throw new Error('User not found');
            }

            console.log('User Points:', userRecord.points, 'Item Cost:', item.cost);

            if (userRecord.points < item.cost) {
                console.error('Insufficient points. User:', userRecord.points, 'Cost:', item.cost);
                throw new Error('Insufficient points');
            }

            // Deduct points
            userRecord.points -= item.cost;
            await userRecord.save();

            // Decrement stock if not infinite
            if (item.stock !== -1) {
                item.stock -= 1;
                await item.save();
            }

            // Create transaction record
            const transaction = new Transaction({
                userId: user._id,
                itemId: item._id,
                itemTitle: item.title,
                itemType: item.type,
                cost: item.cost,
                value: item.value
            });
            await transaction.save();

            console.log('Purchase completed successfully');

            return createSuccessResponse({
                success: true,
                message: 'Purchase successful',
                item: {
                    title: item.title,
                    value: item.value, // Reveal the code/link
                    type: item.type
                },
                newBalance: userRecord.points
            });

        } catch (error: any) {
            console.error('Purchase failed:', error.message);
            return createErrorResponse(error.message || 'Purchase failed', 400);
        }

    } catch (error) {
        console.error('Purchase error:', error);
        return createErrorResponse('Internal server error', 500);
    }
}
