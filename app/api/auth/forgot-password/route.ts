import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getBaseUrl } from '@/lib/site-config';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email } = await request.json();

        if (!email) {
            return createErrorResponse('Email is required', 400);
        }

        const user = await User.findOne({ email });
        if (!user) {
            return createErrorResponse('No account found with this email address.', 404);
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        // SMTP Config (Reused from send-email/route.ts)
        let smtpConfig: any = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        };

        if (smtpConfig.host?.includes('gmail.com') || smtpConfig.auth.user?.includes('gmail.com')) {
            smtpConfig = {
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                }
            };
        }

        const transporter = nodemailer.createTransport(smtpConfig);
        const origin = getBaseUrl();

        // Use URL constructor for more robust URL generation
        const urlObj = new URL('/reset-password', origin);
        urlObj.searchParams.set('token', token);
        const resetUrl = urlObj.toString();

        const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2761c3;">Password Reset Request</h2>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the button below to complete the process within one hour of receiving it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2761c3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
        <p style="font-size: 12px; color: #777; word-break: break-all;">${resetUrl}</p>
      </div>
    `;

        await transporter.sendMail({
            from: `"HackXtras" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Request - HackXtras',
            html: htmlContent,
        });

        console.log(`[DEBUG] Password reset token for ${email}: ${token}`);

        return createSuccessResponse({ message: 'If an account exists with that email, a reset link has been sent.' });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return createErrorResponse('Failed to process forgot password request', 500);
    }
}
