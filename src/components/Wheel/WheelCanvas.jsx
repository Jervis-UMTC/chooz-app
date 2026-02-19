import { useRef, useEffect, useState } from 'react';
import { GAME_COLORS, BRAND_COLORS } from '../../utils/colors';
import { playTick, playWin, initAudio } from '../../utils/sounds';

/* ── Drawing Constants ────────────────────────────── */

const IDLE_ROTATION_SPEED = 0.005;
const HUB_RADIUS_RATIO = 0.15;
const MIN_HUB_RADIUS_PX = 30;
const HUB_INNER_RATIO = 0.4;
const HUB_STROKE_WIDTH = 5;
const SEGMENT_STROKE_WIDTH = 2;
const FONT_SIZE_DIVISOR = 14;
const TEXT_PADDING_PX = 15;
const POINTER_HALF_WIDTH_PX = 25;
const POINTER_HEIGHT_PX = 35;
const POINTER_OFFSET_PX = 5;
const POINTER_STROKE_WIDTH = 3;
const SHADOW_BLUR_PX = 10;
const MIN_LABEL_SIZE_PX = 20;
const LABEL_SIZE_RATIO = 0.5;
const TOP_RESERVED_RATIO = 0.1;
const MIN_TOP_RESERVED_PX = 40;
const BOTTOM_PADDING_PX = 10;
const SIDE_PADDING_PX = 20;
const EASING_BASE = 2;
const EASING_EXPONENT_FACTOR = -10;
const MIN_EXTRA_ROTATIONS = 3;
const EXTRA_ROTATION_MULTIPLIER = 1.5;
const RANDOM_OFFSET_RANGE = 0.05;
const TICK_MIN_PITCH = 0.8;
const TICK_PITCH_RANGE = 0.4;
const TICK_SPEED_THRESHOLD = 0.5;
const PLACEHOLDER_TEXT = 'Please add a name';

/**
 * Truncates text to fit within a maximum pixel width, appending "..." if needed.
 * @param {CanvasRenderingContext2D} canvasContext - The 2D canvas context for text measurement.
 * @param {string} text - The full text string to potentially truncate.
 * @param {number} maxWidth - Maximum allowed width in pixels.
 * @returns {string} The original or truncated text.
 */
const truncateText = (canvasContext, text, maxWidth) => {
  let width = canvasContext.measureText(text).width;
  if (width <= maxWidth) return text;

  let length = text.length;
  while (width > maxWidth && length > 0) {
    length--;
    const truncated = text.substring(0, length) + '...';
    width = canvasContext.measureText(truncated).width;
    if (width <= maxWidth) return truncated;
  }
  return text[0] + '...';
};

/**
 * Applies an exponential ease-out curve for smooth spin deceleration.
 * @param {number} progress - Normalized progress value from 0 to 1.
 * @returns {number} The eased value from 0 to 1.
 */
const applyEasing = (progress) => {
  return progress === 1 ? 1 : 1 - Math.pow(EASING_BASE, EASING_EXPONENT_FACTOR * progress);
};

/**
 * Draws the center hub (filled circle + inner dot + colored stroke).
 * @param {CanvasRenderingContext2D} canvasContext
 * @param {number} hubRadius
 * @param {number} devicePixelRatio
 * @param {string} activeColor
 */
const drawHub = (canvasContext, hubRadius, devicePixelRatio, activeColor) => {
  canvasContext.beginPath();
  canvasContext.arc(0, 0, hubRadius, 0, 2 * Math.PI);
  canvasContext.fillStyle = BRAND_COLORS.navy;
  canvasContext.shadowColor = 'rgba(0,0,0,0.5)';
  canvasContext.shadowBlur = SHADOW_BLUR_PX * devicePixelRatio;
  canvasContext.fill();
  canvasContext.strokeStyle = activeColor;
  canvasContext.lineWidth = HUB_STROKE_WIDTH * devicePixelRatio;
  canvasContext.stroke();
  canvasContext.beginPath();
  canvasContext.arc(0, 0, hubRadius * HUB_INNER_RATIO, 0, 2 * Math.PI);
  canvasContext.fillStyle = '#fff';
  canvasContext.fill();
};

/**
 * Draws the triangular pointer arrow at the top of the wheel.
 * @param {CanvasRenderingContext2D} canvasContext
 * @param {number} effectiveRadius
 * @param {number} devicePixelRatio
 * @param {string} activeColor
 */
const drawPointer = (canvasContext, effectiveRadius, devicePixelRatio, activeColor) => {
  canvasContext.beginPath();
  const pointerSize = POINTER_HALF_WIDTH_PX * devicePixelRatio;
  const arrowHeight = POINTER_HEIGHT_PX * devicePixelRatio;
  canvasContext.moveTo(pointerSize, -effectiveRadius - (POINTER_OFFSET_PX * devicePixelRatio));
  canvasContext.lineTo(-pointerSize, -effectiveRadius - (POINTER_OFFSET_PX * devicePixelRatio));
  canvasContext.lineTo(0, -effectiveRadius + arrowHeight);
  canvasContext.closePath();
  canvasContext.fillStyle = activeColor;
  canvasContext.shadowColor = 'rgba(0,0,0,0.4)';
  canvasContext.shadowBlur = SHADOW_BLUR_PX * devicePixelRatio;
  canvasContext.fill();
  canvasContext.strokeStyle = '#fff';
  canvasContext.lineWidth = POINTER_STROKE_WIDTH * devicePixelRatio;
  canvasContext.stroke();
};

/**
 * Draws the active segment name above the wheel.
 * @param {CanvasRenderingContext2D} canvasContext
 * @param {string} activeName
 * @param {string} activeColor
 * @param {number} topReservedPixels
 * @param {number} devicePixelRatio
 */
const drawActiveLabel = (canvasContext, activeName, activeColor, topReservedPixels, devicePixelRatio) => {
  const indicatorY = topReservedPixels / 2;
  canvasContext.translate(0, indicatorY);
  canvasContext.textAlign = 'center';
  canvasContext.textBaseline = 'middle';
  const labelSize = Math.max(MIN_LABEL_SIZE_PX * devicePixelRatio, topReservedPixels * LABEL_SIZE_RATIO);
  canvasContext.font = `800 ${labelSize}px sans-serif`;
  canvasContext.shadowColor = activeColor;
  canvasContext.shadowBlur = TEXT_PADDING_PX * devicePixelRatio;
  canvasContext.fillStyle = activeColor;
  canvasContext.fillText(activeName, 0, 0);
  canvasContext.shadowBlur = 0;
  canvasContext.lineWidth = POINTER_STROKE_WIDTH;
  canvasContext.strokeStyle = '#0f172a';
  canvasContext.strokeText(activeName, 0, 0);
  canvasContext.fillText(activeName, 0, 0);
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
    const numSegments = effectiveNames.length;
    const segmentAngle = (2 * Math.PI) / numSegments;

    effectiveNames.forEach((name, index) => {
      offscreenContext.beginPath();
      offscreenContext.moveTo(centerX, centerY);
      offscreenContext.arc(centerX, centerY, effectiveRadius, index * segmentAngle, (index + 1) * segmentAngle);
      offscreenContext.fillStyle = GAME_COLORS[index % GAME_COLORS.length];
      offscreenContext.fill();
      offscreenContext.strokeStyle = 'rgba(255,255,255,0.15)';
      offscreenContext.lineWidth = SEGMENT_STROKE_WIDTH * devicePixelRatio;
      offscreenContext.stroke();

      offscreenContext.save();
      offscreenContext.translate(centerX, centerY);
      offscreenContext.rotate((index + 0.5) * segmentAngle);
      offscreenContext.textAlign = 'left';
      offscreenContext.textBaseline = 'middle';
      offscreenContext.fillStyle = '#fff';

      const fontSize = effectiveRadius / FONT_SIZE_DIVISOR;
      offscreenContext.font = `800 ${fontSize}px sans-serif`;
      offscreenContext.shadowColor = 'rgba(0,0,0,0.5)';
      offscreenContext.shadowBlur = 4 * devicePixelRatio;

      const textStart = hubRadius + (TEXT_PADDING_PX * devicePixelRatio);
      const margin = TEXT_PADDING_PX * devicePixelRatio;
      const maxTextWidth = effectiveRadius - textStart - margin;
      const textToDisplay = truncateText(offscreenContext, name, maxTextWidth);

      offscreenContext.fillText(textToDisplay, textStart, 0);
      offscreenContext.restore();
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
        canvasContext.translate(centerX, centerY);
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
        style={{ width: '100%', height: '100%', display: 'block', cursor: (mustSpin || isDemo) ? 'default' : 'pointer' }}
      />
    </div>
  );
};

export default WheelCanvas;
