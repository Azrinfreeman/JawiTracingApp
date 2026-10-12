import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction,tapDots} from './helpers/tracing.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import originals from '../fixtures/ta-za-straight-pillar-originals.json' with {type:'json'};
import {taZaStraightPillarReviewCandidates} from '../../src/content/reviewCandidates.js';

const models=originals.map(original=>({original,candidate:letters.find(l=>l.id===original.id)}));
const root='output/verification/ta-za-reference-approval/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function student(page,candidate,mode='play'){
 await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,candidate.labelMs);
 await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name,board=page.locator('.trace-board')){
 await boardModels(page,board);const fit=await board.evaluate(svg=>{const b=svg.getBoundingClientRect();return{clipped:[...svg.querySelectorAll('.reference-outline,.trace-number-badge,.trace-number-label-backdrop')].some(n=>{const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;}),overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight+1};});
 expect(fit).toEqual({clipped:false,overflow:false});await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
async function finish(page,board=page.locator('.trace-board')){
 for(let i=0;i<2;i++)await draw(page,(await boardModels(page,board)).strokes[i]);await tapDots(page,board);
}
for(const {candidate}of models)for(const [mode,width,height]of [['play',320,740],['guided',768,1024],['precision',1280,800]])test(`${candidate.id} ${mode}: exact approved outline, downward pillar, dot-last and persisted student credit`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await student(page,candidate,mode);
 await expect(page.locator('.reference-outline').first()).toHaveAttribute('d',candidate.geometry.appearance.bodyContours.join(' '));
 for(let i=0;i<2;i++)await expect(page.locator('.reference-stroke').nth(i)).toHaveAttribute('d',candidate.geometry.strokes[i].path);
 await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula','2 Ikut','3 Henti']);await capture(page,`${browserName}-${candidate.id}-${mode}-start`);
 await draw(page,(await boardModels(page)).strokes[0]);
 await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
 await expect(page.locator('.trace-number-label')).toHaveText(['4 Mula','5 Ikut',candidate.id==='tho'?'6 Siap':'6 Henti']);await capture(page,`${browserName}-${candidate.id}-${mode}-pillar`);
 if(mode==='play'){
  let route=(await boardModels(page)).strokes[1];await draw(page,route.toReversed());await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
  await menuAction(page,'Cuba lagi');await draw(page,(await boardModels(page)).strokes[0]);route=(await boardModels(page)).strokes[1];const split=Math.floor(route.length*.4);
  await draw(page,route.slice(0,split));await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');route=(await boardModels(page)).strokes[1];await draw(page,route.slice(split-1));
 }else await draw(page,(await boardModels(page)).strokes[1]);
 if(candidate.id==='za'){
  await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');expect(await attempts(page)).toEqual([]);
  await expect(page.locator('.trace-number-label')).toHaveText(['7 Titik akhir']);await tapDots(page);
 }
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await capture(page,`${browserName}-${candidate.id}-${mode}-complete`);
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);const saved=(await attempts(page))[0];
 expect(saved).toMatchObject({letterId:candidate.id,contentVersion:9,preview:false,geometryStatus:'approved',audioStatus:'approved',mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.reload();expect(await attempts(page)).toEqual([saved]);await dismissSplash(page);
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('1');await chooseLetter(page,candidate.labelMs);
 await expect(page.locator('.preview-banner')).toHaveCount(0);await expect(page.locator('.reference-outline').first()).toHaveAttribute('d',candidate.geometry.appearance.bodyContours.join(' '));
});
test('approved Ta and Za candidate cards expire',async({page,browserName})=>{
 expect(taZaStraightPillarReviewCandidates(letters)).toEqual([]);await page.setViewportSize({width:768,height:1024});await page.goto('/');await dismissSplash(page);
 await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('ta-za-straight-pillar');
 await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
 await page.screenshot({path:`${root}/${browserName}-review-expired.png`,animations:'disabled'});
});
for(const {candidate}of models)test(`${candidate.id}: native emulated touch completes both strokes and the separate dot`,async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP native touch only.');await page.setViewportSize({width:768,height:1024});await student(page,candidate);const session=await context.newCDPSession(page);
 async function send(route){await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...route[0],id:1}]});for(const p of route.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 for(let i=0;i<2;i++)await send((await boardModels(page)).strokes[i]);
 for(const dot of (await boardModels(page)).dots){await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');await send([dot]);}
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 expect((await attempts(page))[0]).toMatchObject({letterId:candidate.id,contentVersion:9,preview:false,pointerType:'touch',geometryStatus:'approved'});
});
for(const {original,candidate}of models)test(`${candidate.id}: old and preview history stays stored without granting current student credit`,async({page})=>{
 await student(page,candidate);await finish(page);await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 const current=(await attempts(page))[0],older={...current,id:`old-${candidate.id}`,contentVersion:original.contentVersion},pending={...current,id:`preview-${candidate.id}`,preview:true,geometryStatus:'pendingReview'};
 await page.evaluate(records=>{const stored=JSON.parse(localStorage.getItem('taman-jawi.progress.v1'));stored.attempts=records;localStorage.setItem('taman-jawi.progress.v1',JSON.stringify(stored));},[older,pending]);
 await page.reload();await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('0');await chooseLetter(page,candidate.labelMs);expect(await attempts(page)).toEqual([older,pending]);
 await finish(page);await expect.poll(async()=>(await attempts(page)).length).toBe(3);expect((await attempts(page)).slice(0,2)).toEqual([older,pending]);
 expect((await attempts(page))[2]).toMatchObject({letterId:candidate.id,contentVersion:9,preview:false,geometryStatus:'approved'});
 await page.reload();await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('1');
});
for(const {candidate}of models)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: approved outline scores and lanes finish independently`,async({page,browserName})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${candidate.id}&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/ta-za-reference-approval/test-harness.js','utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
 for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);await expect(board.locator('.reference-outline').first()).toHaveAttribute('d',candidate.geometry.appearance.bodyContours.join(' '));
  for(let i=0;i<2;i++)await expect(board.locator('.reference-stroke').nth(i)).toHaveAttribute('d',candidate.geometry.strokes[i].path);
  await capture(page,`${browserName}-${candidate.id}-${mode}-lane-${slot}`,board);await finish(page,board);await expect(board).toHaveAttribute('data-phase','complete');
  if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
 await expect(page.locator('.round-result')).toBeVisible();expect(await page.evaluate(()=>window.outlineAttempts)).toEqual(Array.from({length:count},()=>({letterId:candidate.id,contentVersion:9,geometryStatus:'approved',unscored:false})));
 await page.screenshot({path:`${root}/${browserName}-${candidate.id}-${mode}-result.png`,animations:'disabled'});
 await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
 const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:[candidate.id]});for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:candidate.geometry.dotTargets.length}});
});
