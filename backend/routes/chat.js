const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { chatWithAI } = require('../services/aiService');

// POST /api/chat
// Send a message to the AI coach
router.post('/', auth, async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required', details: 'Message field is missing' });
        }

        // Format history for the AI service if provided
        // Expecting history to be array of { role: 'user'|'assistant', content: '...' }
        const context = history || [];

        const response = await chatWithAI(message, context);

        // Ensure response is a string
        const responseText = typeof response === 'string' ? response : JSON.stringify(response);

        res.json({
            success: true,
            message: responseText
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to get response',
            details: error.message || 'Unknown error occurred'
        });
    }
});

module.exports = router;
