import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { BRAND_COLORS } from '../../utils/colors';

const fall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const CelebrationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
`;

const Particle = styled.div`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: ${props => props.$color};
  left: ${props => props.$left}%;
  top: -20px;
  border-radius: ${props => props.$shape === 'circle' ? '50%' : '2px'};
  animation: ${fall} ${props => props.$duration}s ease-in forwards;
  animation-delay: ${props => props.$delay}s;
  will-change: transform;
`;

const COLORS = [
  BRAND_COLORS.yellow,
  BRAND_COLORS.orange,
  BRAND_COLORS.red,
  '#fff',
  '#fbbf24',
  '#f97316'
];

const Celebration = ({ particleCount = 30 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.8,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    }));
  }, [particleCount]);

  return (
    <CelebrationContainer>
      {particles.map(p => (
        <Particle
          key={p.id}
          $left={p.left}
          $size={p.size}
          $color={p.color}
          $duration={p.duration}
          $delay={p.delay}
          $shape={p.shape}
        />
      ))}
    </CelebrationContainer>
  );
};

export default Celebration;
