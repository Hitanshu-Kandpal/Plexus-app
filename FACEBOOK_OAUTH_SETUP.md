# Facebook OAuth Setup Guide

This document explains how to set up Facebook OAuth login alongside the existing Google OAuth implementation.

## Overview

The system now supports both Google and Facebook OAuth login with:
- **Provider Linking**: If a user logs in with Facebook using the same email as an existing Google account, both providers are linked to the same user account
- **Security**: Same security model as Google (state + nonce for CSRF protection, though Facebook doesn't support PKCE)
- **Unlinking**: Users can unlink providers from their profile page (must keep at least one provider linked)

## Environment Variables

### Server (.env)

Add these variables to your `server/.env` file:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Client (.env)

Add these variables to your `client/.env` file:

```env
# Facebook OAuth
REACT_APP_FACEBOOK_CLIENT_ID=your_facebook_app_id
REACT_APP_FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Facebook App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing app
3. Add "Facebook Login" product to your app
4. Configure OAuth Redirect URIs:
   - Add `http://localhost:3000/auth/callback` for development
   - Add your production URL for production
5. Get your **App ID** and **App Secret** from Settings → Basic
6. Add the App ID and App Secret to your `.env` files

### Required Permissions

The app requests these Facebook permissions:
- `email` - User's email address
- `public_profile` - User's basic profile information (name, profile picture)

## Architecture

### Backend Routes

1. **POST `/auth/facebook`**
   - Receives authorization code, state, and nonce from frontend
   - Exchanges code for Facebook access token
   - Fetches user profile from Facebook Graph API
   - Validates state (CSRF protection)
   - Finds or creates user, linking providers if email matches
   - Returns JWT access token and sets refresh token cookie

2. **POST `/api/user/unlink-provider`**
   - Allows users to unlink a provider (Google or Facebook)
   - Requires at least one provider to remain linked
   - Protected by authentication and CSRF tokens

### Frontend Components

1. **LoginPage**
   - Added "Continue with Facebook" button
   - Handles Facebook OAuth initiation with state + nonce

2. **AuthCallbackPage**
   - Updated to handle both Google and Facebook callbacks
   - Detects provider from sessionStorage and routes to appropriate backend endpoint

3. **ProfilePage**
   - Shows linked providers (Google/Facebook)
   - Allows unlinking providers with confirmation dialog
   - Prevents unlinking if it's the only provider

## User Flow

### New User with Facebook
1. User clicks "Continue with Facebook"
2. Redirected to Facebook OAuth screen
3. User authorizes the app
4. Facebook redirects back with authorization code
5. Backend creates new user account
6. User is logged in

### Existing User Linking Facebook
1. User logs in with Google (email: user@example.com)
2. Later, user logs in with Facebook (same email: user@example.com)
3. Backend detects email match
4. Links Facebook provider to existing Google user account
5. User can now login with either provider

### Unlinking Provider
1. User goes to Profile page
2. Sees linked providers section
3. Clicks unlink icon on a provider
4. Confirmation dialog appears
5. User confirms
6. Provider is unlinked (if at least one other provider remains)

## Security Features

- **State Parameter**: Prevents CSRF attacks
- **Nonce**: Prevents replay attacks (validated on backend)
- **Email Matching**: Secure provider linking based on verified email addresses
- **Minimum Provider Requirement**: Users must keep at least one provider linked

## Database Schema

The User model now includes:

```javascript
providers: {
  googleId: String,
  googleEmail: String,
  facebookId: String,
  facebookEmail: String
}
```

## Testing

1. **Test Facebook Login**:
   - Click "Continue with Facebook" on login page
   - Complete Facebook OAuth flow
   - Verify user is logged in

2. **Test Provider Linking**:
   - Login with Google using email: test@example.com
   - Logout
   - Login with Facebook using same email: test@example.com
   - Verify both providers are linked in profile page

3. **Test Unlinking**:
   - With both providers linked, try to unlink one
   - Verify unlinking works
   - Try to unlink the last provider (should be disabled)

## Notes

- Facebook OAuth doesn't support PKCE, so we use state + nonce for security
- The nonce is validated on the backend (though Facebook doesn't return it in the profile)
- Provider linking is based on email matching (case-insensitive)
- Users must have at least one provider linked at all times

