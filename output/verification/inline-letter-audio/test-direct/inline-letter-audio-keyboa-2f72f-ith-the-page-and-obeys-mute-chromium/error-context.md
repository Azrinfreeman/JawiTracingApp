# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inline-letter-audio.spec.js >> keyboard replay preserves partial tracing, switches with the page and obeys mute
- Location: tests\browser\inline-letter-audio.spec.js:37:1

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 2
Received length: 3
Received array:  [{"music": false, "muted": false, "prime": false, "src": "/audio/letters/alphabet/fa-name-v2.mp3", "volume": 0.8}, {"music": false, "muted": false, "prime": false, "src": "/audio/letters/alphabet/fa-name-v2.mp3", "volume": 0.8}, {"music": false, "muted": true, "prime": false, "src": "/audio/letters/alphabet/fa-name-v2.mp3", "volume": 0.8}]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Langkau ke kandungan" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - status [ref=e5]:
    - generic [ref=e6]: Pratonton dewasa · 37 model huruf · suara diluluskan
    - button "Tamatkan pratonton" [ref=e7] [cursor=pointer]: Tamat
  - main [ref=e9]:
    - region "Aktiviti menulis" [ref=e13]:
      - generic [ref=e14]:
        - img "Ruang jejak huruf Fa. Gunakan jari, pen atau tetikus." [ref=e17]:
          - generic [aria-hidden]:
            - generic:
              - generic: "1"
              - generic: 1 Mula
            - generic:
              - generic: "2"
              - generic: 2 Ikut
        - generic:
          - status: Sambung dari anak panah.
        - paragraph [ref=e28]:
          - generic [aria-hidden] [ref=e29]: "1"
          - text: Mula di 1, ikut 2, berhenti di 3. Angkat jari sebelum bahagian seterusnya.
      - button "Menu permainan" [ref=e30] [cursor=pointer]:
        - generic [aria-hidden] [ref=e31]: ☰
        - generic [ref=e32]: Menu
      - generic:
        - generic:
          - generic:
            - generic: 23/37 · JEJAK
            - heading "Fa" [level=1]
        - button "Dengar nama Fa" [active] [ref=e34] [cursor=pointer]: Dengar
    - generic [ref=e38]: Huruf Fa, halaman 23 daripada 37
```

# Test source

```ts
  1  | import {expect} from '@playwright/test';
  2  | import {test} from './helpers/localTest.js';
  3  | import {instrument,voices} from './helpers/audio.js';
  4  | import {dismissSplash,chooseLetter} from './helpers/navigation.js';
  5  | import {openLesson,boardModels,draw,menuAction} from './helpers/tracing.js';
  6  | import letters from '../../src/content/letters.json' with {type:'json'};
  7  | import {mkdirSync} from 'node:fs';
  8  | const evidence=process.env.JAWI_EVIDENCE_DIR||'output/verification/inline-letter-audio/browser';mkdirSync(evidence,{recursive:true});
  9  | const stageHear=page=>page.locator('.stage-badge').getByRole('button',{name:/^Dengar nama /});
  10 | async function layout(page){
  11 |   await page.evaluate(()=>document.fonts.ready);await boardModels(page);
  12 |   const state=await page.locator('.stage-badge').evaluate(badge=>{
  13 |     const button=badge.querySelector('button'),title=badge.querySelector('h1');
  14 |     const b=button.getBoundingClientRect(),h=title.getBoundingClientRect(),container=badge.getBoundingClientRect();
  15 |     const overlap=(a,c)=>a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom;
  16 |     const labels=[...document.querySelectorAll('.trace-number-label-backdrop,.trace-number-badge')];
  17 |     return {below:b.top>=h.bottom,touch:b.width>=48&&b.height>=48,inside:b.left>=0&&b.right<=innerWidth&&b.bottom<=innerHeight,
  18 |       clear:labels.every(n=>!overlap(n.getBoundingClientRect(),container)),scroll:document.documentElement.scrollWidth<=innerWidth};
  19 |   });expect(state).toEqual({below:true,touch:true,inside:true,clear:true,scroll:true});
  20 | }
  21 | for(const [width,height]of [[320,600],[768,1024]])test(`all 37 letters: direct current sound and clear badge ${width}x${height}`,async({page,browserName})=>{
  22 |   test.setTimeout(240000);await page.setViewportSize({width,height});await instrument(page);
  23 |   await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();
  24 |   for(const [index,letter]of letters.entries()){
  25 |     await chooseLetter(page,letter.labelMs);await expect(stageHear(page)).toHaveAccessibleName(`Dengar nama ${letter.labelMs}`);
  26 |     await expect(stageHear(page)).toBeEnabled();await layout(page);
  27 |     const before=(await voices(page)).length;await stageHear(page).click();
  28 |     await expect.poll(async()=>(await voices(page)).length).toBe(before+1);
  29 |     expect((await voices(page)).at(-1).src).toBe(letter.audio.name.src);
  30 |     await expect(page.getByRole('dialog',{name:'Menu permainan'})).toHaveCount(0);
  31 |     await expect(page.locator('.book-completed')).toHaveCount(0);
  32 |     expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts)).toHaveLength(0);
  33 |     if(['ha-pedat','ta-marbuta','zai'].includes(letter.id))await page.screenshot({path:`${evidence}/${browserName}-${letter.id}-${width}.png`,animations:'disabled'});
  34 |     if(index<letters.length-1)await menuAction(page,'Isi kandungan');
  35 |   }
  36 | });
  37 | test('keyboard replay preserves partial tracing, switches with the page and obeys mute',async({page})=>{
  38 |   await instrument(page);await openLesson(page,'Fa','play');
  39 |   const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.25)));
  40 |   const frontier=await page.locator('.play-fill').first().getAttribute('data-measured-frontier');
  41 |   await stageHear(page).focus();await page.keyboard.press('Enter');await stageHear(page).press('Space');
  42 |   expect(await voices(page)).toHaveLength(2);expect(await page.locator('.play-fill').first().getAttribute('data-measured-frontier')).toBe(frontier);
  43 |   await menuAction(page,'Senyapkan audio');await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Tutup',exact:true}).click();
> 44 |   await stageHear(page).click();expect(await voices(page)).toHaveLength(2);
     |                                                            ^ Error: expect(received).toHaveLength(expected)
  45 |   await menuAction(page,'Hidupkan audio');await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Tutup',exact:true}).click();
  46 |   await menuAction(page,'Huruf seterusnya');await expect(stageHear(page)).toHaveAccessibleName('Dengar nama Pa');await stageHear(page).click();
  47 |   expect((await voices(page)).at(-1).src).toBe(letters.find(l=>l.id==='pa').audio.name.src);
  48 | });
  49 | for(const mode of ['guided','precision'])test(`${mode}: direct sound is available without recording a completion`,async({page})=>{
  50 |   await instrument(page);await openLesson(page,'Ha (ح)',mode);await stageHear(page).click();
  51 |   expect((await voices(page)).at(-1).src).toBe(letters.find(l=>l.id==='ha-pedat').audio.name.src);await expect(page.locator('.book-completed')).toHaveCount(0);
  52 | });
  53 | test('copying retains the direct sound button and its freehand ink',async({page})=>{
  54 |   await instrument(page);await openLesson(page,'Alif','play');await draw(page,(await boardModels(page)).strokes[0]);
  55 |   await page.getByRole('button',{name:'Sekarang, cuba salin sendiri'}).click();
  56 |   const board=page.locator('.copy-board');await board.scrollIntoViewIfNeeded();
  57 |   const bounds=await board.boundingBox();await draw(page,[{x:bounds.x+bounds.width*.4,y:bounds.y+bounds.height*.4},{x:bounds.x+bounds.width*.6,y:bounds.y+bounds.height*.6}]);
  58 |   const before=await page.locator('.pupil-ink').getAttribute('d');await stageHear(page).click();expect(await page.locator('.pupil-ink').getAttribute('d')).toBe(before);
  59 | });
  60 | test('a failed direct playback has the existing recovery dialog',async({page})=>{
  61 |   await instrument(page,{failVoice:true});await openLesson(page,'Ha (ح)','play');await stageHear(page).click();
  62 |   await expect(page.getByRole('dialog',{name:'Dengar nama huruf'})).toBeVisible();
  63 |   await expect(page.getByRole('dialog',{name:'Dengar nama huruf'})).toContainText('Dengar');
  64 |   await page.getByRole('button',{name:'Tutup',exact:true}).click();await expect(stageHear(page)).toBeEnabled();
  65 | });
  66 | for(const mode of ['solo','duo'])for(const [width,height]of [[390,844],[1280,800]])test(`${mode}: sound beneath the current letter during readiness and racing ${width}`,async({page,browserName})=>{
  67 |   test.setTimeout(90000);await page.setViewportSize({width,height});await instrument(page);await page.addInitScript(()=>{Math.random=()=>.99999;});
  68 |   await page.goto('/');await dismissSplash(page);await page.clock.install();
  69 |   if(mode==='duo')await page.getByRole('button',{name:'Duo 1v1',exact:true}).click();else await page.getByRole('button',{name:/Cabaran trofi/}).click();
  70 |   await page.getByRole('button',{name:'Jom mula',exact:true}).click();await page.getByRole('button',{name:'Seterusnya',exact:true}).click();
  71 |   if(mode==='duo'){await page.getByRole('button',{name:'Uji dua sentuhan'}).click();await page.getByRole('button',{name:/Pratonton susun atur dewasa/}).click();}
  72 |   else await page.getByRole('button',{name:'Buka cabaran Solo'}).click();
  73 |   const button=page.locator('.arena-hud-right').getByRole('button',{name:/^Dengar nama/});
  74 |   await expect(button).toBeEnabled();await button.click();expect(await voices(page)).toHaveLength(1);
  75 |   const selected=await button.getAttribute('aria-label');expect((await voices(page)).at(-1).src).toBe(letters.find(l=>`Dengar nama ${l.labelMs}`===selected).audio.name.src);
  76 |   const placement=await page.locator('.arena-letter-audio').evaluate(group=>{const r=group.querySelector('.arena-round').getBoundingClientRect(),b=group.querySelector('button').getBoundingClientRect();return b.top>=r.bottom&&b.width>=48&&b.height>=48&&b.right<=innerWidth;});expect(placement).toBe(true);
  77 |   for(let slot=0;slot<(mode==='duo'?2:1);slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  78 |   await page.clock.fastForward(3100);await expect(page.locator('.countdown-overlay')).toHaveCount(0);await button.click();
  79 |   expect(await voices(page)).toHaveLength(2);await expect(page.getByRole('dialog',{name:'Rehat sekejap'})).toHaveCount(0);
  80 |   await expect(page.locator('.trace-board').first()).toHaveAttribute('data-phase','awaitingStart');
  81 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  82 |   await page.screenshot({path:`${evidence}/${browserName}-${mode}-${width}.png`,animations:'disabled'});
  83 | });
  84 | test('actual Chromium direct playback starts the selected recording',async({page,browserName})=>{
  85 |   test.skip(browserName!=='chromium','Recorded Windows WebKit native codec limitation; controlled playback checks cover its UI.');
  86 |   await page.addInitScript(()=>{
  87 |     const NativeAudio=window.Audio;window.directAudio=[];window.Audio=function(...args){const audio=new NativeAudio(...args);audio.addEventListener('playing',()=>{audio.started=true;});window.directAudio.push(audio);return audio;};window.Audio.prototype=NativeAudio.prototype;
  88 |   });await openLesson(page,'Ha (ح)','play');await stageHear(page).click();
  89 |   const src=letters.find(l=>l.id==='ha-pedat').audio.name.src;
  90 |   await expect.poll(()=>page.evaluate(src=>window.directAudio.some(audio=>audio.src.endsWith(src)&&audio.started&&audio.currentTime>0),src)).toBe(true);
  91 | });
  92 | 
```