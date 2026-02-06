import { connectDB } from '@/lib/mongodb';
import { Resource } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const resource = await Resource.findById(id);

    if (!resource) {
      return createErrorResponse('Resource not found', 404);
    }

    return createSuccessResponse(resource);
  } catch (error) {
    console.error('Fetch resource error:', error);
    return createErrorResponse('Failed to fetch resource', 500);
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

    const resource = await Resource.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!resource) {
      return createErrorResponse('Resource not found', 404);
    }

    return createSuccessResponse(resource);
  } catch (error) {
    console.error('Update resource error:', error);
    return createErrorResponse('Failed to update resource', 500);
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
    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      return createErrorResponse('Resource not found', 404);
    }

    return createSuccessResponse({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    return createErrorResponse('Failed to delete resource', 500);
  }
}
