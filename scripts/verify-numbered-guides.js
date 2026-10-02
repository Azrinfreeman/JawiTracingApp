import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const before = JSON.parse(readFileSync('output/verification/audio-approval-before.json', 'utf8'));
const approvedAudio = JSON.parse(readFileSync('output/verification/audio-approval-metadata.json', 'utf8'));
for (const letter of letters) {
  const original = before.find(item => item.id === letter.id), preserved = JSON.parse(JSON.stringify(letter));
  preserved.audio.name.status = original.audio.name.status; preserved.audio.name.review = original.audio.name.review;
  expect(preserved).toEqual(original);
  expect(letter.audio.name.status).toBe('approved');
  expect(letter.audio.name.review.revision).toBe(letter.audio.name.version);
  const hash = createHash('sha256').update(readFileSync(`public${letter.audio.name.src}`)).digest('hex');
  expect(hash).toBe(approvedAudio.rows.find(item => item.id === letter.id).sha256);
}
expect(validateCatalogue(letters).results.filter(item => item.ready)).toHaveLength(12);
mkdirSync('output/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 390, height: 844 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const screenshots = [], layouts = [], errors = [], externalRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  async function open(label, width, height) {
    await page.setViewportSize({ width, height });
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.getByRole('button', { name: new RegExp(`^${label}(?:, pernah dijejak)?$`) }).click();
    await expect(page.locator('.numbered-trace-guides')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  async function capture(name, width) {
    const path = `output/screenshots/numbered-guides-${name}-${width}.png`;
    await page.screenshot({ path, fullPage: true }); screenshots.push(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false); layouts.push({ capture: name, width, overflow });
  }

  await open('Ba', 390, 844);
  await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula', '2 Ikut', '3 Henti']);
  await capture('ba', 390);
  await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.locator('.trace-number-label')).toHaveText(['4 Siap']);
  await capture('ba-dot', 390);
  const badge = await page.locator('.trace-number-badge').boundingBox();
  await page.mouse.click(badge.x + badge.width / 2, badge.y + badge.height / 2);
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ba!', exact: true })).toBeVisible();
  const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(attempt).toMatchObject({ letterId: 'ba', preview: false, audioStatus: 'approved', outcome: 'playComplete' });
  expect(attempt.metrics.dotCount).toBe(1); expect(attempt.metrics.equivalentDotActions).toBe(0);

  await open('Mim', 390, 844);
  const loop = (await boardModels(page)).strokes[0];
  await draw(page, loop.slice(0, Math.ceil(loop.length * .65)));
  await expect(page.locator('.trace-number-guide[data-number="3"] .trace-number-badge')).toHaveCount(1);
  await expect(page.locator('.trace-number-guide[data-number="1"] .trace-number-badge')).toHaveCount(0);
  await capture('mim-loop', 390);

  await open('Kaf', 390, 844);
  await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.locator('.trace-number-label')).toHaveText(['4 Mula', '5 Siap']);
  await capture('kaf-second', 390);

  await open('Ta', 768, 1024);
  await capture('ta', 768);
  await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.locator('.trace-number-label')).toHaveText(['4 Titik']);
  await page.getByRole('button', { name: 'Tambah titik 1 daripada 2' }).click();
  await expect(page.locator('.trace-number-label')).toHaveText(['5 Siap']);
  await capture('ta-final-dot', 768);
  await open('Alif', 1280, 1000); await capture('alif', 1280);
  await open('Sin', 320, 740); await capture('sin', 320);

  expect(errors).toEqual([]); expect(externalRequests).toEqual([]);
  const report = { date: '2026-10-02', productionURL: 'http://127.0.0.1:4173', screenshots, layouts,
    nativeNumberedDotFinishesBa: true, dotCount: attempt.metrics.dotCount, equivalentDotActions: attempt.metrics.equivalentDotActions,
    sharedLoopBadge: true, shortSecondStroke: true, sequentialDots: true, studentReady: 12,
    audioApprovals: 37, teachingContentAndAudioBytesPreserved: true, pageErrors: errors, externalRequests,
    scope: 'Chromium production mouse input and responsive captures; actual pupil/device review remains pending.' };
  writeFileSync('output/verification/numbered-guides-production.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
