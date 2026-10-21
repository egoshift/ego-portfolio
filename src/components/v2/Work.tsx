import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WORK, timelineYears } from './work.data';

const YEARS = timelineYears();

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
      {/* Keyed on the job, here and on the columns, so switching remounts
          both and the CSS fade replays. */}
      <motion.header
        className="work__heading"
        variants={spreadItem}
        custom={{ y: -1 }}
      >
        <div key={active.id} className="work__swap">
          <h2 className="work__role">{active.role}</h2>
          <p className="work__company">{active.company}</p>
        </div>
      </motion.header>

      <motion.div
        className="work__track"
        variants={spreadItem}
        custom={{ y: -0.7 }}
      >
        {/* Every circle is a year, from the first job to this one. A year a
            job ended in is drawn big and is the only kind you can click; the
            rest are just the years going by. */}
        <div className="timeline">
          <span className="timeline__line" aria-hidden="true" />
          {YEARS.map(({ year, at, roleId }) => {
            const role = roleId
              ? WORK.find((entry) => entry.id === roleId)
              : undefined;
            const left = `${at * 100}%`;

            return (
              <Fragment key={year}>
                {role ? (
                  <button
                    type="button"
                    className="timeline__node"
                    style={{ left }}
                    data-active={role.id === active.id ? '' : undefined}
                    aria-pressed={role.id === active.id}
                    onClick={() => setActiveId(role.id)}
                  >
                    <span className="timeline__node-label">
                      {year}: {role.role}, {role.company}
                    </span>
                  </button>
                ) : (
                  <span
                    className="timeline__tick"
                    style={{ left }}
                    aria-hidden="true"
                  />
                )}
                <span className="timeline__year" style={{ left }}>
                  {year}
                </span>
              </Fragment>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="work__body"
        variants={spreadItem}
        custom={{ y: -0.3 }}
      >
        <div key={active.id} className="work__swap work__columns">
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
      </motion.div>
    </motion.div>
  );
}
