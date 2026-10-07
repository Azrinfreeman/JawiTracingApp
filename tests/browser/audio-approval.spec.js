import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw, openTeacher } from './helpers/tracing.js';
// Student-ready lessons follow the catalogue, so approvals or revisions never need a count edit here.
const readyLessons = letters.filter(letter => letter.geometry.status === 'approved' && letter.audio.name.status === 'approved').length;

test('student can start an approved lesson, complete Ba and save an approved student attempt', async ({ page }) => {
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.preview-banner')).toHaveCount(0);
  await expect(page.locator('.letter-card:enabled')).toHaveCount(readyLessons);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  await expect(page.locator('.letter-card')).toHaveCount(36);
  await expect(page.locator('.letter-card:disabled')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ba', exact: true }).click();
  const model = await boardModels(page);
  for (const stroke of model.strokes) await draw(page, stroke);
  for (const dot of model.dots) await page.mouse.click(dot.x, dot.y);
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ba!', exact: true })).toBeVisible();
  const record = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record).toMatchObject({ letterId: 'ba', preview: false, audioStatus: 'approved', geometryStatus: 'approved', audioVersion: 2, outcome: 'playComplete' });
  await openTeacher(page);
  await expect(page.locator('.teacher-stat-grid')).toContainText(`${readyLessons}pelajaran sedia untuk murid`);
  await expect(page.getByRole('cell', { name: 'Diluluskan', exact: true })).toHaveCount(36);
  await expect(page.locator('.audio-review-panel')).toContainText('36 rakaman diluluskan');
  await expect(page.locator('.audio-review-transcript')).toContainText('Suara diluluskan');
  await expect(page.getByRole('cell', { name: 'Draf suara · perlu semakan', exact: true })).toHaveCount(0);
});
