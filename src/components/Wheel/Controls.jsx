import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { BRAND_COLORS } from '../../utils/colors';

const ControlsContainer = styled.div`
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 40px;
  height: min-content;
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

const NameItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: ${BRAND_COLORS.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 4px;
  
  &:hover {
    color: #f87171;
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
    <ControlsContainer>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a name..."
        />
        <Button onClick={handleAdd} style={{ padding: '8px 16px' }}>+</Button>
      </div>

      <NameList>
        {names.map((name, index) => (
          <NameItem key={index}>
            {name}
            <RemoveButton onClick={() => handleRemove(index)}>&times;</RemoveButton>
          </NameItem>
        ))}
      </NameList>

      <Button onClick={onSpin} disabled={isSpinning || names.length < 2} style={{ width: '100%', fontSize: '1.2rem', padding: '16px' }}>
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </Button>
    </ControlsContainer>
  );
};

export default Controls;
