import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with {type:'json'};
import { validateLetter } from '../../src/content/validateContent.js';
import { mkdirSync } from 'node:fs';
import { dismissSplash, chooseLetter, selectPractice } from './helpers/navigation.js';
import { boardModels, draw, openTeacher, menuAction, openMenu, tapDots } from './helpers/tracing.js';
const evidence = process.env.JAWI_EVIDENCE_DIR || 'output/verification/fullscreen-layout'; mkdirSync(evidence,{recursive:true});
async function frames(page) { await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))); }
async function fitted(page) {
 await frames(page);
 const result=await page.evaluate(()=>{
  const visible=e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[aria-hidden="true"],.visually-hidden');};
  const containers=[document.documentElement,document.body,...document.querySelectorAll('main,.preview-banner,.book-inner,.book-spread,.book-writing,.completion-card,.ready-overlay,.stage-badge,.arena-hud,.race-pane,.teacher-content,.record-card,.fit-dialog,.detail-pages,.detail-fields,.teacher-panel,.match-settings,.duo-check,.race-dialog,.book-navigation,button')];
  const overflow=containers.filter(visible).filter(e=>e.scrollWidth>e.clientWidth+3||e.scrollHeight>e.clientHeight+3).map(e=>[e.tagName,e.className,e.clientWidth,e.scrollWidth,e.clientHeight,e.scrollHeight]);
  const offscreen=[...document.querySelectorAll('button,select,input')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.top< -1||r.right>innerWidth+1||r.bottom>innerHeight+1;}).map(e=>e.getAttribute('aria-label')||e.textContent);
  return {overflow,offscreen,scrollX,scrollY};
 }); expect(result).toEqual({overflow:[],offscreen:[],scrollX:0,scrollY:0});
}
async function shot(page,name) {
 // Windows WebKit can stall after native 4K capture; retain all DOM/fit checks.
 if(process.env.JAWI_SKIP_4K_WEBKIT_CAPTURES === '1' && name.startsWith('webkit-3840-')) return;
 await page.screenshot({path:`${evidence}/${name}.png`,animations:'disabled'});
}
async function welcome(page){await page.goto('/');await dismissSplash(page);await page.emulateMedia({reducedMotion:'reduce'});}
for (const [width,height] of [[320,600],[360,640],[320,740],[390,844],[1024,768],[768,1024],[1280,720],[1920,1080],[1280,800],[800,1280],[3840,2160]]) {
 test(`fitted menus, catalogue and teacher pages at ${width}x${height}`,async({page,browserName})=>{
  test.setTimeout(width >= 1900 ? 90000 : 45000);
  await page.setViewportSize({width,height});await welcome(page);await fitted(page);await shot(page,`${browserName}-${width}-welcome`);
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await fitted(page);
  const seen=new Set();for(let i=0;i<40;i++){for(const name of await page.locator('.letter-card').evaluateAll(n=>n.map(e=>e.getAttribute('aria-label'))))seen.add(name);const next=page.getByRole('button',{name:'Halaman huruf seterusnya',exact:true});if(!await next.isEnabled())break;await next.click();await fitted(page);}
  expect(seen.size).toBe(letters.filter(letter=>validateLetter(letter).ready).length);await shot(page,`${browserName}-${width}-catalogue-last`);
  await page.locator('.letter-card:enabled').last().click();const letter=await page.locator('main h1').innerText();await fitted(page);
  await menuAction(page,'Isi kandungan');await expect(page.getByRole('button',{name:letter,exact:true})).toBeVisible();
  await openTeacher(page);await fitted(page);
  for(const name of ['Suara','Huruf','Cubaan','Cabaran','Salinan','Diagnostik','Rakaman','Tetapan']){await page.getByRole('tab',{name,exact:true}).click();await fitted(page);if(name==='Suara')await shot(page,`${browserName}-${width}-teacher-audio`);}
  await page.getByRole('button',{name:'Panduan guru',exact:true}).click();await fitted(page);await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Padam rekod',exact:true}).click();await fitted(page);await page.getByRole('button',{name:'Batal',exact:true}).click();
 });
}
for(const [width,height] of [[320,600],[360,640],[390,844],[1024,768],[768,1024],[1920,1080],[1280,800],[800,1280],[3840,2160]]) {
 test(`all 36 complete letter envelopes and guides fit at ${width}x${height}`,async({page,browserName})=>{
  test.setTimeout(width >= 1900 ? 300000 : 120000);await page.setViewportSize({width,height});await welcome(page);await selectPractice(page,'play');await chooseLetter(page,'Alif');
  for(let i=0;i<letters.length;i++){
   await expect(page.getByRole('heading',{name:letters[i].labelMs,exact:true})).toBeVisible();await fitted(page);
   const fit=await page.locator('.trace-board').evaluate(svg=>{const board=svg.getBoundingClientRect();const nodes=[...svg.querySelectorAll('.reference-stroke,.reference-dot,.trace-number-badge,.trace-number-label-backdrop')];return nodes.map(n=>{const r=n.getBoundingClientRect();return r.left>=board.left-1&&r.right<=board.right+1&&r.top>=board.top-1&&r.bottom<=board.bottom+1;});});expect(fit.every(Boolean),letters[i].id).toBe(true);
   const clear=await page.evaluate(()=>{const controls=[document.querySelector('.stage-menu-button'),document.querySelector('.stage-badge')].map(e=>e.getBoundingClientRect());return [...document.querySelectorAll('.reference-stroke,.reference-dot,.trace-number-badge,.trace-number-label-backdrop')].filter(n=>n.getBoundingClientRect().width).every(n=>{const r=n.getBoundingClientRect();return controls.every(c=>r.right<=c.left||c.right<=r.left||r.bottom<=c.top||c.bottom<=r.top);});});expect(clear,letters[i].id+' clears the menu and letter badge').toBe(true);
   if(['alif','mim','nga','nya'].includes(letters[i].id))await shot(page,`${browserName}-${width}-${letters[i].id}`);
   await menuAction(page,'Huruf seterusnya');
  }
  await expect(page.locator('.book-end')).toBeVisible();await fitted(page);await shot(page,`${browserName}-${width}-book-end`);
 });
}
test('completion, dots, copy coordinates, save protection, audio failure and resize keep a stable board',async({page})=>{
 await page.setViewportSize({width:768,height:1024});await welcome(page);await selectPractice(page,'play');await chooseLetter(page,'Nga');await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();
 const board=page.locator('.trace-board'),initial=await board.getAttribute('viewBox'),box=await board.boundingBox(),model=await boardModels(page);
 for(const stroke of model.strokes)await draw(page,stroke);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');await expect(page.locator('.race-dock,.lesson-dock')).toHaveCount(0);await fitted(page);expect(await board.getAttribute('viewBox')).toBe(initial);
 await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();await fitted(page);expect(await board.getAttribute('viewBox')).toBe(initial);expect(await board.boundingBox()).toEqual(box);
 await page.getByRole('button',{name:'Sekarang, cuba salin sendiri',exact:true}).click();await expect(page.locator('.copy-board')).toHaveAttribute('viewBox','0 0 1000 1000');await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();await frames(page);
 const points=await board.evaluate(svg=>{svg.addEventListener('pointerdown',event=>{const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());svg.dataset.copyStart=JSON.stringify({x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10});},{once:true});return [new DOMPoint(200,200),new DOMPoint(400,400)].map(p=>{const q=p.matrixTransform(svg.getScreenCTM());return{x:q.x,y:q.y};});});await draw(page,points);const delivered=JSON.parse(await board.getAttribute('data-copy-start'));await menuAction(page,'Huruf seterusnya');await fitted(page);await page.getByRole('button',{name:'Simpan',exact:true}).click();await expect(page.getByRole('heading',{name:'Fa',exact:true})).toBeVisible();
 const copy=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies[0]);expect(copy.ink[0][0]).toEqual(delivered);
 await page.route('**/audio/**',route=>route.abort());await openMenu(page);await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Dengar',exact:true}).click();await expect(page.getByRole('dialog',{name:'Dengar nama huruf'})).toBeVisible();await fitted(page);await page.keyboard.press('Escape');await page.keyboard.press('Escape');
 await page.setViewportSize({width:1024,height:768});await fitted(page);await expect(board).toBeVisible();
});
for(const [width,height] of [[1024,768],[768,1024],[1280,720],[1920,1080],[1280,800],[800,1280],[3840,2160]]){
 test(`Duo has equal fitted stages and recovers from small space at ${width}x${height}`,async({page,browserName})=>{
  await page.setViewportSize({width,height});await welcome(page);await page.getByRole('button',{name:'Duo 1v1',exact:true}).click();await page.getByRole('button',{name:'Jom mula',exact:true}).click();await fitted(page);await page.getByRole('button',{name:'Seterusnya',exact:true}).click();await page.getByLabel('Bilangan pusingan').selectOption('3');await fitted(page);await page.getByRole('button',{name:'Uji dua sentuhan'}).click();await fitted(page);await page.getByRole('button',{name:/Pratonton susun atur dewasa/}).click();await frames(page);await expect(page.locator('.arena-space')).toHaveCount(0);await fitted(page);
  const sizes=await page.locator('.trace-stage').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return{width:b.width,height:b.height};}));expect(sizes[0]).toEqual(sizes[1]);expect(Math.min(sizes[0].width,sizes[0].height)).toBeGreaterThanOrEqual(280);expect(await page.locator('.trace-board').first().getAttribute('viewBox')).toBe(await page.locator('.trace-board').last().getAttribute('viewBox'));await shot(page,`${browserName}-${width}-duo`);
  const squeeze=await page.addStyleTag({content:'.race-pane { max-height: 240px !important; }'});await expect(page.locator('.arena-space')).toBeVisible();await fitted(page);await squeeze.evaluate(node=>node.remove());await expect(page.locator('.arena-space')).toHaveCount(0);await fitted(page);
 });
}
test('short viewport and zoom equivalent give fitted space guidance',async({page})=>{await page.setViewportSize({width:640,height:450});await page.goto('/');await page.waitForTimeout(1900);await expect(page.getByRole('dialog',{name:'Besarkan ruang bermain'})).toBeVisible();await fitted(page);await page.setViewportSize({width:1024,height:768});await expect(page.getByRole('button',{name:'Jom mula',exact:true})).toBeVisible();});

test('every retained attempt is paged and export includes the complete store',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:390,height:844});await welcome(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Alif');await draw(page,(await boardModels(page)).strokes[0]);await expect(page.locator('.book-completed')).toBeVisible();
 await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('taman-jawi.progress.v1')),original=data.attempts[0];data.attempts=Array.from({length:300},(_,i)=>({...original,id:'layout-attempt-'+i}));localStorage.setItem('taman-jawi.progress.v1',JSON.stringify(data));});await page.reload();await dismissSplash(page);await openTeacher(page);await page.getByRole('tab',{name:'Cubaan',exact:true}).click();
 const ids=new Set();for(let i=0;i<301;i++){await fitted(page);for(const id of await page.locator('.record-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.recordId)))ids.add(id);const next=page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true});if(!await next.isEnabled())break;await next.click();}expect(ids.size).toBe(300);
 await page.getByRole('button',{name:'Butiran cubaan',exact:true}).first().click();const labels=new Set();for(let i=0;i<100;i++){await fitted(page);for(const text of await page.locator('.detail-fields dt').allTextContents())labels.add(text);const next=page.getByRole('button',{name:'Halaman butiran seterusnya',exact:true});if(!await next.isEnabled())break;await next.click();}expect(labels.has('metrics · coverage')).toBe(true);expect(labels.has('interactionPolicy')).toBe(true);await page.keyboard.press('Escape');
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Eksport kemajuan',exact:true}).click();let json='';for await(const chunk of await (await pending).createReadStream())json+=chunk.toString();expect(JSON.parse(json).progress.attempts.length).toBe(300);
});

for(const [width,height] of [[320,740],[390,844],[1024,768],[1920,1080]])test(`demo, completion and copy tools fit at ${width}x${height}`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await welcome(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Alif');await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink').first()).toBeVisible();await fitted(page);await shot(page,`${browserName}-${width}-demo`);await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:10000});
 await draw(page,(await boardModels(page)).strokes[0]);await expect(page.locator('.book-completed')).toBeVisible();await fitted(page);await shot(page,`${browserName}-${width}-completed`);await page.getByRole('button',{name:'Sekarang, cuba salin sendiri',exact:true}).click();await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();await fitted(page);await shot(page,`${browserName}-${width}-copy`);await page.getByRole('button',{name:'Simpan untuk guru',exact:true}).click();await expect(page.getByRole('dialog',{name:'Jom tulis dahulu'})).toBeVisible();await fitted(page);await page.keyboard.press('Escape');
});
test('small-space fullscreen rejection stays visible and preserves the current screen',async({page})=>{
 await page.addInitScript(()=>{HTMLElement.prototype.requestFullscreen=async()=>{throw new Error('not supported');};});await page.setViewportSize({width:640,height:450});await page.goto('/');await page.waitForTimeout(1900);await page.getByRole('button',{name:'Paparan penuh',exact:true}).click();await expect(page.getByRole('dialog',{name:'Besarkan ruang bermain'})).toContainText('Paparan penuh tidak tersedia');await fitted(page);await page.setViewportSize({width:1024,height:768});await expect(page.getByRole('button',{name:'Jom mula',exact:true})).toBeVisible();
});

test.describe('no-scroll input',()=>{
 test.use({viewport:{width:1024,height:768},hasTouch:true});
 test('wheel, keyboard and supported native touch panning cannot scroll game screens',async({page,browserName})=>{
  const session=browserName==='chromium'?await page.context().newCDPSession(page):null;
  const pan=async()=>{
   await page.mouse.move(5,300);await page.mouse.wheel(600,600);await page.keyboard.press('ArrowDown');
   if(session){await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:5,y:520,id:1}]});for(const y of [460,400,340,280,220])await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:5,y,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   await fitted(page);
  };
  await welcome(page);await pan();await page.getByRole('button',{name:'Jom mula',exact:true}).click();await pan();await chooseLetter(page,'Alif');await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();await pan();
  await menuAction(page,'Kenal huruf dan panduan');await pan();await page.keyboard.press('Escape');
  await openTeacher(page);await pan();await page.getByRole('button',{name:'Panduan guru',exact:true}).click();await pan();
  await session?.detach();
 });
});
