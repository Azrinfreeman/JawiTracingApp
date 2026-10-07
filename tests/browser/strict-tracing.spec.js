import { expect } from '@playwright/test';
import { test } from './helpers/localTest.js';
import { openLesson, boardModels, draw, movePoints, openTeacher, menuAction } from './helpers/tracing.js';

test('wrong-start scribbles stay invisible until release and a fresh correct gesture', async ({ page }) => {
  await openLesson(page); const model = await boardModels(page), stroke = model.strokes[0];
  const start = { x: stroke[0].x + model.scale * 120, y: stroke[0].y };
  await page.mouse.move(start.x, start.y); await page.mouse.down();
  await page.mouse.move(start.x + 20, start.y + 20);
  await expect(page.locator('.gesture-blocked')).toBeVisible();
  await expect(page.locator('.pupil-ink')).toHaveCount(0);
  await movePoints(page, stroke);
  await expect(page.locator('.pupil-ink')).toHaveCount(0); await page.mouse.up();
  await expect(page.locator('.trace-board')).toBeVisible();
  await draw(page, stroke);
  await expect(page.getByRole('heading', { name: 'Bagus, kamu sudah cuba!' })).toBeVisible();
  const record = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record.interactionPolicy).toBe('strict-v2'); expect(record.inkPolicy).toBe('validatedSegments');
  expect(record.metrics.wrongStartGestures).toBe(1); expect(record.metrics.invalidTravel).toBeGreaterThan(100);
});

for (const mode of ['guided', 'precision']) {
  test(`${mode}: excursion removes provisional ink and held-pointer re-entry cannot commit`, async ({ page }) => {
    await openLesson(page, 'Alif', mode);
    const model = await boardModels(page), stroke = model.strokes[0], end = Math.floor(stroke.length / 3);
    await page.mouse.move(stroke[0].x, stroke[0].y); await page.mouse.down();
    await movePoints(page, stroke.slice(1, end));
    await expect(page.locator('.pupil-ink[d]')).toHaveCount(1);
    const point = stroke[end - 1]; await page.mouse.move(point.x + model.scale * 50, point.y);
    await expect(page.locator('.gesture-blocked')).toBeVisible();
    await expect(page.locator('.pupil-ink')).toHaveCount(0);
    await movePoints(page, stroke.slice(end - 1)); await page.mouse.up();
    await expect(page.locator('.trace-board')).toBeVisible(); await expect(page.locator('.pupil-ink')).toHaveCount(0);
    if (mode === 'precision') await menuAction(page, 'Cuba lagi');
    await draw(page, (await boardModels(page)).strokes[0]);
    await expect(page.getByRole('heading', { name: 'Bagus, kamu sudah cuba!' })).toBeVisible();
  });
}

test('a dirty guided resume preserves earlier clean ink, then requires a clean retry', async ({ page }) => {
  await openLesson(page); const model = await boardModels(page), stroke = model.strokes[0];
  const end = Math.floor(stroke.length / 3); await draw(page, stroke.slice(0, end));
  const saved = await page.locator('.pupil-ink').getAttribute('d');
  await page.mouse.move(stroke[end - 1].x, stroke[end - 1].y); await page.mouse.down();
  await movePoints(page, stroke.slice(end, end + 15));
  const point = stroke[end + 14]; await page.mouse.move(point.x + model.scale * 50, point.y);
  await expect(page.locator('.pupil-ink-gesture')).toHaveCount(1);
  expect(await page.locator('.pupil-ink').getAttribute('d')).toBe(saved);
  await page.mouse.up(); await draw(page, stroke.slice(end - 1));
  await expect(page.getByRole('heading', { name: 'Bagus, kamu sudah cuba!' })).toBeVisible();
  const record = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record.metrics.rollbackCount).toBe(1); expect(record.metrics.lifts).toBeGreaterThan(0);
});

test('Ta dot scribbles and cross-target drags never leave trails or fill dots', async ({ page }) => {
  await openLesson(page, 'Ta'); const model = await boardModels(page);
  await draw(page, model.strokes[0]);
  await page.mouse.move(model.dots[0].x, model.dots[0].y); await page.mouse.down();
  for (const [dx, dy] of [[30, 0], [0, 30], [-30, 0], [0, 0]])
    await page.mouse.move(model.dots[0].x + dx * model.scale, model.dots[0].y + dy * model.scale);
  await expect(page.locator('.gesture-blocked')).toBeVisible(); await page.mouse.up();
  await draw(page, [model.dots[0], model.dots[1]]);
  await expect(page.locator('.pupil-ink-gesture')).toHaveCount(1);
  await expect(page.locator('.validated-dot')).toHaveCount(0);
  await expect(page.locator('.trace-board')).toBeVisible();
  await page.mouse.click(model.dots[0].x + model.scale * 5, model.dots[0].y);
  await expect(page.locator('.validated-dot')).toHaveCount(1);
  await expect(page.locator('.validated-dot')).toHaveAttribute('cx', '430');
  await page.mouse.click(model.dots[0].x, model.dots[0].y);
  await expect(page.locator('.validated-dot')).toHaveCount(1);
  await page.mouse.click(model.dots[1].x, model.dots[1].y);
  await expect(page.getByRole('heading', { name: 'Bagus, kamu sudah cuba!' })).toBeVisible();
  const record = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record.dotInputPolicy).toBe('validatedTapStamp'); expect(record.metrics.dotCount).toBe(2);
  expect(record.metrics.rejectedDotGestures).toBe(2);
  expect(record.interactionPolicy).toBe('strict-v2');
  await openTeacher(page);
  await page.getByRole('tab', { name: 'Cubaan', exact: true }).click();
  await expect(page.locator('.record-card').filter({ hasText: 'Bunga · ta' })).toBeVisible();
  await page.getByRole('tab', { name: 'Diagnostik', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Eksport jejak sesi ini' }).click();
  const stream = await (await downloadPromise).createReadStream(); let contents = '';
  for await (const chunk of stream) contents += chunk.toString();
  const diagnostic = JSON.parse(contents);
  expect(diagnostic.rawGestures.filter(g => g.status === 'reject')).toHaveLength(3);
  expect(diagnostic.assistedMarks).toHaveLength(2);
  expect(diagnostic.assistedMarks[0].up.x).not.toBe(diagnostic.assistedMarks[0].x);
  expect(diagnostic.visibleInk).toHaveLength(1);
});

test('accepted jitter is actual raw ink within the displayed corridor on phone and desktop', async ({ page }) => {
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 1000 }); await openLesson(page, 'Ba');
    const model = await boardModels(page);
    const points = model.strokes[0].slice(0, Math.floor(model.strokes[0].length / 2))
      .map((p, i) => ({ x: p.x + (6 + Math.sin(i * .4) * 4) * model.scale, y: p.y }));
    // Compare ink with the event the browser actually delivered, including device coordinate rounding.
    await page.locator('.trace-board').evaluate(svg => {
      svg.addEventListener('pointerdown', event => {
        svg.dataset.deliveredDown = JSON.stringify({ x: event.clientX, y: event.clientY });
      }, { once: true });
    });
    await draw(page, points); await expect(page.locator('.pupil-ink-gesture')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const actual = await page.locator('.pupil-ink').first().evaluate(path => {
      const first = path.getPointAtLength(0); return { x: first.x, y: first.y };
    });
    const logical = await page.locator('.trace-board').evaluate(svg => {
      const p = JSON.parse(svg.dataset.deliveredDown);
      const q = new DOMPoint(p.x, p.y).matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y };
    });
    expect(actual.x).toBeCloseTo(logical.x, 3); expect(actual.y).toBeCloseTo(logical.y, 3);
    await expect(page.locator('.gesture-blocked')).toHaveCount(0);
  }
});
