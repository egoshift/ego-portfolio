import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WordGlobe } from './word-globe';
import { INTEREST_WORDS } from './interests.data';

export default function Interests() {
  const globeRef = useRef<HTMLDivElement>(null);

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
      {/* The spread moves this wrapper; the globe moves the words inside it,
          so the two never write to the same element's transform. */}
      <motion.div className="globe" variants={spreadItem} custom={{ y: 0.4 }}>
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
