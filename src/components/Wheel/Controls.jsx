import { motion } from 'framer-motion';
import { initAudio } from '../../utils/sounds';
import SharedNameControls from '../common/SharedNameControls';
import {
  ControlsContainer,
  SpinButton,
  DurationGroup,
  DurationButton,
  Label,
  Section,
  HistoryList,
  HistoryItem,
} from './Controls.styles';

const SPIN_DURATION_OPTIONS = [3, 5, 10];
const MAX_VISIBLE_HISTORY = 5;

const Controls = ({ names, setNames, onSpin, isSpinning, spinDuration, setSpinDuration, history = [] }) => {
  return (
    <ControlsContainer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <SharedNameControls
        names={names}
        setNames={setNames}
        isLocked={isSpinning}
      />

      {setSpinDuration && (
        <div style={{ marginTop: '4px' }}>
          <Label>Spin Duration</Label>
          <DurationGroup>
            {SPIN_DURATION_OPTIONS.map(duration => (
              <DurationButton
                key={duration}
                $active={spinDuration === duration}
                onClick={() => setSpinDuration(duration)}
                disabled={isSpinning}
              >
                {duration}s
              </DurationButton>
            ))}
          </DurationGroup>
        </div>
      )}

      <SpinButton
        as={motion.button}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { initAudio(); onSpin(); }}
        disabled={isSpinning || names.length < 2}
        style={{ marginTop: '4px' }}
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </SpinButton>
      <Label style={{ textAlign: 'center', margin: '0' }}>Press Space to spin · Esc to close</Label>

      {history.length > 0 && (
        <Section>
          <Label>Recent Winners</Label>
          <HistoryList>
            {history.slice(0, MAX_VISIBLE_HISTORY).map((winner, index) => (
              <HistoryItem key={index}>
                <span>{index + 1}.</span> {winner}
              </HistoryItem>
            ))}
          </HistoryList>
        </Section>
      )}
    </ControlsContainer>
  );
};

export default Controls;
