import { connectDB } from '@/lib/mongodb';
import { Lab } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { recordAdminAction } from '@/lib/admin-logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const lab = await Lab.findById(id);

    if (!lab) {
      return createErrorResponse('Lab not found', 404);
    }

    return createSuccessResponse(lab);
  } catch (error) {
    console.error('Fetch lab error:', error);
    return createErrorResponse('Failed to fetch lab', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const body = await request.json();
    console.log('[DEBUG] PUT /api/labs/[id] body:', body);

    const lab = await Lab.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!lab) {
      return createErrorResponse('Lab not found', 404);
    }

    // Record admin action
    await recordAdminAction(
      request,
      auth,
      'UPDATE',
      'Lab',
      id,
      { title: lab.title }
    );

    return createSuccessResponse(lab);
  } catch (error) {
    console.error('Update lab error:', error);
    return createErrorResponse('Failed to update lab', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const lab = await Lab.findByIdAndDelete(id);

    if (!lab) {
      return createErrorResponse('Lab not found', 404);
    }

    // Record admin action
    await recordAdminAction(
      request,
      auth,
      'DELETE',
      'Lab',
      id,
      { title: lab.title }
    );

    return createSuccessResponse({ message: 'Lab deleted successfully' });
  } catch (error) {
    console.error('Delete lab error:', error);
    return createErrorResponse('Failed to delete lab', 500);
  }
}
