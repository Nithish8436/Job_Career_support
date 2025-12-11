const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const UserProgress = require('../models/UserProgress');

// Get user progress
router.get('/', auth, async (req, res) => {
    try {
        let progress = await UserProgress.findOne({ userId: req.user.id });

        // Create progress if doesn't exist
        if (!progress) {
            progress = new UserProgress({
                userId: req.user.id,
                level: 1,
                xp: 0,
                completedMilestones: [],
                stats: {
                    totalAnalyses: 0,
                    totalQuizzes: 0,
                    totalInterviews: 0,
                    highestQuizScore: 0,
                    highestMatchScore: 0
                }
            });
            await progress.save();
        }

        res.json({
            success: true,
            progress
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch progress'
        });
    }
});

// Award XP for completing an action
router.post('/award-xp', auth, async (req, res) => {
    try {
        const { action, metadata } = req.body;

        let progress = await UserProgress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = new UserProgress({ userId: req.user.id });
        }

        let xpAwarded = 0;
        let milestoneCompleted = null;

        // Award XP based on action
        switch (action) {
            case 'resume_upload':
                xpAwarded = 50;
                progress.stats.totalAnalyses += 1;
                // Check milestone 1: Resume Basics
                if (!progress.isMilestoneCompleted(1)) {
                    const result = progress.completeMilestone(1, 100);
                    if (result) {
                        xpAwarded += 100;
                        milestoneCompleted = { id: 1, name: 'Resume Basics' };
                    }
                }
                break;

            case 'match_analysis':
                xpAwarded = 75;
                progress.stats.totalAnalyses += 1;
                if (metadata?.score) {
                    progress.stats.highestMatchScore = Math.max(
                        progress.stats.highestMatchScore,
                        metadata.score
                    );
                }
                // Check milestone 2: First Match
                if (!progress.isMilestoneCompleted(2) && progress.stats.totalAnalyses >= 1) {
                    const result = progress.completeMilestone(2, 150);
                    if (result) {
                        xpAwarded += 150;
                        milestoneCompleted = { id: 2, name: 'First Match' };
                    }
                }
                // Check milestone 6: Career Champion (10 matches)
                if (!progress.isMilestoneCompleted(6) && progress.stats.totalAnalyses >= 10) {
                    const result = progress.completeMilestone(6, 500);
                    if (result) {
                        xpAwarded += 500;
                        milestoneCompleted = { id: 6, name: 'Career Champion' };
                    }
                }
                break;

            case 'quiz_complete':
                xpAwarded = 100;
                progress.stats.totalQuizzes += 1;
                if (metadata?.score) {
                    progress.stats.highestQuizScore = Math.max(
                        progress.stats.highestQuizScore,
                        metadata.score
                    );
                    // Check milestone 3: Quiz Master (80%+)
                    if (!progress.isMilestoneCompleted(3) && metadata.score >= 80) {
                        const result = progress.completeMilestone(3, 200);
                        if (result) {
                            xpAwarded += 200;
                            milestoneCompleted = { id: 3, name: 'Quiz Master' };
                        }
                    }
                }
                break;

            case 'interview_complete':
                xpAwarded = 150;
                progress.stats.totalInterviews += 1;
                // Check milestone 4: Interview Pro
                if (!progress.isMilestoneCompleted(4)) {
                    const result = progress.completeMilestone(4, 250);
                    if (result) {
                        xpAwarded += 250;
                        milestoneCompleted = { id: 4, name: 'Interview Pro' };
                    }
                }
                break;

            case 'high_score_resume':
                // Milestone 5: Profile Optimizer (90+ score)
                if (!progress.isMilestoneCompleted(5) && metadata?.score >= 90) {
                    const result = progress.completeMilestone(5, 300);
                    if (result) {
                        xpAwarded += 300;
                        milestoneCompleted = { id: 5, name: 'Profile Optimizer' };
                    }
                }
                break;
        }

        // Add XP
        const result = progress.addXP(xpAwarded);
        await progress.save();

        res.json({
            success: true,
            xpAwarded,
            newXP: result.newXP,
            newLevel: result.newLevel,
            leveledUp: result.leveledUp,
            milestoneCompleted,
            progress
        });
    } catch (error) {
        console.error('Error awarding XP:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to award XP'
        });
    }
});

module.exports = router;
