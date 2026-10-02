import { test, expect } from '@playwright/test';
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw, openLesson } from './helpers/tracing.js';

const viewports = [[320, 740], [390, 844], [768, 1024], [1280, 900], [844, 390]];
const noOverflow = page => expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
function contrast(a, b) {
  const luminance = colour => colour.match(/[\d.]+/g).slice(0, 3).map(Number)
    .map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4)
    .reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}

test('welcome profiles and catalogue stay readable with two, four or six columns', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height }); await page.goto('/'); await dismissSplash(page);
    await noOverflow(page);
    const start = await page.getByRole('button', { name: 'Jom mula', exact: true }).boundingBox();
    expect(start.height).toBeGreaterThanOrEqual(56);
    for (const profile of ['Bunga', 'Daun', 'Bintang']) {
      const button = page.getByRole('button', { name: profile, exact: true });
      const box = await button.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
    await page.getByRole('button', { name: 'Bintang', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Bintang', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.profile-chip.selected .profile-check svg')).toBeVisible();
    if (width <= 700) {
      expect(await page.locator('.hero-art').evaluate(node => node.getBoundingClientRect().top))
        .toBeGreaterThan(start.y + start.height);
      await expect(page.locator('.teacher-label-short')).toBeVisible();
    }
    await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
    await expect(page.locator('.letter-card:enabled')).toHaveCount(37); await noOverflow(page);
    const columns = await page.locator('.letter-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width <= 700 ? 2 : width < 1280 ? 4 : 6);
    expect(await page.locator('.card-caption').first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(14);
    expect(await page.locator('.card-glyph').first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(72);
  }
});

test('rendered text, control boundaries and keyboard focus have contrast', async ({ page }) => {
  await page.goto('/'); await dismissSplash(page);
  const pairs = await page.evaluate(() => {
    const style = selector => getComputedStyle(document.querySelector(selector));
    const body = style('body'), primary = style('.start-button'), muted = style('.hero-description'), profile = style('.profile-chip');
    return [[body.color, body.backgroundColor, 4.5], [primary.color, primary.backgroundColor, 4.5],
      [muted.color, body.backgroundColor, 4.5], [profile.borderColor, profile.backgroundColor, 3]];
  });
  for (const [foreground, background, minimum] of pairs) expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum);
  await page.getByRole('button', { name: 'Bunga', exact: true }).focus(); await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Daun', exact: true })).toBeFocused();
  const focus = await page.getByRole('button', { name: 'Daun', exact: true }).evaluate(node => {
    const s = getComputedStyle(node); return { width: parseFloat(s.outlineWidth), colour: s.outlineColor, background: s.backgroundColor };
  });
  expect(focus.width).toBeGreaterThanOrEqual(3); expect(contrast(focus.colour, focus.background)).toBeGreaterThanOrEqual(3);
  await page.keyboard.press('Enter'); await expect(page.getByRole('button', { name: 'Daun', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('body completion never places celebration over the paper or moves its square', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height }); await openLesson(page, 'Ba', 'play');
    const model = await boardModels(page), before = await page.locator('.trace-board').boundingBox();
    expect(before.width).toBeCloseTo(before.height, 1);
    const badge = await page.locator('.trace-number-badge').first().boundingBox(); expect(badge.width).toBeGreaterThanOrEqual(35.9);
    expect(await page.locator('.trace-number-label').first().evaluate(node => parseFloat(getComputedStyle(node).fontSize) * node.getScreenCTM().a)).toBeGreaterThanOrEqual(11.9);
    await draw(page, model.strokes[0]);
    await expect(page.locator('.lesson-feedback .leaf-friend')).toBeVisible();
    await expect(page.locator('.board-wrap .play-feedback, .board-wrap .board-tip, .board-wrap .board-corner')).toHaveCount(0);
    const after = await page.locator('.trace-board').boundingBox();
    expect(after.width).toBeCloseTo(before.width, 2); expect(after.height).toBeCloseTo(before.height, 2);
    expect(after.y).toBeCloseTo(before.y, 2); expect(after.x).toBeCloseTo(before.x, 2);
    const paperAndReward = await page.locator('.lesson-feedback .leaf-friend').boundingBox();
    expect(paperAndReward.y).toBeGreaterThanOrEqual(after.y + after.height);
    await noOverflow(page);
  }
});

test('teacher content, confirmations and previews fit narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await dismissSplash(page); await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await expect(page.getByLabel('Jenis latihan')).toHaveValue('play'); await noOverflow(page);
  await page.getByRole('button', { name: 'Padam rekod', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Sahkan pemadaman' })).toBeVisible();
  await page.getByRole('button', { name: 'Batal', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Sahkan pemadaman' })).toHaveCount(0);
  const content = page.getByRole('heading', { name: 'Kandungan & semakan', exact: true }).locator('..');
  await content.scrollIntoViewIfNeeded(); await expect(content.locator('tbody tr')).toHaveCount(37);
  const scroll = await content.locator('.table-scroll').evaluate(node => ({ scroll: node.scrollWidth, width: node.clientWidth }));
  expect(scroll.scroll).toBeGreaterThan(scroll.width); await noOverflow(page);
  await page.getByLabel('Jenis latihan').selectOption('precision');
  await content.getByRole('button', { name: 'Buka', exact: true }).first().click();
  await expect(page.locator('.board-corner')).toContainText('KURANG PANDUAN');
  await expect(page.locator('.preview-banner')).toContainText('Pratonton dewasa'); await noOverflow(page);
});

test('a phone completion shows the next-letter action without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await dismissSplash(page); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Nga', exact: true }).click();
  await draw(page, (await boardModels(page)).strokes[0]);
  for (let i = 0; i < 3; i++) {
    const dot = (await boardModels(page)).dots[i]; await page.mouse.click(dot.x, dot.y);
  }
  await expect(page.getByRole('heading', { name: 'Kamu sudah ikut huruf Nga!', exact: true })).toBeVisible();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const box = await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(56); expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(740); await noOverflow(page);
  await page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Fa', exact: true })).toBeVisible();
});
