import { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { AnimatePresence, motion } from 'framer-motion';
import { initAudio, playUiClick } from '../../utils/sounds';
import { ShuffleIcon, CloseIcon, PlusIcon, ClearAllIcon, ImportIcon, SaveIcon, HistoryIcon } from '../common/Icons';
import { SaveModal, LoadModal } from './ListModals';
import { parseImportText, saveNewList, deleteListFromStorage } from './ControlsUtils';
import {
  ControlsContainer,
  NameList,
  EmptyState,
  WarningMessage,
  NameItem,
  RemoveButton,
  SpinButton,
  ButtonRow,
  IconButton,
  DurationGroup,
  DurationButton,
  Label,
  Section,
  HistoryList,
  HistoryItem,
  TextArea,
  FlexInput,
  FlexButton,
} from './Controls.styles';

const STORAGE_KEY = 'chooz_saved_lists';
const DUPLICATE_WARNING_TIMEOUT_MS = 3000;
const SPIN_DURATION_OPTIONS = [3, 5, 10];
const MAX_VISIBLE_HISTORY = 5;

const Controls = ({ names, setNames, onSpin, isSpinning, spinDuration, setSpinDuration, history = [] }) => {
  const [newName, setNewName] = useState('');
  const [isImportVisible, setIsImportVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [savedLists, setSavedLists] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [isLoadModalVisible, setIsLoadModalVisible] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const handleAdd = () => {
    playUiClick();
    const trimmed = newName.trim();
    if (trimmed) {
      if (names.length >= 50) {
        setDuplicateWarning(`Maximum limit of 50 names reached`);
        setTimeout(() => setDuplicateWarning(''), DUPLICATE_WARNING_TIMEOUT_MS);
        return;
      }
      if (names.some(name => name.toLowerCase() === trimmed.toLowerCase())) {
        setDuplicateWarning(`"${trimmed}" is already in the list`);
        setTimeout(() => setDuplicateWarning(''), DUPLICATE_WARNING_TIMEOUT_MS);
        return;
      }
      setNames([...names, trimmed]);
      setNewName('');
      setDuplicateWarning('');
    }
  };

  const handleRemove = (targetIndex) => {
    playUiClick();
    const newNames = names.filter((_, index) => index !== targetIndex);
    setNames(newNames);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAdd();
    }
  };

  const handleShuffle = () => {
    playUiClick();
    const shuffled = [...names];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    setNames(shuffled);
  };

  const handleClearAll = () => {
    if (names.length > 0 && confirm('Clear all names?')) {
      playUiClick();
      setNames([]);
    }
  };



  const handleImport = () => {
    const parsedNames = parseImportText(importText);
    const uniqueNewNames = parsedNames.filter(
      (name, index, arr) =>
        !names.some(existing => existing.toLowerCase() === name.toLowerCase()) &&
        arr.findIndex(n => n.toLowerCase() === name.toLowerCase()) === index
    );

    if (uniqueNewNames.length > 0) {
      const availableSlots = 50 - names.length;
      if (availableSlots <= 0) {
        setDuplicateWarning(`Maximum limit of 50 names reached`);
        setTimeout(() => setDuplicateWarning(''), DUPLICATE_WARNING_TIMEOUT_MS);
        return;
      }

      const namesToAdd = uniqueNewNames.slice(0, availableSlots);
      if (uniqueNewNames.length > availableSlots) {
        setDuplicateWarning(`List capped at 50 names maximum`);
        setTimeout(() => setDuplicateWarning(''), DUPLICATE_WARNING_TIMEOUT_MS);
      }

      setNames([...names, ...namesToAdd]);
      setImportText('');
      setIsImportVisible(false);
    }
  };

  const handleSaveList = () => {
    if (listName.trim() && names.length > 0) {
      const updated = saveNewList(savedLists, listName, names, STORAGE_KEY);
      setSavedLists(updated);
      setListName('');
      setIsSaveModalVisible(false);
    }
  };

  const handleLoadList = (list) => {
    setNames([...list.names]);
    setIsLoadModalVisible(false);
  };

  const handleDeleteList = (listToDelete) => {
    const updated = deleteListFromStorage(savedLists, listToDelete, STORAGE_KEY);
    setSavedLists(updated);
  };

  return (
    <>
      <ControlsContainer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Add Name */}
        <ButtonRow>
          <FlexInput
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={names.length >= 50 ? "50 name limit reached" : "Add a name..."}
            disabled={names.length >= 50}
            aria-label="Enter name to add"
          />
          <IconButton onClick={handleAdd} disabled={names.length >= 50} title="Add name" aria-label="Add name">
            <PlusIcon size={16} />
          </IconButton>
        </ButtonRow>

        {/* Duplicate Warning */}
        {duplicateWarning && <WarningMessage role="alert">{duplicateWarning}</WarningMessage>}

        {/* Action buttons */}
        <ButtonRow role="toolbar" aria-label="List actions">
          <IconButton onClick={handleShuffle} disabled={names.length < 2} title="Shuffle" aria-label="Shuffle names">
            <ShuffleIcon size={14} />
          </IconButton>
          <IconButton onClick={() => setIsImportVisible(!isImportVisible)} title="Import names" aria-label="Import names">
            <ImportIcon size={14} />
          </IconButton>
          <IconButton onClick={handleClearAll} disabled={names.length === 0} title="Clear all" aria-label="Clear all names">
            <ClearAllIcon size={14} />
          </IconButton>
          <IconButton onClick={() => setIsSaveModalVisible(true)} disabled={names.length === 0} title="Save list" aria-label="Save list">
            <SaveIcon size={14} />
          </IconButton>
          <IconButton onClick={() => setIsLoadModalVisible(true)} disabled={savedLists.length === 0} title="Load list" aria-label="Load saved list">
            <HistoryIcon size={14} />
          </IconButton>
        </ButtonRow>

        {/* Import Area */}
        <AnimatePresence>
          {isImportVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Label>Paste names (one per line)</Label>
              <TextArea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder={"John\nJane\nBob\n..."}
              />
              <ButtonRow style={{ marginTop: 8 }}>
                <FlexButton
                  onClick={handleImport}
                >
                  Import
                </FlexButton>
                <IconButton onClick={() => setIsImportVisible(false)}>
                  <CloseIcon size={14} />
                </IconButton>
              </ButtonRow>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name List */}
        <Label>{names.length} name{names.length !== 1 ? 's' : ''}</Label>
        <NameList role="list" aria-label="Names list">
          {names.length === 0 ? (
            <EmptyState>
              No names yet!<br />
              Add names above or import a list to get started.
            </EmptyState>
          ) : (
            <AnimatePresence initial={false}>
              {names.map((name, index) => (
                <NameItem
                  key={`${name}-${index}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  role="listitem"
                >
                  <span>{name}</span>
                  <RemoveButton onClick={() => handleRemove(index)} title="Remove" aria-label={`Remove ${name}`}>
                    <CloseIcon size={10} />
                  </RemoveButton>
                </NameItem>
              ))}
            </AnimatePresence>
          )}
        </NameList>

        {/* Duration */}
        {setSpinDuration && (
          <div>
            <Label>Spin Duration</Label>
            <DurationGroup>
              {SPIN_DURATION_OPTIONS.map(duration => (
                <DurationButton
                  key={duration}
                  $active={spinDuration === duration}
                  onClick={() => setSpinDuration(duration)}
                >
                  {duration}s
                </DurationButton>
              ))}
            </DurationGroup>
          </div>
        )}

        {/* Spin Button */}
        <SpinButton
          as={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { initAudio(); onSpin(); }}
          disabled={isSpinning || names.length < 2}
        >
          {isSpinning ? 'Spinning...' : 'SPIN'}
        </SpinButton>
        <Label style={{ textAlign: 'center', marginTop: 4 }}>Press Space to spin · Esc to close</Label>

        {/* History */}
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

      {/* Save Modal */}
      {isSaveModalVisible && (
        <SaveModal
          listName={listName}
          onListNameChange={setListName}
          onSave={handleSaveList}
          onClose={() => setIsSaveModalVisible(false)}
        />
      )}

      {/* Load Modal */}
      {isLoadModalVisible && (
        <LoadModal
          savedLists={savedLists}
          onLoad={handleLoadList}
          onDelete={handleDeleteList}
          onClose={() => setIsLoadModalVisible(false)}
        />
      )}
    </>
  );
};

export default Controls;
