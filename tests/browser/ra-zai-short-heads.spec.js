import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction,tapDots} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {raZaiShortHeadReviewCandidates} from '../../src/content/reviewCandidates.js';
import originals from '../fixtures/ra-zai-short-head-originals.json' with {type:'json'};
const proposals=raZaiShortHeadReviewCandidates(originals).map(p=>({...p,candidate:letters.find(l=>l.id===p.candidate.id)})),root='output/verification/ra-zai-short-head-approval/browser';mkdirSync(root,{recursive:true});
test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function review(page,mode='play',index=0){
 await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
 await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('ra-zai-short-head');
 if(index)await page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();
}
async function student(page,index=0,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,proposals[index].candidate.labelMs);
 await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name){
 await boardModels(page);const fit=await page.locator('.trace-board').evaluate(svg=>{const b=svg.getBoundingClientRect();return{clipped:[...svg.querySelectorAll('.reference-outline,.trace-number-badge,.trace-number-label-backdrop')].some(n=>{const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;}),overflow:document.documentElement.scrollWidth>innerWidth};});
 expect(fit).toEqual({clipped:false,overflow:false});await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const [index,{candidate}]of proposals.entries())for(const [mode,width,height]of [['play',320,600],['guided',768,1024],['precision',1280,800]])test(`${candidate.id} ${mode}: approved shorter outline, continuous tracing, dot-last and student save`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await student(page,index,mode);
 expect(await page.locator('.reference-stroke').first().getAttribute('d')).toBe(candidate.geometry.strokes[0].path);
 expect(await page.locator('.reference-outline').first().getAttribute('d')).toBe(candidate.geometry.appearance.parts[0].contours.join(' '));
 await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula','2 Ikut',candidate.id==='ra'?'3 Siap':'3 Henti']);
 await capture(page,`${browserName}-${candidate.id}-${mode}-start`);
 const points=(await boardModels(page)).strokes[0];
 if(mode==='play'){
  await draw(page,points.toReversed());await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');await menuAction(page,'Cuba lagi');
  let route=(await boardModels(page)).strokes[0],split=Math.floor(route.length*.35);await draw(page,route.slice(0,split));await capture(page,`${browserName}-${candidate.id}-partial`);
  route=(await boardModels(page)).strokes[0];await draw(page,route.slice(split-1));
 }else await draw(page,points);
 if(candidate.id==='zai'){await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');expect(await attempts(page)).toHaveLength(0);await capture(page,`${browserName}-zai-${mode}-dot`);await tapDots(page);}
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await capture(page,`${browserName}-${candidate.id}-${mode}-finished`);
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);const saved=(await attempts(page))[0];
 expect(saved).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,preview:false,geometryStatus:'approved',audioStatus:'approved',mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.reload();expect(await attempts(page)).toContainEqual(saved);
 await dismissSplash(page);
 // Reload resets the teacher's session-only practice selection to Jejak Ceria.
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('1');await chooseLetter(page,candidate.labelMs);
 expect(await page.locator('.reference-stroke').first().getAttribute('d')).toBe(letters.find(l=>l.id===candidate.id).geometry.strokes[0].path);await expect(page.locator('.preview-banner')).toHaveCount(0);
});
for(const [index,{candidate}]of proposals.entries())test(`${candidate.id}: demonstration follows shortened route and preserves partial progress`,async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await student(page,index);const pts=(await boardModels(page)).strokes[0];await draw(page,pts.slice(0,Math.floor(pts.length*.25)));
 const frontier=await page.locator('.play-fill').getAttribute('data-measured-frontier');await menuAction(page,'Tunjuk cara');
 await expect(page.locator('.outline-demonstration').first()).toHaveAttribute('data-part-id','stroke-1');
 await expect(page.locator('.outline-demonstration path').first()).toHaveAttribute('d',candidate.geometry.appearance.parts[0].contours.join(' '));await capture(page,`${browserName}-${candidate.id}-demo`);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:25000});expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(frontier);expect(await attempts(page)).toEqual([]);
});
test('approved Ra/Zai proposal cards expire from adult comparison',async({page,browserName})=>{
 expect(raZaiShortHeadReviewCandidates(letters)).toEqual([]);await page.setViewportSize({width:768,height:1024});await review(page);
 await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
 await page.screenshot({path:`${root}/${browserName}-review-expired.png`,animations:'disabled'});
});
for(const [index,{candidate}]of proposals.entries())test(`${candidate.id}: native touch traces the new cap and separate dot`,async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP touch only.');await page.setViewportSize({width:768,height:1024});await student(page,index);const session=await context.newCDPSession(page);
 async function send(route){await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...route[0],id:1}]});for(const p of route.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await send((await boardModels(page)).strokes[0]);for(const dot of (await boardModels(page)).dots)await send([dot]);await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);expect((await attempts(page))[0]).toMatchObject({letterId:candidate.id,preview:false,pointerType:'touch'});
});
for(const [index,{original,candidate}]of proposals.entries())test(`${candidate.id}: old and preview history survives while only current approved work grants credit`,async({page})=>{
 await student(page,index);await draw(page,(await boardModels(page)).strokes[0]);await tapDots(page);await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 const current=(await attempts(page))[0],older={...current,id:`old-${candidate.id}`,contentVersion:original.contentVersion},pending={...current,id:`preview-${candidate.id}`,preview:true,geometryStatus:'pendingReview'};
 await page.evaluate(records=>{const stored=JSON.parse(localStorage.getItem('taman-jawi.progress.v1'));stored.attempts=records;localStorage.setItem('taman-jawi.progress.v1',JSON.stringify(stored));},[older,pending]);
 await page.reload();await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('0');await chooseLetter(page,candidate.labelMs);expect(await attempts(page)).toEqual([older,pending]);
 await draw(page,(await boardModels(page)).strokes[0]);await tapDots(page);await expect.poll(async()=>(await attempts(page)).length).toBe(3);expect((await attempts(page)).slice(0,2)).toEqual([older,pending]);
 expect((await attempts(page))[2]).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,preview:false,geometryStatus:'approved'});
 await page.reload();await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('1');
});
for(const {candidate}of proposals)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: exact approved outline scores and lanes complete independently`,async({page,browserName})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${candidate.id}&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/ra-zai-short-head-approval/test-harness.js','utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
 for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){const board=page.locator('.trace-board').nth(slot);expect(await board.locator('.reference-stroke').first().getAttribute('d')).toBe(candidate.geometry.strokes[0].path);
  expect(await board.locator('.reference-outline').first().getAttribute('d')).toBe(candidate.geometry.appearance.parts[0].contours.join(' '));await draw(page,(await boardModels(page,board)).strokes[0]);await tapDots(page,board);await expect(board).toHaveAttribute('data-phase','complete');
  if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
 await expect(page.locator('.round-result')).toBeVisible();expect(await page.evaluate(()=>window.outlineAttempts)).toEqual(Array.from({length:count},()=>({letterId:candidate.id,contentVersion:candidate.contentVersion,geometryStatus:'approved',unscored:false})));
 await page.screenshot({path:`${root}/${browserName}-${candidate.id}-${mode}-result.png`,animations:'disabled'});
 await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
 const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:[candidate.id]});for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:candidate.geometry.dotTargets.length}});
});
