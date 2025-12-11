const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: false, // Not required if storing in DB
    },
    data: {
        type: Buffer,
        required: false, // Deprecated: File buffer is no longer stored for privacy and storage efficiency
        // Only parsedData.text is stored after extraction
    },
    contentType: {
        type: String,
        required: true,
    },
    parsedData: {
        type: Object,
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Resume', resumeSchema);
