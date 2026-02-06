import { connectDB } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const member = await TeamMember.findById(id);

    if (!member) {
      return createErrorResponse('Team member not found', 404);
    }

    return createSuccessResponse(member);
  } catch (error) {
    console.error('Fetch team member error:', error);
    return createErrorResponse('Failed to fetch team member', 500);
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

    const member = await TeamMember.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return createErrorResponse('Team member not found', 404);
    }

    return createSuccessResponse(member);
  } catch (error) {
    console.error('Update team member error:', error);
    return createErrorResponse('Failed to update team member', 500);
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
    const member = await TeamMember.findByIdAndDelete(id);

    if (!member) {
      return createErrorResponse('Team member not found', 404);
    }

    return createSuccessResponse({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    return createErrorResponse('Failed to delete team member', 500);
  }
}
