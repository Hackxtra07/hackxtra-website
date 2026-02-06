import { connectDB } from '@/lib/mongodb';
import { Lab } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const labs = await Lab.find().sort({ createdAt: -1 });
    return createSuccessResponse(labs);
  } catch (error) {
    console.error('Fetch labs error:', error);
    return createErrorResponse('Failed to fetch labs', 500);
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

    const lab = new Lab(body);
    await lab.save();

    return createSuccessResponse(lab, 201);
  } catch (error) {
    console.error('Create lab error:', error);
    return createErrorResponse('Failed to create lab', 500);
  }
}
