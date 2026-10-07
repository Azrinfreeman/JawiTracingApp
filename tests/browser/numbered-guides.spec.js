import { expect } from '@playwright/test';
import { test } from './helpers/localTest.js';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { openLesson, boardModels, draw, movePoints, openTeacher, menuAction } from './helpers/tracing.js';
import { dismissSplash, chooseLetter } from './helpers/navigation.js';
import { treatAllModelsAsReady } from './helpers/readyCatalogue.js';
// Mechanics spec: every authored model is served as student-ready; the real gate is covered elsewhere.
test.beforeEach(async ({ context }) => { await treatAllModelsAsReady(context); });

const guide = (page, number) => page.locator(`.trace-number-guide[data-number="${number}"]`);

test('Ba numbers follow the body, stop for a lift, then finish with the separately numbered dot', async ({ page }) => {
  await openLesson(page, 'Ba', 'play');
  await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula', '2 Ikut', '3 Henti']);
  const { strokes: [stroke] } = await boardModels(page);
  const badge = await guide(page, 1).locator('.trace-number-badge').boundingBox();
  // Start by touching the visible 1, rather than an invisible reference coordinate.
  await page.mouse.move(badge.x + badge.width / 2, badge.y + badge.height / 2);
  await page.mouse.down(); await movePoints(page, stroke.slice(1, 15));
  // A halfway landmark is not the next direction immediately after starting.
  await expect(page.locator('.writing-cue')).toContainText('Ikut');
  await expect(guide(page, 2)).not.toHaveClass(/is-current/);
  await movePoints(page, stroke.slice(15)); await page.mouse.up();
  await expect(page.locator('.trace-number-label')).toHaveText(['4 Titik akhir']);
  await expect(page.locator('.trace-number-instruction')).toContainText('Sentuh titik 4');
  await expect(page.locator('.trace-board')).toBeVisible();
  const dot = await guide(page, 4).locator('.trace-number-badge').boundingBox();
  await page.mouse.click(dot.x + dot.width / 2, dot.y + dot.height / 2);
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ba!', exact: true })).toBeVisible();
  const record = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record.metrics.dotCount).toBe(1); expect(record.metrics.equivalentDotActions).toBe(0);
});

test('Qaf head loop uses one badge at its shared start and stop, then advances to the tail stroke', async ({ page }) => {
  await openLesson(page, 'Qaf', 'play');
  await expect(guide(page, 1).locator('.trace-number-badge')).toHaveCount(1);
  await expect(guide(page, 3).locator('.trace-number-badge')).toHaveCount(0);
  const { strokes } = await boardModels(page), split = Math.ceil(strokes[0].length * .9);
  await page.mouse.move(strokes[0][0].x, strokes[0][0].y); await page.mouse.down();
  await movePoints(page, strokes[0].slice(1, split));
  await expect(guide(page, 1).locator('.trace-number-badge')).toHaveCount(0);
  await expect(guide(page, 3).locator('.trace-number-badge')).toHaveCount(1);
  await movePoints(page, strokes[0].slice(split)); await page.mouse.up();
  await expect(page.locator('.trace-number-label')).toHaveText(['4 Mula', '5 Ikut', '6 Henti']);
  await draw(page, strokes[1]);
  for (const dot of (await boardModels(page)).dots) await page.mouse.click(dot.x, dot.y);
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Qaf!', exact: true })).toBeVisible();
});

test('demonstrations and blank copying have no numbered touch guides', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLesson(page, 'Alif', 'guided');
  await menuAction(page, 'Lihat cara');
  await expect(page.locator('.numbered-trace-guides')).toHaveCount(0);
  await expect(page.locator('.demonstration-ink')).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula', '2 Ikut', '3 Siap']);
  await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.getByRole('heading', { name: 'Bagus, kamu sudah cuba!', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /cuba salin sendiri/ }).click();
  await expect(page.locator('.copy-board')).toBeVisible();
  await expect(page.locator('.numbered-trace-guides')).toHaveCount(0);
  await expect(page.locator('.trace-number-instruction')).toHaveCount(0);
});

test('all 12 initial guides are legible and contained on phone and tablet', async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await dismissSplash(page);
  await openTeacher(page);
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
    for (const letter of letters.filter(item => item.pilot)) {
      await chooseLetter(page, letter.labelMs);
      await expect(page.locator('.numbered-trace-guides')).toBeVisible();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const measurements = await page.locator('.trace-board').evaluate(svg => {
        const board = svg.getBoundingClientRect();
        return [...svg.querySelectorAll('.trace-number-badge, .trace-number-label-backdrop')].map(node => {
          const box = node.getBoundingClientRect();
          return { contained: box.left >= board.left && box.right <= board.right && box.top >= board.top && box.bottom <= board.bottom,
            badge: node.classList.contains('trace-number-badge'), width: box.width };
        });
      });
      expect(measurements.length, letter.id).toBeGreaterThan(0);
      for (const item of measurements) { expect(item.contained, `${width}: ${letter.id}`).toBe(true); if (item.badge) expect(item.width).toBeGreaterThanOrEqual(35.9); }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), letter.id).toBe(false);
      expect(await page.locator('.numbered-trace-guides').evaluate(node => getComputedStyle(node).pointerEvents)).toBe('none');
      await menuAction(page, 'Isi kandungan');
    }
  }
});
