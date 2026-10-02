import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const batchIds = ['sa', 'jim', 'ca', 'ha-pedat', 'kha'];
const batch = letters.filter(letter => batchIds.includes(letter.id));
const before = JSON.parse(readFileSync('output/verification/letter-batch-1-before.json', 'utf8'));
const audioApproval = JSON.parse(readFileSync('output/verification/audio-approval-metadata.json', 'utf8'));
const audioRows = [];
for (const letter of letters) {
  const original = before.find(item => item.id === letter.id);
  expect(letter.audio).toEqual(original.audio);
  if (batchIds.includes(letter.id)) {
    expect(letter.contentVersion).toBe(original.contentVersion + 1);
    expect(letter.geometry.status).toBe('pendingReview'); expect(letter.geometry.review).toBeNull();
    expect({ ...letter, geometry: original.geometry, contentVersion: original.contentVersion }).toEqual(original);
  } else expect(letter).toEqual(original);
  const sha256 = createHash('sha256').update(readFileSync(`public${letter.audio.name.src}`)).digest('hex');
  expect(sha256).toBe(audioApproval.rows.find(row => row.id === letter.id).sha256);
  audioRows.push({ id: letter.id, src: letter.audio.name.src, version: letter.audio.name.version, sha256 });
}
const validation = validateCatalogue(letters);
expect(validation.errors).toEqual([]); expect(validation.results.filter(item => item.ready)).toHaveLength(12);
expect(letters.filter(letter => letter.geometry.strokes.length)).toHaveLength(17);
expect(batch.map(letter => letter.geometry.dotTargets.length)).toEqual([3, 1, 3, 0, 1]);
mkdirSync('output/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 1000 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const screenshots = [], errors = [], externalRequests = [], attempts = [], layouts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  async function teacher() {
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await expect(page.locator('.draft-model-card')).toHaveCount(5);
    await page.evaluate(() => document.fonts.ready);
  }
  async function capture(target, name) {
    const path = `output/screenshots/letter-batch-1-${name}.png`;
    await target.screenshot({ path }); screenshots.push(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false); layouts.push({ capture: name, width: page.viewportSize().width, overflow });
  }
  await teacher();
  await capture(page.locator('.draft-model-review'), 'review-1280');
  for (const letter of batch) {
    await teacher();
    await page.getByRole('button', { name: `Semak ${letter.labelMs}`, exact: true }).click();
    await expect(page.locator('.numbered-trace-guides')).toBeVisible();
    await capture(page.locator('.lesson-page'), `${letter.id}-start-1280`);
    const model = await boardModels(page);
    await draw(page, model.strokes[0]);
    for (const [i, dot] of model.dots.entries()) {
      await expect(page.locator('.trace-number-label')).toHaveText([`${4 + i} ${i === model.dots.length - 1 ? 'Siap' : 'Titik'}`]);
      await page.mouse.click(dot.x, dot.y);
    }
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt).toMatchObject({ letterId: letter.id, preview: true, geometryStatus: 'pendingReview', contentVersion: 2, audioStatus: 'approved' });
    attempts.push(attempt);
    await capture(page.locator('.result-card'), `${letter.id}-complete-1280`);
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
    await teacher(); await capture(page.locator('.draft-model-review'), `review-${width}`);
    await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
    await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(17);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    for (const id of ['sa', 'ca', 'kha']) {
      const letter = batch.find(item => item.id === id);
      await teacher();
      await page.getByRole('button', { name: `Semak ${letter.labelMs}`, exact: true }).click();
      await expect(page.locator('.numbered-trace-guides')).toBeVisible();
      await capture(page.locator('.lesson-page'), `${id}-start-${width}`);
      await draw(page, (await boardModels(page)).strokes[0]);
      for (let i = 0; i < letter.geometry.dotTargets.length; i++) {
        await expect(page.locator('.trace-number-label')).toHaveText([`${4 + i} ${i === letter.geometry.dotTargets.length - 1 ? 'Siap' : 'Titik'}`]);
        await capture(page.locator('.lesson-page'), `${id}-dot-${i + 1}-${width}`);
        await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${letter.geometry.dotTargets.length}`, exact: true }).click();
      }
      await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    }
  }
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(12);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  await expect(page.locator('.letter-card:disabled')).toHaveCount(25);
  expect(errors).toEqual([]); expect(externalRequests).toEqual([]);
  const report = { date: '2026-10-02', batch: batch.map(letter => ({ id: letter.id, glyph: letter.glyph, version: letter.contentVersion,
    status: letter.geometry.status, dots: letter.geometry.dotTargets.length })), authoredModels: 17, studentReady: 12,
    missingModels: 20, preservedEntries: 32, approvedAudioPreserved: 37, audioRows,
    screenshots, layouts, attempts, errors, externalRequests,
    scope: 'Production Chromium mouse traces and captures; draft geometry has not been approved, and physical pupil/device review has not been performed.' };
  writeFileSync('output/verification/letter-batch-1-production.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ authoredModels: 17, studentReady: 12, drafts: 5, preservedEntries: 32, approvedAudioPreserved: 37,
    screenshots: screenshots.length, layouts: layouts.length, errors, externalRequests }, null, 2));
} finally { await browser.close(); }
