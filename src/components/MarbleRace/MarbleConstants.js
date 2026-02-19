/** @module MarbleConstants — Tuning values for the Marble Race game. */

export const COURSE = {
  WIDTH: 400,
  HEIGHT: 4000,
  WALL_THICKNESS: 4,
  FINISH_LINE_HEIGHT: 40,
  START_ZONE_HEIGHT: 120,
};

export const BALL = {
  MIN_RADIUS: 5,
  MAX_RADIUS: 14,
  GRAVITY: 0.35,
  DAMPING: 1.0,
  RESTITUTION: 0.65,
  MAX_VELOCITY: 18,
  BALL_RESTITUTION: 0.5,
  OVERLAP_PUSH: 0.5,
  STAGGER_ROWS: 5,
};

export const CAMERA = {
  LERP_SPEED: 0.06,
  LEAD_OFFSET: 150,
  VIEWPORT_HEIGHT: 500,
};

export const OBSTACLES = {
  PEG_RADIUS: 6,
  BUMPER_HEIGHT: 6,
  BUMPER_MIN_WIDTH: 40,
  BUMPER_MAX_WIDTH: 100,
  GATE_GAP: 50,
  FUNNEL_WIDTH: 120,
  FUNNEL_HEIGHT: 50,
  ROW_SPACING: 80,
  FIRST_ROW_Y: 200,
  PEGS_PER_ROW_MIN: 3,
  PEGS_PER_ROW_MAX: 7,
  WALL_THICKNESS: 4,
  // Zigzag ramp
  ZIGZAG_SHELF_WIDTH: 140,
  ZIGZAG_SHELF_GAP: 40,
  ZIGZAG_SHELF_ANGLE: 0.18, // radians, slight tilt so balls roll off
  // Spinner peg ring
  SPINNER_RING_RADIUS: 45,
  SPINNER_PEG_COUNT: 6,
  SPINNER_PEG_RADIUS: 5,
  // Double funnel
  DOUBLE_FUNNEL_SPREAD: 160,
  DOUBLE_FUNNEL_HEIGHT: 55,
};

/** Zone boundaries as fractions of course height (after start zone). */
export const ZONES = {
  TOP_END: 0.30,    // sparse intro
  MID_END: 0.72,    // dense chaos
  // rest is bottom   // bottleneck finish
  TOP_SPACING: { base: 90, variance: 40 },
  MID_SPACING: { base: 65, variance: 25 },
  BOT_SPACING: { base: 80, variance: 30 },
};

export const GRID = {
  CELL_SIZE: 50,
};

export const COLORS = {
  WALL: '#334155',
  PEG: '#64748b',
  PEG_HIGHLIGHT: '#94a3b8',
  PEG_SHADOW: 'rgba(0,0,0,0.35)',
  BUMPER: '#475569',
  BUMPER_GLOW: 'rgba(100,116,139,0.25)',
  BUMPER_TOP: '#5a6e82',
  GATE_WALL: '#475569',
  FUNNEL: '#5a6e82',
  FUNNEL_SHADOW: 'rgba(0,0,0,0.2)',
  ZIGZAG: '#526378',
  ZIGZAG_TOP: '#6b8199',
  SPINNER_RING: 'rgba(100,116,139,0.15)',
  SPINNER_PEG: '#7c8ea0',
  SPINNER_PEG_HL: '#a0b3c5',
  BACKGROUND: '#0f172a',
  COURSE_BG: '#1e293b',
  BALL_LABEL: '#fff',
  LEADER_GLOW: 'rgba(254, 221, 40, 0.6)',
  FINISH_LINE: '#22c55e',
  FINISH_BANNER: 'rgba(34, 197, 94, 0.15)',
};
