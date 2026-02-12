import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function testEmail() {
    const smtpConfig = {
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

    console.log('Testing SMTP configuration:', JSON.stringify({
        ...smtpConfig,
        auth: { ...smtpConfig.auth, pass: '****' }
    }, null, 2));

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"HackXtras Test" <${process.env.SMTP_USER}>`,
            to: process.env.DEFAULT_CONTACT_EMAIL || 'hackxtras.official@gmail.com',
            subject: 'SMTP Test Email',
            text: 'This is a test email to verify SMTP configuration.',
            html: '<b>This is a test email to verify SMTP configuration.</b>',
        });

        console.log('Email sent successfully!', info.messageId);
    } catch (error) {
        console.error('SMTP Error:', error);
    }
}

testEmail();
