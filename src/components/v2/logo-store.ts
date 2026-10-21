import { asset } from '../../utils/asset';

/** Object URLs for the globe's logos, filled while the page is loading. */
const captured = new Map<string, string>();

/**
 * Fetches a logo's bytes and keeps them in memory.
 *
 * The globe draws logos as CSS masks, and a mask referencing a file issues its
 * own request — a `<link rel=preload>` or an `Image()` for the same file does
 * not satisfy it. Measured: twelve real requests fired the moment the globe
 * opened, long after loading had finished. Holding the bytes as a blob and
 * giving the mask that instead means the request has already happened.
 */
export async function captureLogo(path: string): Promise<void> {
  if (captured.has(path)) return;
  try {
    const response = await fetch(asset(path));
    if (!response.ok) return;
    captured.set(path, URL.createObjectURL(await response.blob()));
  } catch {
    // Leave it uncaptured; logoUrl falls back to the plain path, which costs
    // a request but still draws.
  }
}

/** The in-memory URL if loading captured one, otherwise the plain path. */
export function logoUrl(path: string): string {
  return captured.get(path) ?? asset(path);
}
