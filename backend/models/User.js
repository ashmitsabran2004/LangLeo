const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  languagePreference: { type: String, default: 'en' },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
