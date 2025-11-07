⚡ PLEXUS — AI-Powered Social Login Platform (MERN + OAuth2 + PKCE + Supabase + Gemini)

Production-grade social login system with AI recommendations
OAuth2 (Google + Facebook), PKCE, JWT w/ httpOnly cookies, CSRF protection, Supabase logging, and Gemini-powered recommendations.

<br/>
🚀 Features
Category	Features
🔐 Authentication	Google OAuth2 + PKCE, Facebook OAuth2, JWT Auth + Refresh, HttpOnly Cookies
🧠 AI Layer	Gemini insights + Recommendations (Movies / Books / Music)
🗄️ Database	MongoDB + Supabase search history
🛡️ Security	PKCE, CSRF, Rate-Limiting, Role-based access, Refresh Token Rotation
👤 User System	Profile, provider linking, admin panel, secure logout
🎨 UI/UX	Cyberpunk UI, neon effects, protected routes, animations
🧩 Architecture	Microservice rec engine + MERN auth app
<br/>
🏗️ System Architecture
React (PKCE + Token Storage)
        ↓
Express Auth Server
 - Google OAuth2 w PKCE
 - Facebook OAuth2
 - JWT Access + Refresh cookies
 - CSRF Tokens
        ↓
MongoDB (User + Providers)
        ↓
Recommender Microservice 🔥
 TMDB / Spotify / Books API + Gemini AI
        ↓
Supabase (Analytics + Search Logs)

<br/>
🧠 Tech Stack
Tier	Tech
Frontend	React, MUI, Axios, Context API, PKCE
Backend	Node.js, Express, JWT, CSRF, Rate-Limiter
Database	MongoDB, Supabase
APIs	Google OAuth2, Facebook OAuth2, Gemini AI, TMDB, Spotify, Google Books
Security	PKCE, HttpOnly Refresh Cookies, CSRF, CORS, Input Validation
<br/>
✅ Key Highlights
🔑 PKCE Flow for Google

Code verifier + challenge generation

State & Nonce validation

Secure token exchange via backend only

Mitigates auth-code interception

🍪 OAuth Token Strategy
Token	Storage	Lifetime	Security
Access Token	Memory	15 min	Short-life, rotating
Refresh Token	HttpOnly Cookie	7 days	CSRF-protected
🧠 Personalized AI Recommendations

TMDB / Spotify / Google Books fetch

Gemini analysis & summary

Saved search history per user in Supabase

<br/>
💾 Database Schema (MongoDB)
{
 email: String,
 name: String,
 role: "user" | "admin",
 providers: {
   googleId: String,
   facebookId: String
 }
}

🪪 Supabase Schema
user_id TEXT,
query TEXT,
category ENUM ('movie','music','book'),
ai_insight TEXT,
created_at TIMESTAMP

<br/>
🖥️ Screenshots
Login	Dashboard	Recommendations	Admin
✨ Cyberpunk Google Login	✅ User Info	🤖 AI Insights + Recs	🛠️ User Management

(Add images later — placeholder)

<br/>
🛠️ Setup
1️⃣ Client Env (client/.env)
REACT_APP_GOOGLE_CLIENT_ID=xxx
REACT_APP_FACEBOOK_CLIENT_ID=xxx

2️⃣ Server Env (server/.env)
MONGO_URI=xxxx
GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
FACEBOOK_CLIENT_ID=xxxx
FACEBOOK_CLIENT_SECRET=xxxx
JWT_ACCESS_SECRET=xxxx
JWT_REFRESH_SECRET=xxxx

3️⃣ Recommender Env
SUPABASE_URL=xxxx
SUPABASE_SERVICE_KEY=xxxx
GEMINI_API_KEY=xxxx

<br/>
🧪 Run Locally
# Frontend
cd client
npm install
npm start

# Backend
cd server
npm install
npm run dev

# Recommender
cd plexus-recommender-hub/server
npm install
npm start

<br/>
🚨 Security Highlights

✅ PKCE + State + Nonce

✅ HttpOnly Refresh cookies

✅ Rotating JWTs

✅ CSRF tokens

✅ Rate-limiting

✅ Input validation

✅ No tokens in localStorage (memory only)

<br/>
🎤 Viva Defense 🔥

Plexus implements enterprise-grade OAuth security, PKCE flow, dual-token architecture, and integrates AI recommendation microservices with secure session handling and Supabase logging.

If faculty asks:
"Why PKCE?"

Prevents intercepted code being used

Enforces client-side integrity

Required for public SPAs

"Why HttpOnly refresh cookies?"

Protects token from XSS

Server-controlled refresh logic

"Why Supabase?"

Cloud SQL + Analytics logging

Handles rec logs without overloading main DB

<br/>
📈 Future Enhancements

WebSockets for streaming AI chat

Redis session cache

MFA login

Email notification system

Analytics dashboard

<br/>
🏁 Final Words

This project demonstrates:

✔ Secure enterprise-grade auth
✔ AI recommendations & microservices
✔ Cyberpunk animated UI
✔ Production-ready code & architecture

If you're reading this repo thinking

"Bro is cooking a startup"

You're damn right 💀🔮
