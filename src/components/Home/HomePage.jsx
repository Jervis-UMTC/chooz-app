import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';

const HomeContainer = styled(motion.div)`
  padding: 40px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 40px;
  background: linear-gradient(135deg, ${BRAND_COLORS.yellow} 0%, ${BRAND_COLORS.orange} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  width: 100%;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  width: 100%;
`;

const GameCard = styled(motion.div)`
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  backdrop-filter: blur(10px);
  transition: border-color 0.3s;

  &:hover {
    border-color: ${BRAND_COLORS.orange};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, ${BRAND_COLORS.yellow}, ${BRAND_COLORS.red});
    opacity: 0.5;
    transition: width 0.3s;
  }

  &:hover::before {
    width: 10px;
    opacity: 1;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  color: white;
  margin: 0 0 10px 0;
`;

const CardDescription = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const HomePage = ({ onNavigate }) => {
  const games = [
    {
      id: 'wheel',
      title: 'Wheel of Names',
      description: 'Spin the wheel to make a random choice. Perfect for raffles, decisions, and fun.',
      icon: '🎡',
      action: () => onNavigate('wheel')
    },
    {
      id: 'coin',
      title: 'Coin Flip',
      description: 'Heads or Tails? Leave it to fate with a simple coin flip.',
      icon: '🪙',
      action: () => alert('Coming Soon!') // Placeholder for now
    },
    {
      id: 'dice',
      title: 'Dice Roll',
      description: 'Roll the dice for board games or random numbers.',
      icon: '🎲',
      action: () => alert('Coming Soon!')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <HomeContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Title>Choose Your Game</Title>
      <Grid>
        {games.map((game) => (
          <GameCard
            key={game.id}
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={game.action}
          >
            <div>
              <CardIcon>{game.icon}</CardIcon>
              <CardTitle>{game.title}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </div>
            <div style={{ alignSelf: 'flex-end', color: BRAND_COLORS.orange, fontWeight: 'bold' }}>
              PLAY NOW →
            </div>
          </GameCard>
        ))}
      </Grid>
    </HomeContainer>
  );
};

export default HomePage;
