// Quick test to verify Gemini API
const axios = require("axios");
require("dotenv").config();

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
  console.log("Testing Gemini API...");
  console.log("API Key:", GEMINI_API_KEY ? "Present" : "Missing");

  const prompt = `You are LangLeo, a friendly and helpful multilingual chatbot assistant.
Provide natural, conversational, and helpful responses to user messages.
Be concise but informative. Show personality and warmth.
Respond ONLY in English. Do not use any other language.

User: Hello, how are you?

Assistant:`;

  try {
    const res = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          topP: 0.95,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("\nSuccess! Response:");
    console.log(JSON.stringify(res.data, null, 2));
    
    const candidate = res.data?.candidates?.[0];
    const outText = candidate?.content?.parts?.[0]?.text;
    console.log("\nBot Reply:", outText);
  } catch (error) {
    console.error("\nError occurred:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.message);
    console.error("Response Data:", JSON.stringify(error.response?.data, null, 2));
  }
}

testGemini();
