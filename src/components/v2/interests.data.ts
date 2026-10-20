/**
 * Keywords pulled from Ems's CV, each tagged with a group.
 *
 * The group is carried so it can drive something later — colour per group on
 * the globe, filtering, or a legend. Nothing reads it yet beyond `data-group`
 * on each word.
 *
 * `tooling` deliberately covers the whole technical stack rather than
 * splitting languages from frameworks from databases: on a word cloud that
 * distinction is not one anyone reads, and it left most groups too small to
 * colour meaningfully.
 */

export type InterestGroup = 'tooling' | 'testing' | 'interest';

/** Display names, for a legend or filter UI. */
export const INTEREST_GROUPS: Record<InterestGroup, string> = {
  tooling: 'Stack & tooling',
  testing: 'Testing',
  interest: 'Outside work',
};

export interface InterestWord {
  label: string;
  group: InterestGroup;
}

export const INTEREST_WORDS: InterestWord[] = [
  // Languages
  { label: 'TypeScript', group: 'tooling' },
  { label: 'JavaScript', group: 'tooling' },
  { label: 'Python', group: 'tooling' },
  { label: 'PHP', group: 'tooling' },
  { label: 'SQL', group: 'tooling' },
  { label: 'C#', group: 'tooling' },
  { label: 'HTML', group: 'tooling' },
  { label: 'CSS', group: 'tooling' },

  // Databases
  { label: 'PostgreSQL', group: 'tooling' },
  { label: 'MySQL', group: 'tooling' },
  { label: 'MongoDB', group: 'tooling' },

  // Frameworks & libraries
  { label: 'React', group: 'tooling' },
  { label: 'React Native', group: 'tooling' },
  { label: 'Next.js', group: 'tooling' },
  { label: 'Node.js', group: 'tooling' },
  { label: 'NestJS', group: 'tooling' },
  { label: 'Express', group: 'tooling' },
  { label: 'Laravel', group: 'tooling' },
  { label: 'Flask', group: 'tooling' },
  { label: 'TailwindCSS', group: 'tooling' },
  { label: 'MaterialUI', group: 'tooling' },

  // AI
  { label: 'LLMs', group: 'tooling' },
  { label: 'AI Agents', group: 'tooling' },
  { label: 'Guardrails', group: 'tooling' },
  { label: 'Agentic Coding', group: 'tooling' },

  // Build & infrastructure
  { label: 'NX', group: 'tooling' },
  { label: 'Vite', group: 'tooling' },
  { label: 'Webpack', group: 'tooling' },
  { label: 'ESLint', group: 'tooling' },
  { label: 'Docker', group: 'tooling' },
  { label: 'GCP', group: 'tooling' },
  { label: 'CI/CD', group: 'tooling' },

  // Testing — its own group so it does not vanish into the stack
  { label: 'Jest', group: 'testing' },
  { label: 'Playwright', group: 'testing' },

  // Outside work — from v1's About window, and Peaksy corroborates the hiking
  { label: 'Hiking', group: 'interest' },
  { label: 'Photography', group: 'interest' },
  { label: 'Art', group: 'interest' },
];
