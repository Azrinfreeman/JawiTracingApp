import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw, openTeacher, menuAction, showDotHelp } from './helpers/tracing.js';

const batchIds = ['sa', 'jim', 'ca', 'ha-pedat', 'kha'];
const batch = letters.filter(letter => batchIds.includes(letter.id));
const modelCount = letters.filter(letter => letter.geometry.strokes.length).length;
const draftCount = letters.filter(letter => letter.geometry.strokes.length && letter.geometry.status !== 'approved').length;
const record = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));

async function openBatchLesson(page, letter, mode = 'play') {
  await page.goto('/'); await dismissSplash(page);
  if (mode === 'play') {
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  } else {
    await openTeacher(page);
    await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
    await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
  }
  await page.getByRole('button', { name: new RegExp(`^${letter.labelMs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:, pernah dijejak)?$`) }).click();
  await expect(page.locator('.start-dot')).toBeVisible();
  if (mode === 'play') await expect(page.locator('.preview-banner')).toHaveCount(0);
  else await expect(page.locator('.preview-banner')).toContainText(`${modelCount} model huruf`);
  await expect(page.locator('.lesson-pilot')).not.toContainText('Draf');
}

for (const mode of ['play', 'guided', 'precision']) for (const letter of batch) {
  test(`${letter.id}: ${mode} traces the approved body and each required dot`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openBatchLesson(page, letter, mode);
    await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula', '2 Ikut', letter.geometry.dotTargets.length ? '3 Henti' : '3 Siap']);
    const model = await boardModels(page);
    for (const stroke of model.strokes) await draw(page, stroke);
    for (const [i, dot] of model.dots.entries()) {
      await expect(page.locator('.trace-board')).toBeVisible();
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts.length)).toBe(0);
      await expect(page.locator('.trace-number-label')).toHaveText([`${4 + i} ${i === model.dots.length - 1 ? 'Siap' : 'Titik'}`]);
      await page.mouse.click(dot.x, dot.y);
    }
    await expect(page.getByRole('heading', { name: mode === 'play' ? `Kamu sudah ikut huruf ${letter.labelMs}!` : 'Bagus, kamu sudah cuba!', exact: true })).toBeVisible();
    const attempt = await record(page);
    expect(attempt).toMatchObject({ letterId: letter.id, mode, preview: mode !== 'play', contentVersion: 2, geometryStatus: 'approved', audioStatus: 'approved' });
    expect(attempt.metrics.dotCount).toBe(model.dots.length);
    expect(attempt.metrics.coverage).toBeGreaterThanOrEqual(mode === 'precision' ? .99 : mode === 'guided' ? .98 : .95);
  });
}

test('all 37 approved models appear in student entry and adult preview', async ({ page }) => {
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  await expect(page.getByRole('button', { name: 'Huruf tersedia', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Model tersedia', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  await expect(page.locator('.letter-card:disabled')).toHaveCount(0);
  for (const letter of batch) await expect(page.getByRole('button', { name: letter.labelMs, exact: true })).toBeEnabled();
  await openTeacher(page);
  await expect(page.locator('.draft-model-card')).toHaveCount(draftCount);
  await expect(page.locator('.teacher-stat-grid > div').nth(1)).toContainText(String(modelCount));
  await expect(page.locator('.teacher-stat-grid > div').nth(2)).toContainText('37');
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
  await expect(page.locator('.letter-card')).toHaveCount(modelCount);
  await expect(page.locator('.letter-card:enabled')).toHaveCount(modelCount);
  await expect(page.locator('.card-caption').filter({ hasText: 'Draf · perlu semakan' })).toHaveCount(draftCount);
  await page.getByRole('button', { name: 'Tamatkan pratonton', exact: true }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  await page.getByRole('button', { name: 'Huruf permulaan', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(12);
});

test('student next-letter action continues from approved Sa to Jim', async ({ page }) => {
  await openBatchLesson(page, batch.find(l => l.id === 'sa'));
  const model = await boardModels(page);
  await draw(page, model.strokes[0]);
  await showDotHelp(page);
  for (let i = 0; i < model.dots.length; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada 3`, exact: true }).click();
  await menuAction(page, 'Huruf seterusnya');
  await expect(page.getByRole('heading', { name: 'Jim', exact: true })).toBeVisible();
  await expect(page.locator('.lesson-pilot')).not.toContainText('Draf');
  await expect(page.locator('.preview-banner')).toHaveCount(0);
});

test('every new body and dot has readable contained guide labels on phone and tablet', async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
    for (const letter of batch) {
      await openBatchLesson(page, letter);
      await page.evaluate(() => document.fonts.ready);
      const check = async () => {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const items = await page.locator('.trace-board').evaluate(svg => {
          const board = svg.getBoundingClientRect();
          return [...svg.querySelectorAll('.trace-number-badge, .trace-number-label-backdrop')].map(node => {
            const b = node.getBoundingClientRect();
            return { contained: b.left >= board.left && b.right <= board.right && b.top >= board.top && b.bottom <= board.bottom,
              badge: node.classList.contains('trace-number-badge'), width: b.width };
          });
        });
        for (const item of items) { expect(item.contained, `${letter.id} at ${width}`).toBe(true); if (item.badge) expect(item.width).toBeGreaterThanOrEqual(35.9); }
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      };
      await check();
      await draw(page, (await boardModels(page)).strokes[0]);
      if (letter.geometry.dotTargets.length) await showDotHelp(page);
      for (const [i] of letter.geometry.dotTargets.entries()) {
        await check();
        await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${letter.geometry.dotTargets.length}`, exact: true }).click();
      }
    }
  }
});

for (const width of [320, 768]) test(`Ca completes with native touch at ${width}, including three separate dot-pad actions`, async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native emulated touch is dispatched through Chromium CDP.');
  const context = await browser.newContext({ viewport: { width, height: width === 320 ? 740 : 1024 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  try {
    const page = await context.newPage(), session = await context.newCDPSession(page);
    await openBatchLesson(page, batch.find(l => l.id === 'ca'));
    const { strokes: [points] } = await boardModels(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...points[0], id: 1 }] });
    for (const point of points.slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, id: 1 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await showDotHelp(page);
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada 3`, exact: true }).tap();
    await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ca!', exact: true })).toBeVisible();
    expect(await record(page)).toMatchObject({ pointerType: 'touch', preview: false, geometryStatus: 'approved', metrics: { dotCount: 3, equivalentDotActions: 3 } });
  } finally { await context.close(); }
});
