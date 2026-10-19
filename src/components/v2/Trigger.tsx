interface Props {
  /** Which trigger this is, so behaviour can be hung off it later. */
  name: string;
  className?: string;
  /** Plain text — the glitch layers re-render it through `content: attr()`. */
  children: string;
  onTrigger?: (name: string) => void;
}

/**
 * One of the coloured words in the hero. A real button rather than a styled
 * span, so it is keyboard reachable and announced as interactive from the
 * start — the behaviour is the only part still to come.
 */
export default function Trigger({ name, className, children, onTrigger }: Props) {
  return (
    <button
      type="button"
      className={className ? `trigger ${className}` : 'trigger'}
      data-trigger={name}
      data-text={children}
      onClick={() => onTrigger?.(name)}
    >
      {children}
    </button>
  );
}
