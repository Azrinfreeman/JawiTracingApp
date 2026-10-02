import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';

const baseURL = 'http://127.0.0.1:4173';
const generated = JSON.parse(readFileSync('output/verification/draft-audio-generation.json', 'utf8'));
const supplied = letters.some(letter => letter.audio.name.origin?.kind === 'userProvided');
const approvedAudio = letters.filter(letter => letter.audio.name.status === 'approved').length;
const ready = validateCatalogue(letters).results.filter(letter => letter.ready).length;
const runName = approvedAudio === letters.length ? 'audio-approved' : supplied ? 'alphabet-audio' : 'draft-audio';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
expect(generated.recordings).toHaveLength(37);
const packaging = [];
for (const letter of letters) {
  const recording = { id: letter.id, src: letter.audio.name.src,
    sha256: letter.audio.name.origin?.sha256 ?? generated.recordings.find(item => item.id === letter.id).sha256 };
  expect(recording.src).toMatch(/^\/audio\/letters\/(?:alphabet\/)?[a-z-]+-name(?:-v\d+)?\.(mp3|wav|ogg|m4a)$/);
  const original = readFileSync(`public${recording.src}`), built = readFileSync(`dist${recording.src}`);
  expect(hash(original), recording.id).toBe(recording.sha256);
  expect(hash(built), recording.id).toBe(recording.sha256);
  const response = await fetch(`${baseURL}${recording.src}`);
  expect(response.status, recording.id).toBe(200);
  expect(response.headers.get('content-type'), recording.id).toContain(recording.src.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg');
  expect(hash(Buffer.from(await response.arrayBuffer())), recording.id).toBe(recording.sha256);
  packaging.push({ id: recording.id, bytes: original.length, httpStatus: 200, sourceBuildAndHttpHashesMatch: true });
}

mkdirSync('output/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.addInitScript(() => {
    const NativeAudio = window.Audio;
    window.Audio = class extends NativeAudio {
      constructor(...args) { super(...args); window.__lastTeachingAudio = this; }
    };
  });
  const errors = [], externalRequests = [], screenshots = [], layouts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  await page.goto(baseURL); await dismissSplash(page);
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  const panel = page.locator('.audio-review-panel');
  await expect(panel).toContainText('37 rakaman nama huruf tersedia');
  await expect(page.getByRole('cell', { name: 'Draf suara · perlu semakan', exact: true })).toHaveCount(letters.length - approvedAudio);
  await expect(page.getByRole('cell', { name: 'Diluluskan', exact: true })).toHaveCount(approvedAudio);
  await expect(page.locator('.teacher-stat-grid')).toContainText(`${ready}pelajaran sedia untuk murid`);
  await panel.getByRole('button', { name: 'Dengar rakaman Alif', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Rakaman Alif dimainkan');
  const teacherPlayback = [];
  for (const id of supplied ? ['alif', 'qaf', 'lam'] : ['alif']) {
    const letter = letters.find(item => item.id === id);
    if (id !== 'alif') {
      await page.getByLabel('Huruf untuk semakan suara').selectOption(id);
      await panel.getByRole('button', { name: `Dengar rakaman ${letter.labelMs}`, exact: true }).click();
      await expect(panel.getByRole('status')).toContainText(`Rakaman ${letter.labelMs} dimainkan`);
    }
    await expect.poll(() => page.evaluate(() => window.__lastTeachingAudio?.currentTime ?? 0)).toBeGreaterThan(0);
    expect(await page.evaluate(src => window.__lastTeachingAudio.src.endsWith(src), letter.audio.name.src)).toBe(true);
    teacherPlayback.push({ id, src: letter.audio.name.src, playing: true });
  }
  for (const [width, height] of [[1280, 1000], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    await page.getByLabel('Huruf untuk semakan suara').selectOption(supplied ? 'alif' : 'ta-marbuta');
    if (supplied) await expect(panel).toContainText('Rakaman pilihan anda');
    await panel.getByRole('heading').scrollIntoViewIfNeeded();
    const path = `output/screenshots/${runName}-review-${width}.png`;
    await panel.screenshot({ path }); screenshots.push(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false); layouts.push({ width, height, overflow });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  if (ready) {
    await page.locator('.teacher-page').getByRole('button', { name: 'Kembali', exact: true }).click();
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('.preview-banner')).toHaveCount(0);
    await expect(page.locator('.letter-card:enabled')).toHaveCount(ready);
    await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
    await expect(page.locator('.letter-card:disabled')).toHaveCount(letters.length - ready);
  } else await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.getByRole('button', { name: 'Ba', exact: true }).click();
  await page.getByRole('button', { name: 'Dengar', exact: true }).click();
  await expect(page.locator('.audio-notice')).toHaveText(letters.find(letter => letter.id === 'ba').audio.name.status === 'approved' ? 'Dengar dan sebut semula.' : 'Suara draf. Dengar dan sebut semula.');
  const lessonScreenshot = `output/screenshots/${runName}-lesson-390.png`;
  await page.screenshot({ path: lessonScreenshot, fullPage: true }); screenshots.push(lessonScreenshot);
  expect(errors).toEqual([]); expect(externalRequests).toEqual([]);
  const result = { date: '2026-10-02', productionURL: baseURL, browser: browser.version(),
    packagedRecordings: packaging.length, totalBytes: packaging.reduce((sum, row) => sum + row.bytes, 0),
    packaging, teacherPlayback, lessonPlayback: 'Ba succeeded in Chromium',
    audioStatus: approvedAudio === letters.length ? 'approved' : 'mixedOrPending', audioApprovals: approvedAudio, geometryApprovals: letters.filter(letter => letter.geometry.status === 'approved').length,
    suppliedRecordings: letters.filter(letter => letter.audio.name.origin?.kind === 'userProvided').length,
    retainedSyntheticRecordings: letters.filter(letter => !letter.audio.name.origin && letter.audio.name.synthesis).length,
    studentReady: ready, layouts, screenshots, pageErrors: errors, externalRuntimeRequests: externalRequests,
    limitation: 'Windows Playwright WebKit has no AudioContext and rejects actual MP3 playback; failure feedback checked separately. Physical Safari/Android testing pending; audio approval source is projectOwner.' };
  writeFileSync(`output/verification/${runName}-production.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ packagedRecordings: result.packagedRecordings, totalBytes: result.totalBytes, layouts, screenshots, pageErrors: errors, externalRuntimeRequests: externalRequests }, null, 2));
} finally { await browser.close(); }
