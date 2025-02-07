import express from "express";
import passport from "passport";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    const user = new User({ email, password, name });
    await user.save();
    res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

/**
 * @route   POST /auth/login
 * @desc    Log in using local strategy
 * @access  Public
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info.message || "Login failed" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      const { _id, email, name, role } = user;
      return res.json({
        message: "Logged in successfully.",
        user: { id: _id, email, name, role }
      });
    });
  })(req, res, next);
});

/**
 * @route   GET /auth/logout
 * @desc    Log out the current user
 * @access  Public
 */
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully." });
  });
});

export default router;
