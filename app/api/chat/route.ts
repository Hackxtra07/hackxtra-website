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

        // Determine who is requesting
        let userId = '';
        let userModel = '';

        // Check if user or admin
        const user = await User.findOne({ email: auth.email });
        const admin = await Admin.findOne({ email: auth.email });

        if (user) {
            userId = user._id;
            userModel = 'User';
        } else if (admin) {
            userId = admin._id;
            userModel = 'Admin';
        } else {
            return createErrorResponse('User not found', 404);
        }

        const url = new URL(request.url);
        const partnerId = url.searchParams.get('partnerId');

        let query: any = {
            $or: [
                { sender: userId, senderModel: userModel },
                { recipient: userId, recipientModel: userModel }
            ]
        };

        // If a specific conversation is requested (e.g. Admin chatting with specific User)
        if (partnerId) {
            query = {
                $or: [
                    { sender: userId, senderModel: userModel, recipient: partnerId },
                    { recipient: userId, recipientModel: userModel, sender: partnerId }
                ]
            };
        }

        // Auto-delete logic: Remove messages that are isRead: true AND isSaved: false involving this user/admin
        // Note: In a real production app, this might be a cron job or "soft delete". 
        // For this specific request "disappears until and unless it is saved", we delete on fetch if read.
        // Wait, if we delete them NOW, how does the user see them if they are already read? 
        // Logic: "disappears after seeing". 
        // So, we fetch messages. If they are read, we delete them AFTER returning them? 
        // Or we assume "Seen" means fetched once? 
        // Standard ephemeral: Delete after N seconds or next session.
        // Let's implement: Delete any message that WAS read in a PREVIOUS session.
        // Or: Delete immediately after reading?
        // Implementation:
        // 1. Fetch current messages.
        // 2. Identify messages that ARE ALREADY `isRead: true` AND `isSaved: false`.
        // 3. Delete those messages from DB.
        // 4. Return the remaining messages (which are either unread OR saved).
        // 5. Mark the fetched unread messages as `isRead: true` (so they disappear next time).

        // Step 1: Delete old read/unsaved messages
        await Message.deleteMany({
            isRead: true,
            isSaved: false,
            $or: [
                { sender: userId, senderModel: userModel },
                { recipient: userId, recipientModel: userModel }
            ]
        });

        // Step 2: Fetch remaining messages
        const messages = await Message.find(query).sort({ createdAt: 1 });

        // Step 3: Mark unread as read (as async side effect so user sees them this time)
        const unreadIds = messages
            .filter((m: any) => !m.isRead && (m.recipient.toString() === userId.toString()))
            .map((m: any) => m._id);

        if (unreadIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadIds } },
                { $set: { isRead: true } }
            );
        }

        return createSuccessResponse(messages);

    } catch (error) {
        console.error('Fetch messages error:', error);
        return createErrorResponse('Failed to fetch messages', 500);
    }
}

export async function POST(request: NextRequest) {
    console.log("POST /api/chat");
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();

        const body = await request.json();
        const content = body.content;
        let recipientId = body.recipientId;

        if (!content) {
            return createErrorResponse('Missing content', 400);
        }

        // Determine sender
        let senderId = '';
        let senderModel = '';
        let recipientModel = '';

        const user = await User.findOne({ email: auth.email });
        const admin = await Admin.findOne({ email: auth.email });

        if (user) {
            senderId = user._id;
            senderModel = 'User';

            // If recipientId is provided, verify it.
            // If NOT provided, find a default Admin.
            if (recipientId) {
                const recipientAdmin = await Admin.findById(recipientId);
                if (recipientAdmin) {
                    recipientModel = 'Admin';
                } else {
                    return createErrorResponse('Recipient admin not found', 404);
                }
            } else {
                // Find any admin to send to
                const defaultAdmin = await Admin.findOne();
                if (defaultAdmin) {
                    recipientId = defaultAdmin._id;
                    recipientModel = 'Admin';
                } else {
                    return createErrorResponse('No support agents available', 503);
                }
            }

        } else if (admin) {
            senderId = admin._id;
            senderModel = 'Admin';

            if (!recipientId) return createErrorResponse('Recipient User ID required for Admin', 400);

            const recipientUser = await User.findById(recipientId);
            if (recipientUser) {
                recipientModel = 'User';
            } else {
                return createErrorResponse('Recipient not found', 404);
            }
        } else {
            return createErrorResponse('Sender not found', 404);
        }

        const message = await Message.create({
            sender: senderId,
            senderModel,
            recipient: recipientId,
            recipientModel,
            content,
            isRead: false,
            isSaved: false
        });

        return createSuccessResponse(message, 201);

    } catch (error) {
        console.error('Send message error:', error);
        return createErrorResponse('Failed to send message', 500);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const { messageId, isSaved } = await request.json();

        if (!messageId || typeof isSaved !== 'boolean') {
            return createErrorResponse('Invalid parameters', 400);
        }

        // Verify ownership (sender or recipient)
        // Ideally checking user ID, but for simplicity assuming only relevant messages returned or updated.
        // Better: ensure the toggling user is part of the message.

        let userId = '';
        const user = await User.findOne({ email: auth.email });
        const admin = await Admin.findOne({ email: auth.email });
        if (user) userId = user._id.toString();
        else if (admin) userId = admin._id.toString();
        else return createErrorResponse('User not found', 404);

        const message = await Message.findOne({
            _id: messageId,
            $or: [
                { sender: userId },
                { recipient: userId }
            ]
        });

        if (!message) {
            return createErrorResponse('Message not found or unauthorized', 404);
        }

        message.isSaved = isSaved;
        await message.save();

        return createSuccessResponse(message);
    } catch (error) {
        console.error('Update message error:', error);
        return createErrorResponse('Failed to update message', 500);
    }
}
