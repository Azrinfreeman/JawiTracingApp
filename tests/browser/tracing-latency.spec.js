import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openLesson } from './helpers/tracing.js';
import { treatAllModelsAsReady } from './helpers/readyCatalogue.js';
// Measurement spec for low-spec tablets: Android-style lightweight presentation, throttled CPU,
// 60 Hz-style batches of coalesced touch samples. Writes numbers; it only asserts completion.
test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
test.beforeEach(async ({ context }) => { await treatAllModelsAsReady(context); });

const tag = process.env.JAWI_PERF_TAG || 'run';
const rate = Number(process.env.JAWI_CPU_RATE || 6);
const out = 'output/verification/tracing-latency'; mkdirSync(out, { recursive: true });
const quantile = (values, q) => { const s = [...values].sort((a, b) => a - b); return s.length ? +s[Math.min(s.length - 1, Math.floor(s.length * q))].toFixed(2) : 0; };

for (const letter of ['Jim', 'Sin', 'Kaf']) test(`${letter}: throttled trace latency (${tag})`, async ({ page, browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'CPU throttling and tracing need Chromium');
  test.setTimeout(180000);
  await page.addInitScript(() => { window.TamanJawiAndroid = {}; });
  await openLesson(page, letter, 'play');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'cc'] });
  const result = await page.locator('.trace-board').evaluate(async svg => {
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const matrix = svg.getScreenCTM();
    const dispatch = (type, p, coalesced = []) => {
      const event = new PointerEvent(type, { ...p, pointerId: 77, pointerType: 'touch', bubbles: true });
      if (coalesced.length) Object.defineProperty(event, 'getCoalescedEvents', { value: () => coalesced.map(q => new PointerEvent('pointermove', q)) });
      svg.dispatchEvent(event);
    };
    const frames = [], handler = [], longTasks = [];
    new PerformanceObserver(list => list.getEntries().forEach(e => longTasks.push(e.duration))).observe({ entryTypes: ['longtask'] });
    const nextFrame = () => new Promise(requestAnimationFrame);
    let completed = 0;
    for (const path of [...svg.querySelectorAll('.reference-stroke')]) {
      const length = path.getTotalLength(), count = Math.ceil(length / 3);
      const pts = Array.from({ length: count + 1 }, (_, i) => { const p = path.getPointAtLength(length * i / count); const q = new DOMPoint(p.x, p.y).matrixTransform(matrix); return { clientX: q.x, clientY: q.y }; });
      dispatch('pointerdown', pts[0]);
      let last = await nextFrame();
      for (let i = 1; i < pts.length; i += 3) {
        const batch = pts.slice(i, i + 3), t = performance.now();
        dispatch('pointermove', batch.at(-1), batch); handler.push(performance.now() - t);
        const now = await nextFrame(); frames.push(now - last); last = now;
      }
      dispatch('pointerup', pts.at(-1)); await nextFrame(); await nextFrame(); completed++;
    }
    return { frames, handler, longTasks, completed };
  });
  const trace = JSON.parse((await browser.stopTracing()).toString());
  const events = Array.isArray(trace) ? trace : trace.traceEvents, sums = {};
  for (const e of events) if (e.ph === 'X' && e.dur) sums[e.name] = (sums[e.name] || 0) + e.dur / 1000;
  const pick = ['Paint', 'PaintImage', 'Layerize', 'UpdateLayer', 'Layout', 'UpdateLayoutTree', 'RasterTask', 'ImageDecodeTask', 'FunctionCall', 'EventDispatch', 'RunTask', 'Commit']
    .reduce((m, k) => ({ ...m, [k]: +(sums[k] || 0).toFixed(1) }), {});
  const summary = { letter, tag, cpuRate: rate, frames: result.frames.length,
    frameMs: { p50: quantile(result.frames, .5), p95: quantile(result.frames, .95), max: +Math.max(...result.frames).toFixed(1) },
    handlerMs: { p50: quantile(result.handler, .5), p95: quantile(result.handler, .95), max: +Math.max(...result.handler).toFixed(2) },
    longTasks: { count: result.longTasks.length, totalMs: +result.longTasks.reduce((a, b) => a + b, 0).toFixed(0) },
    traceMs: pick };
  writeFileSync(`${out}/${tag}-${letter}.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  expect(result.completed).toBeGreaterThan(0);
});

test('segmented fill follows the accepted frontier and ends at the full stroke length', async ({ page }) => {
  await openLesson(page, 'Jim', 'play');
  await page.locator('.trace-board').evaluate(async svg => {
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const matrix = svg.getScreenCTM(), path = svg.querySelector('.reference-stroke'), length = path.getTotalLength(), count = Math.ceil(length / 3);
    const pts = Array.from({ length: count + 1 }, (_, i) => { const p = path.getPointAtLength(length * i / count); const q = new DOMPoint(p.x, p.y).matrixTransform(matrix); return { clientX: q.x, clientY: q.y }; });
    const fire = (type, p) => svg.dispatchEvent(new PointerEvent(type, { ...p, pointerId: 9, pointerType: 'touch', bubbles: true }));
    const frame = () => new Promise(requestAnimationFrame);
    const measure = () => { const g = svg.querySelector('.play-fill'); const shown = [...g.querySelectorAll('path')].filter(n => n.getAttribute('display') === 'inline');
      return { frontier: +g.getAttribute('data-display-frontier'), drawn: shown.reduce((n, p) => n + p.getTotalLength(), 0), pieces: g.querySelectorAll('path').length, shown: shown.length }; };
    fire('pointerdown', pts[0]);
    for (let i = 1; i <= Math.floor(count * .5); i++) fire('pointermove', pts[i]);
    await frame(); await frame(); window.__half = measure(); await new Promise(r => { window.__shotHalf = r; setTimeout(r, 0); });
    for (let i = Math.floor(count * .5) + 1; i < pts.length; i++) fire('pointermove', pts[i]);
    await frame(); await frame(); window.__full = { ...measure(), length };
    fire('pointerup', pts.at(-1)); await frame();
  });
  await page.screenshot({ path: `${out}/fill-segmented.png` });
  const { half, full } = await page.evaluate(() => ({ half: window.__half, full: window.__full }));
  expect(Math.abs(half.drawn - half.frontier)).toBeLessThan(half.frontier * .02 + 2);
  expect(half.shown).toBeLessThan(half.pieces);
  expect(Math.abs(full.drawn - full.length)).toBeLessThan(full.length * .02 + 2);
  expect(full.shown).toBe(full.pieces);
});
