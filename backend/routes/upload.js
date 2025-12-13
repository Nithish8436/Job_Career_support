const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { extractResumeText } = require('../services/aiService');



// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'));
        }
    }
});

// POST /api/upload/resume
router.post('/resume', upload.single('resume'), async (req, res) => {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    try {
        if (!req.file) {
            console.log('ERROR: No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file.originalname);
        console.log('File size:', req.file.size, 'bytes');

        // Extract text from resume buffer
        let extractedText = '';
        try {
            console.log('Starting text extraction...');
            extractedText = await extractResumeText(req.file.buffer, path.extname(req.file.originalname));
            console.log('Extracted Text----------------------------------------------:', extractedText);
            console.log('Text extracted successfully. Length:', extractedText.length);
        } catch (extractError) {
            console.error('TEXT EXTRACTION ERROR:', extractError.message);
            return res.status(500).json({
                error: 'Failed to extract text from resume',
                details: extractError.message
            });
        }

        // Save resume to database (only parsed text, not the file)
        // We extract text immediately and discard the file buffer for privacy and storage efficiency
        console.log('Saving to database...');
        const resume = new Resume({
            userId: req.body.userId || '000000000000000000000000',
            fileName: req.file.originalname,
            contentType: req.file.mimetype,
            parsedData: {
                text: extractedText,
            }
            // Note: 'data' field (file buffer) is intentionally not stored
            // Only parsed text is saved for analysis purposes
        });

        await resume.save();
        console.log('Resume saved successfully. ID:', resume._id);
        console.log('✓ Only parsed text stored, original file discarded for privacy and storage efficiency');

        res.json({
            success: true,
            message: 'Resume uploaded successfully',
            resumeId: resume._id,
            fileName: resume.fileName,
            text: extractedText
        });
    } catch (error) {
        console.error('=== UPLOAD ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to upload resume',
            details: error.message
        });
    }
});

// POST /api/upload/extract-text
router.post('/extract-text', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Extracting text from file:', req.file.originalname);
        const text = await extractResumeText(req.file.buffer, path.extname(req.file.originalname));
        console.log('upload.js Extracted Text----------------------------------------------:', text);
        res.json({ success: true, text });
    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract text' });
    }
});

module.exports = router;
