import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openLesson, boardModels, draw, movePoints } from '../tests/browser/helpers/tracing.js';
import letters from '../src/content/letters.json' with { type: 'json' };

const directory = 'output/screenshots'; mkdirSync(directory, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:5173', viewport: { width: 1280, height: 1000 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [], externalRequests = [], layouts = [], captures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:5173|data:|blob:)/.test(request.url())) externalRequests.push(request.url()); });
  async function capture(name, fullPage = false) { const path = `${directory}/${name}.png`; await page.screenshot({ path, fullPage }); captures.push(path); }
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1280, 1000], [844, 390]]) {
    await page.setViewportSize({ width, height }); await openLesson(page, 'Ta', 'play'); await page.evaluate(() => document.fonts.ready);
    let model = await boardModels(page); const stroke = model.strokes[0], middle = Math.floor(stroke.length / 3);
    await capture(`play-start-${width}`, true);
    // Use viewport captures while held: full-page resizing legitimately releases capture.
    model = await boardModels(page);
    await page.mouse.move(model.strokes[0][0].x, model.strokes[0][0].y); await page.mouse.down();
    await movePoints(page, model.strokes[0].slice(1, middle)); await capture(`play-colour-${width}`);
    const point = model.strokes[0][middle - 1];
    await page.mouse.move(point.x + model.scale * 150, point.y); await expect(page.locator('.board-tip')).toContainText('Sambung');
    await capture(`play-paused-${width}`); await page.mouse.move(point.x, point.y); await movePoints(page, model.strokes[0].slice(middle)); await page.mouse.up();
    await expect(page.getByRole('button', { name: 'Tambah titik 1 daripada 2' })).toBeVisible(); await capture(`play-dots-${width}`, true);
    await page.getByRole('button', { name: 'Tambah titik 1 daripada 2' }).click();
    await page.getByRole('button', { name: 'Tambah titik 2 daripada 2' }).click();
    await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ta!' })).toBeVisible(); await capture(`play-result-${width}`, true);
    layouts.push({ width, height, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  }
  await page.setViewportSize({ width: 1280, height: 1000 }); await page.getByRole('button', { name: 'Ruang guru' }).click(); await capture('play-teacher', true);
  await openLesson(page, 'Ba', 'play');
  const baSource = `**${letters.find(letter => letter.id === 'ba').audio.name.src}`;
  await page.route(baSource, route => route.fulfill({ status: 404, body: '' }));
  await page.getByRole('button', { name: 'Dengar', exact: true }).click();
  await expect(page.locator('.audio-notice')).toContainText('Audio tidak dapat dimainkan'); await capture('play-audio-missing', true);
  await page.unroute(baSource);
  const model = await boardModels(page); await draw(page, model.strokes[0]); await page.getByRole('button', { name: 'Tambah titik 1 daripada 1' }).click();
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri' }).click(); const box = await page.locator('.trace-board').boundingBox();
  await draw(page, [{ x: box.x+box.width*.2, y:box.y+box.height*.3 }, { x:box.x+box.width*.7,y:box.y+box.height*.5 }, { x:box.x+box.width*.2,y:box.y+box.height*.8 }]);
  await expect(page.locator('.pupil-ink')).toHaveCount(1); await capture('play-free-copy', true);
  expect(errors).toEqual([]); expect(externalRequests).toEqual([]); expect(layouts.every(l => !l.overflow)).toBe(true);
  const result = { verifiedOn: '2026-10-02', screenshots: captures.length, captures, errors, externalRequests, layouts,
    scope: 'Native mouse input: assisted route fill, retained paused prefix, same-pointer recovery, equivalent dot pads, original reduced-motion reward, teacher disclosure, missing audio and actual free copying.' };
  writeFileSync('output/screenshots/play-render-check.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} finally { await browser.close(); }
