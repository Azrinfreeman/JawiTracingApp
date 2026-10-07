import { expect } from '@playwright/test';
import { test } from './helpers/localTest.js';
import { mkdirSync } from 'node:fs';
import { openLesson, boardModels, draw, openTeacher } from './helpers/tracing.js';
import { dismissSplash } from './helpers/navigation.js';
import { treatAllModelsAsReady } from './helpers/readyCatalogue.js';
// Mechanics spec: every authored model is served as student-ready; the real gate is covered elsewhere.
test.beforeEach(async ({ context }) => { await treatAllModelsAsReady(context); });

const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/low-spec-tablet';
mkdirSync(evidence, { recursive: true });
const instrument = async page => page.addInitScript(() => {
  window.perfCounters = {};
  window.__JAWI_TRACE_PERF__ = type => { window.perfCounters[type] = (window.perfCounters[type] || 0) + 1; };
});
async function exportDiagnostic(page) {
  await openTeacher(page);
  await page.getByRole('tab', { name: 'Diagnostik', exact: true }).click();
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Eksport jejak sesi ini' }).click();
  let text = ''; for await (const chunk of await (await pending).createReadStream()) text += chunk;
  return JSON.parse(text);
}

test('native lightweight default and adult override persist without changing fullscreen fit', async ({ page, browserName }) => {
  await page.addInitScript(() => { window.TamanJawiAndroid = {}; });
  for (const [width, height] of [[320, 600], [360, 640], [768, 1024]]) {
    await page.setViewportSize({ width, height }); await page.goto('/'); await dismissSplash(page);
    await expect(page.locator('html')).toHaveAttribute('data-presentation', 'light');
    await openTeacher(page);
    await expect(page.getByLabel('Paparan permainan')).toHaveValue('light');
    const visible = await page.locator('.teacher-settings-grid label, .teacher-settings-actions button').evaluateAll(nodes => nodes.every(node => { const b = node.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth; }));
    expect(visible).toBe(true);
    await page.screenshot({ path: `${evidence}/${browserName}-light-settings-${width}.png` });
    await page.getByRole('button', { name: 'Buka pratonton dewasa' }).click();
    const { chooseLetter } = await import('./helpers/navigation.js'); await chooseLetter(page, 'Alif');
    await expect(page.locator('.lesson-dock')).toHaveCount(0);
    await expect(page.locator('.play-trail circle')).toHaveCount(0);
    await expect(page.locator('.start-dot')).toBeVisible(); await expect(page.locator('.trace-number-guide')).not.toHaveCount(0);
    expect(await page.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight + 1)).toBe(true);
    await page.screenshot({ path: `${evidence}/${browserName}-light-lesson-${width}.png` });
  }
  await openTeacher(page);
  await page.getByLabel('Paparan permainan').selectOption('full'); await page.reload(); await dismissSplash(page);
  await expect(page.locator('html')).toHaveAttribute('data-presentation', 'full');
  await openTeacher(page); await expect(page.getByLabel('Paparan permainan')).toHaveValue('full');
  expect(await page.evaluate(() => localStorage.getItem('taman-jawi.progress.v1'))).toBeNull();
});

test('frame-painted progress avoids per-frame control renders and exports all coalesced and release samples', async ({ page }) => {
  await instrument(page); await openLesson(page, 'Alif', 'play');
  const result = await page.locator('.trace-board').evaluate(async svg => {
    window.perfCounters = {};
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const path = svg.querySelector('.reference-stroke'), matrix = svg.getScreenCTM(), length = path.getTotalLength();
    const started = performance.now();
    const points = Array.from({ length: Math.ceil(length / 3) + 1 }, (_, i) => i);
    const coordinates = points.map(i => { const p = path.getPointAtLength(length * i / (points.length - 1)); const q = new DOMPoint(p.x, p.y).matrixTransform(matrix); return { clientX: q.x, clientY: q.y }; });
    const dispatch = (type, p, coalesced = []) => {
      const event = new PointerEvent(type, { ...p, pointerId: 51, pointerType: 'touch', bubbles: true });
      if (coalesced.length) Object.defineProperty(event, 'getCoalescedEvents', { value: () => coalesced.map(point => new PointerEvent('pointermove', point)) });
      svg.dispatchEvent(event);
    };
    dispatch('pointerdown', coordinates[0]);
    for (let i = 1; i < coordinates.length; i += 4) { const batch = coordinates.slice(i, i + 4); dispatch('pointermove', batch.at(-1), batch); await new Promise(requestAnimationFrame); }
    dispatch('pointerup', coordinates.at(-1)); await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
    return { samples: coordinates.length + 1, frames: Math.ceil((coordinates.length - 1) / 4), duration: performance.now() - started, counters: { ...window.perfCounters } };
  });
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Alif!' })).toBeVisible();
  expect(result.counters.render).toBeLessThan(result.frames / 2);
  expect(result.counters.diagnostic).toBeLessThanOrEqual(Math.ceil(result.duration / 250) + 3);
  const diagnostic = await exportDiagnostic(page);
  expect(diagnostic.rawInk[0]).toHaveLength(result.samples); expect(diagnostic.timing.samples).toBe(result.samples);
  expect(diagnostic.phase).toBe('complete'); expect(diagnostic.rawGestures[0].status).toBe('commit');
});

test('long copy ink has bounded continuous paths and preserves the saved endpoints', async ({ page }) => {
  test.setTimeout(90000);
  await openLesson(page, 'Alif', 'play'); await draw(page, (await boardModels(page)).strokes[0]);
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
  await expect(page.locator('.trace-board')).toHaveAttribute('data-interaction-policy', 'free-copy');
  await expect(page.getByRole('button', { name: 'Simpan untuk guru' })).toBeEnabled();
  await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  const result = await page.locator('.trace-board').evaluate(async svg => {
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const matrix = svg.getScreenCTM();
    const points = Array.from({ length: 2000 }, (_, i) => ({ x: 250 + i / 5, y: 400 + 40 * Math.sin(i / 20) }));
    for (let i = 0; i < points.length; i++) {
      const p = new DOMPoint(points[i].x, points[i].y).matrixTransform(matrix);
      svg.dispatchEvent(new PointerEvent(i ? 'pointermove' : 'pointerdown', { clientX: p.x, clientY: p.y, pointerId: 61, pointerType: 'touch', bubbles: true }));
      if (i % 16 === 0) await new Promise(requestAnimationFrame);
    }
    const p = new DOMPoint(points.at(-1).x, points.at(-1).y).matrixTransform(matrix);
    svg.dispatchEvent(new PointerEvent('pointerup', { clientX: p.x, clientY: p.y, pointerId: 61, pointerType: 'touch', bubbles: true }));
    const chunks = [...svg.querySelectorAll('.pupil-ink')].map(path => path.getAttribute('d').match(/[ML] [-\d.e]+ [-\d.e]+/g));
    return { chunks, first: points[0], last: points.at(-1) };
  });
  expect(result.chunks.length).toBeGreaterThan(10); expect(result.chunks.every(chunk => chunk.length <= 128)).toBe(true);
  for (let i = 1; i < result.chunks.length; i++) expect(result.chunks[i][0].slice(2)).toBe(result.chunks[i - 1].at(-1).slice(2));
  await page.getByRole('button', { name: 'Simpan untuk guru' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.at(-1).ink[0]);
  const rounded = p => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 });
  expect(saved[0]).toEqual(rounded(result.first)); expect(saved.at(-1)).toEqual(rounded(result.last)); expect(saved).toHaveLength(700);
});

test('Duo clock ticks do not rerender either board', async ({ page }) => {
  await instrument(page); await page.setViewportSize({ width: 1024, height: 768 }); await page.goto('/'); await dismissSplash(page); await page.clock.install();
  await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click(); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click(); await page.getByRole('button', { name: 'Uji dua sentuhan' }).click();
  await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click();
  for (let slot = 0; slot < 2; slot++) await page.locator(`[data-player-slot="${slot}"]`).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  await page.clock.fastForward(3100); await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  // Allow the independent four-second idle hint to appear before clock isolation.
  await page.clock.runFor(4500); await page.evaluate(() => { window.perfCounters = {}; });
  const before = await page.locator('.race-clock').innerText(); await page.clock.runFor(2100);
  expect(await page.locator('.race-clock').innerText()).not.toBe(before);
  expect(await page.evaluate(() => window.perfCounters.render || 0)).toBe(0);
});
