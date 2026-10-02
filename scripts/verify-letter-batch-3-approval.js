import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const ids = ['ta-marbuta', 'tho', 'za', 'ain', 'ghain', 'nga', 'fa', 'pa', 'qaf', 'ga', 'va', 'ha', 'hamzah', 'ye', 'nya'];
const batch = letters.filter(letter => ids.includes(letter.id));
const before = JSON.parse(readFileSync('output/verification/letter-batch-3-approval-before.json', 'utf8'));
const audioBefore = JSON.parse(readFileSync('output/verification/letter-batch-3-audio-before.json', 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const audioRows = [];
for (const letter of letters) {
  const original = before.find(item => item.id === letter.id);
  if (ids.includes(letter.id)) {
    expect(letter.geometry.status).toBe('approved');
    expect(letter.geometry.review).toEqual({ revision: 2, reviewer: 'Project owner (Codex user; name not supplied)',
      date: '2026-10-02', reference: 'docs/CONTENT_APPROVALS.md#approval-of-final-letter-batch-2026-10-02', kind: 'projectOwner' });
    expect({ ...letter, geometry: { ...letter.geometry, status: original.geometry.status, review: original.geometry.review } }).toEqual(original);
  } else expect(letter).toEqual(original);
  const sha256 = hash(`public${letter.audio.name.src}`);
  expect(sha256).toBe(audioBefore.find(row => row.id === letter.id).sha256);
  audioRows.push({ id: letter.id, sha256 });
}
const validation = validateCatalogue(letters);
expect(validation.errors).toEqual([]);
expect(validation.results.filter(item => item.ready)).toHaveLength(37);
mkdirSync('output/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 1000 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [], externalRequests = [], screenshots = [], attempts = [], navigation = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  async function garden() {
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.locator('.preview-banner')).toHaveCount(0);
    await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
    await expect(page.getByRole('button', { name: 'Huruf tersedia', exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  for (const letter of batch) {
    await garden(); await page.getByRole('button', { name: letter.labelMs, exact: true }).click();
    await expect(page.locator('.start-dot')).toBeVisible();
    await expect(page.locator('.lesson-pilot')).not.toContainText('Draf');
    for (const [i] of letter.geometry.strokes.entries()) await draw(page, (await boardModels(page)).strokes[i]);
    for (const [i] of letter.geometry.dotTargets.entries()) {
      const dot = (await boardModels(page)).dots[i]; await page.mouse.click(dot.x, dot.y);
    }
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt).toMatchObject({ letterId: letter.id, preview: false, mode: 'play', geometryStatus: 'approved', audioStatus: 'approved', contentVersion: 2 });
    expect(attempt.metrics.dotCount).toBe(letter.geometry.dotTargets.length); attempts.push(attempt);
    const next = letters[(letters.findIndex(item => item.id === letter.id) + 1) % letters.length];
    await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click();
    await expect(page.getByRole('heading', { name: next.labelMs, exact: true })).toBeVisible();
    await expect(page.locator('.preview-banner')).toHaveCount(0);
    navigation.push({ from: letter.id, to: next.id, student: true });
  }
  async function capture(name, locator) {
    await page.evaluate(() => document.fonts.ready);
    const path = `output/screenshots/letter-batch-3-approved-${name}.png`;
    if (locator) await locator.screenshot({ path }); else await page.screenshot({ path });
    screenshots.push(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
    await garden(); await capture(`garden-${width}`);
    await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
    await expect(page.locator('.letter-card')).toHaveCount(37);
    await expect(page.locator('.letter-card:disabled')).toHaveCount(0);
    await page.getByRole('button', { name: 'Huruf permulaan', exact: true }).click();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(12);
  }
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await expect(page.locator('.teacher-stat-grid')).toContainText('37pelajaran sedia untuk murid');
  await expect(page.locator('.draft-model-card')).toHaveCount(0);
  await expect(page.locator('.status-chip.approved')).toHaveCount(37);
  for (const letter of batch) {
    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: `${letter.glyph} ${letter.labelMs}`, exact: true }) });
    await expect(row).toContainText('Diluluskan · pemilik projek'); await expect(row).toContainText('2026-10-02');
  }
  await capture('teacher-stats-1280', page.locator('.teacher-stat-grid'));
  await capture('teacher-models-1280', page.locator('.teacher-panel').filter({ has: page.getByRole('heading', { name: 'Kandungan & semakan', exact: true }) }));
  expect(errors).toEqual([]); expect(externalRequests).toEqual([]);
  const report = { date: '2026-10-02', timezone: 'Asia/Kuala_Lumpur', status: 'approved',
    source: 'The user explicitly wrote approve after the final 15 revision-2 model implementation, review notes and review-grid screenshot.',
    scope: 'Project-owner approval of the 15 final models at existing content revision 2; geometry and audio preserved.',
    command: 'node scripts/verify-letter-batch-3-approval.js', runtime: { node: process.version, browser: browser.version() },
    inputs: ['src/content/letters.json', 'src/content/validateContent.js', 'src/App.jsx', 'src/tracing/profiles.js',
      'src/screens/LetterGarden.jsx', 'src/screens/TeacherScreen.jsx', 'tests/browser/helpers/tracing.js',
      'tests/browser/helpers/navigation.js', 'package-lock.json', 'dist/index.html'].map(path => ({ path, sha256: hash(path) })),
    models: batch.map(letter => ({ id: letter.id, contentVersion: letter.contentVersion, review: letter.geometry.review })),
    studentReady: 37, unavailableModels: 0, preservedCatalogueEntries: 22, audioApprovalsPreserved: 37,
    pathsDotsSequencesAndVersionsPreserved: true, audioRows, attempts, navigation, screenshots, errors, externalRequests,
    verificationScope: 'Production Chromium student mouse traces for all 15 new approvals, all 15 next-letter transitions, phone/tablet catalogue and teacher-row captures; no teacher or physical pupil/device assessment inferred.' };
  writeFileSync('output/verification/letter-batch-3-approval.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ studentReady: 37, approvedBatch: 15, preservedCatalogueEntries: 22, audioApprovalsPreserved: 37,
    studentTraces: attempts.length, navigationChecks: navigation.length, screenshots: screenshots.length, errors, externalRequests }));
} finally { await browser.close(); }
