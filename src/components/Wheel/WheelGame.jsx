import { useCallback, useEffect, useRef, useState } from 'react';
import WheelCanvas from './WheelCanvas';
import Controls from './Controls';
import Celebration from './Celebration';
import { AnimatePresence } from 'framer-motion';
import { initAudio, setMuted, getMuted } from '../../utils/sounds';
import { ArrowLeftIcon, StopIcon, TrashIcon, VolumeIcon, MuteIcon } from '../common/Icons';
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

  const handleRemoveWinner = useCallback(() => {
    if (winner) {
      const newNames = names.filter(name => name !== winner);
      setNames(newNames);
      setWinner(null);
    }
  }, [winner, names, setNames, setWinner]);

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
    </PageContainer>
  );
};

export default WheelGame;
