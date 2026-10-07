import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {sadDadReviewCandidates} from '../../src/content/reviewCandidates.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {mkdirSync,readFileSync} from 'node:fs';
const proposals=letters.filter(l=>['sad','dad'].includes(l.id)).map(candidate=>({candidate})),root='output/verification/sad-dad-approval/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function student(page,candidate,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,candidate.labelMs);await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name){
 await boardModels(page);const fit=await page.locator('.trace-board').evaluate(svg=>{
  const b=svg.getBoundingClientRect(),nodes=[...svg.querySelectorAll('.reference-outline,.trace-number-badge,.trace-number-label-backdrop')];
  return{clipped:nodes.some(n=>{const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;}),overflow:document.documentElement.scrollWidth>innerWidth};
 });expect(fit).toEqual({clipped:false,overflow:false});await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const {candidate}of proposals)for(const [mode,width,height]of [['play',320,600],['guided',768,1024],['precision',1280,800]])test(`${candidate.id} ${mode}: exact outline, both movements and dot-last student completion`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await student(page,candidate,mode);await capture(page,`${browserName}-${candidate.id}-${mode}-start`);
 expect(await page.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(candidate.geometry.strokes.map(s=>s.path));
 if(mode==='play'){
  await draw(page,(await boardModels(page)).strokes[1]);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');await menuAction(page,'Cuba lagi');
  const points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.35);await draw(page,points.slice(0,split));await expect(page.locator('.outline-progress > g > path').first()).toBeHidden();await capture(page,`${browserName}-${candidate.id}-partial`);await draw(page,(await boardModels(page)).strokes[0].slice(split-1));
 }else await draw(page,(await boardModels(page)).strokes[0]);
 await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');expect(await attempts(page)).toEqual([]);await capture(page,`${browserName}-${candidate.id}-${mode}-bowl-start`);
 await draw(page,(await boardModels(page)).strokes[1]);
 if(candidate.geometry.dotTargets.length){expect(await attempts(page)).toEqual([]);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');await capture(page,`${browserName}-${candidate.id}-${mode}-dot`);await tapDots(page);await expect(page.locator('.validated-dot.outline-dot')).toHaveCount(1);}
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await page.screenshot({path:`${root}/${browserName}-${candidate.id}-${mode}-whole.png`,animations:'disabled'});await expect(page.locator('.book-completed')).toBeVisible();
 const saved=(await attempts(page)).at(-1);expect(saved).toMatchObject({letterId:candidate.id,contentVersion:3,geometryStatus:'approved',audioVersion:2,preview:false,mode});await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
for(const {candidate}of proposals)test(`${candidate.id}: demonstration preserves partial progress`,async({page})=>{
 await page.setViewportSize({width:768,height:1024});await student(page,candidate);const pts=(await boardModels(page)).strokes[0];await draw(page,pts.slice(0,Math.floor(pts.length*.25)));const frontier=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.outline-demonstration').first()).toBeVisible();await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:25000});expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(frontier);expect(await attempts(page)).toEqual([]);
});
for(const {candidate:original}of proposals)test(`${original.id}: approved student outline is active`,async({page})=>{
 await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,original.labelMs);await expect(page.locator('.preview-banner')).toHaveCount(0);
 expect(await page.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(original.geometry.strokes.map(s=>s.path));await expect(page.locator('.reference-outline')).toHaveCount(1+original.geometry.dotTargets.length);
});
for(const {candidate}of proposals)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: scored independent corrected outlines`,async({page})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${candidate.id}&mode=${mode}`);await page.addScriptTag({content:readFileSync('output/verification/sad-dad-approval/test-harness.js','utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){const board=page.locator('.trace-board').nth(slot);for(let stroke=0;stroke<2;stroke++)await draw(page,(await boardModels(page,board)).strokes[stroke]);await tapDots(page,board);await expect(board).toHaveAttribute('data-phase','complete');if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');}
 await expect(page.locator('.round-result')).toBeVisible();expect(await page.evaluate(()=>window.outlineAttempts)).toEqual(Array.from({length:count},()=>({letterId:candidate.id,contentVersion:3,geometryStatus:'approved',unscored:false})));await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
 const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:[candidate.id]});for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:candidate.geometry.dotTargets.length}});
});

test('all nine review scopes expire after Sad and Dad approval',async({page})=>{
 await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 for(const scope of ['video','outline','ain-outline','direction','ha-direction','sin-syin-tail','ta-za-stem','nya-tip','sad-dad-outline']){await page.getByLabel('Jenis semakan').selectOption(scope);await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);}
});
