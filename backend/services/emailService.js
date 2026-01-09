const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send contact form email
const sendContactEmail = async ({ firstName, lastName, email, message }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        replyTo: email, // User's email for easy reply
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Contact Form Message</h2>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>From:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: white; padding: 15px; border-left: 4px solid #2563eb; margin-top: 10px;">
                        ${message}
                    </p>
                </div>
                <p style="color: #64748b; font-size: 12px;">
                    This email was sent from the Career Compass contact form.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Contact email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending contact email:', error);
        throw error;
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = createTransporter();

    // Construct reset URL (adjust based on your frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - Career Compass',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">Password Reset Request</h1>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #334155;">Hello,</p>
                    <p style="font-size: 16px; color: #334155;">
                        You requested to reset your password for your Career Compass account. 
                        Click the button below to reset your password:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; 
                                  border-radius: 8px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 12px; color: #2563eb; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">
                        ${resetUrl}
                    </p>
                    <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                        <strong>This link will expire in 1 hour.</strong>
                    </p>
                    <p style="font-size: 14px; color: #64748b;">
                        If you didn't request this password reset, please ignore this email.
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
                    <p>Career Compass - AI-Powered Career Guidance</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
    const transporter = createTransporter();

    // Construct verification URL
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - Career Compass',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #334155;">Welcome to Career Compass!</p>
                    <p style="font-size: 16px; color: #334155;">
                        Please verify your email address to activate your account and access all features.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" 
                           style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; 
                                  border-radius: 8px; font-weight: bold; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 12px; color: #10b981; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">
                        ${verifyUrl}
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

module.exports = {
    sendContactEmail,
    sendPasswordResetEmail,
    sendVerificationEmail
};
