import React, { useState } from 'react';
import { createPkceChallenge, generateState, generateNonce } from '../pkceHelper';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme as useMUITheme,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { styled } from '@mui/material/styles';

const GlassCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: '48px 40px',
  borderRadius: '32px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    : '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s linear infinite',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  padding: '16px 32px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '14px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
  backgroundSize: '200% 200%',
  color: '#ffffff',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 24px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0)'
    : '0 8px 24px rgba(79, 70, 229, 0.3), 0 0 0 0 rgba(79, 70, 229, 0)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 32px rgba(99, 102, 241, 0.5), 0 0 0 4px rgba(99, 102, 241, 0.1)'
      : '0 12px 32px rgba(79, 70, 229, 0.4), 0 0 0 4px rgba(79, 70, 229, 0.1)',
    backgroundPosition: '100% 50%',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-2px) scale(1)',
  },
}));

const BackgroundGradient = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(236, 72, 153, 0.1) 0%, transparent 50%), #0f172a'
    : 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(236, 72, 153, 0.05) 0%, transparent 50%), #f8fafc',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: theme.palette.mode === 'dark'
      ? 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
    animation: 'pulse 8s ease-in-out infinite',
  },
}));

const FloatingShape = styled(Box)(({ theme, delay }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  filter: 'blur(40px)',
  animation: `float 20s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translate(0, 0) scale(1)',
    },
    '33%': {
      transform: 'translate(30px, -30px) scale(1.1)',
    },
    '66%': {
      transform: 'translate(-20px, 20px) scale(0.9)',
    },
  },
}));

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mode } = useTheme();
  const theme = useMUITheme();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { verifier, challenge } = await createPkceChallenge();
      const state = generateState();
      const nonce = generateNonce();

      localStorage.setItem('pkce_code_verifier', verifier);
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_nonce', nonce);

      const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const REDIRECT_URI = 'http://localhost:3000/auth/callback';
      const SCOPE = 'profile email';

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

      window.location.href = authUrl;
    } catch (err) {
      console.error('Error during Google login', err);
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackgroundGradient>
        <FloatingShape
          sx={{ width: 300, height: 300, top: '10%', left: '10%' }}
          delay={0}
        />
        <FloatingShape
          sx={{ width: 200, height: 200, top: '60%', right: '15%' }}
          delay={5}
        />
        <FloatingShape
          sx={{ width: 250, height: 250, bottom: '10%', left: '20%' }}
          delay={10}
        />
      </BackgroundGradient>

      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          py: 4,
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ width: '100%' }}>
            <Grow in timeout={1000}>
              <GlassCard className="fade-in">
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
                        : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 2,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      fontSize: '17px',
                      fontWeight: 400,
                    }}
                  >
                    Sign in to continue to your account
                  </Typography>
                </Box>

                <Box sx={{ mt: 5 }}>
                  <GradientButton
                    fullWidth
                    variant="contained"
                    startIcon={<GoogleIcon sx={{ fontSize: 24 }} />}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    sx={{
                      '& .MuiButton-startIcon': {
                        marginRight: 1.5,
                      },
                    }}
                  >
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </GradientButton>
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      fontSize: '13px',
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    Secure authentication powered by OAuth 2.0
                  </Typography>
                </Box>
              </GlassCard>
            </Grow>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default LoginPage;
