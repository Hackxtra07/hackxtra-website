import { connectDB } from '@/lib/mongodb';
import { Message, User, Admin } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

        // strategy: Fetch all Users. For each User, check if there are messages with this Admin (or any Admin?).
        // Better: Get all distinct 'sender' or 'recipient' from Messages where the other party is this Admin.
        // Actually, for a dashboard, we usually want to see ALL users to initiate chat potentialy, 
        // OR just users who have messaged.
        // "make a chats for the users with the admin"
        // Let's return a list of users, with metadata about the last message.

        // 1. Get all Users
        const users = await User.find({}).select('username email avatarColor');

        // 2. For each user, find the last message exchanged with ANY admin (or specifically the current logged in admin? "The Admin" usually implies a system-wide support view).
        // Let's scope it to "System" for now, so any Admin can see chats.

        const conversations = await Promise.all(users.map(async (user) => {
            const lastMessage = await Message.findOne({
                $or: [
                    { sender: user._id, senderModel: 'User' },
                    { recipient: user._id, recipientModel: 'User' }
                ]
            }).sort({ createdAt: -1 });

            // Count unread messages from this user
            const unreadCount = await Message.countDocuments({
                sender: user._id,
                senderModel: 'User',
                recipientModel: 'Admin', // Assuming sent to Admin
                isRead: false
            });

            return {
                user,
                lastMessage,
                unreadCount
            };
        }));

        // Sort by last message date desc
        conversations.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return dateB - dateA; // Newest first
        });

        return createSuccessResponse(conversations);

    } catch (error) {
        console.error('Fetch conversations error:', error);
        return createErrorResponse('Failed to fetch conversations', 500);
    }
}
