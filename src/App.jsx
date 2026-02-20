import { useState } from 'react';
import WheelGame from './components/Wheel/WheelGame';
import LandingPage from './components/LandingPage';
import HomePage from './components/Home/HomePage';
import CoinGame from './components/Coin/CoinGame';
import DiceGame from './components/Dice/DiceGame';
import MarbleGame from './components/MarbleRace/MarbleGame';
import './index.css';
import ChoozTextLogo from './assets/chooz-text-logo.svg';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';

const DEFAULT_NAMES = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];

const HeaderContainer = styled.header`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 50;
`;

const PageTransition = styled(motion.div)`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

function App() {
  const [view, setView] = useState('landing');
  const [names, setNames] = useLocalStorage('chooz_names', DEFAULT_NAMES);

  const navigate = (newView) => {
    setView(newView);
  };

  return (
    <div className="app-container">
      {view !== 'landing' && view !== 'wheel' && view !== 'coin' && view !== 'dice' && view !== 'marble' && (
        <HeaderContainer>
          <img
            src={ChoozTextLogo}
            alt="Chooz"
            style={{ height: '40px', cursor: 'pointer' }}
            onClick={() => navigate('landing')}
          />
        </HeaderContainer>
      )}

      <AnimatePresence mode="wait">
        <PageTransition
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'landing' && <LandingPage onStart={() => navigate('home')} />}
          {view === 'home' && <HomePage onNavigate={navigate} />}
          {view === 'wheel' && (
            <WheelGame
              names={names}
              setNames={setNames}
              onBack={() => navigate('home')}
            />
          )}
          {view === 'coin' && (
            <CoinGame onBack={() => navigate('home')} />
          )}
          {view === 'dice' && (
            <DiceGame onBack={() => navigate('home')} />
          )}
          {view === 'marble' && (
            <MarbleGame
              names={names}
              setNames={setNames}
              onBack={() => navigate('home')}
            />
          )}
        </PageTransition>
      </AnimatePresence>
    </div>
  );
}

export default App;
