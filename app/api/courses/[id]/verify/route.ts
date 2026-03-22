import { connectDB } from '@/lib/mongodb';
import { Course, User } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    const auth = await authenticateRequest(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const { moduleIndex, answer } = await request.json();

    if (moduleIndex === undefined || !answer) {
      return createErrorResponse('Module index and answer are required', 400);
    }

    // Find course and include module answers (hidden by default)
    // Note: We need to find the specific module answer. 
    // Mongoose doesn't easily select subdocuments with hidden fields unless we select the whole array.
    const course = await Course.findById(courseId).select('+modules.quiz.answer');

    if (!course) {
      return createErrorResponse('Course not found', 404);
    }

    if (!course.modules || !course.modules[moduleIndex]) {
      return createErrorResponse('Module not found', 404);
    }

    const module = course.modules[moduleIndex];
    if (!module.quiz || !module.quiz.answer) {
      // If no quiz, maybe it just marks as completed? 
      // But user said "how we would know they completed truly", so we require quiz for verification.
      return createErrorResponse('This module does not have a verification quiz', 400);
    }

    if (module.quiz.answer.trim().toLowerCase() !== answer.trim().toLowerCase()) {
      return createErrorResponse('Incorrect answer', 400);
    }

    // Success! Update progress
    const user = await User.findById(auth._id);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Update specific course progress
    let progress = user.courseProgress.find(p => p.courseId.toString() === courseId);
    
    if (!progress) {
      progress = { courseId: courseId as any, completedModules: [] };
      user.courseProgress.push(progress);
    }

    if (!progress.completedModules.includes(moduleIndex)) {
      progress.completedModules.push(moduleIndex);
      
      // Award some points for module completion
      user.points += 5;
    }

    // Check if course is fully completed
    const totalModules = course.modules.length;
    if (progress.completedModules.length === totalModules) {
      if (!user.completedCourses.includes(courseId)) {
        user.completedCourses.push(courseId as any);
        user.points += 50; // Bonus for full course completion
      }
    }

    await user.save();

    return createSuccessResponse({
      message: 'Module verified successfully!',
      progress: progress.completedModules,
      isCourseCompleted: user.completedCourses.includes(courseId as any)
    });
  } catch (error) {
    console.error('Course verification error:', error);
    return createErrorResponse('Failed to verify module', 500);
  }
}
