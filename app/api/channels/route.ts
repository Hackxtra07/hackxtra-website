import { connectDB } from '@/lib/mongodb';
import { Channel } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const channels = await Channel.find().sort({ createdAt: -1 });
    return createSuccessResponse(channels);
  } catch (error) {
    console.error('Fetch channels error:', error);
    return createErrorResponse('Failed to fetch channels', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const body = await request.json();

    const channel = new Channel(body);
    await channel.save();

    return createSuccessResponse(channel, 201);
  } catch (error) {
    console.error('Create channel error:', error);
    return createErrorResponse('Failed to create channel', 500);
  }
}
