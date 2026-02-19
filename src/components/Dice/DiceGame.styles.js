import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

/* ── Sizes ────────────────────────────── */

const DICE_SIZE = '120px';
const DICE_SIZE_TABLET = '100px';
const DICE_SIZE_MOBILE = '80px';
const HALF = '60px';
const HALF_TAB = '50px';
const HALF_MOB = '40px';

/* ── Keyframes ────────────────────────────── */

const rollDice = keyframes`
  0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  10% { transform: rotateX(108deg) rotateY(72deg) rotateZ(36deg); }
  20% { transform: rotateX(252deg) rotateY(162deg) rotateZ(72deg); }
  30% { transform: rotateX(432deg) rotateY(270deg) rotateZ(108deg); }
  40% { transform: rotateX(612deg) rotateY(378deg) rotateZ(144deg); }
  50% { transform: rotateX(756deg) rotateY(468deg) rotateZ(180deg); }
  60% { transform: rotateX(864deg) rotateY(540deg) rotateZ(216deg); }
  70% { transform: rotateX(936deg) rotateY(594deg) rotateZ(252deg); }
  80% { transform: rotateX(990deg) rotateY(648deg) rotateZ(306deg); }
  90% { transform: rotateX(1044deg) rotateY(702deg) rotateZ(342deg); }
  100% { transform: rotateX(1080deg) rotateY(720deg) rotateZ(360deg); }
`;

const bounceSettle = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.06); }
  70% { transform: scale(0.97); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const floatIdle = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

/* ── Layout ────────────────────────────── */

export const GameContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  gap: 36px;
  padding: 80px 20px 40px;

  @media (max-width: 600px) {
    gap: 24px;
    padding: 70px 16px 24px;
  }

  @media (max-height: 600px) {
    gap: 16px;
    padding: 60px 16px 16px;
    justify-content: flex-start;
  }
`;

export const FloatingNav = styled.div`
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 50;
  @media (max-width: 600px) { top: 14px; left: 14px; }
`;

export const ControlButtons = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 50;
  @media (max-width: 600px) { top: 14px; right: 14px; }
`;

export const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 8px 18px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  min-height: 40px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
  &:active { transform: scale(0.96); }
`;

/* ── Dice ────────────────────────────── */

export const DiceRow = styled.div`
  display: flex;
  gap: 28px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 600px;
  perspective: 800px;
  
  @media (max-width: 600px) {
    gap: 20px;
    
    ${({ $count }) => $count === 3 && css`
      gap: 12px;
      transform: scale(0.9);
      
      @media (max-width: 400px) {
        transform: scale(0.75);
      }
    `}
  }
`;

export const DiceStage = styled.div`
  perspective: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${({ $isRolling }) => $isRolling
    ? css`${bounceSettle} 1.2s ease-out forwards`
    : css`${floatIdle} 3s ease-in-out infinite`};
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4));
`;

/* Rotation map: which face shows on top for each result */
const faceRotations = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateX(-90deg) rotateY(0deg)',
  3: 'rotateX(0deg) rotateY(90deg)',
  4: 'rotateX(0deg) rotateY(-90deg)',
  5: 'rotateX(90deg) rotateY(0deg)',
  6: 'rotateX(180deg) rotateY(0deg)',
};

export const DiceCube = styled.div`
  width: ${DICE_SIZE};
  height: ${DICE_SIZE};
  position: relative;
  transform-style: preserve-3d;

  ${({ $isRolling }) => $isRolling && css`
    animation: ${rollDice} 1.2s cubic-bezier(0.1, 0.7, 0.2, 1) forwards;
  `}

  ${({ $isRolling, $result }) => !$isRolling && $result && css`
    transform: ${faceRotations[$result]};
    transition: transform 0.3s ease;
  `}

  @media (max-width: 900px) { width: ${DICE_SIZE_TABLET}; height: ${DICE_SIZE_TABLET}; }
  @media (max-width: 600px) { width: ${DICE_SIZE_MOBILE}; height: ${DICE_SIZE_MOBILE}; }
  @media (max-height: 600px) { width: ${DICE_SIZE_MOBILE}; height: ${DICE_SIZE_MOBILE}; }
`;

/* ── Faces ────────────────────────────── */

const DiceFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 18%;
  gap: 0;
  backface-visibility: hidden;
  background: linear-gradient(145deg, #f5f5f5, #e0e0e0);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.6);

  @media (max-width: 600px) { border-radius: 10px; }
`;

export const Face1 = styled(DiceFace)`
  transform: translateZ(${HALF});
  @media (max-width: 900px) { transform: translateZ(${HALF_TAB}); }
  @media (max-width: 600px) { transform: translateZ(${HALF_MOB}); }
  @media (max-height: 600px) { transform: translateZ(${HALF_MOB}); }
`;
export const Face2 = styled(DiceFace)`
  transform: rotateX(90deg) translateZ(${HALF});
  @media (max-width: 900px) { transform: rotateX(90deg) translateZ(${HALF_TAB}); }
  @media (max-width: 600px) { transform: rotateX(90deg) translateZ(${HALF_MOB}); }
  @media (max-height: 600px) { transform: rotateX(90deg) translateZ(${HALF_MOB}); }
`;
export const Face3 = styled(DiceFace)`
  transform: rotateY(-90deg) translateZ(${HALF});
  @media (max-width: 900px) { transform: rotateY(-90deg) translateZ(${HALF_TAB}); }
  @media (max-width: 600px) { transform: rotateY(-90deg) translateZ(${HALF_MOB}); }
  @media (max-height: 600px) { transform: rotateY(-90deg) translateZ(${HALF_MOB}); }
`;
export const Face4 = styled(DiceFace)`
  transform: rotateY(90deg) translateZ(${HALF});
  @media (max-width: 900px) { transform: rotateY(90deg) translateZ(${HALF_TAB}); }
  @media (max-width: 600px) { transform: rotateY(90deg) translateZ(${HALF_MOB}); }
  @media (max-height: 600px) { transform: rotateY(90deg) translateZ(${HALF_MOB}); }
`;
export const Face5 = styled(DiceFace)`
  transform: rotateX(-90deg) translateZ(${HALF});
  @media (max-width: 900px) { transform: rotateX(-90deg) translateZ(${HALF_TAB}); }
  @media (max-width: 600px) { transform: rotateX(-90deg) translateZ(${HALF_MOB}); }
  @media (max-height: 600px) { transform: rotateX(-90deg) translateZ(${HALF_MOB}); }
`;
export const Face6 = styled(DiceFace)`
  transform: rotateX(180deg) translateZ(${HALF});
  @media (max-width: 900px) { transform: rotateX(180deg) translateZ(${HALF_TAB}); }
  @media (max-width: 600px) { transform: rotateX(180deg) translateZ(${HALF_MOB}); }
  @media (max-height: 600px) { transform: rotateX(180deg) translateZ(${HALF_MOB}); }
`;

/* ── Pips (dots) ────────────────────────────── */

export const Dot = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #4a1a1a, #1a0505);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.15);
  place-self: center;
`;

/* ── Result ────────────────────────────── */

export const ResultArea = styled(motion.div)`
  text-align: center;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-height: 600px) { min-height: 40px; }
`;

export const ResultText = styled(motion.div)`
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  background: linear-gradient(135deg, #fca5a5, #ef4444, #dc2626);
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  @media (max-width: 600px) { font-size: 1.8rem; }
  @media (max-height: 600px) { font-size: 1.5rem; }
`;

/* ── Roll Button ────────────────────────────── */

export const RollButton = styled(motion.button)`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  border: none;
  color: white;
  padding: 14px 44px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 6px 24px -6px rgba(239, 68, 68, 0.5);
  min-height: 50px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    box-shadow: 0 10px 36px -6px rgba(239, 68, 68, 0.7);
    transform: translateY(-2px);
  }
  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  @media (max-width: 600px) { padding: 12px 36px; font-size: 1rem; min-height: 46px; }
`;

/* ── Dice Count Selector ────────────────────────────── */

export const DiceCountRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const DiceCountButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ $active }) => $active ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.15)'};
  background: ${({ $active }) => $active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ $active }) => $active ? '#fca5a5' : '#94a3b8'};
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;

  &:hover { background: rgba(239, 68, 68, 0.15); }
`;

export const DiceCountLabel = styled.span`
  color: #64748b;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  margin-right: 4px;
`;

/* ── History ────────────────────────────── */

export const HistoryContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  @media (max-width: 600px) { padding: 12px 16px; }
`;

export const HistoryLabel = styled.span`
  color: #64748b;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
`;

export const HistoryItems = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 280px;
`;

export const HistoryChip = styled(motion.div)`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: default;
`;

export const TotalText = styled.span`
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 500;
`;
