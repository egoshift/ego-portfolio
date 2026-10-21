import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WordGlobe } from './word-globe';
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
 * Points on the sphere, words and filler dots together. Holding this constant
 * keeps the globe the same density whatever the filter — a group of eight
 * would otherwise leave it looking half built.
 */
const TARGET_POINTS = 46;

/**
 * Spreads the fillers evenly through the words.
 *
 * Order matters: the sphere walks pole to pole by index, so appending the
 * fillers after the words would band all the text into one hemisphere and all
 * the dots into the other. Merging the two streams in proportion scatters
 * them through each other instead.
 */
function interleaveFillers(
  words: InterestWord[],
  fillers: number
): (InterestWord | null)[] {
  if (fillers <= 0) return words;

  const slots: (InterestWord | null)[] = [];
  let wordIndex = 0;
  let fillerIndex = 0;

  for (let i = 0; i < words.length + fillers; i++) {
    const wordShare = words.length ? wordIndex / words.length : 1;
    const fillerShare = fillerIndex / fillers;
    if (wordIndex < words.length && (fillerIndex >= fillers || wordShare <= fillerShare)) {
      slots.push(words[wordIndex++]);
    } else {
      slots.push(null);
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

  const slots = useMemo(
    () => interleaveFillers(visible, TARGET_POINTS - visible.length),
    [visible]
  );

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
          {slots.map((word, i) =>
            word ? (
              <span
                className="globe__word glitch"
                data-globe-word
                data-group={word.group}
                key={word.label}
              >
                {word.label}
              </span>
            ) : (
              <span
                className="globe__dot"
                data-globe-word
                data-globe-filler
                aria-hidden="true"
                key={`filler-${i}`}
              />
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
