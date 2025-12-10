const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      default: 'user'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
