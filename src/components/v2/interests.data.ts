/**
 * Keywords pulled from Ems's CV, each tagged with a group.
 *
 * The group is carried so it can drive something later — colour per group on
 * the globe, filtering, or a legend. Nothing reads it yet beyond `data-group`
 * on each word.
 */

export type InterestGroup =
  | 'language'
  | 'database'
  | 'framework'
  | 'tooling'
  | 'ai'
  | 'practice'
  | 'product'
  | 'interest';

/** Display names, for a legend or filter UI. */
export const INTEREST_GROUPS: Record<InterestGroup, string> = {
  language: 'Languages',
  database: 'Databases',
  framework: 'Frameworks & libraries',
  tooling: 'Build, test & tooling',
  ai: 'AI',
  practice: 'Engineering practice',
  product: 'Shipped products',
  interest: 'Outside work',
};

export interface InterestWord {
  label: string;
  group: InterestGroup;
}

export const INTEREST_WORDS: InterestWord[] = [
  // Languages & databases
  { label: 'TypeScript', group: 'language' },
  { label: 'JavaScript', group: 'language' },
  { label: 'Python', group: 'language' },
  { label: 'PHP', group: 'language' },
  { label: 'SQL', group: 'language' },
  { label: 'C#', group: 'language' },
  { label: 'HTML', group: 'language' },
  { label: 'CSS', group: 'language' },
  { label: 'PostgreSQL', group: 'database' },
  { label: 'MySQL', group: 'database' },
  { label: 'MongoDB', group: 'database' },

  // Frameworks & libraries
  { label: 'React', group: 'framework' },
  { label: 'React Native', group: 'framework' },
  { label: 'Next.js', group: 'framework' },
  { label: 'Node.js', group: 'framework' },
  { label: 'NestJS', group: 'framework' },
  { label: 'Express', group: 'framework' },
  { label: 'Laravel', group: 'framework' },
  { label: 'Flask', group: 'framework' },
  { label: 'TailwindCSS', group: 'framework' },
  { label: 'MaterialUI', group: 'framework' },

  // Build, test & tooling
  { label: 'NX', group: 'tooling' },
  { label: 'Vite', group: 'tooling' },
  { label: 'Webpack', group: 'tooling' },
  { label: 'ESLint', group: 'tooling' },
  { label: 'Jest', group: 'tooling' },
  { label: 'Playwright', group: 'tooling' },
  { label: 'Docker', group: 'tooling' },
  { label: 'GCP', group: 'tooling' },
  { label: 'CI/CD', group: 'tooling' },

  // AI
  { label: 'LLMs', group: 'ai' },
  { label: 'AI Agents', group: 'ai' },
  { label: 'Guardrails', group: 'ai' },
  { label: 'Agentic Coding', group: 'ai' },

  // Engineering practice
  { label: 'Architecture', group: 'practice' },
  { label: 'Monorepos', group: 'practice' },
  { label: 'Microservices', group: 'practice' },
  { label: 'REST APIs', group: 'practice' },
  { label: 'WebSockets', group: 'practice' },
  { label: 'Schema Design', group: 'practice' },
  { label: 'Component Libraries', group: 'practice' },
  { label: 'Authentication', group: 'practice' },

  // Shipped products
  { label: 'HireAI', group: 'product' },
  { label: 'Lesson Planner PH', group: 'product' },
  { label: 'Peaksy', group: 'product' },
  { label: 'ESG Platform', group: 'product' },
  { label: 'Digital ID', group: 'product' },
  { label: 'Delivery Platform', group: 'product' },
  { label: 'HRIS', group: 'product' },
  { label: 'Live Tabulation', group: 'product' },

  // Outside work — from v1's About window, and Peaksy corroborates the hiking
  { label: 'Hiking', group: 'interest' },
  { label: 'Photography', group: 'interest' },
  { label: 'Art', group: 'interest' },
];
