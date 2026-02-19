import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';

/* ── Sizes ────────────────────────────── */

const COIN_SIZE = '240px';
const COIN_SIZE_TABLET = '200px';
const COIN_SIZE_MOBILE = '160px';

/* ── Keyframes ────────────────────────────── */

const flipToHeads = keyframes`
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(1800deg); }
`;

const flipToTails = keyframes`
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(1980deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const floatIdle = keyframes`
  0%, 100% { transform: translateY(0px) rotateY(0deg); }
  25% { transform: translateY(-6px) rotateY(3deg); }
  50% { transform: translateY(-10px) rotateY(0deg); }
  75% { transform: translateY(-6px) rotateY(-3deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 40px rgba(254, 221, 40, 0.15), 0 0 80px rgba(254, 221, 40, 0.05); }
  50% { box-shadow: 0 0 60px rgba(254, 221, 40, 0.25), 0 0 120px rgba(254, 221, 40, 0.1); }
`;

const coinShine = keyframes`
  0% { transform: rotate(0deg) translateX(-150%) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(-150%) rotate(-360deg); }
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
  gap: 32px;
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

  @media (max-width: 600px) {
    top: 14px;
    left: 14px;
  }
`;

export const ControlButtons = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 50;

  @media (max-width: 600px) {
    top: 14px;
    right: 14px;
  }
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
  -webkit-backdrop-filter: blur(8px);
  min-height: 40px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }
`;

/* ── Coin ────────────────────────────── */

export const CoinStage = styled.div`
  perspective: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${({ $isFlipping }) => $isFlipping ? 'none' : css`${floatIdle} 4s ease-in-out infinite`};
  filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.5));
  flex-shrink: 0;
`;

export const CoinBody = styled.div`
  width: ${COIN_SIZE};
  height: ${COIN_SIZE};
  position: relative;
  transform-style: preserve-3d;
  transition: ${({ $isFlipping }) => $isFlipping ? 'none' : 'transform 0.3s ease'};

  ${({ $isFlipping, $result }) => $isFlipping && $result === 'heads' && css`
    animation: ${flipToHeads} 1.5s ease-out forwards;
  `}

  ${({ $isFlipping, $result }) => $isFlipping && $result === 'tails' && css`
    animation: ${flipToTails} 1.5s ease-out forwards;
  `}

  @media (max-width: 900px) {
    width: ${COIN_SIZE_TABLET};
    height: ${COIN_SIZE_TABLET};
  }

  @media (max-width: 600px) {
    width: ${COIN_SIZE_MOBILE};
    height: ${COIN_SIZE_MOBILE};
  }

  @media (max-height: 600px) {
    width: ${COIN_SIZE_MOBILE};
    height: ${COIN_SIZE_MOBILE};
  }
`;

const CoinFaceBase = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow:
    0 0 0 6px rgba(0, 0, 0, 0.15),
    inset 0 0 0 3px rgba(255, 255, 255, 0.06),
    inset 0 -5px 16px rgba(0, 0, 0, 0.25),
    inset 0 5px 16px rgba(255, 255, 255, 0.15),
    0 0 50px rgba(254, 221, 40, 0.08);

  &::after {
    content: '';
    position: absolute;
    width: 40%;
    height: 200%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.06) 45%,
      rgba(255, 255, 255, 0.12) 50%,
      rgba(255, 255, 255, 0.06) 55%,
      transparent 100%
    );
    animation: ${coinShine} 6s linear infinite;
    pointer-events: none;
  }
`;

export const CoinInnerRing = styled.div`
  position: absolute;
  width: 86%;
  height: 86%;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
`;

export const CoinContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  z-index: 1;
`;

export const HeadsFace = styled(CoinFaceBase)`
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.18) 0%, transparent 50%),
    radial-gradient(circle at 65% 70%, rgba(0, 0, 0, 0.12) 0%, transparent 50%),
    linear-gradient(160deg, #fde68a 0%, #f59e0b 20%, #d97706 40%, #b45309 55%, #d97706 70%, #f59e0b 85%, #fbbf24 100%);
  animation: ${pulseGlow} 3s ease-in-out infinite;
`;

export const TailsFace = styled(CoinFaceBase)`
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 65% 70%, rgba(0, 0, 0, 0.15) 0%, transparent 50%),
    linear-gradient(160deg, #e2e8f0 0%, #94a3b8 20%, #64748b 40%, #475569 55%, #64748b 70%, #94a3b8 85%, #cbd5e1 100%);
  transform: rotateX(180deg);
`;

export const CoinSymbol = styled.div`
  font-size: 3.2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));

  @media (max-width: 900px) {
    font-size: 2.8rem;
  }

  @media (max-width: 600px) {
    font-size: 2.2rem;
  }
`;

export const CoinLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  opacity: 0.6;

  @media (max-width: 600px) {
    font-size: 0.55rem;
    letter-spacing: 0.2em;
  }
`;

export const CoinEdge = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transform-style: preserve-3d;

  &::before, &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #92400e;
    box-sizing: border-box;
  }

  &::before {
    transform: translateZ(-2px);
    border-color: #78350f;
  }

  &::after {
    transform: translateZ(-4px);
    border-color: #451a03;
  }
`;

/* ── Result ────────────────────────────── */

export const ResultArea = styled(motion.div)`
  text-align: center;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-height: 600px) {
    min-height: 40px;
  }
`;

export const ResultText = styled(motion.div)`
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: ${({ $result }) => $result === 'heads'
    ? `linear-gradient(135deg, ${BRAND_COLORS.yellow}, #f59e0b, ${BRAND_COLORS.orange})`
    : 'linear-gradient(135deg, #e2e8f0, #94a3b8, #64748b)'
  };
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));

  @media (max-width: 600px) {
    font-size: 2rem;
  }

  @media (max-height: 600px) {
    font-size: 1.6rem;
  }
`;

/* ── Flip Button ────────────────────────────── */

export const FlipButton = styled(motion.button)`
  background: linear-gradient(135deg, ${BRAND_COLORS.yellow} 0%, ${BRAND_COLORS.orange} 100%);
  border: none;
  color: #1a0f00;
  padding: 14px 44px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 6px 24px -6px ${BRAND_COLORS.orange}80;
  min-height: 50px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  flex-shrink: 0;

  &:hover {
    box-shadow: 0 10px 36px -6px ${BRAND_COLORS.orange}aa;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 600px) {
    padding: 12px 36px;
    font-size: 1rem;
    min-height: 46px;
  }
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

  @media (max-width: 600px) {
    padding: 12px 16px;
  }
`;

export const HistoryLabel = styled.span`
  color: #64748b;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
`;

export const HistoryDots = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 260px;
`;

export const HistoryDot = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $result }) => $result === 'heads'
    ? `linear-gradient(135deg, ${BRAND_COLORS.yellow}, ${BRAND_COLORS.orange})`
    : 'linear-gradient(135deg, #94a3b8, #475569)'
  };
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: default;
`;

export const StatsText = styled.span`
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 500;
`;
