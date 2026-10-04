import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { mkdirSync } from 'node:fs';
import { openLesson, boardModels, draw, movePoints, openTeacher, menuAction, showDotHelp } from './helpers/tracing.js';
import { dismissSplash, chooseLetter } from './helpers/navigation.js';
// Student-ready lessons follow the catalogue, so approvals or revisions never need a count edit here.
const readyLessons = letters.filter(letter => letter.geometry.status === 'approved' && letter.audio.name.status === 'approved').length;

const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/kaf-ga';
mkdirSync(evidence, { recursive: true });
const corrected = letters.filter(letter => ['kaf', 'ga'].includes(letter.id));
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}').attempts);
const shot = (page, name) => page.screenshot({ path: `${evidence}/${name}.png`, animations: 'disabled' });
async function retry(page) { await menuAction(page, 'Cuba lagi'); await expect(page.locator('.start-dot')).toBeVisible(); }
async function complete(page, letter, pad = false) {
  await draw(page, (await boardModels(page)).strokes[0]);
  if (letter.id === 'ga') {
    expect(await attempts(page)).toHaveLength(0);
    await expect(page.locator('.trace-number-label')).toHaveText(['4 Siap']);
    if (pad) { await showDotHelp(page); await page.getByRole('button', { name: 'Tambah titik 1 daripada 1' }).click(); }
    else { const dot = (await boardModels(page)).dots[0]; await page.mouse.click(dot.x, dot.y); }
  }
  await expect(page.locator('.book-completed')).toBeVisible();
}

for (const mode of ['play', 'guided', 'precision']) for (const letter of corrected) {
  test(`${letter.id} ${mode}: continuous body and separate required dot complete the revised preview`, async ({ page }) => {
    await openLesson(page, letter.labelMs, mode);
    await expect(page.locator('.reference-stroke')).toHaveCount(1);
    await expect(page.locator('.reference-dot')).toHaveCount(letter.geometry.dotTargets.length);
    await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula', '2 Ikut', letter.id === 'ga' ? '3 Henti' : '3 Siap']);
    const fit = await page.locator('.trace-board').getAttribute('viewBox');
    await complete(page, letter);
    expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(fit);
    const record = (await attempts(page)).at(-1);
    expect(record).toMatchObject({ letterId: letter.id, mode, preview: true,
      contentVersion: letter.contentVersion, geometryStatus: letter.geometry.status, audioStatus: 'approved',
      metrics: { dotCount: letter.geometry.dotTargets.length } });
    expect(record.metrics.equivalentDotActions ?? 0).toBe(0);
  });
}

test('Ga equivalent dot pad completes only after its connected body', async ({ page }) => {
  await openLesson(page, 'Ga', 'play');
  await expect(page.getByRole('button', { name: 'Tambah titik 1 daripada 1' })).toHaveCount(0);
  await complete(page, corrected[1], true);
  expect((await attempts(page)).at(-1).metrics).toMatchObject({ dotCount: 1, equivalentDotActions: 1 });
});

for (const mode of ['play', 'guided', 'precision']) {
  test(`${mode}: endpoint, elbow shortcut, reversal and cancellation cannot complete; clean retry succeeds`, async ({ page }) => {
    test.setTimeout(60000);
    await openLesson(page, 'Kaf', mode);
    let stroke = (await boardModels(page)).strokes[0];
    await page.mouse.click(stroke.at(-1).x, stroke.at(-1).y);
    expect(await attempts(page)).toHaveLength(0); await retry(page);
    stroke = (await boardModels(page)).strokes[0];
    // A sampled straight chord skips the elbow without relying on a raw-gap rejection.
    const end = stroke[Math.floor(stroke.length * .48)], start = stroke[0];
    await draw(page, Array.from({ length: 81 }, (_, i) => ({ x: start.x + (end.x - start.x) * i / 80, y: start.y + (end.y - start.y) * i / 80 })));
    await draw(page, stroke.slice(Math.floor(stroke.length * .48)));
    expect(await attempts(page)).toHaveLength(0); await retry(page);
    stroke = (await boardModels(page)).strokes[0];
    const prefix = stroke.slice(0, Math.floor(stroke.length * .5));
    await draw(page, [...prefix, ...prefix.slice().reverse()]);
    expect(await attempts(page)).toHaveLength(0); await retry(page);
    stroke = (await boardModels(page)).strokes[0];
    await page.mouse.move(stroke[0].x, stroke[0].y); await page.mouse.down();
    await movePoints(page, stroke.slice(1, 30));
    await page.locator('.trace-board').dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', bubbles: true });
    await page.mouse.up(); expect(await attempts(page)).toHaveLength(0);
    await retry(page); await complete(page, corrected[0]);
  });
}

for (const letter of corrected) {
  test(`${letter.id}: demo uses the connected model, then copying keeps original coordinates and save protection`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await openLesson(page, letter.labelMs, 'play');
    await menuAction(page, 'Tunjuk cara');
    await expect(page.locator('.numbered-trace-guides')).toHaveCount(0);
    await expect(page.locator('path.demonstration-ink')).toHaveAttribute('d', letter.geometry.strokes[0].path);
    await expect(page.locator('.demonstration-ink')).toHaveCount(0, { timeout: 10000 });
    expect(await attempts(page)).toHaveLength(0);
    await complete(page, letter);
    await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri', exact: true }).click();
    await expect(page.locator('.copy-board')).toHaveAttribute('viewBox', '0 0 1000 1000');
    await expect(page.locator('.numbered-trace-guides')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Menu permainan', exact: true })).toBeEnabled();
    const points = await page.locator('.copy-board').evaluate(svg => {
      svg.addEventListener('pointerdown', event => {
        const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
        svg.dataset.deliveredStart = JSON.stringify({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 });
      }, { once: true });
      return [new DOMPoint(250, 300), new DOMPoint(400, 400)].map(p => {
        const q = p.matrixTransform(svg.getScreenCTM()); return { x: q.x, y: q.y };
      });
    });
    await draw(page, points);
    const delivered = JSON.parse(await page.locator('.copy-board').getAttribute('data-delivered-start'));
    await menuAction(page, 'Isi kandungan');
    await expect(page.getByRole('dialog', { name: 'Tulisan belum disimpan' })).toBeVisible();
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    const copy = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.at(-1));
    expect(copy).toMatchObject({ letterId: letter.id, contentVersion: letter.contentVersion, preview: true });
    expect(copy.ink[0][0]).toEqual(delivered);
    expect(Math.abs(delivered.x - 250)).toBeLessThan(1); expect(Math.abs(delivered.y - 300)).toBeLessThan(1);
  });
}

test('catalogue, help, teacher and audio illustrations agree; revised lessons remain gated', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/'); await dismissSplash(page); await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.garden-count')).toHaveText(`${readyLessons} huruf untuk dikenali`);
  await page.getByRole('button', { name: 'Semua huruf', exact: true }).click();
  for (const letter of corrected) {
    // Gated while unreviewed; open to students once the owner has approved the revision.
    if (letter.geometry.status === 'approved') await expect(page.getByRole('button', { name: letter.labelMs, exact: true })).toBeEnabled();
    else await expect(page.getByRole('button', { name: `${letter.labelMs}, akan datang`, exact: true })).toBeDisabled();
  }
  await shot(page, `${browserName}-catalogue`);
  await openTeacher(page);
  await expect(page.locator('.teacher-content')).toContainText(`${readyLessons} pelajaran sedia`);
  await page.getByRole('tab', { name: 'Huruf', exact: true }).click();
  for (const letter of corrected) {
    const illustration = page.locator(`.record-card svg[data-letter-id="${letter.id}"]`);
    for (let i = 0; i < 20 && !await illustration.isVisible(); i++) await page.getByRole('button', { name: 'Halaman kandungan seterusnya', exact: true }).click();
    await expect(illustration.locator('path')).toHaveAttribute('d', letter.geometry.strokes[0].path);
    await expect(illustration.locator('circle')).toHaveCount(letter.geometry.dotTargets.length);
    if (letter.geometry.status === 'approved') await expect(illustration.locator('xpath=ancestor::article')).not.toContainText('Draf · perlu semakan');
    else await expect(illustration.locator('xpath=ancestor::article')).toContainText(`Draf · perlu semakan · ${letter.contentVersion}`);
  }
  await shot(page, `${browserName}-teacher-content`);
  await page.getByRole('tab', { name: 'Suara', exact: true }).click();
  for (const letter of corrected) {
    await expect(page.locator(`#audio-review-letter option[value="${letter.id}"]`)).toHaveText(letter.labelMs);
    await page.getByLabel('Huruf untuk semakan suara').selectOption(letter.id);
    await expect(page.locator('.audio-review-transcript path')).toHaveAttribute('d', letter.geometry.strokes[0].path);
    await expect(page.locator('.audio-review-transcript circle')).toHaveCount(letter.geometry.dotTargets.length);
    await shot(page, `${browserName}-audio-${letter.id}`);
  }
  await page.getByRole('tab', { name: 'Tetapan', exact: true }).click();
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  for (const letter of corrected) {
    await chooseLetter(page, letter.labelMs);
    await menuAction(page, 'Kenal huruf dan panduan');
    await expect(page.locator('.letter-help .letter-model-glyph path')).toHaveAttribute('d', letter.geometry.strokes[0].path);
    await expect(page.locator('.letter-help .letter-model-glyph circle')).toHaveCount(letter.geometry.dotTargets.length);
    await shot(page, `${browserName}-help-${letter.id}`); await page.keyboard.press('Escape');
    await menuAction(page, 'Isi kandungan');
  }
});

for (const [width, height] of [[390, 844], [1024, 768], [768, 1024], [1920, 1080], [3840, 2160]]) {
  test(`Kaf/Ga complete model, guides, dot and stable completion fit ${width}x${height}`, async ({ page, browserName }) => {
    test.setTimeout(90000); await page.setViewportSize({ width, height });
    for (const letter of corrected) {
      await openLesson(page, letter.labelMs, 'play');
      await expect(page.getByRole('button', { name: 'Menu permainan', exact: true })).toBeEnabled();
      const board = page.locator('.trace-board'), fit = await board.getAttribute('viewBox');
      const contained = () => board.evaluate(svg => {
        const board = svg.getBoundingClientRect();
        return [...svg.querySelectorAll('.reference-stroke,.reference-dot,.trace-number-badge,.trace-number-label-backdrop')].every(node => {
          const r = node.getBoundingClientRect(); return r.left >= board.left - 1 && r.right <= board.right + 1 && r.top >= board.top - 1 && r.bottom <= board.bottom + 1;
        });
      });
      expect(await contained()).toBe(true);
      await shot(page, `${browserName}-${width}-${letter.id}-guides`);
      const guides = page.locator('.numbered-trace-guides');
      await guides.evaluate(node => node.style.visibility = 'hidden');
      await shot(page, `${browserName}-${width}-${letter.id}-plain`);
      await guides.evaluate(node => node.style.visibility = '');
      // boardModels obtains a fresh CTM after every capture.
      await draw(page, (await boardModels(page)).strokes[0]);
      if (letter.id === 'ga') {
        expect(await contained()).toBe(true); await shot(page, `${browserName}-${width}-ga-dot`);
        const dot = (await boardModels(page)).dots[0]; await page.mouse.click(dot.x, dot.y);
      }
      await expect(page.locator('.book-completed')).toBeVisible();
      expect(await board.getAttribute('viewBox')).toBe(fit);
      expect(await page.evaluate(() => ({ x: scrollX, y: scrollY, width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })))
        .toEqual({ x: 0, y: 0, width, height });
      await shot(page, `${browserName}-${width}-${letter.id}-complete`);
      // New lesson starts with an empty attempt history for missing-dot checks.
      await page.evaluate(() => localStorage.removeItem('taman-jawi.progress.v1'));
    }
  });
}

test('native touch follows the corrected Ga body and upper dot', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native touch uses Chromium CDP');
  await page.setViewportSize({ width: 768, height: 1024 }); await openLesson(page, 'Ga', 'play');
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const model = await boardModels(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...model.strokes[0][0], id: 1 }] });
  for (const point of model.strokes[0].slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await attempts(page)).toHaveLength(0);
  const dot = (await boardModels(page)).dots[0];
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...dot, id: 2 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.book-completed')).toBeVisible();
  expect((await attempts(page)).at(-1)).toMatchObject({ pointerType: 'touch', contentVersion: 3, preview: true, metrics: { dotCount: 1 } });
});
