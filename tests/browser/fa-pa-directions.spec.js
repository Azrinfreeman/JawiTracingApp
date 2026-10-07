import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction} from './helpers/tracing.js';
import {mkdirSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {faPaReviewCandidates} from '../../src/content/reviewCandidates.js';
const proposals=letters.filter(letter=>['fa','pa'].includes(letter.id)).map(candidate=>({candidate}));
const evidence=process.env.JAWI_EVIDENCE_DIR||'output/verification/fa-pa-approval/browser';mkdirSync(evidence,{recursive:true});
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts);
async function openStudent(page,label,mode='play'){
  await page.goto('/');await dismissSplash(page);
  if(mode!=='play'){
    await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
    await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button',{name:'Kembali',exact:true}).click();
  }
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,label);
  await expect(page.locator('.preview-banner')).toHaveCount(0);await expect(page.locator('.start-dot')).toBeVisible();
  await boardModels(page);
}
async function capture(page,name){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  const fit=await page.locator('.trace-board').evaluate(svg=>{
    const b=svg.getBoundingClientRect();
    const inside=n=>{const r=n.getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1&&r.top>=b.top-1&&r.bottom<=b.bottom+1;};
    const labels=[...svg.querySelectorAll('.trace-number-label-backdrop')];
    const controls=[...document.querySelectorAll('.stage-menu-button,.stage-letter-badge,.stage-cue')];
    const overlaps=(a,c)=>{const x=a.getBoundingClientRect(),y=c.getBoundingClientRect();return x.left<y.right&&y.left<x.right&&x.top<y.bottom&&y.top<x.bottom;};
    return {fits:[...labels,...svg.querySelectorAll('.trace-number-badge')].every(inside),controlsClear:labels.every(a=>controls.every(c=>!overlaps(a,c)))};
  });expect(fit).toEqual({fits:true,controlsClear:true});
  await page.screenshot({path:`${evidence}/${name}.png`,animations:'disabled'});
}
for(const {candidate}of proposals)for(const [mode,width,height]of [['play',320,600],['play',768,1024],['guided',768,1024],['precision',768,1024]]){
 test(`${candidate.id} ${mode} ${width}: Qaf departure, closed head, lift, tail and every dot`,async({page,browserName})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});
  await openStudent(page,candidate.labelMs,mode);
  if(mode==='play')await expect(page.locator('.writing-cue')).toHaveText('Mula di 1. Ke kiri, kemudian naik mengikut gelung.');
  const departure=await page.locator('.reference-stroke').first().evaluate(path=>{const a=path.getPointAtLength(0),b=path.getPointAtLength(1);return {dx:b.x-a.x,dy:b.y-a.y};});
  expect(departure.dx).toBeLessThan(0);expect(departure.dy).toBeGreaterThan(0);
  await expect(page.locator('.reference-stroke').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
  if(mode==='play'){
    await capture(page,`${browserName}-${candidate.id}-start-${width}`);
    // Tail first and the opposite loop direction cannot satisfy the head.
    await draw(page,(await boardModels(page)).strokes[1]);
    await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');
    await menuAction(page,'Cuba lagi');
    await draw(page,(await boardModels(page)).strokes[0].slice().reverse());
    await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');
    expect(await attempts(page)).toHaveLength(0);await menuAction(page,'Cuba lagi');
    let points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.22);
    await draw(page,points.slice(0,split));await capture(page,`${browserName}-${candidate.id}-head-${width}`);
    points=(await boardModels(page)).strokes[0];await draw(page,points.slice(split-1));
  }else await draw(page,(await boardModels(page)).strokes[0]);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
  if(mode==='play')await expect(page.locator('.writing-cue')).toHaveText('Angkat pen. Mula semula di 4. Turun, kemudian ikut ekor ke kiri.');
  await expect(page.locator('.trace-number-label').first()).toHaveText('4 Mula');
  if(mode==='play')await capture(page,`${browserName}-${candidate.id}-tail-${width}`);
  await draw(page,(await boardModels(page)).strokes[1]);
  await expect(page.locator('.book-completed')).toHaveCount(0);
  if(mode==='play')await expect(page.locator('.writing-cue')).toContainText(`Tinggal ${candidate.geometry.dotTargets.length} titik`);
  if(mode==='play')await capture(page,`${browserName}-${candidate.id}-dots-${width}`);
  const dots=(await boardModels(page)).dots;
  for(const dot of dots.slice(0,-1))await page.mouse.click(dot.x,dot.y);
  if(mode==='play')await expect(page.locator('.writing-cue')).toContainText('Tinggal 1 titik');expect(await attempts(page)).toHaveLength(0);
  const last=dots.at(-1);await page.mouse.click(last.x,last.y);await expect(page.locator('.book-completed')).toBeVisible();
  expect((await attempts(page)).at(-1)).toMatchObject({letterId:candidate.id,contentVersion:4,geometryStatus:'approved',preview:false,mode,metrics:{dotCount:dots.length}});
 });
}
for(const {candidate}of proposals)test(`${candidate.id}: demonstration uses the corrected route and preserves earned progress`,async({page,browserName})=>{
  test.setTimeout(60000);await page.setViewportSize({width:768,height:1024});await page.emulateMedia({reducedMotion:'no-preference'});await openStudent(page,candidate.labelMs);
  const points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.2);
  await draw(page,points.slice(0,split));const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
  await page.evaluate(()=>{
    window.faPaDemoCues=[];
    window.faPaDemoObserver=new MutationObserver(()=>{
      const text=document.querySelector('.writing-cue')?.textContent;
      if(text&&text!==window.faPaDemoCues.at(-1))window.faPaDemoCues.push(text);
    });window.faPaDemoObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
  });
  await menuAction(page,'Tunjuk cara');
  await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
  await expect(page.locator('.writing-cue')).toContainText('Ke kiri, kemudian naik mengikut gelung.');
  await capture(page,`${browserName}-${candidate.id}-demo`);
  await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
  const cues=await page.evaluate(()=>{window.faPaDemoObserver.disconnect();return window.faPaDemoCues;});
  const head=cues.findIndex(text=>text.includes('Ke kiri, kemudian naik mengikut gelung.'));
  const tail=cues.findIndex(text=>text.includes('Turun, kemudian ikut ekor ke kiri.'));
  const dots=cues.findIndex(text=>text.includes('Bentuk huruf siap.'));
  expect(head).toBeGreaterThanOrEqual(0);expect(tail).toBeGreaterThan(head);expect(dots).toBeGreaterThan(tail);
  expect(cues.slice(head+1,tail).some(text=>text.includes('Angkat pen.'))).toBe(true);
  expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');expect(await attempts(page)).toHaveLength(0);
});
for(const [width,height]of [[320,600],[768,1024]])test(`Fa and Pa review ${width}: approved revisions, no obsolete cards and preserved older proposals`,async({page,browserName})=>{
  test.setTimeout(45000);await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
  for(const {candidate}of proposals){
    const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:candidate.labelMs,exact:true})});
    const next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true});
    for(let i=0;i<40&&!(await card.isVisible())&&await next.isEnabled();i++)await next.click();
    await expect(card).toContainText('Diluluskan · 4');
  }
  await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
  await page.getByLabel('Jenis semakan').selectOption('direction');
  await expect(page.locator('.empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
  await expect(page.locator('.model-comparison-pair')).toHaveCount(0);expect(faPaReviewCandidates(letters)).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:`${evidence}/${browserName}-approved-review-${width}.png`,animations:'disabled'});
  await page.getByLabel('Jenis semakan').selectOption('video');
  await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
  await page.getByLabel('Jenis semakan').selectOption('outline');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
});
