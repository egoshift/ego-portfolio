/**
 * Keywords pulled from Ems's CV, each tagged with a group.
 *
 * The three groups are the ones the filter pills show. `skills` deliberately
 * covers the whole technical stack — languages, databases, frameworks, AI,
 * build and test tooling — because on a word cloud those splits are not ones
 * anyone reads.
 *
 * `works` has nothing in it yet. Its pill stays disabled until there is
 * something to put there.
 */

export type InterestGroup = 'skills' | 'hobbies' | 'works';

/** Display names, used on the filter pills. */
export const INTEREST_GROUPS: Record<InterestGroup, string> = {
  skills: 'Skills / Tools',
  hobbies: 'Hobbies / Interests',
  works: 'Works / Projects',
};

export interface InterestWord {
  label: string;
  group: InterestGroup;
  /**
   * Optional path under `public/`, resolved through `asset()`. Present means
   * the globe draws this point as a logo instead of as text — the sphere takes
   * either, so entries can mix freely.
   *
   * The logo is drawn as a mask so it comes through in the page's cyan, which
   * needs the PNG's transparency to actually be used. ts.png and js.png are
   * solid squares with the glyph knocked out in white, so they mask to a plain
   * block — those two stay as text.
   */
  image?: string;
}

export const INTEREST_WORDS: InterestWord[] = [
  // Languages
  { label: 'TypeScript', group: 'skills' },
  { label: 'JavaScript', group: 'skills' },
  { label: 'Python', group: 'skills' },
  { label: 'PHP', group: 'skills', image: 'tech/php.png' },
  { label: 'SQL', group: 'skills' },
  { label: 'C#', group: 'skills' },
  { label: 'HTML', group: 'skills', image: 'tech/html.png' },
  { label: 'CSS', group: 'skills', image: 'tech/css.png' },

  // Databases
  { label: 'PostgreSQL', group: 'skills', image: 'tech/postgresql.png' },
  { label: 'MySQL', group: 'skills', image: 'tech/mysql.png' },
  { label: 'MongoDB', group: 'skills' },

  // Frameworks & libraries
  { label: 'React', group: 'skills', image: 'tech/react.png' },
  { label: 'React Native', group: 'skills' },
  { label: 'Next.js', group: 'skills', image: 'tech/nextjs.png' },
  { label: 'Node.js', group: 'skills' },
  { label: 'NestJS', group: 'skills', image: 'tech/nestjs.png' },
  { label: 'Express', group: 'skills' },
  { label: 'Laravel', group: 'skills', image: 'tech/laravel.png' },
  { label: 'Flask', group: 'skills' },
  { label: 'TailwindCSS', group: 'skills', image: 'tech/tailwindcss.png' },
  { label: 'MaterialUI', group: 'skills', image: 'tech/mui.png' },

  // AI
  { label: 'LLMs', group: 'skills' },
  { label: 'AI Agents', group: 'skills' },
  { label: 'Guardrails', group: 'skills' },
  { label: 'Agentic Coding', group: 'skills' },

  // Build, test & infrastructure
  { label: 'NX', group: 'skills', image: 'tech/nx.png' },
  { label: 'Vite', group: 'skills' },
  { label: 'Webpack', group: 'skills' },
  { label: 'ESLint', group: 'skills' },
  { label: 'Jest', group: 'skills' },
  { label: 'Playwright', group: 'skills' },
  { label: 'Docker', group: 'skills' },
  { label: 'GCP', group: 'skills' },
  { label: 'CI/CD', group: 'skills' },

  // Hobbies & the areas Ems is drawn to. The first three come from v1's About
  // window, and Peaksy corroborates the hiking. The rest are the subjects,
  // rather than the tools — Creative Coding and Game Development are already
  // called out on the about panel.
  { label: 'Hiking', group: 'hobbies' },
  { label: 'Photography', group: 'hobbies' },
  { label: 'Art', group: 'hobbies' },
  { label: 'Web', group: 'hobbies' },
  { label: 'AI', group: 'hobbies' },
  { label: 'Creative Coding', group: 'hobbies' },
  { label: 'Game Development', group: 'hobbies' },
  { label: 'Design', group: 'hobbies' },
];
