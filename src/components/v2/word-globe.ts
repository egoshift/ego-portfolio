/**
 * Scatters words over the surface of a sphere and spins it.
 *
 * Framework-free, like the ripple field — React renders the words, this moves
 * them. Each word stays an ordinary DOM element moved with a translate and a
 * scale, never rotated in 3D, so text on the far side reads forwards instead
 * of mirrored and stays as crisp as any other text on the page.
 *
 * The hollow look comes from depth alone: far words are smaller and fainter,
 * so you see through the front of the sphere to the back of it.
 */

/** Successive points land this far round, which is what stops them lining up
 *  into visible spirals or bunching at the poles. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Sphere radius as a share of the smaller viewport side. */
const RADIUS_RATIO = 0.34;
/** Camera distance, in radii. Larger flattens the near/far size difference. */
const FOV_RATIO = 3.2;
/** Radians per second. Slow enough to read a word before it leaves. */
const SPIN = 0.17;
/** Fixed lean, so the poles are visible and it does not read as a flat ring. */
const TILT = 0.34;
/** The far side never fades past this, so the globe stays legible through. */
const MIN_OPACITY = 0.16;

interface Point {
  x: number;
  y: number;
  z: number;
}

/** Evenly spaced points on a unit sphere. */
function fibonacciSphere(count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    // Walk the axis at a constant rate; the ring radius falls out of the
    // height, which is what keeps the spacing even rather than polar. Offset
    // by half a step so nothing lands exactly on a pole — a word there sits on
    // the spin axis and would never move.
    const y = 1 - ((i + 0.5) / count) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GOLDEN_ANGLE;
    points.push({ x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring });
  }
  return points;
}

export class WordGlobe {
  private readonly container: HTMLElement;
  private words: HTMLElement[] = [];
  private points: Point[] = [];

  private radius = 0;
  private angle = 0;
  private last = 0;
  private frame = 0;
  private running = false;
  private destroyed = false;

  private reduceMotion = false;
  private motionQuery: MediaQueryList | null = null;
  private observer: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount(): void {
    this.words = [...this.container.querySelectorAll<HTMLElement>('[data-globe-word]')];
    this.points = fibonacciSphere(this.words.length);

    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduceMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener('change', this.handleMotionChange);

    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this.container);

    this.measure();
    // Held still rather than hidden, so the words are all still readable.
    if (!this.reduceMotion) this.start();
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
    this.observer?.disconnect();
    this.observer = null;
    this.motionQuery?.removeEventListener('change', this.handleMotionChange);
    this.motionQuery = null;
  }

  private handleMotionChange = (event: MediaQueryListEvent): void => {
    this.reduceMotion = event.matches;
    if (this.reduceMotion) this.stop();
    else this.start();
  };

  private measure = (): void => {
    const rect = this.container.getBoundingClientRect();
    this.radius = Math.min(rect.width, rect.height) * RADIUS_RATIO;
    this.render();
  };

  private render(): void {
    const { radius } = this;
    if (!radius) return;

    const fov = radius * FOV_RATIO;
    const cosSpin = Math.cos(this.angle);
    const sinSpin = Math.sin(this.angle);
    const cosTilt = Math.cos(TILT);
    const sinTilt = Math.sin(TILT);

    for (let i = 0; i < this.words.length; i++) {
      const point = this.points[i];

      // Spin about the vertical axis, then lean the whole thing towards us.
      const x = point.x * cosSpin + point.z * sinSpin;
      const spun = point.z * cosSpin - point.x * sinSpin;
      const y = point.y * cosTilt - spun * sinTilt;
      const z = point.y * sinTilt + spun * cosTilt;

      const perspective = fov / (fov - z * radius);
      const depth = (z + 1) / 2; // 0 at the back, 1 at the front

      const word = this.words[i];
      // The element sits at the container's centre, so the offset moves it out
      // and the -50% recentres it on its own box whatever the word's width.
      word.style.transform =
        `translate3d(${(x * radius * perspective).toFixed(1)}px, ` +
        `${(y * radius * perspective).toFixed(1)}px, 0) ` +
        `translate(-50%, -50%) scale(${perspective.toFixed(3)})`;
      word.style.opacity = (MIN_OPACITY + (1 - MIN_OPACITY) * depth).toFixed(3);
      word.style.zIndex = `${Math.round(depth * 1000)}`;
      // Only the near face is hoverable, so you cannot catch a word through
      // the middle of the sphere.
      word.style.pointerEvents = z > 0 ? 'auto' : 'none';
    }
  }

  private start(): void {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (now: number): void => {
    if (this.destroyed) return;
    // Clamped so a backgrounded tab does not resume with a huge jump.
    const elapsed = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.angle += SPIN * elapsed;
    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };
}
