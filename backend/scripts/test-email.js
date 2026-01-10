const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Start from scripts/.. which is backend/
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing SMTP Configuration...');
    console.log('User:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.log('Pass:', process.env.EMAIL_PASS ? 'Set' : 'Missing');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000
    });

    try {
        console.log('Attempting to verify connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SMTP Test - Career Compass',
            text: 'If you receive this, your email configuration is correct!',
            html: '<b>If you receive this, your email configuration is correct!</b>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ SMTP Test Failed:');
        console.error(error);
    }
};

testEmail();
