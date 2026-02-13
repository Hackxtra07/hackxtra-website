import { connectDB } from '@/lib/mongodb';
import { Course } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const course = await Course.findById(id);

    if (!course) {
      return createErrorResponse('Course not found', 404);
    }

    return createSuccessResponse(course);
  } catch (error) {
    console.error('Fetch course error:', error);
    return createErrorResponse('Failed to fetch course', 500);
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
    console.log('[DEBUG] PUT /api/courses/[id] body:', body);

    const course = await Course.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return createErrorResponse('Course not found', 404);
    }

    return createSuccessResponse(course);
  } catch (error) {
    console.error('Update course error:', error);
    return createErrorResponse('Failed to update course', 500);
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
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return createErrorResponse('Course not found', 404);
    }

    return createSuccessResponse({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return createErrorResponse('Failed to delete course', 500);
  }
}
