import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models';
import { signToken, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return createErrorResponse('Invalid credentials', 401);
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return createErrorResponse('Invalid credentials', 401);
    }

    const token = signToken(admin.email);

    return createSuccessResponse(
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      },
      200
    );
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
