import { test } from './helpers/localTest.js';
import { expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dismissSplash, chooseLetter } from './helpers/navigation.js';
import { boardModels, draw, openMenu, menuAction } from './helpers/tracing.js';
import { instrument } from './helpers/audio.js';

const evidence = 'output/verification/gameplay-navigation';
mkdirSync(evidence, { recursive: true });
const back = page => page.getByRole('button', { name: 'Kembali ke Isi Kandungan', exact: true });
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts);
async function open(page, label = 'Ca') {
  await instrument(page); await page.goto('/'); await dismissSplash(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await chooseLetter(page, label); await expect(back(page)).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
}
async function layout(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const result = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('.stage-navigation button, .stage-badge button, .fit-dialog button, .completion-card button')].filter(node => getComputedStyle(node).visibility !== 'hidden' && node.getBoundingClientRect().width);
    const bad = controls.filter(node => { const r = node.getBoundingClientRect(); return r.width < 48 || r.height < 48 || r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight || node.scrollWidth > node.clientWidth + 3 || node.scrollHeight > node.clientHeight + 3; }).map(node => node.textContent);
    const obstacles = [...document.querySelectorAll('[data-stage-control]')].map(node => node.getBoundingClientRect());
    const collisions = [...document.querySelectorAll('.reference-outline, .reference-stroke, .reference-dot, .trace-number-badge, .trace-number-label-backdrop')].filter(node => getComputedStyle(node).opacity !== '0').filter(node => {
      const r = node.getBoundingClientRect(); return obstacles.some(c => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top);
    }).map(node => node.getAttribute('class'));
    return { bad, collisions, scrollX, scrollY };
  });
  expect(result).toEqual({ bad: [], collisions: [], scrollX: 0, scrollY: 0 });
}

for (const [width, height] of [[320, 600], [390, 844], [768, 1024], [1024, 768], [1920, 1080], [3840, 2160]]) {
  test(`labelled controls and menu sections fit ${width}x${height}`, async ({ page, browserName }) => {
    test.skip(width === 3840 && browserName === 'webkit', 'Recorded Windows WebKit 4K capture limitation; Chromium covers 4K.');
    test.setTimeout(90000); await page.setViewportSize({ width, height }); await open(page);
    for (const letter of ['Ca', 'Mim', 'Lam', 'Ha (ه)']) {
      if (letter !== 'Ca') { await back(page).click(); await chooseLetter(page, letter); }
      await layout(page);
    }
    await back(page).click(); await chooseLetter(page, 'Ca');
    await page.screenshot({ path: `${evidence}/${browserName}-${width}-stage.png`, animations: 'disabled' });
    await openMenu(page);
    const dialog = page.getByRole('dialog', { name: 'Menu permainan' });
    for (const section of ['Bantuan', 'Pilih huruf', 'Tetapan']) {
      await dialog.getByRole('tab', { name: section }).click(); await layout(page);
      await expect(dialog.getByRole('tab', { name: section })).toHaveAttribute('aria-selected', 'true');
    }
    await page.screenshot({ path: `${evidence}/${browserName}-${width}-settings.png`, animations: 'disabled' });
    await dialog.getByRole('button', { name: 'Audio: Hidup', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Audio: Senyap', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await dialog.getByRole('button', { name: 'Sambung jejak', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await back(page).click(); await expect(page.getByRole('button', { name: 'Ca', exact: true })).toBeVisible();
  });
}

test('Back cancels held tracing and demonstration and restores the catalogue anchor', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await open(page, 'Mim');
  const model = await boardModels(page); await page.mouse.move(model.strokes[0][0].x, model.strokes[0][0].y); await page.mouse.down();
  await back(page).dispatchEvent('click'); await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Mim', exact: true })).toBeVisible(); expect(await attempts(page)).toHaveLength(0);
  await chooseLetter(page, 'Mim'); await menuAction(page, 'Tunjuk cara');
  await expect(page.locator('.demonstration-ink').first()).toBeVisible(); await back(page).click();
  await expect(page.getByRole('button', { name: 'Mim', exact: true })).toBeVisible();
  await page.waitForTimeout(1700); expect(await attempts(page)).toHaveLength(0); expect(errors).toEqual([]);
});

test('conditional restart preserves progress on cancel and resets on confirmation', async ({ page }) => {
  await open(page, 'Ba'); const model = await boardModels(page); await draw(page, model.strokes[0]);
  const frontier = await page.locator('.play-fill').first().getAttribute('data-measured-frontier');
  await openMenu(page); await page.getByRole('dialog', { name: 'Menu permainan' }).getByRole('button', { name: 'Cuba lagi', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Mula semula?' }); await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: 'Sambung', exact: true }).click();
  expect(await page.locator('.play-fill').first().getAttribute('data-measured-frontier')).toBe(frontier);
  await menuAction(page, 'Cuba lagi'); await expect(page.locator('.play-fill')).toHaveCount(0);
  expect(await attempts(page)).toHaveLength(0);
});

test('completion stays visible before choices, and Back cancels the pending panel', async ({ page, browserName }) => {
  await open(page, 'Alif'); await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.locator('.book-completed')).toHaveCount(1); await expect(page.locator('.completion-overlay')).toHaveCount(0);
  await back(page).click(); await page.waitForTimeout(1700);
  await expect(page.locator('.completion-overlay')).toHaveCount(0); expect(await attempts(page)).toHaveLength(1);
  await chooseLetter(page, 'Alif'); await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.getByRole('button', { name: 'Pilih huruf lain', exact: true })).toBeVisible();
  await page.screenshot({ path: `${evidence}/${browserName}-completion-choices.png`, animations: 'disabled' });
  await layout(page); await page.getByRole('button', { name: 'Pilih huruf lain', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Alif, pernah dijejak', exact: true })).toBeVisible();
});

test('visible and Android Back preserve unsaved copying until save or discard', async ({ page }) => {
  await open(page, 'Alif'); await draw(page, (await boardModels(page)).strokes[0]);
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
  await expect(back(page)).toBeEnabled(); const box = await page.locator('.trace-board').boundingBox();
  await draw(page, [{ x: box.x + 100, y: box.y + 150 }, { x: box.x + 180, y: box.y + 230 }]);
  await back(page).click(); const confirm = page.getByRole('dialog', { name: 'Tulisan belum disimpan' });
  await expect(confirm).toBeVisible(); await confirm.getByRole('button', { name: 'Kembali', exact: true }).click();
  await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event('taman-jawi:back'))); await expect(confirm).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('taman-jawi:back'))); await expect(confirm).toHaveCount(0);
  await expect(page.locator('.pupil-ink')).toHaveCount(1);
  await openMenu(page); await page.getByRole('dialog', { name: 'Menu permainan' }).getByRole('button', { name: 'Cuba lagi', exact: true }).click();
  await page.getByRole('dialog', { name: 'Tulisan belum disimpan' }).getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.locator('.pupil-ink')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.length)).toBe(1);
  await draw(page, [{ x: box.x + 100, y: box.y + 150 }, { x: box.x + 180, y: box.y + 230 }]);
  await back(page).click(); await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.locator('.letter-grid')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.length)).toBe(2);
});

test('menu tabs use keyboard navigation and return focus to Menu', async ({ page }) => {
  await open(page); await openMenu(page);
  const dialog = page.getByRole('dialog', { name: 'Menu permainan' });
  await dialog.getByRole('tab', { name: 'Bantuan' }).focus(); await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('tab', { name: 'Pilih huruf' })).toBeFocused();
  await page.keyboard.press('End'); await expect(dialog.getByRole('tab', { name: 'Tetapan' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Menu permainan', exact: true })).toBeFocused();
});

for (const mode of ['solo', 'duo']) test(`${mode} has one global exit, pauses safely and returns to challenge setup`, async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  await page.goto('/'); await dismissSplash(page); await page.clock.install();
  await page.getByRole('button', { name: mode === 'duo' ? 'Duo 1v1' : /Cabaran trofi/ }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await page.getByLabel('Bilangan pusingan').selectOption('3');
  if (mode === 'duo') { await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click(); }
  else await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  const exit = page.locator('.stage-navigation').getByRole('button', { name: 'Keluar cabaran', exact: true });
  await expect(exit).toHaveCount(1);
  await page.screenshot({ path: `${evidence}/${browserName}-${mode}-navigation.png`, animations: 'disabled' });
  for (const slot of mode === 'duo' ? [0, 1] : [0]) await page.locator(`[data-player-slot="${slot}"]`).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  await page.clock.fastForward(3100); await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  await exit.click(); const confirm = page.getByRole('dialog', { name: 'Tamatkan cabaran?' }); await expect(confirm).toBeVisible();
  const clock = await page.locator('.race-clock').innerText(); await page.clock.fastForward(5000); expect(await page.locator('.race-clock').innerText()).toBe(clock);
  await confirm.getByRole('button', { name: 'Terus bermain', exact: true }).click();
  await page.getByRole('dialog', { name: 'Rehat sekejap' }).getByRole('button', { name: 'Sambung bermain', exact: true }).click();
  await page.clock.fastForward(3100); await exit.click(); await confirm.getByRole('button', { name: 'Ya, keluar', exact: true }).click();
  await expect(page.locator('.match-settings')).toBeVisible();
});

for (const width of [320, 390]) test(`Solo phone header fits a long letter name at width ${width}`, async ({ page, browserName }) => {
  await page.setViewportSize({ width, height: width === 320 ? 600 : 844 });
  await instrument(page); await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: /Cabaran trofi/ }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await page.getByLabel('Kumpulan huruf').selectOption('ready');
  await page.getByLabel('Bilangan pusingan').selectOption('3');
  await page.evaluate(() => { let index = 35; Math.random = () => index-- === 7 ? 0 : .99999; });
  await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  await expect(page.locator('.arena-round')).toContainText('Ha (ح)');
  const overlap = await page.evaluate(() => {
    const a = document.querySelector('.arena-hud-left').getBoundingClientRect(), b = document.querySelector('.arena-hud-right').getBoundingClientRect();
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  });
  expect(overlap).toBe(false); await layout(page);
  await page.screenshot({ path: `${evidence}/${browserName}-${width}-solo-phone.png`, animations: 'disabled' });
  await page.locator('.stage-navigation').getByRole('button', { name: 'Keluar cabaran', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Tamatkan cabaran?' })).toBeVisible();
});
