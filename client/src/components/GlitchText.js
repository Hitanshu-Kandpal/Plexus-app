import React from 'react';
import { Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const glitch = keyframes`
  0%, 100% {
    text-shadow: 
      2px 0 rgba(0, 255, 255, 0.8),
      -2px 0 rgba(0, 255, 136, 0.8);
    transform: translate(0);
  }
  20% {
    text-shadow: 
      -2px 0 rgba(0, 255, 255, 0.8),
      2px 0 rgba(0, 255, 136, 0.8);
    transform: translate(2px, 0);
  }
  40% {
    text-shadow: 
      2px 0 rgba(0, 255, 255, 0.8),
      -2px 0 rgba(0, 255, 136, 0.8);
    transform: translate(-2px, 0);
  }
  60% {
    text-shadow: 
      -2px 0 rgba(0, 255, 255, 0.8),
      2px 0 rgba(0, 255, 136, 0.8);
    transform: translate(2px, 0);
  }
  80% {
    text-shadow: 
      2px 0 rgba(0, 255, 255, 0.8),
      -2px 0 rgba(0, 255, 136, 0.8);
    transform: translate(-2px, 0);
  }
`;

const hologram = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.8)) drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
  }
`;

const GlitchText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'glitchOn',
})(({ theme, glitchOn }) => ({
  position: 'relative',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #00ffff 0%, #00ff88 50%, #00ffff 100%)'
    : 'linear-gradient(135deg, #0066cc 0%, #00aa88 50%, #0066cc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  backgroundSize: '200% 200%',
  animation: glitchOn ? `${glitch} 0.3s infinite, ${hologram} 2s ease-in-out infinite` : `${hologram} 2s ease-in-out infinite`,
  fontFamily: "'Courier New', monospace",
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  '&::before': {
    content: 'attr(data-text)',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #00ff88 0%, #00ffff 50%, #00ff88 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    opacity: 0.5,
    zIndex: -1,
    animation: glitchOn ? `${glitch} 0.3s infinite` : 'none',
    transform: 'translate(2px, 2px)',
  },
  '&::after': {
    content: 'attr(data-text)',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #00ffff 0%, #00ff88 50%, #00ffff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    opacity: 0.5,
    zIndex: -1,
    animation: glitchOn ? `${glitch} 0.3s infinite` : 'none',
    transform: 'translate(-2px, -2px)',
  },
}));

export default GlitchText;

