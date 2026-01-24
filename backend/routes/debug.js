const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// @route   GET /api/debug/email
// @desc    Test email configuration (Diagnostics)
// @access  Public (Temporary)
router.get('/email', async (req, res) => {
    console.log('--- Debug: Email Config Check ---');

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // 1. Check Env Vars Existence
    const status = {
        env: {
            EMAIL_USER: user ? `Set (${user})` : 'MISSING',
            EMAIL_PASS: pass ? 'Set (Length: ' + pass.length + ')' : 'MISSING',
        },
        connection: 'Pending',
        error: null
    };

    if (!user || !pass) {
        return res.status(500).json(status);
    }

    // 2. Test Connection
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 10000, // 10s timeout
        family: 4 // Match production config
    });

    try {
        await transporter.verify();
        status.connection = 'SUCCESS: Connected to Gmail SMTP';
        res.json(status);
    } catch (error) {
        status.connection = 'FAILED';
        status.error = {
            message: error.message,
            code: error.code,
            response: error.response
        };
        console.error('Debug Email Error:', error);
        res.status(500).json(status);
    }
});

module.exports = router;
