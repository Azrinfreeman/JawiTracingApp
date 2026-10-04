import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dismissSplash } from './helpers/navigation.js';
import { menuAction, openTeacher } from './helpers/tracing.js';

const logoRoute = '**/branding/hanana-academy-logo.png';
const clockStart = new Date('2026-10-02T00:00:00Z');

async function pauseClock(page) {
  await page.clock.install({ time: clockStart });
  await page.clock.pauseAt(new Date(clockStart.getTime() + 1000));
}

async function welcomeFocused(page) {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Jom bermain');
  // React may commit after a clock step; let the scheduled focus frame run too.
  await expect.poll(async () => {
    await page.clock.runFor(32);
    return page.getByRole('heading', { level: 1 }).evaluate(heading => document.activeElement === heading);
  }).toBe(true);
}

test('fresh launch displays the unchanged local logo and automatically continues', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await pauseClock(page);
  const responsePromise = page.waitForResponse(logoRoute);
  await page.goto('/');
  await expect(page.locator('.splash-screen')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Taman Jawi', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Teruskan', exact: true })).toBeFocused();
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Jom mula' })).toHaveCount(0);
  const logo = page.getByRole('img', { name: 'Hanana Academy', exact: true });
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate(img => [img.naturalWidth, img.naturalHeight])).toEqual([375, 181]);
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  expect(await response.body()).toEqual(readFileSync(new URL('../../hanana-academy-logo.png', import.meta.url)));
  await page.clock.runFor(1799);
  await expect(page.locator('.splash-screen')).toBeVisible();
  await page.clock.runFor(1);
  await welcomeFocused(page);
  await expect(page.locator('.welcome .company-brand')).toBeVisible();
  await expect(page.locator('.site-footer .company-brand')).toBeVisible();
  expect(errors).toEqual([]);
});

test('manual continue cleans up its deadline and navigation never replays the splash', async ({ page }) => {
  await pauseClock(page); await page.goto('/');
  await dismissSplash(page); await welcomeFocused(page);
  await openTeacher(page);
  await page.clock.runFor(3000);
  await expect(page.locator('.teacher-page')).toBeVisible();
  await expect(page.locator('.splash-screen')).toHaveCount(0);
  await page.getByRole('button', { name: 'Taman Jawi, halaman utama' }).click();
  await page.clock.runFor(32);
  await page.getByRole('button', { name: 'Jom mula' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(37);
  await page.clock.runFor(32);
  await page.getByRole('button', { name: 'Alif', exact: true }).click();
  await expect(page.locator('.trace-board')).toBeVisible();
  await page.clock.runFor(100); await menuAction(page, 'Cuba lagi');
  await expect(page.locator('.splash-screen')).toHaveCount(0);
  await page.clock.runFor(100); await menuAction(page, 'Isi kandungan'); await expect(page.locator('.letter-grid-host')).toBeVisible();
  await page.getByRole('button', { name: 'Taman Jawi, halaman utama' }).click();
  await page.clock.runFor(32);
  await page.getByRole('group', { name: 'Profil tempatan' }).getByRole('button', { name: /Daun/ }).click();
  const saved = await page.evaluate(() => localStorage.getItem('taman-jawi.progress.v1'));
  await page.reload();
  await expect(page.locator('.splash-screen')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('taman-jawi.progress.v1'))).toBe(saved);
  await dismissSplash(page); await welcomeFocused(page);
  await expect(page.getByRole('group', { name: 'Profil tempatan' }).getByRole('button', { name: /Daun/ })).toHaveAttribute('aria-pressed', 'true');
});

test('keyboard continuation and automatic continuation both work with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await pauseClock(page); await page.goto('/');
  expect(await page.locator('.splash-content').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await expect(page.getByRole('button', { name: 'Teruskan', exact: true })).toBeFocused();
  await page.keyboard.press('Enter'); await welcomeFocused(page);
  await expect(page.getByRole('button', { name: 'Teruskan', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Teruskan', exact: true })).toBeFocused();
  await page.clock.runFor(1800); await welcomeFocused(page);
});

test('failed images show a text fallback and cannot block either continuation path', async ({ page }) => {
  await page.route(logoRoute, route => route.abort());
  await pauseClock(page); await page.goto('/');
  await expect(page.locator('.splash-screen .company-brand__fallback')).toHaveText('Hanana Academy');
  await expect(page.locator('.splash-screen img')).toHaveCount(0);
  await dismissSplash(page); await welcomeFocused(page);
  await expect(page.locator('.welcome .company-brand__fallback')).toBeVisible();
  await expect(page.locator('.site-footer .company-brand__fallback')).toBeVisible();
  await page.reload();
  await expect(page.locator('.splash-screen .company-brand__fallback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Teruskan', exact: true })).toBeFocused();
  await page.clock.runFor(1800); await welcomeFocused(page);
});

test('an unfinished logo request never blocks the button or automatic deadline', async ({ page }) => {
  let releaseRequest;
  const release = new Promise(resolve => { releaseRequest = resolve; });
  await page.route(logoRoute, async route => {
    await release;
    await route.abort();
  });
  try {
    await pauseClock(page); await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.splash-screen')).toBeVisible();
    expect(await page.locator('.splash-screen img').evaluate(img => img.complete)).toBe(false);
    await dismissSplash(page); await welcomeFocused(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.splash-screen')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Teruskan', exact: true })).toBeFocused();
    await page.clock.runFor(1800); await welcomeFocused(page);
  } finally {
    releaseRequest();
    await page.unrouteAll({ behavior: 'wait' });
  }
});

test('branding stays proportionate and footer stays visible on narrow and short screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await pauseClock(page);
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1280, 900], [844, 390]]) {
    await page.setViewportSize({ width, height }); await page.goto('/');
    const logo = page.locator('.splash-screen img');
    await expect.poll(() => logo.evaluate(img => img.naturalWidth)).toBe(375);
    const box = await logo.boundingBox();
    expect(box.width).toBeLessThanOrEqual(320);
    expect(box.width / box.height).toBeCloseTo(375 / 181, 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const action = page.getByRole('button', { name: 'Teruskan', exact: true });
    await action.scrollIntoViewIfNeeded(); const actionBox = await action.boundingBox();
    expect(actionBox.height).toBeGreaterThanOrEqual(48);
    await dismissSplash(page); await welcomeFocused(page);
    await expect(page.locator('.welcome .company-brand')).toBeVisible();
    const footer = page.locator('.site-footer .company-brand');
    await footer.scrollIntoViewIfNeeded(); await expect(footer).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Jom mula' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.clock.runFor(32);
  await page.getByRole('button', { name: 'Alif', exact: true }).click();
  const board = page.locator('.trace-board'); await board.scrollIntoViewIfNeeded();
  const before = await board.boundingBox();
  await page.locator('.site-footer .company-brand').scrollIntoViewIfNeeded();
  await expect(page.locator('.site-footer .company-brand')).toBeInViewport();
  await board.scrollIntoViewIfNeeded(); const after = await board.boundingBox();
  expect(after.width).toBeCloseTo(before.width, 2); expect(after.height).toBeCloseTo(before.height, 2);
});
