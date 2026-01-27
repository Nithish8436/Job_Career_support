const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () { return !this.googleId && !this.githubId && !this.linkedinId; } // Password not required if using social login
    },
    googleId: String,
    githubId: String,
    linkedinId: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String
});

module.exports = mongoose.model('User', userSchema);
