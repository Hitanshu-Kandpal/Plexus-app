import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import FacebookIcon from '@mui/icons-material/Facebook';
import { styled, keyframes } from '@mui/material/styles';

const neonGlow = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 10px rgba(0, 255, 255, 0.5),
      0 0 20px rgba(0, 255, 255, 0.3),
      inset 0 0 10px rgba(0, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(255, 0, 128, 0.5),
      inset 0 0 20px rgba(0, 255, 255, 0.2);
  }
`;

const neonGlowLight = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 10px rgba(0, 170, 255, 0.4),
      0 0 20px rgba(0, 170, 255, 0.2),
      inset 0 0 10px rgba(0, 170, 255, 0.05);
  }
  50% {
    box-shadow: 
      0 0 20px rgba(0, 170, 255, 0.6),
      0 0 40px rgba(204, 0, 102, 0.3),
      inset 0 0 20px rgba(0, 170, 255, 0.1);
  }
`;

const CyberCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: '56px 48px',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.9) 0%, rgba(10, 10, 26, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.98) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.5)'
    : '2px solid rgba(0, 170, 255, 0.4)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 255, 255, 0.2), inset 0 0 60px rgba(0, 255, 255, 0.05)'
    : '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 170, 255, 0.15), inset 0 0 60px rgba(0, 170, 255, 0.03)',
  overflow: 'hidden',
  animation: theme.palette.mode === 'dark' 
    ? `${neonGlow} 3s ease-in-out infinite`
    : `${neonGlowLight} 3s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), rgba(255, 0, 128, 0.8), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(0, 170, 255, 0.6), rgba(204, 0, 102, 0.6), transparent)',
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  padding: '18px 36px',
  fontSize: '16px',
  fontWeight: 700,
  borderRadius: '8px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(0, 170, 255, 0.2) 0%, rgba(0, 170, 255, 0.15) 100%)',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#0066cc',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.6)'
    : '2px solid rgba(0, 170, 255, 0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  fontFamily: "'Courier New', monospace",
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transform: 'translateY(-4px)',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 255, 255, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(0, 170, 255, 0.35) 0%, rgba(0, 170, 255, 0.25) 100%)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 10px 30px rgba(0, 255, 255, 0.6), 0 0 0 3px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.4)'
      : '0 10px 30px rgba(0, 170, 255, 0.4), 0 0 0 3px rgba(0, 170, 255, 0.2), 0 0 40px rgba(0, 170, 255, 0.3)',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.9)' : 'rgba(0, 170, 255, 0.7)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-2px)',
  },
}));

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mode } = useTheme();
  const theme = useMUITheme();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { verifier, challenge } = await createPkceChallenge();
      const state = generateState();
      const nonce = generateNonce();

      localStorage.setItem('pkce_code_verifier', verifier);
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_nonce', nonce);
      sessionStorage.setItem('oauth_provider', 'google');

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

  const handleFacebookLogin = async () => {
    navigate('/facebook-unavailable');
  };

  return (
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
      <Fade in timeout={1000}>
        <Box sx={{ width: '100%' }}>
          <Grow in timeout={1500}>
            <CyberCard>
              <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    letterSpacing: '0.1em',
                    fontSize: { xs: '32px', sm: '48px' },
                    color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                    textShadow: mode === 'dark'
                      ? '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
                      : '0 0 15px rgba(0, 170, 255, 0.6), 0 0 30px rgba(0, 170, 255, 0.3)',
                    fontFamily: "'Courier New', monospace",
                    textTransform: 'uppercase',
                  }}
                >
                  Welcome
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '18px',
                    mb: 5,
                    color: mode === 'dark' ? '#00ffff' : '#0066cc',
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                  }}
                >
                  Initialize Connection
                </Typography>

                <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <NeonButton
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
                    {isLoading ? 'Connecting...' : 'Connect with Google'}
                  </NeonButton>

                  <NeonButton
                    fullWidth
                    variant="contained"
                    startIcon={<FacebookIcon sx={{ fontSize: 24 }} />}
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                    sx={{
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255, 0, 128, 0.15) 0%, rgba(255, 0, 128, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(204, 0, 102, 0.2) 0%, rgba(204, 0, 102, 0.15) 100%)',
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 0, 128, 0.6)' : 'rgba(204, 0, 102, 0.5)',
                      color: theme.palette.mode === 'dark' ? '#ffffff' : '#cc0066',
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(255, 0, 128, 0.3) 0%, rgba(255, 0, 128, 0.2) 100%)'
                          : 'linear-gradient(135deg, rgba(204, 0, 102, 0.35) 0%, rgba(204, 0, 102, 0.25) 100%)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 10px 30px rgba(255, 0, 128, 0.6), 0 0 0 3px rgba(255, 0, 128, 0.3), 0 0 40px rgba(255, 0, 128, 0.4)'
                          : '0 10px 30px rgba(204, 0, 102, 0.4), 0 0 0 3px rgba(204, 0, 102, 0.2), 0 0 40px rgba(204, 0, 102, 0.3)',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 0, 128, 0.9)' : 'rgba(204, 0, 102, 0.7)',
                      },
                      '& .MuiButton-startIcon': {
                        marginRight: 1.5,
                      },
                    }}
                  >
                    {isLoading ? 'Connecting...' : 'Connect with Facebook'}
                  </NeonButton>
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: mode === 'dark' ? '2px solid rgba(0, 255, 255, 0.3)' : '2px solid rgba(0, 170, 255, 0.2)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 42, 0.6)',
                      fontSize: '12px',
                      display: 'block',
                      textAlign: 'center',
                      fontFamily: "'Courier New', monospace",
                      letterSpacing: '0.15em',
                    }}
                  >
                    Secure Authentication Protocol v2.0
                  </Typography>
                </Box>
              </Box>
            </CyberCard>
          </Grow>
        </Box>
      </Fade>
    </Container>
  );
};

export default LoginPage;
