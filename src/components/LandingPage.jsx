import React from 'react';
import styled from 'styled-components';
import ChoozLogo from '../assets/chooz-logo.svg';
import { Button } from './common/Button';

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  width: 100%;
  animation: fadeIn 0.5s ease-in;
  background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
    animation: rotate 20s linear infinite;
    z-index: 0;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const LogoImage = styled.img`
  width: 450px;
  max-width: 90%;
  margin-bottom: 40px;
  filter: drop-shadow(0 0 20px rgba(254, 221, 40, 0.2));
  animation: float 6s ease-in-out infinite;

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }

  @media (max-width: 600px) {
    width: 300px;
    margin-bottom: 30px;
  }
`;

const StartButton = styled(Button)`
  font-size: 1.5rem;
  padding: 16px 48px;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  @media (max-width: 600px) {
    font-size: 1.25rem;
    padding: 14px 36px;
  }
`;

const LandingPage = ({ onStart }) => {
  return (
    <LandingContainer>
      <LogoImage src={ChoozLogo} alt="Chooz Logo" />
      <StartButton onClick={onStart}>Start</StartButton>
    </LandingContainer>
  );
};

export default LandingPage;
