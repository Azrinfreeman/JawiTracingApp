# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ain-family-matches.spec.js >> solo ghain: unscored two-part outline preview and independent lanes
- Location: tests\browser\ain-family-matches.spec.js:12:72

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 8
+ Received  + 1

- Array [
-   Object {
-     "contentVersion": 4,
-     "geometryStatus": "pendingReview",
-     "letterId": "ghain",
-     "unscored": true,
-   },
- ]
+ Array []
```

# Page snapshot

```yaml
- main [ref=e3]:
  - heading "Cabaran Solo" [level=1] [ref=e4]
  - button "Menu permainan" [disabled] [ref=e6]:
    - generic [aria-hidden] [ref=e7]: ☰
    - generic [ref=e8]: Menu
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e12]:
        - text: Pusingan 1/1 ·
        - strong [ref=e13]: Ghain
        - generic [ref=e14]: · Pratonton · tanpa markah
      - button "Dengar nama Ghain" [disabled] [ref=e15]: Dengar
    - generic "Baki masa" [ref=e19]:
      - text: "87"
      - generic [ref=e20]: saat
  - region "Pemain 1, Bunga" [ref=e22]:
    - generic [ref=e23]:
      - generic [ref=e24]:
        - img "Ruang jejak huruf Ghain. Gunakan jari, pen atau tetikus." [ref=e27]
        - status [ref=e40]: Kamu sudah ikut semua bahagian!
      - generic:
        - heading "Bunga Pemain 1" [level=2]:
          - text: Bunga
          - generic: Pemain 1
        - strong:
          - text: —
          - generic: markah
      - status [ref=e43]: Siap! Tunggu teman.
  - dialog [ref=e48]:
    - heading "Pusingan 1 selesai!" [level=2] [ref=e49]
    - paragraph [ref=e50]: Ghain · Kita sudah mencuba bersama.
    - generic [ref=e52]:
      - heading "Bunga" [level=3] [ref=e53]
      - strong [ref=e54]:
        - text: —
        - generic [ref=e55]: markah
      - paragraph [ref=e56]: Siap 3.8 saat
    - button "Lihat keputusan" [active] [ref=e57] [cursor=pointer]
    - button "Dengar nama Ghain" [ref=e58] [cursor=pointer]: Dengar
    - button "Keluar cabaran" [ref=e59] [cursor=pointer]
```

# Test source

```ts
  1  | import {expect} from '@playwright/test';
  2  | import {test} from './helpers/localTest.js';
  3  | import {readFileSync} from 'node:fs';
  4  | import {boardModels,draw,tapDots} from './helpers/tracing.js';
  5  | const root='output/verification/ain-family-outlines';
  6  | const harness=readFileSync(`${root}/test-harness.js`,'utf8');
  7  | async function mount(page,id,mode,result=false){
  8  |   await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  9  |   await page.evaluate(url=>history.replaceState(null,'',url),`/?ain-family=1&letter=${id}&mode=${mode}${result?'&result=1':''}`);
  10 |   await page.addScriptTag({content:harness});await expect(page.locator('.trace-board,.outline-result').first()).toBeVisible();
  11 | }
  12 | for(const mode of ['solo','duo'])for(const id of ['ain','ghain','nga'])test(`${mode} ${id}: unscored two-part outline preview and independent lanes`,async({page})=>{
  13 |   test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await mount(page,id,mode);
  14 |   const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
  15 |   for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  16 |   await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
  17 |   for(let slot=0;slot<count;slot++){
  18 |     const board=page.locator('.trace-board').nth(slot);
  19 |     for(let index=0;index<2;index++)await draw(page,(await boardModels(page,board)).strokes[index]);
  20 |     await tapDots(page,board);
  21 |     if(mode==='duo'&&slot===0){await expect(page.locator('[data-player-slot="0"] .race-lane-status')).toContainText('Siap');await expect(page.locator('.trace-board').nth(1).locator('.outline-progress')).toHaveCount(0);}
  22 |   }
  23 |   await expect(page.locator('.round-result')).toBeVisible();
> 24 |   expect(await page.evaluate(()=>window.outlineAttempts)).toEqual(Array.from({length:count},()=>({letterId:id,contentVersion:4,geometryStatus:'pendingReview',unscored:true})));
     |                                                           ^ Error: expect(received).toEqual(expected) // deep equality
  25 |   const clips=await page.locator('clipPath').evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(clips).size).toBe(clips.length);
  26 | });
  27 | for(const id of ['ain','ghain','nga'])test(`${id}: authored result retains the whole catalogue silhouette`,async({page})=>{
  28 |   await mount(page,id,'solo',true);await expect(page.locator('.outline-result path')).toHaveCount({ain:1,ghain:2,nga:4}[id]);
  29 |   await expect(page.locator('.play-completed-letter')).toHaveCount(0);
  30 | });
  31 | 
```