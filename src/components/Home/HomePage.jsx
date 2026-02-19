import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';
import { ArrowRightIcon } from '../common/Icons';
import WheelLogo from '../../assets/wheel-of-names-logo.png';
import CoinLogo from '../../assets/coin-flip-logo.png';
import DiceLogo from '../../assets/dice-game-logo.png';

const HomeContainer = styled.div`
  padding: 60px 20px;
  width: 100%;
  min-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;
  
  background: radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 40%);
    animation: rotate 30s linear infinite;
    z-index: 0;
    pointer-events: none;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  > * {
    z-index: 1;
    width: 100%;
    max-width: 1000px;
  }

  @media (max-width: 600px) {
    padding: 30px 16px calc(30px + env(safe-area-inset-bottom, 0px)) 16px;
  }
  
  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${BRAND_COLORS.yellow} 0%, ${BRAND_COLORS.orange} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px 0;

  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
`;

const Card = styled(motion.div)`
  background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 32px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  &:hover {
    border-color: ${props => props.$accentColor || BRAND_COLORS.orange};
    box-shadow: 0 0 30px -8px ${props => props.$accentColor || BRAND_COLORS.orange}40;
  }
  
  @media (max-width: 600px) {
    padding: 24px;
    border-radius: 16px;
  }
`;

const CardIcon = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
  
  svg {
    width: 64px;
    height: 64px;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
`;

const CardDesc = styled.p`
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 24px 0;
  flex: 1;
`;

const PlayButton = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$color || BRAND_COLORS.orange};
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: 50px;
  background: ${props => props.$color || BRAND_COLORS.orange}15;
  border: 1px solid ${props => props.$color || BRAND_COLORS.orange}30;
  transition: all 0.2s;
  
  ${Card}:hover & {
    background: ${props => props.$color || BRAND_COLORS.orange}25;
    gap: 12px;
  }
`;



const HomePage = ({ onNavigate }) => {
  const games = [
    {
      id: 'wheel',
      title: 'Wheel of Names',
      desc: 'Spin the wheel to randomly select a winner from your list.',
      icon: <img src={WheelLogo} alt="Wheel" />,
      accentColor: BRAND_COLORS.orange,
      onClick: () => onNavigate('wheel')
    },
    {
      id: 'coin',
      title: 'Coin Flip',
      desc: 'A quick heads or tails for those 50/50 decisions.',
      icon: <img src={CoinLogo} alt="Coin Flip" />,
      accentColor: BRAND_COLORS.yellow,
      onClick: () => onNavigate('coin')
    },
    {
      id: 'dice',
      title: 'Dice Roll',
      desc: 'Roll virtual dice for games or random numbers.',
      icon: <img src={DiceLogo} alt="Dice Roll" />,
      accentColor: BRAND_COLORS.danger,
      onClick: () => onNavigate('dice')
    },
    {
      id: 'marble',
      title: 'Marble Race',
      desc: 'Watch marbles race through obstacles to the finish line.',
      icon: null,
      accentColor: '#22c55e',
      onClick: () => onNavigate('marble')
    }
  ];

  return (
    <HomeContainer>
      <Header>
        <Title>Game Collection</Title>
        <Subtitle>Choose your random selection method</Subtitle>
      </Header>
      <CardGrid>
        {games.map((game) => (
          <Card
            key={game.id}
            $accentColor={game.accentColor}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={game.onClick}
          >
            <CardIcon>{game.icon}</CardIcon>
            <CardTitle>{game.title}</CardTitle>
            <CardDesc>{game.desc}</CardDesc>
            <PlayButton $color={game.accentColor}>
              Play <ArrowRightIcon size={16} />
            </PlayButton>
          </Card>
        ))}
      </CardGrid>
    </HomeContainer>
  );
};

export default HomePage;
