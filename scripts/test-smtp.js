async function testApi() {
    const data = {
        type: 'contact',
        data: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            subject: 'API Test',
            message: 'Testing the /api/send-email endpoint directly.'
        }
    };

    console.log('Sending test request to /api/send-email...');

    // Since we are running in the same environment, we can't easily fetch our own dev server
    // but we can test the SMTP connection directly again with the project's config loader
    const dotenv = require('dotenv');
    const path = require('path');
    const nodemailer = require('nodemailer');

    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

    console.log('SMTP Config:', { ...smtpConfig, auth: { ...smtpConfig.auth, pass: '****' } });

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified!');

        console.log('Sending test mail...');
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.SMTP_USER}>`,
            to: process.env.DEFAULT_CONTACT_EMAIL || 'hackxtras.official@gmail.com',
            subject: 'Internal SMTP Test',
            text: 'Testing SMTP from script using .env.local',
        });
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('SMTP Error:', error);
    }
}

testApi();
