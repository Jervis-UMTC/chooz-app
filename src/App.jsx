import React, { useState } from 'react'
import WheelGame from './components/Wheel/WheelGame'
import LandingPage from './components/LandingPage'
import HomePage from './components/Home/HomePage'
import './index.css'
import ChoozTextLogo from './assets/chooz-text-logo.svg'
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

const BackButton = styled.button`
  position: absolute;
  top: 40px;
  left: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
  }
`;

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'home' | 'wheel'

  const navigate = (newView) => {
    setView(newView);
  };

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onStart={() => navigate('home')} />;
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'wheel':
        return <WheelGame />;
      default:
        return <LandingPage onStart={() => navigate('home')} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header is persistent except on Landing potentially, or we can animate it. 
          For now, let's keep the logo header on Home and Game, but maybe simpler on Landing?
          Actually Landing has its own logo. Let's show header only on Home and Game.
      */}

      {view !== 'landing' && (
        <header style={{ marginBottom: '20px', marginTop: '40px', position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {view === 'wheel' && (
            <BackButton onClick={() => navigate('home')}>
              ← Back
            </BackButton>
          )}
          <img
            src={ChoozTextLogo}
            alt="Chooz"
            style={{ height: '60px', cursor: 'pointer' }}
            onClick={() => navigate('landing')}
          />
        </header>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%' }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
