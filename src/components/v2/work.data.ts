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
  responsibilities: string[];
  projects: WorkProject[];
}

/** Newest first, which is the order the panel shows them in. */
export const WORK: WorkRole[] = [
  {
    id: 'symph',
    role: 'Senior Software Engineer',
    company: 'Symph',
    start: '2020-10-01',
    end: null,
    period: 'October 2020 — Present',
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

/** A dot on the line that is a year passing rather than a job starting. */
export interface YearTick {
  year: number;
  /** 0–1 along the line. */
  at: number;
}

const DAY = 86_400_000;

function days(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime() / DAY;
}

/** Earliest start, so the line begins where the first job does. */
const SPAN_START = Math.min(...WORK.map((role) => days(role.start)));

/**
 * Where a date sits along the line, 0 to 1.
 *
 * The end of the line is today rather than a fixed date, so the current job
 * keeps growing and nothing has to be edited when the year turns.
 */
export function position(iso: string | null): number {
  const end = Date.now() / DAY;
  const point = iso === null ? end : days(iso);
  const span = end - SPAN_START;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (point - SPAN_START) / span));
}

/** Every January between the first job and now, for the small dots. */
export function yearTicks(): YearTick[] {
  const firstYear = new Date(SPAN_START * DAY).getUTCFullYear() + 1;
  const thisYear = new Date().getUTCFullYear();
  const ticks: YearTick[] = [];
  for (let year = firstYear; year <= thisYear; year += 1) {
    ticks.push({ year, at: position(`${year}-01-01`) });
  }
  return ticks;
}
