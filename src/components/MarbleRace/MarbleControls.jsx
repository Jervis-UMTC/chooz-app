import { useState, useCallback } from 'react';
import { GAME_COLORS } from '../../utils/colors';
import { PlusIcon, CloseIcon } from '../common/Icons';
import {
  ControlsPanel,
  Label,
  NameListContainer,
  NameItem,
  ColorDot,
  RemoveBtn,
  InputRow,
  NameInput,
  AddButton,
  ModeRow,
  ModeButton,
  RaceButton,
} from './MarbleGame.styles';

/**
 * Controls panel for the Marble Race — name list, mode toggle, and race button.
 * @param {object} props
 * @param {string[]} props.names - Current list of names.
 * @param {function} props.setNames - State setter for names.
 * @param {function} props.onRace - Callback to start the race.
 * @param {boolean} props.isRacing - Whether a race is currently running.
 * @param {string} props.mode - Current race mode ('first' or 'ranked').
 * @param {function} props.setMode - State setter for mode.
 */
const MarbleControls = ({ names, setNames, onRace, isRacing, mode, setMode }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setNames(prev => [...prev, trimmed]);
    setInputValue('');
  }, [inputValue, setNames]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleAdd();
  };

  const handleRemove = useCallback((index) => {
    setNames(prev => prev.filter((_, i) => i !== index));
  }, [setNames]);

  return (
    <ControlsPanel
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Label>Names ({names.length}/50)</Label>
      <NameListContainer>
        {names.length === 0 && (
          <NameItem style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
            Add names to race
          </NameItem>
        )}
        {names.map((name, index) => (
          <NameItem key={`${name}-${index}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <ColorDot $color={GAME_COLORS[index % GAME_COLORS.length]} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
            </div>
            <RemoveBtn onClick={() => handleRemove(index)} aria-label={`Remove ${name}`}>
              <CloseIcon size={12} />
            </RemoveBtn>
          </NameItem>
        ))}
      </NameListContainer>

      <InputRow>
        <NameInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a name..."
          maxLength={30}
          disabled={names.length >= 50 || isRacing}
        />
        <AddButton onClick={handleAdd} disabled={names.length >= 50 || isRacing}>
          <PlusIcon size={16} />
        </AddButton>
      </InputRow>

      <Label>Race Mode</Label>
      <ModeRow>
        <ModeButton $active={mode === 'first'} onClick={() => setMode('first')} disabled={isRacing}>
          First Wins
        </ModeButton>
        <ModeButton $active={mode === 'ranked'} onClick={() => setMode('ranked')} disabled={isRacing}>
          Ranked
        </ModeButton>
      </ModeRow>

      <RaceButton
        onClick={onRace}
        disabled={names.length < 2 || isRacing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isRacing ? 'Racing...' : 'Start Race'}
      </RaceButton>
    </ControlsPanel>
  );
};

export default MarbleControls;
