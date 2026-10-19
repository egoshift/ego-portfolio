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
