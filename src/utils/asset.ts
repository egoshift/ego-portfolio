/**
 * Resolves a `public/` asset against the deploy base so it works from any
 * page depth (`/ego-portfolio/` for v2, `/ego-portfolio/v1/` for v1).
 */
export function asset(path: string): string {
  if (!path) return '';
  return `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`;
}
