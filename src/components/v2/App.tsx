import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import AsciiField from './AsciiField';
import Hero from './Hero';
import About from './About';
import Interests from './Interests';
import { markFade, markGlitch } from './motion';

type View = 'hero' | 'about' | 'interests';

export default function AppV2() {
  const [view, setView] = useState<View>('hero');
  const reduceMotion = useReducedMotion();

  const handleTrigger = useCallback((name: string) => {
    if (name === 'about') setView('about');
    if (name === 'interests') setView('interests');
  }, []);

  // Escape is the way back for now — the panel has no chrome of its own.
  useEffect(() => {
    if (view === 'hero') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setView('hero');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view]);

  return (
    <main className="viewport">
      <AsciiField />
      {/* The mark, and the way home. Only on the panels — on the hero it
          would be pointing at the page you are already on. Its own
          AnimatePresence, so it can tear out instead of just vanishing. */}
      <AnimatePresence>
        {view !== 'hero' && (
          <motion.button
            key="home"
            type="button"
            className="home glitch"
            aria-label="Home"
            onClick={() => setView('hero')}
            variants={reduceMotion ? markFade : markGlitch}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            E
          </motion.button>
        )}
      </AnimatePresence>
      {/* wait, so the outgoing group finishes scattering before the next spreads in */}
      <AnimatePresence mode="wait">
        {view === 'hero' && <Hero key="hero" onTrigger={handleTrigger} />}
        {view === 'about' && <About key="about" />}
        {view === 'interests' && <Interests key="interests" />}
      </AnimatePresence>
    </main>
  )
}
