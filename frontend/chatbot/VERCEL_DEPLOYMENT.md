# Vercel Deployment Guide - Fixing NOT_FOUND Errors

## Quick Fix Summary

The `NOT_FOUND` error occurs because Vercel doesn't know how to handle client-side routing in your React SPA. The `vercel.json` file has been created to fix this.

## Root Cause Analysis

### What Was Happening vs. What Should Happen

**What was happening:**
1. User navigates to your app (e.g., `https://yourapp.vercel.app/`)
2. Vite builds your React app into static files in the `dist` folder
3. Vercel serves `index.html` correctly
4. **BUT** when you refresh the page on a client-side route (like `/login`) or navigate directly to it, Vercel looks for a file at `/login/index.html` or `/login`
5. That file doesn't exist → **NOT_FOUND (404) error**

**What should happen:**
1. All routes (except API routes) should serve `index.html`
2. React Router (or your routing logic) handles the routing client-side
3. The app works correctly on any route

### Why This Error Exists

Vercel (and most static hosting) serves files based on the URL path. For traditional websites:
- `/about` → looks for `/about.html` or `/about/index.html`
- This works great for static sites with actual files

For SPAs (Single Page Applications):
- All routes are handled by JavaScript in the browser
- There's only ONE HTML file (`index.html`)
- The server needs to be told: "For any route, serve `index.html`"

The `NOT_FOUND` error protects you from:
- Serving incorrect content
- Security issues (serving files that shouldn't exist)
- Confusion about what's actually available

## The Fix: vercel.json Configuration

The `vercel.json` file tells Vercel:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**What each part does:**
- `buildCommand`: Tells Vercel how to build your app
- `outputDirectory`: Where Vite outputs the built files (`dist` folder)
- `rewrites`: Rules for URL rewriting
  - `"source": "/(.*)"`: Matches ALL paths (regex pattern)
  - `"destination": "/index.html"`: Serves `index.html` for all routes

**Important:** The rewrite rule order matters! More specific rules should come first. Since we want ALL routes to go to `index.html`, this single rule works.

## Backend API Configuration

Your frontend makes API calls to `/api/*`. You have two deployment options:

### Option 1: Backend Deployed Separately (Recommended)

If your backend is on Railway, Render, Heroku, or another service:

1. **Set Environment Variable in Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - Redeploy your frontend

2. **Why this works:**
   - Your `api.js` checks `import.meta.env.VITE_API_URL` first
   - If set, it uses that URL
   - If not set, it falls back to `/api` (relative URL)

### Option 2: Backend Also on Vercel

If you deploy the backend as a separate Vercel project:

1. Deploy backend to Vercel (as a separate project)
2. Get the backend URL (e.g., `https://backend.vercel.app`)
3. Set `VITE_API_URL` = `https://backend.vercel.app/api` in frontend environment variables

**Note:** You cannot directly proxy to an external backend in `vercel.json` rewrites. You'd need Vercel Serverless Functions for that, which is more complex.

## Warning Signs to Watch For

### Code Smells That Indicate This Issue:

1. **Missing `vercel.json` for SPAs**
   - Any React/Vue/Angular app without routing config
   - Apps using client-side routing (React Router, Vue Router, etc.)

2. **Relative API URLs without environment variables**
   ```javascript
   // ⚠️ This will break if backend is on different domain
   baseURL: "/api"

   // ✅ Better: Use environment variable
   baseURL: import.meta.env.VITE_API_URL || "/api"
   ```

3. **Hardcoded localhost URLs in production code**
   ```javascript
   // ❌ BAD
   baseURL: "http://localhost:5000/api"

   // ✅ GOOD
   baseURL: import.meta.env.VITE_API_URL
   ```

4. **Missing build output directory configuration**
   - Vite builds to `dist/` by default
   - Make sure `vercel.json` specifies `"outputDirectory": "dist"`

### Similar Mistakes to Avoid:

1. **Forgetting to set environment variables in production**
   - Local `.env` files don't work on Vercel
   - Must set them in Vercel dashboard

2. **Incorrect rewrite rule order**
   ```json
   // ❌ WRONG ORDER - SPA rule catches everything first
   {
     "source": "/(.*)",
     "destination": "/index.html"
   },
   {
     "source": "/api/(.*)",
     "destination": "https://backend.com/api/$1"  // Never reached!
   }

   // ✅ CORRECT ORDER - Specific rules first
   {
     "source": "/api/(.*)",
     "destination": "https://backend.com/api/$1"
   },
   {
     "source": "/(.*)",
     "destination": "/index.html"
   }
   ```

3. **Not testing routes after deployment**
   - Always test:
     - Root route (`/`)
     - Client-side routes (`/login`, `/chat`, etc.)
     - Refreshing on non-root routes
     - Direct navigation to routes

## Alternative Approaches & Trade-offs

### 1. Next.js (Server-Side Rendering)
**Pros:**
- Built-in routing that works out of the box
- No need for `vercel.json` rewrites
- Better SEO
- Server-side rendering capabilities

**Cons:**
- More complex framework
- Requires migration from Vite/React
- More server resources needed

### 2. Static Site Generators (Gatsby, Astro)
**Pros:**
- Pre-renders all pages at build time
- No routing issues
- Excellent performance

**Cons:**
- Less dynamic
- Longer build times
- More complex for highly dynamic apps

### 3. Server-Side Rendering (SSR) with Express
**Pros:**
- Full control over routing
- Can serve different HTML for different routes

**Cons:**
- More complex deployment
- Requires Node.js server
- Higher costs

### 4. Current Approach (SPA with Rewrites) ✅
**Pros:**
- Simple and lightweight
- Fast client-side navigation
- Works well with Vite
- Easy to deploy

**Cons:**
- Requires configuration (`vercel.json`)
- SEO challenges (though can be mitigated)
- All routes serve same HTML file

## Testing Your Fix

After deploying with `vercel.json`:

1. ✅ Visit root: `https://yourapp.vercel.app/`
2. ✅ Navigate to `/login` (should work)
3. ✅ Refresh page on `/login` (should NOT show 404)
4. ✅ Navigate to `/chat` (should work)
5. ✅ Refresh page on `/chat` (should NOT show 404)
6. ✅ Test API calls (check browser Network tab)

## Common Issues & Solutions

### Issue: Still getting 404s
**Solution:**
- Check that `vercel.json` is in the correct location (project root or frontend folder root)
- Verify `outputDirectory` matches your build output
- Clear Vercel cache and redeploy

### Issue: API calls failing
**Solution:**
- Check `VITE_API_URL` environment variable is set in Vercel
- Verify backend CORS allows your frontend domain
- Check browser console for CORS errors

### Issue: Build fails
**Solution:**
- Verify `buildCommand` is correct (`npm run build`)
- Check that all dependencies are in `package.json`
- Review build logs in Vercel dashboard

## Mental Model: How Static Hosting Works

Think of static hosting like a file server:

```
Traditional Website:
/          → index.html ✅
/about     → about.html ✅
/contact   → contact.html ✅

SPA (without config):
/          → index.html ✅
/about     → about.html ❌ (doesn't exist!)
/contact   → contact.html ❌ (doesn't exist!)

SPA (with vercel.json):
/          → index.html ✅
/about     → index.html ✅ (rewritten!)
/contact   → index.html ✅ (rewritten!)
```

The rewrite rule is like saying: "If you can't find the file, serve `index.html` instead, and let JavaScript figure out what to show."

## Summary

- **Problem:** Vercel can't find files for client-side routes
- **Solution:** `vercel.json` rewrites all routes to `index.html`
- **Why it works:** React handles routing client-side after the page loads
- **Key takeaway:** SPAs need server configuration to handle routing

