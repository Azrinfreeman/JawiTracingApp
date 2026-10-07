# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ain-family-matches.spec.js >> duo ghain: unscored two-part outline preview and independent lanes
- Location: tests\browser\ain-family-matches.spec.js:12:72

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 14
+ Received  +  1

- Array [
-   Object {
-     "contentVersion": 4,
-     "geometryStatus": "pendingReview",
-     "letterId": "ghain",
-     "unscored": true,
-   },
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
  - heading "Duo 1v1" [level=1] [ref=e4]
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
      - text: "18"
      - generic [ref=e20]: saat
  - generic [ref=e21]:
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
    - region "Pemain 2, Daun" [ref=e47]:
      - generic [ref=e48]:
        - generic [ref=e49]:
          - img "Ruang jejak huruf Ghain. Gunakan jari, pen atau tetikus." [ref=e52]
          - status [ref=e65]: Kamu sudah ikut semua bahagian!
        - generic:
          - heading "Daun Pemain 2" [level=2]:
            - text: Daun
            - generic: Pemain 2
          - strong:
            - text: —
            - generic: markah
        - status [ref=e68]: Siap! Tunggu teman.
  - dialog [ref=e73]:
    - heading "Pusingan 1 selesai!" [level=2] [ref=e74]
    - paragraph [ref=e75]: Ghain · Kita sudah mencuba bersama.
    - generic [ref=e76]:
      - generic [ref=e77]:
        - heading "Bunga" [level=3] [ref=e78]
        - strong [ref=e79]:
          - text: —
          - generic [ref=e80]: markah
        - paragraph [ref=e81]: Siap 38.1 saat
      - generic [ref=e82]:
        - heading "Daun" [level=3] [ref=e83]
        - strong [ref=e84]:
          - text: —
          - generic [ref=e85]: markah
        - paragraph [ref=e86]: Siap 72.1 saat
    - button "Lihat keputusan" [active] [ref=e87] [cursor=pointer]
    - button "Dengar nama Ghain" [ref=e88] [cursor=pointer]: Dengar
    - button "Keluar cabaran" [ref=e89] [cursor=pointer]
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