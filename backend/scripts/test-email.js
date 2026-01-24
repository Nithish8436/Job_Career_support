const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const testEmail = async () => {
    console.log('--- Email Configuration Test ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Error: Email credentials missing in .env');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        debug: true, // Enable debug logs
        logger: true  // Enable logger
    });

    try {
        console.log('Attempting to verify transporter connection...');
        await transporter.verify();
        console.log('✅ Connectivity Verified!');

        const targetEmail = 'vikramraajak@gmail.com'; // Using the email from the screenshot
        console.log(`Attempting to send test email to ${targetEmail}...`);

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: 'Test Email from Career Compass Diagnosis',
            text: 'If you receive this, the backend email configuration is working correctly.',
            html: '<p>If you receive this, the <b>backend email configuration</b> is working correctly.</p>'
        });

        console.log('✅ Email Sent Successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

    } catch (error) {
        console.error('❌ Email Sending Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }

        if (error.code === 'EAUTH') {
            console.log('\n💡 Tip: Check if your App Password is correct. You cannot use your regular Gmail password.');
        }
    }
};

testEmail();
