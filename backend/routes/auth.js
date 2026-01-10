const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate verification token
        const verificationToken = require('crypto').randomBytes(32).toString('hex');

        user = new User({
            name,
            email,
            password,
            verificationToken,
            isVerified: false
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Send confirmation email (non-blocking)
        const { sendVerificationEmail } = require('../services/emailService');
        sendVerificationEmail(email, verificationToken)
            .then(() => console.log(`Verification email sent to ${email}`))
            .catch(emailErr => console.error('Failed to send verification email:', emailErr));

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            requireVerification: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/verify-email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        // Find user with this token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification link' });
        }

        if (user.isVerified) {
            return res.status(200).json({ success: true, message: 'Email already verified. You can login.' });
        }

        // Verify user
        user.isVerified = true;
        user.verificationToken = undefined; // Clear token
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully!' });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check verification
        if (!user.isVerified) {
            return res.status(401).json({ error: 'Please verify your email address first' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        // Generate reset token (valid for 1 hour)
        const payload = {
            user: { id: user.id },
            type: 'reset'
        };
        const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send password reset email (non-blocking)
        const { sendPasswordResetEmail } = require('../services/emailService');

        sendPasswordResetEmail(email, resetToken)
            .then(() => console.log(`Password reset email sent to ${email}`))
            .catch(err => console.error('Failed to send reset email:', err));

        res.json({
            success: true,
            message: 'If an account exists, password reset instructions have been sent.'
        });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user
            const user = await User.findById(decoded.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();

            res.json({ success: true, message: 'Password reset successfully' });

        } catch (err) {
            console.error('Token verification failed:', err);
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;


