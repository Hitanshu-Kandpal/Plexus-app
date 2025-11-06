# ⚡ Quick Vercel Deploy

## TL;DR

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

## Required Environment Variables (Set in Vercel Dashboard)

```
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_GOOGLE_CLIENT_ID=your_google_id
REACT_APP_FACEBOOK_CLIENT_ID=your_facebook_id  
REACT_APP_REDIRECT_URI=https://your-app.vercel.app/auth/callback
```

## Backend Setup

Deploy backend separately to Railway/Render/Heroku, then:

1. Set `FRONTEND_URL=https://your-app.vercel.app` in backend env vars
2. Update OAuth redirect URIs in Google/Facebook consoles
3. Redeploy backend

## Done! 🎉

Your app will be live at `https://your-app.vercel.app`

For detailed instructions, see `DEPLOY.md`

