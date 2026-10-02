import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const ids = ['zal', 'zai', 'syin', 'sad', 'dad'];
const batch = letters.filter(letter => ids.includes(letter.id));
const before = JSON.parse(readFileSync('output/verification/letter-batch-2-before.json', 'utf8'));
const audioApproval = JSON.parse(readFileSync('output/verification/audio-approval-metadata.json', 'utf8'));
const audioRows = [];
for (const letter of letters) {
  const original = before.find(item => item.id === letter.id);
  expect(letter.audio).toEqual(original.audio);
  if (ids.includes(letter.id)) {
    expect(letter.contentVersion).toBe(original.contentVersion + 1);
    expect(letter.geometry.status).toBe('pendingReview'); expect(letter.geometry.review).toBeNull();
    expect({ ...letter, geometry: original.geometry, contentVersion: original.contentVersion }).toEqual(original);
  } else expect(letter).toEqual(original);
  const sha256 = createHash('sha256').update(readFileSync(`public${letter.audio.name.src}`)).digest('hex');
  expect(sha256).toBe(audioApproval.rows.find(row => row.id === letter.id).sha256);
  audioRows.push({ id: letter.id, src: letter.audio.name.src, version: letter.audio.name.version, sha256 });
}
for (const [target, source] of [['zal', 'dal'], ['zai', 'ra'], ['syin', 'sin']]) {
  expect(letters.find(l => l.id === target).geometry.strokes.map(s => s.path)).toEqual(letters.find(l => l.id === source).geometry.strokes.map(s => s.path));
}
expect(batch.find(l => l.id === 'sad').geometry.strokes).toEqual(batch.find(l => l.id === 'dad').geometry.strokes);
expect(batch.map(letter => letter.geometry.dotTargets.length)).toEqual([1, 1, 3, 0, 1]);
const validation = validateCatalogue(letters);
expect(validation.errors).toEqual([]); expect(validation.results.filter(item => item.ready)).toHaveLength(17);
expect(letters.filter(letter => letter.geometry.strokes.length)).toHaveLength(22);
mkdirSync('output/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 1000 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const screenshots = [], layouts = [], attempts = [], errors = [], externalRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  async function teacher() {
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await expect(page.locator('.draft-model-card')).toHaveCount(5);
    await page.evaluate(() => document.fonts.ready);
  }
  async function capture(target, name) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const path = `output/screenshots/letter-batch-2-${name}.png`;
    await target.screenshot({ path }); screenshots.push(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false); layouts.push({ capture: name, width: page.viewportSize().width, overflow });
  }
  async function open(letter) {
    await teacher();
    await page.getByRole('button', { name: `Semak ${letter.labelMs}`, exact: true }).click();
    await expect(page.locator('.start-dot')).toBeVisible();
  }
  await teacher(); await capture(page.locator('.draft-model-review'), 'review-1280');
  for (const letter of batch) {
    await open(letter);
    const model = await boardModels(page);
    for (const [i, stroke] of model.strokes.entries()) {
      await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `stroke-${i + 1}`);
      await capture(page.locator('.lesson-page'), `${letter.id}-stroke-${i + 1}-1280`);
      await draw(page, (await boardModels(page)).strokes[i]);
    }
    for (const [i, dot] of model.dots.entries()) {
      await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', `dot-${i + 1}`);
      await capture(page.locator('.lesson-page'), `${letter.id}-dot-${i + 1}-1280`);
      const target = (await boardModels(page)).dots[i];
      await page.mouse.click(target.x, target.y);
    }
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt).toMatchObject({ letterId: letter.id, contentVersion: 2, preview: true, geometryStatus: 'pendingReview', audioStatus: 'approved' });
    expect(attempt.metrics.dotCount).toBe(model.dots.length); attempts.push(attempt);
    await capture(page.locator('.result-card'), `${letter.id}-complete-1280`);
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
    await teacher(); await capture(page.locator('.draft-model-review'), `review-${width}`);
    await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
    await page.getByRole('button', { name: 'Model tersedia', exact: true }).click();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(22);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    for (const id of ['syin', 'sad', 'dad']) {
      const letter = batch.find(l => l.id === id); await open(letter);
      const model = await boardModels(page);
      for (const [i, stroke] of model.strokes.entries()) {
        await capture(page.locator('.lesson-page'), `${id}-stroke-${i + 1}-${width}`);
        await draw(page, (await boardModels(page)).strokes[i]);
      }
      for (const [i] of model.dots.entries()) {
        await capture(page.locator('.lesson-page'), `${id}-dot-${i + 1}-${width}`);
        await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${model.dots.length}`, exact: true }).click();
      }
      await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    }
  }
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(17);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  await expect(page.locator('.letter-card:disabled')).toHaveCount(20);
  expect(errors).toEqual([]); expect(externalRequests).toEqual([]);
  const report = { date: '2026-10-02', status: 'implementedPendingContentReview', batch: batch.map(l => ({ id: l.id, glyph: l.glyph,
    contentVersion: l.contentVersion, geometryStatus: l.geometry.status, strokes: l.geometry.strokes.length, dots: l.geometry.dotTargets.length })),
    authoredModels: 22, studentReady: 17, pendingAuthoredModels: 5, missingModels: 15, preservedEntries: 32,
    approvedAudioPreserved: 37, audioRows, screenshots, layouts, attempts, errors, externalRequests,
    scope: 'Production Chromium adult-preview mouse traces and responsive captures. New geometry and writing order remain pending review.' };
  writeFileSync('output/verification/letter-batch-2-production.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ authoredModels: 22, studentReady: 17, pendingModels: 5, missingModels: 15, preservedEntries: 32,
    approvedAudioPreserved: 37, screenshots: screenshots.length, errors, externalRequests }, null, 2));
} finally { await browser.close(); }
