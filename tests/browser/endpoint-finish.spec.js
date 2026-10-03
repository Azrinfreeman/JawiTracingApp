import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { openLesson, boardModels } from './helpers/tracing.js';
import { dismissSplash } from './helpers/navigation.js';

const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/endpoint-finish';
mkdirSync(evidence, { recursive: true });
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const pane = (page, slot) => page.locator(`[data-player-slot="${slot}"]`);
async function traceBody(board, ending = 'excursion', pointerId = 61) {
  await board.evaluate(async (svg, { ending, pointerId }) => {
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const path = svg.querySelector('.reference-stroke'), length = path.getTotalLength();
    const matrix = svg.getScreenCTM();
    const screen = p => { const q = new DOMPoint(p.x, p.y).matrixTransform(matrix); return { clientX: q.x, clientY: q.y }; };
    const send = (type, p) => svg.dispatchEvent(new PointerEvent(type, { ...screen(p), bubbles: true, pointerId, pointerType: 'touch' }));
    send('pointerdown', path.getPointAtLength(0));
    for (let s = 4; s < length; s += 4) { send('pointermove', path.getPointAtLength(s)); if (s % 96 === 0) await new Promise(requestAnimationFrame); }
    const end = path.getPointAtLength(length); send('pointermove', end);
    if (ending === 'held') return;
    if (ending === 'excursion') { const far = { x: end.x + 180, y: end.y - 60 }; send('pointermove', far); send('pointerup', far); }
    if (ending === 'assistance') { send('pointermove', { x: end.x + 43, y: end.y - 21 }); send('pointerup', { x: end.x + 82, y: end.y - 53 }); }
  }, { ending, pointerId });
}
async function endpointContact(board, type, pointerId = 61) {
  await board.evaluate((svg, { type, pointerId }) => {
    const path = svg.querySelector('.reference-stroke'), p = path.getPointAtLength(path.getTotalLength());
    const q = new DOMPoint(p.x, p.y).matrixTransform(svg.getScreenCTM());
    svg.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId, pointerType: 'touch', clientX: q.x, clientY: q.y }));
  }, { type, pointerId });
}
async function screenshot(page, name) { await settle(page); await page.screenshot({ path: `${evidence}/${name}.png`, animations: 'disabled' }); }
async function fits(page) {
  expect(await page.evaluate(() => ({ x: scrollX, y: scrollY, fits: document.scrollingElement.scrollHeight <= innerHeight + 1 && document.scrollingElement.scrollWidth <= innerWidth + 1 }))).toEqual({ x: 0, y: 0, fits: true });
  const controls = await page.locator('button').evaluateAll(nodes => nodes.filter(n => n.getBoundingClientRect().width && n.getBoundingClientRect().height).every(n => { const b = n.getBoundingClientRect(); return b.left >= -1 && b.right <= innerWidth + 1 && b.top >= -1 && b.bottom <= innerHeight + 1; }));
  expect(controls).toBe(true);
}
for (const preset of ['light', 'full']) for (const [width, height] of [[320, 740], [1024, 768], [768, 1024], [1280, 800]]) {
  test(`Ghain ${preset} ${width}x${height}: displaced finish accepts one stationary confirmation, then a separate upper dot`, async ({ page, browserName }) => {
    await page.addInitScript(p => localStorage.setItem('taman-jawi.presentation.v1', p), preset);
    await page.setViewportSize({ width, height }); await openLesson(page, 'Ghain', 'play');
    const board = page.locator('.trace-board'); await expect(board).toHaveAttribute('data-interaction-policy', 'play-guided-v2');
    await traceBody(board, 'held'); await expect(page.locator('.board-tip')).toHaveText('Angkat jari untuk bahagian seterusnya.');
    await screenshot(page, `${browserName}-${preset}-${width}-ghain-held`);
    // Recompute coordinates after each capture; the excursion intentionally invalidates readiness.
    await board.evaluate(svg => {
      const path = svg.querySelector('.reference-stroke'), end = path.getPointAtLength(path.getTotalLength());
      const p = new DOMPoint(end.x + 180, end.y - 60).matrixTransform(svg.getScreenCTM());
      for (const type of ['pointermove', 'pointerup']) svg.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 61, pointerType: 'touch', clientX: p.x, clientY: p.y }));
    });
    await expect(page.locator('.board-tip')).toHaveText('Sentuh titik 3, kemudian angkat jari.');
    await expect(page.locator('.trace-number-guide--stop')).toHaveClass(/is-confirmable/);
    await expect(page.locator('.terminal-resume-cue')).toBeHidden(); await expect(page.locator('.terminal-tail')).toBeHidden();
    const measured = Number(await page.locator('.play-fill').getAttribute('data-measured-frontier'));
    await fits(page); await screenshot(page, `${browserName}-${preset}-${width}-ghain-confirm`);
    await endpointContact(board, 'pointerdown'); await expect(page.locator('.board-tip')).toHaveText('Angkat jari untuk bahagian seterusnya.');
    await expect(page.locator('.trace-number-guide--stop')).toHaveClass(/is-ready/);
    await expect(page.getByRole('button', { name: 'Tambah titik 1 daripada 1' })).toHaveCount(0);
    await endpointContact(board, 'pointerup'); await endpointContact(board, 'pointerup');
    await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'dot-1');
    expect(Number(await page.locator('.play-fill').getAttribute('data-measured-frontier'))).toBe(measured);
    await expect(page.locator('.book-completed')).toHaveCount(0); await fits(page);
    await screenshot(page, `${browserName}-${preset}-${width}-ghain-dot`);
    // Hit the actual authored upper dot, not only its equivalent support pad.
    const dot = (await boardModels(page)).dots[0]; await page.mouse.click(dot.x, dot.y);
    await expect(page.locator('.book-completed')).toBeVisible();
    const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts);
    expect(attempts).toHaveLength(1); expect(attempts[0]).toMatchObject({ letterId: 'ghain', interactionPolicy: 'play-guided-v2', metrics: { endpointConfirmations: 1, releaseAssistances: 0, dotCount: 1 } });
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click(); await page.getByRole('tab', { name: 'Diagnostik', exact: true }).click();
    const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Eksport jejak sesi ini' }).click();
    let text = ''; for await (const chunk of await (await pending).createReadStream()) text += chunk;
    const diagnostic = JSON.parse(text); expect(diagnostic.completionMethods).toEqual({ 'stroke-1': 'endpointConfirmation' });
    expect(diagnostic.rawGestures.some(g => g.completionMethod === 'endpointConfirmation' && g.points.length === 2)).toBe(true);
  });
}
test('Ghain final-up displacement uses bounded assistance and keeps the upper dot pending', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await openLesson(page, 'Ghain', 'play');
  await traceBody(page.locator('.trace-board'), 'assistance');
  await expect(page.getByRole('button', { name: 'Tambah titik 1 daripada 1' })).toBeVisible();
  await expect(page.locator('.book-completed')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tambah titik 1 daripada 1' }).click();
  await expect(page.locator('.book-completed')).toBeVisible();
  const record = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts[0]);
  expect(record.metrics).toMatchObject({ releaseAssistances: 1, endpointConfirmations: 0 });
});
test('native touch confirms an already traced endpoint without movement', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native touch uses Chromium CDP.');
  await page.setViewportSize({ width: 1024, height: 768 }); await openLesson(page, 'Ghain', 'play');
  await traceBody(page.locator('.trace-board')); await expect(page.locator('.board-tip')).toHaveText('Sentuh titik 3, kemudian angkat jari.');
  const board = page.locator('.trace-board');
  await board.evaluate(svg => { delete svg.setPointerCapture; delete svg.hasPointerCapture; });
  const end = await board.evaluate(svg => { const p = svg.querySelector('.reference-stroke'), q = p.getPointAtLength(p.getTotalLength()), r = new DOMPoint(q.x, q.y).matrixTransform(svg.getScreenCTM()); return { x: r.x, y: r.y }; });
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...end, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(page.getByRole('button', { name: 'Tambah titik 1 daripada 1' })).toHaveCount(0);
  await expect(page.locator('.board-tip')).toHaveText('Sentuh titik 3, kemudian angkat jari.');
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...end, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.getByRole('button', { name: 'Tambah titik 1 daripada 1' })).toBeVisible(); await session.detach();
});
test('an endpoint confirmation held past the Solo deadline cannot award completion', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.addInitScript(() => { Math.random = () => .99999; });
  await page.goto('/'); await dismissSplash(page); await page.clock.install();
  await page.getByRole('button', { name: /Cabaran trofi/ }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  await pane(page, 0).getByRole('button', { name: 'Saya sedia!', exact: true }).click(); await page.clock.fastForward(3100);
  const board = pane(page, 0).locator('.trace-board'); await traceBody(board);
  await endpointContact(board, 'pointerdown'); await expect(pane(page, 0).locator('.board-tip')).toHaveText('Angkat jari untuk siap.');
  await page.clock.fastForward(91000); await expect(page.locator('.round-result')).toBeVisible();
  await endpointContact(board, 'pointerup');
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts);
  expect(attempts).toHaveLength(0);
});
for (const mode of ['solo', 'duo']) test(`${mode}: independent endpoint confirmations obey pause and complete exactly once`, async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.addInitScript(() => { Math.random = () => .99999; localStorage.setItem('taman-jawi.presentation.v1', 'light'); });
  await page.goto('/'); await dismissSplash(page); await page.clock.install();
  await page.getByRole('button', { name: mode === 'duo' ? 'Duo 1v1' : /Cabaran trofi/, exact: mode === 'duo' }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  if (mode === 'duo') { await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click(); }
  else await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  const count = mode === 'duo' ? 2 : 1;
  const ready = async () => { for (let slot = 0; slot < count; slot++) await pane(page, slot).getByRole('button', { name: 'Saya sedia!', exact: true }).click(); await page.clock.fastForward(3100); };
  await ready();
  for (let slot = 0; slot < count; slot++) await traceBody(pane(page, slot).locator('.trace-board'), 'excursion', 61 + slot);
  await page.getByRole('button', { name: 'Berhenti', exact: true }).click();
  for (let slot = 0; slot < count; slot++) { const board = pane(page, slot).locator('.trace-board'); await endpointContact(board, 'pointerdown', 61 + slot); await endpointContact(board, 'pointerup', 61 + slot); }
  await expect(page.locator('.round-result')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sambung bermain', exact: true }).click(); await page.clock.fastForward(3100);
  for (let slot = 0; slot < count; slot++) { const board = pane(page, slot).locator('.trace-board'); await endpointContact(board, 'pointerdown', 61 + slot); await endpointContact(board, 'pointerup', 61 + slot); if (slot === 0 && count === 2) { await expect(page.locator('.round-result')).toHaveCount(0); await expect(pane(page, 1).locator('.board-tip')).toHaveText('Sentuh titik 3, kemudian angkat jari.'); } }
  await expect(page.locator('.round-result')).toBeVisible();
  if (mode === 'solo') { const records = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts); expect(records).toHaveLength(1); expect(records[0].metrics.endpointConfirmations).toBe(1); }
});
