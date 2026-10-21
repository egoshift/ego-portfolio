/**
 * The experience behind the "Developer" trigger.
 *
 * v1 kept the same two jobs in `constants/experiences.constants.ts`, split
 * into duties and named projects — that split is kept here because it is what
 * the two columns are. The wording is not: v1 predates the current CV, so the
 * titles, figures and project list come from that instead.
 */

export interface WorkProject {
  title: string;
  detail: string;
}

export interface WorkRole {
  id: string;
  role: string;
  company: string;
  /** ISO day the job started — the timeline places its node by this. */
  start: string;
  /** ISO day it ended, or null while it is the current one. */
  end: string | null;
  /** How the period reads under the title. */
  period: string;
  /** What the job was built with, as keys into TECH below. */
  tech: string[];
  responsibilities: string[];
  projects: WorkProject[];
}

/** Newest first, which is the order the panel shows them in. */
export const WORK: WorkRole[] = [
  {
    id: 'symph',
    role: 'Full-stack Developer',
    company: 'Symph',
    start: '2020-10-01',
    end: null,
    period: 'October 2020 — Present',
    tech: [
      'ts',
      'react',
      'nextjs',
      'nestjs',
      'nx',
      'postgresql',
      'tailwindcss',
      'mui',
      'js',
      'html',
      'css',
    ],
    responsibilities: [
      'Architect and ship full-stack products end to end, from schema design and migrations through to deployment.',
      'Lead engineering and product direction on AI platforms — generation pipelines and the guardrails around them.',
      'Own monorepo tooling: NX, shared Webpack/Vite config, custom ESLint rules, and CI/CD for the team.',
      'Build across React, React Native and Node.js services on Google Cloud Platform.',
      'Review code and hold the standard across teams spread over three countries.',
      'Mentor interns and junior developers.',
    ],
    projects: [
      {
        title: 'HireAI',
        detail:
          'Custom LLM-powered AI employees. Led engineering and product; 11 businesses onboarded, 17+ agents deployed.',
      },
      {
        title: 'ESG Platform',
        detail:
          'Sole engineer and technical owner of an enterprise sustainability platform shipped for ~40 companies, with configurable inputs, reports and dashboards.',
      },
      {
        title: 'Delivery Platform',
        detail:
          'Led the migration of an inter-island delivery system off legacy Python/Flask onto React, React Native and Node. 50+ cities, ~1,000 orders a day.',
      },
      {
        title: 'Asset & Content Management',
        detail:
          'San Diego-based product used by Netflix and others. Moved legacy code onto a modern React and TypeScript stack.',
      },
      {
        title: 'Healthcare Digital-ID',
        detail:
          'Authentication and identity verification over sensitive personal data, across React web, React Native and backend microservices.',
      },
      {
        title: 'Lesson Planner PH',
        detail:
          'AI-powered lesson planning — the interface, and the LLM document generation pipeline behind it.',
      },
      {
        title: 'Peaksy',
        detail:
          'A React Native hiking app I lead front to back. Grew organically to 300+ users and 100+ bookings.',
      },
    ],
  },
  {
    id: 'true-north',
    role: 'Software Engineer',
    company: 'True North Group of Companies',
    start: '2018-06-01',
    end: '2020-09-30',
    period: 'June 2018 — September 2020',
    tech: [
      'php',
      'laravel',
      'code-igniter',
      'mysql',
      'jquery',
      'bootstrap',
      'js',
      'html',
      'css',
    ],
    responsibilities: [
      'Built shared-service platforms in PHP/Laravel and MySQL serving 4 companies and ~2,500 employees.',
      'Reviewed manual processes across departments to find what could be automated, then automated it.',
      'Delivered finance and HR systems as common services rather than one-offs per company.',
      'Set up and ran the company server.',
    ],
    projects: [
      {
        title: 'Finance Management System',
        detail:
          'Budgeting, financial statements and asset inventory, consolidated across every company in the group.',
      },
      {
        title: 'HRIS, Biometrics & Payroll',
        detail:
          'A large-scale HRIS with biometric attendance and workflow automation feeding payroll.',
      },
      {
        title: 'Live Tabulation',
        detail:
          'Real-time event scoring on WebSockets and NoSQL, run live at 3–5 sponsored competitions a year.',
      },
      {
        title: 'Enrollment System',
        detail:
          'Enrollment and balance monitoring with automated SMS reminders, for a school of ~7,000 students a year.',
      },
    ],
  },
];

export interface Tech {
  name: string;
  image: string;
}

/**
 * The logos, the same files the globe uses.
 *
 * Shown in full colour rather than tinted cyan like the globe's: that tint is
 * a CSS mask, and js, ts and bootstrap are fully opaque PNGs, so those three
 * would mask to solid blocks.
 */
const TECH: Record<string, Tech> = {
  html: { name: 'HTML', image: 'tech/html.png' },
  css: { name: 'CSS', image: 'tech/css.png' },
  js: { name: 'JavaScript', image: 'tech/js.png' },
  ts: { name: 'TypeScript', image: 'tech/ts.png' },
  react: { name: 'React', image: 'tech/react.png' },
  nextjs: { name: 'Next.js', image: 'tech/nextjs.png' },
  nestjs: { name: 'NestJS', image: 'tech/nestjs.png' },
  nx: { name: 'NX', image: 'tech/nx.png' },
  postgresql: { name: 'PostgreSQL', image: 'tech/postgresql.png' },
  tailwindcss: { name: 'TailwindCSS', image: 'tech/tailwindcss.png' },
  mui: { name: 'MaterialUI', image: 'tech/mui.png' },
  php: { name: 'PHP', image: 'tech/php.png' },
  laravel: { name: 'Laravel', image: 'tech/laravel.png' },
  'code-igniter': { name: 'CodeIgniter', image: 'tech/code-igniter.png' },
  jquery: { name: 'jQuery', image: 'tech/jquery.png' },
  bootstrap: { name: 'Bootstrap', image: 'tech/bootstrap.png' },
  mysql: { name: 'MySQL', image: 'tech/mysql.png' },
};

/** The logos for one job, in the order they are listed. */
export function techFor(role: WorkRole): Tech[] {
  return role.tech.flatMap((key) => TECH[key] ?? []);
}

/**
 * Every logo this panel can show.
 *
 * Loading pulls these in with the rest, so opening the panel costs no
 * requests — the same reason the globe's logos are captured up front.
 */
export const WORK_IMAGES: string[] = [
  ...new Set(WORK.flatMap((role) => role.tech)),
].flatMap((key) => TECH[key]?.image ?? []);

/** One circle on the line. Every circle is a year. */
export interface TimelineYear {
  year: number;
  /** 0–1 along the line. Years are evenly spaced, not scaled by duration. */
  at: number;
  /** Set when a job ended in this year, which is what makes it a big one. */
  roleId: string | null;
}

function yearOf(iso: string): number {
  return Number(iso.slice(0, 4));
}

/** The year a job finished — for the one still running, this year. */
function endYear(role: WorkRole, now: number): number {
  return role.end === null ? now : yearOf(role.end);
}

/**
 * The years a job covers, inclusive.
 *
 * Only these get a label on the line, so the labels read as the span of
 * whichever job is selected rather than a ruler under the whole thing.
 */
export function roleSpan(role: WorkRole): { from: number; to: number } {
  return {
    from: yearOf(role.start),
    to: endYear(role, new Date().getFullYear()),
  };
}

/**
 * The circles, one per year from the first job to now.
 *
 * A year a job ended in carries that job, and the panel draws those bigger
 * and makes them the only ones you can click. The current job ends at this
 * year, so its circle is the last on the line and moves along on its own as
 * the years pass.
 */
export function timelineYears(): TimelineYear[] {
  const now = new Date().getFullYear();
  const first = Math.min(...WORK.map((role) => yearOf(role.start)));
  const span = Math.max(1, now - first);

  const years: TimelineYear[] = [];
  for (let year = first; year <= now; year += 1) {
    years.push({
      year,
      at: (year - first) / span,
      roleId: WORK.find((role) => endYear(role, now) === year)?.id ?? null,
    });
  }
  return years;
}
