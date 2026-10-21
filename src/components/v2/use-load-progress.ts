import { useEffect, useRef, useState } from 'react';
import { asset } from '../../utils/asset';
import { INTEREST_WORDS } from './interests.data';

/** The loader is held at least this long, however fast the assets arrive. */
const MINIMUM_MS = 2000;
/** Re-render only on a visible step, rather than every frame for two seconds. */
const STEP = 0.01;

function waitForImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    // Resolve either way: a missing logo should not hold the whole page.
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

/**
 * How far the page is from being ready, 0 to 1.
 *
 * Two things gate it and the lower one wins: how many assets have actually
 * landed, and how much of the minimum has elapsed. Taking the minimum means
 * the globe can never show full before both are true — a fast local load
 * fills at the floor's pace, a slow one fills at the assets' pace, and
 * neither ever rushes ahead of what has really happened.
 */
export function useLoadProgress(): number {
  const [progress, setProgress] = useState(0);
  const reported = useRef(0);

  useEffect(() => {
    let frame = 0;
    let landed = 0;
    const started = performance.now();

    const tasks: Promise<unknown>[] = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      fetch(asset('github-contributions.json')).catch(() => null),
      ...INTEREST_WORDS.filter((word) => word.image).map((word) =>
        waitForImage(asset(word.image as string))
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
      const byTime = Math.min(1, (performance.now() - started) / MINIMUM_MS);
      const byAssets = total ? landed / total : 1;
      const next = Math.min(byTime, byAssets);

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
