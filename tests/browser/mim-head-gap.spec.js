import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {videoReviewCandidates} from '../../src/content/reviewCandidates.js';
const candidate=letters.find(letter=>letter.id==='mim');
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/video-review-approval/browser';mkdirSync(root,{recursive:true});
test.setTimeout(90000);
async function review(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
 await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
}
async function preview(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play') { await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click(); }
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Mim');
 await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
for(const [mode,width,height]of [['play',320,600],['play',768,1024],['guided',768,1024],['precision',1280,800]]){
 test(`${mode} ${width}: Mim keeps a tiny head opening and continuous tail`,async({page,browserName})=>{
  await page.setViewportSize({width,height});await preview(page,mode);
  await expect(page.locator('.reference-stroke')).toHaveCount(1);
  const points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.7);
  if(mode!=='precision')await draw(page,points.slice(0,split));
  await expect(page.locator('.book-completed')).toHaveCount(0);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:`${root}/${browserName}-${mode}-${width}-partial.png`,animations:'disabled'});
  const resumed=(await boardModels(page)).strokes[0];
  await draw(page,mode==='precision'?resumed:resumed.slice(Math.floor(resumed.length*.7)-1));
  await expect(page.locator('.book-completed')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(saved).toMatchObject({letterId:'mim',contentVersion:5,geometryStatus:'approved',preview:false,mode});
  await page.screenshot({path:`${root}/${browserName}-${mode}-${width}-complete.png`,animations:'disabled'});
 });
}
test('demonstration follows the continuous path and leaves earned head progress intact',async({page})=>{
 await preview(page);await page.emulateMedia({reducedMotion:'no-preference'});
 const head=(await boardModels(page)).strokes[0];await draw(page,head.slice(0,Math.floor(head.length*.3)));
 const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);
 await expect(page.locator('.book-completed')).toHaveCount(0);
});
