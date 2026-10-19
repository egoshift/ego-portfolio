import { useEffect, useRef } from 'react';
import { AsciiRipples } from './ascii-ripples';

/** Mount point for the ripple field. All the work lives in ascii-ripples.ts. */
export default function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = new AsciiRipples(canvas);
    field.mount();
    return () => field.destroy();
  }, []);

  return <canvas ref={canvasRef} className="ascii-field" aria-hidden="true" />;
}
