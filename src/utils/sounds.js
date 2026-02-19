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
