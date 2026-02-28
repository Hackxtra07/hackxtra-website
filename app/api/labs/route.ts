import { connectDB } from '@/lib/mongodb';
import { Lab } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'All Labs';
    const difficulty = searchParams.get('difficulty') || 'All Difficulties';

    const auth = await authenticateRequest(request);
    await connectDB();

    let query: any = {};
    const isPro = auth && (auth.role === 'admin' || auth.isPro);

    if (!isPro) {
      // If not logged in or not Pro, only show non-premium labs
      query.isPremium = { $ne: true };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category !== 'All Labs') {
      query.category = category;
    }

    if (difficulty !== 'All Difficulties') {
      query.difficulty = difficulty;
    }

    const skip = (page - 1) * limit;

    const [totalItems, labs] = await Promise.all([
      Lab.countDocuments(query),
      Lab.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title description difficulty category objectives tools timeToComplete url coverImage isPremium createdAt')
        .lean()
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return createSuccessResponse({
      labs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      }
    });
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
    console.log('[DEBUG] POST /api/labs body:', body);

    const lab = new Lab(body);
    await lab.save();

    return createSuccessResponse(lab, 201);
  } catch (error) {
    console.error('Create lab error:', error);
    return createErrorResponse('Failed to create lab', 500);
  }
}
