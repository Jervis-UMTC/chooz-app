import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GAME_COLORS } from '../../utils/colors';
import { playUiClick } from '../../utils/sounds';
import { ShuffleIcon, CloseIcon, PlusIcon, ClearAllIcon, ImportIcon, SaveIcon, HistoryIcon, EditIcon } from './Icons';
import { SaveModal, LoadModal } from '../Wheel/ListModals';
import { parseImportText, saveNewList, deleteListFromStorage } from '../Wheel/ControlsUtils';
import {
  ControlsPanel,
  Label,
  NameListContainer,
  NameItem,
  ColorDot,
  RemoveBtn,
  ButtonRow,
  IconButton,
  WarningMessage,
  EmptyState,
  TextArea,
  FlexInput,
  FlexButton
} from './SharedNameControls.styles';

const STORAGE_KEY = 'chooz_saved_lists';
const DUPLICATE_WARNING_TIMEOUT_MS = 3000;

/**
 * SharedNameControls
 * A universal component for adding, editing, and managing a list of names.
 * Supports limits, lockouts during gameplay, colors, and local storage.
 *
 * @param {object} props
 * @param {string[]} props.names - Array of names.
 * @param {function} props.setNames - State setter for names.
 * @param {boolean} props.isLocked - Disables inputs when game is running.
 * @param {number} [props.maxNames=Infinity] - Maximum allowed names.
 * @param {boolean} [props.showColors=false] - Whether to show colored dots next to names.
 */
const SharedNameControls = ({ names, setNames, isLocked, maxNames = Infinity, showColors = false }) => {
  const [newName, setNewName] = useState('');
  const [isImportVisible, setIsImportVisible] = useState(false);
  const [importSource, setImportSource] = useState(''); // 'import' or 'edit'
  const [importText, setImportText] = useState('');
  const [savedLists, setSavedLists] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [isLoadModalVisible, setIsLoadModalVisible] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const handleAdd = useCallback(() => {
    playUiClick();
    const trimmed = newName.trim();
    if (trimmed) {
      if (names.length >= maxNames) {
        setDuplicateWarning(`Maximum limit of ${maxNames} names reached`);
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
  }, [newName, names, setNames, maxNames]);

  const handleRemove = useCallback((targetIndex) => {
    playUiClick();
    setNames(prev => prev.filter((_, index) => index !== targetIndex));
  }, [setNames]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleAdd();
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
    if (names.length > 0 && window.confirm('Clear all names?')) {
      playUiClick();
      setNames([]);
    }
  };

  const handleImport = () => {
    const parsedNames = parseImportText(importText)
      .filter(name => name.trim().length > 0); // extra safety: skip whitespace-only lines
    const uniqueNewNames = parsedNames.filter(
      (name, index, arr) => arr.findIndex(n => n.toLowerCase() === name.toLowerCase()) === index
    );

    const resultingNames = uniqueNewNames;

    if (resultingNames.length > maxNames) {
      setDuplicateWarning(`List capped at ${maxNames} names maximum`);
      setTimeout(() => setDuplicateWarning(''), DUPLICATE_WARNING_TIMEOUT_MS);
      setNames(resultingNames.slice(0, maxNames));
    } else {
      setNames(resultingNames);
    }

    setImportText('');
    setIsImportVisible(false);
    setImportSource('');
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
    <ControlsPanel>
      <ButtonRow>
        <FlexInput
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text');
            const lines = pasted.split(/[\r\n,\t]+/).map(n => n.trim()).filter(n => n.length > 0);
            // If paste contains multiple names, add them all directly
            if (lines.length > 1) {
              event.preventDefault();
              const currentLower = names.map(n => n.toLowerCase());
              const newNames = [];
              for (const line of lines) {
                const lower = line.toLowerCase();
                if (!currentLower.includes(lower) && !newNames.some(n => n.toLowerCase() === lower)) {
                  newNames.push(line);
                }
              }
              const combined = [...names, ...newNames];
              if (combined.length > maxNames) {
                setDuplicateWarning(`List capped at ${maxNames} names maximum`);
                setTimeout(() => setDuplicateWarning(''), DUPLICATE_WARNING_TIMEOUT_MS);
                setNames(combined.slice(0, maxNames));
              } else {
                setNames(combined);
              }
              setNewName('');
            }
          }}
          placeholder={names.length >= maxNames ? `${maxNames} name limit reached` : "Add a name..."}
          disabled={names.length >= maxNames || isLocked}
          aria-label="Enter name to add"
        />
        <IconButton onClick={handleAdd} disabled={names.length >= maxNames || isLocked} title="Add name" aria-label="Add name">
          <PlusIcon size={16} />
        </IconButton>
      </ButtonRow>

      {duplicateWarning && <WarningMessage role="alert">{duplicateWarning}</WarningMessage>}

      <ButtonRow role="toolbar" aria-label="List actions">
        <IconButton onClick={handleShuffle} disabled={names.length < 2 || isLocked} title="Shuffle" aria-label="Shuffle names">
          <ShuffleIcon size={14} />
        </IconButton>
        <IconButton onClick={() => {
          if (isImportVisible && importSource === 'import') {
            setIsImportVisible(false);
            setImportSource('');
          } else {
            setImportSource('import');
            setImportText(names.length > 0 ? names.join('\n') + '\n' : '');
            setIsImportVisible(true);
          }
        }} disabled={isLocked} title="Import / Edit names" aria-label="Import names">
          <ImportIcon size={14} />
        </IconButton>
        <IconButton onClick={() => {
          if (isImportVisible && importSource === 'edit') {
            setIsImportVisible(false);
            setImportSource('');
          } else {
            setImportSource('edit');
            setImportText(names.join('\n') + (names.length > 0 ? '\n' : ''));
            setIsImportVisible(true);
          }
        }} disabled={isLocked || names.length === 0} title="Bulk Edit" aria-label="Bulk Edit names">
          <EditIcon size={14} />
        </IconButton>
        <IconButton onClick={handleClearAll} disabled={names.length === 0 || isLocked} title="Clear all" aria-label="Clear all names">
          <ClearAllIcon size={14} />
        </IconButton>
        <IconButton onClick={() => setIsSaveModalVisible(true)} disabled={names.length === 0 || isLocked} title="Save list" aria-label="Save list">
          <SaveIcon size={14} />
        </IconButton>
        <IconButton onClick={() => setIsLoadModalVisible(true)} disabled={savedLists.length === 0 || isLocked} title="Load list" aria-label="Load saved list">
          <HistoryIcon size={14} />
        </IconButton>
      </ButtonRow>

      <AnimatePresence>
        {isImportVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '4px', paddingBottom: '8px' }}>
              <Label>{importSource === 'edit' ? 'Edit current list' : 'Paste or edit names'}</Label>
              <TextArea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder={"John\nJane\nBob\n..."}
              />
              <ButtonRow style={{ marginTop: 8 }}>
                <FlexButton onClick={handleImport}>
                  Save Changes
                </FlexButton>
                <IconButton onClick={() => setIsImportVisible(false)} title="Close" aria-label="Close edit panel">
                  <CloseIcon size={14} />
                </IconButton>
              </ButtonRow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: '0' }}>
        <Label>
          {names.length} name{names.length !== 1 ? 's' : ''}
          {maxNames !== Infinity ? ` / ${maxNames}` : ''}
        </Label>
        <NameListContainer role="list" aria-label="Names list">
          {names.length === 0 ? (
            <EmptyState>
              No names yet!<br />
              Add names above or click the import button to paste a list.
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    {showColors && <ColorDot $color={GAME_COLORS[index % GAME_COLORS.length]} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </span>
                  </div>
                  <RemoveBtn onClick={() => handleRemove(index)} title="Remove" aria-label={`Remove ${name}`} disabled={isLocked}>
                    <CloseIcon size={12} />
                  </RemoveBtn>
                </NameItem>
              ))}
            </AnimatePresence>
          )}
        </NameListContainer>
      </div>

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
    </ControlsPanel>
  );
};

export default SharedNameControls;
