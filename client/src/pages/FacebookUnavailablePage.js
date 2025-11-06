import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme as useMUITheme,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Particle animation
const float = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  33% {
    transform: translate(30px, -30px) scale(1.2);
    opacity: 0.8;
  }
  66% {
    transform: translate(-20px, 20px) scale(0.8);
    opacity: 0.4;
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3);
  }
`;

const BackgroundGradient = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(ellipse at top, rgba(0, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0, 200, 255, 0.1) 0%, transparent 50%), #0a0e27'
    : 'radial-gradient(ellipse at top, rgba(0, 255, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0, 200, 255, 0.05) 0%, transparent 50%), #f0f9ff',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 200, 255, 0.03) 2px, rgba(0, 200, 255, 0.03) 4px)
    `,
    pointerEvents: 'none',
  },
}));

const SparkParticle = styled(Box)(({ delay, left, top }) => ({
  position: 'absolute',
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(0, 255, 255, 0.8), rgba(0, 200, 255, 0.4))',
  left: `${left}%`,
  top: `${top}%`,
  animation: `${float} ${8 + Math.random() * 4}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  filter: 'blur(1px)',
  boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
}));

const GlassCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: '56px 48px',
  borderRadius: '32px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(10, 14, 39, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.9) 100%)',
  backdropFilter: 'blur(30px) saturate(180%)',
  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.3)'
    : '2px solid rgba(0, 200, 255, 0.2)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 255, 255, 0.1), inset 0 0 60px rgba(0, 255, 255, 0.05)'
    : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 200, 255, 0.1), inset 0 0 60px rgba(0, 255, 255, 0.03)',
  overflow: 'hidden',
  animation: `${glow} 3s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #00ffff, #00c8ff, #00ffff)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s linear infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)',
    animation: `${float} 20s ease-in-out infinite`,
    pointerEvents: 'none',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #00ffff 0%, #00c8ff 50%, #00ffff 100%)'
    : 'linear-gradient(135deg, #0066cc 0%, #00aaff 50%, #0066cc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  backgroundSize: '200% 200%',
  animation: 'shimmer 3s linear infinite',
  filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))',
}));

const GlowButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  padding: '16px 32px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '14px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 200, 255, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(0, 102, 204, 0.15) 0%, rgba(0, 170, 255, 0.1) 100%)',
  color: theme.palette.mode === 'dark' ? '#00ffff' : '#0066cc',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.4)'
    : '2px solid rgba(0, 170, 255, 0.3)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 24px rgba(0, 255, 255, 0.3), 0 0 0 0 rgba(0, 255, 255, 0)'
    : '0 8px 24px rgba(0, 170, 255, 0.2), 0 0 0 0 rgba(0, 170, 255, 0)',
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
      ? '0 12px 32px rgba(0, 255, 255, 0.5), 0 0 0 4px rgba(0, 255, 255, 0.1)'
      : '0 12px 32px rgba(0, 170, 255, 0.4), 0 0 0 4px rgba(0, 170, 255, 0.1)',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 200, 255, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(0, 102, 204, 0.2) 0%, rgba(0, 170, 255, 0.15) 100%)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-2px) scale(1)',
  },
}));

const FacebookUnavailablePage = () => {
  const navigate = useNavigate();
  const theme = useMUITheme();
  const { mode } = useTheme();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate spark particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      <BackgroundGradient>
        {particles.map((particle) => (
          <SparkParticle
            key={particle.id}
            delay={particle.delay}
            left={particle.left}
            top={particle.top}
          />
        ))}
      </BackgroundGradient>

      <Container
        maxWidth="md"
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
              <GlassCard>
                <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  {/* Emoji Header */}
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '48px', sm: '64px' },
                      mb: 2,
                      lineHeight: 1,
                    }}
                  >
                    🛑
                  </Typography>

                  {/* Main Title */}
                  <GradientText
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      letterSpacing: '-0.02em',
                      fontSize: { xs: '28px', sm: '36px' },
                    }}
                  >
                    Facebook OAuth Taking a Vacation
                  </GradientText>

                  {/* Fun Text */}
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '18px',
                      lineHeight: 1.8,
                      mb: 4,
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    Looks like Mark Zuckerberg is currently busy teaching the metaverse how to blink{' '}
                    <span style={{ fontSize: '20px' }}>👁️✨</span>
                    <br />
                    <br />
                    Our Facebook login is temporarily unavailable because Meta engineers decided "Friday
                    deployments are fun!"
                    <br />
                    <br />
                    Meanwhile our Google login works like it's powered by Sundar Pichai's chai
                    productivity <span style={{ fontSize: '20px' }}>☕🤖</span>
                  </Typography>

                  {/* Divider */}
                  <Box
                    sx={{
                      height: '1px',
                      background: mode === 'dark'
                        ? 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(0, 170, 255, 0.4), transparent)',
                      my: 4,
                    }}
                  />

                  {/* Real Reason */}
                  <Box
                    sx={{
                      textAlign: 'left',
                      p: 3,
                      borderRadius: 2,
                      background: mode === 'dark'
                        ? 'rgba(0, 255, 255, 0.05)'
                        : 'rgba(0, 170, 255, 0.05)',
                      border: mode === 'dark'
                        ? '1px solid rgba(0, 255, 255, 0.2)'
                        : '1px solid rgba(0, 170, 255, 0.15)',
                      mb: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: mode === 'dark' ? '#00ffff' : '#0066cc',
                      }}
                    >
                      Real reason:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '15px',
                        lineHeight: 1.7,
                        color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      Facebook's OAuth platform isn't responding to API requests in our developer
                      environment due to sandbox + token validation restrictions.
                      <br />
                      <br />
                      Until Zuckerberg returns from yoga class & fixes it, please sign in with Google{' '}
                      <span style={{ fontSize: '16px' }}>🚀</span>
                    </Typography>
                  </Box>

                  {/* Return Button */}
                  <GlowButton
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    fullWidth
                    sx={{
                      mt: 2,
                    }}
                  >
                    🔙 Return to Login
                  </GlowButton>
                </Box>
              </GlassCard>
            </Grow>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default FacebookUnavailablePage;

