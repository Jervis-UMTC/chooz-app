import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { initAudio, setMuted, getMuted, playDiceRoll, playWin } from '../../utils/sounds';
import { ArrowLeftIcon, VolumeIcon, MuteIcon } from '../common/Icons';
import { generateDiceResults, calculateTotal, updateHistory } from './DiceUtils';
import {
  GameContainer,
  FloatingNav,
  ControlButtons,
  NavButton,
  DiceRow,
  DiceStage,
  DiceCube,
  Face1, Face2, Face3, Face4, Face5, Face6,
  Dot,
  ResultArea,
  ResultText,
  RollButton,
  DiceCountRow,
  DiceCountButton,
  DiceCountLabel,
  HistoryContainer,
  HistoryLabel,
  HistoryItems,
  HistoryChip,
  TotalText,
} from './DiceGame.styles';

const ROLL_DURATION_MS = 1200;
const MAX_HISTORY_LENGTH = 15;
const MAX_DICE_COUNT = 3;

/**
 * Renders the pip (dot) pattern for a given dice face value.
 * Returns 9 grid cells; cells at active positions contain a Dot.
 * @param {object} props
 * @param {number} props.value - Dice face value (1–6).
 */
const DicePips = ({ value }) => {
  /* Grid positions (1-indexed): 1=TL, 2=TC, 3=TR, 4=ML, 5=MC, 6=MR, 7=BL, 8=BC, 9=BR */
  const pipPositions = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  const activePips = pipPositions[value] || [];

  return Array.from({ length: 9 }, (_, index) => (
    <div key={index}>
      {activePips.includes(index + 1) && <Dot />}
    </div>
  ));
};

/**
 * Dice Roll game component.
 * Renders 1–3 3D animated dice with roll animation, result display, and history.
 * @param {object} props
 * @param {function} props.onBack - Callback to navigate back to the home page.
 */
const DiceGame = ({ onBack }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [results, setResults] = useState(null);
  const [displayedResults, setDisplayedResults] = useState(null);
  const [diceCount, setDiceCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(getMuted());

  const rollDice = useCallback(() => {
    if (isRolling) return;

    initAudio();
    playDiceRoll();

    const newResults = generateDiceResults(diceCount);

    setIsRolling(true);
    setResults(newResults);
    setDisplayedResults(null);

    setTimeout(() => {
      setIsRolling(false);
      setDisplayedResults(newResults);

      const total = calculateTotal(newResults);
      setHistory(prev => updateHistory(prev, newResults, total, MAX_HISTORY_LENGTH));

      playWin();
    }, ROLL_DURATION_MS);
  }, [isRolling, diceCount]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (event.code === 'Space' && !isRolling) {
        event.preventDefault();
        rollDice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rollDice, isRolling]);

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
  }, [isMuted]);

  const total = displayedResults ? displayedResults.reduce((sum, val) => sum + val, 0) : null;

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

      {/* Dice Count Selector */}
      <DiceCountRow>
        <DiceCountLabel>Dice</DiceCountLabel>
        {Array.from({ length: MAX_DICE_COUNT }, (_, index) => (
          <DiceCountButton
            key={index + 1}
            $active={diceCount === index + 1}
            onClick={() => setDiceCount(index + 1)}
          >
            {index + 1}
          </DiceCountButton>
        ))}
      </DiceCountRow>

      {/* Dice */}
      <DiceRow $count={diceCount}>
        {Array.from({ length: diceCount }, (_, diceIndex) => (
          <DiceStage key={diceIndex} $isRolling={isRolling}>
            <DiceCube
              $isRolling={isRolling}
              $result={results ? results[diceIndex] : null}
              key={results ? `${results[diceIndex]}-${history.length}-${diceIndex}` : `idle-${diceIndex}`}
            >
              <Face1><DicePips value={1} /></Face1>
              <Face2><DicePips value={2} /></Face2>
              <Face3><DicePips value={3} /></Face3>
              <Face4><DicePips value={4} /></Face4>
              <Face5><DicePips value={5} /></Face5>
              <Face6><DicePips value={6} /></Face6>
            </DiceCube>
          </DiceStage>
        ))}
      </DiceRow>

      {/* Result */}
      <ResultArea>
        <AnimatePresence mode="wait">
          {displayedResults && (
            <ResultText
              key={`${displayedResults.join('-')}-${history.length}`}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {diceCount > 1
                ? `${displayedResults.join(' + ')} = ${total}`
                : displayedResults[0]
              }
            </ResultText>
          )}
        </AnimatePresence>
      </ResultArea>

      {/* Roll Button */}
      <RollButton
        onClick={rollDice}
        disabled={isRolling}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label={isRolling ? 'Dice are rolling' : 'Roll dice'}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </RollButton>

      {/* History */}
      {history.length > 0 && (
        <HistoryContainer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HistoryLabel>History</HistoryLabel>
          <HistoryItems>
            <AnimatePresence>
              {history.map((entry, index) => (
                <HistoryChip
                  key={`${entry.total}-${history.length - index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  title={entry.values.join(', ')}
                >
                  {entry.values.length > 1 ? entry.values.join('+') + '=' : ''}{entry.total}
                </HistoryChip>
              ))}
            </AnimatePresence>
          </HistoryItems>
          <TotalText>
            Rolls: {history.length} &middot; Avg: {(history.reduce((sum, entry) => sum + entry.total, 0) / history.length).toFixed(1)}
          </TotalText>
        </HistoryContainer>
      )}
    </GameContainer>
  );
};

export default DiceGame;
