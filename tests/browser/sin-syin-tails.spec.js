import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument,voices} from './helpers/audio.js';
import {sinSyinTailReviewCandidates} from '../../src/content/reviewCandidates.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {mkdirSync,readFileSync} from 'node:fs';

import originals from '../fixtures/sin-syin-tail-originals.json' with {type:'json'};
const proposals=letters.filter(letter=>['sin','syin'].includes(letter.id)).map(candidate=>({candidate,original:originals.find(original=>original.id===candidate.id)}));
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/sin-syin-tail-approval/browser';
mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts);

async function openCandidate(page,label,mode='play'){
  await page.goto('/');await dismissSplash(page);
  if(mode!=='play'){
    await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button',{name:'Kembali',exact:true}).click();
  }
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,label);
  await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name){
  await boardModels(page);
  const result=await page.locator('.trace-board').evaluate(svg=>{
    const box=svg.getBoundingClientRect(),r=n=>n.getBoundingClientRect();
    const inside=n=>{const b=r(n);return b.left>=box.left-1&&b.right<=box.right+1&&b.top>=box.top-1&&b.bottom<=box.bottom+1;};
    const controls=[...document.querySelectorAll('.stage-menu-button,.stage-badge,.stage-cue')];
    const labels=[...svg.querySelectorAll('.trace-number-label-backdrop')];
    const overlap=(a,b)=>{const x=r(a),y=r(b);return x.left<y.right&&y.left<x.right&&x.top<y.bottom&&y.top<x.bottom;};
    return {inside:[...labels,...svg.querySelectorAll('.trace-number-badge')].every(inside),
      controlsClear:labels.every(label=>controls.every(control=>!overlap(label,control))),overflow:document.documentElement.scrollWidth>innerWidth};
  });expect(result).toEqual({inside:true,controlsClear:true,overflow:false});
  await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}

for(const {candidate}of proposals)for(const mode of ['play','guided','precision'])
test(`${candidate.id} ${mode}: raised finish, whole body and correct dot gate`,async({page,browserName})=>{
  await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await instrument(page);
  await openCandidate(page,candidate.labelMs,mode);
  await expect(page.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
  await expect(page.locator('.trace-number-guide[data-number="3"]')).toHaveAttribute('data-anchor-y','510');
  const second=+(await page.locator('.trace-number-guide[data-number="2"]').getAttribute('data-anchor-y'));
  expect(510-second).toBeGreaterThan(60);
  if(mode==='play'){
    await capture(page,`${browserName}-${candidate.id}-phone-start`);
    let points=(await boardModels(page)).strokes[0];await page.mouse.click(points.at(-1).x,points.at(-1).y);
    await expect(page.locator('.book-completed')).toHaveCount(0);await menuAction(page,'Cuba lagi');
    points=(await boardModels(page)).strokes[0];const split=Math.floor(points.length*.25);await draw(page,points.slice(0,split));
    const frontier=await page.locator('.play-fill').getAttribute('data-measured-frontier');
    await page.locator('.stage-badge').getByRole('button',{name:`Dengar nama ${candidate.labelMs}`,exact:true}).click();
    expect((await voices(page)).at(-1).src).toBe(candidate.audio.name.src);
    expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(frontier);
    await draw(page,(await boardModels(page)).strokes[0].slice(split-1));
  }else await draw(page,(await boardModels(page)).strokes[0]);
  if(candidate.geometry.dotTargets.length){
    await expect(page.locator('.book-completed')).toHaveCount(0);
    const dots=(await boardModels(page)).dots;
    for(const dot of dots.slice(0,-1))await page.mouse.click(dot.x,dot.y);
    expect(await attempts(page)).toHaveLength(0);await page.mouse.click(dots.at(-1).x,dots.at(-1).y);
  }
  await expect(page.locator('.book-completed')).toBeVisible();
  expect((await attempts(page)).at(-1)).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,
    geometryStatus:'approved',audioStatus:'approved',preview:false,mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
  await capture(page,`${browserName}-${candidate.id}-${mode}-complete`);
});

for(const {candidate}of proposals)test(`${candidate.id}: demonstration follows the higher tail without completing the pupil's attempt`,async({page})=>{
  await page.setViewportSize({width:768,height:1024});await page.emulateMedia({reducedMotion:'no-preference'});await instrument(page);
  await openCandidate(page,candidate.labelMs);
  const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.25)));
  const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
  await menuAction(page,'Tunjuk cara');
  await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
  await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
  expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);expect(await attempts(page)).toHaveLength(0);
  await expect(page.locator('.trace-number-guide[data-number="3"]')).toHaveAttribute('data-anchor-y','510');
});

for(const [width,height]of [[320,600],[768,1024]])test(`approved tail review ${width}: matching revisions and obsolete proposals removed`,async({page,browserName})=>{
  await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
  for(const {candidate}of proposals){
    const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:candidate.labelMs,exact:true})});
    const next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true});
    for(let i=0;i<40&&!(await card.isVisible())&&await next.isEnabled();i++)await next.click();
    await expect(card).toContainText(`Diluluskan · ${candidate.contentVersion}`);
  }
  await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('sin-syin-tail');
  await expect(page.locator('.empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
  expect(sinSyinTailReviewCandidates(letters)).toEqual([]);
  await page.screenshot({path:`${root}/${browserName}-approved-review-${width}.png`,animations:'disabled'});
  await page.getByLabel('Jenis semakan').selectOption('video');await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
});
for(const {candidate}of proposals)test(`${candidate.id}: approved desktop guides and saved completion survive reload`,async({page,browserName})=>{
  await page.setViewportSize({width:1280,height:800});await instrument(page);await openCandidate(page,candidate.labelMs);
  await capture(page,`${browserName}-${candidate.id}-desktop`);
  await draw(page,(await boardModels(page)).strokes[0]);await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();
  const saved=(await attempts(page)).at(-1);expect(saved).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,preview:false});
  await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
const harnessRoot=process.env.JAWI_OUTLINE_HARNESS_DIR||'output/verification/sin-syin-tail-approval';
for(const {candidate}of proposals)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: approved tail completes and scores every lane`,async({page})=>{
  await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${candidate.id}&mode=${mode}`);
  await page.addScriptTag({content:readFileSync(`${harnessRoot}/test-harness.js`,'utf8')});
  const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
  for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
  for(let slot=0;slot<count;slot++){
    const board=page.locator('.trace-board').nth(slot);
    await expect(board.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
    await draw(page,(await boardModels(page,board)).strokes[0]);await tapDots(page,board);
    await expect(board).toHaveAttribute('data-phase','complete');
    if(mode==='duo'&&slot===0)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
  }
  await expect(page.locator('.round-result')).toBeVisible();
  const records=await page.evaluate(()=>window.outlineAttempts);expect(records).toHaveLength(count);
  for(const record of records)expect(record).toEqual({letterId:candidate.id,contentVersion:candidate.contentVersion,geometryStatus:'approved',unscored:false});
  for(const score of await page.locator('.round-score-grid strong').allTextContents())expect(score).not.toContain('—');
  await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
  const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:[candidate.id]});
  expect(result.rounds).toHaveLength(1);expect(result.rounds[0].players).toHaveLength(count);
  for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:candidate.geometry.dotTargets.length}});
});
