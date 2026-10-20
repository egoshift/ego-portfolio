import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Blue text that splits into offset colour copies on hover. The split is a
 * `text-shadow`, so this is only here to carry the class and keep the markup
 * in About readable — no duplicated text, and it wraps like ordinary text.
 */
export default function GlitchText({ children, className }: Props) {
  return (
    <span className={className ? `glitch ${className}` : 'glitch'}>{children}</span>
  );
}
