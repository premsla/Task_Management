// Ensure env variables loaded
import 'dotenv/config';
// Base server URL for OAuth callbacks
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8800';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/userModel.js';

// Debug: log Google OAuth credentials
console.log('⚙️ Google OAuth Config:', {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
});

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${SERVER_URL}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ 'socialLogin.providerId': profile.id, 'socialLogin.provider': 'google' });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Update existing user with Google info
      user.socialLogin = {
        provider: 'google',
        providerId: profile.id,
        avatar: profile.photos[0]?.value
      };
      user.avatar = profile.photos[0]?.value;
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value,
      socialLogin: {
        provider: 'google',
        providerId: profile.id,
        avatar: profile.photos[0]?.value
      },
      role: 'Employee',
      title: 'Team Member'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
  }));
}

// GitHub OAuth Strategy - only initialize if credentials are provided
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this GitHub ID
    let user = await User.findOne({ 'socialLogin.providerId': profile.id, 'socialLogin.provider': 'github' });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
    user = await User.findOne({ email });

    if (user) {
      // Update existing user with GitHub info
      user.socialLogin = {
        provider: 'github',
        providerId: profile.id,
        avatar: profile.photos[0]?.value
      };
      user.avatar = profile.photos[0]?.value;
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      name: profile.displayName || profile.username,
      email,
      avatar: profile.photos[0]?.value,
      socialLogin: {
        provider: 'github',
        providerId: profile.id,
        avatar: profile.photos[0]?.value
      },
      role: 'Employee',
      title: 'Developer'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
  }));
}

// Facebook OAuth Strategy - only initialize if credentials are provided
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Facebook ID
    let user = await User.findOne({ 'socialLogin.providerId': profile.id, 'socialLogin.provider': 'facebook' });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    const email = profile.emails?.[0]?.value || `${profile.id}@facebook.local`;
    user = await User.findOne({ email });

    if (user) {
      // Update existing user with Facebook info
      user.socialLogin = {
        provider: 'facebook',
        providerId: profile.id,
        avatar: profile.photos[0]?.value
      };
      user.avatar = profile.photos[0]?.value;
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      name: profile.displayName,
      email,
      avatar: profile.photos[0]?.value,
      socialLogin: {
        provider: 'facebook',
        providerId: profile.id,
        avatar: profile.photos[0]?.value
      },
      role: 'Employee',
      title: 'Team Member'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
  }));
}

export default passport;
