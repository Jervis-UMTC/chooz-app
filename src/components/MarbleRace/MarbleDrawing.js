import { COLORS, OBSTACLES, COURSE, MIXER } from './MarbleConstants';

/**
 * Truncates text to fit within maxWidth.
 */
const truncateLabel = (ctx, text, maxWidth) => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let len = text.length;
  while (len > 0) {
    const truncated = text.substring(0, len) + '..';
    if (ctx.measureText(truncated).width <= maxWidth) return truncated;
    len--;
  }
  return '';
};

/**
 * Draws a single ball with its name label.
 */
export const drawBall = (ctx, ball, cameraY, viewportHeight, isLeader, viewportWidth) => {
  const screenY = ball.y - cameraY;
  if (screenY < -30 || screenY > viewportHeight + 30) return;

  ctx.save();

  // Leader glow
  if (isLeader && !ball.finished) {
    ctx.beginPath();
    ctx.arc(ball.x, screenY, ball.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.LEADER_GLOW;
    ctx.fill();
  }

  // Ball body with gradient
  const ballGrad = ctx.createRadialGradient(
    ball.x - ball.radius * 0.3, screenY - ball.radius * 0.3, ball.radius * 0.1,
    ball.x, screenY, ball.radius,
  );
  ballGrad.addColorStop(0, lightenColor(ball.color, 40));
  ballGrad.addColorStop(1, ball.color);
  ctx.beginPath();
  ctx.arc(ball.x, screenY, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ballGrad;
  ctx.fill();

  // Ball highlight
  ctx.beginPath();
  ctx.arc(ball.x - ball.radius * 0.25, screenY - ball.radius * 0.25, ball.radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  // Name label
  const isMobile = viewportWidth && viewportWidth < 600;

  // Scale down font on mobile
  const fontMultiplier = isMobile ? 0.65 : 0.9;
  const fontSize = Math.max(isMobile ? 5 : 7, ball.radius * fontMultiplier);

  ctx.font = `700 ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.BALL_LABEL;

  // Truncate more aggressively on mobile
  const maxLabelWidthMultiplier = isMobile ? 1.5 : 2.5;
  const maxLabelWidth = ball.radius * maxLabelWidthMultiplier;
  const label = truncateLabel(ctx, ball.name, maxLabelWidth);

  ctx.fillText(label, ball.x, screenY + ball.radius + fontSize + 2);

  ctx.restore();
};

/**
 * Draws a fading spark particle.
 */
export const drawParticle = (ctx, particle, cameraY, viewportHeight) => {
  const screenY = particle.y - cameraY;
  if (screenY < -10 || screenY > viewportHeight + 10) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0, particle.life);
  ctx.beginPath();
  const radius = Math.max(0.5, 4 * Math.sqrt(particle.life));
  ctx.arc(particle.x, screenY, radius, 0, Math.PI * 2);

  if (particle.color === '#4ade80') {
    // Give green booster sparks a slight glow
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 4;
  }

  ctx.fillStyle = particle.color;
  ctx.fill();
  ctx.restore();
};

/**
 * Draws a peg with a 3D radial gradient and drop shadow.
 */
const drawPeg = (ctx, obstacle, screenY) => {
  const { x, radius } = obstacle;

  // Drop shadow
  ctx.beginPath();
  ctx.arc(x + 1, screenY + 2, radius + 1, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.PEG_SHADOW;
  ctx.fill();

  // Gradient body
  const grad = ctx.createRadialGradient(
    x - radius * 0.3, screenY - radius * 0.3, radius * 0.1,
    x, screenY, radius,
  );
  grad.addColorStop(0, COLORS.PEG_HIGHLIGHT);
  grad.addColorStop(1, COLORS.PEG);
  ctx.beginPath();
  ctx.arc(x, screenY, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
};



/**
 * Draws a funnel line segment with a gradient stroke.
 */
const drawFunnel = (ctx, obstacle, screenY, cameraY) => {
  const screenY2 = obstacle.y2 - cameraY;

  // Shadow line
  ctx.beginPath();
  ctx.moveTo(obstacle.x + 1, screenY + 2);
  ctx.lineTo(obstacle.x2 + 1, screenY2 + 2);
  ctx.strokeStyle = COLORS.FUNNEL_SHADOW;
  ctx.lineWidth = (obstacle.thickness || 4) + 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Main gradient stroke
  const grad = ctx.createLinearGradient(obstacle.x, screenY, obstacle.x2, screenY2);
  grad.addColorStop(0, COLORS.FUNNEL);
  grad.addColorStop(1, COLORS.BUMPER_TOP);
  ctx.beginPath();
  ctx.moveTo(obstacle.x, screenY);
  ctx.lineTo(obstacle.x2, screenY2);
  ctx.strokeStyle = grad;
  ctx.lineWidth = obstacle.thickness || 4;
  ctx.lineCap = 'round';
  ctx.stroke();
};

/**
 * Draws a zigzag shelf segment with thick gradient line and rounded ends.
 */
const drawZigzag = (ctx, obstacle, screenY, cameraY) => {
  const screenY2 = obstacle.y2 - cameraY;

  // Shadow
  ctx.beginPath();
  ctx.moveTo(obstacle.x + 1, screenY + 2);
  ctx.lineTo(obstacle.x2 + 1, screenY2 + 2);
  ctx.strokeStyle = COLORS.FUNNEL_SHADOW;
  ctx.lineWidth = (obstacle.thickness || 6) + 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Main shelf
  const grad = ctx.createLinearGradient(obstacle.x, screenY, obstacle.x2, screenY2);
  grad.addColorStop(0, COLORS.ZIGZAG_TOP);
  grad.addColorStop(1, COLORS.ZIGZAG);
  ctx.beginPath();
  ctx.moveTo(obstacle.x, screenY);
  ctx.lineTo(obstacle.x2, screenY2);
  ctx.strokeStyle = grad;
  ctx.lineWidth = obstacle.thickness || 6;
  ctx.lineCap = 'round';
  ctx.stroke();
};

/**
 * Draws the spinner's decorative ring (pegs drawn separately as normal pegs).
 */
const drawSpinnerRing = (ctx, obstacle, screenY) => {
  ctx.beginPath();
  ctx.arc(obstacle.x, screenY, obstacle.radius, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.SPINNER_RING;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
};

/**
 * Draws a sliding sweeper.
 */
const drawSlider = (ctx, obstacle, screenY) => {
  const width = obstacle.width;
  const height = obstacle.height;

  // Base block
  ctx.fillStyle = '#f59e0b'; // Amber warning color
  ctx.fillRect(obstacle.x, screenY, width, height);

  // Hazard stripes
  ctx.save();
  ctx.beginPath();
  ctx.rect(obstacle.x, screenY, width, height);
  ctx.clip();

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#b45309'; // Darker amber

  for (let i = -width; i < width * 2; i += 16) {
    ctx.beginPath();
    ctx.moveTo(obstacle.x + i, screenY);
    ctx.lineTo(obstacle.x + i - height, screenY + height);
    ctx.stroke();
  }
  ctx.restore();

  // Depth shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(obstacle.x, screenY + height, width, 4);
};




/**
 * Draws a glowing Pinball Bumper.
 */
const drawPinballBumper = (ctx, obstacle, screenY) => {
  const { x, radius } = obstacle;

  // Outer glow
  ctx.shadowColor = COLORS.PINBALL_BUMPER_GLOW;
  ctx.shadowBlur = 12;

  // Main body
  const grad = ctx.createRadialGradient(
    x - radius * 0.2, screenY - radius * 0.2, radius * 0.1,
    x, screenY, radius
  );
  grad.addColorStop(0, '#fff'); // Hot white center
  grad.addColorStop(0.3, COLORS.PINBALL_BUMPER_GLOW);
  grad.addColorStop(1, COLORS.PINBALL_BUMPER_BASE);

  ctx.beginPath();
  ctx.arc(x, screenY, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowBlur = 0;

  // Inner ring detail
  ctx.beginPath();
  ctx.arc(x, screenY, radius * 0.6, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
};

/**
 * Draws a mesmerizing Black Hole portal.
 */
const drawBlackHole = (ctx, obstacle, screenY) => {
  const { x, angle } = obstacle;
  const radius = OBSTACLES.BLACK_HOLE_RADIUS;
  const pullRadius = OBSTACLES.BLACK_HOLE_PULL_RADIUS;

  ctx.save();
  ctx.translate(x, screenY);

  // Outer accretion disk (Gravity well indicator)
  ctx.beginPath();
  ctx.arc(0, 0, pullRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
  ctx.fill();

  // Swirling inner glow
  ctx.rotate(angle);
  const grad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 2);
  grad.addColorStop(0, COLORS.BLACK_HOLE_ACCRETION);
  grad.addColorStop(0.3, COLORS.BLACK_HOLE_GLOW);
  grad.addColorStop(1, 'transparent');

  ctx.beginPath();
  ctx.arc(0, 0, radius * 2, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // The singularity
  ctx.shadowColor = COLORS.BLACK_HOLE_GLOW;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.BLACK_HOLE_CORE;
  ctx.fill();

  ctx.restore();
};

/**
 * Draws a blazing White Hole exit portal.
 */
const drawWhiteHole = (ctx, obstacle, screenY) => {
  const { x, angle } = obstacle;
  const radius = OBSTACLES.WHITE_HOLE_RADIUS;

  ctx.save();
  ctx.translate(x, screenY);
  ctx.rotate(angle);

  // Blinding outer glow
  ctx.shadowColor = COLORS.WHITE_HOLE_GLOW;
  ctx.shadowBlur = 20;

  // Swirling ejection flares
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(i * Math.PI / 3) * radius * 2.5, Math.sin(i * Math.PI / 3) * radius * 2.5);
  }
  ctx.strokeStyle = COLORS.WHITE_HOLE_GLOW;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Core
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.WHITE_HOLE_CORE;
  ctx.fill();

  // Inner ring
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.WHITE_HOLE_RING;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
};

/**
 * Draws an obstacle relative to the camera.
 */
export const drawObstacle = (ctx, obstacle, cameraY, viewportHeight) => {
  const screenY = obstacle.y - cameraY;

  // Skip if off-screen
  const obsHeight = obstacle.height || obstacle.radius || OBSTACLES.FUNNEL_HEIGHT;
  if (screenY > viewportHeight + obsHeight + 20 || screenY < -obsHeight - 60) return;

  ctx.save();

  if (obstacle.type === 'peg' || obstacle.type === 'spinner_peg') {
    drawPeg(ctx, obstacle, screenY);
  } else if (obstacle.type === 'pinball_bumper') {
    drawPinballBumper(ctx, obstacle, screenY);
  } else if (obstacle.type === 'funnel_left' || obstacle.type === 'funnel_right') {
    drawFunnel(ctx, obstacle, screenY, cameraY);
  } else if (obstacle.type === 'zigzag_left' || obstacle.type === 'zigzag_right') {
    drawZigzag(ctx, obstacle, screenY, cameraY);
  } else if (obstacle.type === 'spinner_ring') {
    drawSpinnerRing(ctx, obstacle, screenY);
  } else if (obstacle.type === 'slider' || obstacle.type === 'trapdoor_block') {
    drawSlider(ctx, obstacle, screenY);
  } else if (obstacle.type === 'black_hole') {
    drawBlackHole(ctx, obstacle, screenY);
  } else if (obstacle.type === 'white_hole') {
    drawWhiteHole(ctx, obstacle, screenY);
  }

  ctx.restore();
};

/**
 * Draws the course walls.
 */
export const drawWalls = (ctx, courseWidth, cameraY, viewportHeight) => {
  // Gradient walls for depth
  const wallGrad = ctx.createLinearGradient(0, 0, COURSE.WALL_THICKNESS, 0);
  wallGrad.addColorStop(0, '#475569');
  wallGrad.addColorStop(1, COLORS.WALL);

  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, COURSE.WALL_THICKNESS, viewportHeight);

  const wallGradR = ctx.createLinearGradient(courseWidth - COURSE.WALL_THICKNESS, 0, courseWidth, 0);
  wallGradR.addColorStop(0, COLORS.WALL);
  wallGradR.addColorStop(1, '#475569');

  ctx.fillStyle = wallGradR;
  ctx.fillRect(courseWidth - COURSE.WALL_THICKNESS, 0, COURSE.WALL_THICKNESS, viewportHeight);
};

/**
 * Draws the finish line.
 */
export const drawFinishLine = (ctx, finishY, cameraY, courseWidth, viewportHeight) => {
  const screenY = finishY - cameraY;
  if (screenY < -COURSE.FINISH_LINE_HEIGHT || screenY > viewportHeight + 20) return;

  ctx.save();

  // Checkerboard pattern
  const squareSize = 10;
  const numSquares = Math.ceil(courseWidth / squareSize);
  for (let i = 0; i < numSquares; i++) {
    for (let row = 0; row < 2; row++) {
      ctx.fillStyle = (i + row) % 2 === 0 ? '#fff' : '#222';
      ctx.fillRect(i * squareSize, screenY + row * squareSize, squareSize, squareSize);
    }
  }

  // "FINISH" text
  ctx.font = '700 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.FINISH_LINE;
  ctx.fillText('FINISH', courseWidth / 2, screenY + squareSize + 30);

  ctx.restore();
};

/**
 * Draws the course background.
 */
export const drawBackground = (ctx, courseWidth, viewportHeight) => {
  ctx.fillStyle = COLORS.COURSE_BG;
  ctx.fillRect(0, 0, courseWidth, viewportHeight);
};

/**
 * Lightens a hex color by a given amount.
 * @param {string} hex - Hex color string.
 * @param {number} amount - Amount to lighten (0-255).
 * @returns {string} Lightened hex color.
 */
const lightenColor = (hex, amount) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

/**
 * Draws the real-time leaderboard overlay in the top right.
 */
export const drawLeaderboard = (ctx, topBalls, courseWidth) => {
  if (topBalls.length === 0) return;

  const padding = 10;
  const width = 130;
  const startX = courseWidth - width - 15;
  const startY = 15;

  ctx.save();
  // Highly-transparent background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)'; // Slate 900
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Rounded rect
  ctx.beginPath();
  ctx.roundRect(startX, startY, width, 26 + topBalls.length * 26, 6);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Title
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // highly muted mute
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LEADERBOARD', startX + width / 2, startY + 16);

  // Entries
  ctx.textAlign = 'left';
  topBalls.forEach((ball, index) => {
    const y = startY + 38 + index * 26;

    // Rank number (muted colors)
    ctx.fillStyle = index === 0 ? 'rgba(251, 191, 36, 0.8)' :
      index === 1 ? 'rgba(203, 213, 225, 0.8)' :
        index === 2 ? 'rgba(180, 83, 9, 0.8)' :
          'rgba(100, 116, 139, 0.8)';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`${index + 1}.`, startX + 12, y);

    // Ball color swatch (smaller, no stroke)
    ctx.beginPath();
    ctx.arc(startX + 38, y - 4, 6, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();

    // Name (muted white, shorter truncation)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Inter, sans-serif';
    let displayName = ball.name;
    if (ctx.measureText(displayName).width > 65) {
      displayName = displayName.substring(0, 6) + '..';
    }
    ctx.fillText(displayName, startX + 54, y);
  });

  ctx.restore();
};

/**
 * Draws the vertical track progress bar on the right edge.
 */
export const drawProgressBar = (ctx, progressPct, leaderBall, courseWidth, viewportHeight) => {
  if (!leaderBall) return;

  const barWidth = 6;
  const startX = 16;
  const startY = 40;
  const height = viewportHeight - 80;

  ctx.save();

  // Track background 
  ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
  ctx.beginPath();
  ctx.roundRect(startX, startY, barWidth, height, barWidth / 2);
  ctx.fill();

  // Progress fill (leader's color)
  const fillHeight = Math.max(0, height * progressPct);
  ctx.fillStyle = leaderBall.color;
  ctx.shadowColor = leaderBall.color;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.roundRect(startX, startY, barWidth, fillHeight, barWidth / 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Leader marker (Triangle pointing left towards the bar instead of a dot)
  const markerY = startY + fillHeight;
  ctx.beginPath();
  ctx.moveTo(startX + barWidth + 4, markerY);
  ctx.lineTo(startX + barWidth + 10, markerY - 5);
  ctx.lineTo(startX + barWidth + 10, markerY + 5);
  ctx.fill();

  // Finish line marker at bottom
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(startX - 2, startY + height - 2, barWidth + 4, 3);

  // FINISH Label
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('FINISH', startX + barWidth + 6, startY + height);

  // START Label
  ctx.fillText('START', startX + barWidth + 6, startY);

  ctx.restore();
};

/**
 * Draws the spinning mixer drum circle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} courseWidth
 * @param {number} cameraY
 * @param {number} viewportHeight
 * @param {number} timestamp - Frame timestamp for rotation animation.
 * @param {number} progress - 0 to 1 progress of the mixer phase.
 */
export const drawMixer = (ctx, courseWidth, cameraY, viewportHeight, timestamp, progress) => {
  const cx = courseWidth / 2;
  const cy = MIXER.CENTER_Y - cameraY;
  const radius = MIXER.RADIUS;

  // Fade out as progress nears 1
  const fadeAlpha = progress < 0.8 ? 1.0 : 1.0 - (progress - 0.8) / 0.2;

  ctx.save();
  ctx.globalAlpha = fadeAlpha;

  // Outer glow
  ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
  ctx.shadowBlur = 15;

  // Rotating dashed circle border
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(timestamp * 0.002);

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.6)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
  ctx.shadowBlur = 0;

  // Inner circle fill (subtle)
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
  ctx.fill();

  // "MIXING..." label - pulsating
  const pulse = 0.7 + Math.sin(timestamp * 0.005) * 0.3;
  ctx.fillStyle = `rgba(165, 180, 252, ${pulse * fadeAlpha})`;
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MIXING...', cx, cy + radius + 18);

  ctx.restore();
};
