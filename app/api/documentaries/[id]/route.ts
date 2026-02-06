import { connectDB } from '@/lib/mongodb';
import { Documentary } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const documentary = await Documentary.findById(id);

    if (!documentary) {
      return createErrorResponse('Documentary not found', 404);
    }

    return createSuccessResponse(documentary);
  } catch (error) {
    console.error('Fetch documentary error:', error);
    return createErrorResponse('Failed to fetch documentary', 500);
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

    const documentary = await Documentary.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!documentary) {
      return createErrorResponse('Documentary not found', 404);
    }

    return createSuccessResponse(documentary);
  } catch (error) {
    console.error('Update documentary error:', error);
    return createErrorResponse('Failed to update documentary', 500);
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
    const documentary = await Documentary.findByIdAndDelete(id);

    if (!documentary) {
      return createErrorResponse('Documentary not found', 404);
    }

    return createSuccessResponse({ message: 'Documentary deleted successfully' });
  } catch (error) {
    console.error('Delete documentary error:', error);
    return createErrorResponse('Failed to delete documentary', 500);
  }
}
