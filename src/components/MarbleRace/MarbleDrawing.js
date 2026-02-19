import { COLORS, OBSTACLES, COURSE } from './MarbleConstants';

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
export const drawBall = (ctx, ball, cameraY, viewportHeight, isLeader) => {
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
  const fontSize = Math.max(7, ball.radius * 0.9);
  ctx.font = `700 ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.BALL_LABEL;
  const maxLabelWidth = ball.radius * 2.5;
  const label = truncateLabel(ctx, ball.name, maxLabelWidth);
  ctx.fillText(label, ball.x, screenY + ball.radius + fontSize + 2);

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
 * Draws a bumper with rounded gradient bar and subtle glow.
 */
const drawBumper = (ctx, obstacle, screenY) => {
  const { x, width, height } = obstacle;
  const cornerRadius = height / 2;

  // Glow
  ctx.save();
  ctx.shadowColor = COLORS.BUMPER_GLOW;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.roundRect(x, screenY, width, height, cornerRadius);
  ctx.fillStyle = COLORS.BUMPER;
  ctx.fill();
  ctx.restore();

  // Gradient overlay (top face)
  const grad = ctx.createLinearGradient(x, screenY, x, screenY + height);
  grad.addColorStop(0, COLORS.BUMPER_TOP);
  grad.addColorStop(1, COLORS.BUMPER);
  ctx.beginPath();
  ctx.roundRect(x, screenY, width, height, cornerRadius);
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
 * Draws an obstacle relative to the camera.
 */
export const drawObstacle = (ctx, obstacle, cameraY, viewportHeight) => {
  const screenY = obstacle.y - cameraY;

  // Skip if off-screen
  const obsHeight = obstacle.height || obstacle.radius || OBSTACLES.FUNNEL_HEIGHT;
  if (screenY > viewportHeight + obsHeight + 20 || screenY < -obsHeight - 60) return;

  ctx.save();

  if (obstacle.type === 'peg') {
    drawPeg(ctx, obstacle, screenY);
  } else if (obstacle.type === 'bumper') {
    drawBumper(ctx, obstacle, screenY);
  } else if (obstacle.type === 'funnel_left' || obstacle.type === 'funnel_right') {
    drawFunnel(ctx, obstacle, screenY, cameraY);
  } else if (obstacle.type === 'zigzag_left' || obstacle.type === 'zigzag_right') {
    drawZigzag(ctx, obstacle, screenY, cameraY);
  } else if (obstacle.type === 'spinner_ring') {
    drawSpinnerRing(ctx, obstacle, screenY);
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
