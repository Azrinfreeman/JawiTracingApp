import { test, expect } from '@playwright/test';
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw, menuAction, tapDots } from './helpers/tracing.js';
import { treatAllModelsAsReady } from './helpers/readyCatalogue.js';
// Mechanics spec: every authored model is served as student-ready; the real gate is covered elsewhere.
test.beforeEach(async ({ context }) => { await treatAllModelsAsReady(context); });

async function open(page, letter = 'Alif') {
  await page.goto('/'); await dismissSplash(page); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: letter, exact: true }).click(); await expect(page.getByRole('button', { name: 'Menu permainan', exact: true })).toBeEnabled();
}
const signal = (page, name) => page.evaluate(event => window.dispatchEvent(new Event(`taman-jawi:${event}`)), name);
async function installBridge(page) {
  await page.addInitScript(() => { window.nativeExports = []; window.nativeExits = 0; window.TamanJawiAndroid = {
    saveJson: (name, content) => window.nativeExports.push({ name, content }), confirmExit: () => window.nativeExits++,
  }; });
}

test('Android fullscreen uses the native bridge when browser fullscreen is unavailable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.addInitScript(() => {
    window.nativeFullscreen = true; window.nativeFullscreenCalls = [];
    window.TamanJawiAndroid = {
      isFullscreen: () => window.nativeFullscreen,
      setFullscreen: enabled => { window.nativeFullscreen = enabled; window.nativeFullscreenCalls.push(enabled); window.dispatchEvent(new Event('taman-jawi:viewport')); },
    };
    HTMLElement.prototype.requestFullscreen = () => { throw new Error('Browser fullscreen must not be used in the native app'); };
  });
  await page.goto('/'); await dismissSplash(page);
  const fullscreen = page.getByRole('button', { name: 'Paparan penuh', exact: true });
  await fullscreen.click(); await fullscreen.click();
  expect(await page.evaluate(() => window.nativeFullscreenCalls)).toEqual([false, true]);
  await expect(page.locator('.fullscreen-notice')).toHaveCount(0);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await expect(page.locator('.letter-grid-host')).toBeVisible();
});

test('Android viewport notifications refit the current lesson without a browser resize event', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.addInitScript(() => {
    const viewport = new EventTarget(); viewport.width = 360; viewport.height = 740;
    Object.defineProperty(window, 'visualViewport', { value: viewport });
    window.resizeNativeViewport = height => { viewport.height = height; window.dispatchEvent(new Event('taman-jawi:viewport')); };
  });
  await open(page, 'Ba'); await expect(page.locator('.app-shell')).toHaveCSS('height', '740px');
  await page.evaluate(() => window.resizeNativeViewport(600)); await expect(page.locator('.app-shell')).toHaveCSS('height', '600px');
  await expect(page.locator('.trace-space')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  await page.evaluate(() => window.resizeNativeViewport(740)); await expect(page.locator('.app-shell')).toHaveCSS('height', '740px');
  await draw(page, (await boardModels(page)).strokes[0]); await tapDots(page);
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ba!', exact: true })).toBeVisible();
});

test('Android export hands the complete teacher payload to the document bridge', async ({ page }) => {
  await installBridge(page); await open(page); await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.locator('.book-completion')).toBeVisible(); await menuAction(page, 'Ruang guru');
  await page.getByRole('button', { name: 'Eksport kemajuan', exact: true }).click();
  const exported = await page.evaluate(() => window.nativeExports); expect(exported).toHaveLength(1);
  expect(exported[0].name).toBe('taman-jawi-kemajuan.json'); const payload = JSON.parse(exported[0].content);
  expect(payload.exportVersion).toBe(2); expect(payload.progress.attempts).toHaveLength(1);
  expect(payload.progress.attempts[0]).toMatchObject({ letterId: 'alif', outcome: 'playComplete', preview: false });
  expect(payload.matches.matches).toEqual([]);
});

test('Android Back preserves unsaved copying, then returns through contents before exit', async ({ page }) => {
  await installBridge(page); await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page);
  await draw(page, (await boardModels(page)).strokes[0]); await expect(page.locator('.book-completion')).toBeVisible();
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Menu permainan', exact: true })).toBeEnabled(); await page.locator('.trace-board').scrollIntoViewIfNeeded();
  const box = await page.locator('.trace-board').boundingBox(); await draw(page, [{ x: box.x + 40, y: box.y + 60 }, { x: box.x + 80, y: box.y + 110 }]);
  await expect(page.locator('.pupil-ink')).toHaveCount(1); await signal(page, 'back');
  await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible(); await page.getByRole('button', { name: 'Kembali', exact: true }).click();
  await expect(page.locator('.pupil-ink')).toHaveCount(1); await signal(page, 'back'); await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hari ini, huruf apa?', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.length)).toBe(1);
  await signal(page, 'back'); await expect(page.getByRole('button', { name: 'Jom mula', exact: true })).toBeVisible();
  await signal(page, 'back'); expect(await page.evaluate(() => window.nativeExits)).toBe(1);
});

test('Android background cancels held writing without erasing accepted colour', async ({ page }) => {
  await open(page, 'Ba'); let model = await boardModels(page), points = model.strokes[0];
  await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  for (const point of points.slice(1, 35)) await page.mouse.move(point.x, point.y);
  const fill = page.locator('.play-fill'); await expect(fill).toBeVisible();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const saved = await fill.getAttribute('data-measured-frontier'); await signal(page, 'pause');
  for (const point of points.slice(35)) await page.mouse.move(point.x, point.y); await page.mouse.up();
  expect(await fill.getAttribute('data-measured-frontier')).toBe(saved);
  model = await boardModels(page); await draw(page, model.strokes[0].slice(33)); await tapDots(page);
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Ba!', exact: true })).toBeVisible();
});

test('Android background resolves one pending page turn and stops a demonstration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await page.addStyleTag({ content: '.book-fold { animation: none !important; }' });
  await menuAction(page, 'Huruf seterusnya'); await expect(page.locator('.book-fold')).toBeVisible();
  await signal(page, 'pause'); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible(); await expect(page.locator('.book-fold')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Menu permainan', exact: true })).toBeEnabled(); await menuAction(page, 'Tunjuk cara');
  await expect(page.locator('.demonstration-ink').first()).toBeVisible(); await signal(page, 'pause');
  await expect(page.locator('.demonstration-ink')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts.length)).toBe(0);
});

test('Android background pauses the shared Duo clock and Back uses the existing exit confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await page.goto('/'); await dismissSplash(page); await page.clock.install();
  await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click(); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click(); await page.getByLabel('Bilangan pusingan').selectOption('3'); await page.getByRole('button', { name: 'Uji dua sentuhan', exact: true }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click();
  for (let slot = 0; slot < 2; slot++) await page.locator(`[data-player-slot="${slot}"]`).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  await page.clock.fastForward(3100); await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  await signal(page, 'pause'); await expect(page.getByRole('dialog', { name: 'Rehat sekejap', exact: true })).toBeVisible();
  const time = await page.locator('.race-clock').innerText(); await page.clock.fastForward(60000); expect(await page.locator('.race-clock').innerText()).toBe(time);
  await signal(page, 'back'); await expect(page.getByRole('dialog', { name: 'Tamatkan cabaran?', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Terus bermain', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Rehat sekejap', exact: true })).toBeVisible();
});
