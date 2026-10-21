/**
 * Keywords pulled from Ems's CV, each tagged with a group.
 *
 * The three groups are the ones the filter pills show. `skills` deliberately
 * covers the whole technical stack — languages, databases, frameworks, AI,
 * build and test tooling — because on a word cloud those splits are not ones
 * anyone reads.
 *
 * `outside` has nothing in it yet: the only non-technical words so far are
 * hobbies. Its pill is disabled until there is something to put there.
 */

export type InterestGroup = 'skills' | 'hobbies' | 'outside';

/** Display names, used on the filter pills. */
export const INTEREST_GROUPS: Record<InterestGroup, string> = {
  skills: 'Skills / Tools',
  hobbies: 'Hobbies / Interests',
  outside: 'Outside Work',
};

export interface InterestWord {
  label: string;
  group: InterestGroup;
}

export const INTEREST_WORDS: InterestWord[] = [
  // Languages
  { label: 'TypeScript', group: 'skills' },
  { label: 'JavaScript', group: 'skills' },
  { label: 'Python', group: 'skills' },
  { label: 'PHP', group: 'skills' },
  { label: 'SQL', group: 'skills' },
  { label: 'C#', group: 'skills' },
  { label: 'HTML', group: 'skills' },
  { label: 'CSS', group: 'skills' },

  // Databases
  { label: 'PostgreSQL', group: 'skills' },
  { label: 'MySQL', group: 'skills' },
  { label: 'MongoDB', group: 'skills' },

  // Frameworks & libraries
  { label: 'React', group: 'skills' },
  { label: 'React Native', group: 'skills' },
  { label: 'Next.js', group: 'skills' },
  { label: 'Node.js', group: 'skills' },
  { label: 'NestJS', group: 'skills' },
  { label: 'Express', group: 'skills' },
  { label: 'Laravel', group: 'skills' },
  { label: 'Flask', group: 'skills' },
  { label: 'TailwindCSS', group: 'skills' },
  { label: 'MaterialUI', group: 'skills' },

  // AI
  { label: 'LLMs', group: 'skills' },
  { label: 'AI Agents', group: 'skills' },
  { label: 'Guardrails', group: 'skills' },
  { label: 'Agentic Coding', group: 'skills' },

  // Build, test & infrastructure
  { label: 'NX', group: 'skills' },
  { label: 'Vite', group: 'skills' },
  { label: 'Webpack', group: 'skills' },
  { label: 'ESLint', group: 'skills' },
  { label: 'Jest', group: 'skills' },
  { label: 'Playwright', group: 'skills' },
  { label: 'Docker', group: 'skills' },
  { label: 'GCP', group: 'skills' },
  { label: 'CI/CD', group: 'skills' },

  // Hobbies — from v1's About window, and Peaksy corroborates the hiking
  { label: 'Hiking', group: 'hobbies' },
  { label: 'Photography', group: 'hobbies' },
  { label: 'Art', group: 'hobbies' },
];
