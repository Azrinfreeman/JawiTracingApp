import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dismissSplash } from './helpers/navigation.js';
import { boardModels, draw } from './helpers/tracing.js';

test.setTimeout(90000);
const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/solo-duo'; mkdirSync(evidence, { recursive: true });
const pane = (page, slot) => page.locator(`[data-player-slot="${slot}"]`);
const records = page => page.evaluate(() => ({ progress: JSON.parse(localStorage.getItem('taman-jawi.progress.v1') || '{"attempts":[]}'), matches: JSON.parse(localStorage.getItem('taman-jawi.matches.v1') || '{"matches":[]}') }));
async function setup(page, mode = 'solo') {
  await page.addInitScript(() => { Math.random = () => .99999; });
  await page.goto('/'); await dismissSplash(page); await page.clock.install();
  if (mode === 'duo') await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click();
  else await page.getByRole('button', { name: /Cabaran trofi/ }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await page.getByLabel('Bilangan pusingan').selectOption('3');
}
async function solo(page) { await setup(page); await page.getByRole('button', { name: 'Buka cabaran Solo' }).click(); }
async function ready(page, count = 1, capture) {
  for (let slot = 0; slot < count; slot++) await pane(page, slot).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  await expect(page.locator('.countdown-overlay')).toBeVisible();
  if (capture) await page.screenshot({ path: `${evidence}/${capture}.png`, fullPage: true, animations: 'disabled' });
  await page.clock.fastForward(3100);
  await expect(page.locator('.countdown-overlay')).toHaveCount(0);
}
async function completeMouse(page, slot = 0) {
  const board = pane(page, slot).locator('.trace-board'), model = await boardModels(page, board);
  for (const points of model.strokes) await draw(page, points);
  for (let i = 0; i < model.dots.length; i++) await pane(page, slot).getByRole('button', { name: `Tambah titik ${i + 1} daripada ${model.dots.length}` }).click();
}
async function center(button) { const box = await button.boundingBox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; }
async function touches(session, type, points) { await session.send('Input.dispatchTouchEvent', { type, touchPoints: points }); }
async function verifiedDuo(page, session, capture = false) {
  await setup(page, 'duo');
  if (capture) await page.screenshot({ path: `${evidence}/duo-setup.png`, fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Uji dua sentuhan' }).click();
  if (capture) await page.screenshot({ path: `${evidence}/duo-input-check.png`, fullPage: true, animations: 'disabled' });
  const a = await center(page.getByRole('button', { name: 'Uji sentuhan pemain 1' })), b = await center(page.getByRole('button', { name: 'Uji sentuhan pemain 2' }));
  await touches(session, 'touchStart', [{ ...a, id: 1 }, { ...b, id: 2 }]);
  await expect(page.getByText('Dua sentuhan serentak berjaya. Sedia bermain!')).toBeVisible();
  await touches(session, 'touchEnd', []); await page.getByRole('button', { name: 'Teruskan Duo 1v1' }).click();
}
async function bothTouch(page, session, beforeDots) {
  const models = await Promise.all([0, 1].map(slot => boardModels(page, pane(page, slot).locator('.trace-board'))));
  for (let s = 0; s < models[0].strokes.length; s++) {
    const a = models[0].strokes[s], b = models[1].strokes[s];
    await touches(session, 'touchStart', [{ ...a[0], id: 1 }, { ...b[0], id: 2 }]);
    for (let i = 1; i < a.length; i++) await touches(session, 'touchMove', [{ ...a[i], id: 1 }, { ...b[i], id: 2 }]);
    await touches(session, 'touchEnd', []);
  }
  if (models[0].dots.length && beforeDots) await beforeDots(models[0].dots.length);
  for (let i = 0; i < models[0].dots.length; i++) {
    const label = `Tambah titik ${i + 1} daripada ${models[0].dots.length}`;
    const a = await center(pane(page, 0).getByRole('button', { name: label })), b = await center(pane(page, 1).getByRole('button', { name: label }));
    await touches(session, 'touchStart', [{ ...a, id: 1 }, { ...b, id: 2 }]);
    await touches(session, 'touchEnd', []);
  }
}

test('shared book turn keeps both players together and starts the next clock only after readiness', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await setup(page, 'duo');
  await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click();
  await ready(page, 2); await page.clock.fastForward(91000); await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!', exact: true })).toBeVisible();
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 100)));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Suppress animationend to exercise the common bounded fallback for both pages.
  const style = await page.addStyleTag({ content: '.book-fold { animation: none !important; }' });
  await page.getByRole('button', { name: 'Pusingan seterusnya', exact: true }).click();
  await expect(page.locator('.race-book .book-fold')).toHaveCount(2); await expect(page.locator('.race-clock')).toContainText('0');
  await expect(page.getByRole('button', { name: 'Saya sedia!', exact: true })).toHaveCount(0);
  await page.screenshot({ path: `${evidence}/duo-shared-book-turn.png`, fullPage: true });
  await page.clock.runFor(419); await expect(page.locator('.race-toolbar')).toContainText('Pusingan 1/3');
  await page.clock.runFor(1); await expect(page.locator('.race-toolbar')).toContainText('Pusingan 2/3');
  await expect(page.locator('.race-book .book-fold')).toHaveCount(0); await expect(page.locator('.race-clock')).toContainText('90');
  await expect(page.getByRole('button', { name: 'Saya sedia!', exact: true })).toHaveCount(2);
  await expect(page.locator('.countdown-overlay')).toHaveCount(0); expect((await records(page)).progress.attempts).toHaveLength(0);
  await style.evaluate(node => node.remove()); await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, 2); await expect(page.locator('.race-clock')).toContainText('90');
});
test('Solo challenge completes, earns a trophy, exports both stores and resets both', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await solo(page);
  for (let i = 0; i < 3; i++) {
    await ready(page); await completeMouse(page);
    await expect(page.getByRole('heading', { name: `Pusingan ${i + 1} selesai!` })).toBeVisible();
    await page.getByRole('button', { name: i === 2 ? 'Lihat keputusan' : 'Pusingan seterusnya', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Bunga dapat trofi!' })).toBeVisible(); await expect(page.locator('.match-trophy')).toBeVisible();
  await page.screenshot({ path: `${evidence}/solo-phone-trophy.png`, fullPage: true, animations: 'disabled' });
  let saved = await records(page); expect(saved.progress.attempts).toHaveLength(3); expect(saved.matches.matches).toHaveLength(1);
  expect(saved.progress.attempts.every(a => a.sessionType === 'solo' && a.toleranceProfile === 'play-touch-standard-v2')).toBe(true);
  const firstId = saved.matches.matches[0].id, sequence = saved.matches.matches[0].letterIds;
  await page.getByRole('button', { name: 'Main semula', exact: true }).click(); await expect(pane(page, 0)).toBeVisible();
  await page.getByRole('button', { name: 'Keluar', exact: true }).click(); await page.getByRole('button', { name: 'Ya, keluar' }).click();
  saved = await records(page); expect(saved.matches.matches).toHaveLength(2); expect(saved.matches.matches[1].id).not.toBe(firstId); expect(saved.matches.matches[1].letterIds).toEqual(sequence);
  expect(saved.matches.matches[1].status).toBe('abandoned');
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByRole('tab', {name:'Cabaran',exact:true}).click(); await expect(page.locator('.record-card')).toHaveCount(2);
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Eksport kemajuan' }).click();
  let json = ''; for await (const chunk of await (await download).createReadStream()) json += chunk.toString();
  const data = JSON.parse(json); expect(data.exportVersion).toBe(2); expect(data.progress.attempts).toHaveLength(3); expect(data.matches.matches).toHaveLength(2);
  await page.getByRole('button', { name: 'Padam rekod', exact: true }).click(); await expect(page.getByText(/salinan dan rekod cabaran Solo/)).toBeVisible();
  await page.getByRole('button', { name: 'Ya, padam rekod' }).click(); saved = await records(page); expect(saved.progress.attempts).toHaveLength(0); expect(saved.matches.matches).toHaveLength(0);
});
test('shared pause cancels a held gesture, preserves progress, excludes wait and requires new contact', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await solo(page); await ready(page);
  let model = await boardModels(page), stroke = model.strokes[0];
  await page.mouse.move(stroke[0].x, stroke[0].y); await page.mouse.down(); for (const p of stroke.slice(1, 20)) await page.mouse.move(p.x, p.y);
  await page.setViewportSize({ width: 1000, height: 760 });
  await expect(page.getByRole('heading', { name: 'Rehat sekejap' })).toBeVisible();
  await page.screenshot({ path: `${evidence}/${browserName}-solo-pause.png`, animations: 'disabled' });
  const progress = await page.locator('.play-fill').getAttribute('data-measured-frontier'), timer = await page.locator('.race-clock').innerText();
  await page.clock.fastForward(50000); expect(await page.locator('.race-clock').innerText()).toBe(timer);
  await page.mouse.up(); await page.getByRole('button', { name: 'Sambung bermain' }).click(); await page.clock.fastForward(3100);
  await expect(page.locator('.countdown-overlay')).toHaveCount(0); model = await boardModels(page); stroke = model.strokes[0];
  await page.mouse.move(stroke[35].x, stroke[35].y); expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(progress);
  await draw(page, stroke.slice(19)); await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  const saved = await records(page); expect(saved.progress.attempts).toHaveLength(1);
  await page.getByRole('button', { name: 'Pusingan seterusnya' }).click(); await ready(page); await page.clock.fastForward(91000);
  await expect(page.getByRole('heading', { name: 'Pusingan 2 selesai!' })).toBeVisible(); expect((await records(page)).progress.attempts).toHaveLength(1);
});
test('touch gate rejects mouse verification; adult preview cannot persist a score or trophy', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 }); await setup(page, 'duo');
  await page.getByRole('button', { name: 'Sebelumnya', exact: true }).click();
  await page.getByLabel('Profil pemain 2').selectOption('Bunga'); await expect(page.getByRole('button', { name: 'Seterusnya', exact: true })).toBeDisabled();
  await page.getByLabel('Profil pemain 2').selectOption('Daun'); await page.getByRole('button', { name: 'Seterusnya', exact: true }).click(); await page.getByRole('button', { name: 'Uji dua sentuhan' }).click();
  await page.getByRole('button', { name: 'Uji sentuhan pemain 1' }).click(); await expect(page.getByRole('button', { name: 'Teruskan Duo 1v1' })).toHaveCount(0);
  await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click();
  await expect(page.locator('.race-lanes')).toBeVisible();
  for (let round = 0; round < 3; round++) {
    await ready(page, 2); await page.clock.fastForward(91000); await page.getByRole('button', { name: round === 2 ? 'Lihat keputusan' : 'Pusingan seterusnya' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Pratonton selesai!' })).toBeVisible(); await expect(page.locator('.match-trophy')).toHaveCount(0);
  const saved = await records(page); expect(saved.progress.attempts).toHaveLength(0); expect(saved.matches.matches).toHaveLength(0);
});
for (const [width, height] of [[1024, 768], [768, 1024], [1280, 720], [1920, 1080], [1366, 768]]) {
  test(`Duo fits equal upright boards and controls at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height }); await setup(page, 'duo'); await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click();
    await expect(page.locator('.arena-space')).toHaveCount(0);
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    const boards = await page.locator('.board-wrap').evaluateAll(nodes => nodes.map(n => { const b = n.getBoundingClientRect(); return { width: b.width, height: b.height, top: b.top, right: b.right, bottom: b.bottom }; }));
    expect(boards).toHaveLength(2); expect(Math.min(boards[0].width, boards[0].height)).toBeGreaterThanOrEqual(280);
    expect(boards[0].width).toBe(boards[1].width); expect(boards[0].height).toBe(boards[1].height);
    const controls = await page.locator('.race-actions button').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().toJSON()));
    expect(controls.every(b => b.bottom <= height && b.right <= width && b.height >= 48)).toBe(true);
    for (let slot = 0; slot < 2; slot++) {
      const rows = await pane(page, slot).locator('.board-tip, .trace-number-instruction, .play-dot-tools, .race-actions').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().toJSON()));
      expect(rows.every(row => row.top >= boards[slot].bottom - 1 && row.bottom <= height && row.left >= 0 && row.right <= width)).toBe(true);
      for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
        expect(rows[i].left < rows[j].right - 1 && rows[j].left < rows[i].right - 1 && rows[i].top < rows[j].bottom - 1 && rows[j].top < rows[i].bottom - 1).toBe(false);
      }
    }
    await page.screenshot({ path: `${evidence}/duo-${width}x${height}-ready.png`, fullPage: true, animations: 'disabled' });
    await ready(page, 2); await expect(page.locator('.race-lanes')).toBeVisible();
    await page.screenshot({ path: `${evidence}/duo-${width}x${height}-racing.png`, fullPage: true, animations: 'disabled' });
  });
}
test('small and short Duo screens offer space guidance before racing; Solo remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await setup(page, 'duo'); await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click();
  await page.setViewportSize({ width: 844, height: 390 }); await expect(page.getByRole('dialog', { name: 'Besarkan ruang bermain' })).toBeVisible();
  await page.screenshot({ path: `${evidence}/duo-short-space-guidance.png`, fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1024, height: 768 }); await expect(page.locator('.trace-board')).toHaveCount(2);
  await ready(page, 2); await page.setViewportSize({ width: 390, height: 844 }); await expect(page.getByRole('heading', { name: 'Besarkan ruang bermain' })).toBeVisible();
  await page.getByRole('button', { name: 'Kembali memilih Solo' }).click(); await page.getByRole('button', { name: 'Kembali', exact: true }).click();
  await page.getByRole('button', { name: /Cabaran trofi/ }).click(); await page.getByRole('button', { name: 'Jom mula', exact: true }).click(); await page.getByRole('button', { name: 'Seterusnya', exact: true }).click(); await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  await expect(page.locator('.trace-board')).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('native concurrent Duo finishes both profiles, independent dot pads and one shared trophy', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native simultaneous touch uses Chromium CDP.');
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
  const page = await context.newPage(), session = await context.newCDPSession(page), errors = []; page.on('pageerror', error => errors.push(error.message));
  await verifiedDuo(page, session);
  const ids = await page.locator('.trace-board pattern').evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(2);
  for (let i = 0; i < 3; i++) {
    await ready(page, 2);
    await page.screenshot({ path: `${evidence}/duo-native-racing-${i + 1}.png`, animations: 'disabled' });
    await bothTouch(page, session, async () => {
      await page.screenshot({ path: `${evidence}/duo-native-dots-${i + 1}.png`, animations: 'disabled' });
    });
    await expect(page.getByRole('heading', { name: `Pusingan ${i + 1} selesai!` })).toBeVisible();
    await page.screenshot({ path: `${evidence}/duo-native-round-${i + 1}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: i === 2 ? 'Lihat keputusan' : 'Pusingan seterusnya' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Trofi bersama!' })).toBeVisible();
  await page.screenshot({ path: `${evidence}/duo-native-shared-trophy.png`, fullPage: true, animations: 'disabled' });
  const saved = await records(page); expect(saved.progress.attempts).toHaveLength(6); expect(new Set(saved.progress.attempts.map(a => a.id)).size).toBe(6); expect(saved.progress.profile).toBe('Bunga');
  expect(saved.progress.attempts.filter(a => a.profile === 'Bunga')).toHaveLength(3); expect(saved.progress.attempts.filter(a => a.profile === 'Daun')).toHaveLength(3);
  expect(saved.progress.attempts.every(a => a.pointerType === 'touch' && a.toleranceProfile === 'play-touch-standard-v2')).toBe(true); expect(saved.matches.matches).toHaveLength(1); expect(errors).toEqual([]);
  await context.close();
});
test('captured contact cannot cross lanes; extra own-lane contact is ignored; retry affects only owner', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native simultaneous touch uses Chromium CDP.');
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true }); const page = await context.newPage(), session = await context.newCDPSession(page);
  await verifiedDuo(page, session); await ready(page, 2);
  const [a, b] = await Promise.all([0, 1].map(slot => boardModels(page, pane(page, slot).locator('.trace-board'))));
  await touches(session, 'touchStart', [{ ...a.strokes[0][0], id: 1 }]);
  await touches(session, 'touchMove', [{ ...b.strokes[0][0], id: 1 }]);
  expect(await pane(page, 1).locator('.play-fill').count()).toBe(0); await touches(session, 'touchEnd', []);
  await touches(session, 'touchStart', [{ ...a.strokes[0][0], id: 1 }, { ...b.strokes[0][0], id: 2 }]);
  await touches(session, 'touchStart', [{ ...a.strokes[0][0], id: 1 }, { ...b.strokes[0][0], id: 2 }, { ...a.strokes[0][5], id: 3 }]);
  for (let i = 1; i < 20; i++) await touches(session, 'touchMove', [{ ...a.strokes[0][i], id: 1 }, { ...b.strokes[0][i], id: 2 }, { ...a.strokes[0][5], id: 3 }]);
  await touches(session, 'touchEnd', []); await expect(pane(page, 1).locator('.play-fill')).toBeVisible();
  const saved = await pane(page, 1).locator('.play-fill').getAttribute('data-measured-frontier');
  await pane(page, 0).getByRole('button', { name: 'Cuba lagi' }).click(); await expect(pane(page, 0).locator('.play-fill')).toHaveCount(0); expect(await pane(page, 1).locator('.play-fill').getAttribute('data-measured-frontier')).toBe(saved);
  await completeMouse(page, 0); await expect(pane(page, 0).getByText('Siap! Tunggu teman.')).toBeVisible(); await expect(pane(page, 1).getByRole('button', { name: 'Cuba lagi' })).toBeEnabled();
  await page.clock.fastForward(91000); await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  const savedRecords = await records(page); expect(savedRecords.progress.attempts).toHaveLength(1); expect(savedRecords.progress.attempts[0].retries).toBe(1);
  await context.close();
});
test('storage failure retains session export and reload never restores a live match', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Quota exceeded'); }; });
  await page.setViewportSize({ width: 1024, height: 768 }); await solo(page); await ready(page); await completeMouse(page);
  await page.getByRole('button', { name: 'Keluar cabaran' }).click(); await page.getByRole('button', { name: 'Ya, keluar' }).click();
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click(); await expect(page.getByText(/Storan tidak tersedia/)).toBeVisible();
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Eksport kemajuan' }).click();
  let json = ''; for await (const chunk of await (await pending).createReadStream()) json += chunk.toString();
  const data = JSON.parse(json); expect(data.progress.attempts).toHaveLength(1); expect(data.matches.matches).toHaveLength(1);
  await page.reload(); await dismissSplash(page); await expect(page.locator('.match-arena')).toHaveCount(0);
});
test('Duo survives insufficient space and visibility pause with both accepted trails intact', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await setup(page, 'duo'); await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click(); await ready(page, 2);
  for (let slot = 0; slot < 2; slot++) { const model = await boardModels(page, pane(page, slot).locator('.trace-board')); await draw(page, model.strokes[0].slice(0, 20)); }
  const frontiers = await page.locator('.play-fill').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-measured-frontier')));
  await page.setViewportSize({ width: 844, height: 390 }); await expect(page.locator('.race-lanes')).toBeHidden();
  await page.clock.fastForward(50000); await page.setViewportSize({ width: 768, height: 1024 }); await expect(page.getByRole('heading', { name: 'Rehat sekejap' })).toBeVisible();
  expect(await page.locator('.play-fill').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-measured-frontier')))).toEqual(frontiers);
  await page.screenshot({ path: `${evidence}/duo-portrait-paused.png`, fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Sambung bermain' }).click(); await page.clock.fastForward(3100); await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.getByRole('heading', { name: 'Rehat sekejap' })).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.getByRole('button', { name: 'Sambung bermain' }).click(); await page.clock.fastForward(3100);
  for (let slot = 0; slot < 2; slot++) { const model = await boardModels(page, pane(page, slot).locator('.trace-board')); await draw(page, model.strokes[0].slice(19)); }
  await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
});
test('held dot pad and virtual activation cannot complete during pause or countdown', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await solo(page); await ready(page); await completeMouse(page);
  await page.getByRole('button', { name: 'Pusingan seterusnya' }).click(); await ready(page);
  const model = await boardModels(page); for (const stroke of model.strokes) await draw(page, stroke);
  const pad = page.getByRole('button', { name: 'Tambah titik 1 daripada 1' }); await pad.focus(); await page.keyboard.down('Space');
  await page.setViewportSize({ width: 1000, height: 760 }); await expect(pad).toBeDisabled();
  await pad.dispatchEvent('click', { detail: 0 }); await page.keyboard.up('Space'); expect((await records(page)).progress.attempts).toHaveLength(1);
  await page.getByRole('button', { name: 'Sambung bermain' }).click(); await pad.dispatchEvent('click', { detail: 0 }); expect((await records(page)).progress.attempts).toHaveLength(1);
  await page.clock.fastForward(3100);
  await expect(page.locator('.countdown-overlay')).toHaveCount(0); await expect(pad).toBeEnabled();
  await pad.focus(); await page.keyboard.press('Space'); await expect(page.getByRole('heading', { name: 'Pusingan 2 selesai!' })).toBeVisible();
  expect((await records(page)).progress.attempts).toHaveLength(2);
});
test('fullscreen rejection has a useful fallback and setup pool limits follow eligibility', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.reject(new Error('Denied')); });
  await setup(page); await page.getByRole('button', { name: 'Paparan penuh' }).click(); await expect(page.getByText('Paparan penuh tidak tersedia. Boleh terus bermain dalam pelayar.')).toBeVisible();
  await page.getByLabel('Kumpulan huruf').selectOption('additional'); await expect(page.getByLabel('Bilangan pusingan').locator('option[value="10"]')).toHaveAttribute('disabled', '');
  await page.getByLabel('Masa setiap pusingan').selectOption('60000'); await page.getByRole('button', { name: 'Buka cabaran Solo' }).click(); await expect(page.locator('.race-clock')).toContainText('60');
});
test('native portrait Duo dot controls fit, complete together and appear in teacher history', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native simultaneous touch uses Chromium CDP.');
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true }), page = await context.newPage(), session = await context.newCDPSession(page);
  await verifiedDuo(page, session, true);
  for (let round = 0; round < 3; round++) {
    await ready(page, 2, round === 0 ? 'duo-portrait-countdown' : null);
    await bothTouch(page, session, async count => {
      for (let slot = 0; slot < 2; slot++) {
        const pad = pane(page, slot).getByRole('button', { name: `Tambah titik 1 daripada ${count}` }); await expect(pad).toBeVisible();
        const box = await pad.boundingBox(), guide = await pane(page, slot).locator('.trace-number-instruction').boundingBox(), retry = await pane(page, slot).getByRole('button', { name: 'Cuba lagi' }).boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(64); expect(box.y).toBeGreaterThanOrEqual(guide.y + guide.height);
        // The fitted dock permits the pad and retry beside each other.
        expect(box.y + box.height <= retry.y || retry.y + retry.height <= box.y || box.x + box.width <= retry.x || retry.x + retry.width <= box.x).toBe(true);
        const lane = await pane(page, slot).boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(lane.x); expect(box.x + box.width).toBeLessThanOrEqual(lane.x + lane.width);
        expect(box.y + box.height).toBeLessThanOrEqual(1024);
      }
      await page.screenshot({ path: `${evidence}/duo-portrait-round-${round + 1}-dots.png`, fullPage: true, animations: 'disabled' });
    });
    await expect(page.getByRole('heading', { name: `Pusingan ${round + 1} selesai!` })).toBeVisible();
    await page.getByRole('button', { name: round === 2 ? 'Lihat keputusan' : 'Pusingan seterusnya' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Trofi bersama!' })).toBeVisible(); expect((await records(page)).progress.attempts).toHaveLength(6);
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByRole('tab', { name: 'Cabaran', exact: true }).click();
  const history = page.locator('.record-card').filter({ hasText: 'Bunga / Daun' });
  await expect(history).toContainText('Bunga / Daun'); await expect(history).toContainText('Selesai'); await history.screenshot({ path: `${evidence}/duo-teacher-history.png`, animations: 'disabled' });
  await context.close();
});
for (const [width, height] of [[320, 740], [844, 390]]) test(`Solo has a usable board and completes at ${width}x${height}`, async ({ page }) => {
  await page.setViewportSize({ width, height });
  if (height < 600) {
    await page.goto('/'); await dismissSplash(page); await expect(page.getByRole('dialog', { name: 'Besarkan ruang bermain' })).toBeVisible();
    await page.setViewportSize({ width: height, height: width });
  }
  await solo(page);
  const box = await page.locator('.board-wrap').boundingBox(); expect(box.width).toBeGreaterThanOrEqual(280);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (let round = 0; round < 3; round++) { await ready(page); await completeMouse(page); await expect(page.getByRole('heading', { name: `Pusingan ${round + 1} selesai!` })).toBeVisible(); await page.getByRole('button', { name: round === 2 ? 'Lihat keputusan' : 'Pusingan seterusnya' }).click(); }
  await expect(page.getByRole('heading', { name: 'Bunga dapat trofi!' })).toBeVisible(); await page.screenshot({ path: `${evidence}/solo-${width}x${height}-trophy.png`, fullPage: true, animations: 'disabled' });
});
