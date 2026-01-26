import React from 'react';
import styled from 'styled-components';
import ChoozLogo from '../assets/chooz-logo.svg';
import { Button } from './common/Button';

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  animation: fadeIn 0.5s ease-in;

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
`;

const StartButton = styled(Button)`
  font-size: 1.5rem;
  padding: 16px 48px;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 2px;
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
