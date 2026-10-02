import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw, movePoints } from './helpers/tracing.js';

const ids = ['zal', 'zai', 'syin', 'sad', 'dad'];
const batch = letters.filter(letter => ids.includes(letter.id));
const modelCount = letters.filter(letter => letter.geometry.strokes.length).length;
const draftCount = letters.filter(letter => letter.geometry.strokes.length && letter.geometry.status !== 'approved').length;
const lastRecord = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));

async function openBatchLesson(page, letter, mode = 'play') {
  await page.goto('/'); await dismissSplash(page);
  if (mode === 'play') {
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
    await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
  }
  await page.getByRole('button', { name: new RegExp(`^${letter.labelMs}(?:, pernah dijejak)?$`) }).click();
  await expect(page.locator('.start-dot')).toBeVisible();
  if (mode === 'play') await expect(page.locator('.preview-banner')).toHaveCount(0);
  else await expect(page.locator('.preview-banner')).toContainText(`${modelCount} model huruf`);
  await expect(page.locator('.lesson-pilot')).not.toContainText('Draf');
}

for (const mode of ['play', 'guided', 'precision']) for (const letter of batch) {
  test(`${letter.id}: ${mode} completes each approved movement and required dot`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openBatchLesson(page, letter, mode);
    const model = await boardModels(page);
    for (const [i, stroke] of model.strokes.entries()) {
      await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `stroke-${i + 1}`);
      await draw(page, stroke);
      if (i < model.strokes.length - 1 || model.dots.length) await expect(page.locator('.trace-board')).toBeVisible();
    }
    for (const [i, dot] of model.dots.entries()) {
      await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `dot-${i + 1}`);
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts.length)).toBe(0);
      await page.mouse.click(dot.x, dot.y);
    }
    await expect(page.getByRole('heading', { name: mode === 'play' ? `Kamu sudah ikut huruf ${letter.labelMs}!` : 'Bagus, kamu sudah cuba!', exact: true })).toBeVisible();
    const attempt = await lastRecord(page);
    expect(attempt).toMatchObject({ letterId: letter.id, preview: mode !== 'play', mode, contentVersion: 2, geometryStatus: 'approved', audioStatus: 'approved' });
    expect(attempt.metrics.dotCount).toBe(model.dots.length);
    expect(attempt.metrics.coverage).toBeGreaterThanOrEqual(mode === 'precision' ? .99 : mode === 'guided' ? .98 : .95);
  });
}

test('all 37 approved lessons are available without authored drafts', async ({ page }) => {
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  await expect(page.locator('.letter-card:disabled')).toHaveCount(0);
  for (const letter of batch) await expect(page.getByRole('button', { name: letter.labelMs, exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await expect(page.locator('.draft-model-card')).toHaveCount(draftCount);
  await expect(page.locator('.teacher-stat-grid > div').nth(1)).toContainText(String(modelCount));
  await expect(page.locator('.teacher-stat-grid > div').nth(2)).toContainText('37');
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(modelCount);
  await expect(page.locator('.card-caption').filter({ hasText: 'Draf · perlu semakan' })).toHaveCount(draftCount);
  await page.getByRole('button', { name: 'Tamatkan pratonton', exact: true }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
});

test('Sad requires its head loop before the bowl, and shared-point numbers change after the loop and lift', async ({ page }) => {
  await openBatchLesson(page, batch.find(letter => letter.id === 'sad'));
  let model = await boardModels(page);
  // Starting at the shared join does not allow a shortcut directly into the bowl.
  await draw(page, model.strokes[1]);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'stroke-1');
  await page.getByRole('button', { name: 'Cuba lagi', exact: true }).click();
  model = await boardModels(page);
  const head = model.strokes[0], split = Math.ceil(head.length * .65);
  const badge = number => page.locator(`.trace-number-guide[data-number="${number}"] .trace-number-badge`);
  await expect(badge(1)).toHaveCount(1); await expect(badge(3)).toHaveCount(0);
  await page.mouse.move(head[0].x, head[0].y); await page.mouse.down();
  await movePoints(page, head.slice(1, split));
  await expect(badge(1)).toHaveCount(0); await expect(badge(3)).toHaveCount(1);
  await movePoints(page, head.slice(split));
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'stroke-1');
  await page.mouse.up();
  await expect(page.locator('.trace-number-label')).toHaveText(['4 Mula', '5 Ikut', '6 Siap']);
  await draw(page, model.strokes[1]);
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Sad!', exact: true })).toBeVisible();
});

test('student next-letter action includes approved Syin and Sad', async ({ page }) => {
  await openBatchLesson(page, batch.find(letter => letter.id === 'syin'));
  let model = await boardModels(page);
  await draw(page, model.strokes[0]);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada 3`, exact: true }).click();
  await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sad', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Taman huruf', exact: true }).click();
  await page.getByRole('button', { name: 'Sin', exact: true }).click();
  model = await boardModels(page); await draw(page, model.strokes[0]);
  await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Syin', exact: true })).toBeVisible();
  expect(await lastRecord(page)).toMatchObject({ letterId: 'sin', preview: false, geometryStatus: 'approved' });
});

test('all new stroke and dot guides remain readable and contained at phone and tablet sizes', async ({ page }) => {
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
        const obscured = await page.locator('.play-board').evaluate(board => {
          const decorations = [...board.querySelectorAll('.leaf-friend, .flower-burst')].filter(node => Number(getComputedStyle(node).opacity) > 0).map(node => node.getBoundingClientRect());
          const guides = [...board.querySelectorAll('.trace-number-label-backdrop, .trace-number-badge')].map(node => node.getBoundingClientRect());
          return guides.some(a => decorations.some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top));
        });
        expect(obscured, `${letter.id} guide overlaps the reward at ${width}`).toBe(false);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      };
      const model = await boardModels(page);
      for (const stroke of model.strokes) { await check(); await draw(page, stroke); }
      for (const [i] of model.dots.entries()) {
        await check(); await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${model.dots.length}`, exact: true }).click();
      }
      await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    }
  }
});

for (const width of [320, 768]) test(`Dad completes its loop, bowl and separate dot with native touch at ${width}`, async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native emulated touch is dispatched through Chromium CDP.');
  const context = await browser.newContext({ viewport: { width, height: width === 320 ? 740 : 1024 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  try {
    const page = await context.newPage(), session = await context.newCDPSession(page);
    await openBatchLesson(page, batch.find(letter => letter.id === 'dad'));
    const model = await boardModels(page);
    for (const points of model.strokes) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...points[0], id: 1 }] });
      for (const p of points.slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...p, id: 1 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    await expect(page.locator('.trace-number-label')).toHaveText(['7 Siap']);
    await page.getByRole('button', { name: 'Tambah titik 1 daripada 1', exact: true }).tap();
    await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Dad!', exact: true })).toBeVisible();
    expect(await lastRecord(page)).toMatchObject({ pointerType: 'touch', preview: false, geometryStatus: 'approved', metrics: { dotCount: 1, equivalentDotActions: 1 } });
  } finally { await context.close(); }
});
