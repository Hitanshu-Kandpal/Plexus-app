import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  useTheme as useMUITheme,
  alpha,
  Fade,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { styled } from '@mui/material/styles';

const LoadingCard = styled(Box)(({ theme }) => ({
  padding: '48px',
  borderRadius: '24px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
  backdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.5)'
    : '0 20px 60px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
}));

const AuthCallbackPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useMUITheme();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        // Get provider from sessionStorage (set during login initiation)
        const provider = sessionStorage.getItem('oauth_provider') || 'google';
        const savedState = sessionStorage.getItem('oauth_state');
        const savedNonce = sessionStorage.getItem('oauth_nonce');

        // Validate state (CSRF protection)
        if (!state || !savedState || state !== savedState) {
          localStorage.removeItem('pkce_code_verifier');
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_nonce');
          sessionStorage.removeItem('oauth_provider');
          throw new Error('Invalid state. Login CSRF attack suspected.');
        }

        // Clear state after validation
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_provider');

        if (!code) {
          throw new Error('Missing authorization code.');
        }

        let res;
        
        if (provider === 'google') {
          // Google OAuth with PKCE
          const verifier = localStorage.getItem('pkce_code_verifier');
          if (!verifier) {
            throw new Error('Missing PKCE verifier.');
          }
          localStorage.removeItem('pkce_code_verifier');

          const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000');
          res = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, verifier: verifier, nonce: savedNonce }),
            credentials: 'include',
          });
        } else if (provider === 'facebook') {
          // Facebook OAuth (no PKCE, uses state + nonce)
          const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000');
          res = await fetch(`${apiUrl}/auth/facebook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, state: state, nonce: savedNonce }),
            credentials: 'include',
          });
        } else {
          throw new Error('Unknown OAuth provider.');
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Login failed on server.');
        }

        const data = await res.json();
        login(data.accessToken);

        const targetLocation = sessionStorage.getItem('preLoginLocation');
        sessionStorage.removeItem('preLoginLocation');
        sessionStorage.removeItem('oauth_nonce');

        setTimeout(() => {
          navigate(targetLocation || '/profile');
        }, 1000);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
        localStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_nonce');
        sessionStorage.removeItem('oauth_provider');
        sessionStorage.removeItem('preLoginLocation');
      }
    };

    if (!location.search.includes('processed')) {
      handleAuthCallback();
      navigate(location.pathname + location.search + '&processed=true', { replace: true });
    }
  }, [location, navigate, login]);

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Fade in timeout={600}>
            <LoadingCard>
              <ErrorIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 3,
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Authentication Failed
              </Typography>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  textAlign: 'left',
                }}
              >
                {error}
              </Alert>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Please try logging in again.
              </Typography>
            </LoadingCard>
          </Fade>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in timeout={600}>
          <LoadingCard>
            <CircularProgress
              size={64}
              sx={{
                color: theme.palette.primary.main,
                mb: 3,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
                  : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Authenticating...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we log you in securely.
            </Typography>
          </LoadingCard>
        </Fade>
      </Box>
    </Container>
  );
};

export default AuthCallbackPage;
