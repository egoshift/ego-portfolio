import { useEffect, useRef, useState } from 'react';
import { asset } from '../../utils/asset';
import { INTEREST_WORDS } from './interests.data';

/** Re-render only on a visible step, rather than every frame for two seconds. */
const STEP = 0.01;

function waitForImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    // decode() waits for the pixels to be ready to paint, not just for the
    // bytes to arrive — otherwise a logo can still pop in on first render.
    // Resolve either way: a missing logo should not hold the whole page.
    const done = () => resolve();
    image.onload = () => (image.decode ? image.decode().then(done, done) : done());
    image.onerror = done;
    image.src = src;
  });
}

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
