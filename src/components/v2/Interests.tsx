import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WordGlobe } from './word-globe';
import {
  INTEREST_GROUPS,
  INTEREST_WORDS,
  type InterestGroup,
} from './interests.data';

const GROUP_ORDER = Object.keys(INTEREST_GROUPS) as InterestGroup[];

export default function Interests() {
  const globeRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const tally = {} as Record<InterestGroup, number>;
    for (const { group } of INTEREST_WORDS) tally[group] = (tally[group] ?? 0) + 1;
    return tally;
  }, []);

  useEffect(() => {
    const element = globeRef.current;
    if (!element) return;

    const globe = new WordGlobe(element);
    globe.mount();
    return () => globe.destroy();
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
        <h2 className="interests__lead">a little bit of everything</h2>
        <ul className="interests__legend">
          {GROUP_ORDER.map((group) => (
            <li key={group} data-group={group}>
              <span className="interests__legend-name">
                {INTEREST_GROUPS[group]}
              </span>
              <span className="interests__legend-count">{counts[group] ?? 0}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* The spread moves this wrapper; the globe moves the words inside it,
          so the two never write to the same element's transform. */}
      <motion.div className="globe" variants={spreadItem} custom={{ x: 1 }}>
        <div className="globe__sphere" ref={globeRef}>
          {/* Circular grab area, so a drag works anywhere on the sphere while
              taps outside it still reach the ripple field. */}
          <span className="globe__grab" aria-hidden="true" />
          {INTEREST_WORDS.map(({ label, group }) => (
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
