import { useEffect, useRef, useState } from 'react';
import { loadContributions } from './contributions';
import { INTEREST_WORDS } from './interests.data';
import { captureLogo } from './logo-store';

/** Re-render only on a visible step, rather than every frame for two seconds. */
const STEP = 0.01;


/**
 * How far the page is from being ready, 0 to 1.
 *
 * Purely how many of the page's assets have landed — no minimum, no padding.
 * The globe is full exactly when the page is.
 */
export function useLoadProgress(): number {
  const [progress, setProgress] = useState(0);
  const reported = useRef(0);

  useEffect(() => {
    let frame = 0;
    let landed = 0;

    const tasks: Promise<unknown>[] = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      loadContributions(),
      // Captured as blobs, so the globe's masks have nothing left to fetch.
      ...INTEREST_WORDS.filter((word) => word.image).map((word) =>
        captureLogo(word.image as string)
      ),
    ];
    const total = tasks.length;
    for (const task of tasks) {
      task.then(
        () => {
          landed += 1;
        },
        () => {
          landed += 1;
        }
      );
    }

    const tick = () => {
      const next = total ? landed / total : 1;

      if (next >= 1 || next - reported.current >= STEP) {
        reported.current = next;
        setProgress(next);
      }
      if (next < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return progress;
}
