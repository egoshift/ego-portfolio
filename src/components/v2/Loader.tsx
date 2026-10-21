import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { WordGlobe } from './word-globe';

/** Enough to read as a sphere, and fine enough that each one is ~1.5%. */
const DOTS = 64;

interface Props {
  /** 0 to 1. The share of the sphere that has arrived. */
  progress: number;
}

/**
 * The loading state: the same globe the interests view uses, carrying nothing
 * but dots, filling as the page comes in.
 *
 * Every dot stays mounted the whole time and the unreached ones are simply
 * held at zero alpha. Rendering only the arrived ones would re-space the
 * sphere on every step, so the dots already showing would crawl around
 * instead of staying put while the rest join them.
 *
 * They arrive in sphere order, which runs pole to pole, so the fill reads as
 * a sweep down the globe rather than a scatter.
 */
export default function Loader({ progress }: Props) {
  const sphereRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<WordGlobe | null>(null);

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

  const arrived = Math.round(Math.min(1, Math.max(0, progress)) * DOTS);

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

  // The engine reads each dot's alpha when it collects them, so it has to be
  // told once more have switched on.
  useLayoutEffect(() => {
    globeRef.current?.refresh();
  }, [arrived]);

  return (
    <motion.div
      className="loader"
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
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
            data-filler-alpha={i < arrived ? dot.alpha : 0}
            style={{ '--dot-scale': dot.scale } as CSSProperties}
          />
        ))}
      </div>
    </motion.div>
  );
}
