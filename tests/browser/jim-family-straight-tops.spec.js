import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction,movePoints,tapDots} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {jimFamilyStraightTopReviewCandidates} from '../../src/content/reviewCandidates.js';

import originals from '../fixtures/jim-family-straight-top-originals.json' with {type:'json'};
const proposals=jimFamilyStraightTopReviewCandidates(originals).map(p=>({...p,candidate:letters.find(l=>l.id===p.candidate.id)}));
const root='output/verification/jim-family-straight-top-approval/browser';mkdirSync(root,{recursive:true});
test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function student(page,index=0,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
  await page.getByLabel('Jenis latihan').selectOption(mode);
  await page.getByRole('button',{name:'Kembali',exact:true}).click();
 }
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();
 await chooseLetter(page,proposals[index].candidate.labelMs);
 await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name){
 await boardModels(page);
 const bounds=await page.locator('.trace-board').evaluate(svg=>{
  const b=svg.getBoundingClientRect();return [...svg.querySelectorAll('.reference-stroke,.reference-dot,.trace-number-badge,.trace-number-label-backdrop')].map(n=>{
   const r=n.getBoundingClientRect();return {kind:n.getAttribute('class'),clipped:r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1};
  });
 });expect(bounds.filter(b=>b.clipped)).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const [index,{candidate}]of proposals.entries())for(const [mode,width,height]of [['play',320,600],['guided',768,1024],['precision',1280,800]])test(`${candidate.id} ${mode}: straight head, numbered direction, bowl, every dot and approved save`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await student(page,index,mode);
 expect(await page.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(candidate.geometry.strokes.map(s=>s.path));
 await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula','2 Ikut','3 Henti']);
 if(mode==='play')await expect(page.locator('.writing-cue')).toHaveText('Mula di 1. Tarik garis lurus ke kanan hingga 3.');
 const anchors=await page.locator('.trace-number-badge').evaluateAll(nodes=>nodes.map(n=>({x:+n.getAttribute('cx'),y:+n.getAttribute('cy')})));
 expect(anchors).toHaveLength(3);expect(anchors[0].x).toBeLessThan(anchors[1].x);expect(anchors[1].x).toBeLessThan(anchors[2].x);
 expect(anchors[0].y).toBe(anchors[2].y);
 await capture(page,`${browserName}-${candidate.id}-${mode}-start`);
 let top=(await boardModels(page)).strokes[0];
 if(mode==='play'){
  const split=Math.floor(top.length/2);await page.mouse.move(top[0].x,top[0].y);await page.mouse.down();await movePoints(page,top.slice(1,split));
  await capture(page,`${browserName}-${candidate.id}-mid-top`);
  top=(await boardModels(page)).strokes[0];await movePoints(page,top.slice(split));await page.mouse.up();
 }else await draw(page,top);
 await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
 await expect(page.locator('.trace-number-label').first()).toHaveText('4 Mula');
 if(mode==='play')await expect(page.locator('.writing-cue')).toHaveText('Angkat pen. Mula semula di 4. Ikut lengkung mangkuk hingga hujung.');
 await capture(page,`${browserName}-${candidate.id}-${mode}-top-complete`);
 await draw(page,(await boardModels(page)).strokes[1]);
 if(candidate.geometry.dotTargets.length){await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');await tapDots(page);}
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await capture(page,`${browserName}-${candidate.id}-${mode}-finished`);
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 const saved=(await attempts(page))[0];expect(saved).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,preview:false,geometryStatus:'approved',audioStatus:'approved',mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
test('approved straight-top proposals expire from adult review',async({page,browserName})=>{
 expect(jimFamilyStraightTopReviewCandidates(letters)).toEqual([]);
 await page.setViewportSize({width:768,height:1024});await page.goto('/');await dismissSplash(page);
 await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
 await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 await page.getByLabel('Jenis semakan').selectOption('jim-family-straight-top');
 await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
 await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
 await page.screenshot({path:`${root}/${browserName}-review-expired.png`,animations:'disabled'});
});
for(const [index,{original,candidate}]of proposals.entries())test(`${candidate.id} saved revisions: old and preview attempts retained without student credit`,async({page})=>{
 await student(page,index);await draw(page,(await boardModels(page)).strokes[0]);await draw(page,(await boardModels(page)).strokes[1]);await tapDots(page);
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);const current=(await attempts(page))[0];
 const older={...current,id:`old-${candidate.id}`,contentVersion:original.contentVersion};
 const previewAttempt={...current,id:`preview-${candidate.id}`,preview:true,geometryStatus:'pendingReview'};
 await page.evaluate(records=>{const saved=JSON.parse(localStorage.getItem('taman-jawi.progress.v1'));saved.attempts=records;localStorage.setItem('taman-jawi.progress.v1',JSON.stringify(saved));},[older,previewAttempt]);
 await page.reload();await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();
 await expect(page.locator('.garden-progress strong')).toHaveText('0');
 await chooseLetter(page,candidate.labelMs);expect(await attempts(page)).toEqual([older,previewAttempt]);
 await expect(page.locator('.stage-letter-title [aria-label="Siap dijejak"]')).toHaveCount(0);
 await draw(page,(await boardModels(page)).strokes[0]);await draw(page,(await boardModels(page)).strokes[1]);await tapDots(page);
 await expect.poll(async()=>(await attempts(page)).length).toBe(3);
 const saved=await attempts(page);expect(saved.slice(0,2)).toEqual([older,previewAttempt]);expect(saved[2]).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,preview:false,geometryStatus:'approved'});
 await page.reload();await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();
 await expect(page.locator('.garden-progress strong')).toHaveText('1');await chooseLetter(page,candidate.labelMs);
 await expect(page.locator('.stage-letter-title [aria-label="Siap dijejak"]')).toHaveCount(1);
 await expect(page.locator('.trace-board')).toBeVisible();expect(await attempts(page)).toEqual(saved);
});
for(const {candidate}of proposals)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: approved routes score and lanes complete independently`,async({page,browserName})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${candidate.id}&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/jim-family-straight-top-approval/test-harness.js','utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
 for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
 await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);
  expect(await board.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(candidate.geometry.strokes.map(s=>s.path));
  for(let i=0;i<2;i++)await draw(page,(await boardModels(page,board)).strokes[i]);await tapDots(page,board);
  await expect(board).toHaveAttribute('data-phase','complete');
  if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
 await expect(page.locator('.round-result')).toBeVisible();
 expect(await page.evaluate(()=>window.outlineAttempts)).toEqual(Array.from({length:count},()=>({letterId:candidate.id,contentVersion:candidate.contentVersion,geometryStatus:'approved',unscored:false})));
 await page.screenshot({path:`${root}/${browserName}-${candidate.id}-${mode}-result.png`,animations:'disabled'});
 await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
 const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:[candidate.id]});
 for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:candidate.geometry.dotTargets.length}});
});
for(const [index,{candidate}]of proposals.entries())for(const reduced of [false,true])test(`${candidate.id} demonstrations: full and remaining section, reduced motion ${reduced}`,async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await student(page,index);
 await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
 await page.evaluate(()=>{window.topDemoPaths=[];window.topDemoObserver=new MutationObserver(()=>{for(const n of document.querySelectorAll('.demonstration-ink')){const d=n.getAttribute('d');if(d&&!window.topDemoPaths.includes(d))window.topDemoPaths.push(d);}});window.topDemoObserver.observe(document.body,{subtree:true,attributes:true,childList:true});});
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await capture(page,`${browserName}-${candidate.id}-demo-${reduced}`);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 const paths=await page.evaluate(()=>window.topDemoPaths);
 for(const stroke of candidate.geometry.strokes)expect(paths).toContain(stroke.path);
 expect(await attempts(page)).toHaveLength(0);
 const top=(await boardModels(page)).strokes[0],split=Math.floor(top.length*.4);await draw(page,top.slice(0,split));
 const frontier=await page.locator('.play-fill').first().getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk bahagian ini');await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:10000});
 expect(await page.locator('.play-fill').first().getAttribute('data-measured-frontier')).toBe(frontier);expect(await attempts(page)).toHaveLength(0);
 await page.evaluate(()=>window.topDemoObserver.disconnect());
});
test('wrong-end starts and reversed tops earn no stroke; restart and early-lift recovery work',async({page})=>{
 await student(page);let top=(await boardModels(page)).strokes[0];
 await draw(page,top.toReversed());await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');
 expect(await attempts(page)).toHaveLength(0);
 await menuAction(page,'Cuba lagi');top=(await boardModels(page)).strokes[0];
 const split=Math.floor(top.length*.4);await draw(page,top.slice(0,split));await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');
 top=(await boardModels(page)).strokes[0];await draw(page,top.slice(split-1));
 await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
 await menuAction(page,'Cuba lagi');await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula','2 Ikut','3 Henti']);
 expect(await attempts(page)).toHaveLength(0);
});
for(const [index,{candidate}]of proposals.entries())test(`${candidate.id} native emulated touch: straight top, lift, bowl and dots`,async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP input emulation only.');
 await page.setViewportSize({width:768,height:1024});await student(page,index);
 const session=await context.newCDPSession(page);
 async function send(route){
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...route[0],id:1}]});
  for(const p of route.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 for(let s=0;s<2;s++)await send((await boardModels(page)).strokes[s]);
 for(const dot of (await boardModels(page)).dots)await send([dot]);
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 expect((await attempts(page))[0]).toMatchObject({pointerType:'touch',preview:false,letterId:candidate.id});
});
