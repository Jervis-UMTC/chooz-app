import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';
import { Button } from './Button';
import { Input } from './Input';

export const ControlsPanel = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const Label = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  margin-bottom: 4px;
`;

export const NameListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15);
    border-radius: 4px;
  }
`;

export const NameItem = styled(motion.li)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  gap: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

export const ColorDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

export const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 2px;
  display: flex;
  transition: background-color 0.2s;
  border-radius: 4px;
  &:hover { background-color: rgba(239, 68, 68, 0.2); }
  &:disabled { opacity: 0.4; cursor: not-allowed; hover: none; }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  line-height: 1.5;
`;

export const WarningMessage = styled.div`
  color: #f59e0b;
  font-size: 0.75rem;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 6px;
  margin-top: -4px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 6px;
`;

export const IconButton = styled.button`
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
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${BRAND_COLORS.orange}40;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
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
  
  &::placeholder { color: rgba(255, 255, 255, 0.3); }
  &:focus { outline: none; border-color: ${BRAND_COLORS.orange}; }
`;

export const FlexInput = styled(Input)`
  flex: 1;
`;

export const FlexButton = styled(Button)`
  flex: 1;
  padding: 8px;
  font-size: 0.85rem;
`;
