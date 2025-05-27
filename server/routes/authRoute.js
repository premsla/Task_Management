import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import createJWT from '../utils/jwt.js';
import User from '../models/userModel.js';

const router = express.Router();

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Google OAuth routes - only if Google strategy is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/log-in' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = createJWT(res, req.user._id);

      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/log-in?error=auth_failed`);
    }
  }
);
} else {
  // Fallback route when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({
      error: 'Google OAuth not configured',
      message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables'
    });
  });
}

// GitHub OAuth routes - only if GitHub strategy is configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/log-in' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = createJWT(res, req.user._id);

      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
    } catch (error) {
      console.error('GitHub auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/log-in?error=auth_failed`);
    }
  }
);
} else {
  // Fallback route when GitHub OAuth is not configured
  router.get('/github', (req, res) => {
    res.status(503).json({
      error: 'GitHub OAuth not configured',
      message: 'Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in environment variables'
    });
  });
}

// Facebook OAuth routes - only if Facebook strategy is configured
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/log-in' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = createJWT(res, req.user._id);

      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
    } catch (error) {
      console.error('Facebook auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/log-in?error=auth_failed`);
    }
  }
);
} else {
  // Fallback route when Facebook OAuth is not configured
  router.get('/facebook', (req, res) => {
    res.status(503).json({
      error: 'Facebook OAuth not configured',
      message: 'Please configure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in environment variables'
    });
  });
}

// Social login success endpoint (for handling token from URL)
router.post('/social-success', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }

    // Verify token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        title: user.title,
        avatar: user.avatar,
        socialLogin: user.socialLogin
      }
    });
  } catch (error) {
    console.error('Social success error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

export default router;
