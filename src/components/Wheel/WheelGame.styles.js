import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';

export const GameContainer = styled(motion.div)`
  display: flex;
  flex-direction: row;
  align-items: center; 
  justify-content: space-evenly; 
  padding: 0 40px; 
  width: 100%;
  height: 100%; 
  overflow: hidden; 
  flex-wrap: nowrap; 
  position: relative;
  gap: 30px;
  transition: all 0.3s ease;
  
  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    padding: 70px 16px calc(20px + env(safe-area-inset-bottom, 0px)) 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export const FloatingNav = styled.div`
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 50;
  display: flex;
  gap: 15px;
  @media (max-width: 600px) {
    top: 15px;
    left: 15px;
    gap: 10px;
  }
`;

export const ControlButtons = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 50;
  display: flex;
  gap: 15px;
  @media (max-width: 600px) {
    top: 15px;
    right: 15px;
    gap: 10px;
  }
`;

export const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-weight: 500;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  min-width: 90px;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: scale(0.96);
  }
`;

export const StopButton = styled(NavButton)`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  min-width: 90px;
  justify-content: center;

  &:hover {
    background: rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
    color: white;
  }
`;

export const WheelWrapper = styled.div`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  max-width: 700px;
  max-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 900px) {
    flex: 0 0 auto;
    width: 90vw;
    height: auto;
    max-width: 350px;
    max-height: 350px;
    aspect-ratio: 1;
  }
  
  @media (max-height: 700px) and (max-width: 900px) {
    max-width: 280px;
    max-height: 280px;
  }
`;

export const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WinnerModal = styled(motion.div)`
  background: linear-gradient(145deg, #1e293b, #0f172a);
  padding: 50px;
  border-radius: 24px;
  border: 1px solid rgba(254, 221, 40, 0.3);
  text-align: center;
  z-index: 100;
  box-shadow: 0 0 60px rgba(254, 221, 40, 0.15), 0 20px 40px -10px rgba(0,0,0,0.5);
  max-width: 90%;
  width: 450px;
  
  @media (max-width: 500px) {
    padding: 30px 20px;
    border-radius: 20px;
  }
`;

export const WinnerTitle = styled.h2`
  font-size: 1.5rem;
  color: ${BRAND_COLORS.yellow};
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

export const WinnerName = styled(motion.div)`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 20px 0;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  word-break: break-word;
  
  @media (max-width: 500px) {
    font-size: 2.5rem;
    margin: 15px 0;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
  
  @media (max-width: 500px) {
    margin-top: 20px;
    gap: 10px;
  }
`;

export const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  @media (max-width: 500px) {
    padding: 10px 18px;
    font-size: 0.9rem;
  }
`;

export const RemoveButton = styled(ActionButton)`
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    color: white;
  }
`;

export const ControlsWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  width: 100%;
  max-width: 400px;
`;
