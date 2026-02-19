import { useState, useEffect } from 'react'
import WheelGame from './components/Wheel/WheelGame'
import LandingPage from './components/LandingPage'
import HomePage from './components/Home/HomePage'
import CoinGame from './components/Coin/CoinGame'
import DiceGame from './components/Dice/DiceGame'
import './index.css'
import ChoozTextLogo from './assets/chooz-text-logo.svg'
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

import { ArrowLeftIcon } from './components/common/Icons';

const STORAGE_KEY_NAMES = 'chooz_names';
const STORAGE_KEY_HISTORY = 'chooz_history';
const MAX_HISTORY_SIZE = 20;
const DEFAULT_SPIN_DURATION = 5;
const DEFAULT_NAMES = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];

const HeaderContainer = styled.header`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 50;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-weight: 500;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
  }
`;

const PageTransition = styled(motion.div)`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

function App() {
  const [view, setView] = useState('landing');
  const [names, setNames] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NAMES);
    return saved ? JSON.parse(saved) : DEFAULT_NAMES;
  });
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [spinDuration, setSpinDuration] = useState(DEFAULT_SPIN_DURATION);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(names));
  }, [names]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  const setWinnerWithHistory = (newWinner) => {
    setWinner(newWinner);
    if (newWinner) {
      setHistory(previousHistory => [newWinner, ...previousHistory].slice(0, MAX_HISTORY_SIZE));
    }
  };

  const navigate = (newView) => {
    setView(newView);
    setMustSpin(false);
    setWinner(null);
  };

  return (
    <div className="app-container">
      {view !== 'landing' && view !== 'wheel' && view !== 'coin' && view !== 'dice' && (
        <HeaderContainer>
          <HeaderLeft>
            <BackButton onClick={() => navigate('home')}>
              <ArrowLeftIcon size={16} /> Back
            </BackButton>
            <img
              src={ChoozTextLogo}
              alt="Chooz"
              style={{ height: '40px', cursor: 'pointer' }}
              onClick={() => navigate('landing')}
            />
          </HeaderLeft>
          <div />
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
              mustSpin={mustSpin}
              setMustSpin={setMustSpin}
              prizeNumber={prizeNumber}
              setPrizeNumber={setPrizeNumber}
              winner={winner}
              setWinner={setWinnerWithHistory}
              onBack={() => navigate('home')}
              spinDuration={spinDuration}
              setSpinDuration={setSpinDuration}
              history={history}
            />
          )}
          {view === 'coin' && (
            <CoinGame onBack={() => navigate('home')} />
          )}
          {view === 'dice' && (
            <DiceGame onBack={() => navigate('home')} />
          )}
        </PageTransition>
      </AnimatePresence>
    </div>
  )
}

export default App
