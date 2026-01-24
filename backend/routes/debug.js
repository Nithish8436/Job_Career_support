const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

// @route   GET /api/debug/email
// @desc    Test Resend configuration
router.get('/email', async (req, res) => {
    console.log('--- Debug: Resend Config Check ---');

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ status: 'FAILED', error: 'RESEND_API_KEY missing' });
    }

    const resend = new Resend(apiKey);

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'nithish8436@gmail.com', // Creating user's email as target for test
            subject: 'Resend Debug Test',
            html: '<p>Resend configuration is working!</p>'
        });

        if (data.error) {
            throw data.error;
        }

        res.json({
            status: 'SUCCESS',
            details: 'Email dispatched via Resend',
            data
        });
    } catch (error) {
        console.error('Debug Email Error:', error);
        res.status(500).json({
            status: 'FAILED',
            error: error.message || error
        });
    }
});

module.exports = router;
