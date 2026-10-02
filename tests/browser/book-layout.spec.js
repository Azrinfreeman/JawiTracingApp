import { test, expect } from '@playwright/test';
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw } from './helpers/tracing.js';

async function open(page, name = 'Alif') {
  await page.goto('/'); await dismissSplash(page); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(`^${name}(?:, pernah dijejak)?$`) }).click();
  await expect(page.locator('.trace-board')).toBeVisible(); await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled();
}
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts);
async function complete(page) {
  const model = await boardModels(page); for (const stroke of model.strokes) await draw(page, stroke);
  for (let i = 0; i < model.dots.length; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${model.dots.length}`, exact: true }).click();
}

test('turns deliberately, ignores rapid duplicate navigation and stops at the end', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  const shell = await page.locator('.book-cover').elementHandle();
  await expect(page.getByRole('button', { name: 'Huruf sebelumnya', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: /Huruf seterusnya/ }).click();
  await expect(page.locator('.book-fold')).toBeVisible();
  await page.getByRole('button', { name: /Huruf seterusnya/ }).dispatchEvent('click');
  await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  expect(await shell.evaluate(node => node.isConnected)).toBe(true); expect(await attempts(page)).toHaveLength(0);
  await page.getByRole('button', { name: 'Huruf sebelumnya', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Alif', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Isi kandungan', exact: true }).click(); await page.getByRole('button', { name: 'Nya', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: /Huruf seterusnya/ }).click(); await expect(page.getByRole('heading', { name: 'Hebat, sampai halaman terakhir!' })).toBeVisible();
  await expect(page.locator('.book-end')).toContainText('0 daripada 37');
  await page.getByRole('button', { name: 'Main lagi', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Alif', exact: true })).toBeVisible();
});

test('freezes completed writing in place and saves once; revisiting is a new attempt', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 1024, height: 768 }); await open(page, 'Nga');
  const documentBox = node => { const box = node.getBoundingClientRect(); return { x: box.x + scrollX, y: box.y + scrollY }; };
  const board = await page.locator('.trace-board').elementHandle(), before = await page.locator('.trace-board').evaluate(documentBox);
  await complete(page); await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Nga!' })).toBeVisible();
  const after = await page.locator('.trace-board').evaluate(documentBox); expect(after.x).toBeCloseTo(before.x, 1); expect(after.y).toBeCloseTo(before.y, 1);
  expect(await board.evaluate(node => node.isConnected)).toBe(true); expect(await attempts(page)).toHaveLength(1);
  await page.getByRole('button', { name: /Huruf seterusnya/ }).click(); await expect(page.getByRole('heading', { name: 'Fa', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Huruf sebelumnya', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Nga', exact: true })).toBeVisible();
  await expect(page.locator('.book-sticker.earned')).toContainText('Siap dijejak'); expect(await attempts(page)).toHaveLength(1);
  expect(await page.locator('.play-fill').count()).toBe(0);
});

test('held tracing and demonstrations cannot turn; interruption cannot strand a pending turn', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page, 'Ba');
  const model = await boardModels(page), first = model.strokes[0][0]; await page.mouse.move(first.x, first.y); await page.mouse.down();
  await page.getByRole('button', { name: /Huruf seterusnya/ }).dispatchEvent('click'); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  await page.mouse.up(); await page.getByRole('button', { name: 'Tunjuk cara', exact: true }).click();
  await page.getByRole('button', { name: /Huruf seterusnya/ }).dispatchEvent('click'); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tunjuk cara', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: /Huruf seterusnya/ }).click(); await page.setViewportSize({ width: 1000, height: 760 });
  await expect(page.getByRole('heading', { name: 'Ta', exact: true })).toBeVisible(); await expect(page.locator('.book-fold')).toHaveCount(0);
});

test('copy exit offers save, discard and return without silently losing ink', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page); await complete(page);
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled();
  const box = await page.locator('.trace-board').boundingBox(); await draw(page, [{ x: box.x + 50, y: box.y + 50 }, { x: box.x + 100, y: box.y + 120 }]);
  await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.getByRole('button', { name: /Huruf seterusnya/ }).click(); await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible();
  await page.getByRole('button', { name: 'Kembali', exact: true }).click(); await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible();
  await page.getByRole('button', { name: 'Simpan', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Ruang guru', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.length)).toBe(1);
});

test('filtered contents, keyboard turns and missing animation events keep one destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await page.getByRole('button', { name: 'Isi kandungan', exact: true }).click();
  await page.getByRole('button', { name: 'Huruf permulaan', exact: true }).click();
  const last = page.locator('.letter-card:enabled').last(), name = await last.getAttribute('aria-label'); await last.click();
  await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled();
  await page.addStyleTag({ content: '.book-fold { animation: none !important; }' });
  await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).focus(); await page.keyboard.press('PageDown');
  await expect(page.locator('.book-end')).toBeVisible(); expect(await attempts(page)).toHaveLength(0);
  await page.getByRole('button', { name: 'Huruf sebelumnya', exact: true }).focus(); await page.keyboard.press('PageUp');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible(); await expect(page.locator('.book-fold')).toHaveCount(0);
  await expect(page.getByRole('heading', { name, exact: true })).toBeFocused();
});

test('discarding an unsaved copy is deliberate and preview exit uses the same guard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click(); await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.getByRole('button', { name: 'Alif', exact: true }).click(); await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled();
  await complete(page); await expect(page.locator('.book-completion')).toBeVisible(); await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled();
  await page.locator('.trace-board').scrollIntoViewIfNeeded(); const box = await page.locator('.trace-board').boundingBox();
  await draw(page, [{ x: box.x + 40, y: box.y + 50 }, { x: box.x + 80, y: box.y + 100 }]); await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tamatkan pratonton', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tamatkan pratonton', exact: true }).click(); await page.getByRole('button', { name: 'Keluar tanpa simpan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Jom mula', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.length)).toBe(0);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await page.getByRole('button', { name: 'Alif', exact: true }).click();
  await expect(page.locator('.book-sticker.earned')).toHaveCount(0);
});

for (const [width, height, density] of [[768, 1024, 2], [390, 844, 3]]) test(`native touch completion needs a fresh page turn at ${width} and DPR ${density}`, async ({ browser, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'Native emulated touch uses Chromium CDP.');
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width, height }, deviceScaleFactor: density, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage(), session = await context.newCDPSession(page); await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page, 'Ba');
    const points = (await boardModels(page)).strokes[0];
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...points[0], id: 1 }] });
    for (const point of points.slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, id: 1 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const dot = (await boardModels(page)).dots[0]; await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...dot, id: 1 }] });
    await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).dispatchEvent('click'); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ba!', exact: true })).toBeVisible();
    expect(await attempts(page)).toHaveLength(1); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).tap(); await expect(page.getByRole('heading', { name: 'Ta', exact: true })).toBeVisible();
    expect(await attempts(page)).toHaveLength(1);
  } finally { await context.close(); }
});

for (const [width, height] of [[320, 740], [390, 844], [1024, 768], [768, 1024], [1280, 720], [1920, 1080], [844, 390]]) {
  test(`book, guides and labelled controls fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height }); await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page, 'Nga');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await page.locator('.trace-board').boundingBox(); expect(box.width).toBeCloseTo(box.height, 1); expect(box.width).toBeGreaterThanOrEqual(279);
    for (const button of ['Huruf sebelumnya', 'Isi kandungan']) { const b = await page.getByRole('button', { name: button, exact: true }).boundingBox(); expect(b.height).toBeGreaterThanOrEqual(48); }
    const heading = await page.locator('.book-letter-heading').boundingBox();
    if (width >= 1000 && height >= 650) expect(heading.x).toBeGreaterThan(box.x + box.width);
    else expect(heading.y + heading.height).toBeLessThanOrEqual(box.y);
    await complete(page); await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Nga!' })).toBeVisible();
  });
}
