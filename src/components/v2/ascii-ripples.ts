/**
 * A full-viewport field of random ASCII that ripples outward from a pointer tap.
 *
 * Framework-free on purpose — the React component is just a mount point.
 *
 * Drawing is split in two so a frame stays cheap. The dim idle field lives on an
 * offscreen layer that only changes when a cell shimmers, so a frame is one blit
 * of that layer plus the handful of cells a ripple is currently lighting. Glyphs
 * come from an atlas holding one tile per glyph per brightness step, which makes
 * drawing a cell a `drawImage` with no canvas state changes in between.
 */

type RGB = [number, number, number];

/** The idle backdrop picks from these. */
const FIELD_GLYPHS = '01<>[]{}()/\\|-_=+*^~:;.,!?$#%&';
/** Sparse to dense. A ripple crest walks up this ramp. */
const RAMP = '.:-=+*#%@';
const GLYPHS = [...new Set([...FIELD_GLYPHS, ...RAMP])].join('');
const RAMP_INDEX = [...RAMP].map((glyph) => GLYPHS.indexOf(glyph));

const FONT_STACK = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const FONT_SIZE = 14;
const LINE_HEIGHT = 1.45;

/** Brightness steps baked into the atlas. Step 0 is the idle field. */
const LEVELS = 8;
const COLOR_IDLE: RGB = [62, 64, 72];
const COLOR_CREST: RGB = [255, 238, 216];

/** Share of cells showing an idle glyph. The rest stay dark until a ripple hits. */
const FIELD_DENSITY = 0.34;
/** Cells re-rolled each shimmer, so the field never looks frozen. */
const SHIMMER_PER_TICK = 18;
/** Gap between shimmers. Decoupled from the frame rate so the field drifts at
 *  the same pace on a 60Hz and a 120Hz screen. */
const SHIMMER_INTERVAL = 55; // ms

const RIPPLE_SPEED = 620; // px per second
/** A ripple outlives the trip to its furthest corner by this much, so the wave
 *  always makes it across whatever the viewport size, then fades just after. */
const RIPPLE_TAIL = 1.35;
/** Holds full brightness for most of that trip, then falls off over the tail. */
const RIPPLE_FADE = 2.2;
const RIPPLE_BAND = 64; // px — width of the gaussian envelope
const RIPPLE_WAVELENGTH = 0.085; // radians per px — gives the trailing rings
const MAX_RIPPLES = 12;
/** Below this a cell is left to the idle layer. */
const ENERGY_FLOOR = 0.06;

interface Ripple {
  x: number;
  y: number;
  born: number;
  /** Distance to the furthest corner — how far this one has to travel. */
  reach: number;
}

function levelColor(level: number): string {
  const t = LEVELS > 1 ? level / (LEVELS - 1) : 1;
  const [r, g, b] = COLOR_IDLE.map((from, i) =>
    Math.round(from + (COLOR_CREST[i] - from) * t)
  );
  return `rgb(${r}, ${g}, ${b})`;
}

export class AsciiRipples {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly atlas = document.createElement('canvas');
  private readonly atlasCtx: CanvasRenderingContext2D;
  private readonly idle = document.createElement('canvas');
  private readonly idleCtx: CanvasRenderingContext2D;

  private cols = 0;
  private rows = 0;
  private cellW = 0;
  private cellH = 0;
  private tileW = 0;
  private tileH = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  /** Glyph index per cell. Every cell has one, even while the idle layer hides it. */
  private glyph = new Uint8Array(0);
  /** Whether the idle layer shows this cell's glyph. */
  private shown = new Uint8Array(0);
  private energy = new Float32Array(0);

  private ripples: Ripple[] = [];
  private frame = 0;
  private running = false;
  private destroyed = false;
  private lastShimmer = 0;
  /** Whether `energy` still holds a ring that needs clearing off the canvas. */
  private energyDirty = false;
  /** Honour the OS setting by dropping the ambient shimmer. Taps still ripple,
   *  since those are asked for rather than autoplaying. */
  private reduceMotion = false;
  private motionQuery: MediaQueryList | null = null;
  private observer: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    const atlasCtx = this.atlas.getContext('2d');
    const idleCtx = this.idle.getContext('2d', { alpha: false });
    if (!ctx || !atlasCtx || !idleCtx) {
      throw new Error('AsciiRipples: 2d canvas context unavailable');
    }
    this.ctx = ctx;
    this.atlasCtx = atlasCtx;
    this.idleCtx = idleCtx;
  }

  mount(): void {
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduceMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener('change', this.handleMotionChange);

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.canvas);

    this.canvas.addEventListener('pointerdown', this.handlePointerDown);

    this.resize();
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
    this.observer?.disconnect();
    this.observer = null;
    this.motionQuery?.removeEventListener('change', this.handleMotionChange);
    this.motionQuery = null;
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
  }

  /** Start a ripple at a point in CSS pixels relative to the canvas. */
  ripple(x: number, y: number): void {
    if (this.ripples.length >= MAX_RIPPLES) this.ripples.shift();
    this.ripples.push({ x, y, born: performance.now(), reach: this.diagonalFrom(x, y) });
    this.start();
  }

  private handleMotionChange = (event: MediaQueryListEvent): void => {
    this.reduceMotion = event.matches;
    if (this.reduceMotion) {
      this.ripples = [];
      this.stop();
      this.present();
    } else {
      this.start();
    }
  };

  private handlePointerDown = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.ripple(event.clientX - rect.left, event.clientY - rect.top);
  };

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    // Capping keeps 3x phone screens from paying for tiles nobody can see.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (width === this.width && height === this.height && dpr === this.dpr) return;

    this.width = width;
    this.height = height;
    this.dpr = dpr;

    this.buildAtlas();

    this.cols = Math.max(1, Math.ceil(width / this.cellW));
    this.rows = Math.max(1, Math.ceil(height / this.cellH));
    const cells = this.cols * this.rows;

    this.glyph = new Uint8Array(cells);
    this.shown = new Uint8Array(cells);
    this.energy = new Float32Array(cells);
    for (let i = 0; i < cells; i++) {
      this.glyph[i] = (Math.random() * GLYPHS.length) | 0;
      this.shown[i] = Math.random() < FIELD_DENSITY ? 1 : 0;
    }

    for (const target of [this.canvas, this.idle]) {
      target.width = Math.round(width * dpr);
      target.height = Math.round(height * dpr);
    }
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.idleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.renderIdleLayer();
    this.present();
    // The shimmer should be running before anyone clicks; with motion off there
    // is nothing to animate until a tap comes in.
    if (!this.reduceMotion || this.ripples.length) this.start();
  }

  /** One tile per glyph per brightness step, rendered at device resolution. */
  private buildAtlas(): void {
    const { atlasCtx, dpr } = this;
    const probeFont = `${FONT_SIZE * dpr}px ${FONT_STACK}`;
    atlasCtx.font = probeFont;
    const advance = atlasCtx.measureText('M').width;

    this.cellW = Math.max(1, advance / dpr);
    this.cellH = Math.max(1, Math.round(FONT_SIZE * LINE_HEIGHT));
    this.tileW = Math.max(1, Math.ceil(this.cellW * dpr));
    this.tileH = Math.max(1, Math.ceil(this.cellH * dpr));

    this.atlas.width = this.tileW * GLYPHS.length;
    this.atlas.height = this.tileH * LEVELS;

    // Resizing the canvas cleared the context state, so set it up again.
    atlasCtx.font = probeFont;
    atlasCtx.textAlign = 'center';
    atlasCtx.textBaseline = 'middle';
    for (let level = 0; level < LEVELS; level++) {
      atlasCtx.fillStyle = levelColor(level);
      const y = level * this.tileH + this.tileH / 2;
      for (let g = 0; g < GLYPHS.length; g++) {
        atlasCtx.fillText(GLYPHS[g], g * this.tileW + this.tileW / 2, y);
      }
    }
  }

  private blit(
    ctx: CanvasRenderingContext2D,
    glyph: number,
    level: number,
    x: number,
    y: number
  ): void {
    ctx.drawImage(
      this.atlas,
      glyph * this.tileW,
      level * this.tileH,
      this.tileW,
      this.tileH,
      x,
      y,
      this.cellW,
      this.cellH
    );
  }

  private renderIdleLayer(): void {
    const { idleCtx } = this;
    idleCtx.fillStyle = '#000';
    idleCtx.fillRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.shown.length; i++) {
      if (!this.shown[i]) continue;
      const col = i % this.cols;
      const row = (i / this.cols) | 0;
      this.blit(idleCtx, this.glyph[i], 0, col * this.cellW, row * this.cellH);
    }
  }

  /** Re-roll a few cells and patch just those tiles on the idle layer. */
  private shimmer(now: number): boolean {
    const cells = this.glyph.length;
    if (!cells || now - this.lastShimmer < SHIMMER_INTERVAL) return false;
    this.lastShimmer = now;
    for (let n = 0; n < SHIMMER_PER_TICK; n++) {
      const i = (Math.random() * cells) | 0;
      this.glyph[i] = (Math.random() * GLYPHS.length) | 0;
      this.shown[i] = Math.random() < FIELD_DENSITY ? 1 : 0;
      const x = (i % this.cols) * this.cellW;
      const y = ((i / this.cols) | 0) * this.cellH;
      this.idleCtx.fillStyle = '#000';
      this.idleCtx.fillRect(x, y, this.cellW, this.cellH);
      if (this.shown[i]) this.blit(this.idleCtx, this.glyph[i], 0, x, y);
    }
    return true;
  }

  /** Returns whether the canvas needs repainting. */
  private computeEnergy(now: number): boolean {
    if (this.ripples.length === 0) {
      if (!this.energyDirty) return false;
      // One last repaint to wipe the ring the final ripple left behind.
      this.energy.fill(0);
      this.energyDirty = false;
      return true;
    }

    this.energy.fill(0);
    this.energyDirty = true;
    const reachPad = RIPPLE_BAND * 2;
    let alive = false;

    for (let r = this.ripples.length - 1; r >= 0; r--) {
      const ripple = this.ripples[r];
      const age = (now - ripple.born) / 1000;
      const span = (ripple.reach / RIPPLE_SPEED) * RIPPLE_TAIL;
      const life = 1 - age / span;
      const radius = age * RIPPLE_SPEED;
      if (life <= 0) {
        this.ripples.splice(r, 1);
        continue;
      }
      alive = true;

      const amp = Math.min(1, life * RIPPLE_FADE);
      const reach = radius + reachPad;
      const c0 = Math.max(0, Math.floor((ripple.x - reach) / this.cellW));
      const c1 = Math.min(this.cols - 1, Math.ceil((ripple.x + reach) / this.cellW));
      const r0 = Math.max(0, Math.floor((ripple.y - reach) / this.cellH));
      const r1 = Math.min(this.rows - 1, Math.ceil((ripple.y + reach) / this.cellH));

      for (let row = r0; row <= r1; row++) {
        const dy = (row + 0.5) * this.cellH - ripple.y;
        const base = row * this.cols;
        for (let col = c0; col <= c1; col++) {
          const dx = (col + 0.5) * this.cellW - ripple.x;
          const delta = Math.sqrt(dx * dx + dy * dy) - radius;
          if (delta < -reachPad || delta > reachPad) continue;
          const envelope = Math.exp(-(delta * delta) / (RIPPLE_BAND * RIPPLE_BAND));
          const wave = Math.cos(delta * RIPPLE_WAVELENGTH);
          this.energy[base + col] += Math.abs(envelope * wave) * amp;
        }
      }
    }
    return alive || this.energyDirty;
  }

  /** Distance to the furthest corner — how far a ripple here has to travel to
   *  clear the screen. Floored so a tap before the first layout can't divide by zero. */
  private diagonalFrom(x: number, y: number): number {
    const dx = Math.max(x, this.width - x);
    const dy = Math.max(y, this.height - y);
    return Math.max(1, Math.sqrt(dx * dx + dy * dy));
  }

  /** Blit the idle layer, then overdraw the cells a ripple is lighting. */
  private present(): void {
    const { ctx } = this;
    ctx.drawImage(this.idle, 0, 0, this.width, this.height);

    ctx.fillStyle = '#000';
    for (let i = 0; i < this.energy.length; i++) {
      const e = this.energy[i];
      if (e <= ENERGY_FLOOR) continue;
      const t = Math.min(1, e);
      const x = (i % this.cols) * this.cellW;
      const y = ((i / this.cols) | 0) * this.cellH;
      // Faint cells just light up whatever ASCII was already there; the crest
      // swaps in the density ramp so the ring reads as a wave.
      const glyph =
        t > 0.25
          ? RAMP_INDEX[Math.min(RAMP_INDEX.length - 1, (t * RAMP_INDEX.length) | 0)]
          : this.glyph[i];
      const level = Math.max(1, Math.min(LEVELS - 1, Math.round(t * (LEVELS - 1))));
      ctx.fillRect(x, y, this.cellW, this.cellH);
      this.blit(ctx, glyph, level, x, y);
    }
  }

  private start(): void {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (now: number): void => {
    if (this.destroyed) return;

    const shimmered = this.reduceMotion ? false : this.shimmer(now);
    const rippling = this.computeEnergy(now);
    // Skip the repaint on frames where nothing actually changed.
    if (shimmered || rippling) this.present();

    // With motion off there is no shimmer to draw, so idle instead of burning
    // frames on a still image. The next tap restarts the loop.
    if (this.reduceMotion && !rippling) {
      this.stop();
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  };
}
