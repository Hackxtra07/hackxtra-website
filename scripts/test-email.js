const nodemailer = require('nodemailer');

const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'hackxtras.official@gmail.com',
        pass: 'cubcgkvrpyigruim',
    },
    tls: {
        rejectUnauthorized: false
    }
};

async function testEmail() {
    console.log('Testing SMTP configuration with hardcoded values...');

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: '"HackXtras Test" <hackxtras.official@gmail.com>',
            to: 'hackxtras.official@gmail.com',
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
