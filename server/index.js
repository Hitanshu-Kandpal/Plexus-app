const dotenv = require('dotenv');
dotenv.config(); // Must be at the very top

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const csrf = require('csurf');
const axios = require('axios'); // <-- Our new http client
const { protect, admin } = require('./middleware/authMiddleware');
const User = require('./models/User');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3000'],
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
// --- Removed passport.initialize() ---

// General rate limiter for most routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // Limit each IP to 10 auth-related requests per window
  message: 'Too many authentication attempts, please try again after 30 minutes',
});

// Apply the general limiter to all routes starting with /api
app.use('/api', apiLimiter);

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch((error) => console.error("❌ Error connecting to MongoDB:", error.message));

// --- Basic Test Route ---
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the Nimbus server!" });
});


// ===================================
// ===     MANUAL PKCE AUTH        ===
// ===================================
const googleAuthValidation = [
  authLimiter,
  body('code').notEmpty().isString().withMessage('Authorization code must be a non-empty string'),
  body('verifier').notEmpty().isString().withMessage('PKCE verifier must be a non-empty string'),
  body('nonce').notEmpty().isString().withMessage('Nonce must be a non-empty string') // <-- ADD THIS
];

app.post('/auth/google', googleAuthValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { code, verifier, nonce } = req.body;

  if (!code || !verifier || !nonce) { // <-- 2. Update check
    return res.status(400).json({ message: 'Code, verifier, and nonce are required.' });
  }

  try {
    // --- 1. Exchange the code for tokens (Same as before) ---
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        code_verifier: verifier,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3000/auth/callback',
      },
    });

    const { id_token } = tokenResponse.data;

    // --- 2. Get user profile (Same as before) ---
    const profile = jwt.decode(id_token);
    if (!profile) {
      return res.status(400).json({ message: 'Invalid ID token' });
    }

    // --- 3. VALIDATE NONCE (CRITICAL!) ---
    if (profile.nonce !== nonce) {
      return res.status(401).json({ message: 'Invalid nonce. Replay attack suspected.' });
    }

    // --- 4. Find or Create User (with provider linking) ---
    let user = await User.findOne({ 'providers.googleId': profile.sub });
    
    if (!user) {
      // Check if user exists with same email (for provider linking)
      user = await User.findOne({ email: profile.email.toLowerCase() });
      
      if (user) {
        // Link Google provider to existing user
        user.providers.googleId = profile.sub;
        if (!user.providers.googleEmail) {
          user.providers.googleEmail = profile.email;
        }
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: profile.email,
          name: profile.name,
          providers: { 
            googleId: profile.sub,
            googleEmail: profile.email
          }
        });
        await user.save();
      }
    }

    // --- 5. CREATE *TWO* JWTs (This is the new part) ---
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    // Create the Access Token (15 minutes)
    const accessToken = jwt.sign(
      userPayload, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    // Create the Refresh Token (7 days)
    const refreshToken = jwt.sign(
      userPayload, // You can have a simpler payload for the refresh token
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    // --- 6. Set the REFRESH token as an httpOnly cookie ---
    // We rename the cookie to 'refreshToken'
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true if on HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (must match token expiry)
    });

    // --- 7. Send the ACCESS token in the JSON response ---
    res.status(200).json({ 
      message: 'Login successful',
      accessToken: accessToken // Send the access token to the client
    });

  } catch (err) {
    console.error('Error during Google auth:', err.response ? err.response.data : err.message);
    res.status(500).json({ message: 'Authentication failed.' });
  }
});


// ===================================
// ===     FACEBOOK OAUTH AUTH     ===
// ===================================
// Note: Facebook doesn't support PKCE, so we use state + nonce for security
const facebookAuthValidation = [
  authLimiter,
  body('code').notEmpty().isString().withMessage('Authorization code must be a non-empty string'),
  body('state').notEmpty().isString().withMessage('State must be a non-empty string'),
  body('nonce').notEmpty().isString().withMessage('Nonce must be a non-empty string')
];

app.post('/auth/facebook', facebookAuthValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { code, state, nonce } = req.body;

  if (!code || !state || !nonce) {
    return res.status(400).json({ message: 'Code, state, and nonce are required.' });
  }

  try {
    // --- 1. Exchange the code for access token ---
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/auth/callback',
      },
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ message: 'Failed to get access token from Facebook' });
    }

    // --- 2. Fetch user profile from Facebook Graph API ---
    const profileResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token: access_token,
        fields: 'id,name,email,picture',
      },
    });

    const profile = profileResponse.data;

    if (!profile || !profile.id) {
      return res.status(400).json({ message: 'Failed to fetch user profile from Facebook' });
    }

    // --- 3. Validate state (CSRF protection) ---
    // State validation should be done on frontend, but we verify it's present
    if (!state) {
      return res.status(401).json({ message: 'Invalid state. CSRF attack suspected.' });
    }

    // Note: Facebook doesn't return nonce in profile, so we validate it was sent
    // In a production app, you might store nonce server-side and validate it here

    // --- 4. Find or Create User (with provider linking) ---
    let user = await User.findOne({ 'providers.facebookId': profile.id });
    
    if (!user) {
      // Check if user exists with same email (for provider linking)
      if (profile.email) {
        user = await User.findOne({ email: profile.email.toLowerCase() });
      }
      
      if (user) {
        // Link Facebook provider to existing user
        user.providers.facebookId = profile.id;
        if (profile.email && !user.providers.facebookEmail) {
          user.providers.facebookEmail = profile.email;
        }
        await user.save();
      } else {
        // Create new user
        if (!profile.email) {
          return res.status(400).json({ message: 'Email is required but not provided by Facebook' });
        }
        user = new User({
          email: profile.email,
          name: profile.name,
          providers: { 
            facebookId: profile.id,
            facebookEmail: profile.email
          }
        });
        await user.save();
      }
    }

    // --- 5. CREATE JWTs (same as Google flow) ---
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    // Create the Access Token (15 minutes)
    const accessToken = jwt.sign(
      userPayload, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    // Create the Refresh Token (7 days)
    const refreshToken = jwt.sign(
      userPayload,
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    // --- 6. Set the REFRESH token as an httpOnly cookie ---
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true if on HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // --- 7. Send the ACCESS token in the JSON response ---
    res.status(200).json({ 
      message: 'Login successful',
      accessToken: accessToken
    });

  } catch (err) {
    console.error('Error during Facebook auth:', err.response ? err.response.data : err.message);
    res.status(500).json({ message: 'Authentication failed.' });
  }
});

// ===================================
// ===   RECOMMENDATIONS ROUTE      ===
// ===================================
// Proxy route for secure personalized recommendations
// Placed before CSRF middleware since it uses JWT auth
app.post('/api/recommendations', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    // Forward to recommender backend
    const recommenderUrl = process.env.RECOMMENDER_API_URL || 'http://localhost:4000';
    const resp = await axios.post(`${recommenderUrl}/api/recommend`, req.body, {
      headers: { 'x-user-id': userId }
    });
    return res.json(resp.data);
  } catch (err) {
    console.error('Rec API error:', err?.response?.data || err.message);
    res.status(500).json({ 
      error: 'Recommendation service failure.',
      details: err?.response?.data || err.message 
    });
  }
});

// ===================================
// ===   CSRF & PROTECTED ROUTES   ===
// ===================================
// We initialize CSRF protection *after* our auth routes
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// --- 3. The "Me" (Check Auth) Route ---
// This route is protected by 'protect' and 'csrfProtection'
app.get('/api/user/me', protect, async (req, res) => {
  try {
    // Fetch full user from DB to get provider info
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      providers: user.providers, // Include provider info
      csrfToken: req.csrfToken() // Send the CSRF token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===================================
// ===     REFRESH TOKEN ROUTE     ===
// ===================================
// This route is protected by CSRF but not 'protect'
// It does its own JWT verification.
app.post('/auth/refresh', authLimiter, (req, res) => {
  // 1. Get the refresh token from the httpOnly cookie
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided.' });
  }

  try {
    // 2. Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // 3. The token is valid, so create a new *access* token
    const userPayload = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

    const newAccessToken = jwt.sign(
      userPayload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    // 4. Send the new access token (and a new CSRF token)
    // The client will need a new CSRF token for its *next* request
    res.status(200).json({
      message: 'Access token refreshed',
      accessToken: newAccessToken,
      csrfToken: req.csrfToken() // Send a new CSRF token
    });

  } catch (err) {
    // If the refresh token is invalid or expired
    console.error('Error refreshing token:', err.message);
    return res.status(403).json({ message: 'Invalid refresh token.' });
  }
});

// --- 4. The "Admin-Only" Route ---
// Also protected by both
app.get('/api/admin/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 5. The "Logout" Route ---
app.post('/auth/logout', authLimiter, protect, (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// --- 6. Unlink Provider Route ---
app.post('/api/user/unlink-provider', authLimiter, protect, async (req, res) => {
  const { provider } = req.body; // 'google' or 'facebook'

  if (!provider || !['google', 'facebook'].includes(provider)) {
    return res.status(400).json({ message: 'Invalid provider. Must be "google" or "facebook"' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has at least one other provider
    const hasGoogle = user.providers?.googleId;
    const hasFacebook = user.providers?.facebookId;

    if (provider === 'google' && !hasFacebook) {
      return res.status(400).json({ 
        message: 'Cannot unlink Google. You must have at least one linked provider.' 
      });
    }

    if (provider === 'facebook' && !hasGoogle) {
      return res.status(400).json({ 
        message: 'Cannot unlink Facebook. You must have at least one linked provider.' 
      });
    }

    // Unlink the provider
    if (provider === 'google') {
      user.providers.googleId = undefined;
      user.providers.googleEmail = undefined;
    } else {
      user.providers.facebookId = undefined;
      user.providers.facebookEmail = undefined;
    }

    await user.save();

    res.status(200).json({ 
      message: `${provider} provider unlinked successfully`,
      providers: user.providers
    });
  } catch (err) {
    console.error('Error unlinking provider:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});