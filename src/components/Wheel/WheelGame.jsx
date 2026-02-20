import { useCallback, useEffect, useRef, useState } from 'react';
import WheelCanvas from './WheelCanvas';
import Controls from './Controls';
import Celebration from './Celebration';
import { AnimatePresence } from 'framer-motion';
import { initAudio, setMuted, getMuted } from '../../utils/sounds';
import { ArrowLeftIcon, StopIcon, TrashIcon, VolumeIcon, MuteIcon, RefreshIcon, CloseIcon } from '../common/Icons';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  GameContainer,
  FloatingNav,
  ControlButtons,
  NavButton,
  StopButton,
  WheelWrapper,
  ModalBackdrop,
  WinnerModal,
  WinnerTitle,
  WinnerName,
  ButtonGroup,
  ActionButton,
  RemoveButton,
  ControlsWrapper,
  PageContainer,
  MuteButton,
} from './WheelGame.styles';

const DEFAULT_SPIN_DURATION = 5;
const MAX_HISTORY_SIZE = 20;

const WheelGame = ({
  names, setNames,
  onBack,
}) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [spinDuration, setSpinDuration] = useState(DEFAULT_SPIN_DURATION);
  const [history, setHistory] = useLocalStorage('chooz_history', []);
  const [isMutedState, setIsMutedState] = useState(getMuted());
  const isAbortingRef = useRef(false);

  const toggleMute = useCallback(() => {
    const newMuted = !isMutedState;
    setMuted(newMuted);
    setIsMutedState(newMuted);
  }, [isMutedState]);

  const handleSpinClick = useCallback(() => {
    if (!mustSpin && names.length > 1) {
      initAudio();
      const newPrizeNumber = Math.floor(Math.random() * names.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setWinner(null);
    }
  }, [mustSpin, names.length, setPrizeNumber, setMustSpin, setWinner]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (event.code === 'Space' && !mustSpin && !winner && names.length > 1) {
        event.preventDefault();
        handleSpinClick();
      }
      if (event.code === 'Escape' && winner) {
        setWinner(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mustSpin, winner, names.length, handleSpinClick]);

  const handleStopSpinning = () => {
    setMustSpin(false);
    if (isAbortingRef.current) {
      isAbortingRef.current = false;
      setWinner(null);
      return;
    }
    const newWinner = names[prizeNumber];
    setWinner(newWinner);
    setHistory(prev => [newWinner, ...prev].slice(0, MAX_HISTORY_SIZE));
  };

  const handleRemoveWinner = useCallback(() => {
    if (winner) {
      const indexToRemove = names.indexOf(winner);
      const newNames = names.filter((_, index) => index !== indexToRemove);
      setNames(newNames);
      setWinner(null);
    }
  }, [winner, names, setNames, setWinner]);

  const handleSpinAgain = useCallback(() => {
    setWinner(null);
    setTimeout(handleSpinClick, 100);
  }, [setWinner, handleSpinClick]);

  return (
    <PageContainer>

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
        <MuteButton onClick={toggleMute} title={isMutedState ? "Unmute" : "Mute"}>
          {isMutedState ? <MuteIcon size={20} /> : <VolumeIcon size={20} />}
        </MuteButton>
      </ControlButtons>

      {winner && <Celebration key={winner + Date.now()} particleCount={20} />}

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
            <ControlsWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
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
            </ControlsWrapper>
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
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setWinner(null)}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: '50%', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                aria-label="Close"
              >
                <CloseIcon size={14} />
              </button>
              <WinnerTitle>We have a winner!</WinnerTitle>
              <WinnerName
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {winner}
              </WinnerName>

              <ButtonGroup>
                <ActionButton onClick={handleSpinAgain}>
                  <RefreshIcon size={14} /> Spin Again
                </ActionButton>
                <RemoveButton onClick={handleRemoveWinner}>
                  <TrashIcon size={14} /> Remove
                </RemoveButton>
              </ButtonGroup>
            </WinnerModal>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default WheelGame;
