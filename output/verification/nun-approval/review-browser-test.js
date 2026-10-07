import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {fourLetterReviewCandidates} from '../../src/content/reviewCandidates.js';

const [{candidate}]=fourLetterReviewCandidates(letters),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/nun-outline/browser';
mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function preview(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('tab',{name:'Huruf',exact:true}).click();
 await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('outline');
 await expect(page.locator('.model-comparison-pair')).toHaveCount(1);await expect(page.locator('.model-comparison-pair')).toContainText('Cadangan · versi 3');
 await page.getByRole('button',{name:'Semak Nun cadangan',exact:true}).click();await expect(page.locator('.preview-banner')).toBeVisible();await boardModels(page);
}
async function fitCapture(page,name){
 await boardModels(page);
 const fit=await page.locator('.trace-board').evaluate(svg=>{
  const board=svg.getBoundingClientRect(),ink=[...svg.querySelectorAll('.reference-outline')];
  const badges=[...svg.querySelectorAll('.trace-number-badge')],labels=[...svg.querySelectorAll('.trace-number-label-backdrop')];
  const outside=node=>{const box=node.getBoundingClientRect();return box.left<board.left-1||box.right>board.right+1||box.top<board.top-1||box.bottom>board.bottom+1;};
  const inInk=(x,y)=>ink.some(path=>path.isPointInFill(new DOMPoint(x,y)));
  const obscured=badges.some(badge=>{const x=badge.cx.baseVal.value,y=badge.cy.baseVal.value,r=badge.r.baseVal.value;for(let xx=x-r;xx<=x+r;xx+=2)for(let yy=y-r;yy<=y+r;yy+=2)if(Math.hypot(xx-x,yy-y)<=r&&inInk(xx,yy))return true;return false;});
  const labelObscured=labels.some(label=>{const box=label.getBBox();for(let x=box.x;x<=box.x+box.width;x+=2)for(let y=box.y;y<=box.y+box.height;y+=2)if(inInk(x,y))return true;return false;});
  return {clipped:[...ink,...badges,...labels].some(outside),obscured,labelObscured,overflow:document.documentElement.scrollWidth>innerWidth};
 });expect(fit).toEqual({clipped:false,obscured:false,labelObscured:false,overflow:false});await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const mode of ['play','guided','precision'])test(`Nun ${mode}: exact outline, partial reveal, dot-last gate and preview save`,async({page,browserName})=>{
 await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await preview(page,mode);await fitCapture(page,`${browserName}-${mode}-start`);
 expect(await page.locator('.reference-outline').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('d')))).toEqual(candidate.geometry.appearance.parts.map(part=>part.contours.join(' ')));
 await page.mouse.click((await boardModels(page)).strokes[0].at(-1).x,(await boardModels(page)).strokes[0].at(-1).y);await expect(page.locator('.book-completed')).toHaveCount(0);await menuAction(page,'Cuba lagi');
 let points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.4);
 if(mode==='play'){
  await draw(page,points.slice(0,split));await expect(page.locator('.outline-progress')).toBeVisible();await expect(page.locator('.outline-progress > g > path').first()).toBeHidden();
  await page.screenshot({path:`${root}/${browserName}-play-partial.png`,animations:'disabled'});points=(await boardModels(page)).strokes[0];await draw(page,points.slice(split-1));
 }else await draw(page,points);
 await expect(page.locator('.book-completed')).toHaveCount(0);expect(await attempts(page)).toHaveLength(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');
 await fitCapture(page,`${browserName}-${mode}-dot`);await tapDots(page);await expect(page.locator('.validated-dot.outline-dot')).toHaveCount(1);await expect(page.locator('.book-completed')).toBeVisible();
 expect((await attempts(page)).at(-1)).toMatchObject({letterId:'nun',contentVersion:3,geometryStatus:'pendingReview',audioStatus:'approved',audioVersion:2,preview:true,mode,metrics:{dotCount:1}});
 await page.screenshot({path:`${root}/${browserName}-${mode}-complete.png`,animations:'disabled'});
});
for(const [width,height]of [[768,1024],[1280,800]])test(`Nun review fit ${width}: catalogue comparison and numbering`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await preview(page);await fitCapture(page,`${browserName}-fit-${width}`);
});
test('Nun outline demonstration preserves earned drawing',async({page})=>{
 await page.setViewportSize({width:768,height:1024});await preview(page);await page.emulateMedia({reducedMotion:'no-preference'});
 const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.25)));const frontier=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.outline-demonstration')).toBeVisible();await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(frontier);expect(await attempts(page)).toHaveLength(0);
});
test('Nun normal students retain approved revision 2 until review',async({page})=>{
 await instrument(page);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Nun');
 await expect(page.locator('.preview-banner')).toHaveCount(0);await expect(page.locator('.reference-outline')).toHaveCount(0);
 const original=letters.find(letter=>letter.id==='nun');await expect(page.locator('.reference-stroke')).toHaveAttribute('d',original.geometry.strokes[0].path);
});
for(const mode of ['solo','duo'])test(`Nun ${mode}: reviewed outline in unscored independent lanes`,async({page})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.evaluate(url=>history.replaceState(null,'',url),`/?letter=nun&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/nun-outline/test-harness.js','utf8')});const count=mode==='duo'?2:1;
 await expect(page.locator('.trace-board')).toHaveCount(count);for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);await expect(board.locator('.reference-outline')).toHaveCount(2);await draw(page,(await boardModels(page,board)).strokes[0]);await tapDots(page,board);await expect(board).toHaveAttribute('data-phase','complete');
  if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
  await expect(page.locator('.round-result')).toBeVisible();expect(await page.evaluate(()=>window.outlineAttempts)).toEqual([]);
  for(const text of await page.locator('.round-score-grid strong').allTextContents())expect(text).toContain('—');
  await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
  const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:true,letterIds:['nun']});
  for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:1}});
});
