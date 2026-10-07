# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fullscreen-tracing-audio.spec.js >> music is one quiet local loop that ducks under the voice, obeys mute and survives leaving only by stopping
- Location: tests\browser\fullscreen-tracing-audio.spec.js:154:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Muzik mati', exact: true })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - link "Langkau ke kandungan" [ref=e4] [cursor=pointer]:
      - /url: "#main-content"
    - status [ref=e5]:
      - generic [ref=e6]: Pratonton dewasa · 37 model huruf · 29 draf untuk semakan · suara diluluskan
      - button "Tamatkan pratonton" [ref=e7] [cursor=pointer]: Tamat
    - main [ref=e9]:
      - region "Aktiviti menulis" [ref=e13]:
        - generic [ref=e14]:
          - img "Ruang jejak huruf Alif. Gunakan jari, pen atau tetikus." [ref=e17]
          - status [ref=e24]: Kamu sudah ikut semua bahagian!
        - button "Menu permainan" [ref=e27] [cursor=pointer]:
          - generic [aria-hidden] [ref=e28]: ☰
          - generic [ref=e29]: Menu
        - generic:
          - generic:
            - generic: 1/37 · JEJAK
            - heading "Alif" [level=1]
        - generic:
          - generic [aria-hidden]:
            - generic [aria-hidden]:
              - generic: ✿
              - generic: ✦
              - generic: ✿
          - group "Huruf siap" [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]: Siap dijejak!
              - heading "Kamu sudah ikut huruf Alif!" [level=2] [ref=e36]
              - paragraph [ref=e37]: Hebat! Selak apabila kamu sedia.
            - generic [ref=e38]:
              - button "Dengar" [ref=e40] [cursor=pointer]
              - generic [ref=e44]:
                - button "Main lagi" [ref=e45] [cursor=pointer]
                - button "Sekarang, cuba salin sendiri" [ref=e48] [cursor=pointer]
              - button "Huruf seterusnya" [ref=e52] [cursor=pointer]
      - generic [ref=e53]: Huruf Alif, halaman 1 daripada 37
  - dialog [ref=e55]:
    - banner [ref=e56]:
      - heading "Menu permainan" [level=2] [ref=e57]
      - button "Tutup" [ref=e58] [cursor=pointer]
    - generic [ref=e59]:
      - generic [ref=e60]:
        - button "Senyapkan audio" [ref=e61] [cursor=pointer]
        - button "Paparan penuh" [ref=e62] [cursor=pointer]
      - navigation "Halaman menu" [ref=e63]:
        - button "Halaman menu sebelumnya" [ref=e64] [cursor=pointer]: Sebelumnya
        - generic [ref=e65]: 2/2
        - button "Halaman menu seterusnya" [disabled] [ref=e66]: Seterusnya
```

# Test source

```ts
  65  |       expect(control.x).toBeGreaterThanOrEqual(0); expect(control.r).toBeLessThanOrEqual(width); expect(control.y).toBeGreaterThanOrEqual(0);
  66  |     }
  67  |     expect(touches(rects.menu, rects.badge)).toBe(false);
  68  |     await page.screenshot({ path: `${evidence}/${browserName}-practice-${width}x${height}.png`, animations: 'disabled' });
  69  |   });
  70  | }
  71  | 
  72  | test('menu replaces the toolbar: every action is reachable and closing keeps accepted progress', async ({ page, browserName }) => {
  73  |   await page.setViewportSize({ width: 390, height: 844 }); await instrument(page);
  74  |   await openLesson(page, 'Ba', 'play');
  75  |   const model = await boardModels(page); await draw(page, model.strokes[0]);
  76  |   await expect(page.locator('.validated-dot')).toHaveCount(0);
  77  |   const before = Number(await page.locator('.play-fill').first().getAttribute('data-measured-frontier'));
  78  |   await openMenu(page);
  79  |   for (const name of ['Dengar', 'Tunjuk cara', 'Cuba lagi', 'Kenal huruf dan panduan', 'Huruf seterusnya', 'Huruf sebelumnya', 'Isi kandungan', 'Bantuan titik']) {
  80  |     await expect(page.getByRole('dialog', { name: 'Menu permainan' }).getByRole('button', { name, exact: true })).toBeVisible();
  81  |   }
  82  |   await page.getByRole('button', { name: 'Halaman menu seterusnya' }).click();
  83  |   for (const name of ['Muzik mati', 'Senyapkan audio', 'Paparan penuh']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  84  |   await page.screenshot({ path: `${evidence}/${browserName}-menu-page-2.png`, animations: 'disabled' });
  85  |   await page.getByRole('button', { name: 'Tutup', exact: true }).click();
  86  |   await expect(page.getByRole('dialog', { name: 'Menu permainan' })).toHaveCount(0);
  87  |   expect(Number(await page.locator('.play-fill').first().getAttribute('data-measured-frontier'))).toBe(before);
  88  |   // A demonstration is optional and never counts as completion.
  89  |   await menuAction(page, 'Tunjuk cara');
  90  |   await expect(page.locator('.demonstration-ink').first()).toBeVisible();
  91  |   await expect(page.locator('.book-completed')).toHaveCount(0); expect(await voices(page)).toHaveLength(0);
  92  |   await expect(page.locator('.demonstration-ink')).toHaveCount(0, { timeout: 8000 });
  93  |   await menuAction(page, 'Cuba lagi'); await expect(page.locator('.validated-dot')).toHaveCount(0);
  94  |   await menuAction(page, 'Kenal huruf dan panduan'); await expect(page.getByRole('dialog', { name: 'Kenal huruf Ba' })).toBeVisible();
  95  | });
  96  | 
  97  | test('the full letter is announced once, after the last required dot, with its approved recording', async ({ page }) => {
  98  |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  99  |   await openLesson(page, 'Alif', 'play');
  100 |   const model = await boardModels(page); await draw(page, model.strokes[0]);
  101 |   await expect(completeHeading(page, 'Alif')).toBeVisible();
  102 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  103 |   expect((await voices(page))[0].src).toBe(ALIF_NAME);
  104 |   await settle(page); await page.waitForTimeout(1200);
  105 |   expect(await voices(page)).toHaveLength(1);
  106 |   // Choices wait until the release has ended, then replay is deliberate.
  107 |   const next = page.getByRole('button', { name: 'Huruf seterusnya', exact: true });
  108 |   await expect(next).toBeEnabled();
  109 |   await page.getByRole('button', { name: 'Dengar', exact: true }).click();
  110 |   await expect.poll(async () => (await voices(page)).length).toBe(2);
  111 |   const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts);
  112 |   expect(attempts).toHaveLength(1);
  113 |   // A fresh attempt is a fresh eligible announcement; the retry itself is silent.
  114 |   await page.getByRole('button', { name: 'Main lagi', exact: true }).click();
  115 |   await expect(page.locator('.book-completed')).toHaveCount(0); await page.waitForTimeout(500);
  116 |   expect(await voices(page)).toHaveLength(2);
  117 |   await draw(page, (await boardModels(page)).strokes[0]); await expect(completeHeading(page, 'Alif')).toBeVisible();
  118 |   await expect.poll(async () => (await voices(page)).length).toBe(3);
  119 | });
  120 | 
  121 | test('a finished body with a dot still to place stays silent until the dot is placed', async ({ page }) => {
  122 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  123 |   await openLesson(page, 'Ba', 'play');
  124 |   const model = await boardModels(page); await draw(page, model.strokes[0]);
  125 |   await page.waitForTimeout(1000);
  126 |   await expect(page.locator('.book-completed')).toHaveCount(0); expect(await voices(page)).toHaveLength(0);
  127 |   await page.mouse.click(model.dots[0].x, model.dots[0].y);
  128 |   await expect(page.locator('.book-completed')).toBeVisible();
  129 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  130 | });
  131 | 
  132 | test('blocked voice never blocks completion; replay recovers from a fresh gesture', async ({ page }) => {
  133 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page, { failVoice: true });
  134 |   await openLesson(page, 'Alif', 'play'); await draw(page, (await boardModels(page)).strokes[0]);
  135 |   await expect(completeHeading(page, 'Alif')).toBeVisible();
  136 |   await expect(page.getByRole('status').filter({ hasText: 'Tekan Dengar' })).toBeVisible();
  137 |   expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts)).toHaveLength(1);
  138 |   await expect(page.getByRole('button', { name: 'Huruf seterusnya', exact: true }).first()).toBeEnabled();
  139 | });
  140 | 
  141 | test('saving a freehand copy never announces the letter', async ({ page }) => {
  142 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  143 |   await openLesson(page, 'Alif', 'play'); await draw(page, (await boardModels(page)).strokes[0]);
  144 |   await expect(page.getByRole('button', { name: 'Sekarang, cuba salin sendiri' })).toBeEnabled();
  145 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  146 |   await page.getByRole('button', { name: 'Sekarang, cuba salin sendiri' }).click();
  147 |   const board = page.locator('.trace-board'), box = await board.boundingBox();
  148 |   await draw(page, [{ x: box.x + box.width * .4, y: box.y + box.height * .3 }, { x: box.x + box.width * .5, y: box.y + box.height * .6 }, { x: box.x + box.width * .6, y: box.y + box.height * .8 }]);
  149 |   await page.getByRole('button', { name: 'Simpan untuk guru' }).click();
  150 |   await expect(page.locator('.book-completed')).toBeVisible(); await page.waitForTimeout(800);
  151 |   expect(await voices(page)).toHaveLength(1);
  152 | });
  153 | 
  154 | test('music is one quiet local loop that ducks under the voice, obeys mute and survives leaving only by stopping', async ({ page }) => {
  155 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  156 |   await openLesson(page, 'Alif', 'play');
  157 |   await musicPlayingAt(page, .15);
  158 |   expect(await page.evaluate(() => window.__media.plays.filter(play => play.music).length)).toBe(1);
  159 |   expect((await musicState(page)).loop).toBe(true);
  160 |   await draw(page, (await boardModels(page)).strokes[0]);
  161 |   await expect(completeHeading(page, 'Alif')).toBeVisible();
  162 |   await expect.poll(async () => { const s = await musicState(page); return s.volume; }, { timeout: 3000 }).toBeLessThan(.06);
  163 |   await musicPlayingAt(page, .15); // restored after the recording ends
  164 |   // Separate music switch: speech remains available.
> 165 |   await openMenu(page); await page.getByRole('button', { name: 'Halaman menu seterusnya' }).click(); await page.getByRole('button', { name: 'Muzik mati', exact: true }).click();
      |                                                                                                                                                                          ^ Error: locator.click: Test timeout of 90000ms exceeded.
  166 |   await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  167 |   expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.music.v1')))).toMatchObject({ version: 1, enabled: false });
  168 |   await page.getByRole('dialog', { name: 'Menu permainan' }).getByRole('button', { name: 'Dengar', exact: true }).click();
  169 |   await expect.poll(async () => (await voices(page)).length).toBe(2);
  170 |   await page.getByRole('button', { name: 'Muzik hidup', exact: true }).click(); await musicPlayingAt(page, .15);
  171 |   // Master mute silences both channels.
  172 |   await page.getByRole('button', { name: 'Senyapkan audio', exact: true }).click();
  173 |   await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  174 |   await page.getByRole('button', { name: 'Hidupkan audio', exact: true }).click(); await musicPlayingAt(page, .15);
  175 |   expect(await page.evaluate(() => window.__media.plays.filter(play => play.music).length)).toBeGreaterThanOrEqual(3);
  176 |   expect(await page.evaluate(() => window.__media.elements.filter(el => (el.getAttribute('src') || '').includes('/audio/music/')).length)).toBe(1);
  177 | });
  178 | 
  179 | test('music stops for background, hidden pages and leaving the game, and honours a saved preference', async ({ page }) => {
  180 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  181 |   await openLesson(page, 'Alif', 'play'); await musicPlayingAt(page, .15);
  182 |   await page.evaluate(() => window.dispatchEvent(new Event('taman-jawi:pause')));
  183 |   await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  184 |   await page.mouse.click(10, 10); await musicPlayingAt(page, .15);
  185 |   await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  186 |   await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  187 |   await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  188 |   await musicPlayingAt(page, .15);
  189 |   await menuAction(page, 'Isi kandungan');
  190 |   await expect(page.locator('.letter-grid-host')).toBeVisible();
  191 |   await expect.poll(async () => (await musicState(page)).playing).toBe(false);
  192 |   await page.evaluate(() => localStorage.setItem('taman-jawi.music.v1', JSON.stringify({ version: 1, enabled: false, volume: .3 })));
  193 |   await page.reload(); await dismissSplash(page);
  194 |   await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  195 |   await expect(page.getByLabel('Muzik latar', { exact: true }).first()).not.toBeChecked();
  196 |   await page.getByRole('checkbox', { name: 'Muzik latar' }).check();
  197 |   await page.getByLabel('Kelantangan muzik latar').fill('0.2');
  198 |   expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taman-jawi.music.v1')))).toEqual({ version: 1, enabled: true, volume: .2 });
  199 |   await page.evaluate(() => localStorage.setItem('taman-jawi.music.v1', 'broken'));
  200 |   await page.reload(); await dismissSplash(page);
  201 |   await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  202 |   await expect(page.getByRole('checkbox', { name: 'Muzik latar' })).toBeChecked();
  203 | });
  204 | 
  205 | test('browser fullscreen is requested once from the game-entry gesture, not on every page', async ({ page }) => {
  206 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page);
  207 |   await openLesson(page, 'Alif', 'play');
  208 |   expect(await page.evaluate(() => window.__media.fullscreen)).toBe(1);
  209 |   await menuAction(page, 'Huruf seterusnya'); await expect(page.getByRole('heading', { name: 'Ba', exact: true })).toBeVisible();
  210 |   expect(await page.evaluate(() => window.__media.fullscreen)).toBe(1);
  211 | });
  212 | 
  213 | async function match(page, mode) {
  214 |   await page.addInitScript(() => { Math.random = () => .99999; });
  215 |   await page.goto('/'); await dismissSplash(page); await page.clock.install();
  216 |   if (mode === 'duo') await page.getByRole('button', { name: 'Duo 1v1', exact: true }).click();
  217 |   else await page.getByRole('button', { name: /Cabaran trofi/ }).click();
  218 |   await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  219 |   await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  220 |   await page.getByLabel('Bilangan pusingan').selectOption('3');
  221 |   if (mode === 'duo') { await page.getByRole('button', { name: 'Uji dua sentuhan' }).click(); await page.getByRole('button', { name: /Pratonton susun atur dewasa/ }).click(); }
  222 |   else await page.getByRole('button', { name: 'Buka cabaran Solo' }).click();
  223 | }
  224 | async function begin(page, count) {
  225 |   for (let slot = 0; slot < count; slot++) await pane(page, slot).getByRole('button', { name: 'Saya sedia!', exact: true }).click();
  226 |   await expect(page.locator('.countdown-overlay')).toBeVisible(); await page.clock.fastForward(3100);
  227 |   await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  228 | }
  229 | async function finishLane(page, slot) {
  230 |   const board = pane(page, slot).locator('.trace-board'), model = await boardModels(page, board);
  231 |   for (const stroke of model.strokes) await draw(page, stroke);
  232 |   for (const dot of model.dots) await page.mouse.click(dot.x, dot.y);
  233 | }
  234 | 
  235 | test('Solo: readiness is an overlay, the letter is announced once at completion and replay is on the result', async ({ page, browserName }) => {
  236 |   await page.setViewportSize({ width: 1024, height: 768 }); await instrument(page); await match(page, 'solo');
  237 |   await expect(page.locator('.race-dock, .arena-ready-note, .race-toolbar')).toHaveCount(0);
  238 |   await expect(pane(page, 0).locator('.ready-overlay')).toBeVisible();
  239 |   await page.screenshot({ path: `${evidence}/${browserName}-solo-ready.png`, animations: 'disabled' });
  240 |   await pane(page, 0).getByRole('button', { name: 'Lihat contoh', exact: true }).click();
  241 |   await expect(pane(page, 0).locator('.ready-overlay')).toHaveCount(0); await expect(page.locator('.demonstration-ink').first()).toBeVisible();
  242 |   expect(await voices(page)).toHaveLength(0);
  243 |   await page.clock.fastForward(6000); await expect(pane(page, 0).locator('.ready-overlay')).toBeVisible();
  244 |   await begin(page, 1); await finishLane(page, 0);
  245 |   await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  246 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  247 |   await page.clock.fastForward(5000); expect(await voices(page)).toHaveLength(1);
  248 |   await page.getByRole('dialog', { name: 'Pusingan 1 selesai!' }).getByRole('button', { name: /Dengar nama/ }).click();
  249 |   await expect.poll(async () => (await voices(page)).length).toBe(2);
  250 | });
  251 | 
  252 | test('Duo: the first accepted letter starts one shared announcement; the second finish neither restarts nor cuts it', async ({ page, browserName }) => {
  253 |   await page.setViewportSize({ width: 1280, height: 800 }); await instrument(page, { voiceMs: 60000 }); await match(page, 'duo');
  254 |   await begin(page, 2);
  255 |   await page.screenshot({ path: `${evidence}/${browserName}-duo-race.png`, animations: 'disabled' });
  256 |   await finishLane(page, 0);
  257 |   await expect.poll(async () => (await voices(page)).length).toBe(1);
  258 |   await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toHaveCount(0);
  259 |   await finishLane(page, 1);
  260 |   await expect(page.getByRole('heading', { name: 'Pusingan 1 selesai!' })).toBeVisible();
  261 |   expect(await voices(page)).toHaveLength(1);
  262 |   // Still the one recording, uninterrupted by the second finish or the round result.
  263 |   expect(await page.evaluate(() => ({ cuts: window.__media.voicePauses, playing: window.__media.elements.filter(el => !(el.getAttribute('src') || '').includes('/audio/music/') && !el.paused).length }))).toEqual({ cuts: 0, playing: 1 });
  264 |   // The next round may announce again; a round where both time out does not.
  265 |   await page.getByRole('button', { name: 'Pusingan seterusnya', exact: true }).click(); await page.clock.fastForward(1200);
```