import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { BRAND_COLORS } from '../../utils/colors';
import { motion, AnimatePresence } from 'framer-motion';
import { initAudio } from '../../utils/sounds';
import { ShuffleIcon, CloseIcon, PlusIcon, ClearAllIcon, ImportIcon, SaveIcon, HistoryIcon } from '../common/Icons';

const ControlsContainer = styled(motion.div)`
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 40px;
  height: min-content;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
`;

const NameList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const NameItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 4px;
  border-radius: 6px;
  color: ${BRAND_COLORS.light};
  font-size: 0.9rem;
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.2);
  }
`;

const SpinButton = styled(Button)`
  width: 100%;
  font-size: 1.1rem;
  padding: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, ${BRAND_COLORS.orange} 0%, ${BRAND_COLORS.red} 100%);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
  }

  &:hover::after {
    transform: translateX(100%);
    transition: transform 0.6s ease-in-out;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 6px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const DurationGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const DurationButton = styled.button`
  flex: 1;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  padding: 5px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Label = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Section = styled.div`
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const HistoryList = styled.div`
  max-height: 100px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const HistoryItem = styled.div`
  padding: 4px 8px;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:first-child {
    color: ${BRAND_COLORS.yellow};
    font-weight: 600;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.85rem;
  resize: vertical;
  font-family: inherit;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: none;
    border-color: ${BRAND_COLORS.yellow};
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled(motion.div)`
  background: #1e293b;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h3`
  color: white;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
`;

const STORAGE_KEY = 'chooz_saved_lists';

const Controls = ({ names, setNames, onSpin, isSpinning, spinDuration, setSpinDuration, history = [] }) => {
  const [newName, setNewName] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [savedLists, setSavedLists] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [listName, setListName] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSavedLists(JSON.parse(saved));
    }
  }, []);

  const handleAdd = () => {
    if (newName.trim()) {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const handleRemove = (index) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handleShuffle = () => {
    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setNames(shuffled);
  };

  const handleClearAll = () => {
    if (names.length > 0 && confirm('Clear all names?')) {
      setNames([]);
    }
  };

  const handleImport = () => {
    const newNames = importText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    if (newNames.length > 0) {
      setNames([...names, ...newNames]);
      setImportText('');
      setShowImport(false);
    }
  };

  const handleSaveList = () => {
    if (listName.trim() && names.length > 0) {
      const newList = { name: listName.trim(), names: [...names], date: Date.now() };
      const updated = [...savedLists.filter(l => l.name !== listName.trim()), newList];
      setSavedLists(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setListName('');
      setShowSaveModal(false);
    }
  };

  const handleLoadList = (list) => {
    setNames([...list.names]);
    setShowLoadModal(false);
  };

  const handleDeleteList = (listToDelete) => {
    const updated = savedLists.filter(l => l.name !== listToDelete.name);
    setSavedLists(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <>
      <ControlsContainer
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Add Name */}
        <ButtonRow>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a name..."
            style={{ flex: 1 }}
          />
          <IconButton onClick={handleAdd} title="Add name">
            <PlusIcon size={16} />
          </IconButton>
        </ButtonRow>

        {/* Action buttons */}
        <ButtonRow>
          <IconButton onClick={handleShuffle} disabled={names.length < 2} title="Shuffle">
            <ShuffleIcon size={14} />
          </IconButton>
          <IconButton onClick={() => setShowImport(!showImport)} title="Import names">
            <ImportIcon size={14} />
          </IconButton>
          <IconButton onClick={handleClearAll} disabled={names.length === 0} title="Clear all">
            <ClearAllIcon size={14} />
          </IconButton>
          <IconButton onClick={() => setShowSaveModal(true)} disabled={names.length === 0} title="Save list">
            <SaveIcon size={14} />
          </IconButton>
          <IconButton onClick={() => setShowLoadModal(true)} disabled={savedLists.length === 0} title="Load list">
            <HistoryIcon size={14} />
          </IconButton>
        </ButtonRow>

        {/* Import Area */}
        <AnimatePresence>
          {showImport && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Label>Paste names (one per line)</Label>
              <TextArea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="John&#10;Jane&#10;Bob&#10;..."
              />
              <ButtonRow style={{ marginTop: 8 }}>
                <Button
                  onClick={handleImport}
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                >
                  Import
                </Button>
                <IconButton onClick={() => setShowImport(false)}>
                  <CloseIcon size={14} />
                </IconButton>
              </ButtonRow>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name List */}
        <NameList>
          <AnimatePresence initial={false}>
            {names.map((name, index) => (
              <NameItem
                key={`${name}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <span>{name}</span>
                <RemoveButton onClick={() => handleRemove(index)} title="Remove">
                  <CloseIcon size={10} />
                </RemoveButton>
              </NameItem>
            ))}
          </AnimatePresence>
        </NameList>

        {/* Duration */}
        {setSpinDuration && (
          <div>
            <Label>Spin Duration</Label>
            <DurationGroup>
              {[3, 5, 10].map(d => (
                <DurationButton
                  key={d}
                  active={spinDuration === d}
                  onClick={() => setSpinDuration(d)}
                >
                  {d}s
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

        {/* History */}
        {history.length > 0 && (
          <Section>
            <Label>Recent Winners</Label>
            <HistoryList>
              {history.slice(0, 5).map((winner, i) => (
                <HistoryItem key={i}>
                  <span>{i + 1}.</span> {winner}
                </HistoryItem>
              ))}
            </HistoryList>
          </Section>
        )}
      </ControlsContainer>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveModal(false)}
          >
            <Modal
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalTitle>Save List</ModalTitle>
              <Input
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="List name..."
                style={{ marginBottom: 12 }}
              />
              <ButtonRow>
                <Button onClick={handleSaveList} style={{ flex: 1 }}>Save</Button>
                <IconButton onClick={() => setShowSaveModal(false)}>
                  <CloseIcon size={14} />
                </IconButton>
              </ButtonRow>
            </Modal>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Load Modal */}
      <AnimatePresence>
        {showLoadModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoadModal(false)}
          >
            <Modal
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalTitle>Load List</ModalTitle>
              {savedLists.map((list, i) => (
                <NameItem key={i} style={{ marginBottom: 8 }}>
                  <span onClick={() => handleLoadList(list)} style={{ cursor: 'pointer', flex: 1 }}>
                    {list.name} ({list.names.length})
                  </span>
                  <RemoveButton onClick={() => handleDeleteList(list)} title="Delete">
                    <CloseIcon size={10} />
                  </RemoveButton>
                </NameItem>
              ))}
              <IconButton onClick={() => setShowLoadModal(false)} style={{ marginTop: 8 }}>
                <CloseIcon size={14} />
              </IconButton>
            </Modal>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default Controls;
