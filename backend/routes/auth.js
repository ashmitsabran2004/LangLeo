const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USERNAME || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-email-password'
  }
});

const router = express.Router();


// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if the email exists or not
      return res.json({ message: 'If an account exists with this email, you will receive a reset link.' });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expiry
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `${resetUrl}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'If an account exists with this email, you will receive a reset link.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user by token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Send confirmation email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      subject: 'Your password has been changed',
      text: `Hello,\n\n` +
        `This is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
