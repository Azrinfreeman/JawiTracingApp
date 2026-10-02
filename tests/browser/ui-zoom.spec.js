import { test, expect } from '@playwright/test';
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw } from './helpers/tracing.js';

// A 1280 × 900 display at 200% page zoom has 640 × 450 CSS pixels.
// DPR 2 preserves that physical resolution while testing the responsive reflow.
test('200% zoom-equivalent reflow keeps navigation, writing and adult controls usable', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL,
    viewport: { width: 640, height: 450 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    const fits = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/'); await dismissSplash(page); await fits();
    await expect(page.locator('.welcome-note')).toContainText('Buku Jawi Saya');
    await page.getByRole('button', { name: 'Bintang', exact: true }).click();
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await fits();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
    await page.getByRole('button', { name: 'Ta', exact: true }).click();
    await draw(page, (await boardModels(page)).strokes[0]);
    for (let i = 1; i <= 2; i++) {
      const pad = page.getByRole('button', { name: `Tambah titik ${i} daripada 2`, exact: true });
      await pad.scrollIntoViewIfNeeded(); await expect(pad).toBeInViewport(); await pad.click();
    }
    await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ta!', exact: true })).toBeVisible();
    await fits();
    await page.getByRole('button', { name: /cuba salin sendiri/ }).click();
    const save = await page.getByRole('button', { name: 'Simpan untuk guru', exact: true }).boundingBox();
    expect(save.height).toBeGreaterThanOrEqual(56); await fits();
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    const preview = await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).boundingBox();
    expect(preview.height).toBeGreaterThanOrEqual(56);
    await expect(page.getByLabel('Jenis latihan')).toHaveValue('play'); await fits();
    await page.getByLabel('Huruf untuk semakan suara').selectOption('ta-marbuta');
    await expect(page.locator('.audio-review-transcript')).toContainText('Ta marbutah');
    await page.getByRole('button', { name: 'Padam rekod', exact: true }).click();
    await expect(page.getByRole('group', { name: 'Sahkan pemadaman' })).toBeVisible();
    await page.getByRole('button', { name: 'Batal', exact: true }).click(); await fits();
  } finally { await context.close(); }
});
