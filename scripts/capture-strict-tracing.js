import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openLesson, boardModels, draw, movePoints } from '../tests/browser/helpers/tracing.js';

const directory = 'output/screenshots'; mkdirSync(directory, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:5173', viewport: { width: 1280, height: 1000 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [], externalRequests = [], layouts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:5173') && !request.url().startsWith('data:') && !request.url().startsWith('blob:')) externalRequests.push(request.url());
  });
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 1000 }); await openLesson(page, 'Ta');
    await page.evaluate(() => document.fonts.ready);
    const model = await boardModels(page), stroke = model.strokes[0], index = Math.floor(stroke.length / 3);
    await page.mouse.move(stroke[0].x, stroke[0].y); await page.mouse.down();
    await movePoints(page, stroke.slice(1, index + 1));
    await expect(page.locator('.pupil-ink[d]')).toHaveCount(1);
    // Full-page capture resizes Chromium's viewport and correctly cancels a held gesture.
    // Capture the visible viewport to inspect provisional ink without changing board size.
    await page.screenshot({ path: `${directory}/strict-valid-${width}.png` });
    const dx = stroke[index + 1].x - stroke[index - 1].x, dy = stroke[index + 1].y - stroke[index - 1].y;
    const length = Math.hypot(dx, dy);
    await page.mouse.move(stroke[index].x - dy / length * 55 * model.scale, stroke[index].y + dx / length * 55 * model.scale);
    await expect(page.locator('.gesture-blocked')).toBeVisible();
    await expect(page.locator('.pupil-ink')).toHaveCount(0);
    await page.screenshot({ path: `${directory}/strict-rejected-${width}.png` });
    await page.mouse.up(); await draw(page, stroke);
    await page.mouse.move(model.dots[0].x, model.dots[0].y); await page.mouse.down();
    await page.mouse.move(model.dots[0].x + 50 * model.scale, model.dots[0].y);
    await expect(page.locator('.gesture-blocked')).toBeVisible();
    await expect(page.locator('.pupil-ink')).toHaveCount(1); await expect(page.locator('.validated-dot')).toHaveCount(0);
    await page.screenshot({ path: `${directory}/strict-dot-rejected-${width}.png` });
    await page.mouse.up(); await page.mouse.click(model.dots[0].x, model.dots[0].y);
    await expect(page.locator('.validated-dot')).toHaveCount(1);
    await page.screenshot({ path: `${directory}/strict-dot-accepted-${width}.png`, fullPage: true });
    layouts.push({ width, height: 1000, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    await page.mouse.click(model.dots[1].x, model.dots[1].y);
    await expect(page.getByRole('heading', { name: 'Bagus, kamu sudah cuba!' })).toBeVisible();
  }
  await page.screenshot({ path: `${directory}/strict-result.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri' }).click();
  await page.locator('.trace-board').scrollIntoViewIfNeeded();
  const box = await page.locator('.trace-board').boundingBox();
  await draw(page, [{ x: box.x + box.width * .1, y: box.y + box.height * .2 },
    { x: box.x + box.width * .8, y: box.y + box.height * .6 }, { x: box.x + box.width * .2, y: box.y + box.height * .8 }]);
  await expect(page.locator('.pupil-ink[d]')).toHaveCount(1);
  await page.screenshot({ path: `${directory}/strict-free-copy.png`, fullPage: true });
  const result = { verifiedOn: '2026-10-02', screenshots: 18, errors, externalRequests, layouts,
    scope: 'Actual native mouse input: accepted segments, rollback, rejected dot trails, tap stamps, completion and unrestricted copying.' };
  writeFileSync('output/screenshots/strict-render-check.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
