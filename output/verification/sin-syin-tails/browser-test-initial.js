import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument,voices} from './helpers/audio.js';
import {sinSyinTailReviewCandidates} from '../../src/content/reviewCandidates.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';

const proposals=sinSyinTailReviewCandidates(letters);
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/sin-syin-tails/browser';
mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts);

async function openReview(page,mode='play'){
  await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
  if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
  await page.getByRole('tab',{name:'Huruf',exact:true}).click();
  await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
  await page.getByLabel('Jenis semakan').selectOption('sin-syin-tail');
  await page.evaluate(()=>document.fonts.ready);
}
async function selectReviewCard(page,label){
  const review=page.locator('.video-model-review'),heading=review.getByRole('heading',{name:label,exact:true});
  for(let i=0;i<2&&!(await heading.isVisible());i++)await review.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();
  await expect(heading).toBeVisible();
}
async function openCandidate(page,label,mode='play'){
  await openReview(page,mode);await selectReviewCard(page,label);
  await page.getByRole('button',{name:`Semak ${label} cadangan`,exact:true}).click();
  await expect(page.locator('.preview-banner')).toBeVisible();await boardModels(page);
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
    geometryStatus:'pendingReview',audioStatus:'approved',preview:true,mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
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

for(const [width,height]of [[320,600],[768,1024]])test(`tail review ${width}: before/after, versions and clear controls`,async({page,browserName})=>{
  await page.setViewportSize({width,height});await openReview(page);
  for(const {original,candidate}of proposals){
    await selectReviewCard(page,candidate.labelMs);
    await expect(page.locator('.model-comparison-pair')).toContainText(`Asal · versi ${original.contentVersion}`);
    await expect(page.locator('.model-comparison-pair')).toContainText(`Cadangan · versi ${candidate.contentVersion}`);
    const paths=await page.locator('.model-comparison-pair svg path').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('d')));
    expect(paths).toEqual([original.geometry.strokes[0].path,candidate.geometry.strokes[0].path]);
    const visible=await page.locator('.model-comparison-pair button').evaluateAll(buttons=>buttons.every(button=>{
      const b=button.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight&&b.left>=0&&b.right<=innerWidth;
    }));expect(visible).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    await page.screenshot({path:`${root}/${browserName}-review-${candidate.id}-${width}.png`,animations:'disabled'});
  }
  await page.getByLabel('Jenis semakan').selectOption('video');
  await expect(page.getByRole('navigation',{name:'Halaman rekod',exact:true})).toContainText('1 / 4');
});

for(const {original,candidate}of proposals)test(`${candidate.id}: actual before/after board and desktop guide placement`,async({page,browserName})=>{
  await page.setViewportSize({width:1280,height:800});await instrument(page);
  await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,original.labelMs);
  await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
  await capture(page,`${browserName}-${candidate.id}-desktop-before`);
  const viewBox=await page.locator('.trace-board').getAttribute('viewBox');
  await page.locator('.trace-board').screenshot({path:`${root}/${browserName}-${candidate.id}-before-board.png`});
  await openCandidate(page,candidate.labelMs);await capture(page,`${browserName}-${candidate.id}-desktop-after`);
  expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(viewBox);
  await page.locator('.trace-board').screenshot({path:`${root}/${browserName}-${candidate.id}-after-board.png`});
});

test('the 37 approved student letters keep their original shapes and readiness',async({page})=>{
  await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();
  for(const {original}of proposals){
    await chooseLetter(page,original.labelMs);await expect(page.locator('.preview-banner')).toHaveCount(0);
    await expect(page.locator('.reference-stroke')).toHaveAttribute('d',original.geometry.strokes[0].path);
    await menuAction(page,'Isi kandungan');
  }
});

const harnessRoot=process.env.JAWI_OUTLINE_HARNESS_DIR||'output/verification/sin-syin-tails';
for(const {candidate}of proposals)for(const mode of ['solo','duo'])test(`${candidate.id} ${mode}: unscored tail preview completes every lane`,async({page})=>{
  await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(url=>history.replaceState(null,'',url),`/?sin-syin-tail=1&letter=${candidate.id}&mode=${mode}`);
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
  const results=await page.evaluate(()=>window.outlineAttempts);expect(results).toHaveLength(count);
  for(const result of results)expect(result).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,geometryStatus:'pendingReview',unscored:true});
});
