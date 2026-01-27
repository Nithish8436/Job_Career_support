const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Helper to handle "Find or Create" logic
const handleSocialLogin = async (provider, profile, done) => {
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        // 1. Try to find user by Social ID
        let user = await User.findOne({ [`${provider}Id`]: profile.id });

        if (user) {
            return done(null, user);
        }

        // 2. If no user by ID, try to find by Email (linking accounts)
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                // Link the social ID to existing account
                user[`${provider}Id`] = profile.id;
                await user.save();
                return done(null, user);
            }
        }

        // 3. Create new user
        user = new User({
            name: profile.displayName || profile.username,
            email: email, // Note: GitHub/LinkedIn might not provide email if private
            [`${provider}Id`]: profile.id,
            isVerified: true // Social login implies verified email (mostly)
        });

        await user.save();
        done(null, user);

    } catch (err) {
        console.error(`${provider} Strategy Error:`, err);
        done(err, null);
    }
};

// --- STRATEGIES ---

// Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, (accessToken, refreshToken, profile, done) => handleSocialLogin('google', profile, done)));
}

// GitHub
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback",
        scope: ['user:email']
    }, (accessToken, refreshToken, profile, done) => handleSocialLogin('github', profile, done)));
}

// LinkedIn
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: "/api/auth/linkedin/callback",
        scope: ['r_emailaddress', 'r_liteprofile'],
    }, (accessToken, refreshToken, profile, done) => handleSocialLogin('linkedin', profile, done)));
}
