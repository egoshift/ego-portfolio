import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { WordGlobe } from './word-globe';

/** Enough to read as a sphere without being a crowd. */
const DOTS = 64;

/**
 * The loading state: the same globe the interests view uses, carrying nothing
 * but dots.
 *
 * Reusing the engine means the wait is a preview of the thing being waited
 * for, and there is no second animation to keep in step with the first.
 */
export default function Loader() {
  const sphereRef = useRef<HTMLDivElement>(null);

  const dots = useMemo(
    () =>
      Array.from({ length: DOTS }, () => ({
        scale: 0.5 + Math.random() * 1.3,
        // Brighter floor than the globe's own fillers: this one has to be
        // noticed rather than sit behind the words.
        alpha: 0.5 + Math.random() * 0.5,
      })),
    []
  );

  useEffect(() => {
    const element = sphereRef.current;
    if (!element) return;

    const globe = new WordGlobe(element);
    globe.mount();
    return () => globe.destroy();
  }, []);

  return (
    <motion.div
      className="loader"
      role="status"
      aria-label="Loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, scale: 1.12, transition: { duration: 0.34, ease: 'easeIn' } }}
    >
      <div className="globe__sphere loader__sphere" ref={sphereRef}>
        {dots.map((dot, i) => (
          <span
            key={i}
            className="globe__dot"
            data-globe-point
            data-globe-filler
            data-filler-alpha={dot.alpha}
            style={{ '--dot-scale': dot.scale } as CSSProperties}
          />
        ))}
      </div>
    </motion.div>
  );
}
