import { useRef, useEffect, useState } from 'react';
import { GAME_COLORS } from '../../utils/colors';
import { playTick, playWin, initAudio } from '../../utils/sounds';
import { DRAWING_CONSTANTS } from './WheelConstants';
import {
  drawHub,
  drawPointer,
  drawActiveLabel,
  drawSegment
} from './WheelDrawing';

const {
  IDLE_ROTATION_SPEED,
  HUB_RADIUS_RATIO,
  MIN_HUB_RADIUS_PX,
  TEXT_PADDING_PX,
  SHADOW_BLUR_PX,
  TOP_RESERVED_RATIO,
  MIN_TOP_RESERVED_PX,
  BOTTOM_PADDING_PX,
  SIDE_PADDING_PX,
  EASING_BASE,
  EASING_EXPONENT_FACTOR,
  MIN_EXTRA_ROTATIONS,
  EXTRA_ROTATION_MULTIPLIER,
  RANDOM_OFFSET_RANGE,
  TICK_MIN_PITCH,
  TICK_PITCH_RANGE,
  TICK_SPEED_THRESHOLD,
  PLACEHOLDER_TEXT,
} = DRAWING_CONSTANTS;

/**
 * Applies an exponential ease-out curve for smooth spin deceleration.
 * @param {number} progress - Normalized progress value from 0 to 1.
 * @returns {number} The eased value from 0 to 1.
 */
const applyEasing = (progress) => {
  return progress === 1 ? 1 : 1 - Math.pow(EASING_BASE, EASING_EXPONENT_FACTOR * progress);
};

const WheelCanvas = ({ names, mustSpin, prizeNumber, onStopSpinning, onSpin, spinDuration = 5 }) => {
  const effectiveNames = names.length > 0 ? names : [PLACEHOLDER_TEXT];
  const isDemo = names.length === 0;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameId = useRef(null);
  const isSpinningRef = useRef(false);
  const hasFinishedSpinningRef = useRef(false);
  const speedRef = useRef(0);
  const geometryRef = useRef({ centerX: 0, centerY: 0, hubRadius: 0, devicePixelRatio: 1 });
  const lastSegmentRef = useRef(-1);

  const mustSpinRef = useRef(mustSpin);
  useEffect(() => {
    mustSpinRef.current = mustSpin;
  }, [mustSpin]);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const offscreenCanvasRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;

    const canvas = canvasRef.current;
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = size.width * devicePixelRatio;
    canvas.height = size.height * devicePixelRatio;

    const topReservedPixels = Math.max(MIN_TOP_RESERVED_PX * devicePixelRatio, canvas.height * TOP_RESERVED_RATIO);
    const availableHeight = canvas.height - topReservedPixels - (BOTTOM_PADDING_PX * devicePixelRatio);
    const availableWidth = canvas.width - (SIDE_PADDING_PX * devicePixelRatio);
    const diameter = Math.min(availableWidth, availableHeight);
    const effectiveRadius = diameter / 2;
    const centerX = canvas.width / 2;
    const centerY = topReservedPixels + effectiveRadius;
    const hubRadius = Math.max(MIN_HUB_RADIUS_PX * devicePixelRatio, effectiveRadius * HUB_RADIUS_RATIO);

    geometryRef.current = { centerX, centerY, hubRadius, devicePixelRatio };

    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offscreenContext = offscreen.getContext('2d');

    offscreenContext.clearRect(0, 0, offscreen.width, offscreen.height);

    const center = { x: centerX, y: centerY };

    effectiveNames.forEach((name, index) => {
      drawSegment(
        offscreenContext,
        name,
        index,
        effectiveNames.length,
        effectiveRadius,
        hubRadius,
        GAME_COLORS,
        center,
        devicePixelRatio
      );
    });

    offscreenCanvasRef.current = offscreen;
    const canvasContext = canvas.getContext('2d');

    const drawFrame = () => {
      if (!offscreenCanvasRef.current) return;

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      if (!isSpinningRef.current && !hasFinishedSpinningRef.current && !mustSpinRef.current) {
        rotationRef.current += IDLE_ROTATION_SPEED;
      }

      canvasContext.save();
      canvasContext.translate(centerX, centerY);
      canvasContext.rotate(rotationRef.current);
      canvasContext.translate(-centerX, -centerY);
      canvasContext.drawImage(offscreenCanvasRef.current, 0, 0);

      if (hasFinishedSpinningRef.current && prizeNumber !== null && !isDemo) {
        // Draw winner highlight
        canvasContext.translate(centerX, centerY);
        const segmentAngle = (2 * Math.PI) / effectiveNames.length;
        const time = Date.now() / 200;
        const alpha = 0.5 + 0.5 * Math.sin(time);

        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.arc(0, 0, effectiveRadius, prizeNumber * segmentAngle, (prizeNumber + 1) * segmentAngle);
        canvasContext.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        canvasContext.fill();
        canvasContext.translate(-centerX, -centerY);
      }

      canvasContext.restore();

      const currentRotation = rotationRef.current;
      const activeSegmentAngle = (2 * Math.PI) / effectiveNames.length;

      let normalizedRotation = currentRotation % (2 * Math.PI);
      if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;

      let activeAngle = (3 * Math.PI / 2 - normalizedRotation);
      while (activeAngle < 0) activeAngle += 2 * Math.PI;
      activeAngle = activeAngle % (2 * Math.PI);

      const activeIndex = Math.floor(activeAngle / activeSegmentAngle) % effectiveNames.length;
      const activeColor = GAME_COLORS[activeIndex % GAME_COLORS.length];
      const activeName = effectiveNames[activeIndex];

      if (isSpinningRef.current && lastSegmentRef.current !== -1 && lastSegmentRef.current !== activeIndex) {
        const tickProgress = speedRef.current > 0 ? Math.min(1, speedRef.current / TICK_SPEED_THRESHOLD) : 0.5;
        playTick(TICK_MIN_PITCH + tickProgress * TICK_PITCH_RANGE);
      }
      lastSegmentRef.current = activeIndex;

      canvasContext.save();
      canvasContext.translate(centerX, centerY);
      drawHub(canvasContext, hubRadius, devicePixelRatio, activeColor);
      canvasContext.restore();

      canvasContext.save();
      canvasContext.translate(centerX, centerY);
      drawPointer(canvasContext, effectiveRadius, devicePixelRatio, activeColor);
      canvasContext.restore();

      canvasContext.save();
      canvasContext.translate(centerX, 0);
      drawActiveLabel(canvasContext, activeName, activeColor, topReservedPixels, devicePixelRatio);
      canvasContext.restore();
    };

    const animate = (timestamp) => {
      drawFrame(timestamp);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [names, prizeNumber, size, mustSpin, effectiveNames, isDemo]);

  const handleCanvasClick = (event) => {
    if (isDemo) return;
    if (!onSpin || isSpinningRef.current || mustSpinRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) * geometryRef.current.devicePixelRatio;
    const clickY = (event.clientY - rect.top) * geometryRef.current.devicePixelRatio;

    const deltaX = clickX - geometryRef.current.centerX;
    const deltaY = clickY - geometryRef.current.centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance <= geometryRef.current.hubRadius) {
      initAudio();
      onSpin();
    }
  };

  useEffect(() => {
    if (mustSpin && !isSpinningRef.current) {
      if (isDemo) {
        onStopSpinning();
        return;
      }

      isSpinningRef.current = true;
      hasFinishedSpinningRef.current = false;

      let start = null;
      const duration = spinDuration * 1000;
      const initialRotation = rotationRef.current;

      const numSegments = effectiveNames.length;
      const segmentAngle = (2 * Math.PI) / numSegments;
      const randomOffset = (Math.random() - 0.5) * RANDOM_OFFSET_RANGE;
      const segmentCenter = (prizeNumber + 0.5) * segmentAngle;
      const targetAngleRaw = (3 * Math.PI / 2) - segmentCenter + randomOffset;

      let finalTarget = targetAngleRaw;
      while (finalTarget < initialRotation) {
        finalTarget += 2 * Math.PI;
      }
      const extraRotations = Math.max(MIN_EXTRA_ROTATIONS, Math.floor(spinDuration * EXTRA_ROTATION_MULTIPLIER));
      finalTarget += (extraRotations * 2 * Math.PI);

      const spinParams = {
        startRotation: initialRotation,
        target: finalTarget
      };

      const step = (timestamp) => {
        if (!start) start = timestamp;

        if (!mustSpinRef.current) {
          rotationRef.current = spinParams.target;
          isSpinningRef.current = false;
          hasFinishedSpinningRef.current = true;
          onStopSpinning();
          return;
        }

        const progress = (timestamp - start) / duration;

        if (progress < 1) {
          const ease = applyEasing(progress);
          rotationRef.current = spinParams.startRotation + (spinParams.target - spinParams.startRotation) * ease;
          requestAnimationFrame(step);
        } else {
          rotationRef.current = spinParams.target;
          isSpinningRef.current = false;
          hasFinishedSpinningRef.current = true;
          playWin();
          onStopSpinning();
        }
      };

      requestAnimationFrame(step);
    }
  }, [mustSpin, prizeNumber, names.length, effectiveNames.length, onStopSpinning, spinDuration]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        role="img"
        aria-label="Spin wheel with name segments"
        style={{ width: '100%', height: '100%', display: 'block', cursor: (mustSpin || isDemo) ? 'default' : 'pointer' }}
      />
    </div>
  );
};

export default WheelCanvas;
