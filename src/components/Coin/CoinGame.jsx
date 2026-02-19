import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { initAudio, setMuted, getMuted, playCoinFlip, playWin } from '../../utils/sounds';
import { ArrowLeftIcon, VolumeIcon, MuteIcon } from '../common/Icons';
import {
  GameContainer,
  FloatingNav,
  ControlButtons,
  NavButton,
  CoinStage,
  CoinBody,
  CoinEdge,
  CoinInnerRing,
  CoinContent,
  CoinSymbol,
  CoinLabel,
  HeadsFace,
  TailsFace,
  ResultArea,
  ResultText,
  FlipButton,
  HistoryContainer,
  HistoryLabel,
  HistoryDots,
  HistoryDot,
  StatsText,
} from './CoinGame.styles';

const FLIP_DURATION_MS = 1500;
const MAX_HISTORY_LENGTH = 20;

/**
 * Coin Toss game component.
 * Renders a 3D animated coin that can be flipped to randomly land on heads or tails.
 * @param {object} props
 * @param {function} props.onBack - Callback to navigate back to the home page.
 */
const CoinGame = ({ onBack }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [displayedResult, setDisplayedResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(getMuted());

  const headsCount = history.filter(entry => entry === 'heads').length;
  const tailsCount = history.filter(entry => entry === 'tails').length;

  const handleFlip = useCallback(() => {
    if (isFlipping) return;

    initAudio();
    playCoinFlip();

    const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';

    setIsFlipping(true);
    setResult(flipResult);
    setDisplayedResult(null);

    setTimeout(() => {
      setIsFlipping(false);
      setDisplayedResult(flipResult);
      setHistory(previous => [flipResult, ...previous].slice(0, MAX_HISTORY_LENGTH));
      playWin();
    }, FLIP_DURATION_MS);
  }, [isFlipping]);

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
  }, [isMuted]);

  return (
    <GameContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Navigation */}
      <FloatingNav>
        <NavButton onClick={onBack}>
          <ArrowLeftIcon size={16} /> Back
        </NavButton>
      </FloatingNav>

      <ControlButtons>
        <NavButton onClick={handleToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <MuteIcon size={18} /> : <VolumeIcon size={18} />}
        </NavButton>
      </ControlButtons>

      {/* Coin */}
      <CoinStage $isFlipping={isFlipping}>
        <CoinBody
          $isFlipping={isFlipping}
          $result={result}
          key={result ? `${result}-${history.length}` : 'idle'}
        >
          <CoinEdge />
          <HeadsFace>
            <CoinInnerRing />
            <CoinContent>
              <CoinSymbol>♛</CoinSymbol>
              <CoinLabel>Heads</CoinLabel>
            </CoinContent>
          </HeadsFace>
          <TailsFace>
            <CoinInnerRing />
            <CoinContent>
              <CoinSymbol>♞</CoinSymbol>
              <CoinLabel>Tails</CoinLabel>
            </CoinContent>
          </TailsFace>
        </CoinBody>
      </CoinStage>

      {/* Result */}
      <ResultArea>
        <AnimatePresence mode="wait">
          {displayedResult && (
            <ResultText
              key={`${displayedResult}-${history.length}`}
              $result={displayedResult}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {displayedResult}
            </ResultText>
          )}
        </AnimatePresence>
      </ResultArea>

      {/* Flip Button */}
      <FlipButton
        onClick={handleFlip}
        disabled={isFlipping}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {isFlipping ? 'Flipping...' : 'Flip Coin'}
      </FlipButton>

      {/* History */}
      {history.length > 0 && (
        <HistoryContainer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HistoryLabel>History</HistoryLabel>
          <HistoryDots>
            <AnimatePresence>
              {history.map((entry, index) => (
                <HistoryDot
                  key={`${entry}-${history.length - index}`}
                  $result={entry}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  title={entry}
                />
              ))}
            </AnimatePresence>
          </HistoryDots>
          <StatsText>
            Heads: {headsCount} &middot; Tails: {tailsCount}
          </StatsText>
        </HistoryContainer>
      )}
    </GameContainer>
  );
};

export default CoinGame;
