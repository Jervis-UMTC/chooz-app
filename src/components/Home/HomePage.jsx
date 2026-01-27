import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';
import WheelLogo from '../../assets/wheel-of-names-logo.png';

const HomeContainer = styled.div`
  padding: 60px 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 40px;
  text-align: center;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
`;

const Card = styled(motion.div)`
  background: #1e293b;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  border: 1px solid #334155;
  
  &:hover {
    border-color: ${BRAND_COLORS.orange};
  }
`;

const CardIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
`;

const CardDesc = styled.p`
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

const PlayButton = styled.span`
  color: ${BRAND_COLORS.orange};
  font-weight: 600;
  font-size: 0.9rem;
`;

const HomePage = ({ onNavigate }) => {
  const games = [
    {
      id: 'wheel',
      title: 'Wheel of Names',
      desc: 'Spin the wheel to pick a random winner.',
      icon: <img src={WheelLogo} alt="Wheel" />,
      onClick: () => onNavigate('wheel')
    },
    {
      id: 'coin',
      title: 'Coin Flip',
      desc: 'Heads or tails? Let fate decide.',
      icon: <span style={{ fontSize: '2.5rem' }}>🪙</span>,
      onClick: () => alert('Coming Soon!')
    },
    {
      id: 'dice',
      title: 'Dice Roll',
      desc: 'Roll dice for games or decisions.',
      icon: <span style={{ fontSize: '2.5rem' }}>🎲</span>,
      onClick: () => alert('Coming Soon!')
    }
  ];

  return (
    <HomeContainer>
      <Title>Pick a Game</Title>
      <CardGrid>
        {games.map((game) => (
          <Card
            key={game.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={game.onClick}
          >
            <CardIcon>{game.icon}</CardIcon>
            <CardTitle>{game.title}</CardTitle>
            <CardDesc>{game.desc}</CardDesc>
            <PlayButton>Play →</PlayButton>
          </Card>
        ))}
      </CardGrid>
    </HomeContainer>
  );
};

export default HomePage;
