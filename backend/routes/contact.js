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

        // Mock email sending
        console.log(`Contact Message from ${firstName} ${lastName} (${email}): ${message}`);

        res.status(200).json({
            success: true,
            message: 'Message received! (Email service disabled)'
        });

    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ error: 'Server error processing your request' });
    }
});

module.exports = router;
