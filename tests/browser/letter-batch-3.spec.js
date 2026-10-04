import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw, movePoints, openTeacher, menuAction, showDotHelp } from './helpers/tracing.js';

const ids = ['ta-marbuta', 'tho', 'za', 'ain', 'ghain', 'nga', 'fa', 'pa', 'qaf', 'ga', 'va', 'ha', 'hamzah', 'ye', 'nya'];
const batch = letters.filter(letter => ids.includes(letter.id));
const lastRecord = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
const attemptCount = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts.length);

async function openBatchLesson(page, letter, mode = 'play', adultPreview = mode !== 'play') {
  await page.goto('/'); await dismissSplash(page);
  if (adultPreview) {
    await openTeacher(page);
    await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
    await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
  } else await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: letter.labelMs, exact: true }).click();
  if (adultPreview) await expect(page.locator('.preview-banner')).toContainText('37 model huruf');
  else await expect(page.locator('.preview-banner')).toHaveCount(0);
  await expect(page.locator('.lesson-pilot')).not.toContainText('Draf');
  await expect(page.locator('.start-dot')).toBeVisible();
}

for (const mode of ['play', 'guided', 'precision']) for (const letter of batch) {
  test(`${letter.id}: ${mode} completes every approved movement and dot`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openBatchLesson(page, letter, mode);
    for (const [i] of letter.geometry.strokes.entries()) {
      await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `stroke-${i + 1}`);
      expect(await attemptCount(page)).toBe(0);
      await draw(page, (await boardModels(page)).strokes[i]);
    }
    for (const [i] of letter.geometry.dotTargets.entries()) {
      await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `dot-${i + 1}`);
      expect(await attemptCount(page)).toBe(0);
      const dot = (await boardModels(page)).dots[i];
      await page.mouse.click(dot.x, dot.y);
    }
    await expect(page.getByRole('heading', { name: mode === 'play' ? `Kamu sudah ikut huruf ${letter.labelMs}!` : 'Bagus, kamu sudah cuba!', exact: true })).toBeVisible();
    const attempt = await lastRecord(page);
    expect(attempt).toMatchObject({ letterId: letter.id, preview: mode !== 'play', mode, contentVersion: 2, geometryStatus: 'approved', audioStatus: 'approved' });
    expect(attempt.metrics.dotCount).toBe(letter.geometry.dotTargets.length);
    expect(attempt.metrics.coverage).toBeGreaterThanOrEqual(mode === 'precision' ? .99 : mode === 'guided' ? .98 : .95);
  });
}

test('all 37 models are student-ready and teacher review has no authored drafts', async ({ page }) => {
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  await expect(page.locator('.letter-card')).toHaveCount(37);
  await expect(page.locator('.letter-card:disabled')).toHaveCount(0);
  for (const letter of batch) await expect(page.getByRole('button', { name: letter.labelMs, exact: true })).toBeEnabled();
  await openTeacher(page);
  await expect(page.locator('.draft-model-card')).toHaveCount(0);
  await expect(page.locator('.teacher-stat-grid > div').nth(1)).toContainText('37');
  await expect(page.locator('.teacher-stat-grid > div').nth(2)).toContainText('37');
  await expect(page.locator('.status-chip.approved')).toHaveCount(37);
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  await expect(page.locator('.card-caption').filter({ hasText: 'Draf · perlu semakan' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tamatkan pratonton', exact: true }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
});

test('Qaf requires the complete closed head, then its bowl, then both separate dots', async ({ page }) => {
  await openBatchLesson(page, batch.find(letter => letter.id === 'qaf'));
  let model = await boardModels(page);
  await draw(page, model.strokes[1]);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'stroke-1');
  await menuAction(page, 'Cuba lagi');
  model = await boardModels(page);
  const head = model.strokes[0], split = Math.ceil(head.length * .65);
  const badge = number => page.locator(`.trace-number-guide[data-number="${number}"] .trace-number-badge`);
  await expect(badge(1)).toHaveCount(1); await expect(badge(3)).toHaveCount(0);
  await page.mouse.move(head[0].x, head[0].y); await page.mouse.down();
  await movePoints(page, head.slice(1, split));
  await expect(badge(1)).toHaveCount(0); await expect(badge(3)).toHaveCount(1);
  await movePoints(page, head.slice(split)); await page.mouse.up();
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'stroke-2');
  await draw(page, (await boardModels(page)).strokes[1]);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'dot-1');
  await showDotHelp(page);
  await page.getByRole('button', { name: 'Tambah titik 1 daripada 2', exact: true }).click();
  expect(await attemptCount(page)).toBe(0);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'dot-2');
  await page.getByRole('button', { name: 'Tambah titik 2 daripada 2', exact: true }).click();
  expect((await lastRecord(page)).metrics.dotCount).toBe(2);
});

test('student book includes Ye and Nya and closes after Nya without wrapping', async ({ page }) => {
  await openBatchLesson(page, batch.find(letter => letter.id === 'nya'));
  await draw(page, (await boardModels(page)).strokes[0]);
  await showDotHelp(page);
  for (let i = 1; i <= 3; i++) await page.getByRole('button', { name: `Tambah titik ${i} daripada 3`, exact: true }).click();
  await menuAction(page, 'Huruf seterusnya');
  await expect(page.getByRole('heading', { name: 'Hebat, sampai halaman terakhir!', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Huruf seterusnya', exact: true })).toBeDisabled();
  await openBatchLesson(page, batch.find(letter => letter.id === 'ye'));
  await draw(page, (await boardModels(page)).strokes[0]);
  await menuAction(page, 'Huruf seterusnya');
  await expect(page.getByRole('heading', { name: 'Nya', exact: true })).toBeVisible();
  await expect(page.locator('.lesson-pilot')).not.toContainText('Draf');
  await expect(page.locator('.preview-banner')).toHaveCount(0);
  expect(await lastRecord(page)).toMatchObject({ letterId: 'ye', preview: false, geometryStatus: 'approved', contentVersion: 2 });
});

for (const width of [320, 768]) test(`all 15 final-batch stroke and dot stages fit the ${width} layout`, async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const letter of batch) {
    await openBatchLesson(page, letter);
    await page.evaluate(() => document.fonts.ready);
    const check = async () => {
      await page.locator('.trace-board').scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const layout = await page.locator('.play-board').evaluate(board => {
        const bounds = board.querySelector('.trace-board').getBoundingClientRect();
        const guides = [...board.querySelectorAll('.trace-number-badge, .trace-number-label-backdrop')].map(node => ({
          bounds: node.getBoundingClientRect().toJSON(), badge: node.classList.contains('trace-number-badge'),
        }));
        const rewards = [...board.querySelectorAll('.leaf-friend, .flower-burst')].filter(node => Number(getComputedStyle(node).opacity) > 0).map(node => node.getBoundingClientRect());
        const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        return { contained: guides.every(({ bounds: b }) => b.left >= bounds.left && b.right <= bounds.right && b.top >= bounds.top && b.bottom <= bounds.bottom),
          minBadge: Math.min(...guides.filter(g => g.badge).map(g => g.bounds.width)),
          rewardOverlap: guides.some(g => rewards.some(r => overlaps(g.bounds, r))),
          labelOverlap: guides.filter(g => !g.badge).some((g, i, labels) => labels.slice(i + 1).some(other => overlaps(g.bounds, other.bounds))),
        };
      });
      expect(layout.contained, `${letter.id} guides at ${width}`).toBe(true);
      expect(layout.minBadge).toBeGreaterThanOrEqual(35.9);
      expect(layout.rewardOverlap, `${letter.id} reward at ${width}`).toBe(false);
      expect(layout.labelOverlap, `${letter.id} labels at ${width}`).toBe(false);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    };
    for (const [i] of letter.geometry.strokes.entries()) { await check(); await draw(page, (await boardModels(page)).strokes[i]); }
    if (letter.geometry.dotTargets.length) await showDotHelp(page);
    for (const [i] of letter.geometry.dotTargets.entries()) {
      await check(); await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${letter.geometry.dotTargets.length}`, exact: true }).click();
    }
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
  }
});

for (const width of [320, 768]) for (const id of ['nga', 'qaf']) test(`${id} completes with native touch at ${width}`, async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native emulated touch uses Chromium CDP.');
  const context = await browser.newContext({ viewport: { width, height: width === 320 ? 740 : 1024 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  try {
    const page = await context.newPage(), session = await context.newCDPSession(page), letter = batch.find(letter => letter.id === id);
    await openBatchLesson(page, letter);
    for (const [i] of letter.geometry.strokes.entries()) {
      const points = (await boardModels(page)).strokes[i];
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...points[0], id: 1 }] });
      for (const point of points.slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, id: 1 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    for (const [i] of letter.geometry.dotTargets.entries()) {
      const dot = (await boardModels(page)).dots[i];
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...dot, id: 1 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    expect(await lastRecord(page)).toMatchObject({ pointerType: 'touch', preview: false, geometryStatus: 'approved', metrics: { dotCount: letter.geometry.dotTargets.length, equivalentDotActions: 0 } });
  } finally { await context.close(); }
});
