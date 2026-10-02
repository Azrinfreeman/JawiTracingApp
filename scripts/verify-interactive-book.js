import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';
const directory = 'output/verification/interactive-book'; mkdirSync(`${directory}/screens`, { recursive: true });
const baseline = JSON.parse(readFileSync(`${directory}/protected-before.json`, 'utf8').replace(/^\uFEFF/, ''));
for (const [file, value] of Object.entries(baseline)) expect(createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase(), file).toBe(value);
const report = { date: new Date().toISOString(), baseURL: process.env.JAWI_BOOK_URL || 'http://127.0.0.1:4173', protectedFilesUnchanged: Object.keys(baseline).length, screenshots: [], viewports: [], errors: [], checks: [] };
const browser = await chromium.launch();
try {
  report.browser = browser.version(); const page = await browser.newPage({ baseURL: report.baseURL }); page.on('pageerror', error => report.errors.push(error.message));
  report.build = (await (await page.request.get('/')).text()).match(/(?:\/assets\/index-[^" ]+\.js|\/src\/main.jsx)/)[0];
  async function capture(name) { await page.evaluate(() => document.fonts.ready); const path = `${directory}/screens/${name}.png`; await page.screenshot({ path, fullPage: true, animations: 'disabled' }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name).toBe(true); report.screenshots.push(path); }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [[320, 740], [390, 844], [1024, 768], [768, 1024], [1280, 720], [1920, 1080], [844, 390]]) {
    const suffix = `${width}x${height}`; await page.setViewportSize({ width, height }); await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await capture(`contents-${suffix}`);
    await page.getByRole('button', { name: /^Nga(?:, pernah dijejak)?$/ }).click(); await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled(); await capture(`nga-start-${suffix}`);
    const before = await page.locator('.trace-board').boundingBox(), model = await boardModels(page);
    for (const stroke of model.strokes) await draw(page, stroke); await capture(`nga-dots-${suffix}`);
    for (let i = 0; i < model.dots.length; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${model.dots.length}` }).click();
    await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Nga!' })).toBeVisible(); await capture(`nga-complete-${suffix}`);
    expect(await page.locator('.trace-board').getAttribute('data-phase')).toBe('complete');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1)); expect(saved).toMatchObject({ letterId: 'nga', preview: false, mode: 'play', outcome: 'playComplete' });
    await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Fa', exact: true })).toBeVisible(); await capture(`next-page-${suffix}`);
    report.viewports.push({ width, height, writingWidth: before.width, completion: saved.id });
  }
  await page.setViewportSize({ width: 1280, height: 900 }); await page.goto('/'); await dismissSplash(page); await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await page.getByRole('button', { name: /^Nya(?:, pernah dijejak)?$/ }).click();
  await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled(); await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click(); await expect(page.locator('.book-end')).toBeVisible(); await capture('book-end');
  await page.getByRole('button', { name: 'Main lagi', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Alif', exact: true })).toBeVisible(); await capture('alif-start');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; }); await capture('book-200-percent'); await page.evaluate(() => { document.documentElement.style.zoom = ''; });
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click(); await expect(page.locator('.book-fold')).toBeVisible();
  await page.screenshot({ path: `${directory}/screens/book-turn.png` }); report.screenshots.push(`${directory}/screens/book-turn.png`); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await draw(page, (await boardModels(page)).strokes[0]); await page.getByRole('button', { name: 'Tambah titik 1 daripada 1', exact: true }).click();
  await expect(page.locator('.book-completion')).toBeVisible(); await capture('ba-complete');
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click(); await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled();
  await page.locator('.trace-board').scrollIntoViewIfNeeded(); const copyBox = await page.locator('.trace-board').boundingBox();
  await draw(page, [{ x: copyBox.x + 60, y: copyBox.y + 60 }, { x: copyBox.x + 90, y: copyBox.y + 160 }]); await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible(); await capture('copy-warning');
  await page.getByRole('button', { name: 'Keluar tanpa simpan', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Ta', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled(); await page.getByRole('button', { name: 'Isi kandungan', exact: true }).click();
  await page.getByRole('button', { name: 'Qaf', exact: true }).click(); await expect(page.getByRole('button', { name: 'Cuba lagi', exact: true })).toBeEnabled(); await capture('qaf-start');
  await draw(page, (await boardModels(page)).strokes[0]); await capture('qaf-head');
  await draw(page, (await boardModels(page)).strokes[1]); await capture('qaf-dots');
  for (let i = 1; i <= 2; i++) await page.getByRole('button', { name: `Tambah titik ${i} daripada 2`, exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Qaf!', exact: true })).toBeVisible(); await capture('qaf-complete');
  report.checks.push('End page without wrapping', '200 percent document zoom', 'Animated turn and unchanged upright writing board', 'Unsaved copy warning and deliberate discard', 'Qaf closed head, bowl and separate dots'); expect(report.errors).toEqual([]);
  writeFileSync(`${directory}/visual-results.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ build: report.build, protected: report.protectedFilesUnchanged, captures: report.screenshots.length, viewports: report.viewports.length, errors: report.errors }));
} finally { await browser.close(); }
