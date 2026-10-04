import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { GLYPH_MATCHED_IDS } from '../fixtures/glyphMatched.js';
import { openLesson, boardModels, draw, movePoints, menuAction } from './helpers/tracing.js';
import { dismissSplash, chooseLetter } from './helpers/navigation.js';

const redrawn = GLYPH_MATCHED_IDS.map(id => letters.find(letter => letter.id === id));
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts);
const approved = letter => letter.geometry.status === 'approved';

async function finish(page, letter) {
  for (const [i] of letter.geometry.strokes.entries()) {
    await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `stroke-${i + 1}`);
    expect(await attempts(page)).toHaveLength(0);
    await draw(page, (await boardModels(page)).strokes[i]);
  }
  for (const [i] of letter.geometry.dotTargets.entries()) {
    await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `dot-${i + 1}`);
    expect(await attempts(page)).toHaveLength(0);
    const dot = (await boardModels(page)).dots[i];
    await page.mouse.click(dot.x, dot.y);
  }
  await expect(page.locator('.book-completed')).toBeVisible();
}
async function retry(page) { await menuAction(page, 'Cuba lagi'); await expect(page.locator('.start-dot')).toBeVisible(); }

for (const mode of ['play', 'guided', 'precision']) for (const letter of redrawn) {
  test(`${letter.id} ${mode}: every stroke and dot completes the glyph-matched model`, async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openLesson(page, letter.labelMs, mode);
    await expect(page.locator('.reference-stroke')).toHaveCount(letter.geometry.strokes.length);
    await expect(page.locator('.reference-dot')).toHaveCount(letter.geometry.dotTargets.length);
    await expect(page.locator('.trace-number-label').first()).toHaveText('1 Mula');
    const fit = await page.locator('.trace-board').getAttribute('viewBox');
    if (mode === 'play') {
      // The guide uses the authored width, so small loops stay open; matching tolerances are not tied to it.
      const widths = await page.locator('.reference-stroke').evaluateAll(nodes => nodes.map(node => node.getAttribute('stroke-width')));
      expect(widths).toEqual(letter.geometry.strokes.map(stroke => String(stroke.displayWidth ?? 76)));
    }
    await finish(page, letter);
    if (mode === 'play') {
      const fills = await page.locator('.play-fill').evaluateAll(nodes => nodes.map(node => node.getAttribute('stroke-width')));
      expect(fills).toEqual(letter.geometry.strokes.map(stroke => String(Math.round((stroke.displayWidth ?? 76) * 60 / 76))));
    }
    expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(fit);
    const record = (await attempts(page)).at(-1);
    expect(record).toMatchObject({ letterId: letter.id, mode, contentVersion: letter.contentVersion,
      geometryStatus: letter.geometry.status, audioStatus: 'approved', preview: true,
      metrics: { dotCount: letter.geometry.dotTargets.length } });
    expect(record.metrics.coverage).toBeGreaterThanOrEqual(mode === 'precision' ? .99 : mode === 'guided' ? .98 : .95);
  });
}

for (const mode of ['play', 'guided', 'precision']) for (const letter of redrawn) {
  test(`${letter.id} ${mode}: wrong start, chord shortcut, reversal, early finish and missing dots cannot complete; retry succeeds`, async ({ page }) => {
    test.setTimeout(90000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openLesson(page, letter.labelMs, mode);
    const first = async () => (await boardModels(page)).strokes[0];
    let stroke = await first();
    // Starting at the far end, or half way, is not the authored start.
    await draw(page, stroke.slice(Math.floor(stroke.length * .5)));
    expect(await attempts(page)).toHaveLength(0); await retry(page);
    // Tapping the end point alone does not finish a stroke.
    stroke = await first();
    await page.mouse.click(stroke.at(-1).x, stroke.at(-1).y);
    expect(await attempts(page)).toHaveLength(0); await retry(page);
    // A sampled straight chord across the middle skips the body of the stroke. It is only a shortcut where the
    // chord leaves the route; on a nearly straight stem the chord is the route and is a legitimate trace.
    const { scale } = await boardModels(page);
    stroke = await first();
    const mid = stroke[Math.floor(stroke.length * .5)], start = stroke[0];
    const chord = Array.from({ length: 61 }, (_, i) => ({ x: start.x + (mid.x - start.x) * i / 60, y: start.y + (mid.y - start.y) * i / 60 }));
    const leaves = Math.max(...stroke.slice(0, Math.floor(stroke.length * .5)).map(p => Math.min(...chord.map(c => Math.hypot(c.x - p.x, c.y - p.y))))) / scale;
    if (leaves > 70) {
      await draw(page, [...chord, ...stroke.slice(Math.floor(stroke.length * .5))]);
      expect(await attempts(page)).toHaveLength(0); await retry(page);
    }
    // Going out and straight back never completes.
    stroke = await first();
    const prefix = stroke.slice(0, Math.floor(stroke.length * .5));
    await draw(page, [...prefix, ...prefix.slice().reverse()]);
    expect(await attempts(page)).toHaveLength(0); await retry(page);
    // Cancellation mid-stroke cannot complete.
    stroke = await first();
    await page.mouse.move(stroke[0].x, stroke[0].y); await page.mouse.down();
    await movePoints(page, stroke.slice(1, Math.floor(stroke.length * .6)));
    await page.locator('.trace-board').dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', bubbles: true });
    await page.mouse.up(); expect(await attempts(page)).toHaveLength(0);
    await retry(page);
    // Every stroke without the dots does not complete; the dots then finish it.
    if (letter.geometry.dotTargets.length) {
      const models = await boardModels(page);
      for (const [i] of letter.geometry.strokes.entries()) await draw(page, (await boardModels(page)).strokes[i]);
      expect(await attempts(page)).toHaveLength(0);
      await expect(page.locator('.book-completed')).toHaveCount(0);
      const dots = (await boardModels(page)).dots; expect(dots).toHaveLength(models.dots.length);
      for (const dot of dots) await page.mouse.click(dot.x, dot.y);
      await expect(page.locator('.book-completed')).toBeVisible();
    } else await finish(page, letter);
  });
}

for (const letter of redrawn) {
  test(`${letter.id}: the demonstration draws the authored strokes without moving the letter`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openLesson(page, letter.labelMs, 'play');
    const fit = await page.locator('.trace-board').getAttribute('viewBox');
    await menuAction(page, 'Tunjuk cara');
    await expect(page.locator('path.demonstration-ink').first()).toBeVisible();
    const drawn = await page.locator('path.demonstration-ink').evaluateAll(paths => paths.map(path => path.getAttribute('d')));
    expect(letter.geometry.strokes.map(stroke => stroke.path)).toEqual(expect.arrayContaining([...new Set(drawn)]));
    await expect(page.locator('.demonstration-ink')).toHaveCount(0, { timeout: 15000 });
    expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(fit);
    expect(await attempts(page)).toHaveLength(0);
  });
}

// A stroke that ends where it starts shares one start/stop badge, so the numbers never stack on each other.
const closedStrokes = redrawn.flatMap(letter => letter.geometry.strokes.map((stroke, index) => ({ letter, stroke, index })))
  .filter(({ stroke }) => { const path = stroke.path.match(/-?\d+(?:\.\d+)?/g).map(Number); return Math.hypot(path[0] - path.at(-2), path[1] - path.at(-1)) < 2; });
for (const { letter, index } of closedStrokes) {
  test(`${letter.id} stroke-${index + 1}: a closed loop shows one badge at its start until the end nears`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openLesson(page, letter.labelMs, 'play');
    for (let i = 0; i < index; i++) await draw(page, (await boardModels(page)).strokes[i]);
    const guide = number => page.locator(`.trace-number-guide[data-number="${number}"]`);
    const labels = await page.locator('.trace-number-label').allTextContents();
    expect(labels).toHaveLength(3);
    const [first, , last] = labels.map(text => Number(text.split(' ')[0]));
    await expect(guide(first).locator('.trace-number-badge')).toHaveCount(1);
    await expect(guide(last).locator('.trace-number-badge')).toHaveCount(0);
  });
}

// Once the owner has approved a revision it is a student lesson: no preview banner, a real (non-preview) attempt.
const studentSample = ['qaf', 'ha', 'fa', 'hamzah', 'mim', 'wau', 'kha', 'za'].map(id => letters.find(letter => letter.id === id));
test('approved revisions fill the student catalogue', async ({ page }) => {
  const ready = letters.filter(letter => letter.geometry.status === 'approved' && letter.audio.name.status === 'approved').length;
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.garden-count')).toHaveText(`${ready} huruf untuk dikenali`);
  await expect(page.locator('.preview-banner')).toHaveCount(0);
});
for (const letter of studentSample) {
  test(`${letter.id}: a student completes the approved revision as a real attempt`, async ({ page }) => {
    test.skip(letter.geometry.status !== 'approved', 'still awaiting review');
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await chooseLetter(page, letter.labelMs);
    await expect(page.locator('.preview-banner')).toHaveCount(0);
    await expect(page.locator('.start-dot')).toBeVisible();
    await finish(page, letter);
    expect((await attempts(page)).at(-1)).toMatchObject({ letterId: letter.id, mode: 'play', preview: false, contentVersion: letter.contentVersion, geometryStatus: 'approved', audioStatus: 'approved' });
  });
}
