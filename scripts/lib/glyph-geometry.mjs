// Shared geometry helpers for comparing tracing models with the catalogue glyphs.
// The catalogue draws letter.glyph with Noto Naskh Arabic 400 (see src/main.jsx), so the
// reference here is that font rendered in Chromium. Nothing in the app imports this file.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const fontFile = fileURLToPath(new URL('../../node_modules/@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2', import.meta.url));

/** Render isolated glyphs to ink masks (alpha > 127), cropped to the ink bounding box. */
export async function rasterGlyphs(glyphs, fontSize = 600) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const canvasSize = Math.max(1800, fontSize * 2);
    await page.setContent(`<canvas id="c" width="${canvasSize}" height="${canvasSize}"></canvas>`);
    const font = readFileSync(fontFile).toString('base64');
    const rendered = await page.evaluate(async ({ font, glyphs, fontSize }) => {
      const bytes = Uint8Array.from(atob(font), c => c.charCodeAt(0));
      const face = new FontFace('RefNaskh', bytes.buffer, { weight: '400' });
      await face.load();
      document.fonts.add(face);
      const canvas = document.getElementById('c'), ctx = canvas.getContext('2d', { willReadFrequently: true });
      const out = {};
      for (const glyph of glyphs) {
        const size = canvas.width;
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = '#000';
        ctx.font = `${fontSize}px RefNaskh`;
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(glyph, size / 2, fontSize <= 600 ? 1100 : fontSize * 1.5);
        const { data } = ctx.getImageData(0, 0, size, size);
        let x0 = size, y0 = size, x1 = -1, y1 = -1;
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (data[(y * size + x) * 4 + 3] > 127) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        const pad = 6, w = x1 - x0 + 1 + pad * 2, h = y1 - y0 + 1 + pad * 2;
        const mask = new Uint8Array(w * h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const sx = x + x0 - pad, sy = y + y0 - pad;
          if (sx >= 0 && sy >= 0 && sx < size && sy < size && data[(sy * size + sx) * 4 + 3] > 127) mask[y * w + x] = 1;
        }
        let binary = '';
        for (let i = 0; i < mask.length; i += 8192) binary += String.fromCharCode(...mask.subarray(i, i + 8192));
        out[glyph] = { w, h, data: btoa(binary) };
      }
      return out;
    }, { font, glyphs, fontSize });
    const result = {};
    for (const [glyph, { w, h, data }] of Object.entries(rendered)) {
      result[glyph] = { w, h, mask: Uint8Array.from(Buffer.from(data, 'base64')) };
    }
    return result;
  } finally { await browser.close(); }
}

/** Connected components (8-neighbour) of a binary mask. */
export function components({ w, h, mask }) {
  const label = new Int32Array(w * h), list = [];
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || label[start]) continue;
    const id = list.length + 1, stack = [start];
    label[start] = id;
    let area = 0, sx = 0, sy = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    while (stack.length) {
      const p = stack.pop(), x = p % w, y = (p / w) | 0;
      area++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (mask[q] && !label[q]) { label[q] = id; stack.push(q); }
      }
    }
    list.push({ id, area, cx: sx / area, cy: sy / area, x0, y0, x1, y1 });
  }
  return { label, list };
}

/** Split a glyph into its body and its dots (small detached ink blobs). */
export function splitGlyph(raster) {
  const { label, list } = components(raster);
  const body = list.reduce((a, b) => b.area > a.area ? b : a);
  // Dots are small, compact blobs detached from the body; a hamza-like piece is not a dot.
  const dots = list.filter(c => {
    const width = c.x1 - c.x0 + 1, height = c.y1 - c.y0 + 1;
    return c !== body && c.area < body.area * .22 && Math.max(width, height) < Math.max(raster.w, raster.h) * .3 &&
      Math.max(width, height) / Math.min(width, height) < 1.3;
  });
  const dotIds = new Set(dots.map(d => d.id));
  const bodyMask = new Uint8Array(raster.w * raster.h);
  for (let i = 0; i < label.length; i++) if (label[i] && !dotIds.has(label[i])) bodyMask[i] = 1;
  return { body, dots, bodyMask, extra: list.filter(c => c !== body && !dotIds.has(c.id)) };
}

/** Zhang-Suen thinning; returns a new 0/1 mask. */
export function thin({ w, h }, input) {
  const m = Uint8Array.from(input), flag = [];
  let changed = true;
  const at = (x, y) => m[y * w + x];
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      flag.length = 0;
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        if (!at(x, y)) continue;
        const p2 = at(x, y - 1), p3 = at(x + 1, y - 1), p4 = at(x + 1, y), p5 = at(x + 1, y + 1),
          p6 = at(x, y + 1), p7 = at(x - 1, y + 1), p8 = at(x - 1, y), p9 = at(x - 1, y - 1);
        const n = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (n < 2 || n > 6) continue;
        const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let transitions = 0;
        for (let i = 0; i < 8; i++) if (!seq[i] && seq[i + 1]) transitions++;
        if (transitions !== 1) continue;
        if (pass === 0 ? (p2 * p4 * p6 || p4 * p6 * p8) : (p2 * p4 * p8 || p2 * p6 * p8)) continue;
        flag.push(y * w + x);
      }
      for (const p of flag) m[p] = 0;
      if (flag.length) changed = true;
    }
  }
  return m;
}

/** Euclidean distance (pixels) from every pixel to the nearest set pixel of `mask`. */
export function distanceTo({ w, h }, mask) {
  const INF = 1e12, f = new Float64Array(Math.max(w, h)), d = new Float64Array(Math.max(w, h)), v = new Int32Array(Math.max(w, h)), z = new Float64Array(Math.max(w, h) + 1);
  const grid = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) grid[i] = mask[i] ? 0 : INF;
  const pass = (n, read, write) => {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s;
      while (true) {
        const p = v[k];
        s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p);
        if (s <= z[k] && k > 0) k--; else break;
      }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
    for (let q = 0; q < n; q++) write(q, d[q]);
    void read;
  };
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = grid[y * w + x]; pass(h, null, (y, val) => { grid[y * w + x] = val; }); }
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = grid[y * w + x]; pass(w, null, (x, val) => { grid[y * w + x] = val; }); }
  return grid.map(Math.sqrt);
}

/* ---------- SVG path sampling (M, L, Q, C, H, V; absolute only) ---------- */

export function parsePath(path) {
  const tokens = path.match(/[MLHVCQZ]|[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?/gi);
  const segments = [];
  let i = 0, cur = null, command = null;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) command = tokens[i++].toUpperCase();
    if (command === 'M') { cur = { x: num(), y: num() }; command = 'L'; continue; }
    if (command === 'L') { const p = { x: num(), y: num() }; segments.push([cur, p]); cur = p; }
    else if (command === 'H') { const p = { x: num(), y: cur.y }; segments.push([cur, p]); cur = p; }
    else if (command === 'V') { const p = { x: cur.x, y: num() }; segments.push([cur, p]); cur = p; }
    else if (command === 'Q') { const c = { x: num(), y: num() }, p = { x: num(), y: num() }; segments.push([cur, c, p]); cur = p; }
    else if (command === 'C') { const c1 = { x: num(), y: num() }, c2 = { x: num(), y: num() }, p = { x: num(), y: num() }; segments.push([cur, c1, c2, p]); cur = p; }
    else throw new Error(`Unsupported path command ${command}`);
  }
  return segments;
}

const bez = (pts, t) => {
  let p = pts;
  while (p.length > 1) p = p.slice(1).map((q, k) => ({ x: p[k].x + (q.x - p[k].x) * t, y: p[k].y + (q.y - p[k].y) * t }));
  return p[0];
};

/** Sample a path every ~`step` units. */
export function samplePath(path, step = 1) {
  const out = [];
  for (const seg of parsePath(path)) {
    const coarse = Array.from({ length: 41 }, (_, k) => bez(seg, k / 40));
    let length = 0;
    for (let k = 1; k < coarse.length; k++) length += Math.hypot(coarse[k].x - coarse[k - 1].x, coarse[k].y - coarse[k - 1].y);
    const n = Math.max(2, Math.ceil(length / step));
    for (let k = out.length ? 1 : 0; k <= n; k++) out.push(bez(seg, k / n));
  }
  return out;
}

/* ---------- Tracing along a skeleton ---------- */

export function nearestSet(w, h, skeleton, x, y, limit = 90) {
  let best = null, bestD = Infinity;
  const r = Math.ceil(limit);
  for (let yy = Math.max(0, Math.round(y) - r); yy <= Math.min(h - 1, Math.round(y) + r); yy++)
    for (let xx = Math.max(0, Math.round(x) - r); xx <= Math.min(w - 1, Math.round(x) + r); xx++) {
      if (!skeleton[yy * w + xx]) continue;
      const d = Math.hypot(xx - x, yy - y);
      if (d < bestD) { bestD = d; best = yy * w + xx; }
    }
  return best == null ? null : { index: best, distance: bestD };
}

/** Shortest 8-connected route over the skeleton between two pixel indices. */
export function routeOnSkeleton(w, h, skeleton, from, to) {
  const dist = new Map([[from, 0]]), prev = new Map(), heap = [[0, from]];
  const push = item => { heap.push(item); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  while (heap.length) {
    const [d, p] = pop();
    if (p === to) break;
    if (d > dist.get(p)) continue;
    const x = p % w, y = (p / w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || !skeleton[ny * w + nx]) continue;
      const q = ny * w + nx, nd = d + (dx && dy ? 1.4142 : 1);
      if (nd < (dist.get(q) ?? Infinity)) { dist.set(q, nd); prev.set(q, p); push([nd, q]); }
    }
  }
  if (!dist.has(to)) return null;
  const route = [];
  for (let p = to; p !== undefined; p = prev.get(p)) route.push({ x: p % w, y: (p / w) | 0 });
  return route.reverse();
}

/** Moving-average smoothing that keeps the end points. */
export function smooth(points, radius) {
  return points.map((p, i) => {
    const r = Math.min(radius, i, points.length - 1 - i);
    let sx = 0, sy = 0;
    for (let k = i - r; k <= i + r; k++) { sx += points[k].x; sy += points[k].y; }
    return { x: sx / (2 * r + 1), y: sy / (2 * r + 1) };
  });
}

/* ---------- Schneider cubic Bezier fitting ---------- */

const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y }), sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a, s) => ({ x: a.x * s, y: a.y * s }), dot = (a, b) => a.x * b.x + a.y * b.y;
const len = a => Math.hypot(a.x, a.y), unit = a => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };
const bezAt = (b, t) => { const m = 1 - t; return add(add(mul(b[0], m * m * m), mul(b[1], 3 * m * m * t)), add(mul(b[2], 3 * m * t * t), mul(b[3], t * t * t))); };

function chordParams(pts) {
  const u = [0];
  for (let i = 1; i < pts.length; i++) u.push(u[i - 1] + len(sub(pts[i], pts[i - 1])));
  return u.map(v => v / u[u.length - 1]);
}

function generate(pts, u, t1, t2) {
  const first = pts[0], last = pts[pts.length - 1];
  let c00 = 0, c01 = 0, c11 = 0, x0 = 0, x1 = 0;
  for (let i = 0; i < pts.length; i++) {
    const t = u[i], m = 1 - t;
    const b0 = m * m * m, b1 = 3 * m * m * t, b2 = 3 * m * t * t, b3 = t * t * t;
    const a1 = mul(t1, b1), a2 = mul(t2, b2);
    c00 += dot(a1, a1); c01 += dot(a1, a2); c11 += dot(a2, a2);
    const tmp = sub(pts[i], add(mul(first, b0 + b1), mul(last, b2 + b3)));
    x0 += dot(a1, tmp); x1 += dot(a2, tmp);
  }
  const det = c00 * c11 - c01 * c01;
  let alpha1 = det ? (x0 * c11 - x1 * c01) / det : 0, alpha2 = det ? (c00 * x1 - c01 * x0) / det : 0;
  const seg = len(sub(last, first)), eps = 1e-6 * seg;
  if (alpha1 < eps || alpha2 < eps) alpha1 = alpha2 = seg / 3;
  return [first, add(first, mul(t1, alpha1)), add(last, mul(t2, alpha2)), last];
}

function reparam(bezier, pts, u) {
  return u.map((t, i) => {
    const d = sub(bezAt(bezier, t), pts[i]);
    const d1 = [0, 1, 2].map(k => mul(sub(bezier[k + 1], bezier[k]), 3));
    const d2 = [0, 1].map(k => mul(sub(d1[k + 1], d1[k]), 2));
    const m = 1 - t;
    const q1 = add(add(mul(d1[0], m * m), mul(d1[1], 2 * m * t)), mul(d1[2], t * t));
    const q2 = add(mul(d2[0], m), mul(d2[1], t));
    const den = dot(q1, q1) + dot(d, q2);
    return Math.abs(den) < 1e-9 ? t : Math.min(1, Math.max(0, t - dot(d, q1) / den));
  });
}

function maxError(bezier, pts, u) {
  let worst = 0, at = 0;
  for (let i = 0; i < pts.length; i++) {
    const d = len(sub(bezAt(bezier, u[i]), pts[i]));
    if (d > worst) { worst = d; at = i; }
  }
  return { worst, at };
}

export function fitCurve(points, tolerance = 4) {
  const tan = (a, b) => unit(sub(a, b));
  const fit = (pts, t1, t2) => {
    if (pts.length === 2) {
      const d = len(sub(pts[1], pts[0])) / 3;
      return [[pts[0], add(pts[0], mul(t1, d)), add(pts[1], mul(t2, d)), pts[1]]];
    }
    let u = chordParams(pts), bezier = generate(pts, u, t1, t2), { worst, at } = maxError(bezier, pts, u);
    if (worst < tolerance) return [bezier];
    if (worst < tolerance * 6) {
      for (let k = 0; k < 24; k++) {
        u = reparam(bezier, pts, u); bezier = generate(pts, u, t1, t2);
        ({ worst, at } = maxError(bezier, pts, u));
        if (worst < tolerance) return [bezier];
      }
    }
    const split = Math.min(pts.length - 2, Math.max(1, at));
    const center = unit(sub(pts[split - 1], pts[split + 1]));
    return [...fit(pts.slice(0, split + 1), t1, center), ...fit(pts.slice(split), mul(center, -1), t2)];
  };
  return fit(points, tan(points[1], points[0]), tan(points[points.length - 2], points[points.length - 1]));
}

/** Fit a polyline, splitting at `corners` (indices) so sharp joins stay sharp. */
export function fitPolyline(points, corners = [], tolerance = 4) {
  const cuts = [0, ...corners.filter(i => i > 0 && i < points.length - 1), points.length - 1];
  const beziers = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const piece = points.slice(cuts[i], cuts[i + 1] + 1);
    if (piece.length < 2) continue;
    beziers.push(...(piece.length === 2 ? [[piece[0], piece[0], piece[1], piece[1]]] : fitCurve(piece, tolerance)));
  }
  return beziers;
}

export const toPath = beziers => {
  const f = n => String(Math.round(n * 10) / 10);
  return `M ${f(beziers[0][0].x)} ${f(beziers[0][0].y)}` + beziers.map(b =>
    ` C ${f(b[1].x)} ${f(b[1].y)} ${f(b[2].x)} ${f(b[2].y)} ${f(b[3].x)} ${f(b[3].y)}`).join('');
};

export function bounds(points) {
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
