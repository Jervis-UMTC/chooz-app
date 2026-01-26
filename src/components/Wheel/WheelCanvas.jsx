import React, { useRef, useEffect } from 'react';
import { WHEEL_COLORS, BRAND_COLORS } from '../../utils/colors';

const WheelCanvas = ({ names, mustSpin, prizeNumber, onStopSpinning }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameId = useRef(null);
  const isSpinningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // High DPI fix
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const drawWheel = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      const numSegments = names.length;
      const segmentAngle = (2 * Math.PI) / numSegments;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      names.forEach((name, index) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, index * segmentAngle, (index + 1) * segmentAngle);
        ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate((index + 0.5) * segmentAngle);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Inter';
        ctx.fillText(name, radius - 20, 6);
        ctx.restore();
      });

      ctx.restore();

      // Draw Arrow
      ctx.beginPath();
      ctx.moveTo(centerX + 20, centerY - radius - 10);
      ctx.lineTo(centerX - 20, centerY - radius - 10);
      ctx.lineTo(centerX, centerY - radius + 20);
      ctx.fillStyle = BRAND_COLORS.navy;
      ctx.fill();
    };

    const animate = () => {
      if (isSpinningRef.current) {
        // Simple friction/easing logic placeholder
        // In a real app, use more robust physics or library like gl-matrix/popmotion
        // For MVP manual implementation:

        // This is a placeholder for the actual spinning logic which needs to stop at `prizeNumber`
        // Since custom canvas physics is complex to get pixel-perfect stop, 
        // I will use a simplified ease-out logic for now.

        // NOTE: For 'mustSpin' triggers, we'd calculate target rotation.
      }

      drawWheel();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    drawWheel(); // Initial draw

    // Cleanup
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [names]); // Re-draw when names change

  // Separate effect for spinning logic to avoid re-binding canvas context too often
  useEffect(() => {
    if (mustSpin && !isSpinningRef.current) {
      isSpinningRef.current = true;

      let start = null;
      const duration = 5000; // 5 seconds
      const initialRotation = rotationRef.current;

      // Calculate target rotation to land on prizeNumber
      // Sector 0 starts at 0 radians (right). 
      // We draw sectors clockwise.
      // Arrow is at TOP (-PI/2).
      // To land index i at Top, we need to rotate the wheel such that sector i is at -PI/2.
      // Current angle of sector i start: i * segmentAngle
      // Target angle: -PI/2 - (i + 0.5)*segmentAngle
      // Add extra rotations: 2 * PI * 5 (5 spins)

      const numSegments = names.length;
      const segmentAngle = (2 * Math.PI) / numSegments;
      const prizeAngle = (prizeNumber + 0.5) * segmentAngle;
      // We want the wheel rotation + prizeAngle to equal -PI/2 (top) modulo 2PI
      // WheelRotation = -PI/2 - prizeAngle

      const targetRotation = initialRotation + (2 * Math.PI * 5) + ((3 * Math.PI / 2) - (prizeNumber * segmentAngle) - (rotationRef.current % (2 * Math.PI)));
      // The math can be tricky, using a simpler library or just visual approximation might be safer initially 
      // but let's try a standard easing.

      const finalTarget = initialRotation + (10 * Math.PI) + (2 * Math.PI) - ((prizeNumber * segmentAngle) + (segmentAngle / 2));

      const spinParams = {
        startRating: rotationRef.current,
        target: finalTarget
      };

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;

        if (progress < 1) {
          // Ease out quart
          const ease = 1 - Math.pow(1 - progress, 4);
          rotationRef.current = spinParams.startRating + (spinParams.target - spinParams.startRating) * ease;
          requestAnimationFrame(step);
        } else {
          rotationRef.current = spinParams.target;
          isSpinningRef.current = false;
          onStopSpinning();
        }
      };

      requestAnimationFrame(step);
    }
  }, [mustSpin, prizeNumber, names.length, onStopSpinning]);

  return <canvas ref={canvasRef} style={{ width: '500px', height: '500px' }} />;
};

export default WheelCanvas;
