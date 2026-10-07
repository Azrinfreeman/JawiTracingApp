# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: outline-review.spec.js >> four approved teacher entries and no obsolete proposals 320x600
- Location: tests\browser\outline-review.spec.js:7:51

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Ruang guru', exact: true })
    - locator resolved to <button class="header-teacher" aria-label="Ruang guru">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Langkau ke kandungan" [ref=e4]:
    - /url: "#main-content"
  - banner [ref=e5]:
    - button "Taman Jawi, halaman utama" [ref=e6] [cursor=pointer]:
      - generic [ref=e12]: Taman Jawi
    - navigation "Navigasi utama" [ref=e13]:
      - button "Ruang guru" [ref=e14] [cursor=pointer]:
        - generic [ref=e17]: Guru
      - button "Paparan penuh" [ref=e18] [cursor=pointer]: ⛶
      - button "Senyapkan audio" [ref=e19] [cursor=pointer]
  - main [ref=e24]:
    - generic [ref=e25]:
      - heading [active] [level=1] [ref=e26]:
        - text: Jom main di
        - emphasis [ref=e27]: taman Jawi!
      - paragraph [ref=e28]: Pilih teman, kenal huruf dan jom jejak. Pengembaraan kecil kita bermula di sini!
      - generic [ref=e29]:
        - generic [ref=e30]: Pilih teman belajar
        - group "Profil tempatan" [ref=e31]:
          - button "Bunga" [pressed] [ref=e32] [cursor=pointer]
          - button "Daun" [ref=e38] [cursor=pointer]
          - button "Bintang" [ref=e42] [cursor=pointer]
      - generic [ref=e46]:
        - text: Cara bermain
        - group "Cara bermain" [ref=e47]:
          - button "Solo" [pressed] [ref=e48] [cursor=pointer]
          - button "Duo 1v1" [ref=e49] [cursor=pointer]
        - group "Pilihan Solo" [ref=e50]:
          - button "Latihan santai ✓" [pressed] [ref=e51] [cursor=pointer]
          - button "Cabaran trofi" [ref=e52] [cursor=pointer]
      - button "Jom mula" [ref=e53] [cursor=pointer]
```

# Test source

```ts
  1  | import {expect} from '@playwright/test';
  2  | import {test} from './helpers/localTest.js';
  3  | import {dismissSplash} from './helpers/navigation.js';
  4  | import {mkdirSync} from 'node:fs';
  5  | const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/four-letter-outlines/browser';mkdirSync(root,{recursive:true});
  6  | const entries=[['Dal',3],['Zal',4],['Ra',3],['Zai',4]];
  7  | for(const [width,height]of [[320,600],[768,1024]])test(`four approved teacher entries and no obsolete proposals ${width}x${height}`,async({page,browserName})=>{
  8  |   test.setTimeout(45000);
  9  |   await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);
> 10 |   await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
     |                                                                 ^ Error: locator.click: Test timeout of 45000ms exceeded.
  11 |   await page.getByRole('tab',{name:'Huruf',exact:true}).click();
  12 |   await page.evaluate(()=>document.fonts.ready);
  13 |   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  14 |   for(const [label,revision]of entries){
  15 |     const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:label,exact:true})});
  16 |     const next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true});
  17 |     for(let i=0;i<40&&!(await card.isVisible())&&await next.isEnabled();i++)await next.click();
  18 |     await expect(card).toContainText(`Diluluskan · ${revision}`);
  19 |   }
  20 |   await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
  21 |   await page.getByLabel('Jenis semakan').selectOption('outline');
  22 |   await expect(page.locator('.empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
  23 |   await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
  24 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  25 |   await page.screenshot({path:`${root}/${browserName}-approved-review-${width}x${height}.png`,animations:'disabled'});
  26 |   await page.getByLabel('Jenis semakan').selectOption('video');
  27 |   await expect(page.locator('.model-comparison-pair svg')).toHaveCount(2);
  28 |   await expect(page.getByRole('navigation',{name:'Halaman rekod',exact:true})).toContainText('1 / 7');
  29 | });
  30 | 
```