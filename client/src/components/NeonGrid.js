import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const gridPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
`;

const GridContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: -1,
  pointerEvents: 'none',
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(ellipse at center, rgba(255, 0, 128, 0.1) 0%, rgba(0, 0, 0, 1) 70%)'
    : 'radial-gradient(ellipse at center, rgba(0, 170, 255, 0.05) 0%, rgba(245, 247, 250, 1) 70%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: theme.palette.mode === 'dark'
      ? `
        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
      `
      : `
        linear-gradient(rgba(0, 170, 255, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 170, 255, 0.08) 1px, transparent 1px)
      `,
    backgroundSize: '50px 50px',
    animation: `${gridPulse} 3s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: theme.palette.mode === 'dark'
      ? `
        linear-gradient(rgba(255, 0, 128, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 0, 128, 0.05) 1px, transparent 1px)
      `
      : `
        linear-gradient(rgba(255, 0, 102, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 0, 102, 0.04) 1px, transparent 1px)
      `,
    backgroundSize: '100px 100px',
    animation: `${gridPulse} 4s ease-in-out infinite`,
    animationDelay: '1s',
  },
}));

const NeonGrid = () => {
  return <GridContainer />;
};

export default NeonGrid;

