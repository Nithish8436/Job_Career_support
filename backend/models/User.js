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
        required: function () { return !this.googleId; } // Password not required if using Google login
    },
    googleId: String,
    securityQuestion: {
        type: String,
        required: function () { return !this.googleId; }
    },
    securityAnswer: {
        type: String,
        required: function () { return !this.googleId; }
    },
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
