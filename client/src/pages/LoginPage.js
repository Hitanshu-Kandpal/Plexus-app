import React from 'react';
// --- 1. Import generateState ---
import { createPkceChallenge, generateState, generateNonce } from '../pkceHelper';
// --- 1. Import MUI components ---
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import GoogleIcon from '@mui/icons-material/Google'; // Google icon


const LoginPage = () => {
  const handleGoogleLogin = async () => {
    try {
      // --- 2. Generate both PKCE and state ---
      const { verifier, challenge } = await createPkceChallenge();
      const state = generateState(); 
      const nonce = generateNonce(); 

      // --- 3. Save *both* to storage ---
      // Use sessionStorage so it's cleared when the browser tab closes
      localStorage.setItem('pkce_code_verifier', verifier);
      sessionStorage.setItem('oauth_state', state); 
      sessionStorage.setItem('oauth_nonce', nonce);

      // --- 4. Define Google OAuth 2.0 parameters ---
      const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const REDIRECT_URI = 'http://localhost:3000/auth/callback';
      const SCOPE = 'profile email';

      // --- 5. Manually build the authorization URL (add state) ---
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(SCOPE)}` +
        `&code_challenge=${challenge}` +
        `&code_challenge_method=S256` +
        `&state=${state}` +
        `&nonce=${nonce}` +
        `&access_type=offline` +
        `&prompt=consent`;

      // --- 6. Redirect the user ---
      window.location.href = authUrl;

    } catch (err) {
      console.error('Error during Google login', err);
    }
  };

  // --- 2. Use MUI components for the UI ---
  return (
    <Container 
      component="main" 
      maxWidth="xs" // Sets a small, fixed width for the login box
      sx={{ // 'sx' is how you add custom styles in MUI
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh', // Center vertically
      }}
    >
      <Paper 
        elevation={3} // Adds a nice shadow
        sx={{
          padding: 4, // '4' means 4 * 8px = 32px
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          OAuth 2.0 Login
        </Typography>
        <Typography component="p" variant="body1">
          Sign in to continue
        </Typography>

        <Box sx={{ mt: 3, width: '100%' }}>
          <Button
            fullWidth // Makes the button fill the width
            variant="contained" // Gives it the solid blue background
            startIcon={<GoogleIcon />} // Adds the icon
            onClick={handleGoogleLogin}
            sx={{
              padding: '10px',
              fontSize: '1rem',
            }}
          >
            Continue with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;