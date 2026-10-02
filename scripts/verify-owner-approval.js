import { chromium, webkit, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dismissSplash } from '../tests/browser/helpers/navigation.js';
import letters from '../src/content/letters.json' with { type: 'json' };

mkdirSync('output/verification', { recursive: true });
mkdirSync('output/screenshots', { recursive: true });
const checks = [];
const missingAudioRows = letters.filter(letter => !letter.audio.name.src).length;
const draftAudioRows = letters.filter(letter => letter.audio.name.src && letter.audio.name.status !== 'approved').length;
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/'); await dismissSplash(page);
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Kembali dahulu', exact: true }).click();
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await expect(page.locator('.teacher-stat-grid')).toContainText('0pelajaran sedia untuk murid');
    const panel = page.locator('.teacher-panel').filter({ has: page.getByRole('heading', { name: 'Kandungan & semakan', exact: true }) });
    const approved = panel.getByRole('row').filter({ hasText: 'Diluluskan · pemilik projek' });
    await expect(approved).toHaveCount(12);
    await expect(panel.getByRole('row').filter({ hasText: 'Model belum tersedia' })).toHaveCount(25);
    await expect(panel.getByRole('cell', { name: 'Belum tersedia', exact: true })).toHaveCount(missingAudioRows);
    await expect(panel.getByRole('cell', { name: 'Draf suara · perlu semakan', exact: true })).toHaveCount(draftAudioRows);
    await expect(panel.getByText('2026-10-02', { exact: true })).toHaveCount(12);
    await expect(page.getByText('12 model huruf telah diluluskan oleh pemilik projek.', { exact: false })).toBeVisible();
    await panel.getByRole('heading').scrollIntoViewIfNeeded();
    const start = await panel.boundingBox();
    const third = await approved.nth(2).boundingBox();
    const screenshot = `output/screenshots/owner-approved-models-${name}.png`;
    await page.screenshot({ path: screenshot, clip: { x: start.x, y: start.y, width: start.width, height: third.y + third.height - start.y + 8 } });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
    checks.push({ browser: name, approvedModelRows: 12, pendingModelRows: 25, missingAudioRows, draftAudioRows, studentReady: 0, approvalDates: 12, screenshot, phoneOverflow: false, pageErrors: errors });
  } finally { await browser.close(); }
}
const result = { date: '2026-10-02', approvalSource: 'projectOwner', checks };
writeFileSync('output/verification/owner-approval.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
