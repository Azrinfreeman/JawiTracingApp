import { expect } from '@playwright/test';
import { test } from './helpers/localTest.js';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { dismissSplash, chooseLetter } from './helpers/navigation.js';
import { boardModels, draw, openTeacher, menuAction, openMenu, tapDots } from './helpers/tracing.js';
import { validateLetter } from '../../src/content/validateContent.js';
const eligibleLetters = letters.filter(letter => validateLetter(letter).ready);
const eligibleLessons = eligibleLetters.length;

const menuButton = page => page.getByRole('button', { name: 'Menu permainan', exact: true });
const turn = page => page.getByRole('dialog', { name: 'Menu permainan' });
async function open(page, name = 'Alif') {
  await page.goto('/'); await dismissSplash(page); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await chooseLetter(page, name);
  await expect(page.locator('.trace-board')).toBeVisible(); await expect(menuButton(page)).toBeEnabled();
}
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts);
async function complete(page) {
  const model = await boardModels(page); for (const stroke of model.strokes) await draw(page, stroke);
  await tapDots(page);
}

test('turns deliberately, ignores rapid duplicate navigation and stops at the end', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  const shell = await page.locator('.book-cover').elementHandle();
  await openMenu(page); await expect(turn(page).getByRole('button', { name: 'Huruf sebelumnya', exact: true })).toBeDisabled();
  await turn(page).getByRole('button', { name: 'Huruf seterusnya', exact: true }).click();
  await expect(page.locator('.book-fold')).toBeVisible();
  // While the page is turning the tools cannot reopen, so a duplicate request has no target.
  await expect(menuButton(page)).toBeDisabled(); await menuButton(page).dispatchEvent('click');
  await expect(turn(page)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  expect(await shell.evaluate(node => node.isConnected)).toBe(true); expect(await attempts(page)).toHaveLength(0);
  await menuAction(page, 'Huruf sebelumnya'); await expect(page.getByRole('heading', { name: 'Alif', exact: true })).toBeVisible();
  await menuAction(page, 'Isi kandungan'); await chooseLetter(page, eligibleLetters.at(-1).labelMs);
  await expect(menuButton(page)).toBeEnabled();
  await menuAction(page, 'Huruf seterusnya'); await expect(page.getByRole('heading', { name: 'Hebat, sampai halaman terakhir!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Huruf seterusnya', exact: true })).toBeDisabled();
  await expect(page.locator('.book-end')).toContainText(`0 daripada ${eligibleLessons}`);
  await page.getByRole('button', { name: 'Main lagi', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Alif', exact: true })).toBeVisible();
});

test('freezes completed writing in place and saves once; revisiting is a new attempt', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 1024, height: 768 }); await open(page, 'Sa');
  const documentBox = node => { const box = node.getBoundingClientRect(); return { x: box.x + scrollX, y: box.y + scrollY }; };
  const board = await page.locator('.trace-board').elementHandle(), before = await page.locator('.trace-board').evaluate(documentBox);
  await complete(page); await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Sa!' })).toBeVisible();
  const after = await page.locator('.trace-board').evaluate(documentBox); expect(after.x).toBeCloseTo(before.x, 1); expect(after.y).toBeCloseTo(before.y, 1);
  expect(await board.evaluate(node => node.isConnected)).toBe(true); expect(await attempts(page)).toHaveLength(1);
  await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Sin', exact: true })).toBeVisible();
  await menuAction(page, 'Huruf sebelumnya'); await expect(page.getByRole('heading', { name: 'Sa', exact: true })).toBeVisible();
  await expect(page.getByLabel('Siap dijejak', { exact: true })).toBeVisible(); expect(await attempts(page)).toHaveLength(1);
  expect(await page.locator('.play-fill').count()).toBe(0);
});

test('the tools cancel a held contact and a demonstration; a turn then proceeds once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page, 'Ba');
  const model = await boardModels(page), first = model.strokes[0][0]; await page.mouse.move(first.x, first.y); await page.mouse.down();
  await menuButton(page).dispatchEvent('click'); await expect(turn(page)).toBeVisible();
  await page.mouse.up(); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Tutup', exact: true }).click();
  await expect(page.locator('.play-fill')).toHaveCount(0); expect(await attempts(page)).toHaveLength(0);
  await menuAction(page, 'Tunjuk cara'); await expect(page.locator('.demonstration-ink').first()).toBeVisible();
  await menuButton(page).click(); await expect(page.locator('.demonstration-ink')).toHaveCount(0);
  expect(await attempts(page)).toHaveLength(0);
  await turn(page).getByRole('button', { name: 'Huruf seterusnya', exact: true }).click(); await page.setViewportSize({ width: 1000, height: 760 });
  await expect(page.getByRole('heading', { name: 'Ta', exact: true })).toBeVisible(); await expect(page.locator('.book-fold')).toHaveCount(0);
});

test('copy exit offers save, discard and return without silently losing ink', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page); await complete(page);
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
  await expect(menuButton(page)).toBeEnabled();
  const box = await page.locator('.trace-board').boundingBox(); await draw(page, [{ x: box.x + 50, y: box.y + 50 }, { x: box.x + 100, y: box.y + 120 }]);
  await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await menuAction(page, 'Huruf seterusnya'); await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible();
  await page.getByRole('button', { name: 'Kembali', exact: true }).click(); await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await openTeacher(page); await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible();
  await page.getByRole('button', { name: 'Simpan', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Ruang guru', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.length)).toBe(1);
});

test('filtered contents and missing animation events keep one destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await menuAction(page, 'Isi kandungan');
  await page.getByRole('button', { name: 'Huruf permulaan', exact: true }).click();
  const last = page.locator('.letter-card:enabled').last(), name = await last.getAttribute('aria-label'); await last.click();
  await expect(menuButton(page)).toBeEnabled();
  await page.addStyleTag({ content: '.book-fold { animation: none !important; }' });
  await menuAction(page, 'Huruf seterusnya');
  await expect(page.locator('.book-end')).toBeVisible(); expect(await attempts(page)).toHaveLength(0);
  // The closing page keeps the labelled book navigation and its keyboard shortcuts.
  await page.getByRole('button', { name: 'Huruf sebelumnya', exact: true }).focus(); await page.keyboard.press('PageUp');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible(); await expect(page.locator('.book-fold')).toHaveCount(0);
  await expect(page.getByRole('heading', { name, exact: true })).toBeFocused();
});

test('discarding an unsaved copy is deliberate and preview exit uses the same guard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await dismissSplash(page);
  await openTeacher(page); await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.getByRole('button', { name: 'Alif', exact: true }).click(); await expect(menuButton(page)).toBeEnabled();
  await complete(page); await expect(page.locator('.book-completion')).toBeVisible(); await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
  await expect(menuButton(page)).toBeEnabled();
  const box = await page.locator('.trace-board').boundingBox();
  await draw(page, [{ x: box.x + 40, y: box.y + 50 }, { x: box.x + 80, y: box.y + 100 }]); await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tamatkan pratonton', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tamatkan pratonton', exact: true }).click(); await page.getByRole('button', { name: 'Keluar tanpa simpan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Jom mula', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.length)).toBe(0);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await page.getByRole('button', { name: 'Alif', exact: true }).click();
  await expect(page.locator('.book-sticker.earned')).toHaveCount(0);
});

for (const [width, height, density] of [[768, 1024, 2], [390, 844, 3]]) test.describe(`native touch ${width} and DPR ${density}`, () => {
  test.use({ viewport: {width,height}, deviceScaleFactor: density, hasTouch: true, isMobile: true });
  test('native touch completion cannot activate the new choices', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native emulated touch uses Chromium CDP.');
    const session = await context.newCDPSession(page); await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page, 'Ba');
    const points = (await boardModels(page)).strokes[0];
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...points[0], id: 1 }] });
    for (const point of points.slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, id: 1 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const dot = (await boardModels(page)).dots[0]; await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...dot, id: 1 }] });
    // The final contact is still down: nothing can turn the page yet.
    await expect(page.getByRole('button', { name: 'Huruf seterusnya', exact: true })).toHaveCount(0); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('.book-completed')).toBeVisible();
    await expect(page.locator('.completion-overlay')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ba!', exact: true })).toBeVisible();
    const next = page.getByRole('button', { name: 'Huruf seterusnya', exact: true });
    // The panel appears after the release pause, so the final lift cannot press it.
    await expect(next).toBeEnabled();
    expect(await attempts(page)).toHaveLength(1); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
    await next.tap(); await expect(page.getByRole('heading', { name: 'Ta', exact: true })).toBeVisible();
    expect(await attempts(page)).toHaveLength(1);
  });
});

for (const [width, height] of [[320, 740], [390, 844], [1024, 768], [768, 1024], [1280, 720], [1920, 1080], [844, 390]]) {
  test(`stage, tools and completion fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height }); await page.emulateMedia({ reducedMotion: 'reduce' });
    if (height < 600) {
      await page.goto('/'); await dismissSplash(page);
      await expect(page.getByRole('dialog', { name: 'Besarkan ruang bermain' })).toBeVisible(); return;
    }
    await open(page, 'Nga');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await page.locator('.trace-board').boundingBox(); expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(230);
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width); expect(box.y + box.height).toBeLessThanOrEqual(height);
    const tool = await menuButton(page).boundingBox(); expect(tool.height).toBeGreaterThanOrEqual(48); expect(tool.width).toBeGreaterThanOrEqual(48);
    await openMenu(page);
    for (const button of ['Huruf sebelumnya', 'Isi kandungan']) { const b = await turn(page).getByRole('button', { name: button, exact: true }).boundingBox(); expect(b.height).toBeGreaterThanOrEqual(48); }
    await page.getByRole('button', { name: 'Tutup', exact: true }).click();
    await complete(page); await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Nga!' })).toBeVisible();
    const card = await page.locator('.completion-card').boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(0); expect(card.y).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(width); expect(card.y + card.height).toBeLessThanOrEqual(height);
  });
}
