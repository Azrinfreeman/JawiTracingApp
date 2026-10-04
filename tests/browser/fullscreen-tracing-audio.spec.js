import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dismissSplash } from './helpers/navigation.js';
import { openLesson, boardModels, draw, openMenu, menuAction, tapDots } from './helpers/tracing.js';
import letters from '../../src/content/letters.json' with { type: 'json' };

test.setTimeout(90000);
const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/fullscreen-tracing-audio'; mkdirSync(evidence, { recursive: true });
const MUSIC = '/audio/music/taman-kawan-v1.mp3';
const ALIF_NAME = '/audio/letters/alphabet/alif-name-v2.mp3';
const pane = (page, slot) => page.locator(`[data-player-slot="${slot}"]`);

/** Replaces media playback with a recorder so lifecycle, ordering and mix levels can be asserted exactly. */
async function instrument(page, { failVoice = false, voiceMs = 900 } = {}) {
  await page.addInitScript(({ failVoice: fail, voiceMs: duration }) => {
    const media = window.__media = { plays: [], elements: [], fullscreen: 0, voicePauses: 0 };
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { configurable: true, get() { return !this.__playing; } });
    HTMLMediaElement.prototype.play = function () {
      const src = this.getAttribute('src') || '', music = src.includes('/audio/music/');
      if (fail && !music) return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
      this.__playing = true; media.plays.push({ src, music, volume: this.volume, muted: this.muted });
      if (!music) setTimeout(() => { if (this.__playing) { this.__playing = false; this.onended?.(); } }, duration);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () { if (this.__playing && !(this.getAttribute('src') || '').includes('/audio/music/')) media.voicePauses++; this.__playing = false; };
    HTMLMediaElement.prototype.load = function () {};
    const NativeAudio = window.Audio;
    window.Audio = function () {
      const element = new NativeAudio();
      // Fake lifecycle tests must not also invoke Windows WebKit's unsupported native MP3 decoder.
      // Separate checks below exercise the actual packaged media in a supported runtime.
      let src = '';
      Object.defineProperty(element, 'src', { configurable: true, get: () => src, set: value => { src = value; } });
      const get = element.getAttribute.bind(element), remove = element.removeAttribute.bind(element);
      element.getAttribute = name => name === 'src' ? src : get(name);
      element.removeAttribute = name => { if (name === 'src') src = ''; else remove(name); };
      media.elements.push(element); return element;
    };
    window.Audio.prototype = NativeAudio.prototype;
    Element.prototype.requestFullscreen = function () { media.fullscreen++; return Promise.resolve(); };
  }, { failVoice, voiceMs });
}
const voices = async page => (await page.evaluate(() => window.__media.plays)).filter(play => !play.music);
const musicState = page => page.evaluate(() => { const e = window.__media.elements.find(el => (el.getAttribute('src') || '').includes('/audio/music/')); return e ? { playing: !e.paused, volume: e.volume, loop: e.loop } : null; });
const musicPlayingAt = (page, level) => expect.poll(async () => { const state = await musicState(page); return state?.playing && Math.abs(state.volume - level) < .012; }, { timeout: 5000 }).toBe(true);
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const completeHeading = (page, letter) => page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter}!` });
async function trace(page, { dots = true } = {}) {
  const model = await boardModels(page);
  for (const stroke of model.strokes) await draw(page, stroke);
  if (dots) await tapDots(page);
  return model;
}

const viewports = [[320, 600], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1920, 1080], [3840, 2160]];
for (const [width, height] of viewports) {
  test(`practice at ${width}x${height} has no dock, no strip and no collisions`, async ({ page, browserName }) => {
    test.skip(width === 3840 && browserName === 'webkit', 'Recorded Windows WebKit native-4K timeout; Chromium covers 4K.');
    await page.setViewportSize({ width, height }); await instrument(page);
    await openLesson(page, 'Ba', 'play'); await settle(page);
    await expect(page.locator('.lesson-dock, .race-dock, .race-dock-controls, .arena-ready-note, .dock-controls')).toHaveCount(0);
    const rects = await page.evaluate(() => {
      const box = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
      const writing = document.querySelector('.book-writing'), board = document.querySelector('.trace-board');
      const menu = document.querySelector('.stage-menu-button'), badge = document.querySelector('.stage-badge');
      const letter = [...document.querySelectorAll('.reference-stroke, .reference-dot, .numbered-trace-guides *')].filter(e => e.getBoundingClientRect().width).map(box);
      return { writing: box(writing), board: box(board), menu: box(menu), badge: box(badge), letter, scroll: [document.scrollingElement.scrollHeight, innerHeight, document.scrollingElement.scrollWidth, innerWidth] };
    });
    // The stage owns the writing rectangle: nothing is reserved underneath it.
    expect(rects.board.h).toBeGreaterThanOrEqual(rects.writing.h - 2); expect(rects.board.w).toBeGreaterThanOrEqual(rects.writing.w - 2);
    expect(rects.scroll[0]).toBeLessThanOrEqual(rects.scroll[1] + 1); expect(rects.scroll[2]).toBeLessThanOrEqual(rects.scroll[3] + 1);
    expect(rects.menu.w).toBeGreaterThanOrEqual(48); expect(rects.menu.h).toBeGreaterThanOrEqual(48);
    const touches = (a, b) => a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;
    for (const control of [rects.menu, rects.badge]) {
      expect(rects.letter.filter(item => touches(item, control))).toHaveLength(0);
      expect(control.x).toBeGreaterThanOrEqual(0); expect(control.r).toBeLessThanOrEqual(width); expect(control.y).toBeGreaterThanOrEqual(0);
    }
    expect(touches(rects.menu, rects.badge)).toBe(false);
    await page.screenshot({ path: `${evidence}/${browserName}-practice-${width}x${height}.png`, animations: 'disabled' });
  });
}

test('menu replaces the toolbar: every action is reachable and closing keeps accepted progress', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await instrument(page);
  await openLesson(page, 'Ba', 'play');
  const model = await boardModels(page); await draw(page, model.strokes[0]);
  await expect(page.locator('.validated-dot')).toHaveCount(0);
  const before = Number(await page.locator('.play-fill').first().getAttribute('data-measured-frontier'));
  await openMenu(page);
  for (const name of ['Dengar', 'Tunjuk cara', 'Cuba lagi', 'Kenal huruf dan panduan', 'Huruf seterusnya', 'Huruf sebelumnya', 'Isi kandungan', 'Bantuan titik']) {
    await expect(page.getByRole('dialog', { name: 'Menu permainan' }).getByRole('button', { name, exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Halaman menu seterusnya' }).click();
  for (const name of ['Muzik mati', 'Senyapkan audio', 'Paparan penuh']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  await page.screenshot({ path: `${evidence}/${browserName}-menu-page-2.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Tutup', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Menu permainan' })).toHaveCount(0);
  expect(Number(await page.locator('.play-fill').first().getAttribute('data-measured-frontier'))).toBe(before);
  // A demonstration is optional and never counts as completion.
  await menuAction(page, 'Tunjuk cara');
  await expect(page.locator('.demonstration-ink').first()).toBeVisible();
  await expect(page.locator('.book-completed')).toHaveCount(0); expect(await voices(page)).toHaveLength(0);
  await expect(page.locator('.demonstration-ink')).toHaveCount(0, { timeout: 8000 });
  await menuAction(page, 'Cuba lagi'); await expect(page.locator('.validated-dot')).toHaveCount(0);
  await menuAction(page, 'Kenal huruf dan panduan'); await expect(page.getByRole('dialog', { name: 'Kenal huruf Ba' })).toBeVisible();
});

test('the full letter is announced once, after the last required dot, with its approved recording', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  await openLesson(page, 'Alif', 'play');
  const model = await boardModels(page); await draw(page, model.strokes[0]);
  await expect(completeHeading(page, 'Alif')).toBeVisible();
  await expect.poll(async () => (await voices(page)).length).toBe(1);
  expect((await voices(page))[0].src).toBe(ALIF_NAME);
  await settle(page); await page.waitForTimeout(1200);
  expect(await voices(page)).toHaveLength(1);
  // Choices wait until the release has ended, then replay is deliberate.
  const next = page.getByRole('button', { name: 'Huruf seterusnya', exact: true });
  await expect(next).toBeEnabled();
  await page.getByRole('button', { name: 'Dengar', exact: true }).click();
  await expect.poll(async () => (await voices(page)).length).toBe(2);
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts);
  expect(attempts).toHaveLength(1);
  // A fresh attempt is a fresh eligible announcement; the retry itself is silent.
  await page.getByRole('button', { name: 'Main lagi', exact: true }).click();
  await expect(page.locator('.book-completed')).toHaveCount(0); await page.waitForTimeout(500);
  expect(await voices(page)).toHaveLength(2);
  await draw(page, (await boardModels(page)).strokes[0]); await expect(completeHeading(page, 'Alif')).toBeVisible();
  await expect.poll(async () => (await voices(page)).length).toBe(3);
});

test('a finished body with a dot still to place stays silent until the dot is placed', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  await openLesson(page, 'Ba', 'play');
  const model = await boardModels(page); await draw(page, model.strokes[0]);
  await page.waitForTimeout(1000);
  await expect(page.locator('.book-completed')).toHaveCount(0); expect(await voices(page)).toHaveLength(0);
  await page.mouse.click(model.dots[0].x, model.dots[0].y);
  await expect(page.locator('.book-completed')).toBeVisible();
  await expect.poll(async () => (await voices(page)).length).toBe(1);
});

test('blocked voice never blocks completion; replay recovers from a fresh gesture', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page, { failVoice: true });
  await openLesson(page, 'Alif', 'play'); await draw(page, (await boardModels(page)).strokes[0]);
  await expect(completeHeading(page, 'Alif')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Tekan Dengar' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts)).toHaveLength(1);
  await expect(page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).first()).toBeEnabled();
});

test('saving a freehand copy never announces the letter', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  await openLesson(page, 'Alif', 'play'); await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.getByRole('button', { name: 'Sekarang, cuba salin sendiri' })).toBeEnabled();
  await expect.poll(async () => (await voices(page)).length).toBe(1);
  await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri' }).click();
  const board = page.locator('.trace-board'), box = await board.boundingBox();
  await draw(page, [{ x: box.x + box.width * .4, y: box.y + box.height * .3 }, { x: box.x + box.width * .5, y: box.y + box.height * .6 }, { x: box.x + box.width * .6, y: box.y + box.height * .8 }]);
  await page.getByRole('button', { name: 'Simpan untuk guru' }).click();
  await expect(page.locator('.book-completed')).toBeVisible(); await page.waitForTimeout(800);
  expect(await voices(page)).toHaveLength(1);
});

test('music is one quiet local loop that ducks under the voice, obeys mute and survives leaving only by stopping', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  await openLesson(page, 'Alif', 'play');
  await musicPlayingAt(page, .15);
  expect(await page.evaluate(() => window.__media.plays.filter(play => play.music).length)).toBe(1);
  expect((await musicState(page)).loop).toBe(true);
  await draw(page, (await boardModels(page)).strokes[0]);
  await expect(completeHeading(page, 'Alif')).toBeVisible();
  await expect.poll(async () => { const s = await musicState(page); return s.volume; }, { timeout: 3000 }).toBeLessThan(.06);
  await musicPlayingAt(page, .15); // restored after the recording ends
  // Separate music switch: speech remains available.
  await menuAction(page, 'Muzik mati');
  await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.music.v1')))).toMatchObject({ version: 1, enabled: false });
  await menuAction(page, 'Dengar');
  await expect.poll(async () => (await voices(page)).length).toBe(2);
  await menuAction(page, 'Muzik hidup'); await musicPlayingAt(page, .15);
  // Master mute silences both channels.
  await menuAction(page, 'Senyapkan audio');
  await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  await menuAction(page, 'Hidupkan audio'); await musicPlayingAt(page, .15);
  expect(await page.evaluate(() => window.__media.plays.filter(play => play.music).length)).toBeGreaterThanOrEqual(3);
  expect(await page.evaluate(() => window.__media.elements.filter(el => (el.getAttribute('src') || '').includes('/audio/music/')).length)).toBe(1);
});

test('music stops for background, hidden pages and leaving the game, and honours a saved preference', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  await openLesson(page, 'Alif', 'play'); await musicPlayingAt(page, .15);
  await page.evaluate(() => window.dispatchEvent(new Event('taman-jawi:pause')));
  await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  await page.mouse.click(10, 10); await musicPlayingAt(page, .15);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await musicPlayingAt(page, .15);
  await menuAction(page, 'Isi kandungan');
  await expect(page.locator('.letter-grid-host')).toBeVisible();
  await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  await page.evaluate(() => localStorage.setItem('taman-jawi.music.v1', JSON.stringify({ version: 1, enabled: false, volume: .3 })));
  await page.reload(); await dismissSplash(page);
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await expect(page.getByLabel('Muzik latar', { exact: true }).first()).not.toBeChecked();
  await page.getByRole('checkbox', { name: 'Muzik latar' }).check();
  await page.getByLabel('Kelantangan muzik latar').fill('0.2');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.music.v1')))).toEqual({ version: 1, enabled: true, volume: .2 });
  await page.evaluate(() => localStorage.setItem('taman-jawi.music.v1', 'broken'));
  await page.reload(); await dismissSplash(page);
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Muzik latar' })).toBeChecked();
});

test('browser fullscreen is requested once from the game-entry gesture, not on every page', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  await openLesson(page, 'Alif', 'play');
  expect(await page.evaluate(() => window.__media.fullscreen)).toBe(1);
  await menuAction(page, 'Huruf seterusnya'); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__media.fullscreen)).toBe(1);
});

async function match(page, mode) {
  await page.addInitScript(() => { Math.random = () => .99999; });
  await page.goto('/'); await dismissSplash(page); await page.clock.install();
  if (mode === 'duo') await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click();
  else await page.getByRole('button', { name: /Cabaran trofi/ }).click();
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await page.getByLabel('Bilangan pusingan').selectOption('3');
  if (mode === 'duo') { await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click(); }
  else await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
}
async function begin(page, count) {
  for (let slot = 0; slot < count; slot++) await pane(page, slot).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  await expect(page.locator('.countdown-overlay')).toBeVisible(); await page.clock.fastForward(3100);
  await expect(page.locator('.countdown-overlay')).toHaveCount(0);
}
async function finishLane(page, slot) {
  const board = pane(page, slot).locator('.trace-board'), model = await boardModels(page, board);
  for (const stroke of model.strokes) await draw(page, stroke);
  for (const dot of model.dots) await page.mouse.click(dot.x, dot.y);
}

test('Solo: readiness is an overlay, the letter is announced once at completion and replay is on the result', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page); await match(page, 'solo');
  await expect(page.locator('.race-dock, .arena-ready-note, .race-toolbar')).toHaveCount(0);
  await expect(pane(page, 0).locator('.ready-overlay')).toBeVisible();
  await page.screenshot({ path: `${evidence}/${browserName}-solo-ready.png`, animations: 'disabled' });
  await pane(page, 0).getByRole('button', { name: 'Lihat contoh', exact: true }).click();
  await expect(pane(page, 0).locator('.ready-overlay')).toHaveCount(0); await expect(page.locator('.demonstration-ink').first()).toBeVisible();
  expect(await voices(page)).toHaveLength(0);
  await page.clock.fastForward(6000); await expect(pane(page, 0).locator('.ready-overlay')).toBeVisible();
  await begin(page, 1); await finishLane(page, 0);
  await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  await expect.poll(async () => (await voices(page)).length).toBe(1);
  await page.clock.fastForward(5000); expect(await voices(page)).toHaveLength(1);
  await page.getByRole('dialog', { name: 'Pusingan 1 selesai!' }).getByRole('button', { name: /Dengar nama/ }).click();
  await expect.poll(async () => (await voices(page)).length).toBe(2);
});

test('Duo: the first accepted letter starts one shared announcement; the second finish neither restarts nor cuts it', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await instrument(page, { voiceMs: 60000 }); await match(page, 'duo');
  await begin(page, 2);
  await page.screenshot({ path: `${evidence}/${browserName}-duo-race.png`, animations: 'disabled' });
  await finishLane(page, 0);
  await expect.poll(async () => (await voices(page)).length).toBe(1);
  await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toHaveCount(0);
  await finishLane(page, 1);
  await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  expect(await voices(page)).toHaveLength(1);
  // Still the one recording, uninterrupted by the second finish or the round result.
  expect(await page.evaluate(() => ({ cuts: window.__media.voicePauses, playing: window.__media.elements.filter(el => !(el.getAttribute('src') || '').includes('/audio/music/') && !el.paused).length }))).toEqual({ cuts: 0, playing: 1 });
  // The next round may announce again; a round where both time out does not.
  await page.getByRole('button', { name: 'Pusingan seterusnya', exact: true }).click(); await page.clock.fastForward(1200);
  await begin(page, 2); await page.clock.fastForward(91000);
  await expect(page.getByRole('heading', { name: 'Pusingan 2 selesai!' })).toBeVisible();
  expect(await voices(page)).toHaveLength(1);
});

test('Duo menu pauses both lanes, retries one lane, and dot help appears only in the chosen lane after the shared countdown', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await instrument(page); await match(page, 'duo');
  await begin(page, 2);
  await page.getByRole('button', { name: 'Menu permainan' }).click();
  const menu = page.getByRole('dialog', { name: 'Rehat sekejap' }); await expect(menu).toBeVisible();
  await expect(page.locator('.trace-assistance')).toHaveCount(0);
  await page.screenshot({ path: `${evidence}/${browserName}-duo-menu.png`, animations: 'disabled' });
  await menu.getByRole('button', { name: /Cuba lagi · /, exact: false }).first().click();
  await expect(page.locator('.countdown-overlay')).toBeVisible(); await page.clock.fastForward(3100);
  await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  // The seeded first round is Alif. Move to Ba and earn its body before asking for dot help.
  await page.clock.fastForward(91000);
  await page.getByRole('button', { name: 'Pusingan seterusnya', exact: true }).click(); await page.clock.fastForward(1200);
  await begin(page, 2);
  expect(await page.locator('.reference-dot').count()).toBe(2);
  for (const slot of [0, 1]) {
    const model = await boardModels(page, pane(page, slot).locator('.trace-board'));
    for (const stroke of model.strokes) await draw(page, stroke);
    await expect(pane(page, slot).locator('.trace-board')).toHaveAttribute('data-phase', 'awaitingMark');
  }
  await page.getByRole('button', { name: 'Menu permainan' }).click();
  await page.getByRole('dialog', { name: 'Rehat sekejap' }).getByRole('button', { name: /Bantuan titik · /, exact: false }).first().click();
  await expect(page.locator('.countdown-overlay')).toBeVisible(); await expect(page.locator('.trace-assistance')).toHaveCount(0);
  await page.clock.fastForward(3100);
  await expect(pane(page, 0).locator('.trace-assistance')).toBeVisible();
  await expect(pane(page, 1).locator('.trace-assistance')).toHaveCount(0);
  await pane(page, 0).getByRole('button', { name: 'Tambah titik 1 daripada 1' }).press('Enter');
  await expect(pane(page, 0).locator('.trace-board')).toHaveAttribute('data-phase', 'complete');
  await expect(pane(page, 1).locator('.trace-board')).toHaveAttribute('data-phase', 'awaitingMark');
  expect(await voices(page)).toHaveLength(1);
});

test('the packaged music and existing MP3/WAV letter names decode to non-silent audio', async ({ page, browserName }, testInfo) => {
  await page.goto('/');
  test.skip(!await page.evaluate(() => Boolean(window.AudioContext || window.webkitAudioContext)), 'AudioContext is unavailable in this Windows WebKit runtime; Chromium checks the packaged assets.');
  const sources = [MUSIC, letters.find(letter => letter.id === 'alif').audio.name.src, letters.find(letter => letter.audio.name.src.endsWith('.wav')).audio.name.src];
  const decoded = await page.evaluate(async sources => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    try {
      return await Promise.all(sources.map(async src => {
        const response = await fetch(src); if (!response.ok) throw new Error(`${src}: ${response.status}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        const data = buffer.getChannelData(0); let energy = 0, peak = 0;
        for (const sample of data) { energy += sample * sample; peak = Math.max(peak, Math.abs(sample)); }
        return { src, duration: buffer.duration, channels: buffer.numberOfChannels, rate: buffer.sampleRate, rms: Math.sqrt(energy / data.length), peak, boundaryDifference: Math.abs(data[0] - data.at(-1)) };
      }));
    } finally { await context.close(); }
  }, sources);
  for (const asset of decoded) { expect(asset.duration).toBeGreaterThan(.1); expect(asset.rms).toBeGreaterThan(.001); expect(asset.peak).toBeLessThanOrEqual(1); }
  expect(decoded[0].duration).toBeGreaterThan(57); expect(decoded[0].duration).toBeLessThan(59);
  await testInfo.attach('actual-decoded-audio.json', { body: JSON.stringify(decoded, null, 2), contentType: 'application/json' });
});

test('actual Chromium playback starts the music and completion voice from game interactions', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Windows WebKit media playback is a recorded runtime limitation; decoding is checked separately.');
  await page.addInitScript(() => {
    const NativeAudio = window.Audio; window.__actualAudio = [];
    window.Audio = function (...args) { const element = new NativeAudio(...args); element.addEventListener('playing', () => { element.__started = true; }); window.__actualAudio.push(element); return element; };
    window.Audio.prototype = NativeAudio.prototype;
  });
  await page.setViewportSize({ width: 1024, height: 768 }); await openLesson(page, 'Alif', 'play');
  await expect.poll(() => page.evaluate(() => window.__actualAudio.some(element => element.src.includes('/audio/music/') && element.__started && element.currentTime > .1))).toBe(true);
  await draw(page, (await boardModels(page)).strokes[0]);
  await expect(page.locator('.book-completed')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__actualAudio.some(element => element.src.includes('/audio/letters/') && element.__started))).toBe(true);
  await menuAction(page, 'Isi kandungan');
  expect(await page.evaluate(() => window.__actualAudio.filter(element => element.src.includes('/audio/music/')).every(element => element.paused))).toBe(true);
});

test('hiding an active completion voice stops it and leaves music silent until the page returns', async ({ page }) => {
  await instrument(page, { voiceMs: 60000 }); await openLesson(page, 'Alif', 'play');
  await draw(page, (await boardModels(page)).strokes[0]);
  await expect.poll(async () => (await voices(page)).length).toBe(1);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  expect(await page.evaluate(() => window.__media.voicePauses)).toBe(1);
  await page.waitForTimeout(250); expect((await musicState(page)).playing).toBe(false);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await musicPlayingAt(page, .15);
  expect(await voices(page)).toHaveLength(1);
});
