import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import letters from '../src/content/letters.json' with { type: 'json' };
import { validateCatalogue } from '../src/content/validateContent.js';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../tests/browser/helpers/tracing.js';

const ids = ['zal', 'zai', 'syin', 'sad', 'dad'];
const batch = letters.filter(letter => ids.includes(letter.id));
const before = JSON.parse(readFileSync('output/verification/letter-batch-2-approval-before.json', 'utf8'));
const audioApproval = JSON.parse(readFileSync('output/verification/audio-approval-metadata.json', 'utf8'));
for (const letter of letters) {
  const original = before.find(item => item.id === letter.id);
  if (ids.includes(letter.id)) {
    expect(letter.geometry.status).toBe('approved');
    expect(letter.geometry.review).toMatchObject({ revision: 2, date: '2026-10-02', kind: 'projectOwner',
      reference: 'docs/CONTENT_APPROVALS.md#approval-of-second-additional-batch-2026-10-02' });
    expect({ ...letter, geometry: { ...letter.geometry, status: original.geometry.status, review: original.geometry.review } }).toEqual(original);
  } else expect(letter).toEqual(original);
  const sha256 = createHash('sha256').update(readFileSync(`public${letter.audio.name.src}`)).digest('hex');
  expect(sha256).toBe(audioApproval.rows.find(row => row.id === letter.id).sha256);
}
const validation = validateCatalogue(letters);
expect(validation.errors).toEqual([]); expect(validation.results.filter(item => item.ready)).toHaveLength(22);
mkdirSync('output/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 1000 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [], externalRequests = [], screenshots = [], attempts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  async function garden() {
    await page.goto('/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.locator('.preview-banner')).toHaveCount(0);
    await expect(page.locator('.letter-card:enabled')).toHaveCount(22);
    await expect(page.getByRole('button', { name: 'Huruf tersedia', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => document.fonts.ready);
  }
  async function capture(name) {
    const path = `output/screenshots/letter-batch-2-approved-${name}.png`;
    await page.screenshot({ path, fullPage: true }); screenshots.push(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  for (const letter of batch) {
    await garden();
    await page.getByRole('button', { name: new RegExp(`^${letter.labelMs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:, pernah dijejak)?$`) }).click();
    await expect(page.locator('.start-dot')).toBeVisible();
    const model = await boardModels(page);
    for (const stroke of model.strokes) await draw(page, stroke);
    for (const dot of model.dots) await page.mouse.click(dot.x, dot.y);
    await expect(page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter.labelMs}!`, exact: true })).toBeVisible();
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt).toMatchObject({ letterId: letter.id, preview: false, geometryStatus: 'approved', audioStatus: 'approved', contentVersion: 2 });
    expect(attempt.metrics.dotCount).toBe(letter.geometry.dotTargets.length); attempts.push(attempt);
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1024 });
    await garden(); await capture(`garden-${width}`);
    await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
    await expect(page.locator('.letter-card')).toHaveCount(37);
    await expect(page.locator('.letter-card:disabled')).toHaveCount(15);
  }
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await expect(page.locator('.teacher-stat-grid')).toContainText('22pelajaran sedia untuk murid');
  await expect(page.locator('.draft-model-card')).toHaveCount(0);
  await expect(page.locator('.status-chip.approved')).toHaveCount(22);
  for (const letter of batch) {
    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: `${letter.glyph} ${letter.labelMs}`, exact: true }) });
    await expect(row).toContainText('Diluluskan · pemilik projek');
    await expect(row).toContainText('2026-10-02');
  }
  await capture('teacher-1280');
  expect(errors).toEqual([]); expect(externalRequests).toEqual([]);
  const report = { date: '2026-10-02', status: 'approved', source: 'The user explicitly wrote approve after the five-model implementation and review notes.',
    scope: 'Project-owner approval of Zal, Zai, Syin, Sad and Dad at existing content revision 2.',
    models: batch.map(letter => ({ id: letter.id, glyph: letter.glyph, contentVersion: letter.contentVersion, review: letter.geometry.review })),
    studentReady: 22, unavailableModels: 15, preservedCatalogueEntries: 32, audioApprovalsPreserved: 37,
    pathsDotsSequencesAndVersionsPreserved: true, attempts, screenshots, errors, externalRequests,
    verificationScope: 'Production Chromium student mouse traces and phone/tablet captures; no physical pupil/device assessment inferred.' };
  writeFileSync('output/verification/letter-batch-2-approval.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ studentReady: 22, approvedBatch: 5, preservedCatalogueEntries: 32, audioApprovalsPreserved: 37,
    studentTraces: attempts.length, screenshots: screenshots.length, errors, externalRequests }, null, 2));
} finally { await browser.close(); }
