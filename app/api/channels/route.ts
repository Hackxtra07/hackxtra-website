import { connectDB } from '@/lib/mongodb';
import { Channel, Course, Documentary } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const [channels, followerData, courseCount, docCount] = await Promise.all([
      Channel.find().sort({ createdAt: -1 }),
      Channel.aggregate([{ $group: { _id: null, total: { $sum: "$followers" } } }]),
      Course.countDocuments(),
      Documentary.countDocuments()
    ]);

    const totalFollowers = followerData[0]?.total || 0;
    const totalVideos = courseCount + docCount;

    const stats = [
      { label: "Total Followers", value: `${(totalFollowers / 1000).toFixed(1)}K+` },
      { label: "Video Tutorials", value: `${totalVideos}+` },
      { label: "Engagement Monthly", value: "1.2M+" }, // Proxy or hardcoded
      { label: "Content Updates", value: "Daily" },
    ];

    return createSuccessResponse({ data: channels, stats });
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
