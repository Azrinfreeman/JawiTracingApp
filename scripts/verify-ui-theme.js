import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const baseline = JSON.parse(readFileSync('output/verification/ui-theme-before.json', 'utf8'));
for (const [file, sha256] of Object.entries(baseline.protected)) expect(hash(file), file).toBe(sha256);
const validation = validateCatalogue(letters);
expect(validation.errors).toEqual([]);
expect(validation.results.filter(letter => letter.ready)).toHaveLength(37);
mkdirSync('output/screenshots', { recursive: true });
const browser = await chromium.launch();
const report = { checkedAt: new Date().toISOString(), baseURL: 'http://127.0.0.1:4173',
  browser: browser.version(), protectedFilesUnchanged: Object.keys(baseline.protected).length,
  ready: 37, viewports: [], screenshots: [], attempts: [], errors: [], externalRequests: [] };
try {
  const page = await browser.newPage({ baseURL: report.baseURL });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) report.externalRequests.push(request.url()); });
  async function capture(name, locator) {
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const path = `output/screenshots/ui-theme-final-${name}.png`;
    if (locator) await locator.screenshot({ path }); else await page.screenshot({ path });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), name).toBe(false);
    report.screenshots.push(path);
  }
  async function garden() {
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
    await expect(page.locator('.preview-banner')).toHaveCount(0);
  }
  async function open(id) {
    const letter = letters.find(letter => letter.id === id);
    await page.getByRole('button', { name: new RegExp(`^${letter.labelMs}(?:, pernah dijejak)?$`) }).click();
    await expect(page.locator('.start-dot')).toBeVisible();
    return letter;
  }
  async function record(letter) {
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt).toMatchObject({ letterId: letter.id, preview: false, mode: 'play', geometryStatus: 'approved', audioStatus: 'approved', contentVersion: letter.contentVersion });
    expect(attempt.metrics.dotCount).toBe(letter.geometry.dotTargets.length);
    report.attempts.push(attempt);
  }
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1280, 900], [844, 390]]) {
    const suffix = `${width}x${height}`;
    await page.setViewportSize({ width, height }); await page.goto('/');
    await expect(page.getByRole('button', { name: 'Teruskan', exact: true })).toBeVisible();
    await capture(`splash-${suffix}`); await dismissSplash(page);
    await page.getByRole('button', { name: 'Daun', exact: true }).click();
    await capture(`welcome-${suffix}`);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
    const columns = await page.locator('.letter-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    await capture(`garden-${suffix}`);
    const nga = await open('nga');
    await page.locator('.trace-board').scrollIntoViewIfNeeded();
    await capture(`nga-start-${suffix}`);
    let model = await boardModels(page);
    await draw(page, model.strokes[0].slice(0, 15));
    model = await boardModels(page);
    await page.mouse.move(model.strokes[0][14].x, model.strokes[0][14].y); await page.mouse.down();
    await page.mouse.move(model.strokes[0][14].x + 240 * model.scale, model.strokes[0][14].y);
    await expect(page.locator('.trace-board')).toHaveAttribute('data-phase', 'paused');
    await capture(`nga-pause-${suffix}`);
    await page.mouse.up();
    model = await boardModels(page); await draw(page, model.strokes[0].slice(14));
    for (const i of [0, 1, 2]) {
      await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `dot-${i + 1}`);
      await page.locator('.trace-board').scrollIntoViewIfNeeded();
      await capture(`nga-dot-${i + 1}-${suffix}`);
      const dot = (await boardModels(page)).dots[i]; await page.mouse.click(dot.x, dot.y);
    }
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${nga.labelMs}!`, exact: true })).toBeVisible();
    if (width === 320 || width === 390 || width === 768 || width === 1280) {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const nextBox = await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).boundingBox();
      expect(nextBox.y + nextBox.height).toBeLessThanOrEqual(height);
    }
    await record(nga); await capture(`result-${suffix}`);
    await page.getByRole('button', { name: /cuba salin sendiri/ }).click();
    await expect(page.locator('.numbered-trace-guides')).toHaveCount(0);
    await capture(`blank-copy-${suffix}`);
    await page.getByRole('button', { name: 'Simpan untuk guru', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Cuba tulis dahulu' })).toBeVisible();
    await capture(`copy-notice-${suffix}`);
    await page.locator('.trace-board').scrollIntoViewIfNeeded();
    const box = await page.locator('.trace-board').boundingBox();
    await draw(page, [{ x: box.x + box.width * .7, y: box.y + box.height * .25 },
      { x: box.x + box.width * .55, y: box.y + box.height * .6 }, { x: box.x + box.width * .25, y: box.y + box.height * .65 }]);
    await page.getByRole('button', { name: 'Simpan untuk guru', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Terima kasih kerana mencuba!', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await capture(`teacher-${suffix}`);
    const audioPanel = page.locator('.audio-review-panel');
    await capture(`audio-review-${suffix}`, audioPanel);
    await page.getByRole('button', { name: 'Padam rekod', exact: true }).click();
    await capture(`reset-confirm-${suffix}`, page.locator('.reset-confirm'));
    await page.getByRole('button', { name: 'Batal', exact: true }).click();
    const copies = page.getByRole('heading', { name: 'Salinan untuk pemerhatian', exact: true }).locator('..');
    await expect(copies.locator('.copy-thumbnail')).toHaveCount(report.attempts.length);
    if (width === 320 || width === 1280) {
      await capture(`teacher-copies-${suffix}`, copies);
      await capture(`teacher-content-${suffix}`, page.getByRole('heading', { name: 'Kandungan & semakan', exact: true }).locator('..'));
    }
    report.viewports.push({ width, height, columns, overflow: false, play: 'completed', copy: 'saved', reset: 'cancelled' });
  }
  await page.setViewportSize({ width: 390, height: 844 }); await garden();
  const qaf = await open('qaf');
  for (const [i] of qaf.geometry.strokes.entries()) {
    await page.locator('.trace-board').scrollIntoViewIfNeeded();
    await capture(`qaf-stroke-${i + 1}-390x844`);
    await draw(page, (await boardModels(page)).strokes[i]);
  }
  for (const [i] of qaf.geometry.dotTargets.entries()) {
    const dot = (await boardModels(page)).dots[i]; await page.mouse.click(dot.x, dot.y);
  }
  await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${qaf.labelMs}!`, exact: true })).toBeVisible();
  await record(qaf);
  await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click();
  const next = letters[(letters.findIndex(letter => letter.id === qaf.id) + 1) % letters.length];
  await expect(page.getByRole('heading', { name: next.labelMs, exact: true })).toBeVisible();
  report.nextLetter = { from: qaf.id, to: next.id };
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByLabel('Jenis latihan').selectOption('guided');
  const content = page.getByRole('heading', { name: 'Kandungan & semakan', exact: true }).locator('..');
  await content.locator('tr').filter({ hasText: 'Mim' }).getByRole('button', { name: 'Buka', exact: true }).click();
  await page.locator('.trace-board').scrollIntoViewIfNeeded(); await capture('guided-mim-390x844');
  await page.getByRole('button', { name: 'Lihat cara', exact: true }).click();
  await expect(page.locator('.demonstration-ink')).not.toHaveCount(0);
  await capture('guided-demo-390x844');
  await expect(page.getByRole('button', { name: 'Lihat cara', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByLabel('Jenis latihan').selectOption('precision');
  await page.getByRole('heading', { name: 'Kandungan & semakan', exact: true }).locator('..')
    .locator('tr').filter({ hasText: 'Mim' }).getByRole('button', { name: 'Buka', exact: true }).click();
  await page.locator('.trace-board').scrollIntoViewIfNeeded(); await capture('precision-mim-390x844');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('.trace-board').scrollIntoViewIfNeeded(); await capture('precision-mim-1280x900');
  expect(report.errors).toEqual([]); expect(report.externalRequests).toEqual([]);
  const inputFiles = [];
  function inputs(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = `${dir}/${entry.name}`;
      if (entry.isDirectory()) inputs(file); else inputFiles.push(file);
    }
  }
  inputs('src'); inputs('tests'); inputs('dist');
  inputFiles.push('package.json', 'package-lock.json', 'playwright.config.js', 'scripts/verify-ui-theme.js');
  report.inputs = Object.fromEntries(inputFiles.map(file => [file, hash(file)]));
  report.storage = await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('taman-jawi.progress.v1'));
    return { profile: value.profile, attempts: value.attempts.length, copies: value.copies.length };
  });
  writeFileSync('output/verification/ui-theme-final-production.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ protected: report.protectedFilesUnchanged, ready: report.ready, viewports: report.viewports.length,
    screenshots: report.screenshots.length, attempts: report.attempts.length, errors: report.errors.length, externalRequests: report.externalRequests.length }));
} finally { await browser.close(); }
