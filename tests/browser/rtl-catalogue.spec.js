import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dismissSplash } from './helpers/navigation.js';
import { treatAllModelsAsReady } from './helpers/readyCatalogue.js';
// Layout spec: the catalogue reads right to left (Alif top-right), the DOM and Tab order stay Alif first.
test.beforeEach(async ({ context }) => { await treatAllModelsAsReady(context); });
const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/rtl-catalogue';
mkdirSync(evidence, { recursive: true });
const settle = page => page.evaluate(() => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))));
const cards = page => page.locator('.letter-grid .letter-card').evaluateAll(nodes => nodes.map(n => { const b = n.getBoundingClientRect(); return { name: n.querySelector('.card-name').textContent, left: b.left, right: b.right, top: b.top }; }));

for (const [width, height] of [[320, 740], [768, 1024], [1280, 800], [1920, 1080]]) test(`catalogue runs right to left at ${width}x${height}`, async ({ page, browserName }) => {
  await page.setViewportSize({ width, height }); await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.letter-grid')).toBeVisible(); await settle(page);
  const grid = page.locator('.letter-grid'); await expect(grid).toHaveAttribute('dir', 'rtl');
  const list = await cards(page); expect(list.length).toBeGreaterThan(3);
  expect(list[0].name).toBe('Alif'); expect(list[1].name).toBe('Ba');
  // Row-major, right to left: within a row each card is left of the previous; a new row starts at the right edge again.
  const rowRight = Math.max(...list.map(c => c.right));
  expect(list[0].right).toBeCloseTo(rowRight, 0);
  for (let i = 1; i < list.length; i++) {
    if (Math.abs(list[i].top - list[i - 1].top) < 4) expect(list[i].right).toBeLessThan(list[i - 1].left + 1);
    else { expect(list[i].top).toBeGreaterThan(list[i - 1].top); expect(list[i].right).toBeCloseTo(rowRight, 0); }
  }
  // DOM and Tab order stay Alif first, matching the visual order.
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => { const names = [...document.querySelectorAll('.letter-grid .letter-card')].map(n => n.querySelector('.card-name').textContent); return names; });
  expect(focused[0]).toBe('Alif');
  // Card internals keep their left-to-right layout: the number badge is on the card's left.
  const inside = await page.locator('.letter-card').first().evaluate(node => { const c = node.getBoundingClientRect(), n = node.querySelector('.station-number').getBoundingClientRect(); return n.left - c.left < c.right - n.right; });
  expect(inside).toBe(true);
  await page.screenshot({ path: `${evidence}/${browserName}-catalogue-${width}.png` });
});

test('pager is mirrored for the catalogue and still pages one step at a time', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await settle(page);
  const previous = page.getByRole('button', { name: 'Halaman huruf sebelumnya', exact: true }), next = page.getByRole('button', { name: 'Halaman huruf seterusnya', exact: true });
  const [p, n] = await Promise.all([previous.boundingBox(), next.boundingBox()]);
  expect(n.x).toBeLessThan(p.x);
  await expect(previous).toHaveText('Sebelumnya →'); await expect(next).toHaveText('← Seterusnya');
  const first = (await cards(page))[0].name; await next.click(); await settle(page);
  const second = (await cards(page))[0].name; expect(second).not.toBe(first);
  await expect(page.locator('.screen-pager span')).toContainText('2 /');
  const right = (await cards(page))[0].right, rowRight = Math.max(...(await cards(page)).map(c => c.right));
  expect(right).toBeCloseTo(rowRight, 0);
  await previous.click(); await settle(page); expect((await cards(page))[0].name).toBe(first);
  await page.screenshot({ path: `${evidence}/${browserName}-pager.png` });
});
