import type { Transition, Variants } from 'framer-motion';

/**
 * The spread. Everything on screen flies outward from the middle and fades,
 * and whatever replaces it arrives the same way in reverse.
 *
 * Each item carries a `custom` direction — a unit-ish vector saying which way
 * it is from the centre of its own group — so a vertical stack parts upward
 * and downward while a row parts left and right.
 */
export interface SpreadDirection {
  x?: number;
  y?: number;
}

/** How far an item travels, before its direction multiplier. */
const SPREAD_DISTANCE = 120; // px

const EASE_OUT: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
  mass: 0.8,
};

const EASE_AWAY: Transition = {
  duration: 0.34,
  ease: [0.4, 0, 1, 1],
};

/** Put this on the group; it paces the children. */
export const spreadGroup: Variants = {
  initial: {},
  enter: {
    transition: { staggerChildren: 0.045, delayChildren: 0.12 },
  },
  exit: {
    // Outermost items leave first, so the group parts from the edges inward.
    transition: { staggerChildren: 0.035, staggerDirection: -1 },
  },
};

/** Put this on each child, with `custom` set to its direction. */
export const spreadItem: Variants = {
  initial: (direction: SpreadDirection = {}) => ({
    opacity: 0,
    x: (direction.x ?? 0) * SPREAD_DISTANCE,
    y: (direction.y ?? 0) * SPREAD_DISTANCE,
    scale: 0.92,
    filter: 'blur(6px)',
  }),
  enter: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: EASE_OUT,
  },
  exit: (direction: SpreadDirection = {}) => ({
    opacity: 0,
    // Further than it arrived from, so leaving reads as scattering rather
    // than retracing the entrance.
    x: (direction.x ?? 0) * SPREAD_DISTANCE * 1.7,
    y: (direction.y ?? 0) * SPREAD_DISTANCE * 1.7,
    scale: 0.9,
    filter: 'blur(8px)',
    transition: EASE_AWAY,
  }),
};

/**
 * The same entrance without the blur.
 *
 * framer writes what it animates inline and leaves it there, so an element
 * using `spreadItem` keeps `filter: blur(0px)` once it has settled. Any
 * filter — even a zero-length blur — makes that element a backdrop root,
 * and `backdrop-filter` on anything inside it then has nothing behind it to
 * sample. The work panel's cards are frosted over the ascii field, so their
 * container uses this instead.
 */
export const spreadItemFlat: Variants = {
  initial: (direction: SpreadDirection = {}) => ({
    opacity: 0,
    x: (direction.x ?? 0) * SPREAD_DISTANCE,
    y: (direction.y ?? 0) * SPREAD_DISTANCE,
    scale: 0.92,
  }),
  enter: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: EASE_OUT,
  },
  exit: (direction: SpreadDirection = {}) => ({
    opacity: 0,
    x: (direction.x ?? 0) * SPREAD_DISTANCE * 1.7,
    y: (direction.y ?? 0) * SPREAD_DISTANCE * 1.7,
    scale: 0.9,
    transition: EASE_AWAY,
  }),
};

/**
 * The home mark tearing in and out.
 *
 * The split rides a plain number, `--split`, which App.css turns into the two
 * offset drop-shadows. Animating the filter string directly does not work:
 * framer-motion cannot interpolate between two multi-function filters, so it
 * snapped from one to the other and the tear never showed. A number it can
 * interpolate frame by frame.
 *
 * It is a filter rather than a text-shadow because framer-motion writes what
 * it animates inline, and an inline text-shadow would outrank `.glitch:hover`
 * and kill the hover split once the mark had settled.
 */
export const markGlitch: Variants = {
  initial: { opacity: 0, x: -10, '--split': 7 },
  enter: {
    // Stepped rather than eased, so it reads as a signal locking on instead
    // of a smooth fade.
    opacity: [0, 1, 0.35, 1, 0.7, 1],
    x: [-10, 5, -3, 2, 0, 0],
    '--split': [7, -5, 3, -2, 1, 0],
    transition: {
      duration: 0.44,
      times: [0, 0.18, 0.36, 0.56, 0.78, 1],
      ease: 'linear',
      // Last to arrive. The About panel staggers ten items and its springs
      // are still settling at ~1.27s, so anything shorter than this and the
      // mark beats the content it belongs to.
      delay: 0.95,
    },
  },
  exit: {
    opacity: [1, 0.5, 1, 0.2, 0],
    x: [0, 3, -5, 7, -12],
    '--split': [0, 4, -6, 9, 12],
    // First to go, and quicker than the panel's own exit, so the mark is
    // gone before the content starts scattering.
    transition: { duration: 0.22, times: [0, 0.25, 0.5, 0.75, 1], ease: 'linear' },
  },
};

/** Same entrance and exit without the tearing, for prefers-reduced-motion. */
export const markFade: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.2, delay: 0.95 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
