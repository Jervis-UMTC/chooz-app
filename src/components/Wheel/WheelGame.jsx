import React, { useState } from 'react';
import styled from 'styled-components';
import WheelCanvas from './WheelCanvas';
import Controls from './Controls';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';

const GameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  padding: 40px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WinnerModal = styled(motion.div)`
  background: linear-gradient(145deg, #1e293b, #0f172a);
  padding: 50px;
  border-radius: 24px;
  border: 1px solid rgba(254, 221, 40, 0.3);
  text-align: center;
  z-index: 100;
  box-shadow: 0 0 60px rgba(254, 221, 40, 0.15), 0 20px 40px -10px rgba(0,0,0,0.5);
  max-width: 90%;
  width: 400px;
`;

const WinnerTitle = styled.h2`
  font-size: 1.5rem;
  color: ${BRAND_COLORS.yellow};
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const WinnerName = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 20px 0;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const WheelGame = () => {
  const [names, setNames] = useState(['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);

  const handleSpinClick = () => {
    if (!mustSpin && names.length > 1) {
      const newPrizeNumber = Math.floor(Math.random() * names.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setWinner(null);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setWinner(names[prizeNumber]);
  };

  return (
    <div style={{ width: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {winner && <Confetti recycle={false} numberOfPieces={500} />}

      <GameContainer>
        <WheelCanvas
          names={names}
          mustSpin={mustSpin}
          prizeNumber={prizeNumber}
          onStopSpinning={handleStopSpinning}
        />
        <Controls
          names={names}
          setNames={setNames}
          onSpin={handleSpinClick}
          isSpinning={mustSpin}
        />
      </GameContainer>

      <AnimatePresence>
        {winner && (
          <ModalBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWinner(null)}
          >
            <WinnerModal
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <WinnerTitle>And the winner is...</WinnerTitle>
              <WinnerName>{winner}</WinnerName>
              <CloseButton onClick={() => setWinner(null)}>Spin Again</CloseButton>
            </WinnerModal>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WheelGame;
