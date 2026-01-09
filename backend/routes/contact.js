const express = require('express');
const router = express.Router();

// @route   POST /api/contact
// @desc    Receive contact form submission and send email
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        if (!firstName || !email || !message) {
            return res.status(400).json({ error: 'Please fill in all required fields' });
        }

        // Send email notification
        const { sendContactEmail } = require('../services/emailService');
        try {
            await sendContactEmail({ firstName, lastName, email, message });
            res.status(200).json({
                success: true,
                message: 'Message sent successfully! We will get back to you shortly.'
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500).json({
                error: 'Failed to send message. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ error: 'Server error processing your request' });
    }
});

module.exports = router;
