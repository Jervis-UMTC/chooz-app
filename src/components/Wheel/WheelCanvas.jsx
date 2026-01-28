import React, { useRef, useEffect, useState } from 'react';
import { GAME_COLORS, BRAND_COLORS } from '../../utils/colors';
import { playTick, playWin, initAudio } from '../../utils/sounds';

const truncateText = (ctx, text, maxWidth) => {
  let width = ctx.measureText(text).width;
  if (width <= maxWidth) return text;

  let len = text.length;
  while (width > maxWidth && len > 0) {
    len--;
    const truncated = text.substring(0, len) + '...';
    width = ctx.measureText(truncated).width;
    if (width <= maxWidth) return truncated;
  }
  return text[0] + '...';
};

const WheelCanvas = ({ names, mustSpin, prizeNumber, onStopSpinning, onSpin, spinDuration = 5 }) => {
  const effectiveNames = names.length > 0 ? names : ['Please add a name'];
  const isDemo = names.length === 0;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameId = useRef(null);
  const isSpinningRef = useRef(false);
  const hasFinishedSpinningRef = useRef(false);
  const speedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const geometryRef = useRef({ centerX: 0, centerY: 0, hubRadius: 0, dpr: 1 });
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
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;

    const topReservedRatio = 0.1;
    const topReservedPixels = Math.max(40 * dpr, canvas.height * topReservedRatio);
    const availableHeight = canvas.height - topReservedPixels - (10 * dpr);
    const availableWidth = canvas.width - (20 * dpr);
    const diameter = Math.min(availableWidth, availableHeight);
    const effectiveRadius = diameter / 2;
    const centerX = canvas.width / 2;
    const centerY = topReservedPixels + effectiveRadius;
    const hubRadius = Math.max(30 * dpr, effectiveRadius * 0.15);

    geometryRef.current = { centerX, centerY, hubRadius, dpr };

    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d');

    offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
    const numSegments = effectiveNames.length;
    const segmentAngle = (2 * Math.PI) / numSegments;

    effectiveNames.forEach((name, index) => {
      offCtx.beginPath();
      offCtx.moveTo(centerX, centerY);
      offCtx.arc(centerX, centerY, effectiveRadius, index * segmentAngle, (index + 1) * segmentAngle);
      offCtx.fillStyle = GAME_COLORS[index % GAME_COLORS.length];
      offCtx.fill();
      offCtx.strokeStyle = 'rgba(255,255,255,0.15)';
      offCtx.lineWidth = 2 * dpr;
      offCtx.stroke();

      offCtx.save();
      offCtx.translate(centerX, centerY);
      offCtx.rotate((index + 0.5) * segmentAngle);
      offCtx.textAlign = 'left';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#fff';

      const fontSize = effectiveRadius / 14;
      offCtx.font = `800 ${fontSize}px sans-serif`;
      offCtx.shadowColor = 'rgba(0,0,0,0.5)';
      offCtx.shadowBlur = 4 * dpr;

      const textStart = hubRadius + (15 * dpr);
      const margin = 15 * dpr;
      const maxTextWidth = effectiveRadius - textStart - margin;
      const textToDisplay = truncateText(offCtx, name, maxTextWidth);

      offCtx.fillText(textToDisplay, textStart, 0);
      offCtx.restore();
    });

    offscreenCanvasRef.current = offscreen;
    const ctx = canvas.getContext('2d');

    const drawFrame = (timestamp) => {
      if (!offscreenCanvasRef.current) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      lastTimeRef.current = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isSpinningRef.current && !hasFinishedSpinningRef.current && !mustSpinRef.current) {
        rotationRef.current += 0.005;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(offscreenCanvasRef.current, 0, 0);

      if (hasFinishedSpinningRef.current && prizeNumber !== null && !isDemo) {
        ctx.translate(centerX, centerY);
        const time = Date.now() / 200;
        const alpha = 0.5 + 0.5 * Math.sin(time);
        const idx = prizeNumber;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, effectiveRadius, idx * segmentAngle, (idx + 1) * segmentAngle);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.fill();
        ctx.translate(-centerX, -centerY);
      }

      ctx.restore();

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
        const progress = speedRef.current > 0 ? Math.min(1, speedRef.current / 0.5) : 0.5;
        playTick(0.8 + progress * 0.4);
      }
      lastSegmentRef.current = activeIndex;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
      ctx.fillStyle = BRAND_COLORS.navy;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10 * dpr;
      ctx.fill();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 5 * dpr;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, hubRadius * 0.4, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      const pointerSize = 25 * dpr;
      const arrowHeight = 35 * dpr;
      ctx.moveTo(pointerSize, -effectiveRadius - (5 * dpr));
      ctx.lineTo(-pointerSize, -effectiveRadius - (5 * dpr));
      ctx.lineTo(0, -effectiveRadius + arrowHeight);
      ctx.closePath();
      ctx.fillStyle = activeColor;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 10 * dpr;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3 * dpr;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      const indicatorY = topReservedPixels / 2;
      ctx.translate(centerX, indicatorY);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelSize = Math.max(20 * dpr, topReservedPixels * 0.5);
      ctx.font = `800 ${labelSize}px sans-serif`;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 15 * dpr;
      ctx.fillStyle = activeColor;
      ctx.fillText(activeName, 0, 0);
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0f172a';
      ctx.strokeText(activeName, 0, 0);
      ctx.fillText(activeName, 0, 0);
      ctx.restore();
    };

    const animate = (timestamp) => {
      drawFrame(timestamp);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [names, prizeNumber, size, mustSpin]);

  const handleCanvasClick = (e) => {
    if (isDemo) return;
    if (!onSpin || isSpinningRef.current || mustSpinRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * geometryRef.current.dpr;
    const y = (e.clientY - rect.top) * geometryRef.current.dpr;

    const dx = x - geometryRef.current.centerX;
    const dy = y - geometryRef.current.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= geometryRef.current.hubRadius) {
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
      const randomOffset = (Math.random() - 0.5) * 0.05;
      const segmentCenter = (prizeNumber + 0.5) * segmentAngle;
      const targetAngleRaw = (3 * Math.PI / 2) - segmentCenter + randomOffset;

      let finalTarget = targetAngleRaw;
      while (finalTarget < initialRotation) {
        finalTarget += 2 * Math.PI;
      }
      const extraRotations = Math.max(3, Math.floor(spinDuration * 1.5));
      finalTarget += (extraRotations * 2 * Math.PI);

      const spinParams = {
        startRating: initialRotation,
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
          rotationRef.current = spinParams.startRating + (spinParams.target - spinParams.startRating) * ease;
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

  const applyEasing = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: '100%', height: '100%', display: 'block', cursor: (isSpinningRef.current || mustSpin || isDemo) ? 'default' : 'pointer' }}
      />
    </div>
  );
};

export default WheelCanvas;
