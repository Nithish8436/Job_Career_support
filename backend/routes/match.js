const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Resume = require('../models/Resume');
const UserProgress = require('../models/UserProgress');
const { analyzeMatch, generateCareerSuggestions, generateEnhancedResume } = require('../services/aiService');
const { htmlToPdf } = require('../services/htmlToPdfService');

// POST /api/match/analyze
router.post('/analyze', async (req, res) => {
    try {
        const { resumeId, jobDescription, userId } = req.body;

        if (!resumeId || !jobDescription) {
            return res.status(400).json({ error: 'Resume ID and job description are required' });
        }

        // Get resume from database
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Get resume text
        const resumeText = resume.parsedData?.text || 'Sample resume content';

        // Analyze with AI
        const analysis = await analyzeMatch(resumeText, jobDescription);

        // Generate career patfh suggestions based on matched skills
        let careerSuggestions = [];
        if (analysis.matchedSkills && analysis.matchedSkills.length > 0) {
            careerSuggestions = await generateCareerSuggestions(
                analysis.matchedSkills,
                resumeText
            );
        }

        // Save match result to database
        const match = new Match({
            userId: userId || resume.userId,
            resumeId: resumeId,
            jobDescription: jobDescription,
            jobTitle: analysis.jobTitle || 'Unknown Position',
            overallScore: analysis.overallScore,
            breakdown: analysis.breakdown,
            matchedSkills: analysis.matchedSkills || [],
            missingSkills: analysis.missingSkills || [],
            skillAnalysis: analysis.skillAnalysis || null,
            suggestions: analysis.suggestions || [],
            eligibility: analysis.eligibility || { eligible: true, reason: 'Eligible' },
            careerSuggestions: careerSuggestions,
            githubAnalysis: analysis.githubAnalysis || null
        });

        await match.save();

        // Award XP for match analysis
        try {
            let progress = await UserProgress.findOne({ userId: userId || resume.userId });
            if (!progress) {
                progress = new UserProgress({ userId: userId || resume.userId });
            }

            // Award XP for match analysis
            progress.stats.totalAnalyses += 1;
            if (match.overallScore) {
                progress.stats.highestMatchScore = Math.max(
                    progress.stats.highestMatchScore || 0,
                    match.overallScore
                );
            }

            // Check and complete milestones
            let xpAwarded = 75; // Base XP for analysis

            // Milestone 2: First Match
            if (!progress.isMilestoneCompleted(2) && progress.stats.totalAnalyses >= 1) {
                progress.completeMilestone(2, 150);
                xpAwarded += 150;
            }

            // Milestone 5: Profile Optimizer (90+ score)
            if (!progress.isMilestoneCompleted(5) && match.overallScore >= 90) {
                progress.completeMilestone(5, 300);
                xpAwarded += 300;
            }

            // Milestone 6: Career Champion (10 matches)
            if (!progress.isMilestoneCompleted(6) && progress.stats.totalAnalyses >= 10) {
                progress.completeMilestone(6, 500);
                xpAwarded += 500;
            }

            progress.addXP(xpAwarded);
            await progress.save();
        } catch (progressError) {
            console.error('Error updating progress:', progressError);
            // Don't fail the request if progress update fails
        }

        res.json({
            success: true,
            matchId: match._id,
            analysis: {
                overallScore: match.overallScore,
                breakdown: match.breakdown,
                matchedSkills: match.matchedSkills,
                missingSkills: match.missingSkills,
                suggestions: match.suggestions,
                jobTitle: match.jobTitle,
                eligibility: match.eligibility,
                careerSuggestions: match.careerSuggestions,
                githubAnalysis: match.githubAnalysis
            }
        });
    } catch (error) {
        console.error('Match analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze match', details: error.message });
    }
});

// DELETE /api/match/:id - Delete a single match (must be before GET /:id)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the match
        const match = await Match.findByIdAndDelete(id);

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        res.json({
            success: true,
            message: 'Match deleted successfully',
            matchId: id
        });
    } catch (error) {
        console.error('Delete match error:', error);
        res.status(500).json({ error: 'Failed to delete match', details: error.message });
    }
});

// DELETE /api/match/user/:userId/all - Delete all matches for a user
router.delete('/user/:userId/all', async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete all matches for the user
        const result = await Match.deleteMany({ userId });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} matches`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Delete all matches error:', error);
        res.status(500).json({ error: 'Failed to delete matches', details: error.message });
    }
});

// GET /api/match/:id
router.get('/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        res.json({
            success: true,
            match: match
        });
    } catch (error) {
        console.error('Get match error:', error);
        res.status(500).json({ error: 'Failed to retrieve match' });
    }
});

// POST /api/match/enhanced-resume
router.post('/enhanced-resume', async (req, res) => {
    try {
        const { resumeId, jobDescription, analysisResults } = req.body;

        if (!resumeId || !jobDescription || !analysisResults) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get resume from database
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Get resume text
        const resumeText = resume.parsedData?.text || 'Sample resume content';

        console.log('=== Enhanced Resume Generation Started ===');
        console.log('Resume ID:', resumeId);
        console.log('Resume text length:', resumeText.length);

        // 1. Generate HTML code
        console.log('Step 1: Generating HTML code...');
        const htmlCode = await generateEnhancedResume(resumeText, jobDescription, analysisResults);
        console.log('HTML code generated. Length:', htmlCode.length);
        console.log('HTML preview (first 500 chars):', htmlCode.substring(0, 500));

        // 2. Convert HTML to PDF
        console.log('Step 2: Converting HTML to PDF...');
        const pdfBuffer = await htmlToPdf(htmlCode);
        console.log('PDF generated successfully. Size:', pdfBuffer.length, 'bytes');

        // 3. Return PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="enhanced_resume.pdf"',
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
        console.log('=== Enhanced Resume Generation Completed ===');

    } catch (error) {
        const fs = require('fs');
        const logMessage = `\n[${new Date().toISOString()}] Enhanced Resume FAILED:\nName: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}\n`;
        fs.appendFileSync('error.log', logMessage);

        console.error('=== Enhanced Resume Generation FAILED ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to generate enhanced resume', details: error.message });
    }
});

// POST /api/match/export-pdf
router.post('/export-pdf', async (req, res) => {
    try {
        const { matchId } = req.body;

        console.log('[PDF DEBUG] Generating report for matchId:', matchId);

        if (!matchId) {
            return res.status(400).json({ error: 'Match ID is required' });
        }

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        console.log('[PDF DEBUG] Match found. Generating HTML...');
        const { generateMatchReportHtml } = require('../templates/reportTemplate');

        const htmlContent = generateMatchReportHtml(match);
        console.log('[PDF DEBUG] HTML Generated. Length:', htmlContent.length);

        console.log('[PDF DEBUG] Converting to PDF...');
        const pdfBuffer = await htmlToPdf(htmlContent);
        console.log('[PDF DEBUG] PDF Generated. Size:', pdfBuffer.length);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="career-compass-report-${matchId}.pdf"`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF report', details: error.message });
    }
});

// GET /api/match/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const [matches, totalCount] = await Promise.all([
            Match.find({ userId: req.params.userId })
                .sort({ createdAt: -1 })
                .limit(limit),
            Match.countDocuments({ userId: req.params.userId })
        ]);

        res.json({
            success: true,
            matches: matches,
            totalCount: totalCount
        });
    } catch (error) {
        console.error('Get user matches error:', error);
        res.status(500).json({ error: 'Failed to retrieve matches' });
    }
});

module.exports = router;
