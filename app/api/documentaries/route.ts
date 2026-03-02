import { connectDB } from '@/lib/mongodb';
import { Documentary } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { recordAdminAction } from '@/lib/admin-logger';

export async function GET() {
  try {
    await connectDB();
    const documentaries = await Documentary.find().sort({ createdAt: -1 });
    return createSuccessResponse(documentaries);
  } catch (error) {
    console.error('Fetch documentaries error:', error);
    return createErrorResponse('Failed to fetch documentaries', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const body = await request.json();

    const documentary = new Documentary(body);
    await documentary.save();

    // Record admin action
    await recordAdminAction(
      request,
      auth,
      'CREATE',
      'Documentary',
      documentary._id.toString(),
      { title: documentary.title }
    );

    return createSuccessResponse(documentary, 201);
  } catch (error) {
    console.error('Create documentary error:', error);
    return createErrorResponse('Failed to create documentary', 500);
  }
}
