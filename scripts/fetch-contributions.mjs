/**
 * Pulls the GitHub contribution calendar into `public/github-contributions.json`.
 *
 * This runs at build time on purpose. The calendar is only exposed through
 * GitHub's GraphQL API, which requires a token — and this site is static, so a
 * token shipped to the browser would be readable by anyone who opens the
 * bundle. Fetching here keeps the token on the machine doing the build and
 * leaves the site with a plain JSON file to read.
 *
 *   npm run contributions                 # uses `gh auth token`
 *   GITHUB_TOKEN=... npm run contributions # or an explicit token (CI)
 *   GITHUB_LOGIN=someone npm run contributions
 */

import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/github-contributions.json');
const LOGIN = process.env.GITHUB_LOGIN || 'egoshift';

/** GitHub's own bucketing, so the squares match what github.com shows. */
const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount contributionLevel }
          }
        }
      }
    }
  }
`;

/** Env first so CI can set it; otherwise borrow the gh CLI's own login. */
function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) return fromEnv.trim();
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

async function main() {
  const token = resolveToken();
  if (!token) {
    throw new Error(
      'No GitHub token. Run `gh auth login`, or set GITHUB_TOKEN. ' +
        'A classic token needs the read:user scope.'
    );
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ego-portfolio-build',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });

  if (!response.ok) {
    // Deliberately not echoing headers or body wholesale — avoids a token
    // ending up in CI logs via an error path.
    throw new Error(`GitHub API returned ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub API: ${payload.errors.map((e) => e.message).join('; ')}`);
  }

  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`No contribution calendar for "${LOGIN}"`);

  const weeks = calendar.weeks.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVELS[day.contributionLevel] ?? 0,
    }))
  );

  const flat = weeks.flat();
  const data = {
    user: LOGIN,
    generatedAt: new Date().toISOString(),
    from: flat[0]?.date ?? null,
    to: flat[flat.length - 1]?.date ?? null,
    total: calendar.totalContributions,
    max: flat.reduce((peak, day) => Math.max(peak, day.count), 0),
    weeks,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(data, null, 2)}\n`);

  const active = flat.filter((day) => day.count > 0).length;
  console.log(
    `${data.total} contributions for ${LOGIN}, ${data.from} to ${data.to}\n` +
      `${weeks.length} weeks, ${active} active days, busiest ${data.max}\n` +
      `wrote ${OUT.replace(`${ROOT}/`, '')}`
  );
}

main().catch((error) => {
  console.error(`fetch-contributions: ${error.message}`);
  process.exit(1);
});
