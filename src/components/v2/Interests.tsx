import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WordGlobe } from './word-globe';
import { asset } from '../../utils/asset';
import {
  INTEREST_GROUPS,
  INTEREST_WORDS,
  type InterestGroup,
  type InterestWord,
} from './interests.data';

const GROUP_ORDER = Object.keys(INTEREST_GROUPS) as InterestGroup[];
/** Matches the engine's burst, so the buttons settle as the words do. */
const GLITCH_MS = 460;
/**
 * Points on the sphere, words and filler dots together. Topping up to a
 * constant keeps the globe from looking half built when a filter is on.
 */
const TARGET_POINTS = 46;
/**
 * Extra dots on top of that as a group empties out, on a squared curve — the
 * crowded views barely notice, while a small group gets close to twice the
 * dots and still reads as a full sphere.
 */
const SPARSE_BONUS = 46;
/**
 * Dots never fall below this share of the points on the sphere.
 *
 * Topping up to a constant alone silently zeroed them once logos started
 * claiming a second point each and the counts reached the target from above —
 * the texture is wanted on a busy sphere too, not only a sparse one.
 */
const MIN_FILLER_SHARE = 0.28;

/** One place on the sphere. An entry with a logo claims two of them. */
type Point = { kind: 'word' | 'image'; word: InterestWord };

type Slot = Point | { kind: 'filler'; scale: number; alpha: number };

/**
 * Expands the entries into points.
 *
 * A word with a logo appears twice — once as the mark, once as the name — so
 * the mark never costs you the label, and the globe reads fuller for it. The
 * two are shuffled apart, so they land on opposite sides rather than together.
 */
function toPoints(words: InterestWord[]): Point[] {
  const points: Point[] = [];
  for (const word of words) {
    points.push({ kind: 'word', word });
    if (word.image) points.push({ kind: 'image', word });
  }
  return points;
}

function fillerCount(points: number): number {
  const topUp = Math.max(0, TARGET_POINTS - points);
  const emptiness = 1 - Math.min(1, points / TARGET_POINTS);
  const sparse = topUp + Math.round(SPARSE_BONUS * emptiness * emptiness);
  return Math.max(Math.round(points * MIN_FILLER_SHARE), sparse);
}

/**
 * Spreads the fillers evenly through the words.
 *
 * Order matters: the sphere walks pole to pole by index, so appending the
 * fillers after the words would band all the text into one hemisphere and all
 * the dots into the other. Merging the two streams in proportion scatters
 * them through each other instead.
 */
/**
 * Shuffles the words before they are laid out.
 *
 * The sphere walks pole to pole by index, so any property that runs in blocks
 * through the data lands as a band on the globe — the logo-bearing entries sit
 * together in the file, and without this they all cluster in one hemisphere.
 * It also splits each logo from its own label.
 */
function shuffled(points: Point[]): Point[] {
  const out = [...points];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function interleaveFillers(points: Point[], fillers: number): Slot[] {
  const slots: Slot[] = [];
  let pointIndex = 0;
  let fillerIndex = 0;

  for (let i = 0; i < points.length + fillers; i++) {
    const pointShare = points.length ? pointIndex / points.length : 1;
    const fillerShare = fillers ? fillerIndex / fillers : 1;
    if (pointIndex < points.length && (fillerIndex >= fillers || pointShare <= fillerShare)) {
      slots.push(points[pointIndex++]);
    } else {
      // Rolled per slot rather than per frame, so a dot keeps its size and
      // level until the filter changes.
      slots.push({
        kind: 'filler',
        scale: 0.45 + Math.random() * 1.25,
        alpha: 0.22 + Math.random() * 0.78,
      });
      fillerIndex++;
    }
  }
  return slots;
}

export default function Interests() {
  const sphereRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<WordGlobe | null>(null);
  const glitchTimer = useRef<number | undefined>(undefined);

  /** null means no filter — all three groups showing. */
  const [filter, setFilter] = useState<InterestGroup | null>(null);
  const [glitching, setGlitching] = useState(false);

  const visible = useMemo(
    () => (filter ? INTEREST_WORDS.filter((word) => word.group === filter) : INTEREST_WORDS),
    [filter]
  );

  const slots = useMemo(() => {
    const points = shuffled(toPoints(visible));
    return interleaveFillers(points, fillerCount(points.length));
  }, [visible]);

  const counts = useMemo(() => {
    const tally = {} as Record<InterestGroup, number>;
    for (const { group } of INTEREST_WORDS) tally[group] = (tally[group] ?? 0) + 1;
    return tally;
  }, []);

  useEffect(() => {
    const element = sphereRef.current;
    if (!element) return;

    const globe = new WordGlobe(element);
    globe.mount();
    globeRef.current = globe;
    return () => {
      globe.destroy();
      globeRef.current = null;
    };
  }, []);

  // After React swaps the rendered words, respace them over the whole sphere.
  // Layout effect so it lands before the browser paints the new set.
  useLayoutEffect(() => {
    globeRef.current?.refresh();
  }, [slots]);

  useEffect(() => () => window.clearTimeout(glitchTimer.current), []);

  const handleFilter = useCallback((group: InterestGroup) => {
    // Clicking the active one clears the filter rather than re-applying it.
    setFilter((current) => (current === group ? null : group));
    globeRef.current?.glitch();

    setGlitching(true);
    window.clearTimeout(glitchTimer.current);
    glitchTimer.current = window.setTimeout(() => setGlitching(false), GLITCH_MS);
  }, []);

  return (
    <motion.div
      className="interests"
      variants={spreadGroup}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <motion.div
        className="interests__intro"
        variants={spreadItem}
        custom={{ x: -1 }}
      >
        <ul className="filters">
          {GROUP_ORDER.map((group) => {
            // Nothing to filter to yet, so the pill says so rather than
            // emptying the globe.
            const empty = !counts[group];
            return (
              <li key={group}>
                <button
                  type="button"
                  className="filters__button"
                  data-active={filter === group || undefined}
                  aria-pressed={filter === group}
                  disabled={empty}
                  onClick={() => handleFilter(group)}
                >
                  {INTEREST_GROUPS[group]}
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>

      {/* The spread moves this wrapper; the globe moves the words inside it,
          so the two never write to the same element's transform. */}
      <motion.div className="globe" variants={spreadItem} custom={{ x: 1 }}>
        <div
          className="globe__sphere"
          data-glitching={glitching || undefined}
          ref={sphereRef}
        >
          {/* Circular grab area, so a drag works anywhere on the sphere while
              taps outside it still reach the ripple field. */}
          <span className="globe__grab" aria-hidden="true" />
          {slots.map((slot, i) =>
            slot.kind === 'filler' ? (
              <span
                className="globe__dot"
                data-globe-point
                data-globe-filler
                data-filler-alpha={slot.alpha}
                style={{ '--dot-scale': slot.scale } as CSSProperties}
                aria-hidden="true"
                key={`filler-${i}`}
              />
            ) : slot.kind === 'image' ? (
              <span
                className="globe__image"
                data-globe-point
                data-globe-image
                data-group={slot.word.group}
                role="img"
                aria-label={slot.word.label}
                style={
                  { '--logo': `url(${asset(slot.word.image ?? '')})` } as CSSProperties
                }
                key={`image-${slot.word.label}`}
              />
            ) : (
              <span
                className="globe__word glitch"
                data-globe-point
                data-group={slot.word.group}
                key={`word-${slot.word.label}`}
              >
                {slot.word.label}
              </span>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
