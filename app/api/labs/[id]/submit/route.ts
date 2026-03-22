import { connectDB } from '@/lib/mongodb';
import { Lab, User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const { flag } = await request.json();

    if (!flag) {
      return createErrorResponse('Flag is required', 400);
    }

    // Find lab and include the flag (which is hidden by default)
    const lab = await Lab.findById(id).select('+flag');

    if (!lab) {
      return createErrorResponse('Lab not found', 404);
    }

    if (!lab.flag) {
      return createErrorResponse('This lab does not require a flag or flag is not set by admin', 400);
    }

    // Check if user already solved it
    const user = await User.findById(auth._id);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    if (user.completedLabs && user.completedLabs.includes(id)) {
      return createErrorResponse('Lab already completed', 400);
    }

    // Compare flags (case insensitive usually, but let's stick to exact if preferred. Hacker labs often use exact or trimmed.)
    if (lab.flag.trim() !== flag.trim()) {
      return createErrorResponse('Incorrect flag', 400);
    }

    // Success! Update user
    const pointsAwarded = lab.difficulty === 'Easy' ? 10 : lab.difficulty === 'Medium' ? 25 : 50;
    
    await User.findByIdAndUpdate(auth._id, {
      $addToSet: { completedLabs: id },
      $inc: { points: pointsAwarded }
    });

    return createSuccessResponse({
      message: 'Lab completed successfully!',
      pointsAwarded
    });
  } catch (error) {
    console.error('Lab submission error:', error);
    return createErrorResponse('Failed to submit flag', 500);
  }
}
