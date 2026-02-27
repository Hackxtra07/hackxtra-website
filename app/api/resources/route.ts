import { connectDB } from '@/lib/mongodb';
import { Resource } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';

    const auth = await authenticateRequest(request);
    await connectDB();

    let query: any = {};
    const isPro = auth && (auth.role === 'admin' || auth.isPro);

    if (!isPro) {
      // If not logged in or not Pro, only show non-premium resources
      query.isPremium = { $ne: true };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const totalItems = await Resource.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return createSuccessResponse({
      resources,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      }
    });
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
