import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const directory = 'output/verification/kids-game-theme';
mkdirSync(`${directory}/screens`, { recursive: true });
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase();
const baseline = JSON.parse(readFileSync('output/verification/kids-game-theme-protected-before.json', 'utf8').replace(/^\uFEFF/, ''));
for (const [file, value] of Object.entries(baseline)) expect(hash(file), file).toBe(value);
const report = { date: new Date().toISOString(), baseURL: 'http://127.0.0.1:4173', protectedFilesUnchanged: Object.keys(baseline).length, screenshots: [], viewports: [], errors: [], externalRequests: [], checks: [] };
const browser = await chromium.launch();
try {
  report.browser = browser.version();
  const page = await browser.newPage({ baseURL: report.baseURL });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) report.externalRequests.push(request.url()); });
  report.build = (await (await page.request.get('/')).text()).match(/\/assets\/index-[^" ]+\.js/)[0];
  async function capture(name) {
    await page.evaluate(() => document.fonts.ready);
    const path = `${directory}/screens/${name}.png`;
    await page.screenshot({ path, fullPage: true, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name).toBe(true);
    report.screenshots.push(path);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [[320, 740], [390, 844], [1024, 768], [768, 1024], [1920, 1080], [1280, 720]]) {
    const name = `${width}x${height}`; await page.setViewportSize({ width, height });
    await page.goto('/'); await dismissSplash(page);
    await expect(page.locator('.playground-picture img')).toBeVisible();
    expect(await page.locator('.playground-picture img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await capture(`welcome-${name}`);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(37); await capture(`garden-${name}`);
    await page.getByRole('button', { name: /^Nga(?:, pernah dijejak)?$/ }).click();
    await page.locator('.trace-board').scrollIntoViewIfNeeded(); await capture(`practice-${name}`);
    const before = await page.locator('.trace-board').boundingBox();
    const model = await boardModels(page); for (const stroke of model.strokes) await draw(page, stroke);
    const after = await page.locator('.trace-board').boundingBox();
    expect(after.x).toBeCloseTo(before.x, 2); expect(after.y).toBeCloseTo(before.y, 2);
    for (let i = 0; i < model.dots.length; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${model.dots.length}` }).click();
    await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Nga!', exact: true })).toBeVisible();
    await capture(`completion-${name}`);
    report.viewports.push({ width, height, approvedLetters: 37, traceCompleted: 'nga', writingPaperStable: true });
  }
  await page.setViewportSize({ width: 1280, height: 900 }); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/'); await dismissSplash(page);
  expect(await page.locator('.mascot-greet').first().evaluate(node => node.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(true);
  await page.waitForTimeout(4200);
  expect(await page.locator('.playground-scene').evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  report.checks.push('Welcome gestures run and settle; no continuous ambient animation');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await dismissSplash(page);
  expect(await page.locator('.playground-scene').evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; }); await capture('welcome-200-percent');
  await page.evaluate(() => { document.documentElement.style.zoom = ''; });
  report.checks.push('Reduced motion and 200 percent document zoom');
  await page.route('**/illustrations/taman-kawan-ceria.png', route => route.abort()); await page.goto('/'); await dismissSplash(page);
  await expect(page.locator('.playground-picture .garden-art')).toBeVisible(); await capture('welcome-artwork-fallback');
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  report.checks.push('Missing illustration falls back to local SVG and preserves entry');
  expect(report.errors).toEqual([]); expect(report.externalRequests).toEqual([]);
  writeFileSync(`${directory}/visual-results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ build: report.build, protected: report.protectedFilesUnchanged, viewports: report.viewports.length, captures: report.screenshots.length, errors: report.errors, checks: report.checks }));
} finally { await browser.close(); }
