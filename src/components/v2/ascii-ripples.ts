/**
 * A full-viewport field of random ASCII that ripples outward from a pointer tap,
 * with the patch under the cursor reading clearer than the rest.
 *
 * Framework-free on purpose — the React component is just a mount point.
 *
 * Drawing is split in two so a frame stays cheap. The dim idle field lives on an
 * offscreen layer that only changes when a cell shimmers, so a frame is one blit
 * of that layer plus the cells the cursor halo and any ripples are lighting.
 * Glyphs come from an atlas holding one tile per glyph per palette step, which
 * makes drawing a cell a `drawImage` with no canvas state changes in between.
 */

type RGB = [number, number, number];

/** The idle backdrop picks from these. */
const FIELD_GLYPHS = "01<>[]{}()/\\|-_=+*^~:;.,!?$#%&";
/** Sparse to dense. A ripple crest walks up this ramp. */
const RAMP = ".:-=+*#%@";
const GLYPHS = [...new Set([...FIELD_GLYPHS, ...RAMP])].join("");
const RAMP_INDEX = [...RAMP].map((glyph) => GLYPHS.indexOf(glyph));

const FONT_STACK = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const FONT_SIZE = 14;
const LINE_HEIGHT = 1.45;

/** Steps in each palette ramp. More steps, smoother gradient. */
const LEVELS = 10;

/** The atlas stacks three ramps of LEVELS rows each; these pick the block. */
const BLOCK_FIELD = 0;
const BLOCK_RIPPLE = 1;
const BLOCK_ACCENT = 2;
const BLOCKS = 3;

/* ── Opacity ──────────────────────────────────────────────────────────────
 * MAX_OPACITY is the master knob. Every other opacity here is a fraction of
 * it, so changing this one number moves the whole field — idle, halo and
 * ripples together — and nothing can ever paint brighter than it.
 *
 * Opacity is baked into the atlas colours rather than set per draw: against a
 * black page the result is identical, and it keeps a cell down to one
 * `drawImage` with no canvas state changes.
 */

/** Ceiling for everything drawn, so foreground content stays readable on top. */
const MAX_OPACITY = 0.5;

/** Idle cells take a random opacity in this band. The spread is what gives the
 *  field its uneven, twinkling look instead of one flat wash. */
const IDLE_OPACITY_MIN = 0.1;
const IDLE_OPACITY_MAX = 0.4;

/** Opacity right under the cursor, where the ASCII should read clearest. */
const HALO_OPACITY = 1;

/** Opacity at a ripple's crest. */
const RIPPLE_OPACITY = 1;

/** The field itself — idle glyphs and the clearer patch under the cursor. */
const FIELD_COLOR: RGB = [206, 226, 236];

/** A scattering of cells inside the cursor halo take this instead of the field
 *  colour, so the glow has flecks of colour in it rather than reading as one
 *  flat wash. They only show under the halo — at idle they look like any other
 *  cell, so the colour appears as the cursor sweeps over them. */
const ACCENT_COLOR: RGB = [0, 230, 255]; // #00E6FF
/** Share of cells that are accent cells. Keep it low — it should read as a few
 *  flecks, not a second field. */
const ACCENT_CHANCE = 0.06;

/** A ripple runs along this gradient, anchored on #00E6FF. */
const RIPPLE_GRADIENT: RGB[] = [
  [0, 86, 150], // deep blue — the faint leading edge
  [0, 230, 255], // #00E6FF
  [212, 251, 255], // pale cyan at the crest
];

/** Share of cells showing an idle glyph. The rest stay dark until something hits. */
const FIELD_DENSITY = 0.34;
/** Cells re-rolled each shimmer, so the field never looks frozen. */
const SHIMMER_PER_TICK = 18;
/** Gap between shimmers. Decoupled from the frame rate so the field drifts at
 *  the same pace on a 60Hz and a 120Hz screen. */
const SHIMMER_INTERVAL = 55; // ms

/** Radius of the clearer patch tracking the cursor. */
const HALO_RADIUS = 170; // px
/** Inner share of that radius held at full HALO_OPACITY before the falloff
 *  starts, so the centre actually reaches the opacity the knob names. */
const HALO_CORE = 0.15;
/** Below this a cell is left to the idle layer. */
const HALO_FLOOR = 0.01;

const RIPPLE_SPEED = 620; // px per second
/** A ripple outlives the trip to its furthest corner by this much, so the wave
 *  always makes it across whatever the viewport size, then fades just after. */
const RIPPLE_TAIL = 1.35;
/**
 * Shape of the fade over a ripple's life. The wave only touches RIPPLE_OPACITY
 * at the moment it is struck and thins out the whole way across, rather than
 * riding the cap and dropping off at the end. 1 is a straight linear fade;
 * higher holds it stronger early and lets it go sooner after.
 */
const RIPPLE_FALLOFF = 1.4;
const RIPPLE_BAND = 64; // px — width of the gaussian envelope
const RIPPLE_WAVELENGTH = 0.085; // radians per px — gives the trailing rings
const MAX_RIPPLES = 12;

/* A perfectly round ring is the thing that reads as computer-generated, so each
 * ripple gets its own lopsided outline from a few angular harmonics, and the
 * band softens as it spreads the way a real disturbance disperses. */

/** How far the ring may wander off a circle, as a fraction of its radius. */
const RIPPLE_WOBBLE = 0.13;
/** Harmonics the wobble is built from. Low, uneven counts read as a natural
 *  lopsidedness; high or evenly spaced ones turn it into a flower. */
const WOBBLE_HARMONICS = [2, 3, 5];
const WOBBLE_MAX = Math.max(...WOBBLE_HARMONICS);
/** How much that same wobble also varies brightness around the ring, so one
 *  side of the wave carries more energy than the other. It only ever darkens —
 *  if it could amplify, the crest would re-clip to the cap and the fade would
 *  flatten out at the top. */
const RIPPLE_SHADE = 0.35;
/** Band widening per pixel of radius — the wave goes softer as it spreads. */
const RIPPLE_DISPERSION = 0.0004;
/** Below this a cell is left to the idle layer. */
const ENERGY_FLOOR = 0.06;

interface Ripple {
  x: number;
  y: number;
  born: number;
  /** Distance to the furthest corner — how far this one has to travel. */
  reach: number;
  /**
   * Per-harmonic (sin, cos) coefficients giving this ripple its own outline.
   * Stored pre-multiplied so the hot loop is a couple of multiply-adds rather
   * than a `Math.sin` per cell.
   */
  wobble: Float64Array;
}

/** Random, normalised harmonic coefficients — a fresh silhouette per ripple. */
function makeWobble(): Float64Array {
  const coefficients = new Float64Array(WOBBLE_HARMONICS.length * 2);
  let total = 0;
  for (let k = 0; k < WOBBLE_HARMONICS.length; k++) {
    const weight = 0.4 + Math.random() * 0.6;
    const phase = Math.random() * Math.PI * 2;
    coefficients[k * 2] = weight * Math.cos(phase);
    coefficients[k * 2 + 1] = weight * Math.sin(phase);
    total += weight;
  }
  // Normalised so the summed wobble stays inside ±1 however the weights fell.
  for (let i = 0; i < coefficients.length; i++) coefficients[i] /= total;
  return coefficients;
}

function sampleGradient(stops: RGB[], t: number): RGB {
  const x = Math.max(0, Math.min(0.999999, t)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = stops[i];
  const b = stops[Math.min(stops.length - 1, i + 1)];
  return [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * f) as RGB;
}

/** Opacity against a black page, capped and folded into the colour. */
function bake(color: RGB, opacity: number): string {
  const a = Math.max(0, Math.min(MAX_OPACITY, opacity));
  const [r, g, b] = color.map((c) => Math.round(c * a));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Fraction of MAX_OPACITY an atlas step carries. */
function stepFraction(step: number): number {
  return (step + 1) / LEVELS;
}

/** Nearest atlas step to a given fraction of MAX_OPACITY. */
function stepFor(fraction: number): number {
  return Math.max(0, Math.min(LEVELS - 1, Math.round(fraction * LEVELS) - 1));
}

export class AsciiRipples {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly atlas = document.createElement("canvas");
  private readonly atlasCtx: CanvasRenderingContext2D;
  private readonly idle = document.createElement("canvas");
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
  /** Palette step this cell sits at when idle — randomised per cell. */
  private idleStep = new Uint8Array(0);
  /** Cells that render in ACCENT_COLOR once the halo reaches them. */
  private accent = new Uint8Array(0);
  private energy = new Float32Array(0);
  private halo = new Float32Array(0);

  private ripples: Ripple[] = [];
  private frame = 0;
  private running = false;
  private destroyed = false;
  private lastShimmer = 0;
  /** Whether `energy` / `halo` still hold something that needs clearing off. */
  private energyDirty = false;
  private haloDirty = false;

  private pointerInside = false;
  private pointerX = 0;
  private pointerY = 0;
  /** Where the halo buffer was last computed, so a still cursor costs nothing. */
  private haloX = Number.NaN;
  private haloY = Number.NaN;

  /** Honour the OS setting by dropping the ambient shimmer. Taps and the cursor
   *  halo still respond, since those answer something the user just did. */
  private reduceMotion = false;
  private motionQuery: MediaQueryList | null = null;
  private observer: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    const atlasCtx = this.atlas.getContext("2d");
    const idleCtx = this.idle.getContext("2d", { alpha: false });
    if (!ctx || !atlasCtx || !idleCtx) {
      throw new Error("AsciiRipples: 2d canvas context unavailable");
    }
    this.ctx = ctx;
    this.atlasCtx = atlasCtx;
    this.idleCtx = idleCtx;
  }

  mount(): void {
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduceMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener("change", this.handleMotionChange);

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.canvas);

    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointercancel", this.handlePointerLeave);
    // Movement is tracked on the window rather than the canvas, so the halo
    // keeps following the cursor across anything layered over the field — the
    // hero text and its triggers sit on top and would otherwise swallow it.
    window.addEventListener("pointermove", this.handlePointerMove);
    // Leaving the window shows up as a pointerout with no relatedTarget. A
    // pointerleave on document would also fire when the cursor crosses from
    // the canvas onto something above it, killing the halo exactly where it
    // should keep tracking.
    document.addEventListener("pointerout", this.handlePointerOut);
    window.addEventListener("blur", this.handlePointerLeave);

    this.resize();
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
    this.observer?.disconnect();
    this.observer = null;
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    this.motionQuery = null;
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointercancel", this.handlePointerLeave);
    window.removeEventListener("pointermove", this.handlePointerMove);
    document.removeEventListener("pointerout", this.handlePointerOut);
    window.removeEventListener("blur", this.handlePointerLeave);
  }

  /** Start a ripple at a point in CSS pixels relative to the canvas. */
  ripple(x: number, y: number): void {
    if (this.ripples.length >= MAX_RIPPLES) this.ripples.shift();
    this.ripples.push({
      x,
      y,
      born: performance.now(),
      reach: this.diagonalFrom(x, y),
      wobble: makeWobble(),
    });
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
    const { x, y } = this.toLocal(event);
    this.pointerInside = true;
    this.pointerX = x;
    this.pointerY = y;
    this.ripple(x, y);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    const { x, y } = this.toLocal(event);
    const inside = x >= 0 && y >= 0 && x < this.width && y < this.height;
    // Nothing to redraw if it was outside and still is.
    if (!inside && !this.pointerInside) return;
    this.pointerInside = inside;
    this.pointerX = x;
    this.pointerY = y;
    this.start();
  };

  private handlePointerOut = (event: PointerEvent): void => {
    // relatedTarget is null only when the pointer left the window altogether.
    if (event.relatedTarget === null) this.handlePointerLeave();
  };

  private handlePointerLeave = (): void => {
    this.pointerInside = false;
    this.start();
  };

  private toLocal(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    // Capping keeps 3x phone screens from paying for tiles nobody can see.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (width === this.width && height === this.height && dpr === this.dpr)
      return;

    this.width = width;
    this.height = height;
    this.dpr = dpr;

    this.buildAtlas();

    this.cols = Math.max(1, Math.ceil(width / this.cellW));
    this.rows = Math.max(1, Math.ceil(height / this.cellH));
    const cells = this.cols * this.rows;

    this.glyph = new Uint8Array(cells);
    this.shown = new Uint8Array(cells);
    this.idleStep = new Uint8Array(cells);
    this.accent = new Uint8Array(cells);
    this.energy = new Float32Array(cells);
    this.halo = new Float32Array(cells);
    for (let i = 0; i < cells; i++) this.rollCell(i);

    for (const target of [this.canvas, this.idle]) {
      target.width = Math.round(width * dpr);
      target.height = Math.round(height * dpr);
    }
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.idleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.haloX = Number.NaN;
    this.haloY = Number.NaN;
    this.renderIdleLayer();
    this.present();
    // The shimmer should be running before anyone clicks; with motion off there
    // is nothing to animate until a tap or the cursor comes in.
    if (!this.reduceMotion || this.ripples.length) this.start();
  }

  /** Give a cell a fresh glyph, visibility and idle opacity. */
  private rollCell(i: number): void {
    this.glyph[i] = (Math.random() * GLYPHS.length) | 0;
    this.shown[i] = Math.random() < FIELD_DENSITY ? 1 : 0;
    this.idleStep[i] = stepFor(
      IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN),
    );
    this.accent[i] = Math.random() < ACCENT_CHANCE ? 1 : 0;
  }

  /**
   * One tile per glyph per palette step, at device resolution. Rows 0..LEVELS-1
   * are the field ramp; rows LEVELS..2*LEVELS-1 are the ripple gradient.
   */
  private buildAtlas(): void {
    const { atlasCtx, dpr } = this;
    const probeFont = `${FONT_SIZE * dpr}px ${FONT_STACK}`;
    atlasCtx.font = probeFont;
    const advance = atlasCtx.measureText("M").width;

    this.cellW = Math.max(1, advance / dpr);
    this.cellH = Math.max(1, Math.round(FONT_SIZE * LINE_HEIGHT));
    this.tileW = Math.max(1, Math.ceil(this.cellW * dpr));
    this.tileH = Math.max(1, Math.ceil(this.cellH * dpr));

    this.atlas.width = this.tileW * GLYPHS.length;
    this.atlas.height = this.tileH * LEVELS * BLOCKS;

    // Resizing the canvas cleared the context state, so set it up again.
    atlasCtx.font = probeFont;
    atlasCtx.textAlign = "center";
    atlasCtx.textBaseline = "middle";
    for (let row = 0; row < LEVELS * BLOCKS; row++) {
      const step = row % LEVELS;
      const opacity = MAX_OPACITY * stepFraction(step);
      const block = (row / LEVELS) | 0;
      atlasCtx.fillStyle =
        block === BLOCK_FIELD
          ? bake(FIELD_COLOR, opacity)
          : block === BLOCK_RIPPLE
            ? bake(
                sampleGradient(RIPPLE_GRADIENT, step / (LEVELS - 1)),
                opacity,
              )
            : bake(ACCENT_COLOR, opacity);
      const y = row * this.tileH + this.tileH / 2;
      for (let g = 0; g < GLYPHS.length; g++) {
        atlasCtx.fillText(GLYPHS[g], g * this.tileW + this.tileW / 2, y);
      }
    }
  }

  private blit(
    ctx: CanvasRenderingContext2D,
    glyph: number,
    row: number,
    x: number,
    y: number,
  ): void {
    ctx.drawImage(
      this.atlas,
      glyph * this.tileW,
      row * this.tileH,
      this.tileW,
      this.tileH,
      x,
      y,
      this.cellW,
      this.cellH,
    );
  }

  private renderIdleLayer(): void {
    const { idleCtx } = this;
    idleCtx.fillStyle = "#000";
    idleCtx.fillRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.shown.length; i++) {
      if (!this.shown[i]) continue;
      const col = i % this.cols;
      const row = (i / this.cols) | 0;
      this.blit(
        idleCtx,
        this.glyph[i],
        this.idleStep[i],
        col * this.cellW,
        row * this.cellH,
      );
    }
  }

  /** Re-roll a few cells and patch just those tiles on the idle layer. */
  private shimmer(now: number): boolean {
    const cells = this.glyph.length;
    if (!cells || now - this.lastShimmer < SHIMMER_INTERVAL) return false;
    this.lastShimmer = now;
    for (let n = 0; n < SHIMMER_PER_TICK; n++) {
      const i = (Math.random() * cells) | 0;
      this.rollCell(i);
      const x = (i % this.cols) * this.cellW;
      const y = ((i / this.cols) | 0) * this.cellH;
      this.idleCtx.fillStyle = "#000";
      this.idleCtx.fillRect(x, y, this.cellW, this.cellH);
      if (this.shown[i])
        this.blit(this.idleCtx, this.glyph[i], this.idleStep[i], x, y);
    }
    return true;
  }

  /** Returns whether the canvas needs repainting. */
  private computeHalo(): boolean {
    if (!this.pointerInside) {
      if (!this.haloDirty) return false;
      this.halo.fill(0);
      this.haloDirty = false;
      this.haloX = Number.NaN;
      this.haloY = Number.NaN;
      return true;
    }
    // A cursor that has not moved re-uses the buffer from last time.
    if (this.pointerX === this.haloX && this.pointerY === this.haloY)
      return false;

    this.halo.fill(0);
    this.haloDirty = true;
    this.haloX = this.pointerX;
    this.haloY = this.pointerY;

    const c0 = Math.max(
      0,
      Math.floor((this.pointerX - HALO_RADIUS) / this.cellW),
    );
    const c1 = Math.min(
      this.cols - 1,
      Math.ceil((this.pointerX + HALO_RADIUS) / this.cellW),
    );
    const r0 = Math.max(
      0,
      Math.floor((this.pointerY - HALO_RADIUS) / this.cellH),
    );
    const r1 = Math.min(
      this.rows - 1,
      Math.ceil((this.pointerY + HALO_RADIUS) / this.cellH),
    );

    for (let row = r0; row <= r1; row++) {
      const dy = (row + 0.5) * this.cellH - this.pointerY;
      const base = row * this.cols;
      for (let col = c0; col <= c1; col++) {
        const dx = (col + 0.5) * this.cellW - this.pointerX;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d >= HALO_RADIUS) continue;
        const core = HALO_RADIUS * HALO_CORE;
        const f = d <= core ? 1 : (HALO_RADIUS - d) / (HALO_RADIUS - core);
        this.halo[base + col] = f * f;
      }
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

      const amp = Math.pow(life, RIPPLE_FALLOFF);
      // The band softens as the wave spreads.
      const band = RIPPLE_BAND * (1 + radius * RIPPLE_DISPERSION);
      const pad = band * 2;
      const wob = ripple.wobble;
      // The ring can bulge outward by this much, so the bbox has to allow for it.
      const reach = radius * (1 + RIPPLE_WOBBLE) + pad;
      const c0 = Math.max(0, Math.floor((ripple.x - reach) / this.cellW));
      const c1 = Math.min(
        this.cols - 1,
        Math.ceil((ripple.x + reach) / this.cellW),
      );
      const r0 = Math.max(0, Math.floor((ripple.y - reach) / this.cellH));
      const r1 = Math.min(
        this.rows - 1,
        Math.ceil((ripple.y + reach) / this.cellH),
      );

      for (let row = r0; row <= r1; row++) {
        const dy = (row + 0.5) * this.cellH - ripple.y;
        const base = row * this.cols;
        for (let col = c0; col <= c1; col++) {
          const dx = (col + 0.5) * this.cellW - ripple.x;
          const d = Math.sqrt(dx * dx + dy * dy);

          // Walk the harmonics up from the cell's own angle by repeated complex
          // multiplication — sin(k0)/cos(k0) without a trig call per cell.
          const inv = d > 1e-6 ? 1 / d : 0;
          const cos1 = dx * inv;
          const sin1 = dy * inv;
          let cosK = cos1;
          let sinK = sin1;
          let offset = 0;
          for (
            let k = 1, h = 0;
            k <= WOBBLE_MAX && h < WOBBLE_HARMONICS.length;
            k++
          ) {
            if (k > 1) {
              const nextCos = cosK * cos1 - sinK * sin1;
              sinK = sinK * cos1 + cosK * sin1;
              cosK = nextCos;
            }
            if (k === WOBBLE_HARMONICS[h]) {
              offset += wob[h * 2] * sinK + wob[h * 2 + 1] * cosK;
              h++;
            }
          }

          const delta = d - radius * (1 + offset * RIPPLE_WOBBLE);
          if (delta < -pad || delta > pad) continue;
          const envelope = Math.exp(-(delta * delta) / (band * band));
          const wave = Math.cos(delta * RIPPLE_WAVELENGTH);
          // Same wobble shades the ring, so the energy is uneven around it.
          // Darkens only, topping out at 1, so the crest tracks the fade curve.
          const shade = 1 - RIPPLE_SHADE * 0.5 * (1 - offset);
          this.energy[base + col] += Math.abs(envelope * wave) * amp * shade;
        }
      }
    }
    return true;
  }

  /** Distance to the furthest corner — how far a ripple here has to travel to
   *  clear the screen. Floored so a tap before the first layout can't divide by zero. */
  private diagonalFrom(x: number, y: number): number {
    const dx = Math.max(x, this.width - x);
    const dy = Math.max(y, this.height - y);
    return Math.max(1, Math.sqrt(dx * dx + dy * dy));
  }

  /** Blit the idle layer, then overdraw the cells the halo and ripples are lighting. */
  private present(): void {
    const { ctx } = this;
    ctx.drawImage(this.idle, 0, 0, this.width, this.height);

    ctx.fillStyle = "#000";
    const top = LEVELS - 1;
    const haloTop = stepFor(HALO_OPACITY);
    const rippleTop = stepFor(RIPPLE_OPACITY);
    for (let i = 0; i < this.energy.length; i++) {
      const e = this.energy[i];
      const h = this.halo[i];
      if (e <= ENERGY_FLOOR && h <= HALO_FLOOR) continue;

      const x = (i % this.cols) * this.cellW;
      const y = ((i / this.cols) | 0) * this.cellH;
      let glyph: number;
      let row: number;

      if (e > ENERGY_FLOOR) {
        // Clamped, so overlapping ripples still respect the opacity ceiling.
        const t = Math.min(1, e);
        // Faint cells just light up whatever ASCII was already there; the crest
        // swaps in the density ramp so the ring reads as a wave.
        glyph =
          t > 0.25
            ? RAMP_INDEX[
                Math.min(RAMP_INDEX.length - 1, (t * RAMP_INDEX.length) | 0)
              ]
            : this.glyph[i];
        row = BLOCK_RIPPLE * LEVELS + Math.max(1, Math.round(t * rippleTop));
      } else {
        // The halo lifts a cell from its own idle opacity toward HALO_OPACITY,
        // and reveals cells the idle layer was hiding.
        glyph = this.glyph[i];
        const base = this.idleStep[i];
        const step = Math.min(
          top,
          Math.round(base + h * Math.max(0, haloTop - base)),
        );
        row = (this.accent[i] ? BLOCK_ACCENT : BLOCK_FIELD) * LEVELS + step;
      }

      ctx.fillRect(x, y, this.cellW, this.cellH);
      this.blit(ctx, glyph, row, x, y);
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
    const haloed = this.computeHalo();
    const rippling = this.computeEnergy(now);
    // Skip the repaint on frames where nothing actually changed.
    if (shimmered || haloed || rippling) this.present();

    // With motion off there is no shimmer to draw, so idle once the ripples and
    // the halo are done. The next tap or cursor move restarts the loop.
    if (this.reduceMotion && !rippling && !this.haloDirty) {
      this.stop();
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  };
}
