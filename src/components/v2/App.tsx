import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AsciiField from './AsciiField';
import Hero from './Hero';
import About from './About';

type View = 'hero' | 'about';

export default function AppV2() {
  const [view, setView] = useState<View>('hero');

  const handleTrigger = useCallback((name: string) => {
    if (name === 'about') setView('about');
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
      {/* wait, so the outgoing group finishes scattering before the next spreads in */}
      <AnimatePresence mode="wait">
        {view === 'hero' ? (
          <Hero key="hero" onTrigger={handleTrigger} />
        ) : (
          <About key="about" />
        )}
      </AnimatePresence>
      {view !== 'hero' && (
        <button type="button" className="back" onClick={() => setView('hero')}>
          back
        </button>
      )}
    </main>
  )
}
