import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {mkdirSync,readFileSync} from 'node:fs';
const approved=letters.filter(letter=>['tho','za'].includes(letter.id)),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/ta-za-approval/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function student(page,candidate,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,candidate.labelMs);await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name){
 await boardModels(page);
 const fit=await page.locator('.trace-board').evaluate(svg=>{
  const stage=svg.getBoundingClientRect(),rect=n=>n.getBoundingClientRect(),inside=n=>{const r=rect(n);return r.left>=stage.left-1&&r.right<=stage.right+1&&r.top>=stage.top-1&&r.bottom<=stage.bottom+1;};
  const overlap=(a,b)=>{const x=rect(a),y=rect(b);return x.left<y.right&&y.left<x.right&&x.top<y.bottom&&y.top<x.bottom;};
  const labels=[...svg.querySelectorAll('.trace-number-label-backdrop')],controls=[...document.querySelectorAll('.stage-menu-button,.stage-badge,.stage-cue')];
  return {inside:[...labels,...svg.querySelectorAll('.trace-number-badge')].every(inside),controlsClear:labels.every(n=>controls.every(c=>!overlap(n,c))),overflow:document.documentElement.scrollWidth>innerWidth};
 });expect(fit).toEqual({inside:true,controlsClear:true,overflow:false});await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const candidate of approved)for(const mode of ['play','guided','precision'])test(`${candidate.id} ${mode}: approved closer stem, whole letter and current student save`,async({page,browserName})=>{
 await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await student(page,candidate,mode);
 expect(await page.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(candidate.geometry.strokes.map(s=>s.path));
 if(candidate.id==='za')await expect(page.locator('.reference-dot')).toHaveAttribute('cx','552');
 await expect(page.locator('.trace-number-guide[data-number="3"]')).toHaveAttribute('data-anchor-x','310');
 await draw(page,(await boardModels(page)).strokes[0]);await expect(page.locator('.book-completed')).toHaveCount(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
 expect(+(await page.locator('.trace-number-guide[data-number="4"]').getAttribute('data-anchor-x'))).toBeCloseTo(387.6,3);
 await capture(page,`${browserName}-${candidate.id}-${mode}-stem`);
 await draw(page,(await boardModels(page)).strokes[1]);
 if(candidate.geometry.dotTargets.length){await expect(page.locator('.book-completed')).toHaveCount(0);expect(await attempts(page)).toHaveLength(0);await tapDots(page);}
 await expect(page.locator('.book-completed')).toBeVisible();
 const saved=(await attempts(page)).at(-1);expect(saved).toMatchObject({letterId:candidate.id,contentVersion:6,geometryStatus:'approved',audioStatus:'approved',preview:false,mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.screenshot({path:`${root}/${browserName}-${candidate.id}-${mode}-complete.png`,animations:'disabled'});
 await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
for(const candidate of approved)test(`${candidate.id}: approved stem demonstration preserves earned progress`,async({page})=>{
 await page.setViewportSize({width:768,height:1024});await student(page,candidate);await page.emulateMedia({reducedMotion:'no-preference'});
 await draw(page,(await boardModels(page)).strokes[0]);const stem=(await boardModels(page)).strokes[1];await draw(page,stem.slice(0,Math.floor(stem.length*.25)));
 const before=await page.locator('.play-fill').nth(1).getAttribute('data-measured-frontier');await menuAction(page,'Tunjuk bahagian ini');
 await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[1].path);await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').nth(1).getAttribute('data-measured-frontier')).toBe(before);expect(await attempts(page)).toHaveLength(0);await expect(page.locator('.book-completed')).toHaveCount(0);
});
for(const [width,height]of [[320,600],[1280,800]])test(`review ${width}: matching approvals and no current proposals in all six scopes`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();await expect(page.locator('.record-grid-host')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await settle(page);
 for(const candidate of approved){
  const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:candidate.labelMs,exact:true})}),next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true}),previous=page.getByRole('button',{name:'Halaman kandungan sebelumnya',exact:true});
  for(let i=0;i<40&&!(await card.isVisible())&&await previous.isEnabled();i++){await previous.click();await settle(page);}
  for(let i=0;i<40&&!(await card.isVisible())&&await next.isEnabled();i++){await next.click();await settle(page);}await expect(card).toContainText('Diluluskan · 6');
 }
 await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 for(const scope of ['video','outline','ain-outline','direction','sin-syin-tail','ta-za-stem']){await page.getByLabel('Jenis semakan').selectOption(scope);await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.screenshot({path:`${root}/${browserName}-all-approved-${width}.png`,animations:'disabled'});
});
const harnessRoot=process.env.JAWI_OUTLINE_HARNESS_DIR||'output/verification/ta-za-approval';
for(const candidate of approved)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: approved scored lanes complete independently`,async({page})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${candidate.id}&mode=${mode}`);await page.addScriptTag({content:readFileSync(`${harnessRoot}/test-harness.js`,'utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);expect(await board.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(candidate.geometry.strokes.map(s=>s.path));
  for(let i=0;i<candidate.geometry.strokes.length;i++)await draw(page,(await boardModels(page,board)).strokes[i]);await tapDots(page,board);await expect(board).toHaveAttribute('data-phase','complete');if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
 await expect(page.locator('.round-result')).toBeVisible();const saved=await page.evaluate(()=>window.outlineAttempts);expect(saved).toHaveLength(count);for(const attempt of saved)expect(attempt).toEqual({letterId:candidate.id,contentVersion:6,geometryStatus:'approved',unscored:false});
 for(const text of await page.locator('.round-score-grid strong').allTextContents())expect(text).not.toContain('—');
 await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:[candidate.id]});for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:candidate.geometry.dotTargets.length}});
});
