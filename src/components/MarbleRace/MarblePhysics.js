import { BALL, COURSE, GRID, OBSTACLES, COLORS, MIXER } from './MarbleConstants';
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
  const mixerCenterX = courseWidth / 2;
  const mixerCenterY = MIXER.CENTER_Y;
  const mixerRadius = MIXER.RADIUS;

  return names.map((name, index) => {
    // Place balls randomly inside the mixer circle
    const angle = (index / names.length) * Math.PI * 2 + Math.random() * 0.3;
    const dist = Math.random() * (mixerRadius - radius * 2);
    return {
      id: index,
      name,
      x: mixerCenterX + Math.cos(angle) * dist,
      y: mixerCenterY + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
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
 * Updates balls during the mixer (spinning drum) phase.
 * Confines balls inside a circle and applies spin force.
 * @param {Array<object>} balls - Ball objects.
 * @param {number} courseWidth - Course width.
 * @param {number} timestamp - Frame timestamp.
 * @returns {void}
 */
export const updateMixer = (balls, courseWidth, timestamp) => {
  const cx = courseWidth / 2;
  const cy = MIXER.CENTER_Y;
  const containerR = MIXER.RADIUS;
  const spinForce = MIXER.SPIN_FORCE;

  for (const ball of balls) {
    // Apply gravity
    ball.vy += BALL.GRAVITY;

    // Apply spin (tangential force to create rotation)
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.1) {
      // Tangential direction (perpendicular to radial, clockwise)
      const tx = -dy / dist;
      const ty = dx / dist;
      ball.vx += tx * spinForce;
      ball.vy += ty * spinForce;
    }

    // Damping
    ball.vx *= BALL.DAMPING;
    ball.vy *= BALL.DAMPING;
    ball.vx = clamp(ball.vx, -BALL.MAX_VELOCITY, BALL.MAX_VELOCITY);
    ball.vy = clamp(ball.vy, -BALL.MAX_VELOCITY, BALL.MAX_VELOCITY);

    // Move
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Confine inside mixer circle
    const dx2 = ball.x - cx;
    const dy2 = ball.y - cy;
    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const maxDist = containerR - ball.radius;
    if (dist2 > maxDist && dist2 > 0.01) {
      const nx = dx2 / dist2;
      const ny = dy2 / dist2;
      ball.x = cx + nx * maxDist;
      ball.y = cy + ny * maxDist;

      // Reflect velocity off the circular wall
      const dot = ball.vx * nx + ball.vy * ny;
      if (dot > 0) {
        ball.vx -= (1 + BALL.RESTITUTION) * dot * nx;
        ball.vy -= (1 + BALL.RESTITUTION) * dot * ny;
      }
    }
  }

  // Ball-to-ball collisions inside mixer
  checkBallCollisions(balls);
};

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

          // Drafting check: if 'other' is below 'ball' but horizontally close, boost 'ball' vy
          // Tightened horizontal distance check to prevent weird sideways drafting
          if (other.y > ball.y && Math.abs(other.x - ball.x) < size * 0.5) {
            // Apply slight downward acceleration to the trailing ball (less air resistance)
            ball.vy += BALL.DRAFTING_BOOST;
            // Anti-Clumping Turbulence: push trailing ball sideways to avoid single-file lines
            ball.vx += (Math.random() - 0.5) * BALL.TURBULENCE;
          } else if (ball.y > other.y && Math.abs(ball.x - other.x) < size * 0.5) {
            // Apply slight downward acceleration to 'other' if it is trailing
            other.vy += BALL.DRAFTING_BOOST;
            // Anti-Clumping Turbulence
            other.vx += (Math.random() - 0.5) * BALL.TURBULENCE;
          }

          resolveBallCollision(ball, other);
        }
      }
    }
  }
};

/**
 * Resolves ball collision with a circular peg.
 */
const collidePeg = (ball, peg, particles) => {
  const dx = ball.x - peg.x;
  const dy = ball.y - peg.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = ball.radius + peg.radius;

  if (dist < minDist && dist > 0.01) {
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x = peg.x + nx * minDist;
    ball.y = peg.y + ny * minDist;

    // Relative velocity
    const pnx = ball.vx - (peg.vx || 0);
    const pny = ball.vy - (peg.vy || 0);

    const dot = pnx * nx + pny * ny;

    if (dot < 0) {
      // Bouncy pegs have higher restitution, pinball bumpers have extreme restitution
      let restitution = BALL.RESTITUTION;
      if (peg.isBouncy) restitution = BALL.RESTITUTION * 1.5;
      if (peg.type === 'pinball_bumper') restitution = OBSTACLES.PINBALL_BUMPER_RESTITUTION || 1.8;

      ball.vx -= (1 + restitution) * dot * nx;
      ball.vy -= (1 + restitution) * dot * ny;
    }

    // Add back the peg's velocity to the ball (moving bodies push)
    if (peg.vx) ball.vx += peg.vx;
    if (peg.vy) ball.vy += peg.vy;

    // Minimum bounce to prevent energy death
    ball.vx += nx * 0.5;
    ball.vy += ny * 0.5;

    // Add slight random deflection
    ball.vx += (Math.random() - 0.5) * 1.0;

    // Emit particles on bouncy pegs or bumpers
    if ((peg.isBouncy || peg.type === 'pinball_bumper') && particles) {
      const isBumper = peg.type === 'pinball_bumper';
      const sparkColor = isBumper ? '#fca5a5' : '#fbbf24'; // Pink/Red for bumpers, Gold for bouncy pegs
      const sparkCount = isBumper ? 8 : 4;
      const velocityMult = isBumper ? 0.6 : 0.3;

      for (let i = 0; i < sparkCount; i++) {
        particles.push({
          x: ball.x - (nx * ball.radius),
          y: ball.y - (ny * ball.radius),
          vx: ball.vx * velocityMult + (Math.random() - 0.5) * (isBumper ? 8 : 4),
          vy: ball.vy * velocityMult + (Math.random() - 0.5) * (isBumper ? 8 : 4),
          life: 1.0,
          maxLife: 15 + Math.random() * 15,
          color: sparkColor,
        });
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

    // Relative velocity
    const rvx = ball.vx - (seg.vx || 0);
    const rvy = ball.vy - (seg.vy || 0);

    const dot = rvx * pnx + rvy * pny;

    if (dot < 0) {
      ball.vx -= (1 + BALL.RESTITUTION) * dot * pnx;
      ball.vy -= (1 + BALL.RESTITUTION) * dot * pny;
    }

    if (seg.vx) ball.vx += seg.vx;
    if (seg.vy) ball.vy += seg.vy;

    // Arcade Polish: Injects a strong lateral bounce off sloped walls 
    // to prevent balls from slowly crawling or settling.
    // Skip if hitting the exact tips of the funnel (t near 0 or 1) as it causes infinite ping-pong jams.
    if (t > 0.05 && t < 0.95) {
      ball.vx += Math.sign(pnx) * 3.0;
      // Downward nudge to break deadlocks when two balls wedge at the mouth
      ball.vy += 1.0;
    }

    return true;
  }
  return false;
};

/**
 * Applies a strong gravity pull towards the black hole if a ball is within its event horizon radius.
 */
const applyBlackHoleGravity = (ball, hole) => {
  const dx = hole.x - ball.x;
  const dy = hole.y - ball.y;
  const distSq = dx * dx + dy * dy;

  const pullRadSq = OBSTACLES.BLACK_HOLE_PULL_RADIUS * OBSTACLES.BLACK_HOLE_PULL_RADIUS;

  if (distSq < pullRadSq && distSq > 0) {
    const dist = Math.sqrt(distSq);
    // Stronger pull the closer you get
    const pullStrength = (1 - (dist / OBSTACLES.BLACK_HOLE_PULL_RADIUS)) * OBSTACLES.BLACK_HOLE_PULL_FORCE;

    ball.vx += (dx / dist) * pullStrength;
    ball.vy += (dy / dist) * pullStrength;
  }
};

/**
 * Resolves ball collision with the center of a black hole (teleportation).
 */
const collideBlackHole = (ball, hole, particles) => {
  const dx = hole.x - ball.x;
  const dy = hole.y - ball.y;
  const distSq = dx * dx + dy * dy;

  const eventHorizonSq = OBSTACLES.BLACK_HOLE_RADIUS * OBSTACLES.BLACK_HOLE_RADIUS;

  if (distSq < eventHorizonSq) {
    // Suck the ball in and spit it out at the white hole coordinates
    ball.x = hole.exitX;
    ball.y = hole.exitY;

    // Violent ejection
    ball.vy = OBSTACLES.WHITE_HOLE_EJECT_FORCE;
    ball.vx = (Math.random() - 0.5) * 10; // Scatter

    if (particles) {
      // Suck-in particles at Black Hole
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: hole.x + (Math.random() - 0.5) * 20,
          y: hole.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1.0,
          maxLife: 15,
          color: COLORS.BLACK_HOLE_ACCRETION,
        });
      }
      // Eject particles at White Hole
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: hole.exitX,
          y: hole.exitY,
          vx: ball.vx * 0.5 + (Math.random() - 0.5) * 4,
          vy: ball.vy * 0.5 + (Math.random() - 0.5) * 4,
          life: 1.0,
          maxLife: 20,
          color: COLORS.WHITE_HOLE_RING,
        });
      }
    }
    return true;
  }
  return false;
};

/**
 * Resolves ball collision with an axis-aligned bounding box (AABB).
 * Used for the slider sweepers.
 */
const collideRect = (ball, rect) => {
  // Find the closest point to the circle within the rectangle
  const closestX = clamp(ball.x, rect.x, rect.x + rect.width);
  const closestY = clamp(ball.y, rect.y, rect.y + rect.height);

  // Calculate the distance between the circle's center and this closest point
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  const distSq = dx * dx + dy * dy;

  // Collision!
  if (distSq < ball.radius * ball.radius && distSq > 0.001) {
    const dist = Math.sqrt(distSq);
    const pnx = dx / dist;
    const pny = dy / dist;

    // Push the ball out of the rectangle
    ball.x = closestX + pnx * ball.radius;
    ball.y = closestY + pny * ball.radius;

    // Relative velocity
    const rvx = ball.vx - (rect.vx || 0);
    const rvy = ball.vy - (rect.vy || 0);

    const dot = rvx * pnx + rvy * pny;

    if (dot < 0) {
      // Arcade Polish: Sliders isolated axis reflection to maintain drop speeds
      // If it hits the sides horizontally, it reflects X. If hits top, reflects Y.
      if (Math.abs(pnx) > Math.abs(pny)) {
        ball.vx -= (1 + BALL.RESTITUTION) * (rvx * pnx) * pnx;
      } else {
        ball.vy -= (1 + BALL.RESTITUTION) * (rvy * pny) * pny;
      }
    }

    // Transfer the slider's horizontal velocity aggressively
    if (rect.vx) {
      ball.vx += rect.vx * 1.2;
    }

    return true;
  }
  return false;
};


/**
 * Checks a ball against all obstacles and resolves collisions.
 * @returns {boolean} True if any collision occurred.
 */
const checkObstacleCollisions = (ball, obstacles, particles) => {
  let collided = false;
  for (const obs of obstacles) {
    if (obs.type === 'spinner_ring') continue; // visual-only
    const cullRadius = obs.type === 'black_hole'
      ? OBSTACLES.BLACK_HOLE_PULL_RADIUS
      : (obs.height || obs.radius || 60);
    if (Math.abs(ball.y - obs.y) > cullRadius + ball.radius) continue;

    if (obs.type === 'peg' || obs.type === 'spinner_peg' || obs.type === 'pinball_bumper') {
      if (collidePeg(ball, obs, particles)) collided = true;
    } else if (obs.type === 'slider' || obs.type === 'trapdoor_block') {
      if (collideRect(ball, obs)) collided = true;
    } else if (obs.type === 'black_hole') {
      applyBlackHoleGravity(ball, obs);
      if (collideBlackHole(ball, obs, particles)) collided = true;
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
 * Updates the positions of moving obstacles (sliders, spinners, trapdoors).
 */
const updateMovingObstacles = (obstacles, timestamp) => {
  // Pre-build a lookup map for spinner rings to avoid O(n) find() per peg
  const ringMap = new Map();
  for (const obs of obstacles) {
    if (obs.type === 'spinner_ring') ringMap.set(obs.id, obs);
  }

  for (const obs of obstacles) {
    if (obs.type === 'slider') {
      const time = timestamp * obs.speed + obs.timeOffset;
      const expectedX = obs.startX + Math.sin(time) * obs.range;
      obs.vx = expectedX - obs.x;
      obs.x = expectedX;
      obs.x2 = obs.x + obs.width;
    } else if (obs.type === 'spinner_ring') {
      obs.angle += obs.angularVelocity;
    } else if (obs.type === 'spinner_peg') {
      const ring = ringMap.get(obs.ringId);
      if (ring) {
        const expectedX = ring.x + Math.cos(ring.angle + obs.angleOffset) * ring.radius;
        const expectedY = ring.y + Math.sin(ring.angle + obs.angleOffset) * ring.radius;
        obs.vx = expectedX - obs.x;
        obs.vy = expectedY - obs.y;
        obs.x = expectedX;
        obs.y = expectedY;
      }
    } else if (obs.type === 'funnel_left' && obs.isSwaying) {
      const time = timestamp * obs.speed + obs.timeOffset;
      const offset = Math.sin(time) * obs.range;
      obs.vx = (obs.startX + offset) - obs.x;
      obs.x = obs.startX + offset;
      obs.x2 = obs.startX2 + offset;
    } else if (obs.type === 'funnel_right' && obs.isSwaying) {
      const time = timestamp * obs.speed + obs.timeOffset;
      const offset = Math.sin(time) * obs.range;
      obs.vx = (obs.startX + offset) - obs.x;
      obs.x = obs.startX + offset;
      obs.x2 = obs.startX2 + offset;
    } else if (obs.type === 'black_hole') {
      // Animate black hole rotation
      obs.angle = (obs.angle || 0) + 0.05;
    } else if (obs.type === 'white_hole') {
      // Animate white hole rotation
      obs.angle = (obs.angle || 0) - 0.05;
    } else if (obs.type === 'trapdoor_block') {
      const cycleTime = OBSTACLES.TRAPDOOR_CYCLE_TIME;
      const localTime = (timestamp + obs.timeOffset) % cycleTime;
      const openTime = OBSTACLES.TRAPDOOR_OPEN_TIME;
      const expectedX = localTime < openTime ? obs.startX + obs.openRange : obs.startX;
      const prevX = obs.x;

      obs.x += (expectedX - obs.x) * OBSTACLES.TRAPDOOR_SMOOTHING;
      obs.vx = obs.x - prevX;
      obs.x2 = obs.x + obs.width;
    }
  }
};

const applyForces = (ball, isLeader, trailFactor) => {
  let appliedGravity = BALL.GRAVITY;

  // Gradient rubber-banding: the further back you are, the stronger the boost.
  // trailFactor: 0 = leader, 1 = last place
  // Scales gravity from 1.0× (leader) up to 1.4× (last place)
  if (trailFactor > 0) {
    appliedGravity *= 1.0 + trailFactor * 0.4;
  }

  // Leader mechanics: Leader encounters "wind resistance" pushing them slightly back up
  if (isLeader && ball.vy > 0) {
    ball.vy -= BALL.LEADER_DRAG;
  }

  ball.vy += appliedGravity;
  ball.vx *= BALL.DAMPING;
  ball.vy *= BALL.DAMPING;
  ball.vx = clamp(ball.vx, -BALL.MAX_VELOCITY, BALL.MAX_VELOCITY);
  ball.vy = clamp(ball.vy, -BALL.MAX_VELOCITY, BALL.MAX_VELOCITY);
};

/**
 * Handles sub-stepped movement and collisions for a single ball.
 * @returns {number} The number of collisions that occurred.
 */
const moveAndCollideBall = (ball, obstacles, courseWidth, particles) => {
  const steps = BALL.SUB_STEPS;
  let frameCollisions = 0;

  for (let i = 0; i < steps; i++) {
    ball.x += ball.vx / steps;
    ball.y += ball.vy / steps;

    if (ball.x - ball.radius < COURSE.WALL_THICKNESS) {
      ball.x = COURSE.WALL_THICKNESS + ball.radius;
      ball.vx = Math.abs(ball.vx) * BALL.RESTITUTION;
      frameCollisions++;
    }
    if (ball.x + ball.radius > courseWidth - COURSE.WALL_THICKNESS) {
      ball.x = courseWidth - COURSE.WALL_THICKNESS - ball.radius;
      ball.vx = -Math.abs(ball.vx) * BALL.RESTITUTION;
      frameCollisions++;
    }

    if (checkObstacleCollisions(ball, obstacles, particles)) {
      frameCollisions++;
    }
  }

  return frameCollisions;
};

/**
 * Main physics update step. Advances all balls by one frame.
 * @param {Array<object>} balls - Ball objects.
 * @param {Array<object>} obstacles - Obstacle objects.
 * @param {number} courseWidth - Course width.
 * @param {number} finishY - Y position of the finish line.
 * @param {number} timestamp - Current frame timestamp.
 * @param {Array<object>} particles - Array to push new particles into.
 * @returns {{ collisions: number, newFinishers: Array<object> }}
 */
export const updateBalls = (balls, obstacles, courseWidth, finishY, timestamp, particles) => {
  let collisions = 0;
  const newFinishers = [];
  let finishCount = balls.filter(b => b.finished).length;

  updateMovingObstacles(obstacles, timestamp);

  // Identify race positions for rubber-banding and leader mechanics
  let lowestY = -Infinity; // Furthest down the track is the highest y value
  let highestY = Infinity; // Furthest back is the lowest y value

  for (const ball of balls) {
    if (ball.finished) continue;
    if (ball.y > lowestY) lowestY = ball.y;
    if (ball.y < highestY) highestY = ball.y;
  }

  // Calculate the spread of the pack to determine who gets rubber-banding
  const packSpread = lowestY - highestY;
  // Consider someone "far behind" if they are more than 30% of the pack spread behind the leader
  // and spread is significant enough 
  const catchupThreshold = lowestY - (packSpread * 0.3);

  for (const ball of balls) {
    if (ball.finished) continue;

    const isLeader = ball.y === lowestY;
    // Gradient trail factor: 0 = leader, 1 = last place
    const trailFactor = packSpread > 50 ? 1 - ((ball.y - highestY) / packSpread) : 0;

    applyForces(ball, isLeader, trailFactor);

    if (moveAndCollideBall(ball, obstacles, courseWidth, particles) > 0) {
      collisions++;
    }

    // Stuck detection: track vertical progress, not just speed.
    // Oscillating balls have non-zero speed but make no net progress.
    if (ball.lastCheckY === undefined) ball.lastCheckY = ball.y;
    ball.stuckFrames = (ball.stuckFrames || 0) + 1;

    // Every 30 frames (~0.5s), check if ball made meaningful vertical progress
    if (ball.stuckFrames >= 30) {
      const yProgress = Math.abs(ball.y - ball.lastCheckY);
      if (yProgress < 8) {
        // Ball hasn't moved — forcefully eject it downward and sideways
        ball.vx = (Math.random() - 0.5) * 10;
        ball.vy = BALL.MAX_VELOCITY;
        // Nudge ball down past the obstacle trapping it
        ball.y += ball.radius * 2;
      }
      ball.lastCheckY = ball.y;
      ball.stuckFrames = 0;
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

  checkBallCollisions(balls);

  return { collisions, newFinishers };
};
