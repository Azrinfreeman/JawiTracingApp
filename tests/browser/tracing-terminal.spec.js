import { expect } from '@playwright/test';
import { test } from './helpers/localTest.js';
import { mkdirSync } from 'node:fs';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { openLesson, boardModels, draw, movePoints, menuAction, showDotHelp } from './helpers/tracing.js';
import { chooseLetter } from './helpers/navigation.js';
import { treatAllModelsAsReady } from './helpers/readyCatalogue.js';
// Mechanics spec: every authored model is served as student-ready; the real gate is covered elsewhere.
test.beforeEach(async ({ context }) => { await treatAllModelsAsReady(context); });

const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/tracing-completion';
mkdirSync(evidence, { recursive: true });
const complete = page => page.locator('.book-completed');
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function exactPoints(page, fractions) {
  await settle(page);
  return page.locator('.reference-stroke').first().evaluate((path, fractions) => fractions.map(f => {
    const p = path.getPointAtLength(path.getTotalLength() * f), q = new DOMPoint(p.x, p.y).matrixTransform(path.getScreenCTM());
    return { x: q.x, y: q.y };
  }), fractions);
}
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts);
async function preciseGesture(page, points, release = true) {
  await page.locator('.trace-board').evaluate(async (svg, { points, release }) => {
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const send = (type, p) => svg.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 27, pointerType: 'touch', clientX: p.x, clientY: p.y }));
    send('pointerdown', points[0]);
    for (let i = 1; i < points.length; i++) {
      send('pointermove', points[i]); if (i % 8 === 0) await new Promise(requestAnimationFrame);
    }
    if (release) send('pointerup', points.at(-1));
  }, { points, release });
}

for (const [width, height] of [[320, 740], [390, 844], [1024, 768], [768, 1024], [1920, 1080], [3840, 2160]]) {
  test(`Alif 94% recovery, held readiness and single release ${width}x${height}`, async ({ page, browserName }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height }); await openLesson(page, 'Alif', 'play');
    const fit = await page.locator('.trace-board').getAttribute('viewBox');
    await draw(page, await exactPoints(page, Array.from({ length: 95 }, (_, i) => i / 100)));
    await expect(page.locator('.board-tip')).toHaveText('Sambung dari anak panah hingga 3.');
    const saved = Number(await page.locator('.play-fill').getAttribute('data-measured-frontier'));
    await expect(page.locator('.trace-number-guide--stop')).toHaveClass(/is-destination/);
    await expect(page.locator('.terminal-resume-cue')).toBeVisible();
    await page.screenshot({ path: `${evidence}/${browserName}-${width}-alif-94.png`, animations: 'disabled' });
    // Captures may affect layout: always compute fresh screen points afterwards.
    const [end] = await exactPoints(page, [1]);
    for (let i = 0; i < 3; i++) await page.mouse.click(end.x, end.y);
    await settle(page);
    expect(Number(await page.locator('.play-fill').getAttribute('data-measured-frontier'))).toBe(saved);
    expect(await attempts(page)).toHaveLength(0);
    const [frontier, ready] = await exactPoints(page, [.94, .97]);
    await page.mouse.move(frontier.x, frontier.y); await page.mouse.down(); await page.mouse.move(ready.x, ready.y);
    await expect(page.locator('.board-tip')).toHaveText('Angkat jari untuk siap.');
    await expect(page.locator('.trace-number-guide--stop')).toHaveClass(/is-ready/);
    expect(await attempts(page)).toHaveLength(0);
    await page.screenshot({ path: `${evidence}/${browserName}-${width}-alif-ready.png`, animations: 'disabled' });
    await page.mouse.up(); await expect(complete(page)).toBeVisible(); expect(await attempts(page)).toHaveLength(1);
    expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(fit);
    expect(await page.evaluate(() => ({ x: scrollX, y: scrollY, w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }))).toEqual({ x: 0, y: 0, w: width, h: height });
    await page.screenshot({ path: `${evidence}/${browserName}-${width}-alif-complete.png`, animations: 'disabled' });
  });
}

test('actual up movement completes; coalesced order and empty fallback are preserved', async ({ page }) => {
  await openLesson(page, 'Alif', 'play');
  const [start, early, end] = await exactPoints(page, [0, .94, .96]);
  await draw(page, await exactPoints(page, Array.from({ length: 95 }, (_, i) => i / 100)));
  await page.locator('.trace-board').evaluate((svg, { early, end }) => {
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const dispatch = (type, p) => svg.dispatchEvent(new PointerEvent(type, { pointerId: 21, pointerType: 'touch', bubbles: true, clientX: p.x, clientY: p.y }));
    dispatch('pointerdown', early); dispatch('pointerup', end);
    dispatch('lostpointercapture', end);
  }, { early, end });
  await expect(complete(page)).toBeVisible(); expect(await attempts(page)).toHaveLength(1);
  await page.getByRole('button', { name: 'Main lagi', exact: true }).click();
  const points = await exactPoints(page, Array.from({ length: 101 }, (_, i) => i / 100));
  await page.locator('.trace-board').evaluate(async (svg, points) => {
    const dispatch = (type, p, samples) => {
      const e = new PointerEvent(type, { pointerId: 22, pointerType: 'pen', bubbles: true, clientX: p.x, clientY: p.y });
      if (samples) Object.defineProperty(e, 'getCoalescedEvents', { value: () => samples.map(q => new PointerEvent('pointermove', { clientX: q.x, clientY: q.y, pointerType: 'pen' })) });
      svg.dispatchEvent(e);
    };
    dispatch('pointerdown', points[0]);
    for (let i = 1; i < points.length; i += 4) {
      const batch = points.slice(i, i + 4); dispatch('pointermove', batch.at(-1), batch);
      await new Promise(requestAnimationFrame);
    }
    dispatch('pointermove', points.at(-1), []); dispatch('pointerup', points.at(-1));
  }, points);
  await expect(complete(page)).toBeVisible(); expect(await attempts(page)).toHaveLength(2);
});

test('native CDP touch recovers the remaining Alif tail', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native emulated touch requires Chromium CDP');
  await page.setViewportSize({ width: 390, height: 844 }); await openLesson(page, 'Alif', 'play');
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const touch = (type, points) => session.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(p => ({ ...p, id: 1 })) });
  const points = await exactPoints(page, Array.from({ length: 95 }, (_, i) => i / 100));
  await touch('touchStart', [points[0]]); for (const p of points.slice(1)) await touch('touchMove', [p]); await touch('touchEnd', []);
  await expect(page.locator('.board-tip')).toHaveText('Sambung dari anak panah hingga 3.');
  const [frontier, end] = await exactPoints(page, [.94, 1]);
  await touch('touchStart', [frontier]); await touch('touchMove', [end]); await touch('touchEnd', []);
  await expect(complete(page)).toBeVisible(); expect(await attempts(page)).toHaveLength(1);
});

test('non-final Ba, Qaf head loop and Ga bodies ask for a lift before the next part', async ({ page, browserName }) => {
  test.setTimeout(90000); await page.setViewportSize({ width: 768, height: 1024 });
  for (const label of ['Ba', 'Qaf', 'Ga']) {
    await openLesson(page, label, 'play');
    // Exact touch fixture: native mouse rounding can legitimately cross 95%.
    await preciseGesture(page, await exactPoints(page, Array.from({ length: 95 }, (_, i) => i / 100)));
    await expect(page.locator('.terminal-resume-cue')).toBeVisible();
    await page.screenshot({ path: `${evidence}/${browserName}-${label}-remaining.png`, animations: 'disabled' });
    const points = await exactPoints(page, [.94, .96, .98]);
    await preciseGesture(page, points, false);
    await expect(page.locator('.board-tip')).toHaveText('Angkat jari untuk bahagian seterusnya.');
    await page.screenshot({ path: `${evidence}/${browserName}-${label}-ready.png`, animations: 'disabled' });
    await page.locator('.trace-board').evaluate((svg, p) => svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 27, pointerType: 'touch', clientX: p.x, clientY: p.y })), points.at(-1));
    await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', label === 'Qaf' ? 'stroke-2' : 'dot-1');
    await expect(complete(page)).toHaveCount(0);
    await page.screenshot({ path: `${evidence}/${browserName}-${label}-next-part.png`, animations: 'disabled' });
  }
});

test('all 36 authored models retain valid play sequences and separate dots', async ({ page }) => {
  test.setTimeout(360000); await page.setViewportSize({ width: 1024, height: 768 });
  await openLesson(page, 'Alif', 'play');
  for (const [index, letter] of letters.entries()) {
    if (index) { await menuAction(page, 'Isi kandungan'); await chooseLetter(page, letter.labelMs); }
    await page.locator('.trace-board').evaluate(async (svg, strokes) => {
      svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
      const send = (type, p) => svg.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 41, pointerType: 'pen', clientX: p.x, clientY: p.y }));
      for (const points of strokes) {
        send('pointerdown', points[0]);
        for (let i = 1; i < points.length; i++) {
          send('pointermove', points[i]);
          if (i % 16 === 0) await new Promise(requestAnimationFrame);
        }
        send('pointerup', points.at(-1)); await new Promise(requestAnimationFrame);
      }
    }, (await boardModels(page)).strokes);
    if (letter.geometry.dotTargets.length) {
      await expect(complete(page)).toHaveCount(0);
      await showDotHelp(page);
      for (let i = 0; i < letter.geometry.dotTargets.length; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${letter.geometry.dotTargets.length}` }).click();
    }
    await expect(complete(page), letter.id).toBeVisible();
    expect((await attempts(page)).at(-1)).toMatchObject({ letterId: letter.id, contentVersion: letter.contentVersion, outcome: 'playComplete' });
  }
});
