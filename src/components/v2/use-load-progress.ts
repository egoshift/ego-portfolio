import { useEffect, useRef, useState } from 'react';
import { loadContributions } from './contributions';
import { INTEREST_WORDS } from './interests.data';
import { WORK_IMAGES } from './work.data';
import { captureLogo } from './logo-store';

/** Re-render only on a visible step, rather than every frame for two seconds. */
const STEP = 0.01;

/**
 * Every logo the page can show, once each.
 *
 * The globe and the work panel share most of these files, so the set keeps
 * one from being fetched twice.
 */
const LOGOS = [
  ...new Set([
    ...INTEREST_WORDS.flatMap((word) => word.image ?? []),
    ...WORK_IMAGES,
  ]),
];

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
      // Captured as blobs, so the globe's masks and the work panel's logos
      // have nothing left to fetch when you open them.
      ...LOGOS.map((path) => captureLogo(path)),
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
