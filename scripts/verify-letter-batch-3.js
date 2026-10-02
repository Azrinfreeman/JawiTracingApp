import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const ids = ['ta-marbuta', 'tho', 'za', 'ain', 'ghain', 'nga', 'fa', 'pa', 'qaf', 'ga', 'va', 'ha', 'hamzah', 'ye', 'nya'];
const batch = letters.filter(letter => ids.includes(letter.id));
const before = JSON.parse(readFileSync('output/verification/letter-batch-3-before.json', 'utf8'));
const audioBefore = JSON.parse(readFileSync('output/verification/letter-batch-3-audio-before.json', 'utf8'));
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const audioRows = [];
for (const letter of letters) {
  const original = before.find(item => item.id === letter.id);
  expect(letter.audio).toEqual(original.audio);
  if (ids.includes(letter.id)) {
    expect(original.geometry.strokes).toHaveLength(0);
    expect(letter.contentVersion).toBe(original.contentVersion + 1);
    expect(letter.geometry.status).toBe('pendingReview'); expect(letter.geometry.review).toBeNull();
    expect({ ...letter, geometry: original.geometry, contentVersion: original.contentVersion }).toEqual(original);
  } else expect(letter).toEqual(original);
  const sha256 = hash(`public${letter.audio.name.src}`);
  expect(sha256).toBe(audioBefore.find(row => row.id === letter.id).sha256);
  audioRows.push({ id: letter.id, src: letter.audio.name.src, version: letter.audio.name.version, sha256 });
}
const validation = validateCatalogue(letters);
expect(validation.errors).toEqual([]);
expect(validation.results.filter(item => item.ready)).toHaveLength(22);
expect(letters.filter(letter => letter.geometry.strokes.length)).toHaveLength(37);
expect(batch).toHaveLength(15);
const paths = id => letters.find(letter => letter.id === id).geometry.strokes.map(stroke => stroke.path);
for (const [a, b] of [['ta-marbuta', 'ha'], ['tho', 'za'], ['ain', 'ghain'], ['ain', 'nga'], ['fa', 'pa'], ['ga', 'kaf'], ['va', 'wau'], ['ye', 'ya'], ['nya', 'nun']]) expect(paths(a)).toEqual(paths(b));
expect(batch.map(letter => letter.geometry.dotTargets.length)).toEqual([2, 0, 1, 0, 1, 3, 1, 3, 2, 1, 1, 0, 0, 0, 3]);

mkdirSync('output/screenshots', { recursive: true });
const screenshots = [], layouts = [], attempts = [], errors = [], externalRequests = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 1000 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  const capture = async (locator, name) => {
    await page.evaluate(() => document.fonts.ready);
    const path = `output/screenshots/letter-batch-3-${name}.png`;
    await locator.screenshot({ path }); screenshots.push(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow, name).toBe(false); layouts.push({ name, width: await page.evaluate(() => innerWidth), overflow });
  };
  const teacher = async () => {
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await expect(page.locator('.draft-model-card')).toHaveCount(15);
  };
  const open = async letter => {
    await teacher();
    await page.getByRole('button', { name: `Semak ${letter.labelMs}`, exact: true }).click();
    await expect(page.locator('.preview-banner')).toContainText('37 model huruf · 15 draf untuk semakan');
  };
  await teacher(); await capture(page.locator('.draft-model-review'), 'review-1280');
  for (const letter of batch) {
    await open(letter);
    await capture(page.locator('.lesson-page'), `${letter.id}-start-1280`);
    for (const [i] of letter.geometry.strokes.entries()) await draw(page, (await boardModels(page)).strokes[i]);
    for (const [i] of letter.geometry.dotTargets.entries()) {
      const dot = (await boardModels(page)).dots[i]; await page.mouse.click(dot.x, dot.y);
    }
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt).toMatchObject({ letterId: letter.id, contentVersion: 2, preview: true, geometryStatus: 'pendingReview', audioStatus: 'approved' });
    expect(attempt.metrics.dotCount).toBe(letter.geometry.dotTargets.length); attempts.push(attempt);
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
    await teacher(); await capture(page.locator('.draft-model-review'), `review-${width}`);
    for (const id of ['ta-marbuta', 'tho', 'nga', 'pa', 'qaf', 'ga', 'hamzah']) {
      const letter = batch.find(letter => letter.id === id); await open(letter);
      for (const [i] of letter.geometry.strokes.entries()) {
        await capture(page.locator('.lesson-page'), `${id}-stroke-${i + 1}-${width}`);
        await draw(page, (await boardModels(page)).strokes[i]);
      }
      for (const [i] of letter.geometry.dotTargets.entries()) {
        await capture(page.locator('.lesson-page'), `${id}-dot-${i + 1}-${width}`);
        await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${letter.geometry.dotTargets.length}`, exact: true }).click();
      }
      await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    }
  }
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(22);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  await expect(page.locator('.letter-card:disabled')).toHaveCount(15);
  expect(errors).toEqual([]); expect(externalRequests).toEqual([]);
  const inputFiles = ['src/content/letters.json', 'src/content/validateContent.js', 'src/App.jsx', 'src/components/TraceBoard.jsx',
    'src/components/NumberedTraceGuides.jsx', 'src/components/DraftModelReview.jsx', 'src/tracing/numberedGuides.js',
    'src/tracing/prepareReference.js', 'src/tracing/playMatcher.js', 'src/tracing/matcher.js', 'src/tracing/profiles.js',
    'src/styles/app.css', 'tests/browser/letter-batch-3.spec.js', 'tests/browser/helpers/tracing.js',
    'tests/browser/helpers/navigation.js', 'package-lock.json', 'dist/index.html'];
  const report = { date: '2026-10-02', timezone: 'Asia/Kuala_Lumpur', status: 'implementedPendingContentReview',
    command: 'node scripts/verify-letter-batch-3.js', runtime: { node: process.version, browser: browser.version() },
    inputs: inputFiles.map(path => ({ path, sha256: hash(path) })),
    batch: batch.map(letter => ({ id: letter.id, glyph: letter.glyph, contentVersion: letter.contentVersion,
      geometryStatus: letter.geometry.status, strokes: letter.geometry.strokes.length, dots: letter.geometry.dotTargets.length })),
    authoredModels: 37, studentReady: 22, pendingAuthoredModels: 15, missingModels: 0, preservedEntries: 22,
    approvedAudioPreserved: 37, audioRows, screenshots, layouts, attempts, errors, externalRequests,
    scope: 'Production Chromium adult-preview mouse completion of all 15 models; phone/tablet review cards and representative stroke/dot captures. Geometry and writing order remain pending review.' };
  writeFileSync('output/verification/letter-batch-3-production.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ authoredModels: 37, studentReady: 22, pendingModels: 15, missingModels: 0,
    preservedEntries: 22, approvedAudioPreserved: 37, screenshots: screenshots.length, errors, externalRequests }));
} finally { await browser.close(); }
