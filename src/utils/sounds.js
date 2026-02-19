/** @module sounds — Synthesized audio feedback using the Web Audio API. */

const TICK_BASE_FREQUENCY = 800;
const TICK_INITIAL_GAIN = 0.1;
const TICK_DURATION_SECONDS = 0.05;
const TICK_FADE_TARGET = 0.01;

const WIN_NOTES = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
const WIN_NOTE_INTERVAL_SECONDS = 0.1;
const WIN_NOTE_DURATION_SECONDS = 0.3;
const WIN_PEAK_GAIN = 0.15;

const UI_CLICK_FREQUENCY = 1200;
const UI_CLICK_GAIN = 0.05;
const UI_CLICK_DURATION_SECONDS = 0.05;
const UI_CLICK_FADE_TARGET = 0.001;

let audioContext = null;
let isMuted = false;

/**
 * Sets the global mute state for all synthesized sounds.
 * @param {boolean} muted - Whether audio should be muted.
 */
export const setMuted = (muted) => {
  isMuted = muted;
};

/**
 * Returns the current global mute state.
 * @returns {boolean} True if audio is muted.
 */
export const getMuted = () => isMuted;

/**
 * Lazily creates and returns the shared AudioContext singleton.
 * @returns {AudioContext} The shared audio context.
 */
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Plays a short tick sound, used as segment-pass feedback during spins.
 * @param {number} [pitch=1] - Multiplier applied to the base frequency.
 */
export const playTick = (pitch = 1) => {
  if (isMuted) return;
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = TICK_BASE_FREQUENCY * pitch;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(TICK_INITIAL_GAIN, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(TICK_FADE_TARGET, context.currentTime + TICK_DURATION_SECONDS);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + TICK_DURATION_SECONDS);
  } catch {
    // Audio not supported or blocked
  }
};

/**
 * Plays a celebratory arpeggio when a winner is selected.
 */
export const playWin = () => {
  if (isMuted) return;
  try {
    const context = getAudioContext();

    WIN_NOTES.forEach((frequency, noteIndex) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      const startTime = context.currentTime + (noteIndex * WIN_NOTE_INTERVAL_SECONDS);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(WIN_PEAK_GAIN, startTime + TICK_DURATION_SECONDS);
      gainNode.gain.exponentialRampToValueAtTime(TICK_FADE_TARGET, startTime + WIN_NOTE_DURATION_SECONDS);

      oscillator.start(startTime);
      oscillator.stop(startTime + WIN_NOTE_DURATION_SECONDS);
    });
  } catch {
    // Audio not supported or blocked
  }
};

/**
 * Plays a subtle click sound for general UI interactions.
 */
export const playUiClick = () => {
  if (isMuted) return;
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = UI_CLICK_FREQUENCY;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(UI_CLICK_GAIN, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(UI_CLICK_FADE_TARGET, context.currentTime + UI_CLICK_DURATION_SECONDS);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + UI_CLICK_DURATION_SECONDS);
  } catch {
    // Audio not supported
  }
};

const COIN_WHOOSH_START_FREQ = 600;
const COIN_WHOOSH_END_FREQ = 200;
const COIN_WHOOSH_DURATION = 0.4;
const COIN_WHOOSH_GAIN = 0.08;
const COIN_CLINK_FREQ = 1500;
const COIN_CLINK_GAIN = 0.12;
const COIN_CLINK_DURATION = 0.08;

/**
 * Plays a coin flip sound — a descending "whoosh" followed by a metallic "clink".
 */
export const playCoinFlip = () => {
  if (isMuted) return;
  try {
    const context = getAudioContext();

    // Whoosh: descending frequency sweep
    const whoosh = context.createOscillator();
    const whooshGain = context.createGain();
    whoosh.connect(whooshGain);
    whooshGain.connect(context.destination);
    whoosh.type = 'sawtooth';
    whoosh.frequency.setValueAtTime(COIN_WHOOSH_START_FREQ, context.currentTime);
    whoosh.frequency.exponentialRampToValueAtTime(COIN_WHOOSH_END_FREQ, context.currentTime + COIN_WHOOSH_DURATION);
    whooshGain.gain.setValueAtTime(COIN_WHOOSH_GAIN, context.currentTime);
    whooshGain.gain.exponentialRampToValueAtTime(TICK_FADE_TARGET, context.currentTime + COIN_WHOOSH_DURATION);
    whoosh.start(context.currentTime);
    whoosh.stop(context.currentTime + COIN_WHOOSH_DURATION);

    // Clink: short metallic ping at the end
    const clink = context.createOscillator();
    const clinkGain = context.createGain();
    clink.connect(clinkGain);
    clinkGain.connect(context.destination);
    clink.type = 'sine';
    clink.frequency.value = COIN_CLINK_FREQ;
    const clinkStart = context.currentTime + COIN_WHOOSH_DURATION * 0.8;
    clinkGain.gain.setValueAtTime(COIN_CLINK_GAIN, clinkStart);
    clinkGain.gain.exponentialRampToValueAtTime(TICK_FADE_TARGET, clinkStart + COIN_CLINK_DURATION);
    clink.start(clinkStart);
    clink.stop(clinkStart + COIN_CLINK_DURATION);
  } catch {
    // Audio not supported
  }
};

const DICE_CLICK_COUNT = 8;
const DICE_CLICK_BASE_FREQ = 400;
const DICE_CLICK_FREQ_RANGE = 200;
const DICE_CLICK_GAIN = 0.06;
const DICE_CLICK_DURATION = 0.03;
const DICE_CLICK_INTERVAL = 0.06;

/**
 * Plays a dice roll sound — rapid staccato clicks simulating dice bouncing.
 */
export const playDiceRoll = () => {
  if (isMuted) return;
  try {
    const context = getAudioContext();

    for (let index = 0; index < DICE_CLICK_COUNT; index++) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      const randomPitch = DICE_CLICK_BASE_FREQ + Math.random() * DICE_CLICK_FREQ_RANGE;
      oscillator.frequency.value = randomPitch;
      oscillator.type = 'square';

      const startTime = context.currentTime + (index * DICE_CLICK_INTERVAL) + (Math.random() * 0.02);
      gainNode.gain.setValueAtTime(DICE_CLICK_GAIN, startTime);
      gainNode.gain.exponentialRampToValueAtTime(TICK_FADE_TARGET, startTime + DICE_CLICK_DURATION);

      oscillator.start(startTime);
      oscillator.stop(startTime + DICE_CLICK_DURATION);
    }
  } catch {
    // Audio not supported
  }
};

/**
 * Resumes the AudioContext if it was suspended (e.g. by autoplay policy).
 * Should be called on a user gesture before the first sound is needed.
 */
export const initAudio = () => {
  try {
    const context = getAudioContext();
    if (context.state === 'suspended') {
      context.resume();
    }
  } catch {
    // Audio not supported
  }
};

const RACE_START_FREQ_START = 200;
const RACE_START_FREQ_END = 600;
const RACE_START_DURATION = 0.6;
const RACE_START_GAIN = 0.1;

/**
 * Plays a race start sound — an ascending frequency sweep.
 */
export const playRaceStart = () => {
  if (isMuted) return;
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(RACE_START_FREQ_START, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(RACE_START_FREQ_END, context.currentTime + RACE_START_DURATION);

    gainNode.gain.setValueAtTime(RACE_START_GAIN, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + RACE_START_DURATION);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + RACE_START_DURATION);
  } catch {
    // Audio not supported
  }
};
