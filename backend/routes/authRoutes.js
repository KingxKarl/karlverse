import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Utility function to generate JWT using secret from env
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // Standard expiration time; extendable with a remember-me option
  );
};

// POST /api/auth/register - Register a new user using local credentials
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login - Login with email and password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/google - Social login using Google
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    // Verify Google token using Google’s tokeninfo endpoint
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { email, name, sub: googleId } = response.data;
    if (!email) {
      return res.status(400).json({ message: "Google authentication failed" });
    }
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    const jwtToken = generateToken(user);
    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

// POST /api/auth/microsoft - Social login using Microsoft (stubbed)
router.post('/microsoft', async (req, res) => {
  // Implement similar logic as Google after verifying the Microsoft token
  res.status(501).json({ message: "Microsoft social login not implemented yet" });
});

export default router;
