import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction,tapDots} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {wauVaReviewCandidates} from '../../src/content/reviewCandidates.js';
import originals from '../fixtures/wau-va-direction-originals.json' with {type:'json'};
const candidates=letters.filter(l=>['wau','va'].includes(l.id)).map(candidate=>({candidate,original:originals.find(l=>l.id===candidate.id)})),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/wau-va-approval/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function student(page,id,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();
 }
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,letters.find(l=>l.id===id).labelMs);
 await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name){
 await boardModels(page);
 const clipped=await page.locator('.trace-board').evaluate(svg=>{
  const b=svg.getBoundingClientRect();return [...svg.querySelectorAll('.reference-stroke,.trace-number-badge,.trace-number-label-backdrop')].some(n=>{const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;});
 });expect(clipped).toBe(false);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const {candidate}of candidates)for(const [mode,width,height]of [['play',320,600],['guided',768,1024],['precision',1280,800]])test(`${candidate.id} ${mode}: approved left-first route, continuous tail, dots last`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await student(page,candidate.id,mode);
 await expect(page.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await capture(page,`${browserName}-${candidate.id}-${mode}-start`);
 if(mode==='play'){
  await expect(page.locator('.writing-cue')).toHaveText('Mula di 1. Ke kiri, kemudian naik mengikut gelung.');
  let points=(await boardModels(page)).strokes[0];expect(points[1].x).toBeLessThan(points[0].x);
  const split=Math.floor(points.length*.18);await draw(page,points.slice(0,split));await capture(page,`${browserName}-${candidate.id}-left-partial`);
  points=(await boardModels(page)).strokes[0];await draw(page,points.slice(split-1));
 }else await draw(page,(await boardModels(page)).strokes[0]);
 if(candidate.id==='va'){await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');await tapDots(page);}
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await expect.poll(async()=> (await attempts(page)).length).toBe(1);
 const saved=(await attempts(page))[0];expect(saved).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,geometryStatus:'approved',audioVersion:2,preview:false,mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.screenshot({path:`${root}/${browserName}-${candidate.id}-${mode}-complete.png`,animations:'disabled'});
 await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
for(const {candidate}of candidates)test(`${candidate.id} demonstration starts left and preserves earned progress`,async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await page.emulateMedia({reducedMotion:'no-preference'});await student(page,candidate.id);
 const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.15)));
 const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await page.evaluate(()=>{window.directionCues=[];window.directionObserver=new MutationObserver(()=>{const text=document.querySelector('.writing-cue')?.textContent;if(text&&text!==window.directionCues.at(-1))window.directionCues.push(text);});window.directionObserver.observe(document.body,{subtree:true,childList:true,characterData:true});});
 await menuAction(page,'Tunjuk cara');await expect(page.locator('path.demonstration-ink')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await capture(page,`${browserName}-${candidate.id}-demo`);await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:14000});
 const cues=await page.evaluate(()=>{window.directionObserver.disconnect();return window.directionCues;});
 expect(cues).toContain('Ke kiri, kemudian naik mengikut gelung.');expect(cues).toContain('Teruskan ekor ke kiri.');
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);expect(await attempts(page)).toHaveLength(0);
});
for(const {candidate}of candidates)for(const type of ['touch','pen'])test(`${candidate.id} native emulated ${type}: left-first route and dot`,async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP input emulation only.');
 await page.setViewportSize({width:768,height:1024});await student(page,candidate.id);
 const model=await boardModels(page),points=model.strokes[0],session=await context.newCDPSession(page);
 const send=async route=>{
  if(type==='touch'){
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...route[0],id:1}]});
   for(const point of route.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,id:1}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
   await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...route[0],pointerType:'pen'});
   await session.send('Input.dispatchMouseEvent',{type:'mousePressed',...route[0],button:'left',buttons:1,pointerType:'pen'});
   for(const point of route.slice(1))await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point,button:'left',buttons:1,pointerType:'pen'});
   await session.send('Input.dispatchMouseEvent',{type:'mouseReleased',...route.at(-1),button:'left',buttons:0,pointerType:'pen'});
  }
 };
 await send(points);if(candidate.id==='va'){await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');for(const dot of model.dots)await send([dot]);}
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await expect.poll(async()=> (await attempts(page)).length).toBe(1);
 expect((await attempts(page))[0]).toMatchObject({pointerType:type,letterId:candidate.id,contentVersion:candidate.contentVersion,preview:false,geometryStatus:'approved'});
 await page.screenshot({path:`${root}/chromium-${candidate.id}-native-${type}.png`,animations:'disabled'});
});
test('reversing the head preserves its visible shape',async({page})=>{
 await page.goto('/');
 const differences=await page.evaluate(pairs=>pairs.map(({original,candidate})=>{
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1000;const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const mask=path=>{ctx.clearRect(0,0,1000,1000);ctx.lineWidth=50;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(path));const data=ctx.getImageData(0,0,1000,1000).data;return Array.from({length:1000000},(_,i)=>data[i*4+3]>127);};
  const a=mask(original.geometry.strokes[0].path),b=mask(candidate.geometry.strokes[0].path);let changed=0,ink=0;for(let i=0;i<a.length;i++){if(a[i]!==b[i])changed++;if(a[i]||b[i])ink++;}return{id:candidate.id,changed,ink,ratio:changed/ink};
 }),wauVaReviewCandidates(originals));
 for(const result of differences)expect(result.ratio,JSON.stringify(result)).toBeLessThan(.003);
 console.log('Head/tail raster comparison:',JSON.stringify(differences));
});
test('approved Wau/Va proposals expire from adult review',async({page})=>{
 expect(wauVaReviewCandidates(letters)).toEqual([]);await page.goto('/');await dismissSplash(page);
 await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
 await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('wau-va-direction');
 await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
 await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
});
for(const {candidate}of candidates)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: approved route scores independently`,async({page,browserName})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${candidate.id}&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/wau-va-approval/test-harness.js','utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
 for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
 await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);await expect(board.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
  await draw(page,(await boardModels(page,board)).strokes[0]);if(candidate.id==='va')await tapDots(page,board);
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

