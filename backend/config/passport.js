const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
            email: email,
            [`${provider}Id`]: profile.id,
            isVerified: true // Social login implies verified email
        });

        await user.save();
        done(null, user);

    } catch (err) {
        console.error(`${provider} Strategy Error:`, err);
        done(err, null);
    }
};

// --- GOOGLE STRATEGY ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
    }, (accessToken, refreshToken, profile, done) => handleSocialLogin('google', profile, done)));
}
