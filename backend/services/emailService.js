const { Resend } = require('resend');

// Initialize Resend with API Key from env
const resend = new Resend(process.env.RESEND_API_KEY);

// Send contact form email
const sendContactEmail = async ({ firstName, lastName, email, message }) => {
    try {
        const data = await resend.emails.send({
            from: 'CareerFlux <onboarding@resend.dev>', // Use default until domain verified
            to: process.env.EMAIL_USER, // Send to admin (yourself)
            reply_to: email,
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
                </div>
            `
        });
        console.log('Contact email sent:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Error sending contact email:', error);
        throw error;
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    try {
        const data = await resend.emails.send({
            from: 'CareerFlux <onboarding@resend.dev>',
            to: email, // Note: In testing mode, this only works if 'email' is the verified account email
            subject: 'Password Reset Request - CareerFlux',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link expires in 1 hour.</p>
                </div>
            `
        });
        console.log('Password reset email sent:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
    // Construct verification URL
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    try {
        const data = await resend.emails.send({
            from: 'CareerFlux <onboarding@resend.dev>',
            to: email,
            subject: 'Verify Your Email - CareerFlux',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Verify Your Email</h2>
                    <p>Please verify your email address to activate your account.</p>
                    <a href="${verifyUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                </div>
            `
        });
        console.log('Verification email sent:', data.id);
        return { success: true, messageId: data.id };
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
