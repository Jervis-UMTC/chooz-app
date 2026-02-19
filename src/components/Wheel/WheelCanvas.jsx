import { useRef, useEffect, useState, memo } from 'react';
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

const TWO_PI = 2 * Math.PI;
const THREE_HALF_PI = 3 * Math.PI / 2;

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
  const geometryRef = useRef({ centerX: 0, centerY: 0, hubRadius: 0, effectiveRadius: 0, devicePixelRatio: 1, topReservedPixels: 0 });
  const lastSegmentRef = useRef(-1);
  const lastActiveColorRef = useRef(null);

  const mustSpinRef = useRef(mustSpin);
  useEffect(() => {
    mustSpinRef.current = mustSpin;
  }, [mustSpin]);

  const prizeNumberRef = useRef(prizeNumber);
  useEffect(() => {
    prizeNumberRef.current = prizeNumber;
  }, [prizeNumber]);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const offscreenCanvasRef = useRef(null);
  const hubCanvasRef = useRef(null);
  const pointerCanvasRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Pre-render segments to offscreen canvas (only when names or size change)
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

    geometryRef.current = { centerX, centerY, hubRadius, effectiveRadius, devicePixelRatio, topReservedPixels };

    // Pre-render wheel segments
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d');
    offCtx.clearRect(0, 0, offscreen.width, offscreen.height);

    const center = { x: centerX, y: centerY };
    effectiveNames.forEach((name, index) => {
      drawSegment(offCtx, name, index, effectiveNames.length, effectiveRadius, hubRadius, GAME_COLORS, center, devicePixelRatio);
    });
    offscreenCanvasRef.current = offscreen;

    // Pre-render hub and pointer for every possible color to avoid per-frame shadow cost
    // Instead we'll cache the last-used color and only rebuild when it changes
    hubCanvasRef.current = null;
    pointerCanvasRef.current = null;
    lastActiveColorRef.current = null;

  }, [names, size, effectiveNames, isDemo]);

  // Pre-render hub for a given color
  const getHubCanvas = (activeColor) => {
    if (lastActiveColorRef.current === activeColor && hubCanvasRef.current) {
      return hubCanvasRef.current;
    }
    const { hubRadius, effectiveRadius, devicePixelRatio } = geometryRef.current;
    const hubSize = (hubRadius + SHADOW_BLUR_PX * devicePixelRatio + 10) * 2;

    const hubCanvas = document.createElement('canvas');
    hubCanvas.width = hubSize;
    hubCanvas.height = hubSize;
    const hubCtx = hubCanvas.getContext('2d');
    hubCtx.translate(hubSize / 2, hubSize / 2);
    drawHub(hubCtx, hubRadius, devicePixelRatio, activeColor);
    hubCanvasRef.current = hubCanvas;

    const pointerCanvas = document.createElement('canvas');
    const pointerWidth = 100 * devicePixelRatio;
    const pointerHeight = (effectiveRadius + 80) * devicePixelRatio;
    pointerCanvas.width = pointerWidth;
    pointerCanvas.height = pointerHeight;
    const ptrCtx = pointerCanvas.getContext('2d');
    ptrCtx.translate(pointerWidth / 2, pointerHeight);
    drawPointer(ptrCtx, effectiveRadius, devicePixelRatio, activeColor);
    pointerCanvasRef.current = pointerCanvas;

    lastActiveColorRef.current = activeColor;
    return hubCanvas;
  };

  // Main render loop
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    if (!offscreenCanvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const segmentAngle = TWO_PI / effectiveNames.length;

    const drawFrame = (timestamp) => {
      if (!offscreenCanvasRef.current) return;
      const { centerX, centerY, effectiveRadius, hubRadius, devicePixelRatio, topReservedPixels } = geometryRef.current;

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // Idle rotation
      if (!isSpinningRef.current && !hasFinishedSpinningRef.current && !mustSpinRef.current) {
        rotationRef.current += IDLE_ROTATION_SPEED;
      }

      // Draw rotated wheel segments
      canvasCtx.save();
      canvasCtx.translate(centerX, centerY);
      canvasCtx.rotate(rotationRef.current);
      canvasCtx.translate(-centerX, -centerY);
      canvasCtx.drawImage(offscreenCanvasRef.current, 0, 0);

      // Winner highlight overlay
      if (hasFinishedSpinningRef.current && prizeNumberRef.current !== null && !isDemo) {
        canvasCtx.translate(centerX, centerY);
        const alpha = 0.5 + 0.5 * Math.sin(timestamp / 200);
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, 0);
        canvasCtx.arc(0, 0, effectiveRadius, prizeNumberRef.current * segmentAngle, (prizeNumberRef.current + 1) * segmentAngle);
        canvasCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        canvasCtx.fill();
        canvasCtx.translate(-centerX, -centerY);
      }

      canvasCtx.restore();

      // Calculate active segment
      const currentRotation = rotationRef.current;
      let normalizedRotation = currentRotation % TWO_PI;
      if (normalizedRotation < 0) normalizedRotation += TWO_PI;

      let activeAngle = THREE_HALF_PI - normalizedRotation;
      while (activeAngle < 0) activeAngle += TWO_PI;
      activeAngle = activeAngle % TWO_PI;

      const activeIndex = Math.floor(activeAngle / segmentAngle) % effectiveNames.length;
      const activeColor = GAME_COLORS[activeIndex % GAME_COLORS.length];
      const activeName = effectiveNames[activeIndex];

      // Tick sound on segment change
      if (isSpinningRef.current && lastSegmentRef.current !== -1 && lastSegmentRef.current !== activeIndex) {
        const tickProgress = speedRef.current > 0 ? Math.min(1, speedRef.current / TICK_SPEED_THRESHOLD) : 0.5;
        playTick(TICK_MIN_PITCH + tickProgress * TICK_PITCH_RANGE);
      }
      lastSegmentRef.current = activeIndex;

      // Draw hub and pointer from cached offscreen canvases
      const hubCanvas = getHubCanvas(activeColor);
      canvasCtx.drawImage(hubCanvas, centerX - hubCanvas.width / 2, centerY - hubCanvas.height / 2);
      canvasCtx.drawImage(pointerCanvasRef.current, centerX - pointerCanvasRef.current.width / 2, centerY - pointerCanvasRef.current.height);

      // Active label (lightweight — no shadow caching needed, text changes every segment)
      canvasCtx.save();
      canvasCtx.translate(centerX, 0);
      drawActiveLabel(canvasCtx, activeName, activeColor, topReservedPixels, devicePixelRatio);
      canvasCtx.restore();
    };

    const animate = (timestamp) => {
      drawFrame(timestamp);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [size, effectiveNames, isDemo]);

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
      const segAngle = TWO_PI / numSegments;
      const randomOffset = (Math.random() - 0.5) * RANDOM_OFFSET_RANGE;
      const segmentCenter = (prizeNumber + 0.5) * segAngle;
      const targetAngleRaw = THREE_HALF_PI - segmentCenter + randomOffset;

      let finalTarget = targetAngleRaw;
      while (finalTarget < initialRotation) {
        finalTarget += TWO_PI;
      }
      const extraRotations = Math.max(MIN_EXTRA_ROTATIONS, Math.floor(spinDuration * EXTRA_ROTATION_MULTIPLIER));
      finalTarget += (extraRotations * TWO_PI);

      const startRotation = initialRotation;
      const totalDelta = finalTarget - startRotation;
      let previousRotation = initialRotation;

      const step = (timestamp) => {
        if (!start) start = timestamp;

        if (!mustSpinRef.current) {
          rotationRef.current = finalTarget;
          isSpinningRef.current = false;
          hasFinishedSpinningRef.current = true;
          speedRef.current = 0;
          onStopSpinning();
          return;
        }

        const progress = (timestamp - start) / duration;

        if (progress < 1) {
          const ease = applyEasing(progress);
          const newRotation = startRotation + totalDelta * ease;
          speedRef.current = Math.abs(newRotation - previousRotation);
          previousRotation = newRotation;
          rotationRef.current = newRotation;
          requestAnimationFrame(step);
        } else {
          rotationRef.current = finalTarget;
          isSpinningRef.current = false;
          hasFinishedSpinningRef.current = true;
          speedRef.current = 0;
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

export default memo(WheelCanvas);
