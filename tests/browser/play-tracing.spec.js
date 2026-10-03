import { test, expect } from '@playwright/test';
import { openLesson, boardModels, draw, movePoints } from './helpers/tracing.js';

const fill = page => page.locator('.play-fill').first();
const amount = async page => {
  // Native delivery can precede the batched SVG paint, particularly in WebKit.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return Number(await fill(page).getAttribute('data-measured-frontier'));
};
const completeHeading = (page, letter) => page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter}!` });
async function record(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1)); }
async function diagnostic(page) {
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByRole('tab', { name: 'Diagnostik', exact: true }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Eksport jejak sesi ini' }).click();
  let json = ''; for await (const chunk of await (await pending).createReadStream()) json += chunk.toString();
  return JSON.parse(json);
}

test('default play pauses without erasing colour; held-pointer return earns no bridge', async ({ page }) => {
  await openLesson(page, 'Alif', 'play');
  await expect(page.locator('.trace-board')).toHaveAttribute('data-interaction-policy', 'play-guided-v2');
  await expect(page.getByRole('button', { name: 'Kurang panduan', exact: true })).toHaveCount(0);
  const { strokes: [stroke], scale } = await boardModels(page), middle = Math.floor(stroke.length / 3);
  await page.mouse.move(stroke[0].x, stroke[0].y); await page.mouse.down();
  await movePoints(page, stroke.slice(1, middle)); await expect(fill(page)).toBeVisible();
  const saved = await amount(page), point = stroke[middle - 1];
  await page.mouse.move(point.x + 130 * scale, point.y);
  await expect(page.locator('.board-tip')).toContainText('Sambung di sini');
  expect(await amount(page)).toBe(saved); await expect(page.locator('.pupil-ink')).toHaveCount(0);
  await page.mouse.move(point.x, point.y); expect(await amount(page)).toBe(saved);
  await movePoints(page, stroke.slice(middle)); await page.mouse.up();
  await expect(completeHeading(page, 'Alif')).toBeVisible();
  const attempt = await record(page);
  expect(attempt.metrics.pauseEpisodes).toBeGreaterThan(0); expect(attempt.metrics.resumeCount).toBeGreaterThan(0);
  expect(attempt.outcome).toBe('playComplete'); expect(attempt.displayAssistance).toBe('routeFill');
  const exported = await diagnostic(page);
  expect(exported.visibleInk).toEqual([]);
  expect(exported.rawInk[0].some(p => Math.abs(p.x - exported.rawInk[0][0].x) > 120)).toBe(true);
  expect(exported.assistedFill[0].source).toBe('authoredGeometry');
  expect(exported.rawGestures[0].intervals.map(i => i.action)).toContain('pause');
});

test('wrong down can find the start; endpoint jumps cannot finish the letter', async ({ page }) => {
  await openLesson(page, 'Alif', 'play'); const { strokes: [stroke], scale } = await boardModels(page);
  await page.mouse.move(stroke[0].x + 150 * scale, stroke[0].y); await page.mouse.down();
  await page.mouse.move(stroke.at(-1).x, stroke.at(-1).y); await expect(fill(page)).toHaveCount(0);
  await page.mouse.move(stroke[0].x, stroke[0].y); await expect(fill(page)).toHaveCount(0);
  await movePoints(page, stroke.slice(1)); await page.mouse.up();
  await expect(completeHeading(page, 'Alif')).toBeVisible(); expect((await record(page)).metrics.ignoredStartGestures).toBe(1);
});

test('lift, resize, capture loss and demonstration preserve accepted play progress', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await openLesson(page, 'Alif', 'play');
  let { strokes: [stroke] } = await boardModels(page); const stop = 16;
  await draw(page, stroke.slice(0, stop)); const saved = await amount(page);
  await page.getByRole('button', { name: 'Tunjuk cara', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tunjuk cara', exact: true })).toBeEnabled(); expect(await amount(page)).toBe(saved);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts.length)).toBe(0);
  ({ strokes: [stroke] } = await boardModels(page));
  await page.locator('.trace-board').evaluate(svg => svg.addEventListener('pointerdown', e => svg.dataset.contact = e.pointerId));
  await page.mouse.move(stroke[stop - 1].x, stroke[stop - 1].y); await page.mouse.down(); await movePoints(page, stroke.slice(stop, stop + 5));
  const after = await amount(page); await page.setViewportSize({ width: 768, height: 1000 }); await page.mouse.up();
  expect(await amount(page)).toBe(after); ({ strokes: [stroke] } = await boardModels(page));
  await page.mouse.move(stroke[stop + 4].x, stroke[stop + 4].y); await page.mouse.down();
  await page.locator('.trace-board').evaluate(svg => svg.releasePointerCapture(Number(svg.dataset.contact))); await page.mouse.up();
  expect(await amount(page)).toBe(after); await draw(page, stroke.slice(stop + 4));
  await expect(completeHeading(page, 'Alif')).toBeVisible(); expect((await record(page)).assistance).toBe(1);
});

test('Ta dot drag keeps body; large pad and held keys commit one target per release', async ({ page }) => {
  await openLesson(page, 'Ta', 'play'); const { strokes: [stroke], dots } = await boardModels(page);
  await draw(page, stroke); const saved = await amount(page);
  await draw(page, dots); await expect(page.locator('.validated-dot')).toHaveCount(0); expect(await amount(page)).toBe(saved);
  let pad = page.getByRole('button', { name: 'Tambah titik 1 daripada 2' });
  const bounds = await pad.boundingBox(); expect(bounds.width).toBeGreaterThanOrEqual(48); expect(bounds.height).toBeGreaterThanOrEqual(64);
  await pad.scrollIntoViewIfNeeded(); await pad.focus();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.keyboard.down('Space'); await page.keyboard.down('Space');
  await expect(page.locator('.validated-dot')).toHaveCount(0); await page.keyboard.up('Space');
  await expect(page.locator('.validated-dot')).toHaveCount(1); await expect(fill(page)).toBeVisible();
  pad = page.getByRole('button', { name: 'Tambah titik 2 daripada 2' });
  await pad.scrollIntoViewIfNeeded(); await pad.focus();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.keyboard.down('Enter'); await page.keyboard.down('Enter');
  await expect(page.locator('.trace-board')).toBeVisible(); await page.keyboard.up('Enter');
  await expect(completeHeading(page, 'Ta')).toBeVisible(); const attempt = await record(page);
  expect(attempt.dotInputPolicy).toBe('validatedTapOrEquivalentPad'); expect(attempt.metrics.equivalentDotActions).toBe(2);
  const exported = await diagnostic(page);
  expect(exported.assistedMarks).toHaveLength(2); expect(exported.visibleInk).toHaveLength(0);
  expect(exported.assistedMarks.every(mark => mark.coordinateSpace === 'clientCSS' && mark.inputSource === 'equivalentPadKeyboard')).toBe(true);
});

test('native pad drag outside does not place a dot; a new contained press can finish', async ({ page }) => {
  await openLesson(page, 'Ba', 'play'); await draw(page, (await boardModels(page)).strokes[0]);
  const pad = page.getByRole('button', { name: 'Tambah titik 1 daripada 1' }); await pad.scrollIntoViewIfNeeded();
  const box = await pad.boundingBox(), p = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x, box.y - 40); await page.mouse.move(p.x, p.y); await page.mouse.up();
  await expect(page.locator('.validated-dot')).toHaveCount(0); await expect(fill(page)).toBeVisible();
  await pad.click(); await expect(completeHeading(page, 'Ba')).toBeVisible(); expect((await record(page)).metrics.equivalentDotActions).toBe(1);
});

test('diagnostic gesture cap offers continuation and retains the coloured prefix', async ({ page }) => {
  await openLesson(page, 'Alif', 'play'); const { strokes: [stroke], scale } = await boardModels(page);
  await draw(page, stroke.slice(0, 15)); const saved = await amount(page);
  for (let i = 0; i < 99; i++) await page.mouse.click(stroke[0].x + scale * 200, stroke[0].y);
  await page.getByRole('button', { name: 'Teruskan jejak', exact: true }).click(); expect(await amount(page)).toBe(saved);
  await draw(page, (await boardModels(page)).strokes[0].slice(14)); await expect(completeHeading(page, 'Alif')).toBeVisible();
  expect((await record(page)).metrics.diagnosticRotations).toBe(1);
});

test('phone, tablet and short landscape keep large controls, legible cues and no overflow', async ({ page }) => {
  test.setTimeout(60000);
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1280, 900], [844, 600]]) {
    await page.setViewportSize({ width, height }); await openLesson(page, 'Ba', 'play');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const label of ['Dengar', 'Tunjuk cara', 'Cuba lagi']) {
      const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
    const size = await page.locator('.start-dot').evaluate(node => node.getBoundingClientRect().width); expect(size).toBeGreaterThanOrEqual(47.9);
    await draw(page, (await boardModels(page)).strokes[0]); await page.getByRole('button', { name: 'Tambah titik 1 daripada 1' }).click();
    await expect(completeHeading(page, 'Ba')).toBeVisible();
  }
});

test('idle hint is gentle and reduced-motion reward stays still; replay is deliberate', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await openLesson(page, 'Ba', 'play');
  await expect(page.locator('.play-needs-help')).toBeVisible({ timeout: 6500 }); await expect(fill(page)).toHaveCount(0);
  await draw(page, (await boardModels(page)).strokes[0]);
  expect(await page.locator('.leaf-friend').evaluate(node => getComputedStyle(node).animationName)).toBe('none');
  await page.getByRole('button', { name: 'Tambah titik 1 daripada 1' }).click(); await expect(completeHeading(page, 'Ba')).toBeVisible();
  await page.waitForTimeout(1200); await expect(completeHeading(page, 'Ba')).toBeVisible();
  await page.getByRole('button', { name: 'Main lagi', exact: true }).click(); await expect(fill(page)).toHaveCount(0);
});

for (const letter of ['Sin', 'Kaf', 'Mim']) {
  test(`${letter}: modest hand jitter can follow a complex route without exact centreline input`, async ({ page }) => {
    await openLesson(page, letter, 'play'); const model = await boardModels(page);
    for (const stroke of model.strokes) {
      const input = stroke.map((p, i) => ({ x: p.x + model.scale * (6 + 3 * Math.sin(i * .4)), y: p.y }));
      await draw(page, input);
    }
    await expect(completeHeading(page, letter)).toBeVisible();
    const attempt = await record(page); expect(attempt.metrics.meanError).toBeGreaterThan(1);
    expect(attempt.metrics.coverage).toBeGreaterThanOrEqual(.95); expect(attempt.metrics.pauseEpisodes).toBe(0);
  });
}
