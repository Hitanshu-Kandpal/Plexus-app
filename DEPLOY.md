# Quick Vercel Deployment Guide

## 🚀 Deploy Frontend to Vercel (5 minutes)

### Prerequisites
- Vercel account (free tier works)
- Backend deployed somewhere (Railway/Render/Heroku) OR use serverless functions

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root
vercel

# For production
vercel --prod
```

### Step 4: Set Environment Variables in Vercel Dashboard

Go to: Your Project → Settings → Environment Variables

Add these:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_FACEBOOK_CLIENT_ID=your_facebook_app_id
REACT_APP_REDIRECT_URI=https://your-app.vercel.app/auth/callback
```

### Step 5: Update OAuth Redirect URIs

**Google Console:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client
3. Add authorized redirect URI: `https://your-app.vercel.app/auth/callback`

**Facebook App:**
1. Go to Facebook Developers → Your App → Settings → Basic
2. Add Valid OAuth Redirect URI: `https://your-app.vercel.app/auth/callback`

### Step 6: Redeploy
After setting environment variables, redeploy:
```bash
vercel --prod
```

## 🔧 Backend Deployment (Separate Platform)

Since Vercel is optimized for frontend/serverless, deploy your Express backend separately:

### Option A: Railway (Easiest)
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo, choose `server/` directory
4. Add environment variables
5. Get your backend URL

### Option B: Render
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Select repo, set root directory to `server/`
4. Add environment variables
5. Deploy

### Update Backend CORS
In `server/index.js`, update CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true 
}));
```

## ✅ That's It!

Your app should now be live at `https://your-app.vercel.app`

## 🐛 Troubleshooting

**Build fails?**
- Check Node version (Vercel uses 18.x)
- Check build logs in Vercel dashboard

**CORS errors?**
- Make sure backend CORS includes Vercel domain
- Check `credentials: true` is set

**OAuth not working?**
- Verify redirect URIs match exactly
- Check environment variables are set
- Look at browser console for errors

**Cookies not working?**
- Vercel uses HTTPS, cookies should work
- For cross-origin, backend needs `sameSite: 'none'` and `secure: true`

