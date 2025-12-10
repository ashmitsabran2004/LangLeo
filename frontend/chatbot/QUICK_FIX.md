# Quick Fix: Vercel NOT_FOUND Error

## ✅ What Was Fixed

Created `vercel.json` in `frontend/chatbot/` to handle SPA routing.

## 🚀 Next Steps

1. **Commit and push** the `vercel.json` file
2. **Redeploy** on Vercel (or push to trigger auto-deploy)
3. **Set environment variable** (if backend is separate):
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - Redeploy

## 🧪 Test After Deployment

- ✅ Visit root URL
- ✅ Navigate to `/login`
- ✅ **Refresh** page on `/login` (should NOT show 404)
- ✅ Navigate to `/chat`
- ✅ **Refresh** page on `/chat` (should NOT show 404)

## 📝 What vercel.json Does

Tells Vercel: "For any route, serve `index.html` and let React handle routing."

See `VERCEL_DEPLOYMENT.md` for full explanation.

