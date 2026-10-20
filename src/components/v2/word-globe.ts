/**
 * Scatters words over the surface of a sphere, spins it slowly, and lets you
 * drag it around the way a globe in a map app behaves.
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

/** Sphere radius as a share of the viewport height. */
const RADIUS_RATIO = 0.34;
/** And of its width — see the note in measure(). */
const WIDTH_RATIO = 0.355;
/** Camera distance, in radii. Larger flattens the near/far size difference. */
const FOV_RATIO = 3.2;
/** Radians per second when left alone — a full turn takes about two minutes. */
const IDLE_SPIN = 0.055;
/** Starting lean, so the poles show and it does not read as a flat ring. */
const START_PITCH = 0.34;
/** Never quite reaches a pole, so the globe cannot be flipped upside down. */
const MAX_PITCH = 1.15;
/** Radians dragged per pixel, scaled by radius so the point under the cursor
 *  roughly keeps up with it whatever the globe's size. */
const DRAG_PER_RADIUS = 1.6;
/** How quickly a fling bleeds off, per second. */
const FRICTION = 3.4;
/** Below this the throw has effectively stopped. */
const REST_VELOCITY = 0.002;
/** Weight of the newest sample in the throw estimate. Averaging over several
 *  moves stops one jumpy sample — a fast flick, a coarse trackpad — reading as
 *  a much harder throw than the drag actually was. */
const THROW_SMOOTHING = 0.35;
/** Ceiling on a throw, radians per second, so it can never spin away. */
const MAX_THROW = 2.6;
/** The far side never fades past this, so the globe stays legible through. */
const MIN_OPACITY = 0.16;

interface Point {
  x: number;
  y: number;
  z: number;
}

function blendVelocity(current: number, sample: number): number {
  const blended = current * (1 - THROW_SMOOTHING) + sample * THROW_SMOOTHING;
  return Math.max(-MAX_THROW, Math.min(MAX_THROW, blended));
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
  private yaw = 0;
  private pitch = START_PITCH;
  /** Carried over from a drag, then bled off by friction. */
  private yawVelocity = 0;
  private pitchVelocity = 0;

  private dragging = false;
  private pointerId: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private lastMoveAt = 0;

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

    // Listens on the container so a grab starting on a word bubbles up too.
    this.container.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);

    this.measure();
    // With motion off it still renders, just held still until dragged.
    if (!this.reduceMotion) this.start();
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
    this.observer?.disconnect();
    this.observer = null;
    this.motionQuery?.removeEventListener('change', this.handleMotionChange);
    this.motionQuery = null;
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
  }

  private handleMotionChange = (event: MediaQueryListEvent): void => {
    this.reduceMotion = event.matches;
    if (this.reduceMotion && !this.dragging) this.stop();
    else this.start();
  };

  private handlePointerDown = (event: PointerEvent): void => {
    if (this.pointerId !== null) return;
    this.pointerId = event.pointerId;
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.lastMoveAt = performance.now();
    // A grab takes over from whatever the throw was doing.
    this.yawVelocity = 0;
    this.pitchVelocity = 0;
    this.container.dataset.dragging = 'true';
    this.start();
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.dragging || event.pointerId !== this.pointerId) return;

    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    const perPixel = this.radius ? DRAG_PER_RADIUS / this.radius : 0;
    const dYaw = dx * perPixel;
    const dPitch = -dy * perPixel;

    this.yaw += dYaw;
    this.setPitch(this.pitch + dPitch);

    // Running average of recent steps, so letting go mid-sweep throws it on.
    const now = performance.now();
    const elapsed = Math.max(0.008, (now - this.lastMoveAt) / 1000);
    this.lastMoveAt = now;
    this.yawVelocity = blendVelocity(this.yawVelocity, dYaw / elapsed);
    this.pitchVelocity = blendVelocity(this.pitchVelocity, dPitch / elapsed);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = null;
    delete this.container.dataset.dragging;

    // A throw that ended on a pause should not fling.
    if (performance.now() - this.lastMoveAt > 90) {
      this.yawVelocity = 0;
      this.pitchVelocity = 0;
    }
  };

  /** Clamped short of the poles, and stops the throw dead at the limit. */
  private setPitch(value: number): void {
    const clamped = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, value));
    if (clamped !== value) this.pitchVelocity = 0;
    this.pitch = clamped;
  }

  private measure = (): void => {
    const rect = this.container.getBoundingClientRect();
    // Width gets its own, tighter share: a word sticks out past the sphere by
    // half its own length, so on a narrow screen the longest label, not the
    // height, is what decides how big the sphere can be.
    this.radius = Math.min(rect.width * WIDTH_RATIO, rect.height * RADIUS_RATIO);
    this.container.style.setProperty('--globe-size', `${this.radius * 2}px`);
    this.render();
  };

  private render(): void {
    const { radius } = this;
    if (!radius) return;

    const fov = radius * FOV_RATIO;
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);

    for (let i = 0; i < this.words.length; i++) {
      const point = this.points[i];

      // Spin about the vertical axis, then lean the whole thing towards us.
      const x = point.x * cosYaw + point.z * sinYaw;
      const spun = point.z * cosYaw - point.x * sinYaw;
      const y = point.y * cosPitch - spun * sinPitch;
      const z = point.y * sinPitch + spun * cosPitch;

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
      // the middle of the sphere. While dragging nothing is, or the cursor
      // snags on words as they pass under it.
      word.style.pointerEvents = z > 0 && !this.dragging ? 'auto' : 'none';
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

    const thrown =
      Math.abs(this.yawVelocity) > REST_VELOCITY ||
      Math.abs(this.pitchVelocity) > REST_VELOCITY;

    if (!this.dragging) {
      if (!this.reduceMotion) this.yaw += IDLE_SPIN * elapsed;
      if (thrown) {
        this.yaw += this.yawVelocity * elapsed;
        this.setPitch(this.pitch + this.pitchVelocity * elapsed);
        const decay = Math.exp(-FRICTION * elapsed);
        this.yawVelocity *= decay;
        this.pitchVelocity *= decay;
      } else {
        this.yawVelocity = 0;
        this.pitchVelocity = 0;
      }
    }

    this.render();

    // With motion off there is nothing to animate once the throw settles.
    if (this.reduceMotion && !this.dragging && !thrown) {
      this.stop();
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  };
}
