import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import WheelCanvas from './WheelCanvas';
import Controls from './Controls';
import Celebration from './Celebration';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';
import { initAudio, setMuted, getMuted } from '../../utils/sounds';
import { ArrowLeftIcon, StopIcon, TrashIcon, VolumeIcon, MuteIcon } from '../common/Icons';

const GameContainer = styled(motion.div)`
  display: flex;
  flex-direction: row;
  align-items: center; 
  justify-content: space-evenly; 
  padding: 0 40px; 
  width: 100%;
  height: 100%; 
  overflow: hidden; 
  flex-wrap: nowrap; 
  position: relative;
  gap: 30px;
  transition: all 0.3s ease;
  
  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    padding: 70px 16px calc(20px + env(safe-area-inset-bottom, 0px)) 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const FloatingNav = styled.div`
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 50;
  display: flex;
  gap: 15px;
  @media (max-width: 600px) {
    top: 15px;
    left: 15px;
    gap: 10px;
  }
`;

const ControlButtons = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 50;
  display: flex;
  gap: 15px;
  @media (max-width: 600px) {
    top: 15px;
    right: 15px;
    gap: 10px;
  }
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
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-weight: 500;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  min-width: 90px;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: scale(0.96);
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
  min-width: 90px;
  justify-content: center;

  &:hover {
    background: rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
    color: white;
  }
`;

const WheelWrapper = styled.div`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  max-width: 700px;
  max-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 900px) {
    flex: 0 0 auto;
    width: 90vw;
    height: auto;
    max-width: 350px;
    max-height: 350px;
    aspect-ratio: 1;
  }
  
  @media (max-height: 700px) and (max-width: 900px) {
    max-width: 280px;
    max-height: 280px;
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
  
  @media (max-width: 500px) {
    padding: 30px 20px;
    border-radius: 20px;
  }
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
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  word-break: break-word;
  
  @media (max-width: 500px) {
    font-size: 2.5rem;
    margin: 15px 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
  
  @media (max-width: 500px) {
    margin-top: 20px;
    gap: 10px;
  }
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
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  @media (max-width: 500px) {
    padding: 10px 18px;
    font-size: 0.9rem;
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
  setSpinDuration,
  history = []
}) => {
  const [isMutedState, setIsMutedState] = useState(getMuted());
  const isAbortingRef = React.useRef(false);

  const toggleMute = () => {
    const newMuted = !isMutedState;
    setMuted(newMuted);
    setIsMutedState(newMuted);
  };

  const handleSpinClick = () => {
    if (!mustSpin && names.length > 1) {
      initAudio();
      const newPrizeNumber = Math.floor(Math.random() * names.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setWinner(null);
    }
  };

  // Spacebar keyboard shortcut to spin
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !mustSpin && !winner && names.length > 1) {
        e.preventDefault();
        handleSpinClick();
      }
      if (e.code === 'Escape' && winner) {
        setWinner(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mustSpin, winner, names.length]);

  const handleStopSpinning = () => {
    setMustSpin(false);
    if (isAbortingRef.current) {
      isAbortingRef.current = false;
      setWinner(null);
      return;
    }
    setWinner(names[prizeNumber]);
  };

  const handleRemoveWinner = () => {
    if (winner) {
      const newNames = names.filter(n => n !== winner);
      setNames(newNames);
      setWinner(null);
    }
  };



  // 100dvh is better for mobile browsers to handle address bars
  return (
    <div style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>

      <FloatingNav>
        {mustSpin ? (
          <StopButton onClick={() => {
            isAbortingRef.current = true;
            setMustSpin(false);
          }}>
            <StopIcon size={12} />
            ABORT
          </StopButton>
        ) : (
          <NavButton onClick={onBack}>
            <ArrowLeftIcon size={16} /> Back
          </NavButton>
        )}
      </FloatingNav>

      <ControlButtons>
        <NavButton onClick={toggleMute} style={{ padding: '8px', minWidth: '40px', borderRadius: '50%' }} title={isMutedState ? "Unmute" : "Mute"}>
          {isMutedState ? <MuteIcon size={20} /> : <VolumeIcon size={20} />}
        </NavButton>
      </ControlButtons>

      {winner && <Celebration particleCount={40} />}

      <GameContainer>
        <WheelWrapper>
          <WheelCanvas
            names={names}
            mustSpin={mustSpin}
            prizeNumber={prizeNumber}
            onStopSpinning={handleStopSpinning}
            onSpin={handleSpinClick}
            spinDuration={spinDuration}
          />
        </WheelWrapper>

        <AnimatePresence mode="wait">
          {!mustSpin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 10,
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <Controls
                names={names}
                setNames={setNames}
                onSpin={handleSpinClick}
                isSpinning={mustSpin}
                spinDuration={spinDuration}
                setSpinDuration={setSpinDuration}
                history={history}
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
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <WinnerTitle>We have a winner!</WinnerTitle>
              <WinnerName
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {winner}
              </WinnerName>

              <ButtonGroup>
                <ActionButton onClick={() => setWinner(null)}>
                  <ArrowLeftIcon size={14} /> Back
                </ActionButton>
                <RemoveButton onClick={handleRemoveWinner}>
                  <TrashIcon size={14} /> Remove
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
