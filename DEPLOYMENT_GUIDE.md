# Vercel Deployment Guide

## Understanding the NOT_FOUND Error

### What Happened

When you deploy a React SPA (Single Page Application) to Vercel without proper configuration, you'll get `NOT_FOUND` errors because:

1. **Client-Side Routing**: Your app uses client-side state management (not React Router, but the same principle applies)
2. **File System Expectations**: Vercel's default behavior is to look for actual files/directories
3. **Missing Rewrite Rules**: Without configuration, Vercel doesn't know all routes should serve `index.html`

### Example Scenario

- User visits: `https://yourapp.vercel.app/` ✅ Works (serves index.html)
- User visits: `https://yourapp.vercel.app/login` ❌ 404 NOT_FOUND (looks for `/login` file)
- User refreshes on `/chat` ❌ 404 NOT_FOUND (looks for `/chat` file)

## The Fix

I've created `frontend/chatbot/vercel.json` with:

1. **Rewrite Rules**: All routes → `index.html` (SPA fallback)
2. **API Proxy**: `/api/*` routes handled separately
3. **Build Configuration**: Points to your Vite build output

## Deployment Steps

### Option 1: Frontend Only (Recommended for Testing)

1. **Deploy Frontend to Vercel**:
   ```bash
   cd frontend/chatbot
   vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)

3. **Deploy Backend Separately**:
   - Use Railway, Render, or Vercel Serverless Functions
   - Set `MONGODB_URI`, `JWT_SECRET`, `MISTRAL_API_KEY`

### Option 2: Full Stack on Vercel

Convert backend to Vercel Serverless Functions (more complex, requires refactoring).

## Testing Locally

Before deploying, test the build:

```bash
cd frontend/chatbot
npm run build
npm run preview
```

Visit `http://localhost:4173` and test all routes.

