const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    jobTitle: {
        type: String,
        default: '',
    },
    overallScore: {
        type: Number,
        required: true,
    },
    breakdown: {
        skillsScore: Number,
        experienceScore: Number,
        educationScore: Number,
    },
    matchedSkills: [String],
    missingSkills: [String],
    skillAnalysis: {
        hardSkills: {
            matched: [String],
            missing: [String],
            score: Number,
            strengths: String,
            improvements: String
        },
        softSkills: {
            matched: [String],
            missing: [String],
            score: Number,
            strengths: String,
            improvements: String
        },
        technicalSkills: {
            matched: [String],
            missing: [String],
            score: Number,
            strengths: String,
            improvements: String
        }
    },
    suggestions: {
        type: Array,
        default: [],
    },
    eligibility: {
        eligible: {
            type: Boolean,
            default: true,
        },
        reason: {
            type: String,
            default: 'Eligible',
        },
    },
    careerSuggestions: [{
        title: String,
        matchScore: Number,
        description: String,
        requiredSkills: [String],
        imageUrl: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Match', matchSchema);
