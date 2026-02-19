import { BALL, COURSE, OBSTACLES, ZONES } from './MarbleConstants';

/**
 * Minimum gap between any two obstacles or obstacle-to-wall.
 * Based on the largest possible ball diameter + padding.
 */
const MIN_GAP = BALL.MAX_RADIUS * 3 + 8; // 50px — comfortable clearance

/**
 * Returns the zone for a given Y position within the playable area.
 */
const getZone = (y, playableStart, playableHeight) => {
  const progress = (y - playableStart) / playableHeight;
  if (progress < ZONES.TOP_END) return 'top';
  if (progress < ZONES.MID_END) return 'mid';
  return 'bot';
};

/**
 * Returns row spacing config for a given zone.
 */
const getZoneSpacing = (zone) => {
  if (zone === 'top') return ZONES.TOP_SPACING;
  if (zone === 'mid') return ZONES.MID_SPACING;
  return ZONES.BOT_SPACING;
};

/**
 * Weighted random pick from a pool based on zone.
 * Prevents consecutive duplicate row types.
 */
const pickRowType = (zone, lastType) => {
  const pools = {
    top: ['peg', 'peg', 'peg', 'bumper', 'zigzag'],
    mid: ['peg', 'peg', 'zigzag', 'zigzag', 'spinner', 'funnel', 'bumper'],
    bot: ['funnel', 'double_funnel', 'peg', 'peg', 'zigzag'],
  };

  const pool = pools[zone];
  let pick;
  let attempts = 0;
  do {
    pick = pool[Math.floor(Math.random() * pool.length)];
    attempts++;
  } while (pick === lastType && attempts < 6);

  return pick;
};

/**
 * Generates a randomized obstacle course divided into zones.
 * All gaps >= MIN_GAP. Alternates which side is open so no
 * straight-line path exists from start to finish.
 */
export const generateCourse = (courseWidth, courseHeight) => {
  const obstacles = [];
  const margin = 30;
  const usableWidth = courseWidth - margin * 2;
  const playableStart = OBSTACLES.FIRST_ROW_Y;
  const playableEnd = courseHeight - COURSE.FINISH_LINE_HEIGHT - 100;
  const playableHeight = playableEnd - playableStart;

  let currentY = playableStart;
  let lastType = '';
  let openSide = Math.random() < 0.5 ? 'left' : 'right'; // alternates each row

  while (currentY < playableEnd) {
    const zone = getZone(currentY, playableStart, playableHeight);
    const rowType = pickRowType(zone, lastType);
    lastType = rowType;

    switch (rowType) {
      case 'peg':
        addPegRow(obstacles, currentY, usableWidth, margin, openSide);
        break;
      case 'bumper':
        addBumperRow(obstacles, currentY, usableWidth, margin, openSide);
        break;
      case 'funnel':
        addFunnelRow(obstacles, currentY, usableWidth, margin, openSide);
        break;
      case 'zigzag':
        addZigzagRow(obstacles, currentY, usableWidth, margin, openSide);
        break;
      case 'spinner':
        addSpinnerRow(obstacles, currentY, usableWidth, margin);
        break;
      case 'double_funnel':
        addDoubleFunnelRow(obstacles, currentY, usableWidth, margin);
        break;
      default:
        addPegRow(obstacles, currentY, usableWidth, margin, openSide);
    }

    // Alternate the open side for the next row
    openSide = openSide === 'left' ? 'right' : 'left';

    const spacing = getZoneSpacing(zone);
    currentY += spacing.base + Math.random() * spacing.variance;
  }

  return obstacles;
};

/**
 * Pegs spanning the full width — covers both sides.
 * The gap between pegs is in the middle, never along the walls.
 * Pegs start close to the wall on the "blocked" side.
 */
const addPegRow = (obstacles, y, usableWidth, margin, openSide) => {
  const pegRadius = OBSTACLES.PEG_RADIUS;
  const minPegSpacing = MIN_GAP + pegRadius * 2;
  const maxPegs = Math.floor(usableWidth / minPegSpacing);
  const count = Math.max(3, Math.min(
    OBSTACLES.PEGS_PER_ROW_MIN + Math.floor(Math.random() * 3),
    maxPegs,
  ));

  const spacing = usableWidth / (count + 1);
  const offsetY = (Math.random() - 0.5) * 8;

  for (let i = 0; i < count; i++) {
    const x = margin + spacing * (i + 1);
    obstacles.push({
      type: 'peg',
      x,
      y: y + offsetY,
      radius: pegRadius,
    });
  }

  // Add extra peg near the open-side wall to block the wall corridor
  // (since pegs cover the full width, we don't need to leave a wall gap)
  const wallPegX = openSide === 'left'
    ? margin + pegRadius + 6
    : margin + usableWidth - pegRadius - 6;
  obstacles.push({
    type: 'peg',
    x: wallPegX,
    y: y + offsetY,
    radius: pegRadius,
  });
};

/**
 * Places a bumper anchored to the open-side wall, blocking that corridor.
 * Gap is on the OTHER side so balls must cross over.
 */
const addBumperRow = (obstacles, y, usableWidth, margin, openSide) => {
  const maxWidth = usableWidth * 0.45;
  const width = 40 + Math.random() * (maxWidth - 40);

  // Anchor bumper to the wall on the side that was open in the PREVIOUS row,
  // which is the current openSide (since we're blocking it now)
  const x = openSide === 'left'
    ? margin  // flush to left wall
    : margin + usableWidth - width; // flush to right wall

  obstacles.push({
    type: 'bumper',
    x,
    y,
    width,
    height: OBSTACLES.BUMPER_HEIGHT,
  });
};

/**
 * Funnel positioned off-center toward the open side to block that corridor.
 */
const addFunnelRow = (obstacles, y, usableWidth, margin, openSide) => {
  // Offset the funnel toward the open side to block the wall corridor
  const offset = usableWidth * 0.15;
  const centerX = openSide === 'left'
    ? margin + usableWidth / 2 - offset
    : margin + usableWidth / 2 + offset;

  const halfWidth = OBSTACLES.FUNNEL_WIDTH / 2;
  const mouthHalfGap = MIN_GAP / 2 + 4;

  obstacles.push({
    type: 'funnel_left',
    x: centerX - halfWidth - 20,
    y: y,
    x2: centerX - mouthHalfGap,
    y2: y + OBSTACLES.FUNNEL_HEIGHT,
    thickness: OBSTACLES.WALL_THICKNESS,
  });

  obstacles.push({
    type: 'funnel_right',
    x: centerX + mouthHalfGap,
    y: y + OBSTACLES.FUNNEL_HEIGHT,
    x2: centerX + halfWidth + 20,
    y2: y,
    thickness: OBSTACLES.WALL_THICKNESS,
  });
};

/**
 * Zigzag shelves — first shelf blocks the open side (touching that wall),
 * second shelf blocks the other side. Forces balls to cross over.
 */
const addZigzagRow = (obstacles, y, usableWidth, margin, openSide) => {
  const verticalGap = OBSTACLES.ZIGZAG_SHELF_GAP;
  const shelfSpan = usableWidth * 0.50;
  const tilt = OBSTACLES.ZIGZAG_SHELF_ANGLE * verticalGap;

  // First shelf blocks the open side (touches that wall)
  if (openSide === 'left') {
    obstacles.push({
      type: 'zigzag_right',
      x: margin,
      y: y,
      x2: margin + shelfSpan,
      y2: y + tilt,
      thickness: OBSTACLES.WALL_THICKNESS + 2,
    });
    obstacles.push({
      type: 'zigzag_left',
      x: margin + usableWidth - shelfSpan,
      y: y + verticalGap,
      x2: margin + usableWidth,
      y2: y + verticalGap + tilt,
      thickness: OBSTACLES.WALL_THICKNESS + 2,
    });
  } else {
    obstacles.push({
      type: 'zigzag_left',
      x: margin + usableWidth - shelfSpan,
      y: y,
      x2: margin + usableWidth,
      y2: y + tilt,
      thickness: OBSTACLES.WALL_THICKNESS + 2,
    });
    obstacles.push({
      type: 'zigzag_right',
      x: margin,
      y: y + verticalGap,
      x2: margin + shelfSpan,
      y2: y + verticalGap + tilt,
      thickness: OBSTACLES.WALL_THICKNESS + 2,
    });
  }
};

/**
 * Spinner ring — centered, blocks the middle. Wall corridors remain
 * open but the alternating bumpers/pegs on adjacent rows block them.
 */
const addSpinnerRow = (obstacles, y, usableWidth, margin) => {
  const centerX = margin + usableWidth / 2 + (Math.random() - 0.5) * usableWidth * 0.15;
  const pegRadius = OBSTACLES.SPINNER_PEG_RADIUS;
  const ringRadius = OBSTACLES.SPINNER_RING_RADIUS;

  const circumference = 2 * Math.PI * ringRadius;
  const maxPegs = Math.floor(circumference / (MIN_GAP + pegRadius * 2));
  const pegCount = Math.min(OBSTACLES.SPINNER_PEG_COUNT, Math.max(3, maxPegs));

  const startAngle = Math.random() * Math.PI * 2;

  obstacles.push({
    type: 'spinner_ring',
    x: centerX,
    y: y,
    radius: ringRadius,
  });

  for (let i = 0; i < pegCount; i++) {
    const angle = startAngle + (i / pegCount) * Math.PI * 2;
    obstacles.push({
      type: 'peg',
      x: centerX + Math.cos(angle) * ringRadius,
      y: y + Math.sin(angle) * ringRadius,
      radius: pegRadius,
    });
  }
};

/**
 * Double funnel — fills the width, no wall corridors possible.
 */
const addDoubleFunnelRow = (obstacles, y, usableWidth, margin) => {
  const height = OBSTACLES.DOUBLE_FUNNEL_HEIGHT;
  const quarterWidth = usableWidth / 4;
  const halfSpread = OBSTACLES.DOUBLE_FUNNEL_SPREAD / 4;
  const mouthHalfGap = MIN_GAP / 2 + 4;

  const leftCenter = margin + quarterWidth;
  obstacles.push({
    type: 'funnel_left',
    x: leftCenter - halfSpread - 15, y,
    x2: leftCenter - mouthHalfGap, y2: y + height,
    thickness: OBSTACLES.WALL_THICKNESS,
  });
  obstacles.push({
    type: 'funnel_right',
    x: leftCenter + mouthHalfGap, y: y + height,
    x2: leftCenter + halfSpread + 15, y2: y,
    thickness: OBSTACLES.WALL_THICKNESS,
  });

  const rightCenter = margin + quarterWidth * 3;
  obstacles.push({
    type: 'funnel_left',
    x: rightCenter - halfSpread - 15, y,
    x2: rightCenter - mouthHalfGap, y2: y + height,
    thickness: OBSTACLES.WALL_THICKNESS,
  });
  obstacles.push({
    type: 'funnel_right',
    x: rightCenter + mouthHalfGap, y: y + height,
    x2: rightCenter + halfSpread + 15, y2: y,
    thickness: OBSTACLES.WALL_THICKNESS,
  });
};
