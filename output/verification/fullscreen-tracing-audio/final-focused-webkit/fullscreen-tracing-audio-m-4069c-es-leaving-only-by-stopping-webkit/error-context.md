# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fullscreen-tracing-audio.spec.js >> music is one quiet local loop that ducks under the voice, obeys mute and survives leaving only by stopping
- Location: tests\browser\fullscreen-tracing-audio.spec.js:155:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Langkau ke kandungan" [ref=e4]:
    - /url: "#main-content"
  - status [ref=e5]:
    - generic [ref=e6]: Pratonton dewasa · 37 model huruf · 29 draf untuk semakan · suara diluluskan
    - button "Tamatkan pratonton" [ref=e7] [cursor=pointer]: Tamat
  - main [ref=e9]:
    - region "Aktiviti menulis" [ref=e13]:
      - generic [ref=e14]:
        - img "Ruang jejak huruf Alif. Gunakan jari, pen atau tetikus." [ref=e17]:
          - generic [aria-hidden]:
            - generic:
              - generic: "1"
              - generic: 1 Mula
            - generic:
              - generic: "2"
              - generic: 2 Ikut
            - generic:
              - generic: "3"
              - generic: 3 Siap
        - status [ref=e24]: Ikut titik ini.
        - paragraph [ref=e27]:
          - generic [aria-hidden] [ref=e28]: "1"
          - text: Mula di 1, ikut 2, berhenti di 3. Kemudian angkat jari untuk siap.
      - button "Menu permainan" [ref=e29] [cursor=pointer]:
        - generic [aria-hidden] [ref=e30]: ☰
        - generic [ref=e31]: Menu
      - generic:
        - generic:
          - generic: 1/37 · JEJAK
          - heading "Alif" [active] [level=1]
    - generic [ref=e32]: Huruf Alif, halaman 1 daripada 37
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { mkdirSync } from 'node:fs';
  3   | import { dismissSplash } from './helpers/navigation.js';
  4   | import { openLesson, boardModels, draw, openMenu, menuAction, tapDots } from './helpers/tracing.js';
  5   | import letters from '../../src/content/letters.json' with { type: 'json' };
  6   | 
  7   | test.setTimeout(90000);
  8   | const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/fullscreen-tracing-audio'; mkdirSync(evidence, { recursive: true });
  9   | const MUSIC = '/audio/music/taman-kawan-v1.mp3';
  10  | const ALIF_NAME = '/audio/letters/alphabet/alif-name-v2.mp3';
  11  | const pane = (page, slot) => page.locator(`[data-player-slot="${slot}"]`);
  12  | 
  13  | /** Replaces media playback with a recorder so lifecycle, ordering and mix levels can be asserted exactly. */
  14  | async function instrument(page, { failVoice = false, voiceMs = 900 } = {}) {
  15  |   await page.addInitScript(({ failVoice: fail, voiceMs: duration }) => {
  16  |     const media = window.__media = { plays: [], elements: [], fullscreen: 0, voicePauses: 0 };
  17  |     Object.defineProperty(HTMLMediaElement.prototype, 'paused', { configurable: true, get() { return !this.__playing; } });
  18  |     HTMLMediaElement.prototype.play = function () {
  19  |       const src = this.getAttribute('src') || '', music = src.includes('/audio/music/');
  20  |       if (fail && !music) return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
  21  |       this.__playing = true; media.plays.push({ src, music, volume: this.volume, muted: this.muted });
  22  |       if (!music) setTimeout(() => { if (this.__playing) { this.__playing = false; this.onended?.(); } }, duration);
  23  |       return Promise.resolve();
  24  |     };
  25  |     HTMLMediaElement.prototype.pause = function () { if (this.__playing && !(this.getAttribute('src') || '').includes('/audio/music/')) media.voicePauses++; this.__playing = false; };
  26  |     HTMLMediaElement.prototype.load = function () {};
  27  |     const NativeAudio = window.Audio;
  28  |     window.Audio = function (...args) { const element = new NativeAudio(...args); media.elements.push(element); return element; };
  29  |     window.Audio.prototype = NativeAudio.prototype;
  30  |     Element.prototype.requestFullscreen = function () { media.fullscreen++; return Promise.resolve(); };
  31  |   }, { failVoice, voiceMs });
  32  | }
  33  | const voices = async page => (await page.evaluate(() => window.__media.plays)).filter(play => !play.music);
  34  | const musicState = page => page.evaluate(() => { const e = window.__media.elements.find(el => (el.getAttribute('src') || '').includes('/audio/music/')); return e ? { playing: !e.paused, volume: e.volume, loop: e.loop } : null; });
> 35  | const musicPlayingAt = (page, level) => expect.poll(async () => { const state = await musicState(page); return state?.playing && Math.abs(state.volume - level) < .012; }, { timeout: 5000 }).toBe(true);
      |                                                                                                                                                                                               ^ Error: expect(received).toBe(expected) // Object.is equality
  36  | const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  37  | const completeHeading = (page, letter) => page.getByRole('heading', { name: `Kamu sudah ikut huruf ${letter}!` });
  38  | async function trace(page, { dots = true } = {}) {
  39  |   const model = await boardModels(page);
  40  |   for (const stroke of model.strokes) await draw(page, stroke);
  41  |   if (dots) await tapDots(page);
  42  |   return model;
  43  | }
  44  | 
  45  | const viewports = [[320, 600], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1920, 1080], [3840, 2160]];
  46  | for (const [width, height] of viewports) {
  47  |   test(`practice at ${width}x${height} has no dock, no strip and no collisions`, async ({ page, browserName }) => {
  48  |     test.skip(width === 3840 && browserName === 'webkit', 'Recorded Windows WebKit native-4K timeout; Chromium covers 4K.');
  49  |     await page.setViewportSize({ width, height }); await instrument(page);
  50  |     await openLesson(page, 'Ba', 'play'); await settle(page);
  51  |     await expect(page.locator('.lesson-dock, .race-dock, .race-dock-controls, .arena-ready-note, .dock-controls')).toHaveCount(0);
  52  |     const rects = await page.evaluate(() => {
  53  |       const box = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
  54  |       const writing = document.querySelector('.book-writing'), board = document.querySelector('.trace-board');
  55  |       const menu = document.querySelector('.stage-menu-button'), badge = document.querySelector('.stage-badge');
  56  |       const letter = [...document.querySelectorAll('.reference-stroke, .reference-dot, .numbered-trace-guides *')].filter(e => e.getBoundingClientRect().width).map(box);
  57  |       return { writing: box(writing), board: box(board), menu: box(menu), badge: box(badge), letter, scroll: [document.scrollingElement.scrollHeight, innerHeight, document.scrollingElement.scrollWidth, innerWidth] };
  58  |     });
  59  |     // The stage owns the writing rectangle: nothing is reserved underneath it.
  60  |     expect(rects.board.h).toBeGreaterThanOrEqual(rects.writing.h - 2); expect(rects.board.w).toBeGreaterThanOrEqual(rects.writing.w - 2);
  61  |     expect(rects.scroll[0]).toBeLessThanOrEqual(rects.scroll[1] + 1); expect(rects.scroll[2]).toBeLessThanOrEqual(rects.scroll[3] + 1);
  62  |     expect(rects.menu.w).toBeGreaterThanOrEqual(48); expect(rects.menu.h).toBeGreaterThanOrEqual(48);
  63  |     const touches = (a, b) => a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;
  64  |     for (const control of [rects.menu, rects.badge]) {
  65  |       expect(rects.letter.filter(item => touches(item, control))).toHaveLength(0);
  66  |       expect(control.x).toBeGreaterThanOrEqual(0); expect(control.r).toBeLessThanOrEqual(width); expect(control.y).toBeGreaterThanOrEqual(0);
  67  |     }
  68  |     expect(touches(rects.menu, rects.badge)).toBe(false);
  69  |     await page.screenshot({ path: `${evidence}/${browserName}-practice-${width}x${height}.png`, animations: 'disabled' });
  70  |   });
  71  | }
  72  | 
  73  | test('menu replaces the toolbar: every action is reachable and closing keeps accepted progress', async ({ page, browserName }) => {
  74  |   await page.setViewportSize({ width: 390, height: 844 }); await instrument(page);
  75  |   await openLesson(page, 'Ba', 'play');
  76  |   const model = await boardModels(page); await draw(page, model.strokes[0]);
  77  |   await expect(page.locator('.validated-dot')).toHaveCount(0);
  78  |   const before = Number(await page.locator('.play-fill').first().getAttribute('data-measured-frontier'));
  79  |   await openMenu(page);
  80  |   for (const name of ['Dengar', 'Tunjuk cara', 'Cuba lagi', 'Kenal huruf dan panduan', 'Huruf seterusnya', 'Huruf sebelumnya', 'Isi kandungan', 'Bantuan titik']) {
  81  |     await expect(page.getByRole('dialog', { name: 'Menu permainan' }).getByRole('button', { name, exact: true })).toBeVisible();
  82  |   }
  83  |   await page.getByRole('button', { name: 'Halaman menu seterusnya' }).click();
  84  |   for (const name of ['Muzik mati', 'Senyapkan audio', 'Paparan penuh']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  85  |   await page.screenshot({ path: `${evidence}/${browserName}-menu-page-2.png`, animations: 'disabled' });
  86  |   await page.getByRole('button', { name: 'Tutup', exact: true }).click();
  87  |   await expect(page.getByRole('dialog', { name: 'Menu permainan' })).toHaveCount(0);
  88  |   expect(Number(await page.locator('.play-fill').first().getAttribute('data-measured-frontier'))).toBe(before);
  89  |   // A demonstration is optional and never counts as completion.
  90  |   await menuAction(page, 'Tunjuk cara');
  91  |   await expect(page.locator('.demonstration-ink').first()).toBeVisible();
  92  |   await expect(page.locator('.book-completed')).toHaveCount(0); expect(await voices(page)).toHaveLength(0);
  93  |   await expect(page.locator('.demonstration-ink')).toHaveCount(0, { timeout: 8000 });
  94  |   await menuAction(page, 'Cuba lagi'); await expect(page.locator('.validated-dot')).toHaveCount(0);
  95  |   await menuAction(page, 'Kenal huruf dan panduan'); await expect(page.getByRole('dialog', { name: 'Kenal huruf Ba' })).toBeVisible();
  96  | });
  97  | 
  98  | test('the full letter is announced once, after the last required dot, with its approved recording', async ({ page }) => {
  99  |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  100 |   await openLesson(page, 'Alif', 'play');
  101 |   const model = await boardModels(page); await draw(page, model.strokes[0]);
  102 |   await expect(completeHeading(page, 'Alif')).toBeVisible();
  103 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  104 |   expect((await voices(page))[0].src).toBe(ALIF_NAME);
  105 |   await settle(page); await page.waitForTimeout(1200);
  106 |   expect(await voices(page)).toHaveLength(1);
  107 |   // Choices wait until the release has ended, then replay is deliberate.
  108 |   const next = page.getByRole('button', { name: 'Huruf seterusnya', exact: true });
  109 |   await expect(next).toBeEnabled();
  110 |   await page.getByRole('button', { name: 'Dengar', exact: true }).click();
  111 |   await expect.poll(async () => (await voices(page)).length).toBe(2);
  112 |   const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts);
  113 |   expect(attempts).toHaveLength(1);
  114 |   // A fresh attempt is a fresh eligible announcement; the retry itself is silent.
  115 |   await page.getByRole('button', { name: 'Main lagi', exact: true }).click();
  116 |   await expect(page.locator('.book-completed')).toHaveCount(0); await page.waitForTimeout(500);
  117 |   expect(await voices(page)).toHaveLength(2);
  118 |   await draw(page, (await boardModels(page)).strokes[0]); await expect(completeHeading(page, 'Alif')).toBeVisible();
  119 |   await expect.poll(async () => (await voices(page)).length).toBe(3);
  120 | });
  121 | 
  122 | test('a finished body with a dot still to place stays silent until the dot is placed', async ({ page }) => {
  123 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  124 |   await openLesson(page, 'Ba', 'play');
  125 |   const model = await boardModels(page); await draw(page, model.strokes[0]);
  126 |   await page.waitForTimeout(1000);
  127 |   await expect(page.locator('.book-completed')).toHaveCount(0); expect(await voices(page)).toHaveLength(0);
  128 |   await page.mouse.click(model.dots[0].x, model.dots[0].y);
  129 |   await expect(page.locator('.book-completed')).toBeVisible();
  130 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  131 | });
  132 | 
  133 | test('blocked voice never blocks completion; replay recovers from a fresh gesture', async ({ page }) => {
  134 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page, { failVoice: true });
  135 |   await openLesson(page, 'Alif', 'play'); await draw(page, (await boardModels(page)).strokes[0]);
```