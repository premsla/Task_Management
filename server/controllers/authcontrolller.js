const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); 

require('dotenv').config({ path: './.env' }); 
const googleClientId = process.env.GOOGLE_CLIENT_ID; // Get Client ID from .env
const client = new OAuth2Client(googleClientId); // Initialize Google OAuth client

// Helper function to generate your custom JWT
const generateToken = (user) => {
  // Ensure the payload matches what your protect middleware expects (e.g., email)
  return jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

// @desc    Register a new user (traditional signup)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists with this email.' });
    }

    // Create a new user with hashed password (handled by pre-save hook in User model)
    const user = await User.create({ name, email, password });

    // Generate custom JWT for the new user
    const token = generateToken(user);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ msg: 'Server error during signup', error: error.message });
  }
};

// @desc    Authenticate user (traditional login)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Check if user exists and if they have a password (not a Google-only account)
    if (!user || !user.password) {
      return res.status(401).json({ msg: 'Invalid credentials or user registered via Google. Please use Google Sign-In.' });
    }

    // Compare provided password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Generate custom JWT
    const token = generateToken(user);
    res.status(200).json({ user: { email: user.email, name: user.name, id: user._id }, token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ msg: 'Server error during login', error: error.message });
  }
};


    // If user exists and already has a googleId, simply proceed (no update needed)

   