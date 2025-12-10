# Gemini API Key Issue - QUOTA EXCEEDED

## Problem
Your current Gemini API key has **exceeded its rate limit**. This is why the chatbot shows error messages.

## Solution: Get a New API Key

### Step 1: Visit Google AI Studio
Go to: https://aistudio.google.com/apikey

### Step 2: Create a New API Key
1. Click "Get API Key" or "Create API Key"
2. Select your project (or create a new one)
3. Copy the new API key

### Step 3: Update Your .env File
1. Open: `D:\Personal\Projects\chatbot project\backend\.env`
2. Replace the line:
   ```
   GEMINI_API_KEY=AIzaSyB4vM_-3FYjNF9TTL1oCSG9_UaHRPujDVg
   ```
   with:
   ```
   GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
   ```

### Step 4: Restart the Backend
1. Close the backend PowerShell window
2. Open a new PowerShell window
3. Run:
   ```powershell
   cd "D:\Personal\Projects\chatbot project\backend"
   npm run dev
   ```

## Rate Limits (Free Tier)
- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Tokens per minute**: 1 million

If you need more, consider upgrading to a paid plan.

## What's Been Fixed
✅ Fixed Gemini API endpoint (using gemini-2.0-flash model)
✅ Added 19 languages including:
   - **Indian Languages**: Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu
   - **World Languages**: English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese, Russian
✅ Improved error messages for quota issues
✅ Better error handling throughout the app

## Test After Getting New Key
After updating the API key, refresh your browser and try sending:
- "Hello, how are you?"
- "Tell me a joke"
- Switch languages and test!
