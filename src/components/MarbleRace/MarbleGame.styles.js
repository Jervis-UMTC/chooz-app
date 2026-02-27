import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../utils/colors';


/* ── Layout ────────────────────────────── */

export const PageContainer = styled.div`
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

export const GameContainer = styled.div`
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
  min-width: 90px;
  min-height: 44px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.96);
  }
`;

export const MuteButton = styled(NavButton)`
  padding: 8px;
  min-width: 40px;
  border-radius: 50%;
`;

/* ── Canvas ────────────────────────────── */

export const CanvasWrapper = styled.div`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  max-width: 450px;
  max-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #1e293b;

  @media (max-width: 900px) {
    flex: 0 0 auto;
    width: 90vw;
    height: auto;
    max-width: 400px;
    max-height: 500px;
    aspect-ratio: 4 / 5;
  }
`;

/* ── Controls Panel ────────────────────────────── */

export const ControlsPanel = styled(motion.div)`
  display: flex;
  flex-direction: column;
  z-index: 10;
  width: 100%;
  max-width: 360px;
  gap: 12px;
`;

export const Label = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/* ── Mode Toggle ────────────────────────────── */

export const ModeRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const ModeButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? 'rgba(255,255,255,0.12)' : 'transparent'};
  color: ${props => props.$active ? '#fff' : 'rgba(255,255,255,0.5)'};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.08); }
`;

/* ── Race Button ────────────────────────────── */

export const RaceButton = styled(motion.button)`
  width: 100%;
  padding: 14px 24px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, ${BRAND_COLORS.orange}, ${BRAND_COLORS.red});
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: opacity 0.2s, transform 0.2s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

/* ── Results Modal ────────────────────────────── */

export const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ResultsModal = styled(motion.div)`
  background: linear-gradient(145deg, #1e293b, #0f172a);
  padding: 40px;
  border-radius: 24px;
  border: 1px solid rgba(34, 197, 94, 0.3);
  text-align: center;
  z-index: 100;
  position: relative;
  box-shadow: 0 0 60px rgba(34, 197, 94, 0.15), 0 20px 40px -10px rgba(0,0,0,0.5);
  max-width: 90%;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
`;

export const ResultsTitle = styled.h2`
  font-size: 1.4rem;
  color: #22c55e;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

export const WinnerName = styled(motion.div)`
  font-size: 3rem;
  font-weight: 800;
  margin: 16px 0;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  word-break: break-word;
`;

export const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 16px 0;
  text-align: left;
`;

export const LeaderboardEntry = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, ${props => props.$rank <= 3 ? '0.08' : '0.03'});
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${props => {
    if (props.$rank === 1) return '#fbbf24';
    if (props.$rank === 2) return '#94a3b8';
    if (props.$rank === 3) return '#cd7f32';
    return 'rgba(255,255,255,0.6)';
  }};
  font-weight: ${props => props.$rank <= 3 ? '700' : '400'};
`;

export const RankNumber = styled.span`
  min-width: 24px;
  text-align: center;
`;

export const ColorDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color || '#fff'};
  flex-shrink: 0;
  box-shadow: 0 0 4px rgba(0,0,0,0.3);
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
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.6);
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }
`;
