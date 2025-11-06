# Vercel Deployment Guide for PLEXUS

## Overview

This guide explains how to deploy the PLEXUS application on Vercel. Due to Vercel's serverless architecture, we'll need to handle the backend differently than a traditional Express server.

## Architecture Options

### Option 1: Frontend on Vercel + Backend on Separate Platform (Recommended)

**Frontend (Vercel):**
- Deploy the React client to Vercel
- Set environment variables in Vercel dashboard

**Backend (Separate Platform):**
- Deploy Express backend to Railway, Render, or Heroku
- Update frontend API URLs to point to backend URL

### Option 2: Full Vercel Deployment (Serverless Functions)

Convert Express routes to Vercel serverless functions in `/api` directory.

## Option 1: Recommended Deployment (Hybrid)

### Step 1: Deploy Backend First

1. **Deploy to Railway/Render/Heroku:**
   - Push your `server/` directory to a new repository or use the same repo
   - Connect to Railway/Render/Heroku
   - Set all environment variables
   - Get your backend URL (e.g., `https://plexus-api.railway.app`)

2. **Update CORS in backend:**
   ```javascript
   app.use(cors({
     origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'],
     credentials: true 
   }));
   ```

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Navigate to project root:**
   ```bash
   cd /path/to/plexus-app
   ```

4. **Deploy:**
   ```bash
   vercel
   ```

5. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.com
     REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
     REACT_APP_FACEBOOK_CLIENT_ID=your_facebook_client_id
     REACT_APP_REDIRECT_URI=https://your-vercel-app.vercel.app/auth/callback
     ```

6. **Update OAuth Redirect URIs:**
   - Google Console: Add `https://your-vercel-app.vercel.app/auth/callback`
   - Facebook App: Add `https://your-vercel-app.vercel.app/auth/callback`

### Step 3: Update vercel.json

The `vercel.json` is already configured to:
- Build the React app from `client/` directory
- Serve static files from `build/` directory
- Route API calls (if you add serverless functions later)

## Option 2: Full Vercel Deployment (Advanced)

If you want everything on Vercel, you'll need to convert Express routes to serverless functions.

### Structure:
```
/
├── api/
│   ├── auth/
│   │   ├── google.js
│   │   ├── facebook.js
│   │   ├── refresh.js
│   │   └── logout.js
│   ├── user/
│   │   └── me.js
│   └── recommendations.js
├── client/
└── vercel.json
```

### Example Serverless Function (`api/auth/google.js`):
```javascript
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../../server/models/User');

// Connect to MongoDB (connection pooling recommended)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  cachedDb = await mongoose.connect(process.env.MONGO_URI);
  return cachedDb;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectToDatabase();
  
  // Your existing Google OAuth logic here
  // ...
  
  res.status(200).json({ message: 'Login successful', accessToken });
};
```

## Environment Variables Checklist

### Frontend (Vercel):
- `REACT_APP_API_URL` - Your backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `REACT_APP_FACEBOOK_CLIENT_ID` - Facebook App ID
- `REACT_APP_REDIRECT_URI` - OAuth callback URL

### Backend (Railway/Render/Heroku):
- `MONGO_URI` - MongoDB connection string
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `FACEBOOK_CLIENT_ID` - Facebook App ID
- `FACEBOOK_CLIENT_SECRET` - Facebook App Secret
- `FACEBOOK_REDIRECT_URI` - OAuth callback URL
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `JWT_ACCESS_EXPIRATION` - Access token expiration (e.g., "15m")
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration (e.g., "7d")
- `PORT` - Server port (usually auto-set by platform)

## Quick Deploy Commands

### Deploy to Vercel:
```bash
# First time
vercel

# Production deployment
vercel --prod

# With environment variables
vercel --prod --env REACT_APP_API_URL=https://your-api.com
```

## Troubleshooting

### CORS Issues:
- Make sure backend CORS includes your Vercel domain
- Check that `credentials: true` is set

### Cookie Issues:
- Vercel uses HTTPS, so cookies should work
- Ensure `sameSite: 'none'` and `secure: true` for cross-origin cookies
- Update cookie settings in backend for production

### Environment Variables:
- Variables must start with `REACT_APP_` to be accessible in React
- Redeploy after adding new environment variables

### Build Errors:
- Check Node.js version (Vercel uses 18.x by default)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

## Recommendation System

The recommendation backend (`plexus-recommender-hub`) should be deployed separately:
- Deploy to Railway/Render/Heroku
- Update the main backend's recommendation proxy URL
- Or convert to Vercel serverless functions

## Post-Deployment Checklist

- [ ] Test Google OAuth login
- [ ] Test Facebook OAuth login
- [ ] Verify protected routes work
- [ ] Check token refresh functionality
- [ ] Test recommendations feature
- [ ] Verify cookies are set correctly
- [ ] Check CORS headers
- [ ] Test on mobile devices
- [ ] Verify HTTPS is working
- [ ] Check error handling

## Notes

- Vercel has a 10-second timeout for serverless functions (Hobby plan)
- For longer operations, consider upgrading or using background jobs
- MongoDB connection pooling is important for serverless functions
- Consider using Vercel Edge Functions for better performance

