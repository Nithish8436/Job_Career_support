const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    completedMilestones: [{
        milestoneId: Number,
        completedAt: Date
    }],
    stats: {
        totalAnalyses: {
            type: Number,
            default: 0
        },
        totalQuizzes: {
            type: Number,
            default: 0
        },
        totalInterviews: {
            type: Number,
            default: 0
        },
        highestQuizScore: {
            type: Number,
            default: 0
        },
        highestMatchScore: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Calculate level from XP
UserProgressSchema.methods.calculateLevel = function () {
    // Level 1: 0-499 XP
    // Level 2: 500-1499 XP
    // Level 3: 1500-2999 XP
    // etc.
    const level = Math.floor(this.xp / 500) + 1;
    this.level = level;
    return level;
};

// Add XP and check for level up
UserProgressSchema.methods.addXP = function (amount) {
    const oldLevel = this.level;
    this.xp += amount;
    this.calculateLevel();
    const leveledUp = this.level > oldLevel;
    return { newXP: this.xp, newLevel: this.level, leveledUp };
};

// Check if milestone is completed
UserProgressSchema.methods.isMilestoneCompleted = function (milestoneId) {
    return this.completedMilestones.some(m => m.milestoneId === milestoneId);
};

// Complete a milestone
UserProgressSchema.methods.completeMilestone = function (milestoneId, xpReward) {
    if (!this.isMilestoneCompleted(milestoneId)) {
        this.completedMilestones.push({
            milestoneId,
            completedAt: new Date()
        });
        return this.addXP(xpReward);
    }
    return null;
};

module.exports = mongoose.model('UserProgress', UserProgressSchema);
