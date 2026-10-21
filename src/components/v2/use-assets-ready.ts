import { useEffect, useState } from 'react';
import { asset } from '../../utils/asset';
import { INTEREST_WORDS } from './interests.data';

/**
 * The loader is worth seeing, and a fast local load would otherwise blink it
 * in and out. This is the floor, not a delay added to a slow load.
 */
const MINIMUM_MS = 900;

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
 * True once the things the first paint actually depends on are in: the fonts,
 * the contribution calendar, and the globe's logos.
 *
 * The calendar is fetched here and again by the component that draws it. The
 * second call is a cache hit, and threading one promise through two unrelated
 * trees costs more than it saves.
 */
export function useAssetsReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const logos = INTEREST_WORDS.filter((word) => word.image).map((word) =>
      waitForImage(asset(word.image as string))
    );

    const work: Promise<unknown>[] = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      fetch(asset('github-contributions.json')).catch(() => null),
      ...logos,
      new Promise((resolve) => setTimeout(resolve, MINIMUM_MS)),
    ];

    Promise.all(work).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
