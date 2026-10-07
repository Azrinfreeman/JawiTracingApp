# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fullscreen-tracing-audio.spec.js >> the packaged music and existing MP3/WAV letter names decode to non-silent audio
- Location: tests\browser\fullscreen-tracing-audio.spec.js:304:1

# Error details

```
Error: page.evaluate: TypeError: undefined is not a constructor (evaluating 'new (window.AudioContext || window.webkitAudioContext)()')
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]: Dibangunkan oleh
      - img "Hanana Academy" [ref=e9]
    - heading [level=1] [ref=e10]:
      - text: Taman
      - emphasis [ref=e11]: Jawi
    - paragraph [ref=e12]: Mari kenal dan jejak huruf Jawi.
    - button "Teruskan" [ref=e13] [cursor=pointer]
```

# Test source

```ts
  207 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  208 |   await openLesson(page, 'Alif', 'play');
  209 |   expect(await page.evaluate(() => window.__media.fullscreen)).toBe(1);
  210 |   await menuAction(page, 'Huruf seterusnya'); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  211 |   expect(await page.evaluate(() => window.__media.fullscreen)).toBe(1);
  212 | });
  213 | 
  214 | async function match(page, mode) {
  215 |   await page.addInitScript(() => { Math.random = () => .99999; });
  216 |   await page.goto('/'); await dismissSplash(page); await page.clock.install();
  217 |   if (mode === 'duo') await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click();
  218 |   else await page.getByRole('button', { name: /Cabaran trofi/ }).click();
  219 |   await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  220 |   await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  221 |   await page.getByLabel('Bilangan pusingan').selectOption('3');
  222 |   if (mode === 'duo') { await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click(); }
  223 |   else await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  224 | }
  225 | async function begin(page, count) {
  226 |   for (let slot = 0; slot < count; slot++) await pane(page, slot).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  227 |   await expect(page.locator('.countdown-overlay')).toBeVisible(); await page.clock.fastForward(3100);
  228 |   await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  229 | }
  230 | async function finishLane(page, slot) {
  231 |   const board = pane(page, slot).locator('.trace-board'), model = await boardModels(page, board);
  232 |   for (const stroke of model.strokes) await draw(page, stroke);
  233 |   for (const dot of model.dots) await page.mouse.click(dot.x, dot.y);
  234 | }
  235 | 
  236 | test('Solo: readiness is an overlay, the letter is announced once at completion and replay is on the result', async ({ page, browserName }) => {
  237 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page); await match(page, 'solo');
  238 |   await expect(page.locator('.race-dock, .arena-ready-note, .race-toolbar')).toHaveCount(0);
  239 |   await expect(pane(page, 0).locator('.ready-overlay')).toBeVisible();
  240 |   await page.screenshot({ path: `${evidence}/${browserName}-solo-ready.png`, animations: 'disabled' });
  241 |   await pane(page, 0).getByRole('button', { name: 'Lihat contoh', exact: true }).click();
  242 |   await expect(pane(page, 0).locator('.ready-overlay')).toHaveCount(0); await expect(page.locator('.demonstration-ink').first()).toBeVisible();
  243 |   expect(await voices(page)).toHaveLength(0);
  244 |   await page.clock.fastForward(6000); await expect(pane(page, 0).locator('.ready-overlay')).toBeVisible();
  245 |   await begin(page, 1); await finishLane(page, 0);
  246 |   await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  247 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  248 |   await page.clock.fastForward(5000); expect(await voices(page)).toHaveLength(1);
  249 |   await page.getByRole('dialog', { name: 'Pusingan 1 selesai!' }).getByRole('button', { name: /Dengar nama/ }).click();
  250 |   await expect.poll(async () => (await voices(page)).length).toBe(2);
  251 | });
  252 | 
  253 | test('Duo: the first accepted letter starts one shared announcement; the second finish neither restarts nor cuts it', async ({ page, browserName }) => {
  254 |   await page.setViewportSize({ width: 1280, height: 800 }); await instrument(page, { voiceMs: 60000 }); await match(page, 'duo');
  255 |   await begin(page, 2);
  256 |   await page.screenshot({ path: `${evidence}/${browserName}-duo-race.png`, animations: 'disabled' });
  257 |   await finishLane(page, 0);
  258 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  259 |   await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toHaveCount(0);
  260 |   await finishLane(page, 1);
  261 |   await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  262 |   expect(await voices(page)).toHaveLength(1);
  263 |   // Still the one recording, uninterrupted by the second finish or the round result.
  264 |   expect(await page.evaluate(() => ({ cuts: window.__media.voicePauses, playing: window.__media.elements.filter(el => !(el.getAttribute('src') || '').includes('/audio/music/') && !el.paused).length }))).toEqual({ cuts: 0, playing: 1 });
  265 |   // The next round may announce again; a round where both time out does not.
  266 |   await page.getByRole('button', { name: 'Pusingan seterusnya', exact: true }).click(); await page.clock.fastForward(1200);
  267 |   await begin(page, 2); await page.clock.fastForward(91000);
  268 |   await expect(page.getByRole('heading', { name: 'Pusingan 2 selesai!' })).toBeVisible();
  269 |   expect(await voices(page)).toHaveLength(1);
  270 | });
  271 | 
  272 | test('Duo menu pauses both lanes, retries one lane, and dot help appears only in the chosen lane after the shared countdown', async ({ page, browserName }) => {
  273 |   await page.setViewportSize({ width: 1280, height: 800 }); await instrument(page); await match(page, 'duo');
  274 |   await begin(page, 2);
  275 |   await page.getByRole('button', { name: 'Menu permainan' }).click();
  276 |   const menu = page.getByRole('dialog', { name: 'Rehat sekejap' }); await expect(menu).toBeVisible();
  277 |   await expect(page.locator('.trace-assistance')).toHaveCount(0);
  278 |   await page.screenshot({ path: `${evidence}/${browserName}-duo-menu.png`, animations: 'disabled' });
  279 |   await menu.getByRole('button', { name: /Cuba lagi · /, exact: false }).first().click();
  280 |   await expect(page.locator('.countdown-overlay')).toBeVisible(); await page.clock.fastForward(3100);
  281 |   await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  282 |   // The seeded first round is Alif. Move to Ba and earn its body before asking for dot help.
  283 |   await page.clock.fastForward(91000);
  284 |   await page.getByRole('button', { name: 'Pusingan seterusnya', exact: true }).click(); await page.clock.fastForward(1200);
  285 |   await begin(page, 2);
  286 |   expect(await page.locator('.reference-dot').count()).toBe(2);
  287 |   for (const slot of [0, 1]) {
  288 |     const model = await boardModels(page, pane(page, slot).locator('.trace-board'));
  289 |     for (const stroke of model.strokes) await draw(page, stroke);
  290 |     await expect(pane(page, slot).locator('.trace-board')).toHaveAttribute('data-phase', 'awaitingMark');
  291 |   }
  292 |   await page.getByRole('button', { name: 'Menu permainan' }).click();
  293 |   await page.getByRole('dialog', { name: 'Rehat sekejap' }).getByRole('button', { name: /Bantuan titik · /, exact: false }).first().click();
  294 |   await expect(page.locator('.countdown-overlay')).toBeVisible(); await expect(page.locator('.trace-assistance')).toHaveCount(0);
  295 |   await page.clock.fastForward(3100);
  296 |   await expect(pane(page, 0).locator('.trace-assistance')).toBeVisible();
  297 |   await expect(pane(page, 1).locator('.trace-assistance')).toHaveCount(0);
  298 |   await pane(page, 0).getByRole('button', { name: 'Tambah titik 1 daripada 1' }).press('Enter');
  299 |   await expect(pane(page, 0).locator('.trace-board')).toHaveAttribute('data-phase', 'complete');
  300 |   await expect(pane(page, 1).locator('.trace-board')).toHaveAttribute('data-phase', 'awaitingMark');
  301 |   expect(await voices(page)).toHaveLength(1);
  302 | });
  303 | 
  304 | test('the packaged music and existing MP3/WAV letter names decode to non-silent audio', async ({ page }, testInfo) => {
  305 |   await page.goto('/');
  306 |   const sources = [MUSIC, letters.find(letter => letter.id === 'alif').audio.name.src, letters.find(letter => letter.audio.name.src.endsWith('.wav')).audio.name.src];
> 307 |   const decoded = await page.evaluate(async sources => {
      |                              ^ Error: page.evaluate: TypeError: undefined is not a constructor (evaluating 'new (window.AudioContext || window.webkitAudioContext)()')
  308 |     const context = new (window.AudioContext || window.webkitAudioContext)();
  309 |     try {
  310 |       return await Promise.all(sources.map(async src => {
  311 |         const response = await fetch(src); if (!response.ok) throw new Error(`${src}: ${response.status}`);
  312 |         const buffer = await context.decodeAudioData(await response.arrayBuffer());
  313 |         const data = buffer.getChannelData(0); let energy = 0, peak = 0;
  314 |         for (const sample of data) { energy += sample * sample; peak = Math.max(peak, Math.abs(sample)); }
  315 |         return { src, duration: buffer.duration, channels: buffer.numberOfChannels, rate: buffer.sampleRate, rms: Math.sqrt(energy / data.length), peak, boundaryDifference: Math.abs(data[0] - data.at(-1)) };
  316 |       }));
  317 |     } finally { await context.close(); }
  318 |   }, sources);
  319 |   for (const asset of decoded) { expect(asset.duration).toBeGreaterThan(.1); expect(asset.rms).toBeGreaterThan(.001); expect(asset.peak).toBeLessThanOrEqual(1); }
  320 |   expect(decoded[0].duration).toBeGreaterThan(57); expect(decoded[0].duration).toBeLessThan(59);
  321 |   await testInfo.attach('actual-decoded-audio.json', { body: JSON.stringify(decoded, null, 2), contentType: 'application/json' });
  322 | });
  323 | 
  324 | test('actual Chromium playback starts the music and completion voice from game interactions', async ({ page, browserName }) => {
  325 |   test.skip(browserName !== 'chromium', 'Windows WebKit media playback is a recorded runtime limitation; decoding is checked separately.');
  326 |   await page.addInitScript(() => {
  327 |     const NativeAudio = window.Audio; window.__actualAudio = [];
  328 |     window.Audio = function (...args) { const element = new NativeAudio(...args); element.addEventListener('playing', () => { element.__started = true; }); window.__actualAudio.push(element); return element; };
  329 |     window.Audio.prototype = NativeAudio.prototype;
  330 |   });
  331 |   await page.setViewportSize({ width: 1024, height: 768 }); await openLesson(page, 'Alif', 'play');
  332 |   await expect.poll(() => page.evaluate(() => window.__actualAudio.some(element => element.src.includes('/audio/music/') && element.__started && element.currentTime > .1))).toBe(true);
  333 |   await draw(page, (await boardModels(page)).strokes[0]);
  334 |   await expect(page.locator('.book-completed')).toBeVisible();
  335 |   await expect.poll(() => page.evaluate(() => window.__actualAudio.some(element => element.src.includes('/audio/letters/') && element.__started))).toBe(true);
  336 |   await menuAction(page, 'Isi kandungan');
  337 |   expect(await page.evaluate(() => window.__actualAudio.filter(element => element.src.includes('/audio/music/')).every(element => element.paused))).toBe(true);
  338 | });
  339 | 
```