import { BALL, COURSE, OBSTACLES, ZONES } from './MarbleConstants';
import { getBallRadius } from './MarblePhysics';

const getZone = (y, playableStart, playableHeight) => {
  const progress = (y - playableStart) / playableHeight;
  if (progress < ZONES.TOP_END) return 'top';
  if (progress < ZONES.MID_END) return 'mid';
  return 'bot';
};

const getZoneSpacing = (zone) => {
  if (zone === 'top') return ZONES.TOP_SPACING;
  if (zone === 'mid') return ZONES.MID_SPACING;
  return ZONES.BOT_SPACING;
};

const pickRowType = (zone, lastType) => {
  const pools = {
    top: ['peg', 'bouncy_peg', 'peg', 'baffle', 'zigzag', 'slider'],
    mid: ['bouncy_peg', 'zigzag', 'zigzag', 'spinner', 'funnel', 'swaying_funnel', 'trapdoor_funnel', 'baffle', 'slider'],
    bot: ['funnel', 'swaying_funnel', 'trapdoor_funnel', 'double_funnel', 'bouncy_peg', 'zigzag', 'slider'],
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

export const generateCourse = (courseWidth, courseHeight, ballCount = 50) => {
  const obstacles = [];
  const margin = 30; // visual inner margin for standard central obstacles
  const usableWidth = courseWidth - margin * 2;
  const playableStart = OBSTACLES.FIRST_ROW_Y;
  const playableEnd = courseHeight - COURSE.FINISH_LINE_HEIGHT - 100;
  const playableHeight = playableEnd - playableStart;

  // Dynamic gap sizing based on the actual physical radius of the balls
  const radius = getBallRadius(ballCount);
  const minGap = radius * 4 + 18; // Scales down for 50 small balls, stays large for 2 huge balls

  let currentY = playableStart;
  let lastType = '';
  let openSide = Math.random() < 0.5 ? 'left' : 'right';

  while (currentY < playableEnd) {
    const zone = getZone(currentY, playableStart, playableHeight);
    const rowType = pickRowType(zone, lastType);
    lastType = rowType;

    let rowHeight = 0;

    switch (rowType) {
      case 'peg':
        rowHeight = addPegRow(obstacles, currentY, usableWidth, margin, openSide, courseWidth, minGap, false);
        break;
      case 'bouncy_peg':
        rowHeight = addPegRow(obstacles, currentY, usableWidth, margin, openSide, courseWidth, minGap, true);
        break;
      case 'baffle':
        rowHeight = addBaffleRow(obstacles, currentY, usableWidth, margin, openSide, courseWidth, minGap);
        break;
      case 'funnel':
        rowHeight = addFunnelRow(obstacles, currentY, usableWidth, margin, openSide, minGap, false);
        break;
      case 'swaying_funnel':
        rowHeight = addFunnelRow(obstacles, currentY, usableWidth, margin, openSide, minGap, true);
        break;
      case 'trapdoor_funnel':
        rowHeight = addTrapdoorFunnelRow(obstacles, currentY, usableWidth, margin, openSide, minGap);
        break;
      case 'zigzag':
        rowHeight = addZigzagRow(obstacles, currentY, usableWidth, margin, openSide, courseWidth, minGap);
        break;
      case 'slider':
        rowHeight = addSliderRow(obstacles, currentY, usableWidth, margin, courseWidth, minGap);
        break;
      case 'spinner':
        rowHeight = addSpinnerRow(obstacles, currentY, usableWidth, margin, minGap);
        break;
      case 'double_funnel':
        rowHeight = addDoubleFunnelRow(obstacles, currentY, usableWidth, margin, minGap);
        break;
      default:
        rowHeight = addPegRow(obstacles, currentY, usableWidth, margin, openSide, courseWidth, minGap, false);
    }

    // Alternate the open side for the next row
    openSide = openSide === 'left' ? 'right' : 'left';

    const spacing = getZoneSpacing(zone);

    // Scale vertical spacing based on the ball radius (minGap factor)
    // A standard 14px ball has minGap ~74. A 5px ball has minGap ~38.
    // So 38 / 74 is roughly 0.5. Smaller balls get much tighter vertical packing!
    const gapScale = Math.max(0.4, minGap / 74);

    currentY += rowHeight + (minGap * gapScale) + (spacing.base * gapScale * 0.4) + (Math.random() * spacing.variance * gapScale);
  }

  return obstacles;
};

const addPegRow = (obstacles, y, usableWidth, margin, openSide, courseWidth, minGap, isBouncy) => {
  const pegRadius = isBouncy ? OBSTACLES.PEG_RADIUS * 1.5 : OBSTACLES.PEG_RADIUS;
  const minPegSpacing = minGap + pegRadius * 2;
  const maxPegs = Math.floor(usableWidth / minPegSpacing);

  // Dramatically increase max pegs allowed if we are using small balls
  const maxAllowed = minGap < 50 ? 12 : OBSTACLES.PEGS_PER_ROW_MAX;

  const count = Math.max(3, Math.min(
    OBSTACLES.PEGS_PER_ROW_MIN + Math.floor(Math.random() * (maxAllowed - OBSTACLES.PEGS_PER_ROW_MIN)),
    maxPegs,
  ));

  const spacing = usableWidth / (count + 1);
  let maxOffsetY = 0;

  for (let i = 0; i < count; i++) {
    const x = margin + spacing * (i + 1);
    const offsetY = (Math.random() - 0.5) * 8;
    maxOffsetY = Math.max(maxOffsetY, offsetY);
    obstacles.push({
      type: 'peg',
      x,
      y: y + offsetY,
      radius: pegRadius,
      isBouncy,
    });
  }

  // Add mandatory Wall Bouncers to destroy edge tunnels
  obstacles.push({
    type: 'peg',
    x: COURSE.WALL_THICKNESS + pegRadius,
    y: y + (Math.random() - 0.5) * 8,
    radius: pegRadius,
    isBouncy: true, // Always bouncy so they throw wall-riders back into play
  });

  obstacles.push({
    type: 'peg',
    x: courseWidth - COURSE.WALL_THICKNESS - pegRadius,
    y: y + (Math.random() - 0.5) * 8,
    radius: pegRadius,
    isBouncy: true,
  });

  return pegRadius * 2 + maxOffsetY;
};

const addBaffleRow = (obstacles, y, usableWidth, margin, openSide, courseWidth, minGap) => {
  // Baffles stretch further across when balls are small, preventing easy straight drops
  const maxSpan = minGap < 50 ? 0.85 : 0.65;
  const maxWidth = usableWidth * maxSpan;
  const width = 80 + Math.random() * (maxWidth - 80);
  const tilt = width * 0.25; // Steeper downward slope to prevent crawling

  const isLeftWall = openSide === 'right'; // If right is open, baffle anchors left
  // Flush with true wall bounds
  const startX = isLeftWall ? COURSE.WALL_THICKNESS : courseWidth - COURSE.WALL_THICKNESS;

  // Calculate ending X based on startX and width
  const endX = isLeftWall ? startX + width : startX - width;
  const type = isLeftWall ? 'zigzag_right' : 'zigzag_left';

  // 40% chance for a shortcut gap
  if (width > 120 && Math.random() < 0.4) {
    const gapWidth = minGap * 1.2;
    // ensure gap doesn't start too close to wall or end
    const safeZone = width - gapWidth - 40;
    const gapStartDist = 20 + Math.random() * safeZone;

    const gapStartX = isLeftWall ? startX + gapStartDist : startX - gapStartDist;
    const gapEndX = isLeftWall ? gapStartX + gapWidth : gapStartX - gapWidth;

    const getShelfY = (xPos) => y + (Math.abs(xPos - startX) / width) * tilt;

    obstacles.push({
      type,
      x: startX, y: getShelfY(startX),
      x2: gapStartX, y2: getShelfY(gapStartX),
      thickness: OBSTACLES.WALL_THICKNESS + 2,
    });

    obstacles.push({
      type,
      x: gapEndX, y: getShelfY(gapEndX),
      x2: endX, y2: getShelfY(endX),
      thickness: OBSTACLES.WALL_THICKNESS + 2,
    });
  } else {
    obstacles.push({
      type,
      x: startX, y: y,
      x2: endX, y2: y + tilt,
      thickness: OBSTACLES.WALL_THICKNESS + 2,
    });
  }

  return tilt;
};

const addFunnelRow = (obstacles, y, usableWidth, margin, openSide, minGap, isSwaying) => {
  const offset = usableWidth * 0.15;
  const centerX = openSide === 'left'
    ? margin + usableWidth / 2 - offset
    : margin + usableWidth / 2 + offset;

  const halfWidth = OBSTACLES.FUNNEL_WIDTH / 2;
  const mouthHalfGap = minGap / 2 + 6; // slightly wider mouth to prevent jamming

  const timeOffset = Math.random() * Math.PI * 2;
  const speed = 0.002 + Math.random() * 0.002;
  const range = usableWidth * 0.15;

  obstacles.push({
    type: 'funnel_left',
    x: centerX - halfWidth - 20, y,
    x2: centerX - mouthHalfGap, y2: y + OBSTACLES.FUNNEL_HEIGHT,
    startX: centerX - halfWidth - 20, startX2: centerX - mouthHalfGap,
    thickness: OBSTACLES.WALL_THICKNESS,
    isSwaying, timeOffset, speed, range,
  });

  obstacles.push({
    type: 'funnel_right',
    x: centerX + mouthHalfGap, y: y + OBSTACLES.FUNNEL_HEIGHT,
    x2: centerX + halfWidth + 20, y2: y,
    startX: centerX + mouthHalfGap, startX2: centerX + halfWidth + 20,
    thickness: OBSTACLES.WALL_THICKNESS,
    isSwaying, timeOffset, speed, range,
  });

  return OBSTACLES.FUNNEL_HEIGHT;
};

const addZigzagRow = (obstacles, y, usableWidth, margin, openSide, courseWidth, minGap) => {
  // If gaps are tiny (lots of balls), tighten the shelves to prevent massive free-falling tunnels
  const verticalGap = minGap < 50 ? OBSTACLES.ZIGZAG_SHELF_GAP * 0.7 : OBSTACLES.ZIGZAG_SHELF_GAP;
  const shelfSpan = minGap < 50 ? usableWidth * 0.85 : usableWidth * 0.70;

  const tilt = OBSTACLES.ZIGZAG_SHELF_ANGLE * verticalGap;
  const gapWidth = minGap * 1.5;

  const addShelf = (isLeftWall, yOff) => {
    // Start flush against structural course walls
    const startX = isLeftWall ? COURSE.WALL_THICKNESS : courseWidth - COURSE.WALL_THICKNESS;
    const endX = isLeftWall ? startX + shelfSpan : startX - shelfSpan;
    const type = isLeftWall ? 'zigzag_right' : 'zigzag_left';

    const getShelfY = (xPos) => yOff + (Math.abs(xPos - startX) / shelfSpan) * tilt;

    if (Math.random() < 0.6) {
      const minGapX = isLeftWall ? startX + 30 : endX + 30;
      const maxGapX = isLeftWall ? endX - gapWidth - 30 : startX - gapWidth - 30;

      const gapStartX = minGapX + Math.random() * (maxGapX - minGapX);
      const gapEndX = gapStartX + gapWidth;

      obstacles.push({
        type,
        x: startX, y: getShelfY(startX),
        x2: isLeftWall ? gapStartX : gapEndX, y2: getShelfY(isLeftWall ? gapStartX : gapEndX),
        thickness: OBSTACLES.WALL_THICKNESS + 2,
      });
      obstacles.push({
        type,
        x: isLeftWall ? gapEndX : gapStartX, y: getShelfY(isLeftWall ? gapEndX : gapStartX),
        x2: endX, y2: getShelfY(endX),
        thickness: OBSTACLES.WALL_THICKNESS + 2,
      });
    } else {
      obstacles.push({
        type,
        x: startX, y: getShelfY(startX),
        x2: endX, y2: getShelfY(endX),
        thickness: OBSTACLES.WALL_THICKNESS + 2,
      });
    }
  };

  if (openSide === 'left') {
    addShelf(true, y);
    addShelf(false, y + verticalGap);
  } else {
    addShelf(false, y);
    addShelf(true, y + verticalGap);
  }

  return verticalGap + tilt;
};

const addSpinnerRow = (obstacles, y, usableWidth, margin, minGap) => {
  const centerX = margin + usableWidth / 2 + (Math.random() - 0.5) * usableWidth * 0.15;
  const pegRadius = OBSTACLES.SPINNER_PEG_RADIUS;
  const ringRadius = OBSTACLES.SPINNER_RING_RADIUS;

  const circumference = 2 * Math.PI * ringRadius;
  const maxPegs = Math.floor(circumference / (minGap + pegRadius * 2));
  const pegCount = Math.min(OBSTACLES.SPINNER_PEG_COUNT, Math.max(3, maxPegs));

  const startAngle = Math.random() * Math.PI * 2;

  obstacles.push({
    type: 'spinner_ring',
    id: `ring_${y}`,
    x: centerX, y,
    radius: ringRadius,
    angle: 0,
    angularVelocity: (Math.random() < 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.02),
  });

  for (let i = 0; i < pegCount; i++) {
    const angleOffset = startAngle + (i / pegCount) * Math.PI * 2;
    obstacles.push({
      type: 'spinner_peg',
      ringId: `ring_${y}`,
      x: centerX + Math.cos(angleOffset) * ringRadius,
      y: y + Math.sin(angleOffset) * ringRadius,
      radius: pegRadius,
      angleOffset,
    });
  }

  return ringRadius + pegRadius;
};

const addDoubleFunnelRow = (obstacles, y, usableWidth, margin, minGap) => {
  const height = OBSTACLES.DOUBLE_FUNNEL_HEIGHT;
  const quarterWidth = usableWidth / 4;
  const halfSpread = OBSTACLES.DOUBLE_FUNNEL_SPREAD / 4;
  const mouthHalfGap = minGap / 2 + 4;

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

  return height;
};

const addTrapdoorFunnelRow = (obstacles, y, usableWidth, margin, openSide, minGap) => {
  const height = OBSTACLES.FUNNEL_HEIGHT;
  const offset = usableWidth * 0.15;
  const centerX = openSide === 'left'
    ? margin + usableWidth / 2 - offset
    : margin + usableWidth / 2 + offset;

  const halfWidth = OBSTACLES.FUNNEL_WIDTH / 2;
  const mouthHalfGap = minGap / 2 + 6;

  // The flat, horizontal slider block directly under the mouth
  const blockWidth = mouthHalfGap * 2 + 30;
  const blockHeight = 15;
  const blockY = y + height + 5;

  obstacles.push({
    type: 'trapdoor_block',
    x: centerX - blockWidth / 2,
    y: blockY,
    width: blockWidth,
    height: blockHeight,
    startX: centerX - blockWidth / 2,
    openRange: blockWidth + 50, // Distance to slide out of the way
    timeOffset: Math.random() * 200,
  });

  obstacles.push({
    type: 'funnel_left',
    x: centerX - halfWidth - 20, y,
    x2: centerX - mouthHalfGap, y2: y + height,
    thickness: OBSTACLES.WALL_THICKNESS,
  });

  obstacles.push({
    type: 'funnel_right',
    x: centerX + mouthHalfGap, y: y + height,
    x2: centerX + halfWidth + 20, y2: y,
    thickness: OBSTACLES.WALL_THICKNESS,
  });

  return height + blockHeight + 30;
};

const addSliderRow = (obstacles, y, usableWidth, margin, courseWidth, minGap) => {
  // Make the slider fatter when balls are smaller so they can't just slip by
  const slideWidthRatio = minGap < 50 ? 0.6 : 0.4;
  const sliderWidth = usableWidth * slideWidthRatio;
  const height = OBSTACLES.BUMPER_HEIGHT + 4;

  // Sweep back and forth across a restricted range so it doesn't clip into walls
  const minX = COURSE.WALL_THICKNESS + minGap;
  const maxX = courseWidth - COURSE.WALL_THICKNESS - sliderWidth - minGap;
  const range = (maxX - minX) / 2;
  const startX = minX + range; // Center point of the sine wave

  const timeOffset = Math.random() * Math.PI * 2;
  const speed = 0.0015 + Math.random() * 0.0015;

  obstacles.push({
    type: 'slider',
    x: startX,
    y: y,
    width: sliderWidth,
    height: height,
    startX: startX,
    range: range,
    timeOffset: timeOffset,
    speed: speed,
    vx: 0,
  });

  return height;
};
