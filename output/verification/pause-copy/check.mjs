import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dismissSplash } from '../../../tests/browser/helpers/navigation.js';
import { boardModels, draw } from '../../../tests/browser/helpers/tracing.js';
const directory = 'output/verification/pause-copy'; mkdirSync(directory, { recursive: true });
const report = { date: new Date().toISOString(), cases: [], errors: [] };
const browser = await chromium.launch();
try {
  for (const [mode, width, height] of [['solo', 320, 740], ['duo', 1024, 768], ['duo', 768, 1024]]) {
    const context = await browser.newContext({ viewport: { width, height }, baseURL: 'http://127.0.0.1:4173' }); const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.addInitScript(() => { Math.random = () => .99999; }); await page.goto('/'); await dismissSplash(page); await page.clock.install();
    if (mode === 'solo') await page.getByRole('button', { name: /Cabaran trofi/ }).click(); else await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click();
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    if (mode === 'solo') await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
    else { await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click(); }
    for (let slot = 0; slot < (mode === 'solo' ? 1 : 2); slot++) await page.locator(`[data-player-slot="${slot}"]`).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
    await page.clock.fastForward(3100); await expect(page.locator('.countdown-overlay')).toHaveCount(0);
    const stop = page.getByRole('button', { name: 'Berhenti', exact: true }), box = await stop.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(48); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `${directory}/${mode}-${width}x${height}-playing.png`, animations: 'disabled' });
    await stop.click(); await expect(page.getByRole('heading', { name: 'Rehat sekejap' })).toBeVisible();
    const pausedTime = await page.locator('.race-clock').innerText(); await page.clock.fastForward(5000); expect(await page.locator('.race-clock').innerText()).toBe(pausedTime);
    await page.getByRole('button', { name: 'Sambung bermain' }).click(); await page.clock.fastForward(3100); await expect(page.locator('.countdown-overlay')).toHaveCount(0);
    if (mode === 'solo') {
      const model = await boardModels(page); for (const stroke of model.strokes) await draw(page, stroke);
      for (let i = 0; i < model.dots.length; i++) await page.getByRole('button', { name: `Tambah titik ${i + 1} daripada ${model.dots.length}` }).click();
      await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible(); await page.getByRole('button', { name: 'Pusingan seterusnya' }).click();
      await page.getByRole('button', { name: 'Keluar', exact: true }).click(); await page.getByRole('button', { name: 'Ya, keluar', exact: true }).click();
      await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
      await expect(page.getByRole('columnheader', { name: 'Henti / peraturan', exact: true })).toBeVisible();
      const copy = await page.locator('main').innerText(); expect(copy).toMatch(/\d+ kali berhenti/); expect(copy).toMatch(/\d+ kali sambung/); expect(copy).not.toMatch(/\bjeda\b/i);
      await page.screenshot({ path: `${directory}/teacher-records.png`, fullPage: true, animations: 'disabled' });
    }
    report.cases.push({ mode, width, height, stopLabelFits: true, pauseFreezesClock: true, resumeWorks: true }); await context.close();
  }
  expect(report.errors).toEqual([]); writeFileSync(`${directory}/results.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
} finally { await browser.close(); }
