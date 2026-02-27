import { connectDB } from '@/lib/mongodb';
import { Course } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || 'All Courses';

    const auth = await authenticateRequest(request);
    await connectDB();

    let query: any = {};
    const isPro = auth && (auth.role === 'admin' || auth.isPro);

    if (!isPro) {
      // If not logged in or not Pro, only show non-premium courses
      query.isPremium = { $ne: true };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (level !== 'All Courses') {
      query.level = level;
    }

    const totalItems = await Course.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return createSuccessResponse({
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      }
    });
  } catch (error) {
    console.error('Fetch courses error:', error);
    return createErrorResponse('Failed to fetch courses', 500);
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
    console.log('[DEBUG] POST /api/courses body:', body);

    const course = new Course(body);
    await course.save();

    return createSuccessResponse(course, 201);
  } catch (error) {
    console.error('Create course error:', error);
    return createErrorResponse('Failed to create course', 500);
  }
}
