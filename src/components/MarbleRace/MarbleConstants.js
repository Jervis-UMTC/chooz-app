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
  GRAVITY: 0.25,
  DAMPING: 0.94,
  RESTITUTION: 0.45,
  MAX_VELOCITY: 9,
  BALL_RESTITUTION: 0.5,
  OVERLAP_PUSH: 0.5,
  STAGGER_ROWS: 5,
  SUB_STEPS: 5,         // Increased collision checks per frame to prevent tunneling
  DRAFTING_BOOST: 0.04, // Slightly increased downward vy boost when trailing close behind
  LEADER_DRAG: 0.015,   // Wind resistance applied to the leader to prevent runaways
  CATCHUP_GRAVITY: 1.15,// Gravity multiplier for balls far behind (rubber-banding)
  TURBULENCE: 0.25,     // Lateral scatter on collision to prevent clumping
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
  PEGS_PER_ROW_MIN: 6,
  PEGS_PER_ROW_MAX: 11,
  WALL_THICKNESS: 4,
  // Zigzag ramp
  ZIGZAG_SHELF_WIDTH: 140,
  ZIGZAG_SHELF_GAP: 40,
  ZIGZAG_SHELF_ANGLE: 0.28, // radians, steeper tilt so balls roll off quickly
  // Spinner peg ring
  SPINNER_RING_RADIUS: 45,
  SPINNER_PEG_COUNT: 6,
  SPINNER_PEG_RADIUS: 5,
  // Double funnel
  DOUBLE_FUNNEL_SPREAD: 160,
  DOUBLE_FUNNEL_HEIGHT: 55,
  // Trapdoor
  TRAPDOOR_CYCLE_TIME: 5000,
  TRAPDOOR_OPEN_TIME: 800,
  TRAPDOOR_SMOOTHING: 0.15,
  // Pinball Bumper
  PINBALL_BUMPER_RADIUS: 14,
  PINBALL_BUMPER_RESTITUTION: 1.8,
  // Warp Portals
  BLACK_HOLE_RADIUS: 25,
  BLACK_HOLE_PULL_RADIUS: 100,
  BLACK_HOLE_PULL_FORCE: 0.15,
  WHITE_HOLE_RADIUS: 25,
  WHITE_HOLE_EJECT_FORCE: 8,
  // Crossover Ramps
  CROSSOVER_RAMP_ANGLE: 0.35,
  // Pinball Lane
  PINBALL_LANE_BUMPER_COUNT: 5,
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

export const MIXER = {
  RADIUS: 70,       // Radius of the spinning drum circle
  CENTER_Y: 90,     // Vertical center of the mixer
  DURATION: 3000,   // How long to spin before releasing (ms)
  SPIN_FORCE: 0.45, // Tangential force applied each frame (aggressive tumble)
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
  // Pinball Bumper
  PINBALL_BUMPER_BASE: '#ef4444',     // Red core
  PINBALL_BUMPER_GLOW: '#fca5a5',     // Light red/pink glow
  PINBALL_BUMPER_SHADOW: 'rgba(220, 38, 38, 0.6)', // Deep red shadow
  // Warp Portals
  BLACK_HOLE_CORE: '#000000',
  BLACK_HOLE_GLOW: 'rgba(168, 85, 247, 0.4)', // Purple glow
  BLACK_HOLE_ACCRETION: '#d8b4fe',
  WHITE_HOLE_CORE: '#ffffff',
  WHITE_HOLE_GLOW: 'rgba(56, 189, 248, 0.4)', // Sky blue glow
  WHITE_HOLE_RING: '#bae6fd',
};
