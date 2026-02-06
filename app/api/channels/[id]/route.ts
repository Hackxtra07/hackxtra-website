import { connectDB } from '@/lib/mongodb';
import { Channel } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const channel = await Channel.findById(id);

    if (!channel) {
      return createErrorResponse('Channel not found', 404);
    }

    return createSuccessResponse(channel);
  } catch (error) {
    console.error('Fetch channel error:', error);
    return createErrorResponse('Failed to fetch channel', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const body = await request.json();

    const channel = await Channel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!channel) {
      return createErrorResponse('Channel not found', 404);
    }

    return createSuccessResponse(channel);
  } catch (error) {
    console.error('Update channel error:', error);
    return createErrorResponse('Failed to update channel', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const channel = await Channel.findByIdAndDelete(id);

    if (!channel) {
      return createErrorResponse('Channel not found', 404);
    }

    return createSuccessResponse({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    return createErrorResponse('Failed to delete channel', 500);
  }
}
