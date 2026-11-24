/* Trashy's button and slider reactions, built on Sakuga VFX by Justin Finkelman (MIT, github.com/finktheartist/sakuga-vfx).
   core.js (the library's shared core) must load first; slider.js may load after this file.
   What it does:
   - recolours the effects to Trashy's palette (paper, ink, gill pink),
   - gives every button a press squash; the main buttons (.act.main, .button) also get the library's impact frame:
     they invert for a moment, a burst goes off behind them, clouds roll off the corners and ドン! lands above,
   - defines <trashy-model-slider>, the library's slider with three stops that shows a model name in its bubble.
   Reduced motion turns the drawn effects and the squash off. */
(() => {
'use strict';
const fx = window.SakugaFX;
if (!fx) return;
const { Spring, rnd, later, at, ticks, wob, lines, burst, shards, puff, sfx, donut, slash } = fx;

/* ---------- palette ---------- */
const P = fx.P;
Object.assign(P, { fill: '#fffdf8', shade: '#ffc4d9', line: '#1f1b16', accent: '#ff86b3', ink: '#1f1b16' });
P.sfx = ['#1f1b16', '#fffdf8'];
/* the slider hard-codes two of the library's violet tones; swap them for ours */
const SWAP = { '#b8b3ff': () => P.shade, '#5a4fd8': () => '#b4234f' };
const recol = (o = {}) => (o.col && SWAP[o.col] ? { ...o, col: SWAP[o.col]() } : o);
fx.slash = (x, y, o) => slash(x, y, recol(o));
fx.sfx = (n, x, y, o) => sfx(n, x, y, recol(o));

/* ---------- page styles: the burst canvas behind a main button, and the impact frame ---------- */
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '.fx-host{position:relative;isolation:isolate}' +
  '.fx-host>canvas.back{position:absolute;pointer-events:none;z-index:-1}' +
  '.fx-inv{filter:invert(1) hue-rotate(180deg)}' }));

/* ---------- squash on springs, one loop for every button that is moving ---------- */
const live = new Map();
let running = false, last = 0;
const MAIN = '.act.main, a.button, button.button';
const PRESSABLE = 'button, a.button, a.ghost, [data-fx]';
const isMain = (el) => el.matches(MAIN);
function state(el) {
  let q = live.get(el);
  if (!q) {
    const main = isMain(el);
    q = { s: new Spring(1, 520, 15), pop: new Spring(1, 300, 12), tilt: new Spring(0, 260, 10), low: main ? 0.62 : 0.82, wide: main ? 0.24 : 0.3 };
    live.set(el, q); el.style.transition = 'none';
  }
  if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
  return q;
}
function loop(ms) {
  const dt = Math.min(0.034, Math.max(0, (ms - last) / 1000)); last = ms;
  for (const [el, q] of live) {
    const y = q.s.step(dt), p = q.pop.step(dt), r = q.tilt.step(dt);
    const still = q.s.to === 1 && Math.abs(y - 1) < 0.001 && Math.abs(q.s.v) < 0.01 && Math.abs(p - 1) < 0.001 && Math.abs(r) < 0.02;
    if (still) { el.style.transform = ''; el.style.transition = ''; live.delete(el); continue; }
    el.style.transform = `rotate(${r}deg) scale(${(1 + (1 - y) * q.wide) * p}, ${y * p})`;
  }
  if (live.size) requestAnimationFrame(loop); else running = false;
}
const calm = () => fx.calm;
const target = (e) => { const el = e.target.closest?.(PRESSABLE); return el && !el.disabled && !el.closest('[data-nofx]') ? el : null; };

/* press: it squashes while held; a main button also gets wedges above and wobble marks */
addEventListener('pointerdown', (e) => {
  const el = target(e); if (!el || calm() || e.button > 0) return;
  state(el).s.to = state(el).low;
  if (isMain(el)) { const c = at(el); ticks(c.x, c.y - c.h / 2 - 6, { dir: -Math.PI / 2, n: 3, r: 4, len: 14, fan: 0.5 }); wob(c.x - c.w / 2 - 6, c.y, { dir: -1, r: 10, life: 0.3 }); wob(c.x + c.w / 2 + 6, c.y, { dir: 1, r: 10, life: 0.3 }); }
}, true);
const release = () => { for (const q of live.values()) q.s.to = 1; };
addEventListener('pointerup', release, true); addEventListener('pointercancel', release, true);
addEventListener('pointerleave', (e) => { const q = live.get(e.target); if (q) q.s.to = 1; }, true);   /* only when the pointer leaves the button itself */

/* click (also Enter and Space): the main buttons get the impact, the rest a quick hop and three wedges */
addEventListener('click', (e) => {
  const el = target(e); if (!el || calm()) return;
  if (isMain(el)) impact(el);
  else { const q = state(el); q.s.to = 1; q.s.x = Math.min(q.s.x, 0.86); q.s.v += 3; const c = at(el, 1, 0); ticks(c.x - 6, c.y - 2, { dir: -1.05, n: 3, r: 5, len: 13, fan: 0.36, life: 0.45 }); }
}, true);

const backs = new WeakMap();
function impact(el) {
  const q = state(el), c = at(el), n = (q.seq = (q.seq || 0) + 1);
  q.s.to = 1; q.s.x = Math.min(q.s.x, 0.6); q.pop.x = 1.2; q.tilt.x = -4;
  el.classList.add('fx-inv'); later(190, () => el.classList.remove('fx-inv'));
  /* the burst sits behind the button, on a canvas inside it with a hole where the button is */
  let L = backs.get(el);
  if (!L || !L.c.isConnected) { el.classList.add('fx-host'); L = fx.Base.prototype.backLayer.call({ root: el }); backs.set(el, L); }
  /* up to 160 px round the button, but never past the page's edges (that would make the page scroll sideways) */
  /* the pop scales the canvas with the button (to 1.2), so keep a tenth of its size spare on each side */
  const b = el.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, de = document.documentElement;
  const room = (a, s) => Math.max(0, Math.min(160, a - 0.12 * (s + 320)));
  const l = room(b.left, w), r = room(de.clientWidth - b.right, w), t = room(b.top + scrollY, h), d = room(de.scrollHeight - b.bottom - scrollY, h);
  Object.assign(L.c.style, { left: -l + 'px', top: -t + 'px', width: w + l + r + 'px', height: h + t + d + 'px',
    clipPath: `path(evenodd,"M0 0H${w + l + r}V${h + t + d}H0Z M${l} ${t}h${w}v${h}h-${w}Z")` });
  burst(c.x, c.y, { r: 86, spikes: 17, life: 0.46, layer: L });
  shards(c.x, c.y, { n: 10, speed: 240, size: 8, life: 0.9, arc: 6.28, grav: 300 });
  for (const [dx, dy] of [[-1, -0.5], [1, -1], [-1, 0.9], [1, 1]]) puff(c.x + dx * (c.w / 2 + 6), c.y + dy * 22, { size: rnd(11, 15), n: 5, vx: dx * 42, vy: dy * 28 - 6, life: rnd(0.7, 1) });
  sfx('don', c.x + 8, c.y - c.h / 2 - 58, { size: 150, rot: -0.12, life: 1 });
  later(200, () => {
    if (n !== q.seq) return;
    q.s.x = 1.18; wob(c.x - c.w / 2 - 8, c.y, { dir: -1 }); wob(c.x + c.w / 2 + 8, c.y, { dir: 1 });
    donut(c.x + 6, c.y - 40, { r: 24, vx: 22, vy: -48, life: 1.15 }); later(90, () => donut(c.x + 46, c.y - 44, { r: 14, vx: 32, vy: -36, life: 1 }));
  });
}

/* ---------- the model slider: the library's slider with three stops and a name in the bubble ---------- */
customElements.whenDefined('sakuga-slider').then(() => {
  const Slider = customElements.get('sakuga-slider');
  class ModelSlider extends Slider {
    static css = Slider.css + `
      .val { font: 500 12px/16px "JetBrains Mono", ui-monospace, Consolas, monospace; padding: 2px 6px; border-width: 2px; }
      .val::after { border-top-width: 6px; }
      .th { background: var(--sk-card); }`;
    /* names: one per stop, separated by | */
    get names() { return (this.getAttribute('names') || '').split('|'); }
    sync() {
      super.sync();
      const name = this.names[+this.r.value] || this.r.value;
      this.val.textContent = name; this.r.setAttribute('aria-valuetext', name);
    }
    attributeChangedCallback(n, o, v) { super.attributeChangedCallback(n, o, v); if (n === 'names' && this.r) this.sync(); }
    static get observedAttributes() { return [...Slider.observedAttributes, 'names']; }
  }
  fx.define('trashy-model-slider', ModelSlider);
});
})();
