const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { generateInterviewFeedback } = require('../services/aiService');

// POST /api/interview/feedback
router.post('/feedback', auth, async (req, res) => {
    try {
        const { interviewSummary, mode } = req.body;
        if (!interviewSummary) {
            return res.status(400).json({ error: 'interviewSummary is required' });
        }

        const feedback = await generateInterviewFeedback(interviewSummary, mode || 'technical');

        res.json({ success: true, message: feedback });
    } catch (error) {
        console.error('Interview feedback error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate feedback', details: error.message });
    }
});

module.exports = router;
