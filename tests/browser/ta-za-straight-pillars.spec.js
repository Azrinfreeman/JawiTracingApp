import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction,tapDots} from './helpers/tracing.js';
import {mkdirSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {taZaStraightPillarReviewCandidates} from '../../src/content/reviewCandidates.js';

const proposals=taZaStraightPillarReviewCandidates(letters);
const root='output/verification/ta-za-photo-reference/browser';mkdirSync(root,{recursive:true});
test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function review(page,index=0,mode='play'){
 await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
 await page.getByRole('tab',{name:'Huruf',exact:true}).click();
 await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 await page.getByLabel('Jenis semakan').selectOption('ta-za-straight-pillar');
 if(index)await page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();
}
async function preview(page,index=0,mode='play'){
 await review(page,index,mode);await page.getByRole('button',{name:`Semak ${proposals[index].candidate.labelMs} cadangan`,exact:true}).click();
 await expect(page.locator('.preview-banner')).toBeVisible();await boardModels(page);
}
async function capture(page,name){
 await boardModels(page);const fit=await page.locator('.trace-board').evaluate(svg=>{
  const b=svg.getBoundingClientRect();return{clipped:[...svg.querySelectorAll('.reference-outline,.trace-number-badge,.trace-number-label-backdrop')].some(n=>{
   const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;
  }),overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight+1};
 });expect(fit).toEqual({clipped:false,overflow:false});
 await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}

test('adult comparison shows two revisions and a straight candidate pillar without changing the original',async({page,browserName})=>{
 await page.setViewportSize({width:1024,height:768});await review(page);
 if(!proposals.length){await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');return;}
 for(let index=0;index<2;index++){
  const {candidate,original}=proposals[index];
  await expect(page.locator('.model-comparison-pair strong')).toHaveText([`Asal · versi ${original.contentVersion}`,`Cadangan · versi ${candidate.contentVersion}`]);
  const models=page.locator('.model-comparison-pair svg');
  await expect(models.nth(0).locator('path').nth(1)).toHaveAttribute('d',original.geometry.strokes[1].path);
  await expect(models.nth(1).locator('path').first()).toHaveAttribute('d',candidate.geometry.appearance.bodyContours.join(' '));
  await page.screenshot({path:`${root}/${browserName}-${candidate.id}-comparison.png`,animations:'disabled'});
  if(index===0)await page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();
 }expect(await attempts(page)).toEqual([]);
});

for(const [index,{candidate,original}]of proposals.entries())for(const [mode,width,height]of [['play',320,740],['play',1024,768],['guided',768,1024],['precision',1280,800]])test(`${candidate.id} ${mode} ${width}x${height}: downward pillar, dot-last and preview credit isolation`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await preview(page,index,mode);
 await expect(page.locator('.reference-stroke').nth(1)).toHaveAttribute('d',candidate.geometry.strokes[1].path);
 await expect(page.locator('.reference-stroke').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await expect(page.locator('.reference-outline').first()).toHaveAttribute('d',candidate.geometry.appearance.bodyContours.join(' '));
 await draw(page,(await boardModels(page)).strokes[0]);
 await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
 await expect(page.locator('.trace-number-label')).toHaveText(['4 Mula','5 Ikut',candidate.id==='tho'?'6 Siap':'6 Henti']);
 if(mode==='play')await expect(page.locator('.writing-cue')).toContainText('Tarik satu garis lurus ke bawah');
 const points=(await boardModels(page)).strokes[1];
 expect(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))).toBeLessThan(.1);
 expect(points.at(-1).y).toBeGreaterThan(points[0].y);
 await capture(page,`${browserName}-${candidate.id}-${mode}-${width}-pillar`);
 await draw(page,(await boardModels(page)).strokes[1]);
 if(candidate.id==='za'){
  await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');
  await expect(page.locator('.trace-number-label')).toHaveText(['7 Titik akhir']);
  expect(await attempts(page)).toEqual([]);await tapDots(page);
 }
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await capture(page,`${browserName}-${candidate.id}-${mode}-${width}-complete`);
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 const saved=(await attempts(page))[0];expect(saved).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,preview:true,geometryStatus:'pendingReview',audioStatus:'approved',mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.reload();expect(await attempts(page)).toEqual([saved]);await dismissSplash(page);
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('0');
 await chooseLetter(page,candidate.labelMs);await expect(page.locator('.preview-banner')).toHaveCount(0);
 await expect(page.locator('.reference-stroke').nth(1)).toHaveAttribute('d',original.geometry.strokes[1].path);
});

for(const [index,{candidate}]of proposals.entries())test(`${candidate.id}: reversed starts rejected; partial pillar resumes and demonstrations preserve credit`,async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await preview(page,index);
 // Observe the actual marker once the outline pillar's reveal plane starts moving.
 await page.evaluate(()=>{
  window.pillarDemo=[];window.pillarDemoComplete=false;window.pillarObserver=new MutationObserver(()=>{
   const group=document.querySelector('.outline-demonstration[data-part-id="stroke-2"]');
   const cut=group?.querySelector('clipPath:last-child path')?.getAttribute('d'),marker=document.querySelector('.demo-marker');
   if(group?.querySelector('.outline-ink')?.getAttribute('display')==='inline')window.pillarDemoComplete=true;
   if(cut&&marker?.getAttribute('opacity')==='1')window.pillarDemo.push({x:+marker.getAttribute('cx'),y:+marker.getAttribute('cy')});
  });window.pillarObserver.observe(document.querySelector('.trace-board'),{subtree:true,childList:true,attributes:true});
 });
 await menuAction(page,'Tunjuk cara');await expect.poll(()=>page.evaluate(()=>window.pillarDemo.length)).toBeGreaterThan(2);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 const {demo,complete}=await page.evaluate(()=>{window.pillarObserver.disconnect();return {demo:window.pillarDemo,complete:window.pillarDemoComplete};});
 expect(demo.every(p=>Math.abs(p.x-387.6)<.1)).toBe(true);
 // RAF can skip marker frames. Check downward motion and the exact completed reveal
 // independently instead of requiring a frame within a few pixels of the endpoint.
 expect(complete).toBe(true);
 expect(demo.every((p,i)=>p.y>=194.4&&p.y<=609.3&&(!i||p.y>=demo[i-1].y))).toBe(true);
 expect(Math.max(...demo.map(p=>p.y))-Math.min(...demo.map(p=>p.y))).toBeGreaterThan(207);
 expect(await attempts(page)).toEqual([]);
 await draw(page,(await boardModels(page)).strokes[0]);let route=(await boardModels(page)).strokes[1];
 await draw(page,route.toReversed());await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
 // Restart removes the rejected gesture and returns to the retained body.
 await menuAction(page,'Cuba lagi');await draw(page,(await boardModels(page)).strokes[0]);
 route=(await boardModels(page)).strokes[1];const split=Math.floor(route.length*.4);await draw(page,route.slice(0,split));
 const frontier=await page.locator('.play-fill').nth(1).getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk bahagian ini');await expect(page.locator('.outline-demonstration .outline-ink').first()).toHaveAttribute('d',candidate.geometry.appearance.parts[1].contours.join(' '));
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:10000});
 expect(await page.locator('.play-fill').nth(1).getAttribute('data-measured-frontier')).toBe(frontier);
 expect(await attempts(page)).toEqual([]);await capture(page,`${browserName}-${candidate.id}-partial-pillar`);
 route=(await boardModels(page)).strokes[1];await draw(page,route.slice(split-1));
 await tapDots(page);await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
});

for(const [index,{candidate}]of proposals.entries())test(`${candidate.id}: native emulated touch descends the pillar and requires a separate dot`,async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP input emulation only.');
 await page.setViewportSize({width:768,height:1024});await preview(page,index);
 const session=await context.newCDPSession(page);
 async function send(route){
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...route[0],id:1}]});
  for(const p of route.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 await send((await boardModels(page)).strokes[0]);await send((await boardModels(page)).strokes[1]);
 if(candidate.id==='za')await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');
 for(const dot of (await boardModels(page)).dots)await send([dot]);
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 expect((await attempts(page))[0]).toMatchObject({pointerType:'touch',preview:true,letterId:candidate.id});
});
