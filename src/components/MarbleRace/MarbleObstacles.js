import { BALL, COURSE, OBSTACLES, ZONES } from './MarbleConstants';
import { getBallRadius } from './MarblePhysics';





// ── Helper Row Functions (used by segments) ───────────────────────

const addPegRow = (obstacles, y, usableWidth, margin, courseWidth, minGap, isBouncy, staggerIndex = 0, bias = 0) => {
  const pegRadius = isBouncy ? OBSTACLES.PEG_RADIUS * 1.5 : OBSTACLES.PEG_RADIUS;

  // Calculate the maximum playable span from wall to wall
  const leftLimit = COURSE.WALL_THICKNESS + pegRadius;
  const rightLimit = courseWidth - COURSE.WALL_THICKNESS - pegRadius;
  const span = rightLimit - leftLimit;

  // Apply lateral bias: shift the entire row left (-1) or right (+1)
  // Bias shifts by up to 30% of the span, clamped to stay within walls
  const biasShift = bias * span * 0.15;

  // The gap between peg EDGES must be at least 2.5× ball diameter so balls
  // can comfortably pass through. minGap already encodes radius * 4 + 18.
  const ballDiameter = (minGap - 18) / 2; // recover actual ball diameter
  const safeEdgeGap = Math.max(ballDiameter * 2.5, minGap);
  const minPegSpacing = safeEdgeGap + pegRadius * 2;
  const maxCount = Math.max(3, Math.floor(span / minPegSpacing) + 1);

  const isStaggered = staggerIndex % 2 !== 0;
  const count = isStaggered ? maxCount - 1 : maxCount;

  // The true spacing to evenly distribute `maxCount` pegs across `span`
  const spacing = span / (maxCount - 1);
  const offsetX = isStaggered ? spacing / 2 : 0;

  for (let i = 0; i < count; i++) {
    // Pegs are distributed with bias shift applied
    const x = leftLimit + offsetX + spacing * i + biasShift;
    // SKIP pegs that would fall outside the walls instead of clamping
    // Clamping clusters pegs at the wall edge creating traps
    if (x < leftLimit || x > rightLimit) continue;

    // Check if it's the very first or very last peg on the non-staggered row, making them wall bouncers
    const isWallBouncer = !isStaggered && (i === 0 || i === count - 1);

    obstacles.push({
      type: 'peg',
      x,
      y,
      radius: pegRadius,
      isBouncy: isWallBouncer ? true : isBouncy,
    });
  }

  return pegRadius * 2;
};

const addFunnelRow = (obstacles, y, usableWidth, margin, openSide, minGap, isSwaying, radius) => {
  const offset = usableWidth * 0.35;
  const centerX = openSide === 'left' ? margin + usableWidth / 2 - offset : margin + usableWidth / 2 + offset;
  const halfWidth = OBSTACLES.FUNNEL_WIDTH / 2;

  // Tighten the funnel gap slightly to force more congestion and shuffling
  // BUT ensure the mouth is strictly wider than the ball diameter plus collision thickness.
  // Effective gap = 2 * mouthHalfGap - 2 * thickness, must be > 2 * radius.
  const desiredGap = (minGap * 0.9) / 2;
  const safeGap = radius * 2.5 + OBSTACLES.WALL_THICKNESS;
  const mouthHalfGap = Math.max(desiredGap, safeGap);

  const timeOffset = Math.random() * Math.PI * 2;
  const speed = 0.002 + Math.random() * 0.002;

  const courseWidth = usableWidth + margin * 2;
  const minLeft = centerX - halfWidth - 20;
  const maxRight = centerX + halfWidth + 20;
  const availableLeft = minLeft - (COURSE.WALL_THICKNESS + minGap);
  const availableRight = (courseWidth - COURSE.WALL_THICKNESS - minGap) - maxRight;

  let range = usableWidth * 0.15;
  range = isSwaying ? Math.max(0, Math.min(range, availableLeft, availableRight)) : 0;

  obstacles.push({
    type: 'funnel_left', x: minLeft, y, x2: centerX - mouthHalfGap, y2: y + OBSTACLES.FUNNEL_HEIGHT,
    startX: minLeft, startX2: centerX - mouthHalfGap, thickness: OBSTACLES.WALL_THICKNESS, isSwaying, timeOffset, speed, range,
  });

  obstacles.push({
    type: 'funnel_right', x: centerX + mouthHalfGap, y: y + OBSTACLES.FUNNEL_HEIGHT, x2: maxRight, y2: y,
    startX: centerX + mouthHalfGap, startX2: maxRight, thickness: OBSTACLES.WALL_THICKNESS, isSwaying, timeOffset, speed, range,
  });
  return OBSTACLES.FUNNEL_HEIGHT;
};

const addWarpGauntletSegment = (obstacles, startY, usableWidth, margin, courseWidth, minGap, radius, playableEnd) => {
  let currentY = startY;
  const centerX = courseWidth / 2;

  // 1. Array of heavy Pinball Bumpers leading into the gravity well
  const bumperRadius = OBSTACLES.PINBALL_BUMPER_RADIUS;

  // Scale bumper positions to course width instead of hardcoded pixels
  const innerSpread = Math.min(usableWidth * 0.22, 80);
  const outerSpread = Math.min(usableWidth * 0.32, 120);
  const guardSpread = Math.min(usableWidth * 0.16, 60);
  const rowGap = Math.max(minGap, 60);

  // V-shape or diamond shape of bumpers
  obstacles.push({ type: 'pinball_bumper', x: centerX - innerSpread, y: currentY, radius: bumperRadius });
  obstacles.push({ type: 'pinball_bumper', x: centerX + innerSpread, y: currentY, radius: bumperRadius });

  currentY += rowGap;
  obstacles.push({ type: 'pinball_bumper', x: centerX - outerSpread, y: currentY, radius: bumperRadius });
  obstacles.push({ type: 'pinball_bumper', x: centerX + outerSpread, y: currentY, radius: bumperRadius });

  // 2. The Black Hole
  currentY += rowGap + 20;
  const blackHoleY = currentY;

  // Teleport 400-600px ahead, but NEVER within 400px of the finish line
  const maxTeleportY = playableEnd - 400;
  const rawWhiteHoleY = currentY + 400 + Math.random() * 200;
  const whiteHoleY = Math.min(rawWhiteHoleY, maxTeleportY);

  // Off-center the exit for more dynamic re-entry
  const exitOffsetX = (Math.random() - 0.5) * usableWidth * 0.5;
  const wallPad = COURSE.WALL_THICKNESS + 20;
  const exitX = Math.max(wallPad, Math.min(courseWidth - wallPad, centerX + exitOffsetX));

  obstacles.push({
    type: 'black_hole',
    x: centerX,
    y: blackHoleY,
    exitX,
    exitY: whiteHoleY,
    angle: 0
  });

  // 3. The White Hole (placed far ahead, doesn't consume height here)
  obstacles.push({
    type: 'white_hole',
    x: exitX,
    y: whiteHoleY,
    angle: 0
  });

  // 4. A final row of bumpers guarding the Black Hole
  currentY += rowGap + 20;
  obstacles.push({ type: 'pinball_bumper', x: centerX - guardSpread, y: currentY, radius: bumperRadius });
  obstacles.push({ type: 'pinball_bumper', x: centerX + guardSpread, y: currentY, radius: bumperRadius });

  return (currentY + rowGap) - startY;
};

const addSliderRow = (obstacles, y, usableWidth, courseWidth, minGap) => {
  const sliderWidth = usableWidth * (minGap < 50 ? 0.6 : 0.4);
  const height = OBSTACLES.BUMPER_HEIGHT + 4;
  const minX = COURSE.WALL_THICKNESS + minGap;
  const maxX = Math.max(minX + 10, courseWidth - COURSE.WALL_THICKNESS - sliderWidth - minGap);
  const range = (maxX - minX) / 2;
  const startX = minX + range;

  obstacles.push({
    type: 'slider', x: startX, y, width: sliderWidth, height, startX, range,
    timeOffset: Math.random() * Math.PI * 2, speed: 0.0015 + Math.random() * 0.0015, vx: 0,
  });
  return height;
};


// ── Segment Generators ───────────────────────

/** 0a. Crossover Ramps: Diagonal deflectors that force balls across the track */
const addCrossoverSegment = (obstacles, startY, usableWidth, margin, courseWidth, minGap, radius) => {
  let currentY = startY;
  const rampHeight = 80;
  const direction = Math.random() < 0.5 ? 1 : -1; // 1 = left-to-right, -1 = right-to-left

  // Ramps start well INSIDE the track (25% from edge) to avoid wall pockets
  const innerPad = courseWidth * 0.25;
  const startSide = direction === 1 ? innerPad : courseWidth - innerPad;
  const endSide = courseWidth / 2 + direction * (courseWidth * 0.2);

  // First ramp: diagonal deflector pushing balls toward the opposite side
  obstacles.push({
    type: 'funnel_left',
    x: Math.min(startSide, endSide), y: currentY,
    x2: Math.max(startSide, endSide), y2: currentY + rampHeight,
    thickness: OBSTACLES.WALL_THICKNESS + 2,
  });

  currentY += rampHeight + minGap * 0.6;

  // Second ramp: goes the opposite direction to complete the crossover
  const startSide2 = courseWidth - innerPad * (direction === 1 ? 0.7 : 1.3);
  const endSide2 = courseWidth / 2 - direction * (courseWidth * 0.2);

  obstacles.push({
    type: 'funnel_right',
    x: Math.min(startSide2, endSide2), y: currentY + rampHeight,
    x2: Math.max(startSide2, endSide2), y2: currentY,
    thickness: OBSTACLES.WALL_THICKNESS + 2,
  });

  currentY += rampHeight + minGap * 0.4;

  // Scatter pegs below to amplify chaos after the crossover
  const h = addPegRow(obstacles, currentY, usableWidth, margin, courseWidth, minGap, false, 0, -direction * 0.6);
  currentY += h + minGap * 0.5;

  return currentY - startY;
};

/** 0b. Pinball Lane: Diagonal line of pinball bumpers forcing cross-track movement */
const addPinballLaneSegment = (obstacles, startY, usableWidth, margin, courseWidth, minGap, radius) => {
  let currentY = startY;
  const bumperRadius = OBSTACLES.PINBALL_BUMPER_RADIUS;
  const count = OBSTACLES.PINBALL_LANE_BUMPER_COUNT;
  const direction = Math.random() < 0.5 ? 1 : -1; // 1 = top-left to bottom-right

  const wallPad = COURSE.WALL_THICKNESS + bumperRadius + 10;
  const leftX = wallPad;
  const rightX = courseWidth - wallPad;
  const verticalSpacing = Math.max(minGap, 55);

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1); // 0 to 1
    const x = direction === 1
      ? leftX + t * (rightX - leftX)
      : rightX - t * (rightX - leftX);
    // Add slight random jitter to prevent perfect diagonal (more chaotic)
    const jitterX = (Math.random() - 0.5) * 20;
    const jitterY = (Math.random() - 0.5) * 10;

    obstacles.push({
      type: 'pinball_bumper',
      x: Math.max(wallPad, Math.min(courseWidth - wallPad, x + jitterX)),
      y: currentY + jitterY,
      radius: bumperRadius,
    });
    currentY += verticalSpacing;
  }

  return currentY - startY;
};

/** 1. Plinko Drop Segment: Dense grid of standard pegs to scramble the pack */
const addPlinkoSegment = (obstacles, startY, usableWidth, margin, courseWidth, minGap, radius) => {
  let currentY = startY;
  const rows = 4 + Math.floor(Math.random() * 3); // 4-6 rows
  // Even vertical spacing: ball diameter * 3 ensures comfortable diagonal passage
  const verticalSpacing = Math.max(radius * 6, minGap * 1.2) + 10;

  // Alternating bias creates a slalom effect — balls are pushed side to side
  const biasDirection = Math.random() < 0.5 ? 1 : -1;
  for (let i = 0; i < rows; i++) {
    const bias = (i % 2 === 0 ? biasDirection : -biasDirection) * 0.5;
    const h = addPegRow(obstacles, currentY, usableWidth, margin, courseWidth, minGap, false, i, bias);
    currentY += h + verticalSpacing;
  }
  return currentY - startY; // Height consumed
};

/** 2. Chaos Zone Segment: Spinners, Bouncy Pegs, and the new Pinball Bumpers */
const addChaosSegment = (obstacles, startY, usableWidth, margin, courseWidth, minGap, radius) => {
  let currentY = startY;

  // A Spinner Ring
  const ringRadius = OBSTACLES.SPINNER_RING_RADIUS;
  const spinnerX = margin + usableWidth / 2 + (Math.random() - 0.5) * usableWidth * 0.3;
  obstacles.push({
    type: 'spinner_ring', id: `ring_${currentY}`, x: spinnerX, y: currentY + ringRadius, radius: ringRadius, angle: 0,
    angularVelocity: (Math.random() < 0.5 ? 1 : -1) * 0.03,
  });
  for (let i = 0; i < OBSTACLES.SPINNER_PEG_COUNT; i++) {
    obstacles.push({ type: 'spinner_peg', ringId: `ring_${currentY}`, x: spinnerX, y: currentY + ringRadius, radius: OBSTACLES.SPINNER_PEG_RADIUS, angleOffset: (i / OBSTACLES.SPINNER_PEG_COUNT) * Math.PI * 2 });
  }

  // Pinball Bumpers flanking the spinner, ensuring they don't overlap the spinner or walls
  const bumperRadius = OBSTACLES.PINBALL_BUMPER_RADIUS;
  const leftBumperX = Math.max(COURSE.WALL_THICKNESS + bumperRadius + 10, margin + 20);
  const rightBumperX = Math.min(courseWidth - COURSE.WALL_THICKNESS - bumperRadius - 10, courseWidth - margin - 20);

  // Nudge bumpers if they are too close to the spinner
  const safeDist = ringRadius + bumperRadius + minGap;
  const actualLeftBumperX = Math.min(leftBumperX, spinnerX - safeDist);
  const actualRightBumperX = Math.max(rightBumperX, spinnerX + safeDist);

  obstacles.push({ type: 'pinball_bumper', x: actualLeftBumperX, y: currentY + ringRadius + 20, radius: bumperRadius });
  obstacles.push({ type: 'pinball_bumper', x: actualRightBumperX, y: currentY + ringRadius + 20, radius: bumperRadius });

  currentY += ringRadius * 2 + 40;

  // Finish segment with a row of bouncy pegs
  const h = addPegRow(obstacles, currentY, usableWidth, margin, courseWidth, minGap, true, 0);

  return (currentY + h) - startY;
};



/** 4. Sieve Segment: A trapdoor funnel or double funnels to create a bottleneck */
const addSieveSegment = (obstacles, startY, usableWidth, margin, courseWidth, minGap, radius) => {
  let currentY = startY;
  const height = OBSTACLES.FUNNEL_HEIGHT;

  if (Math.random() > 0.5) {
    // Trapdoor Funnel
    const centerX = courseWidth / 2;
    // Ensure the mouth safely passes the ball: accounts for collision thickness
    const safeGap = radius * 2.5 + OBSTACLES.WALL_THICKNESS;
    const desiredGap = (minGap * 0.9) / 2;
    const mouthHalfGap = Math.max(desiredGap, safeGap);

    const blockWidth = mouthHalfGap * 2 + 30;
    const startX = centerX - blockWidth / 2;

    // Ensure the trapdoor doesn't open past the right wall
    const availableRight = (courseWidth - COURSE.WALL_THICKNESS) - (startX + blockWidth);
    const openRange = Math.min(blockWidth + 50, availableRight - 5);

    obstacles.push({ type: 'trapdoor_block', x: startX, y: currentY + height + 5, width: blockWidth, height: 15, startX, openRange, timeOffset: Math.random() * 200 });
    obstacles.push({ type: 'funnel_left', x: centerX - OBSTACLES.FUNNEL_WIDTH / 2 - 20, y: currentY, x2: centerX - mouthHalfGap, y2: currentY + height, thickness: OBSTACLES.WALL_THICKNESS });
    obstacles.push({ type: 'funnel_right', x: centerX + mouthHalfGap, y: currentY + height, x2: centerX + OBSTACLES.FUNNEL_WIDTH / 2 + 20, y2: currentY, thickness: OBSTACLES.WALL_THICKNESS });
    currentY += height + 35;
  } else {
    // Double Funnels
    const qW = usableWidth / 4;
    const spread = OBSTACLES.DOUBLE_FUNNEL_SPREAD / 4;
    // Ensure the mouth safely passes the ball: accounts for collision thickness
    const safeGap = radius * 2.5 + OBSTACLES.WALL_THICKNESS;
    const desiredGap = (minGap * 0.9) / 2;
    const mouthHalfGap = Math.max(desiredGap, safeGap);

    const leftC = margin + qW;
    obstacles.push({ type: 'funnel_left', x: leftC - spread - 15, y: currentY, x2: leftC - mouthHalfGap, y2: currentY + height, thickness: OBSTACLES.WALL_THICKNESS });
    obstacles.push({ type: 'funnel_right', x: leftC + mouthHalfGap, y: currentY + height, x2: leftC + spread + 15, y2: currentY, thickness: OBSTACLES.WALL_THICKNESS });

    const rightC = margin + qW * 3;
    obstacles.push({ type: 'funnel_left', x: rightC - spread - 15, y: currentY, x2: rightC - mouthHalfGap, y2: currentY + height, thickness: OBSTACLES.WALL_THICKNESS });
    obstacles.push({ type: 'funnel_right', x: rightC + mouthHalfGap, y: currentY + height, x2: rightC + spread + 15, y2: currentY, thickness: OBSTACLES.WALL_THICKNESS });
    currentY += height + 10;
  }

  return currentY - startY;
};

/** 5. Funnel Cascade: Series of swaying funnels dropping onto a slider */
const addFunnelCascadeSegment = (obstacles, startY, usableWidth, margin, courseWidth, minGap, radius) => {
  let currentY = startY;
  const gapScale = Math.max(0.4, minGap / 74);

  let h = addFunnelRow(obstacles, currentY, usableWidth, margin, 'left', minGap, true, radius);
  currentY += h + (minGap * gapScale) + 10;

  h = addFunnelRow(obstacles, currentY, usableWidth, margin, 'right', minGap, true, radius);
  currentY += h + (minGap * gapScale) + 20;

  h = addSliderRow(obstacles, currentY, usableWidth, courseWidth, minGap);
  currentY += h;

  return currentY - startY;
};


// ── Main Generation Loop ───────────────────────

const getZone = (y, playableStart, playableHeight) => {
  const progress = (y - playableStart) / playableHeight;
  if (progress < ZONES.TOP_END) return 'top';
  if (progress < ZONES.MID_END) return 'mid';
  return 'bot';
};

const pickSegment = (zone, lastSegment) => {
  // Pools of segment generators for each zone
  const pools = {
    top: [addPlinkoSegment, addSieveSegment, addCrossoverSegment],
    mid: [addChaosSegment, addFunnelCascadeSegment, addPlinkoSegment, addWarpGauntletSegment, addCrossoverSegment, addPinballLaneSegment],
    bot: [addWarpGauntletSegment, addChaosSegment, addFunnelCascadeSegment, addPinballLaneSegment],
  };

  const pool = pools[zone];
  let pick;
  let attempts = 0;
  do {
    pick = pool[Math.floor(Math.random() * pool.length)];
    attempts++;
  } while (pick === lastSegment && attempts < 4);

  return pick;
};

export const generateCourse = (courseWidth, courseHeight, ballCount = 50) => {
  const obstacles = [];
  const margin = 30; // visual inner margin for standard central obstacles
  const usableWidth = courseWidth - margin * 2;
  const playableStart = OBSTACLES.FIRST_ROW_Y;
  const playableEnd = courseHeight - COURSE.FINISH_LINE_HEIGHT - 100;
  const playableHeight = playableEnd - playableStart;

  // Dynamic gap sizing based on the actual physical radius of the balls
  const radius = getBallRadius(ballCount);
  const minGap = radius * 4 + 18;
  const gapScale = Math.max(0.4, minGap / 74);

  let currentY = playableStart;
  let lastSegment = null;

  while (currentY < playableEnd) {
    const zone = getZone(currentY, playableStart, playableHeight);
    const segmentFn = pickSegment(zone, lastSegment);
    lastSegment = segmentFn;

    // To prevent segments from placing obstacles past the finish line, we generate them into a temporary array
    const tempObstacles = [];
    const heightConsumed = segmentFn(tempObstacles, currentY, usableWidth, margin, courseWidth, minGap, radius, playableEnd);

    // Only add obstacles that are strictly above the playableEnd line
    for (const obs of tempObstacles) {
      const bottomY = obs.y2 || (obs.y + (obs.height || obs.radius || OBSTACLES.FUNNEL_HEIGHT));
      if (bottomY < playableEnd) {
        obstacles.push(obs);
      }
    }

    // Add zone-appropriate padding before the next segment
    const spacing = zone === 'top' ? ZONES.TOP_SPACING : zone === 'mid' ? ZONES.MID_SPACING : ZONES.BOT_SPACING;
    // Base padding should always be at least minGap * 1.5 to avoid segment overlap squeezing
    const padding = minGap * 1.5 + (spacing.base * gapScale * 0.5) + (Math.random() * spacing.variance * gapScale);

    currentY += heightConsumed + padding;
  }

  return obstacles;
};
