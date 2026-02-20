import { useCallback, useEffect, useState } from 'react';
import MarbleCanvas from './MarbleCanvas';
import MarbleControls from './MarbleControls';
import Celebration from '../Wheel/Celebration';
import { AnimatePresence } from 'framer-motion';
import { initAudio, setMuted, getMuted } from '../../utils/sounds';
import { ArrowLeftIcon, VolumeIcon, MuteIcon, CloseIcon, RefreshIcon } from '../common/Icons';
import {
  PageContainer,
  GameContainer,
  FloatingNav,
  ControlButtons,
  NavButton,
  MuteButton,
  CanvasWrapper,
  ModalBackdrop,
  ResultsModal,
  ResultsTitle,
  WinnerName,
  LeaderboardList,
  LeaderboardEntry,
  RankNumber,
  ColorDot,
  ButtonGroup,
  ActionButton,
  CloseButton,
} from './MarbleGame.styles';

/**
 * Marble Race game — main component.
 * @param {object} props
 * @param {string[]} props.names - Shared name list.
 * @param {function} props.setNames - State setter for names.
 * @param {function} props.onBack - Navigate back to home.
 */
const MarbleGame = ({ names, setNames, onBack }) => {
  const [isRacing, setIsRacing] = useState(false);
  const [mode, setMode] = useState('first');
  const [results, setResults] = useState(null);
  const [isMuted, setIsMuted] = useState(getMuted());

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleStartRace = useCallback(() => {
    if (names.length < 2) return;
    initAudio();
    setResults(null);
    setIsRacing(true);
  }, [names.length]);

  const handleRaceFinish = useCallback((finishers) => {
    setIsRacing(false);
    setResults(finishers);
  }, []);

  const handleRaceAgain = useCallback(() => {
    setResults(null);
    setTimeout(() => handleStartRace(), 150);
  }, [handleStartRace]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (event.code === 'Space' && !isRacing && !results && names.length > 1) {
        event.preventDefault();
        handleStartRace();
      }
      if (event.code === 'Escape' && results) {
        setResults(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRacing, results, names.length, handleStartRace]);

  const winner = results && results.length > 0 ? results[0] : null;

  return (
    <PageContainer>
      <FloatingNav>
        <NavButton onClick={onBack}>
          <ArrowLeftIcon size={16} /> Back
        </NavButton>
      </FloatingNav>

      <ControlButtons>
        <MuteButton onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <MuteIcon size={20} /> : <VolumeIcon size={20} />}
        </MuteButton>
      </ControlButtons>

      {results && winner && <Celebration key={winner.name + Date.now()} particleCount={20} />}

      <GameContainer>
        <CanvasWrapper>
          <MarbleCanvas
            names={names}
            racing={isRacing}
            onRaceFinish={handleRaceFinish}
            mode={mode}
          />
        </CanvasWrapper>

        {!isRacing && (
          <MarbleControls
            names={names}
            setNames={setNames}
            onRace={handleStartRace}
            isRacing={isRacing}
            mode={mode}
            setMode={setMode}
          />
        )}
      </GameContainer>

      <AnimatePresence>
        {results && (
          <ModalBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setResults(null)}
          >
            <ResultsModal
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClick={() => setResults(null)} aria-label="Close">
                <CloseIcon size={14} />
              </CloseButton>

              {mode === 'first' && winner && (
                <>
                  <ResultsTitle>We have a winner!</ResultsTitle>
                  <WinnerName
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {winner.name}
                  </WinnerName>
                </>
              )}

              {mode === 'ranked' && (
                <>
                  <ResultsTitle>Race Results</ResultsTitle>
                  <LeaderboardList>
                    {results.map((ball) => (
                      <LeaderboardEntry key={ball.id} $rank={ball.finishOrder}>
                        <RankNumber>#{ball.finishOrder}</RankNumber>
                        <ColorDot $color={ball.color} />
                        <span style={{ flex: 1 }}>{ball.name}</span>
                      </LeaderboardEntry>
                    ))}
                  </LeaderboardList>
                </>
              )}

              <ButtonGroup>
                <ActionButton onClick={handleRaceAgain}>
                  <RefreshIcon size={14} /> Race Again
                </ActionButton>
              </ButtonGroup>
            </ResultsModal>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default MarbleGame;
