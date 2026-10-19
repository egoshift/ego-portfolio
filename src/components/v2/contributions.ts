import { asset } from '../../utils/asset';

/** One square in the calendar. `level` is GitHub's own 0–4 bucketing. */
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  user: string;
  /** When the build last pulled this, so the UI can say how fresh it is. */
  generatedAt: string;
  from: string | null;
  to: string | null;
  total: number;
  /** Busiest single day, handy for scaling anything not using `level`. */
  max: number;
  /** Columns, each Sunday-first. The first and last may be partial, exactly as
   *  GitHub returns them, so the grid lines up with github.com. */
  weeks: ContributionDay[][];
}

function isCalendar(value: unknown): value is ContributionCalendar {
  if (typeof value !== 'object' || value === null) return false;
  const maybe = value as Partial<ContributionCalendar>;
  return (
    typeof maybe.total === 'number' &&
    Array.isArray(maybe.weeks) &&
    maybe.weeks.every((week) => Array.isArray(week))
  );
}

/**
 * Reads the calendar that `npm run contributions` wrote into `public/`.
 *
 * Returns null rather than throwing when the file is missing or malformed —
 * the calendar is decoration, and the page should not break because a build
 * step was skipped or the fetch went stale.
 */
export async function loadContributions(
  signal?: AbortSignal
): Promise<ContributionCalendar | null> {
  try {
    const response = await fetch(asset('github-contributions.json'), { signal });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return isCalendar(data) ? data : null;
  } catch {
    return null;
  }
}

/** Flattens the grid back into a single ordered run of days. */
export function toDays(calendar: ContributionCalendar): ContributionDay[] {
  return calendar.weeks.flat();
}
