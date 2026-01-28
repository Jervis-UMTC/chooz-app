import React, { useState, useEffect } from 'react'
import WheelGame from './components/Wheel/WheelGame'
import LandingPage from './components/LandingPage'
import HomePage from './components/Home/HomePage'
import './index.css'
import ChoozTextLogo from './assets/chooz-text-logo.svg'
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

import { ArrowLeftIcon } from './components/common/Icons';

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

function App() {
  const [view, setView] = useState('landing');
  const [names, setNames] = useState(() => {
    const saved = localStorage.getItem('chooz_names');
    return saved ? JSON.parse(saved) : ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
  });
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [spinDuration, setSpinDuration] = useState(5);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('chooz_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chooz_names', JSON.stringify(names));
  }, [names]);

  useEffect(() => {
    localStorage.setItem('chooz_history', JSON.stringify(history));
  }, [history]);

  const setWinnerWithHistory = (newWinner) => {
    setWinner(newWinner);
    if (newWinner) {
      setHistory(prev => [newWinner, ...prev].slice(0, 20));
    }
  };

  const navigate = (newView) => {
    setView(newView);
    setMustSpin(false);
    setWinner(null);
  };

  return (
    <div className="app-container">
      {view !== 'landing' && view !== 'wheel' && (
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
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
