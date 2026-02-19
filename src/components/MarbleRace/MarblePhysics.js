import { BALL, COURSE, GRID, OBSTACLES } from './MarbleConstants';
import { GAME_COLORS } from '../../utils/colors';

/**
 * Calculates ball radius based on total count.
 * @param {number} count - Total number of balls.
 * @returns {number} Radius in px.
 */
export const getBallRadius = (count) =>
  Math.max(BALL.MIN_RADIUS, BALL.MAX_RADIUS - count * 0.18);

/**
 * Creates initial ball objects positioned in staggered rows at the top.
 * @param {string[]} names - Array of names.
 * @param {number} courseWidth - Width of the course.
 * @returns {Array<object>} Array of ball objects.
 */
export const createBalls = (names, courseWidth) => {
  const radius = getBallRadius(names.length);
  const cols = Math.min(names.length, Math.floor((courseWidth - 40) / (radius * 3)));
  const spacing = (courseWidth - 40) / (cols + 1);

  // Shuffle position indices so no ball consistently gets the best spot
  const positions = names.map((_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return names.map((name, index) => {
    const posIndex = positions[index];
    const row = Math.floor(posIndex / cols);
    const col = posIndex % cols;
    return {
      id: index,
      name,
      x: 20 + spacing * (col + 1) + (Math.random() - 0.5) * radius,
      y: 30 + row * (radius * 2.5) + Math.random() * 5,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 0.5,
      radius,
      color: GAME_COLORS[index % GAME_COLORS.length],
      finished: false,
      finishOrder: -1,
    };
  });
};

/**
 * Clamps a value between min and max.
 */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Builds a spatial hash grid for efficient collision detection.
 * @param {Array<object>} balls - Array of ball objects.
 * @returns {Map<string, Array<object>>} Grid cells mapped by key.
 */
const buildGrid = (balls) => {
  const grid = new Map();
  const size = GRID.CELL_SIZE;
  for (const ball of balls) {
    if (ball.finished) continue;
    const cellX = Math.floor(ball.x / size);
    const cellY = Math.floor(ball.y / size);
    const key = `${cellX},${cellY}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(ball);
  }
  return grid;
};

/**
 * Resolves collision between two balls with elastic response.
 */
const resolveBallCollision = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = a.radius + b.radius;

  if (dist < minDist && dist > 0.01) {
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = (minDist - dist) * BALL.OVERLAP_PUSH;

    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    const impulse = (dvx * nx + dvy * ny) * BALL.BALL_RESTITUTION;

    a.vx -= impulse * nx;
    a.vy -= impulse * ny;
    b.vx += impulse * nx;
    b.vy += impulse * ny;
  }
};

/**
 * Checks ball-to-ball collisions using the spatial grid.
 */
const checkBallCollisions = (balls) => {
  const grid = buildGrid(balls);
  const size = GRID.CELL_SIZE;

  for (const ball of balls) {
    if (ball.finished) continue;
    const cellX = Math.floor(ball.x / size);
    const cellY = Math.floor(ball.y / size);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        const cell = grid.get(key);
        if (!cell) continue;
        for (const other of cell) {
          if (other.id <= ball.id || other.finished) continue;
          resolveBallCollision(ball, other);
        }
      }
    }
  }
};

/**
 * Resolves ball collision with a circular peg.
 */
const collidePeg = (ball, peg) => {
  const dx = ball.x - peg.x;
  const dy = ball.y - peg.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = ball.radius + peg.radius;

  if (dist < minDist && dist > 0.01) {
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x = peg.x + nx * minDist;
    ball.y = peg.y + ny * minDist;

    const dot = ball.vx * nx + ball.vy * ny;
    ball.vx -= (1 + BALL.RESTITUTION) * dot * nx;
    ball.vy -= (1 + BALL.RESTITUTION) * dot * ny;

    // Add slight random deflection
    ball.vx += (Math.random() - 0.5) * 0.5;
    return true;
  }
  return false;
};

/**
 * Resolves ball collision with a rectangular bumper.
 */
const collideBumper = (ball, bumper) => {
  const closestX = clamp(ball.x, bumper.x, bumper.x + bumper.width);
  const closestY = clamp(ball.y, bumper.y, bumper.y + bumper.height);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < ball.radius && dist > 0.01) {
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x = closestX + nx * ball.radius;
    ball.y = closestY + ny * ball.radius;

    const dot = ball.vx * nx + ball.vy * ny;
    ball.vx -= (1 + BALL.RESTITUTION) * dot * nx;
    ball.vy -= (1 + BALL.RESTITUTION) * dot * ny;

    const isTopHit = Math.abs(ny) > 0.7;
    if (isTopHit) {
      // Resting contact: if bounce velocity is too weak, don't bounce — slide off
      if (Math.abs(ball.vy) < 2.0) {
        ball.vy = 0;
      }

      // Strong sideways push to slide off the bumper edge
      const bumperCenter = bumper.x + bumper.width / 2;
      const direction = ball.x > bumperCenter ? 1 : -1;
      ball.vx += direction * (2 + Math.random() * 2);

      // Ensure minimum horizontal speed
      if (Math.abs(ball.vx) < 2.5) {
        ball.vx = direction * 2.5;
      }
    }

    return true;
  }
  return false;
};

/**
 * Resolves ball collision with a funnel line segment.
 */
const collideFunnelSegment = (ball, seg) => {
  const lx = seg.x2 - seg.x;
  const ly = seg.y2 - seg.y;
  const len = Math.sqrt(lx * lx + ly * ly);
  if (len < 0.01) return false;

  const nx = lx / len;
  const ny = ly / len;

  const dx = ball.x - seg.x;
  const dy = ball.y - seg.y;
  let t = (dx * nx + dy * ny) / len;
  t = clamp(t, 0, 1);

  const closestX = seg.x + t * lx;
  const closestY = seg.y + t * ly;
  const cdx = ball.x - closestX;
  const cdy = ball.y - closestY;
  const dist = Math.sqrt(cdx * cdx + cdy * cdy);
  const hitDist = ball.radius + (seg.thickness || 3);

  if (dist < hitDist && dist > 0.01) {
    const pnx = cdx / dist;
    const pny = cdy / dist;
    ball.x = closestX + pnx * hitDist;
    ball.y = closestY + pny * hitDist;

    const dot = ball.vx * pnx + ball.vy * pny;
    ball.vx -= (1 + BALL.RESTITUTION) * dot * pnx;
    ball.vy -= (1 + BALL.RESTITUTION) * dot * pny;
    return true;
  }
  return false;
};

/**
 * Checks a ball against all obstacles and resolves collisions.
 * @returns {boolean} True if any collision occurred.
 */
const checkObstacleCollisions = (ball, obstacles) => {
  let collided = false;
  for (const obs of obstacles) {
    if (obs.type === 'spinner_ring') continue; // visual-only
    if (Math.abs(ball.y - obs.y) > 60 + ball.radius) continue;

    if (obs.type === 'peg') {
      if (collidePeg(ball, obs)) collided = true;
    } else if (obs.type === 'bumper') {
      if (collideBumper(ball, obs)) collided = true;
    } else if (
      obs.type === 'funnel_left' || obs.type === 'funnel_right' ||
      obs.type === 'zigzag_left' || obs.type === 'zigzag_right'
    ) {
      if (collideFunnelSegment(ball, obs)) collided = true;
    }
  }
  return collided;
};

/**
 * Main physics update step. Advances all balls by one frame.
 * @param {Array<object>} balls - Ball objects.
 * @param {Array<object>} obstacles - Obstacle objects.
 * @param {number} courseWidth - Course width.
 * @param {number} finishY - Y position of the finish line.
 * @returns {{ collisions: number, newFinishers: Array<object> }}
 */
export const updateBalls = (balls, obstacles, courseWidth, finishY) => {
  let collisions = 0;
  const newFinishers = [];
  let finishCount = balls.filter(b => b.finished).length;

  for (const ball of balls) {
    if (ball.finished) continue;

    // --- Anti-stuck detection ---
    if (ball.lastX === undefined) {
      ball.lastX = ball.x;
      ball.lastY = ball.y;
      ball.stallFrames = 0;
    }

    const movedX = Math.abs(ball.x - ball.lastX);
    const movedY = Math.abs(ball.y - ball.lastY);

    if (movedX < 0.3 && movedY < 0.3) {
      ball.stallFrames++;
    } else {
      ball.stallFrames = 0;
    }

    ball.lastX = ball.x;
    ball.lastY = ball.y;

    // Rescue kick if stuck (~0.75 seconds at 60fps)
    if (ball.stallFrames > 45) {
      ball.vy = 6 + Math.random() * 3;
      ball.vx = (Math.random() - 0.5) * 8;
      ball.y += 5; // nudge past the obstacle
      ball.stallFrames = 0;
    }

    // Gravity
    ball.vy += BALL.GRAVITY;

    // Damping (1.0 = no damping, only vx friction on collisions)
    ball.vx *= BALL.DAMPING;
    ball.vy *= BALL.DAMPING;

    // Clamp velocity
    ball.vx = clamp(ball.vx, -BALL.MAX_VELOCITY, BALL.MAX_VELOCITY);
    ball.vy = clamp(ball.vy, -BALL.MAX_VELOCITY, BALL.MAX_VELOCITY);

    // Move
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collisions
    if (ball.x - ball.radius < COURSE.WALL_THICKNESS) {
      ball.x = COURSE.WALL_THICKNESS + ball.radius;
      ball.vx = Math.abs(ball.vx) * BALL.RESTITUTION;
      collisions++;
    }
    if (ball.x + ball.radius > courseWidth - COURSE.WALL_THICKNESS) {
      ball.x = courseWidth - COURSE.WALL_THICKNESS - ball.radius;
      ball.vx = -Math.abs(ball.vx) * BALL.RESTITUTION;
      collisions++;
    }

    // Obstacle collisions
    if (checkObstacleCollisions(ball, obstacles)) {
      collisions++;
    }

    // Finish line check
    if (ball.y >= finishY) {
      ball.finished = true;
      ball.y = finishY;
      ball.vy = 0;
      ball.vx = 0;
      finishCount++;
      ball.finishOrder = finishCount;
      newFinishers.push(ball);
    }
  }

  // Ball-to-ball collisions
  checkBallCollisions(balls);

  return { collisions, newFinishers };
};
