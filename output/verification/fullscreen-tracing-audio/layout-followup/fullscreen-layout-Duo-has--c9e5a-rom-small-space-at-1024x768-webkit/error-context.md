# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fullscreen-layout.spec.js >> Duo has equal fitted stages and recovers from small space at 1024x768
- Location: tests\browser\fullscreen-layout.spec.js:65:2

# Error details

```
Error: locator.selectOption: Error: strict mode violation: getByLabel('Pusingan') resolved to 2 elements:
    1) <select aria-label="Bilangan pusingan">…</select> aka getByLabel('Bilangan pusingan')
    2) <select aria-label="Masa setiap pusingan">…</select> aka getByLabel('Masa setiap pusingan')

Call log:
  - waiting for getByLabel('Pusingan')

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
      - button "Ruang guru" [ref=e14] [cursor=pointer]
      - button "Paparan penuh" [ref=e18] [cursor=pointer]: ⛶
      - button "Senyapkan audio" [ref=e19] [cursor=pointer]
      - generic "Profil Bunga" [ref=e23]
  - main [ref=e25]:
    - button "Kembali" [ref=e26] [cursor=pointer]: ← Kembali
    - generic [ref=e27]: JEJAK CERIA · DENGAN BANTUAN
    - heading "Dua teman, satu cabaran!" [level=1] [ref=e28]
    - paragraph [ref=e29]: Jejak bersama. Siap lebih cepat, dapat lebih markah.
    - generic [ref=e31]:
      - heading "Pilih cabaran" [level=2] [ref=e32]
      - generic [ref=e33]: Kumpulan huruf
      - combobox "Kumpulan huruf" [ref=e34]:
        - option "4 huruf permulaan" [selected]
        - option "Semua huruf sedia (8)"
        - option "Huruf tambahan (0)"
      - generic [ref=e35]:
        - generic [ref=e36]:
          - text: Bilangan pusingan
          - combobox "Bilangan pusingan" [ref=e37]:
            - option "3 pusingan"
            - option "5 pusingan" [disabled] [selected]
            - option "10 pusingan" [disabled]
        - generic [ref=e38]:
          - text: Masa setiap pusingan
          - combobox "Masa setiap pusingan" [ref=e39]:
            - option "60 saat"
            - option "90 saat" [selected]
            - option "120 saat"
      - paragraph [ref=e40]: 4 huruf layak · 5 pusingan · 90 saat setiap pusingan
    - generic [ref=e41]:
      - button "Sebelumnya" [ref=e42] [cursor=pointer]
      - generic [ref=e43]: Langkah 2 / 2
      - button "Uji dua sentuhan" [disabled] [ref=e44]
    - button "Cara markah & trofi" [ref=e45] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import letters from '../../src/content/letters.json' with {type:'json'};
  3   | import { validateLetter } from '../../src/content/validateContent.js';
  4   | import { mkdirSync } from 'node:fs';
  5   | import { dismissSplash, chooseLetter, selectPractice } from './helpers/navigation.js';
  6   | import { boardModels, draw, openTeacher, menuAction, openMenu, tapDots } from './helpers/tracing.js';
  7   | const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/fullscreen-layout'; mkdirSync(evidence,{recursive:true});
  8   | async function frames(page) { await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))); }
  9   | async function fitted(page) {
  10  |  await frames(page);
  11  |  const result=await page.evaluate(()=>{
  12  |   const visible=e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[aria-hidden="true"],.visually-hidden');};
  13  |   const containers=[document.documentElement,document.body,...document.querySelectorAll('main,.preview-banner,.book-inner,.book-spread,.book-writing,.completion-card,.ready-overlay,.stage-badge,.arena-hud,.race-pane,.teacher-content,.record-card,.fit-dialog,.detail-pages,.detail-fields,.teacher-panel,.match-settings,.duo-check,.race-dialog,.book-navigation,button')];
  14  |   const overflow=containers.filter(visible).filter(e=>e.scrollWidth>e.clientWidth+3||e.scrollHeight>e.clientHeight+3).map(e=>[e.tagName,e.className,e.clientWidth,e.scrollWidth,e.clientHeight,e.scrollHeight]);
  15  |   const offscreen=[...document.querySelectorAll('button,select,input')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.top< -1||r.right>innerWidth+1||r.bottom>innerHeight+1;}).map(e=>e.getAttribute('aria-label')||e.textContent);
  16  |   return {overflow,offscreen,scrollX,scrollY};
  17  |  }); expect(result).toEqual({overflow:[],offscreen:[],scrollX:0,scrollY:0});
  18  | }
  19  | async function shot(page,name) {
  20  |  // Windows WebKit can stall after native 4K capture; retain all DOM/fit checks.
  21  |  if(process.env.JAWI_SKIP_4K_WEBKIT_CAPTURES === '1' && name.startsWith('webkit-3840-')) return;
  22  |  await page.screenshot({path:`${evidence}/${name}.png`,animations:'disabled'});
  23  | }
  24  | async function welcome(page){await page.goto('/');await dismissSplash(page);await page.emulateMedia({reducedMotion:'reduce'});}
  25  | for (const [width,height] of [[320,600],[360,640],[320,740],[390,844],[1024,768],[768,1024],[1280,720],[1920,1080],[1280,800],[800,1280],[3840,2160]]) {
  26  |  test(`fitted menus, catalogue and teacher pages at ${width}x${height}`,async({page,browserName})=>{
  27  |   test.setTimeout(width >= 1900 ? 90000 : 45000);
  28  |   await page.setViewportSize({width,height});await welcome(page);await fitted(page);await shot(page,`${browserName}-${width}-welcome`);
  29  |   await page.getByRole('button',{name:'Jom mula',exact:true}).click();await fitted(page);
  30  |   const seen=new Set();for(let i=0;i<40;i++){for(const name of await page.locator('.letter-card').evaluateAll(n=>n.map(e=>e.getAttribute('aria-label'))))seen.add(name);const next=page.getByRole('button',{name:'Halaman huruf seterusnya',exact:true});if(!await next.isEnabled())break;await next.click();await fitted(page);}
  31  |   expect(seen.size).toBe(letters.filter(letter=>validateLetter(letter).ready).length);await shot(page,`${browserName}-${width}-catalogue-last`);
  32  |   await page.locator('.letter-card:enabled').last().click();const letter=await page.locator('main h1').innerText();await fitted(page);
  33  |   await menuAction(page,'Isi kandungan');await expect(page.getByRole('button',{name:letter,exact:true})).toBeVisible();
  34  |   await openTeacher(page);await fitted(page);
  35  |   for(const name of ['Suara','Huruf','Cubaan','Cabaran','Salinan','Diagnostik','Rakaman','Tetapan']){await page.getByRole('tab',{name,exact:true}).click();await fitted(page);if(name==='Suara')await shot(page,`${browserName}-${width}-teacher-audio`);}
  36  |   await page.getByRole('button',{name:'Panduan guru',exact:true}).click();await fitted(page);await page.keyboard.press('Escape');
  37  |   await page.getByRole('button',{name:'Padam rekod',exact:true}).click();await fitted(page);await page.getByRole('button',{name:'Batal',exact:true}).click();
  38  |  });
  39  | }
  40  | for(const [width,height] of [[320,600],[360,640],[390,844],[1024,768],[768,1024],[1920,1080],[1280,800],[800,1280],[3840,2160]]) {
  41  |  test(`all 37 complete letter envelopes and guides fit at ${width}x${height}`,async({page,browserName})=>{
  42  |   test.setTimeout(width >= 1900 ? 300000 : 120000);await page.setViewportSize({width,height});await welcome(page);await selectPractice(page,'play');await chooseLetter(page,'Alif');
  43  |   for(let i=0;i<letters.length;i++){
  44  |    await expect(page.getByRole('heading',{name:letters[i].labelMs,exact:true})).toBeVisible();await fitted(page);
  45  |    const fit=await page.locator('.trace-board').evaluate(svg=>{const board=svg.getBoundingClientRect();const nodes=[...svg.querySelectorAll('.reference-stroke,.reference-dot,.trace-number-badge,.trace-number-label-backdrop')];return nodes.map(n=>{const r=n.getBoundingClientRect();return r.left>=board.left-1&&r.right<=board.right+1&&r.top>=board.top-1&&r.bottom<=board.bottom+1;});});expect(fit.every(Boolean),letters[i].id).toBe(true);
  46  |    const clear=await page.evaluate(()=>{const controls=[document.querySelector('.stage-menu-button'),document.querySelector('.stage-badge')].map(e=>e.getBoundingClientRect());return [...document.querySelectorAll('.reference-stroke,.reference-dot,.trace-number-badge,.trace-number-label-backdrop')].filter(n=>n.getBoundingClientRect().width).every(n=>{const r=n.getBoundingClientRect();return controls.every(c=>r.right<=c.left||c.right<=r.left||r.bottom<=c.top||c.bottom<=r.top);});});expect(clear,letters[i].id+' clears the menu and letter badge').toBe(true);
  47  |    if(['alif','mim','nga','nya'].includes(letters[i].id))await shot(page,`${browserName}-${width}-${letters[i].id}`);
  48  |    await menuAction(page,'Huruf seterusnya');
  49  |   }
  50  |   await expect(page.locator('.book-end')).toBeVisible();await fitted(page);await shot(page,`${browserName}-${width}-book-end`);
  51  |  });
  52  | }
  53  | test('completion, dots, copy coordinates, save protection, audio failure and resize keep a stable board',async({page})=>{
  54  |  await page.setViewportSize({width:768,height:1024});await welcome(page);await selectPractice(page,'play');await chooseLetter(page,'Nga');await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();
  55  |  const board=page.locator('.trace-board'),initial=await board.getAttribute('viewBox'),box=await board.boundingBox(),model=await boardModels(page);
  56  |  for(const stroke of model.strokes)await draw(page,stroke);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');await expect(page.locator('.race-dock,.lesson-dock')).toHaveCount(0);await fitted(page);expect(await board.getAttribute('viewBox')).toBe(initial);
  57  |  await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();await fitted(page);expect(await board.getAttribute('viewBox')).toBe(initial);expect(await board.boundingBox()).toEqual(box);
  58  |  await page.getByRole('button',{name:'Sekarang, cuba salin sendiri',exact:true}).click();await expect(page.locator('.copy-board')).toHaveAttribute('viewBox','0 0 1000 1000');await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();await frames(page);
  59  |  const points=await board.evaluate(svg=>{svg.addEventListener('pointerdown',event=>{const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());svg.dataset.copyStart=JSON.stringify({x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10});},{once:true});return [new DOMPoint(200,200),new DOMPoint(400,400)].map(p=>{const q=p.matrixTransform(svg.getScreenCTM());return{x:q.x,y:q.y};});});await draw(page,points);const delivered=JSON.parse(await board.getAttribute('data-copy-start'));await menuAction(page,'Huruf seterusnya');await fitted(page);await page.getByRole('button',{name:'Simpan',exact:true}).click();await expect(page.getByRole('heading',{name:'Fa',exact:true})).toBeVisible();
  60  |  const copy=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies[0]);expect(copy.ink[0][0]).toEqual(delivered);
  61  |  await page.route('**/audio/**',route=>route.abort());await openMenu(page);await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Dengar',exact:true}).click();await expect(page.getByRole('dialog',{name:'Dengar nama huruf'})).toBeVisible();await fitted(page);await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  62  |  await page.setViewportSize({width:1024,height:768});await fitted(page);await expect(board).toBeVisible();
  63  | });
  64  | for(const [width,height] of [[1024,768],[768,1024],[1280,720],[1920,1080],[1280,800],[800,1280],[3840,2160]]){
  65  |  test(`Duo has equal fitted stages and recovers from small space at ${width}x${height}`,async({page,browserName})=>{
> 66  |   await page.setViewportSize({width,height});await welcome(page);await page.getByRole('button',{name:'Duo 1v1',exact:true}).click();await page.getByRole('button',{name:'Jom mula',exact:true}).click();await fitted(page);await page.getByRole('button',{name:'Seterusnya',exact:true}).click();await page.getByLabel('Pusingan').selectOption('3');await fitted(page);await page.getByRole('button',{name:'Uji dua sentuhan'}).click();await fitted(page);await page.getByRole('button',{name:/Pratonton susun atur dewasa/}).click();await frames(page);await expect(page.locator('.arena-space')).toHaveCount(0);await fitted(page);
      |                                                                                                                                                                                                                                                                                                                                    ^ Error: locator.selectOption: Error: strict mode violation: getByLabel('Pusingan') resolved to 2 elements:
  67  |   const sizes=await page.locator('.trace-stage').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return{width:b.width,height:b.height};}));expect(sizes[0]).toEqual(sizes[1]);expect(Math.min(sizes[0].width,sizes[0].height)).toBeGreaterThanOrEqual(280);expect(await page.locator('.trace-board').first().getAttribute('viewBox')).toBe(await page.locator('.trace-board').last().getAttribute('viewBox'));await shot(page,`${browserName}-${width}-duo`);
  68  |   const squeeze=await page.addStyleTag({content:'.race-pane { max-height: 240px !important; }'});await expect(page.locator('.arena-space')).toBeVisible();await fitted(page);await squeeze.evaluate(node=>node.remove());await expect(page.locator('.arena-space')).toHaveCount(0);await fitted(page);
  69  |  });
  70  | }
  71  | test('short viewport and zoom equivalent give fitted space guidance',async({page})=>{await page.setViewportSize({width:640,height:450});await page.goto('/');await page.waitForTimeout(1900);await expect(page.getByRole('dialog',{name:'Besarkan ruang bermain'})).toBeVisible();await fitted(page);await page.setViewportSize({width:1024,height:768});await expect(page.getByRole('button',{name:'Jom mula',exact:true})).toBeVisible();});
  72  | 
  73  | test('every retained attempt is paged and export includes the complete store',async({page})=>{
  74  |  test.setTimeout(90000);
  75  |  await page.setViewportSize({width:390,height:844});await welcome(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Alif');await draw(page,(await boardModels(page)).strokes[0]);await expect(page.locator('.book-completed')).toBeVisible();
  76  |  await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('taman-jawi.progress.v1')),original=data.attempts[0];data.attempts=Array.from({length:300},(_,i)=>({...original,id:'layout-attempt-'+i}));localStorage.setItem('taman-jawi.progress.v1',JSON.stringify(data));});await page.reload();await dismissSplash(page);await openTeacher(page);await page.getByRole('tab',{name:'Cubaan',exact:true}).click();
  77  |  const ids=new Set();for(let i=0;i<301;i++){await fitted(page);for(const id of await page.locator('.record-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.recordId)))ids.add(id);const next=page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true});if(!await next.isEnabled())break;await next.click();}expect(ids.size).toBe(300);
  78  |  await page.getByRole('button',{name:'Butiran cubaan',exact:true}).first().click();const labels=new Set();for(let i=0;i<100;i++){await fitted(page);for(const text of await page.locator('.detail-fields dt').allTextContents())labels.add(text);const next=page.getByRole('button',{name:'Halaman butiran seterusnya',exact:true});if(!await next.isEnabled())break;await next.click();}expect(labels.has('metrics · coverage')).toBe(true);expect(labels.has('interactionPolicy')).toBe(true);await page.keyboard.press('Escape');
  79  |  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Eksport kemajuan',exact:true}).click();let json='';for await(const chunk of await (await pending).createReadStream())json+=chunk.toString();expect(JSON.parse(json).progress.attempts.length).toBe(300);
  80  | });
  81  | 
  82  | for(const [width,height] of [[320,740],[390,844],[1024,768],[1920,1080]])test(`demo, completion and copy tools fit at ${width}x${height}`,async({page,browserName})=>{
  83  |  await page.setViewportSize({width,height});await welcome(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Alif');await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink').first()).toBeVisible();await fitted(page);await shot(page,`${browserName}-${width}-demo`);await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:10000});
  84  |  await draw(page,(await boardModels(page)).strokes[0]);await expect(page.locator('.book-completed')).toBeVisible();await fitted(page);await shot(page,`${browserName}-${width}-completed`);await page.getByRole('button',{name:'Sekarang, cuba salin sendiri',exact:true}).click();await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();await fitted(page);await shot(page,`${browserName}-${width}-copy`);await page.getByRole('button',{name:'Simpan untuk guru',exact:true}).click();await expect(page.getByRole('dialog',{name:'Jom tulis dahulu'})).toBeVisible();await fitted(page);await page.keyboard.press('Escape');
  85  | });
  86  | test('small-space fullscreen rejection stays visible and preserves the current screen',async({page})=>{
  87  |  await page.addInitScript(()=>{HTMLElement.prototype.requestFullscreen=async()=>{throw new Error('not supported');};});await page.setViewportSize({width:640,height:450});await page.goto('/');await page.waitForTimeout(1900);await page.getByRole('button',{name:'Paparan penuh',exact:true}).click();await expect(page.getByRole('dialog',{name:'Besarkan ruang bermain'})).toContainText('Paparan penuh tidak tersedia');await fitted(page);await page.setViewportSize({width:1024,height:768});await expect(page.getByRole('button',{name:'Jom mula',exact:true})).toBeVisible();
  88  | });
  89  | 
  90  | test.describe('no-scroll input',()=>{
  91  |  test.use({viewport:{width:1024,height:768},hasTouch:true});
  92  |  test('wheel, keyboard and supported native touch panning cannot scroll game screens',async({page,browserName})=>{
  93  |   const session=browserName==='chromium'?await page.context().newCDPSession(page):null;
  94  |   const pan=async()=>{
  95  |    await page.mouse.move(5,300);await page.mouse.wheel(600,600);await page.keyboard.press('ArrowDown');
  96  |    if(session){await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:5,y:520,id:1}]});for(const y of [460,400,340,280,220])await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:5,y,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  97  |    await fitted(page);
  98  |   };
  99  |   await welcome(page);await pan();await page.getByRole('button',{name:'Jom mula',exact:true}).click();await pan();await chooseLetter(page,'Alif');await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();await pan();
  100 |   await menuAction(page,'Kenal huruf dan panduan');await pan();await page.keyboard.press('Escape');
  101 |   await openTeacher(page);await pan();await page.getByRole('button',{name:'Panduan guru',exact:true}).click();await pan();
  102 |   await session?.detach();
  103 |  });
  104 | });
  105 | 
```