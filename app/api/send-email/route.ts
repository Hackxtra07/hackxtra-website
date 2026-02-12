import { connectDB } from '@/lib/mongodb';
import { Settings } from '@/lib/models';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import dotenv from 'dotenv';

// Force load .env.local because of mystery placeholders
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json().catch(() => ({}));
        console.log('--- Email Request Received ---');
        console.log('Body:', JSON.stringify(body, null, 2));

        const { type, data } = body;
        if (!type || !data) {
            console.error('Invalid request: missing type or data');
            return createErrorResponse('Invalid request: missing type or data', 400);
        }

        // Fetch destination email from settings
        const settings = await Settings.findOne();
        let destinationEmail = settings?.contactEmail;

        // If no settings or placeholder, use env vars
        if (!destinationEmail || destinationEmail === 'admin@example.com') {
            destinationEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_CONTACT_EMAIL || 'hackxtras.official@gmail.com';
        }

        // Check for SMTP config
        let smtpConfig: any = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        // Gmail specific optimized config
        if (smtpConfig.host?.includes('gmail.com') || smtpConfig.auth.user?.includes('gmail.com')) {
            smtpConfig = {
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                }
            };
        }

        console.log('--- Email Sending Debug ---');
        console.log('Type:', type);
        console.log('Destination:', destinationEmail);
        console.log('SMTP Host:', smtpConfig.host);
        console.log('SMTP Port:', smtpConfig.port);
        console.log('SMTP Secure:', smtpConfig.secure);
        console.log('SMTP User:', smtpConfig.auth.user);
        const pass = smtpConfig.auth.pass || '';
        console.log('SMTP Pass Length:', pass.length);
        if (pass.length > 2) {
            console.log('SMTP Pass Hint:', `${pass[0]}...${pass[pass.length - 1]}`);
        }

        if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
            console.warn('SMTP credentials not fully configured.');
            return createSuccessResponse({ message: 'Email queued (Simulated: SMTP not configured)' });
        }

        const transporter = nodemailer.createTransport(smtpConfig);

        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error('SMTP Verification Failed:', verifyError);
            // Don't fail here, just log it. Some SMTPs fail verify() but still work.
        }

        let subject = 'New Message from HackXtras';
        let htmlContent = '';

        switch (type) {
            case 'contact':
                subject = `New Contact: ${data.subject || 'Inquiry'}`;
                htmlContent = `
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Subject:</strong> ${data.subject}</p>
                    <p><strong>Message:</strong></p>
                    <pre style="font-family: sans-serif; background: #f4f4f4; padding: 10px; border-radius: 5px;">${data.message}</pre>
                `;
                break;
            case 'application':
                subject = `New Job Application: ${data.position}`;
                htmlContent = `
                    <h2>New Job Application</h2>
                    <p><strong>Position:</strong> ${data.position}</p>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Resume/Portfolio:</strong> <a href="${data.resumeLink}">${data.resumeLink}</a></p>
                    <p><strong>Cover Letter:</strong></p>
                    <pre style="font-family: sans-serif; background: #f4f4f4; padding: 10px; border-radius: 5px;">${data.coverLetter}</pre>
                `;
                break;
            case 'suggestion':
                subject = `New Suggestion`;
                htmlContent = `
                    <h2>New Suggestion Received</h2>
                    <p><strong>From:</strong> ${data.email || 'Anonymous'}</p>
                    <p><strong>Suggestion:</strong></p>
                    <pre style="font-family: sans-serif; background: #f4f4f4; padding: 10px; border-radius: 5px;">${data.suggestion}</pre>
                `;
                break;
            case 'newsletter':
                subject = `New Newsletter Subscription`;
                htmlContent = `
                    <h2>New Newsletter Subscription</h2>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p>This user wants to stay updated with HackXtras news and tutorials.</p>
                `;
                break;
            default:
                htmlContent = `<p>Unknown message type</p><pre>${JSON.stringify(data)}</pre>`;
        }

        await transporter.sendMail({
            from: `"HackXtras Bot" <${process.env.SMTP_USER}>`,
            to: destinationEmail,
            cc: process.env.SMTP_USER, // CC the sender for verification
            replyTo: data.email, // Allow replying directly to the user
            subject,
            html: htmlContent,
        });

        return createSuccessResponse({ message: 'Email sent successfully' });

    } catch (error: any) {
        console.error('CRITICAL: Send email error:', error);
        return createErrorResponse(`Failed to send email: ${error.message || 'Unknown error'}`, 500);
    }
}
