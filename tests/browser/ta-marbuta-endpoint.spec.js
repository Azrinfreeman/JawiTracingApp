import { expect } from '@playwright/test';
import { test } from './helpers/localTest.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import letters from '../../src/content/letters.json' with { type: 'json' };
import proposal from '../../src/content/taMarbutaVoice.json' with { type: 'json' };
import { dismissSplash, chooseLetter } from './helpers/navigation.js';
import { boardModels, openTeacher, openLesson, menuAction } from './helpers/tracing.js';
import { instrument, voices } from './helpers/audio.js';

const root = process.env.JAWI_EVIDENCE_DIR || 'output/verification/ta-marbuta-endpoint/browser';
mkdirSync(root, { recursive: true });
test.setTimeout(90000);
const attempts = page => page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts || []);
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function student(page, mode = 'play') {
  await instrument(page); await page.goto('/'); await dismissSplash(page);
  if (mode !== 'play') {
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button', { name: 'Kembali', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await chooseLetter(page, 'Ta marbutah'); await boardModels(page);
  await expect(page.locator('.preview-banner')).toHaveCount(0);
}
async function logicalLoop(board, distorted = false) {
  return board.locator('.reference-stroke').evaluate((path, distorted) => {
    const length = path.getTotalLength(), points = [];
    for (let s = 0; s < length; s += distorted ? 24 : 3) points.push(path.getPointAtLength(s));
    points.push(path.getPointAtLength(length));
    return points.map(p => distorted ? { x: 505.1 + (p.x - 505.1) * .85, y: 469 + (p.y - 469) * .85 - 24 } : { x: p.x, y: p.y });
  }, distorted);
}
async function logicalTail(board) {
  return board.evaluate(svg => {
    const path = svg.querySelector('.reference-stroke'), end = path.getTotalLength();
    const saved = +svg.querySelector('.play-fill').getAttribute('data-measured-frontier'), points = [];
    for (let s = saved; s < end; s += 3) { const p = path.getPointAtLength(s); points.push({ x: p.x, y: p.y }); }
    const p = path.getPointAtLength(end); points.push({ x: p.x, y: p.y }); return points;
  });
}
async function pointerGesture(board, points) {
  await board.evaluate(async (svg, points) => {
    const matrix = svg.getScreenCTM();
    svg.setPointerCapture = () => {}; svg.hasPointerCapture = () => false;
    const send = (type, p) => {
      const q = new DOMPoint(p.x, p.y).matrixTransform(matrix);
      svg.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 82, pointerType: 'touch', clientX: q.x, clientY: q.y }));
    };
    send('pointerdown', points[0]);
    for (let i = 1; i < points.length; i++) { send('pointermove', points[i]); if (i % 8 === 0) await new Promise(requestAnimationFrame); }
    send('pointerup', points.at(-1));
  }, points);
}
async function dots(board, page) {
  const targets = letters.find(l => l.id === 'ta-marbuta').geometry.dotTargets;
  await pointerGesture(board, [targets[1]]); // A future dot cannot be accepted first.
  await expect(board.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'dot-1');
  await pointerGesture(board, [targets[0]]);
  await expect(board.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'dot-2');
  await expect(board).not.toHaveAttribute('data-phase', 'complete');
  await pointerGesture(board, [targets[1]]); await settle(page);
  await expect(board).toHaveAttribute('data-phase', 'complete');
}
async function capture(page, name) {
  await settle(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: `${root}/${name}.png`, animations: 'disabled' });
}

for (const [width, height] of [[320, 740], [768, 1024], [1920, 1080]]) {
  test(`student Ta marbutah repairs the remaining tail and requires both dots ${width}`, async ({ page, browserName }) => {
    await page.setViewportSize({ width, height }); await student(page);
    const board = page.locator('.trace-board');
    await page.getByRole('button', { name: 'Dengar nama Ta marbutah', exact: true }).click();
    expect((await voices(page)).at(-1).src).toBe(proposal.recording.src);
    await pointerGesture(board, await logicalLoop(board, true));
    await expect(board.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'stroke-1');
    await expect(page.locator('.terminal-resume-cue')).toBeVisible();
    const before = +await page.locator('.play-fill').getAttribute('data-measured-frontier');
    await capture(page, `${browserName}-${width}-remaining`);
    // Captures can affect layout; obtain screen transforms inside each new gesture.
    await pointerGesture(board, [{ x: 505.1, y: 469 }]);
    expect(+await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);
    expect(await attempts(page)).toHaveLength(0);
    await pointerGesture(board, await logicalTail(board));
    await expect(board.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'dot-1');
    await expect(page.locator('.writing-cue')).toContainText('Tinggal 2 titik');
    await capture(page, `${browserName}-${width}-dots`);
    await dots(board, page);
    await expect.poll(async () => (await attempts(page)).length).toBe(1);
    expect((await attempts(page))[0]).toMatchObject({ letterId: 'ta-marbuta', contentVersion: 4, preview: false, outcome: 'playComplete', metrics: { dotCount: 2 } });
    expect((await voices(page)).at(-1).src).toBe(proposal.recording.src);
    await capture(page, `${browserName}-${width}-complete`);
  });
}
for (const mode of ['guided', 'precision']) test(`Ta marbutah clean tracing still completes in ${mode}`, async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); await student(page, mode);
  const board = page.locator('.trace-board');
  await pointerGesture(board, await logicalLoop(board)); await dots(board, page);
  await expect.poll(async () => (await attempts(page)).length).toBe(1);
  expect((await attempts(page))[0]).toMatchObject({ letterId: 'ta-marbuta', contentVersion: 4, mode, preview: false });
});

test('native touch can recover the terminal tail and tap both dots', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native touch emulation uses Chromium CDP.');
  await page.setViewportSize({ width: 768, height: 1024 }); await student(page);
  const session = await context.newCDPSession(page), board = page.locator('.trace-board');
  const send = async points => {
    const screen = await board.evaluate((svg, points) => points.map(p => { const q = new DOMPoint(p.x, p.y).matrixTransform(svg.getScreenCTM()); return { x: q.x, y: q.y, id: 1 }; }), points);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [screen[0]] });
    for (const p of screen.slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await send(await logicalLoop(board, true));
  await expect(page.locator('.terminal-resume-cue')).toBeVisible();
  await send(await logicalTail(board));
  await expect(board.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id', 'dot-1');
  for (const dot of letters.find(l => l.id === 'ta-marbuta').geometry.dotTargets) await send([dot]);
  await expect.poll(async () => (await attempts(page)).length).toBe(1);
  expect((await attempts(page))[0]).toMatchObject({ pointerType: 'touch', metrics: { dotCount: 2 } });
  await session.detach();
});

for (const mode of ['solo', 'duo']) test(`Ta marbutah ${mode} recovery scores once and keeps lanes independent`, async ({ page, context, browserName }) => {
  test.skip(mode === 'duo' && browserName !== 'chromium', 'Scored Duo requires a native two-touch input check.');
  await instrument(page); await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/'); await dismissSplash(page); await page.clock.install();
  await page.getByRole('button', { name: mode === 'duo' ? 'Duo 1v1' : /Cabaran trofi/, exact: mode === 'duo' }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await page.getByLabel('Kumpulan huruf').selectOption('ready');
  await page.getByLabel('Bilangan pusingan').selectOption('3');
  // Fisher-Yates: retain order except swap index 3 (Ta marbutah) with index 0.
  await page.evaluate(size => { let i = size - 1; Math.random = () => i-- === 3 ? 0 : .999999; }, letters.length);
  if (mode === 'duo') {
    await page.getByRole('button', { name: 'Uji dua sentuhan' }).click();
    const session = await context.newCDPSession(page), positions = [];
    for (const n of [1, 2]) { const b = await page.getByRole('button', { name: `Uji sentuhan pemain ${n}` }).boundingBox(); positions.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, id: n }); }
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: positions });
    await expect(page.getByText('Dua sentuhan serentak berjaya. Sedia bermain!')).toBeVisible();
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.getByRole('button', { name: 'Teruskan Duo 1v1' }).click(); await session.detach();
  } else await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  const count = mode === 'duo' ? 2 : 1;
  await expect(page.locator('.arena-round')).toContainText('Ta marbutah');
  for (let slot = 0; slot < count; slot++) await page.locator(`[data-player-slot="${slot}"]`).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  await page.clock.fastForward(3100);
  for (let slot = 0; slot < count; slot++) {
    const board = page.locator('.trace-board').nth(slot);
    await pointerGesture(board, await logicalLoop(board, true));
    await pointerGesture(board, await logicalTail(board)); await dots(board, page);
    if (slot === 0 && count === 2) await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase', 'awaitingStart');
  }
  await expect(page.locator('.round-result')).toBeVisible();
  await expect.poll(async () => (await attempts(page)).length).toBe(count);
  for (const a of await attempts(page)) expect(a).toMatchObject({ letterId: 'ta-marbuta', contentVersion: 4, outcome: 'playComplete', metrics: { dotCount: 2 } });
  const scores = await page.locator('.round-score-grid strong').allTextContents();
  expect(scores).toHaveLength(count);
  for (const score of scores) expect(parseInt(score)).toBeGreaterThanOrEqual(100);
  await page.locator('.round-result').getByRole('button', { name: 'Dengar nama Ta marbutah', exact: true }).click();
  expect((await voices(page)).at(-1).src).toBe(proposal.recording.src);
  await capture(page, `${browserName}-${mode}-round-result`);
});

async function review(page) {
  await page.goto('/'); await dismissSplash(page); await openTeacher(page);
  await page.getByRole('tab', { name: 'Suara', exact: true }).click();
  await page.getByLabel('Huruf untuk semakan suara').selectOption('ta-marbuta');
}
test('audio-only approval preserves saved tracing credit and adult-preview mute/replay', async ({ page }) => {
  const old = { id: 'ta-marbuta-before-audio-approval', timestamp: '2026-10-11T10:00:00+08:00', profile: 'Bunga', letterId: 'ta-marbuta', contentVersion: 4, audioVersion: 1,
    mode: 'play', pointerType: 'touch', toleranceProfile: 'play-touch-standard-v2', metrics: { coverage: 1, meanError: 0, invalidTravel: 0, invalidEvents: 0 },
    assistance: 0, retries: 0, outcome: 'playComplete', geometryStatus: 'approved', audioStatus: 'approved', preview: false };
  await page.addInitScript(old => {
    if (!localStorage.getItem('taman-jawi.progress.v1')) localStorage.setItem('taman-jawi.progress.v1', JSON.stringify({ version: 1, profile: 'Bunga', attempts: [old], copies: [] }));
  }, old);
  await student(page);
  await expect(page.locator('.stage-letter-title [aria-label="Siap dijejak"]')).toHaveCount(1);
  expect(await attempts(page)).toEqual([old]);
  await page.reload(); await dismissSplash(page);
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.locator('.garden-progress strong')).toHaveText('1');
  expect(await attempts(page)).toEqual([old]);
  await openLesson(page, 'Ta marbutah', 'play');
  await expect(page.locator('.preview-banner')).toBeVisible();
  const hear = page.getByRole('button', { name: 'Dengar nama Ta marbutah', exact: true });
  await menuAction(page, 'Audio: Hidup');
  await page.getByRole('button', { name: 'Sambung jejak', exact: true }).click(); await hear.click();
  expect((await voices(page)).at(-1)).toMatchObject({ src: proposal.recording.src, muted: true });
  const dialog = page.getByRole('dialog', { name: 'Dengar nama huruf' });
  if (await dialog.isVisible()) await dialog.getByRole('button', { name: 'Tutup', exact: true }).click();
  await menuAction(page, 'Audio: Senyap');
  await page.getByRole('button', { name: 'Sambung jejak', exact: true }).click(); await hear.click();
  expect((await voices(page)).at(-1)).toMatchObject({ src: proposal.recording.src, muted: false });
  expect(await attempts(page)).toEqual([old]);
});
test('approved Ta-only voice replaces the candidate and supports replay/navigation', async ({ page, browserName }) => {
  await instrument(page); await page.setViewportSize({ width: 390, height: 844 }); await review(page);
  await expect(page.locator('.audio-review-transcript strong')).toHaveText('Ta');
  await expect(page.locator('.audio-review-transcript')).toContainText('Suara diluluskan');
  await expect(page.locator('.audio-review-candidate')).toHaveCount(0);
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Dengar rakaman Ta marbutah', exact: true }).click();
  expect((await voices(page)).slice(-2).every(v => v.src === proposal.recording.src)).toBe(true);
  await capture(page, `${browserName}-audio-review-phone`);
  await page.getByLabel('Huruf untuk semakan suara').selectOption('ta');
  await expect(page.locator('.audio-review-candidate')).toHaveCount(0);
  expect(await page.evaluate(() => window.__media.elements.every(a => a.paused))).toBe(true);
  expect(await attempts(page)).toHaveLength(0);
});
test('blocked approved playback offers replay and preserves approval', async ({ page }) => {
  await instrument(page, { failVoice: true }); await review(page);
  await page.getByRole('button', { name: 'Dengar rakaman Ta marbutah', exact: true }).click();
  await expect(page.locator('.audio-notice')).toContainText('Tekan Dengar sekali lagi');
  await expect(page.locator('.audio-review-transcript')).toContainText('Suara diluluskan');
});
test('actual approved Ta-only voice decodes and plays twice in Chromium', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Recorded Windows WebKit native codec limitation; its UI uses controlled playback tests.');
  await page.addInitScript(() => {
    window.taPlayback = { starts: 0, ends: 0 };
    const NativeAudio = window.Audio;
    window.Audio = function (...args) {
      const a = new NativeAudio(...args);
      a.addEventListener('playing', () => { if (a.src.endsWith('ta-marbuta-name-v2.mp3')) window.taPlayback.starts++; });
      a.addEventListener('ended', () => { if (a.src.endsWith('ta-marbuta-name-v2.mp3')) window.taPlayback.ends++; }); return a;
    };
  });
  await review(page);
  const metrics = await page.evaluate(async src => {
    const raw = await (await fetch(src)).arrayBuffer(), digest = await crypto.subtle.digest('SHA-256', raw), c = new AudioContext();
    try {
      const b = await c.decodeAudioData(raw); let energy = 0;
      for (const v of b.getChannelData(0)) energy += v * v;
      return { duration: b.duration, rms: Math.sqrt(energy / b.length), sha256: [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join('') };
    } finally { await c.close(); }
  }, proposal.recording.src);
  expect(metrics.sha256).toBe(proposal.recording.origin.recordingSha256);
  expect(metrics.duration).toBeGreaterThan(.1); expect(metrics.rms).toBeGreaterThan(.001);
  for (let count = 1; count <= 2; count++) {
    await page.getByRole('button', { name: 'Dengar rakaman Ta marbutah', exact: true }).press('Enter');
    await expect.poll(() => page.evaluate(() => window.taPlayback.ends)).toBe(count);
  }
  expect(await page.evaluate(() => window.taPlayback.starts)).toBe(2);
  writeFileSync(`${root}/native-audio.json`, JSON.stringify({ metrics, playback: await page.evaluate(() => window.taPlayback) }, null, 2));
});
