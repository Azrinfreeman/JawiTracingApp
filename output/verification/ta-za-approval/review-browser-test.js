import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {taZaStemReviewCandidates} from '../../src/content/reviewCandidates.js';
import {mkdirSync} from 'node:fs';
const proposals=taZaStemReviewCandidates(letters),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/ta-za-original-curve/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function review(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
 await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('ta-za-stem');await page.evaluate(()=>document.fonts.ready);await settle(page);
}
async function selectReview(page,label){
 if(label==='Za'){await page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();await settle(page);}
 await expect(page.locator('.model-comparison-heading h3')).toHaveText(label);
}
async function preview(page,candidate,mode='play'){
 await review(page,mode);await selectReview(page,candidate.labelMs);await page.getByRole('button',{name:`Semak ${candidate.labelMs} cadangan`,exact:true}).click();await expect(page.locator('.preview-banner')).toBeVisible();await boardModels(page);
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
for(const {candidate}of proposals)for(const mode of ['play','guided','precision'])test(`${candidate.id} ${mode}: closer stem, two movements and preview-only completion`,async({page,browserName})=>{
 await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await preview(page,candidate,mode);
 expect(await page.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(candidate.geometry.strokes.map(s=>s.path));
 await expect(page.locator('.trace-number-guide[data-number="3"]')).toHaveAttribute('data-anchor-x','310');
 await draw(page,(await boardModels(page)).strokes[0]);await expect(page.locator('.book-completed')).toHaveCount(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
 expect(+(await page.locator('.trace-number-guide[data-number="4"]').getAttribute('data-anchor-x'))).toBeCloseTo(387.6,3);
 await capture(page,`${browserName}-${candidate.id}-${mode}-stem`);
 await draw(page,(await boardModels(page)).strokes[1]);
 if(candidate.geometry.dotTargets.length){await expect(page.locator('.book-completed')).toHaveCount(0);expect(await attempts(page)).toHaveLength(0);await tapDots(page);}
 await expect(page.locator('.book-completed')).toBeVisible();
 const saved=(await attempts(page)).at(-1);expect(saved).toMatchObject({letterId:candidate.id,contentVersion:6,geometryStatus:'pendingReview',audioStatus:'approved',preview:true,mode,metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.screenshot({path:`${root}/${browserName}-${candidate.id}-${mode}-complete.png`,animations:'disabled'});
 await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
for(const {candidate}of proposals)test(`${candidate.id}: shifted stem demonstration preserves earned progress`,async({page})=>{
 await page.setViewportSize({width:768,height:1024});await preview(page,candidate);await page.emulateMedia({reducedMotion:'no-preference'});
 await draw(page,(await boardModels(page)).strokes[0]);const stem=(await boardModels(page)).strokes[1];await draw(page,stem.slice(0,Math.floor(stem.length*.25)));
 const before=await page.locator('.play-fill').nth(1).getAttribute('data-measured-frontier');await menuAction(page,'Tunjuk bahagian ini');
 await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[1].path);await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').nth(1).getAttribute('data-measured-frontier')).toBe(before);expect(await attempts(page)).toHaveLength(0);await expect(page.locator('.book-completed')).toHaveCount(0);
});
for(const [width,height]of [[320,600],[1280,800]])test(`review ${width}: both current comparisons retain shapes and pending revisions`,async({page,browserName,context})=>{
 await page.setViewportSize({width,height});await review(page);
 for(const {original,candidate}of proposals){
  await selectReview(page,candidate.labelMs);await expect(page.locator('.model-comparison-pair')).toContainText('Asal · versi 3');await expect(page.locator('.model-comparison-pair')).toContainText('Cadangan · versi 6');
  expect(await page.locator('.model-comparison-pair .letter-model-glyph').evaluateAll(nodes=>nodes.map(n=>[...n.querySelectorAll('path')].map(p=>p.getAttribute('d'))))).toEqual([original.geometry.strokes.map(s=>s.path),candidate.geometry.strokes.map(s=>s.path)]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.locator('.video-model-comparison').screenshot({path:`${root}/${browserName}-${candidate.id}-comparison-${width}.png`,animations:'disabled'});
  if(width===1280){
   const models=await page.locator('.model-comparison-pair .letter-model-glyph').evaluateAll(nodes=>nodes.map(n=>n.outerHTML)),figure=await context.newPage();
   await figure.setViewportSize({width:900,height:550});await figure.setContent(`<style>body{margin:0;background:#fff6df;color:#243e32;font:22px sans-serif}main{display:flex;justify-content:center;gap:50px;padding:24px}section{width:350px;text-align:center}svg{width:310px;height:400px;display:block;margin:auto}</style><main><section><p>Original · 3</p>${models[0]}</section><section><p>Revised · 6</p>${models[1]}</section></main>`);
   await figure.screenshot({path:`${root}/${browserName}-${candidate.id}-large-comparison.png`});await figure.close();
  }
 }
 await page.getByLabel('Jenis semakan').selectOption('video');await expect(page.locator('.empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
});
for(const {original}of proposals)test(`${original.id}: normal students retain approved revision 3 while new shape awaits review`,async({page})=>{
 await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,original.labelMs);await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
 expect(await page.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')))).toEqual(original.geometry.strokes.map(s=>s.path));
});
