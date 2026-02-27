import { useRef, useEffect, useState, memo } from 'react';
import { COURSE, CAMERA, COLORS, OBSTACLES, MIXER } from './MarbleConstants';
import { createBalls, updateBalls, updateMixer } from './MarblePhysics';
import { generateCourse } from './MarbleObstacles';
import {
  drawBall,
  drawObstacle,
  drawFinishLine,
  drawWalls,
  drawBackground,
  drawLeaderboard,
  drawProgressBar,
  drawParticle,
  drawMixer
} from './MarbleDrawing';
import { playTick, playWin } from '../../utils/sounds';

/**
 * Canvas component for the Marble Race.
 * Handles physics simulation, rendering, and camera following.
 */
const MarbleCanvas = ({ names, racing, onRaceFinish, mode }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const ballsRef = useRef([]);
  const obstaclesRef = useRef([]);
  const particlesRef = useRef([]);
  const cameraYRef = useRef(0);
  const racingRef = useRef(false);
  const modeRef = useRef(mode);
  const finishYRef = useRef(0);
  const firstFinisherRef = useRef(null);
  const allFinishedRef = useRef(false);
  const mixerRef = useRef({ active: false, startTime: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
  }, [size]);

  // Start race
  useEffect(() => {
    if (racing && !racingRef.current) {
      racingRef.current = true;
      firstFinisherRef.current = null;
      allFinishedRef.current = false;
      cameraYRef.current = 0;

      const courseWidth = COURSE.WIDTH;
      const courseHeight = COURSE.HEIGHT;
      finishYRef.current = courseHeight - COURSE.FINISH_LINE_HEIGHT;
      obstaclesRef.current = generateCourse(courseWidth, courseHeight);
      ballsRef.current = createBalls(names, courseWidth);
      particlesRef.current = [];
      mixerRef.current = { active: true, startTime: 0 };
    }

    if (!racing) {
      racingRef.current = false;
    }
  }, [racing, names]);

  // Main render loop
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const courseWidth = COURSE.WIDTH;
    const viewportHeight = CAMERA.VIEWPORT_HEIGHT;
    const scaleX = canvas.width / courseWidth;
    const scaleY = canvas.height / viewportHeight;
    const scale = Math.min(scaleX, scaleY);

    let lastTickTime = 0;

    const render = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Center the course
      const offsetX = (canvas.width - courseWidth * scale) / 2;
      ctx.translate(offsetX, 0);
      ctx.scale(scale, scale);

      const cameraY = cameraYRef.current;

      // Background
      drawBackground(ctx, courseWidth, viewportHeight);

      // Walls
      drawWalls(ctx, courseWidth, cameraY, viewportHeight);

      // Obstacles
      for (const obs of obstaclesRef.current) {
        drawObstacle(ctx, obs, cameraY, viewportHeight);
      }

      // Finish line
      drawFinishLine(ctx, finishYRef.current, cameraY, courseWidth, viewportHeight);

      // Balls
      const balls = ballsRef.current;
      let leaderIndex = -1;
      let leaderY = -Infinity;
      for (let i = 0; i < balls.length; i++) {
        if (!balls[i].finished && balls[i].y > leaderY) {
          leaderY = balls[i].y;
          leaderIndex = i;
        }
      }

      // Sort by y so closer balls draw on top
      const sortedBalls = [...balls].sort((a, b) => a.y - b.y);

      // Physics step
      if (racingRef.current) {
        const mixer = mixerRef.current;

        // Mixer phase: spin balls before releasing
        if (mixer.active) {
          if (mixer.startTime === 0) mixer.startTime = timestamp;
          const elapsed = timestamp - mixer.startTime;
          const progress = Math.min(1, elapsed / MIXER.DURATION);

          updateMixer(balls, courseWidth, timestamp);

          // Draw mixer circle
          drawMixer(ctx, courseWidth, cameraY, viewportHeight, timestamp, progress);

          // Draw balls inside mixer
          for (const ball of sortedBalls) {
            drawBall(ctx, ball, cameraY, viewportHeight, false, size.width);
          }

          // Release when time is up
          if (elapsed >= MIXER.DURATION) {
            mixer.active = false;
            // Give all balls a downward push to start the race
            for (const ball of balls) {
              ball.vy = 2 + Math.random() * 2;
              ball.vx = (Math.random() - 0.5) * 3;
            }
          }
        } else {
          // Normal race phase
          const { collisions, newFinishers } = updateBalls(
            balls,
            obstaclesRef.current,
            courseWidth,
            finishYRef.current,
            timestamp,
            particlesRef.current
          );

          // Update and draw particles behind balls
          const particles = particlesRef.current;
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life -= 1 / p.maxLife;
            if (p.life <= 0) {
              particles.splice(i, 1);
            } else {
              drawParticle(ctx, p, cameraY, viewportHeight);
            }
          }

          // Draw Balls
          for (const ball of sortedBalls) {
            drawBall(ctx, ball, cameraY, viewportHeight, ball.id === leaderIndex, size.width);
          }

          // Tick sound on collisions (throttled)
          if (collisions > 0 && timestamp - lastTickTime > 50) {
            playTick(0.8 + Math.random() * 0.4);
            lastTickTime = timestamp;
          }

          // Handle finishers
          if (newFinishers.length > 0) {
            if (!firstFinisherRef.current) {
              firstFinisherRef.current = newFinishers[0];
              playWin();

              if (modeRef.current === 'first') {
                racingRef.current = false;
                onRaceFinish([firstFinisherRef.current]);
              }
            }
          }

          // Check if all finished (ranked mode)
          if (modeRef.current === 'ranked' && racingRef.current) {
            const allDone = balls.every(b => b.finished);
            if (allDone && !allFinishedRef.current) {
              allFinishedRef.current = true;
              racingRef.current = false;
              const ranked = [...balls].sort((a, b) => a.finishOrder - b.finishOrder);
              onRaceFinish(ranked);
            }
          }

          // Camera follow leader
          if (leaderIndex >= 0) {
            const targetY = balls[leaderIndex].y - viewportHeight * 0.4;
            const clampedTarget = Math.max(0, Math.min(targetY, finishYRef.current - viewportHeight + 100));
            cameraYRef.current += (clampedTarget - cameraYRef.current) * CAMERA.LERP_SPEED;
          }

          // Draw UI Overlays (Leaderboard & Progress)
          // Ensure UI stays locked to the screen, unaffected by camera transform
          ctx.restore();
          ctx.save();

          const top5 = sortedBalls.slice(-5).reverse(); // highest Y first
          drawLeaderboard(ctx, top5, courseWidth, size.width);

          const progressY = leaderY > 0 ? leaderY : 0;
          const totalDist = finishYRef.current - OBSTACLES.FIRST_ROW_Y;
          const currentDist = progressY - OBSTACLES.FIRST_ROW_Y;
          const progressPct = Math.max(0, Math.min(1, currentDist / totalDist));

          drawProgressBar(ctx, progressPct, top5[0], courseWidth, viewportHeight);
        } // end else (normal race phase)
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, onRaceFinish]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Marble race course"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};

export default memo(MarbleCanvas);
