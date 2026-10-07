import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {videoReviewCandidates} from '../../src/content/reviewCandidates.js';
const candidate=videoReviewCandidates(letters).find(p=>p.candidate.id==='mim').candidate;
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/mim-tail-gap/browser';mkdirSync(root,{recursive:true});
test.setTimeout(90000);
async function review(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
 await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
}
async function preview(page,mode='play'){
 await review(page,mode);await page.getByRole('button',{name:'Semak Mim cadangan',exact:true}).click();
 await expect(page.locator('.preview-banner')).toBeVisible();await boardModels(page);
}
for(const [mode,width,height]of [['play',320,600],['play',768,1024],['guided',768,1024],['precision',1280,800]]){
 test(`${mode} ${width}: Mim closes the head, lifts, and starts the detached tail`,async({page,browserName})=>{
  await page.setViewportSize({width,height});await preview(page,mode);
  await expect(page.locator('.reference-stroke')).toHaveCount(2);
  await draw(page,(await boardModels(page)).strokes[0]);await expect(page.locator('.book-completed')).toHaveCount(0);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
  if(mode==='play')await expect(page.locator('.writing-cue')).toHaveText('Angkat pen. Mula semula di 4.');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:`${root}/${browserName}-${mode}-${width}-tail-start.png`,animations:'disabled'});
  await draw(page,(await boardModels(page)).strokes[1]);await expect(page.locator('.book-completed')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(saved).toMatchObject({letterId:'mim',contentVersion:4,geometryStatus:'pendingReview',preview:true,mode});
  await page.screenshot({path:`${root}/${browserName}-${mode}-${width}-complete.png`,animations:'disabled'});
 });
}
test('demonstration follows two paths and leaves earned head progress intact',async({page})=>{
 await preview(page);await page.emulateMedia({reducedMotion:'no-preference'});
 const head=(await boardModels(page)).strokes[0];await draw(page,head.slice(0,Math.floor(head.length*.3)));
 const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);
 await expect(page.locator('.book-completed')).toHaveCount(0);
});
test('review card shows revision 4 with two movements; student Mim stays approved revision 2',async({page,browserName})=>{
 await page.setViewportSize({width:320,height:600});await review(page);
 await expect(page.locator('.model-comparison-pair')).toContainText('Cadangan · versi 4');
 await expect(page.locator('.model-comparison-pair')).toContainText('2 gerakan · 0 titik');
 await page.screenshot({path:`${root}/${browserName}-review-phone.png`,animations:'disabled'});
 await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Mim');
 await expect(page.locator('.preview-banner')).toHaveCount(0);await expect(page.locator('.reference-stroke')).toHaveCount(1);
 await expect(page.locator('.reference-stroke')).toHaveAttribute('d',letters.find(l=>l.id==='mim').geometry.strokes[0].path);
});
test('old and revised proposals use the actual illustration renderer',async({page,browserName})=>{
 await page.setViewportSize({width:768,height:540});await page.goto('/');
 await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>history.replaceState(null,'','/?mim-tail-gap=1&comparison=1'));
 await page.addScriptTag({content:readFileSync('output/verification/mim-tail-gap/test-harness.js','utf8')});
  await page.addStyleTag({content:'.letter-model-glyph { width:280px; height:400px; }'});
 await expect(page.locator('.letter-model-glyph')).toHaveCount(2);
 await page.screenshot({path:`${root}/${browserName}-before-after.png`,animations:'disabled'});
});
