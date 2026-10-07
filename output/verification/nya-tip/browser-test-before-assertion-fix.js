import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {nyaTipReviewCandidates} from '../../src/content/reviewCandidates.js';
const [{original,candidate}]=nyaTipReviewCandidates(letters);
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/nya-tip/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function review(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
 await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 await page.getByLabel('Jenis semakan').selectOption('nya-tip');
}
async function preview(page,mode='play'){
 await review(page,mode);await page.getByRole('button',{name:'Semak Nya cadangan',exact:true}).click();
 await expect(page.locator('.preview-banner')).toBeVisible();await boardModels(page);
 await expect(page.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
}
for(const [mode,width,height]of [['play',320,600],['guided',768,1024],['precision',1280,800]])test(`Nya 4 ${mode}: shorter start, entire bowl, three dots last and isolated saved preview`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await preview(page,mode);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:`${root}/${browserName}-${mode}-start.png`,animations:'disabled'});
 await draw(page,(await boardModels(page)).strokes[0]);
 expect(await attempts(page)).toHaveLength(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');
 for(let i=0;i<3;i++){
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id',`dot-${i+1}`);
  const p=(await boardModels(page)).dots[i];await page.mouse.click(p.x,p.y);if(i<2)expect(await attempts(page)).toHaveLength(0);
 }
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await page.screenshot({path:`${root}/${browserName}-${mode}-unobscured.png`,animations:'disabled'});
 await expect(page.locator('.book-completed')).toBeVisible();
 const record=(await attempts(page))[0];expect(record).toMatchObject({letterId:'nya',contentVersion:4,geometryStatus:'pendingReview',audioStatus:'approved',audioVersion:1,preview:true,mode,metrics:{dotCount:3}});
 await page.reload();expect(await attempts(page)).toContainEqual(record);
});
for(const [width,height]of [[320,600],[768,1024]])test(`Nya comparison ${width}: old model and shorter proposed tip with all dots`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await review(page);
 await expect(page.locator('.model-comparison-pair svg')).toHaveCount(2);
 await expect(page.locator('.model-comparison-pair')).toContainText('Asal · versi 3');await expect(page.locator('.model-comparison-pair')).toContainText('Cadangan · versi 4');
 await expect(page.locator('.model-comparison-pair svg').last()).toHaveAttribute('data-content-version','4');
 expect(await page.locator('.model-comparison-pair svg').last().locator('circle').count()).toBe(3);
 await page.screenshot({path:`${root}/${browserName}-comparison-${width}.png`,animations:'disabled'});
});
test('Nya demonstration follows shortened route while preserving earned drawing',async({page})=>{
 await page.setViewportSize({width:768,height:1024});await page.emulateMedia({reducedMotion:'no-preference'});await preview(page);
 const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.2)));
 const frontier=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(frontier);expect(await attempts(page)).toHaveLength(0);
});
test('Normal student Nya stays at approved revision 3 while the revised shape awaits review',async({page})=>{
 await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Nya');
 await expect(page.locator('.preview-banner')).toHaveCount(0);await expect(page.locator('.reference-stroke')).toHaveAttribute('d',original.geometry.strokes[0].path);
 await expect(page.locator('.stage-badge')).toContainText('36/36');
});
for(const mode of ['solo','duo'])test(`Nya candidate ${mode}: shortened route and dots in independent unscored lanes`,async({page})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(url=>history.replaceState(null,'',url),`/?nya-tip=1&letter=nya&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/nya-tip/test-harness.js','utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
 for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
 await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);await expect(board.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
  await draw(page,(await boardModels(page,board)).strokes[0]);await tapDots(page,board);await expect(board).toHaveAttribute('data-phase','complete');
  if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
 await expect(page.locator('.round-result')).toBeVisible();expect(await page.evaluate(()=>window.outlineAttempts)).toEqual(Array.from({length:count},()=>({letterId:'nya',contentVersion:4,geometryStatus:'pendingReview',unscored:true})));
 await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
 expect(await page.evaluate(()=>window.outlineResult.unscored)).toBe(true);
});
