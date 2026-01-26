import React from 'react';
import styled from 'styled-components';
import WheelCanvas from './WheelCanvas';
import Controls from './Controls';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';

const GameContainer = styled(motion.div)`
  display: flex;
  flex-direction: row;
  align-items: center; 
  justify-content: space-between; 
  padding: 0; 
  width: 100%;
  height: 100%; 
  overflow: hidden; 
  flex-wrap: nowrap; 
  position: relative;
  
  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: center;
    gap: 20px;
  }
`;

const FloatingNav = styled.div`
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 50;
  display: flex;
  gap: 15px;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 20px;
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
    transform: translateY(-2px);
  }
`;

const StopButton = styled(NavButton)`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;

  &:hover {
    background: rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
    color: white;
  }
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
  width: 450px;
`;

const WinnerTitle = styled.h2`
  font-size: 1.5rem;
  color: ${BRAND_COLORS.yellow};
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const WinnerName = styled(motion.div)`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 20px 0;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const RemoveButton = styled(ActionButton)`
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    color: white;
  }
`;

const WheelGame = ({
  names, setNames,
  mustSpin, setMustSpin,
  prizeNumber, setPrizeNumber,
  winner, setWinner,
  onBack,
  spinDuration = 5,
  setSpinDuration
}) => {

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

  const handleRemoveWinner = () => {
    if (winner) {
      const newNames = names.filter(n => n !== winner);
      setNames(newNames);
      setWinner(null);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>

      <FloatingNav>
        {mustSpin ? (
          <StopButton onClick={() => setMustSpin(false)}>
            ■ STOP
          </StopButton>
        ) : (
          <NavButton onClick={onBack}>
            ← Back
          </NavButton>
        )}
      </FloatingNav>

      {winner && <Confetti recycle={false} numberOfPieces={800} gravity={0.2} colors={[BRAND_COLORS.yellow, BRAND_COLORS.orange, BRAND_COLORS.red, '#fff']} />}

      <GameContainer>
        <motion.div
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '0',
            position: 'relative',
            paddingLeft: '20px'
          }}
          animate={{ flex: 1 }}
        >
          <WheelCanvas
            names={names}
            mustSpin={mustSpin}
            prizeNumber={prizeNumber}
            onStopSpinning={handleStopSpinning}
            onSpin={handleSpinClick}
            spinDuration={spinDuration}
          />
        </motion.div>

        <AnimatePresence>
          {!mustSpin && (
            <motion.div
              initial={{ width: 340, opacity: 1 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0, paddingRight: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 10,
                paddingRight: '30px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                height: '100%',
                justifyContent: 'center'
              }}
            >
              <Controls
                names={names}
                setNames={setNames}
                onSpin={handleSpinClick}
                isSpinning={mustSpin}
                spinDuration={spinDuration}
                setSpinDuration={setSpinDuration}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
              initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: -20 }}
              animate={{
                scale: [0.5, 1.1, 1],
                opacity: 1,
                y: 0,
                rotateX: 0,
                boxShadow: [
                  `0 0 0 0px ${BRAND_COLORS.yellow}`,
                  `0 0 50px 20px ${BRAND_COLORS.yellow}`,
                  `0 0 30px 10px rgba(0,0,0,0.5)`
                ]
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <WinnerTitle>We have a winner!</WinnerTitle>
              <WinnerName
                animate={{
                  scale: [1, 1.2, 1],
                  textShadow: [
                    "0 0 10px rgba(255,255,255,0.5)",
                    "0 0 30px rgba(255,255,255,1)",
                    "0 0 10px rgba(255,255,255,0.5)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {winner}
              </WinnerName>

              <ButtonGroup>
                <ActionButton onClick={() => setWinner(null)}>
                  ← Back
                </ActionButton>
                <RemoveButton onClick={handleRemoveWinner}>
                  Remove Winner
                </RemoveButton>
              </ButtonGroup>
            </WinnerModal>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WheelGame;
