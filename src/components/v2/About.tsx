import { motion } from 'framer-motion';
import ContributionCalendarGrid from './ContributionCalendar';
import { spreadGroup, spreadItem } from './motion';
import LinkedInIcon from '../../assets/linkedin.svg?react';
import EmailIcon from '../../assets/email.svg?react';
import GitHubIcon from '../../assets/github.svg?react';

const DISCIPLINES = [
  'Full-stack Applications',
  'Creative Coding',
  'Game Development',
  'Automated Testing',
];

const LINKS = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/ems-oriel',
    Icon: LinkedInIcon,
  },
  { name: 'Email', href: 'mailto:ems@symph.co', Icon: EmailIcon },
  { name: 'GitHub', href: 'https://github.com/egoshift', Icon: GitHubIcon },
];

export default function About() {
  return (
    <motion.div
      className="about"
      variants={spreadGroup}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <motion.div className="about__calendar" variants={spreadItem} custom={{ y: -1 }}>
        <ContributionCalendarGrid />
      </motion.div>

      <motion.p className="about__lead" variants={spreadItem} custom={{ y: -0.45 }}>
        My software development experience encompasses these&hellip;
      </motion.p>

      <ul className="about__disciplines">
        {DISCIPLINES.map((discipline, i) => (
          <motion.li
            key={discipline}
            variants={spreadItem}
            // Fan out from the middle of the row.
            custom={{ x: i - (DISCIPLINES.length - 1) / 2 }}
          >
            {discipline}
          </motion.li>
        ))}
      </ul>

      <ul className="about__links">
        {LINKS.map(({ name, href, Icon }, i) => (
          <motion.li
            key={name}
            variants={spreadItem}
            custom={{ x: (i - (LINKS.length - 1) / 2) * 1.4, y: 0.3 }}
          >
            <a
              className="about__link"
              href={href}
              aria-label={name}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
            >
              <Icon aria-hidden="true" focusable="false" />
            </a>
          </motion.li>
        ))}
      </ul>

      <motion.p className="about__bio" variants={spreadItem} custom={{ y: 1 }}>
        I am a Full-stack Developer based in{' '}
        <span className="about__accent">Cebu, Philippines</span> who loves to work{' '}
        <span className="about__accent">whimsically</span>!
      </motion.p>
    </motion.div>
  );
}
