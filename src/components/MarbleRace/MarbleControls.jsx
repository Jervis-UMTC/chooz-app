import { motion } from 'framer-motion';
import { initAudio } from '../../utils/sounds';
import SharedNameControls from '../common/SharedNameControls';
import {
  Label,
  ModeRow,
  ModeButton,
  RaceButton,
} from './MarbleGame.styles';
import styled from 'styled-components';

const ControlsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  z-index: 10;
  width: 100%;
  max-width: 360px;
  gap: 12px;
`;

/**
 * Controls panel for the Marble Race — advanced name list, mode toggle, and race button.
 */
const MarbleControls = ({ names, setNames, onRace, isRacing, mode, setMode }) => {
  return (
    <ControlsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SharedNameControls
        names={names}
        setNames={setNames}
        isLocked={isRacing}
        maxNames={100}
        showColors={true}
      />

      <div style={{ marginTop: '4px' }}>
        <Label style={{ marginBottom: '4px', display: 'block' }}>Race Mode</Label>
        <ModeRow>
          <ModeButton $active={mode === 'first'} onClick={() => setMode('first')} disabled={isRacing}>
            First Wins
          </ModeButton>
          <ModeButton $active={mode === 'ranked'} onClick={() => setMode('ranked')} disabled={isRacing}>
            Ranked
          </ModeButton>
        </ModeRow>
      </div>

      <RaceButton
        onClick={() => { initAudio(); onRace(); }}
        disabled={names.length < 2 || isRacing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isRacing ? 'Racing...' : 'Start Race'}
      </RaceButton>
    </ControlsContainer>
  );
};

export default MarbleControls;
