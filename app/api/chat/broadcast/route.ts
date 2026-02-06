import { connectDB } from '@/lib/mongodb';
import { Message, User, Admin } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        // Ensure requester is an Admin
        const admin = await Admin.findOne({ email: auth.email });
        if (!admin) {
            return createErrorResponse('Forbidden: Admin access required', 403);
        }

        const { subject, message, sendEmailAlso } = await request.json(); // sendEmailAlso could be a future enhancement

        if (!message) {
            return createErrorResponse('Message content is required', 400);
        }

        // Get all users
        const users = await User.find({});

        // Create a message for each user
        // Note: For massive scale, this should be a background job. For now, Promise.all is okay for small-medium scale.
        const messages = users.map(user => ({
            sender: admin._id,
            senderModel: 'Admin',
            recipient: user._id,
            recipientModel: 'User',
            content: `[BROADCAST] ${subject ? subject + ': ' : ''}${message}`,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        if (messages.length > 0) {
            await Message.insertMany(messages);
        }

        return createSuccessResponse({ count: messages.length, message: 'Broadcast sent successfully' });

    } catch (error) {
        console.error('Broadcast error:', error);
        return createErrorResponse('Failed to broadcast message', 500);
    }
}
