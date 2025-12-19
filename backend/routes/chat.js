// backend/routes/chat.js
const express = require("express");
const Chat = require("../models/Chat");
const auth = require("../middleware/auth");
const { translateWithMistral, translateWithLibre, chatWithMistral } = require("../services/translate");

const router = express.Router();

// Graceful translation helper
async function safeTranslate(text, from, to) {
  if (!text || from === to) return text;
  try {
    return await translateWithMistral(text, from, to);
  } catch (err) {
    console.warn("Mistral translate failed, trying Libre:", err.response?.data || err.message);
    try {
      return await translateWithLibre(text, from, to);
    } catch (err2) {
      console.warn("Libre translate failed, returning original:", err2.response?.data || err2.message);
      return text;
    }
  }
}

// POST /api/chat/message
router.post("/message", auth, async (req, res) => {
  try {
    const { message, language = "en" } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1) Save user message as-is in selected language
    const userMsg = new Chat({
      userId: req.user.id,
      message,
      sender: "user",
      language,
    });
    await userMsg.save();

    // 2) Get bot response directly in user's language using Mistral
    let botReplyFinal;
    try {
      botReplyFinal = await chatWithMistral(message, language);
    } catch (err) {
      console.warn("Mistral chat failed:", err.response?.data || err.message);

      // Check if it's a quota limit error
      const isQuotaError = err.response?.status === 429;
      const errorCode = err.response?.data?.error?.code;

      // Fallback response based on error type
      if (isQuotaError || errorCode === 429) {
        botReplyFinal = language === "en"
          ? "I've reached my API rate limit. Please wait a moment and try again, or contact support for a new API key."
          : await safeTranslate("I've reached my API rate limit. Please wait a moment and try again, or contact support for a new API key.", "en", language);
      } else {
        botReplyFinal = language === "en"
          ? "I'm having trouble connecting right now. Please try again."
          : await safeTranslate("I'm having trouble connecting right now. Please try again.", "en", language);
      }
    }

    // 5) Save bot reply
    const botMsg = new Chat({
      userId: req.user.id,
      message: botReplyFinal,
      sender: "bot",
      language,
    });
    await botMsg.save();

    // 6) Return both new messages
    res.status(201).json({
      messages: [userMsg, botMsg],
    });
  } catch (err) {
    console.error("Chat message error:", err.response?.data || err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/chat/messages
router.get("/messages", auth, async (req, res) => {
  try {
    const messages = await Chat.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
