import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { BRAND_COLORS } from '../../utils/colors';
import { motion, AnimatePresence } from 'framer-motion';

const ControlsContainer = styled(motion.div)`
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 40px;
  height: min-content;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
`;

const NameList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
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
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 6px;
  border-radius: 8px;
  color: ${BRAND_COLORS.light};
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
  font-size: 1.1rem;
  padding: 4px;
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
  font-size: 1.25rem;
  padding: 16px;
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

const Controls = ({ names, setNames, onSpin, isSpinning }) => {
  const [newName, setNewName] = useState('');

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

  return (
    <ControlsContainer
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a name..."
        />
        <Button
          onClick={handleAdd}
          style={{ padding: '8px 16px', background: BRAND_COLORS.navy, border: `1px solid ${BRAND_COLORS.yellow}`, color: BRAND_COLORS.yellow }}
        >
          +
        </Button>
      </div>

      <NameList>
        <AnimatePresence initial={false}>
          {names.map((name, index) => (
            <NameItem
              key={`${name}-${index}`}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span style={{ fontWeight: 500 }}>{name}</span>
              <RemoveButton onClick={() => handleRemove(index)} title="Remove">
                ✕
              </RemoveButton>
            </NameItem>
          ))}
        </AnimatePresence>
      </NameList>

      <SpinButton
        as={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSpin}
        disabled={isSpinning || names.length < 2}
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </SpinButton>
    </ControlsContainer>
  );
};

export default Controls;
