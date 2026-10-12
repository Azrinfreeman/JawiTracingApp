import { expect } from '@playwright/test';
import { test } from './helpers/localTest.js';
import letters from '../../src/content/letters.json' with { type:'json' };
import { openLesson, boardModels, menuAction } from './helpers/tracing.js';
import { chooseLetter, dismissSplash } from './helpers/navigation.js';
import { instrument } from './helpers/audio.js';
import { mkdirSync, writeFileSync } from 'node:fs';

// Repeated lesson changes exercise immutable-reference reuse in both strict modes.
for (const mode of ['guided','precision']) test(`all 36 ${mode} models retain ordered strokes, dots and saved revisions`, async ({page}) => {
  test.setTimeout(600000);
  await page.setViewportSize({width:1024,height:768});
  await openLesson(page,letters[0].labelMs,mode);
  for(const [index,letter] of letters.entries()) {
    if(index){await menuAction(page,'Isi kandungan');await chooseLetter(page,letter.labelMs);}
    const model=await boardModels(page);
    await page.locator('.trace-board').evaluate(async(svg,model)=>{
      svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
      const send=(type,p,coalesced=[])=>{
        const event=new PointerEvent(type,{bubbles:true,pointerId:93,pointerType:'pen',clientX:p.x,clientY:p.y});
        if(coalesced.length)Object.defineProperty(event,'getCoalescedEvents',{value:()=>coalesced.map(q=>new PointerEvent('pointermove',{clientX:q.x,clientY:q.y,pointerType:'pen'}))});
        svg.dispatchEvent(event);
      };
      for(const stroke of model.strokes){
        send('pointerdown',stroke[0]);
        for(let i=1;i<stroke.length;i+=4){const batch=stroke.slice(i,i+4);send('pointermove',batch.at(-1),batch);if(i%16===1)await new Promise(requestAnimationFrame);}
        send('pointerup',stroke.at(-1));await new Promise(requestAnimationFrame);
      }
      for(const dot of model.dots){send('pointerdown',dot);send('pointerup',dot);await new Promise(requestAnimationFrame);}
    },model);
    await expect(page.locator('.trace-board'),letter.id).toHaveAttribute('data-phase','complete');
    await expect(page.getByRole('heading',{name:'Bagus, kamu sudah cuba!'})).toBeVisible();
    const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(record).toMatchObject({letterId:letter.id,contentVersion:letter.contentVersion,mode,outcome:`${mode}Complete`,metrics:{dotCount:letter.geometry.dotTargets.length}});
  }
});

test('new browser light default keeps colourful controls and explicit full preference after reload',async({page})=>{
  await openLesson(page,'Alif','play');
  await expect(page.locator('html')).toHaveAttribute('data-presentation','light');
  await expect(page.locator('.start-dot')).toBeVisible();
  await expect(page.getByRole('button',{name:'Kembali ke Isi Kandungan',exact:true})).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('taman-jawi.presentation.v1','full'));
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-presentation','full');
});

for(const music of [false,true]) test(`near-limit history saves the first Duo player while the other keeps tracing, music ${music}`,async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','Concurrent trusted touch uses Chromium CDP.');
  test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await instrument(page);
  await page.addInitScript(music=>{
    Math.random=()=>.99999;
    localStorage.setItem('taman-jawi.music.v1',JSON.stringify({version:1,enabled:music,volume:.15}));
    const attempts=Array.from({length:300},(_,i)=>({id:`history-${i}`,timestamp:'2026-10-07T00:00:00Z',profile:'Bunga',letterId:'alif',mode:'play',pointerType:'touch',toleranceProfile:'play-touch-standard-v2',metrics:{coverage:1,meanError:0,invalidTravel:0,invalidEvents:0},assistance:1,retries:0}));
    const line=Array.from({length:700},(_,i)=>({x:100+i,y:100+i%500}));
    const copies=Array.from({length:12},(_,i)=>({id:`copy-${i}`,timestamp:'2026-10-07T00:00:00Z',profile:'Bunga',letterId:'alif',ink:Array.from({length:10},()=>line)}));
    localStorage.setItem('taman-jawi.progress.v1',JSON.stringify({version:1,profile:'Bunga',attempts,copies}));
    window.saveCosts=[];const save=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){const start=performance.now();const result=save.call(this,key,value);if(key==='taman-jawi.progress.v1')window.saveCosts.push({ms:performance.now()-start,bytes:value.length});return result;};
  },music);
  await page.goto('/');await dismissSplash(page);
  const copiesBefore=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies));
  await page.getByRole('button',{name:'Duo 1v1',exact:true}).click();await page.getByRole('button',{name:'Jom mula',exact:true}).click();await page.getByRole('button',{name:'Seterusnya',exact:true}).click();
  await page.getByRole('button',{name:'Uji dua sentuhan'}).click();
  const session=await context.newCDPSession(page);
  const centers=await Promise.all([1,2].map(async slot=>{const b=await page.getByRole('button',{name:`Uji sentuhan pemain ${slot}`}).boundingBox();return{x:b.x+b.width/2,y:b.y+b.height/2,id:slot};}));
  const touch=(type,touchPoints)=>session.send('Input.dispatchTouchEvent',{type,touchPoints});
  await touch('touchStart',centers);await touch('touchEnd',[]);await page.getByRole('button',{name:'Teruskan Duo 1v1'}).click();
  for(let slot=0;slot<2;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
  const models=await Promise.all([0,1].map(slot=>boardModels(page,page.locator('.trace-board').nth(slot)))),a=models[0].strokes[0],b=models[1].strokes[0],middle=Math.floor(b.length/2);
  // CDP touchEnd does not provide a reliable single-finger release while retaining
  // another contact here. Use ordered board events for this storage regression;
  // solo-duo.spec independently covers native simultaneous touch and capture.
  await page.evaluate(async({a,b,middle})=>{
    const boards=[...document.querySelectorAll('.trace-board')];
    boards.forEach(board=>{board.setPointerCapture=()=>{};board.hasPointerCapture=()=>false;});
    window.historyTouch=(slot,type,p)=>boards[slot].dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:81+slot,pointerType:'touch',clientX:p.x,clientY:p.y}));
    window.historyTouch(0,'pointerdown',a[0]);window.historyTouch(1,'pointerdown',b[0]);
    for(let i=1;i<a.length;i++){
      window.historyTouch(0,'pointermove',a[i]);window.historyTouch(1,'pointermove',b[Math.min(i,middle)]);
      if(i%8===0)await new Promise(requestAnimationFrame);
    }
    window.historyTouch(0,'pointerup',a.at(-1));
  },{a,b,middle});
  await expect(page.locator('.trace-board').nth(0)).toHaveAttribute('data-phase','complete');
  await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','tracing');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')));
  expect(saved.attempts).toHaveLength(300);expect(saved.attempts.at(-1)).toMatchObject({sessionType:'duo',playerSlot:0,outcome:'playComplete'});expect(JSON.stringify(saved.copies)).toBe(copiesBefore);
  await page.evaluate(async points=>{
    for(const [i,p] of points.entries()){window.historyTouch(1,'pointermove',p);if(i%8===0)await new Promise(requestAnimationFrame);}
    window.historyTouch(1,'pointerup',points.at(-1));
  },b.slice(middle+1));
  await expect(page.locator('.round-result')).toBeVisible();
  const final=await page.evaluate(()=>({progress:JSON.parse(localStorage.getItem('taman-jawi.progress.v1')),saveCosts:window.saveCosts,plays:window.__media.plays}));
  expect(final.progress.attempts.slice(-2).map(a=>a.playerSlot)).toEqual([0,1]);expect(JSON.stringify(final.progress.copies)).toBe(copiesBefore);
  expect(final.plays.some(p=>p.music)).toBe(music);
  const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/tablet-smartboard-performance/browser';mkdirSync(root,{recursive:true});
  writeFileSync(`${root}/near-limit-music-${music}.json`,JSON.stringify({saveCosts:final.saveCosts,retainedAttempts:final.progress.attempts.length,retainedCopies:final.progress.copies.length,firstSaveWhileOtherContactHeld:true,input:'Frame-paced synthetic board events; native concurrent/capture checks are separate',media:'Stubbed lifecycle, no native decoder timing'},null,2));
});
