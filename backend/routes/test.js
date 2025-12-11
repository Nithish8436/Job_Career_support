const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Simple in-memory storage for testing
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Test endpoint - upload to memory only
router.post('/test', memoryUpload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('TEST UPLOAD - File received:', req.file.originalname);
        console.log('TEST UPLOAD - File size:', req.file.size);
        console.log('TEST UPLOAD - Buffer length:', req.file.buffer.length);

        res.json({
            success: true,
            message: 'Test upload successful',
            fileName: req.file.originalname,
            fileSize: req.file.size
        });
    } catch (error) {
        console.error('TEST UPLOAD ERROR:', error);
        res.status(500).json({
            error: 'Test upload failed',
            details: error.message
        });
    }
});

module.exports = router;
