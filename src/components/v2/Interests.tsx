import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { spreadGroup, spreadItem } from './motion';
import { WordGlobe } from './word-globe';

/**
 * Starter set, all drawn from what v1 already says about Ems rather than
 * invented: the stack from `constants/experiences.constants.ts`, and the four
 * sides the v1 About window switches between (💻 🏔️ 📷 🎨).
 */
const WORDS = [
  'Programming',
  'Hiking',
  'Photography',
  'Art',
  'React',
  'Typescript',
  'NestJS',
  'NextJS',
  'Nx',
  'PostgreSQL',
  'TailwindCSS',
  'MaterialUI',
  'Laravel',
  'PHP',
  'Code Igniter',
  'jQuery',
  'Bootstrap',
  'MySQL',
  'HTML',
  'CSS',
  'JS',
];

export default function Interests() {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = globeRef.current;
    if (!element) return;

    const globe = new WordGlobe(element);
    globe.mount();
    return () => globe.destroy();
  }, []);

  return (
    <motion.div
      className="interests"
      variants={spreadGroup}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {/* The spread moves this wrapper; the globe moves the words inside it,
          so the two never write to the same element's transform. */}
      <motion.div className="globe" variants={spreadItem} custom={{ y: 0.4 }}>
        <div className="globe__sphere" ref={globeRef}>
          {WORDS.map((word) => (
            <span className="globe__word glitch" data-globe-word key={word}>
              {word}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
