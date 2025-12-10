// backend/services/translate.js
const axios = require("axios");

// Mistral translation via Mistral AI API
const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_API_KEY =
  process.env.MISTRAL_API_KEY || "FjSeZP1Hlcg3HVvKO0YHRfU2x9muOikS";
const MISTRAL_MODEL = "mistral-small"; // or "mistral-tiny" for faster/cheaper

// Optional LibreTranslate fallback (kept for resilience)
const LIBRE_ENDPOINT = "https://libretranslate.de/translate";

async function translateWithMistral(text, sourceLang, targetLang) {
  if (!text || sourceLang === targetLang) return text;
  if (!MISTRAL_API_KEY) throw new Error("Missing MISTRAL_API_KEY");

  const prompt = `Translate the following text from ${sourceLang || "auto"} to ${targetLang}. Return only the translation, no quotes, no commentary.

Text to translate: ${text}`;

  const res = await axios.post(
    MISTRAL_ENDPOINT,
    {
      model: MISTRAL_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 256,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
    }
  );

  const translatedText = res.data?.choices?.[0]?.message?.content;
  if (!translatedText) throw new Error("Empty translation from Mistral");
  return translatedText.trim();
}

async function translateWithLibre(text, sourceLang, targetLang) {
  if (!text || sourceLang === targetLang) return text;

  const body = {
    q: text,
    source: sourceLang || "auto",
    target: targetLang,
    format: "text",
  };

  const res = await axios.post(LIBRE_ENDPOINT, body, {
    headers: { "Content-Type": "application/json" },
  });

  return res.data.translatedText;
}

// Language name mapping
const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (हिंदी)",
  es: "Spanish (Español)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  zh: "Chinese (中文)",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  ar: "Arabic (العربية)",
  pt: "Portuguese (Português)",
  ru: "Russian (Русский)",
  bn: "Bengali (বাংলা)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)",
  gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  ur: "Urdu (اردو)",
};

// New function: Use Mistral for actual chat conversations
async function chatWithMistral(userMessage, language = "en") {
  if (!MISTRAL_API_KEY) throw new Error("Missing MISTRAL_API_KEY");

  const languageName = LANGUAGE_NAMES[language] || "English";

  const systemPrompt = `You are LangLeo, a friendly and helpful multilingual chatbot assistant.
Provide natural, conversational, and helpful responses to user messages.
Be concise but informative. Show personality and warmth.
Respond ONLY in ${languageName}. Do not use any other language.

IMPORTANT: When providing code examples, ALWAYS format them using markdown code blocks with the language specified:
\`\`\`language
code here
\`\`\`

For example:
- JavaScript: \`\`\`javascript
- Python: \`\`\`python
- Java: \`\`\`java
- HTML: \`\`\`html
- CSS: \`\`\`css
- SQL: \`\`\`sql

Always include the appropriate language identifier after the opening triple backticks.`;

  try {
    const res = await axios.post(
      MISTRAL_ENDPOINT,
      {
        model: MISTRAL_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
      }
    );

    const botResponse = res.data?.choices?.[0]?.message?.content;
    if (!botResponse) {
      console.error("Mistral response structure:", JSON.stringify(res.data, null, 2));
      throw new Error("Empty response from Mistral");
    }
    return botResponse.trim();
  } catch (error) {
    console.error("Mistral API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

module.exports = { translateWithMistral, translateWithLibre, chatWithMistral };
