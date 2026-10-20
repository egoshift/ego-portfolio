import { Fragment } from 'react';

interface Props {
  /** Plain text — the split layers re-render it through `content: attr()`. */
  children: string;
  className?: string;
}

/**
 * Text carrying a held RGB split — the same chromatic break as the hero
 * triggers, but still rather than animated.
 *
 * Each word gets its own box. The layers are absolutely positioned, and an
 * inline element that wraps across lines would scatter them, so the words are
 * inline-blocks with the spaces left between them to break on.
 */
export default function GlitchText({ children, className }: Props) {
  const words = children.split(' ');

  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && ' '}
          <span className={className ? `glitch ${className}` : 'glitch'} data-text={word}>
            {word}
          </span>
        </Fragment>
      ))}
    </>
  );
}
