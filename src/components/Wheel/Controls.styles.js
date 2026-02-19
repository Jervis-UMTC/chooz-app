import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const ControlsContainer = styled(motion.div)`
  background-color: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: min-content;
  max-height: 70vh; 
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;

  @media (max-width: 900px) {
    width: 100%;
    max-width: none;
    border-radius: 16px;
    padding: 16px;
    gap: 10px;
    max-height: none;
    flex-shrink: 0;
  }
`;

export const NameList = styled.ul`
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

export const NameItem = styled(motion.li)`
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

export const RemoveButton = styled.button`
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

export const SpinButton = styled(Button)`
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
    box-shadow: 0 0 0 2px ${BRAND_COLORS.yellow}40;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const DurationGroup = styled.div`
  display: flex;
  gap: 6px;
`;

export const DurationButton = styled.button`
  flex: 1;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  padding: 5px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${BRAND_COLORS.yellow}40;
  }
`;

export const Label = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const Section = styled.div`
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

export const HistoryList = styled.div`
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

export const HistoryItem = styled.div`
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
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: none;
    border-color: ${BRAND_COLORS.yellow};
  }
`;

export const ModalOverlay = styled(motion.div)`
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

export const Modal = styled(motion.div)`
  background: #1e293b;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const ModalTitle = styled.h3`
  color: white;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
`;

export const FlexInput = styled(Input)`
  flex: 1;
`;

export const FlexButton = styled(Button)`
  flex: 1;
  padding: 8px;
  font-size: 0.85rem;
`;

