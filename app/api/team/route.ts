import { connectDB } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const members = await TeamMember.find().sort({ createdAt: -1 });
    return createSuccessResponse(members);
  } catch (error) {
    console.error('Fetch team members error:', error);
    return createErrorResponse('Failed to fetch team members', 500);
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

    const member = new TeamMember(body);
    await member.save();

    return createSuccessResponse(member, 201);
  } catch (error) {
    console.error('Create team member error:', error);
    return createErrorResponse('Failed to create team member', 500);
  }
}
