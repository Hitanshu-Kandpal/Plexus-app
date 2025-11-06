import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const stream = keyframes`
  0% {
    transform: translateY(-100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
`;

const DataStreamContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: -1,
  pointerEvents: 'none',
  overflow: 'hidden',
});

const StreamColumn = styled(Box)(({ left, delay, speed }) => ({
  position: 'absolute',
  left: `${left}%`,
  width: '2px',
  height: '200vh',
  background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.8), transparent)',
  animation: `${stream} ${speed}s linear infinite`,
  animationDelay: `${delay}s`,
  filter: 'blur(1px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '30px',
    background: 'linear-gradient(to bottom, rgba(0, 255, 255, 1), transparent)',
  },
}));

const DataStream = () => {
  const columns = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: (i * 5) + Math.random() * 2,
    delay: Math.random() * 5,
    speed: 3 + Math.random() * 4,
  }));

  return (
    <DataStreamContainer>
      {columns.map((col) => (
        <StreamColumn
          key={col.id}
          left={col.left}
          delay={col.delay}
          speed={col.speed}
        />
      ))}
    </DataStreamContainer>
  );
};

export default DataStream;

