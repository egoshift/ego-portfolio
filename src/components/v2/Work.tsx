import { useState } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WORK, position, yearTicks } from './work.data';

const TICKS = yearTicks();

export default function Work() {
  // Newest job first, which is the one worth landing on.
  const [activeId, setActiveId] = useState(WORK[0].id);
  const active = WORK.find((role) => role.id === activeId) ?? WORK[0];

  return (
    <motion.div
      className="work"
      variants={spreadGroup}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <motion.div
        className="work__track"
        variants={spreadItem}
        custom={{ y: -1 }}
      >
        {/* The line runs from the first job to today, so the current one keeps
            growing on its own. The small dots are years going by and are not
            interactive; a big one is where a job ended, which for the current
            one is the end of the line. */}
        <div className="timeline">
          <span className="timeline__line" aria-hidden="true" />
          {TICKS.map((tick) => (
            <span
              key={tick.year}
              className="timeline__tick"
              style={{ left: `${tick.at * 100}%` }}
              aria-hidden="true"
            />
          ))}
          {WORK.map((role) => (
            <button
              key={role.id}
              type="button"
              className="timeline__node"
              style={{ left: `${position(role.end) * 100}%` }}
              data-active={role.id === active.id ? '' : undefined}
              aria-pressed={role.id === active.id}
              onClick={() => setActiveId(role.id)}
            >
              <span className="timeline__node-label">
                {role.role}, {role.company}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Keyed on the job, so switching remounts it and the CSS fade replays. */}
      <motion.div
        className="work__body"
        variants={spreadItem}
        custom={{ y: -0.3 }}
      >
        <div key={active.id} className="work__swap">
          <header className="work__heading">
            <h2 className="work__role">{active.role}</h2>
            <p className="work__company">{active.company}</p>
            <p className="work__period">{active.period}</p>
          </header>

          <div className="work__columns">
            <section className="work__column work__column--duties">
              <h3 className="work__label">Roles and responsibilities</h3>
              <ul className="work__duties">
                {active.responsibilities.map((duty) => (
                  <li key={duty}>{duty}</li>
                ))}
              </ul>
            </section>

            <section className="work__column work__column--projects">
              <h3 className="work__label">Notable projects</h3>
              <ul className="work__projects">
                {active.projects.map((project) => (
                  <li key={project.title}>
                    <span className="work__project-title">{project.title}</span>
                    <span className="work__project-detail">{project.detail}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
