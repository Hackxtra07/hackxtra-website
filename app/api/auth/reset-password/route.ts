import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { token, password } = await request.json();

        if (!token || !password) {
            return createErrorResponse('Token and new password are required', 400);
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return createErrorResponse('Password reset token is invalid or has expired', 400);
        }

        // Set the new password
        // The pre-save hook in the User model will hash this password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return createSuccessResponse({ message: 'Password has been successfully updated.' });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return createErrorResponse('Failed to reset password', 500);
    }
}
