const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { Resend } = require('resend');

// @route   POST /api/contact
// @desc    Receive contact form submission, save to DB and send email
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        if (!firstName || !email || !message) {
            return res.status(400).json({ error: 'Please fill in all required fields' });
        }

        // 1. Save to Database
        const newContact = new Contact({
            firstName,
            lastName,
            email,
            message
        });

        await newContact.save();
        console.log(`✅ Contact form saved to DB from ${firstName} ${lastName} (${email})`);

        // 2. Send Email via Resend (Optional/Best Effort)
        if (process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: 'Career Compass Support <onboarding@resend.dev>',
                    to: process.env.EMAIL_USER || 'nithu2904@gmail.com',
                    subject: `New Contact Form Submission: ${firstName} ${lastName}`,
                    html: `
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message}</p>
                        <hr />
                        <p>Sent via Career Compass Support Form</p>
                    `
                });
                console.log('📧 Contact notification email sent via Resend');
            } catch (emailError) {
                console.error('Email sending error (Resend):', emailError);
                // We don't fail the request if email fails, but DB save succeeded
            }
        }

        res.status(200).json({
            success: true,
            message: 'Message received and saved!'
        });

    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ error: 'Server error processing your request' });
    }
});

module.exports = router;

