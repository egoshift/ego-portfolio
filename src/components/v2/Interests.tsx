import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WordGlobe } from './word-globe';
import {
  INTEREST_GROUPS,
  INTEREST_WORDS,
  type InterestGroup,
} from './interests.data';

const GROUP_ORDER = Object.keys(INTEREST_GROUPS) as InterestGroup[];
/** Matches the engine's burst, so the buttons settle as the words do. */
const GLITCH_MS = 460;

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
  }, [visible]);

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
          {GROUP_ORDER.map((group) => (
            <li key={group}>
              <button
                type="button"
                className="filters__button"
                data-active={filter === group || undefined}
                aria-pressed={filter === group}
                onClick={() => handleFilter(group)}
              >
                {INTEREST_GROUPS[group]}
              </button>
            </li>
          ))}
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
          {visible.map(({ label, group }) => (
            <span
              className="globe__word glitch"
              data-globe-word
              data-group={group}
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
