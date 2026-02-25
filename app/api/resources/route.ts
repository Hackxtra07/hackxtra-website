import { connectDB } from '@/lib/mongodb';
import { Resource } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    await connectDB();

    let query = {};
    const isPro = auth && (auth.role === 'admin' || auth.isPro);

    if (!isPro) {
      // If not logged in or not Pro, only show non-premium resources
      query = { isPremium: { $ne: true } };
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    return createSuccessResponse(resources);
  } catch (error) {
    console.error('Fetch resources error:', error);
    return createErrorResponse('Failed to fetch resources', 500);
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
    console.log('[DEBUG] POST /api/resources body:', body);

    const resource = new Resource(body);
    await resource.save();

    return createSuccessResponse(resource, 201);
  } catch (error) {
    console.error('Create resource error:', error);
    return createErrorResponse('Failed to create resource', 500);
  }
}
