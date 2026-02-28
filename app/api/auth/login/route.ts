import { connectDB } from '@/lib/mongodb';
import { Admin, Session } from '@/lib/models';
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

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await Session.create({
      userId: admin._id,
      userModel: 'Admin',
      sessionId,
      expiresAt,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    });

    const token = signToken(admin.email, sessionId);

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
