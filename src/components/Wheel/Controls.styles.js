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

