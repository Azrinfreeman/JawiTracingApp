import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction,tapDots} from './helpers/tracing.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import corrections from '../../src/content/wauVaSmallerHeads.json' with {type:'json'};
import {wauVaSmallerHeadReviewCandidates} from '../../src/content/reviewCandidates.js';
const proposals=wauVaSmallerHeadReviewCandidates(letters),root='output/verification/wau-va-smaller-heads/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function review(page,index=0,mode='play'){
 await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
 if(mode!=='play')await page.getByLabel('Jenis latihan').selectOption(mode);
 await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('wau-va-smaller-head');
 if(index)await page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();
}
async function preview(page,index=0,mode='play'){await review(page,index,mode);await page.getByRole('button',{name:`Semak ${proposals[index].candidate.labelMs} cadangan`,exact:true}).click();await expect(page.locator('.preview-banner')).toBeVisible();await boardModels(page);}
async function capture(page,name){await boardModels(page);const fit=await page.locator('.trace-board').evaluate(svg=>{const b=svg.getBoundingClientRect(),badges=[...svg.querySelectorAll('.trace-number-badge')].map(n=>n.getBoundingClientRect());return{clipped:[...svg.querySelectorAll('.reference-stroke,.reference-dot,.trace-number-badge,.trace-number-label-backdrop')].some(n=>{const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;}),overlap:badges.some((a,i)=>badges.slice(i+1).some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)),overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight+1};});expect(fit).toEqual({clipped:false,overlap:false,overflow:false});await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});}
test('adult comparison shows the revised models or expires after their approval',async({page,browserName})=>{
 await page.setViewportSize({width:1024,height:768});await review(page);
 if(!proposals.length){await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');return;}
 for(const [i,{original,candidate}]of proposals.entries()){
  await expect(page.locator('.model-comparison-pair strong')).toHaveText([`Asal · versi ${original.contentVersion}`,`Cadangan · versi ${candidate.contentVersion}`]);
  const glyphs=page.locator('.model-comparison-pair svg');await expect(glyphs.nth(0).locator('path')).toHaveAttribute('d',original.geometry.strokes[0].path);await expect(glyphs.nth(1).locator('path')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
  const views=await glyphs.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('viewBox').split(' ').map(Number)));for(let j=0;j<4;j++)expect(views[0][j]).toBeCloseTo(views[1][j],1);
  await page.screenshot({path:`${root}/${browserName}-${candidate.id}-comparison.png`,animations:'disabled'});if(!i)await page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();
 }expect(await attempts(page)).toEqual([]);
});
for(const [index,{candidate,original}]of proposals.entries())for(const [mode,width,height]of [['play',320,740],['play',1024,768],['guided',768,1024],['precision',1280,800]])test(`${candidate.id} ${mode} ${width}: smaller head, continuous tail, dot-last and preview-only credit`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await preview(page,index,mode);await expect(page.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);
 await expect(page.locator('.trace-number-label')).toHaveText(['1 Mula','2 Ikut',candidate.id==='wau'?'3 Siap':'3 Henti']);await capture(page,`${browserName}-${candidate.id}-${mode}-${width}-start`);
 let route=(await boardModels(page)).strokes[0];expect(route[1].x).toBeLessThan(route[0].x);
 if(mode==='play'){await draw(page,route.toReversed());await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');await menuAction(page,'Cuba lagi');route=(await boardModels(page)).strokes[0];const split=Math.floor(route.length*.2);await draw(page,route.slice(0,split));await capture(page,`${browserName}-${candidate.id}-${width}-partial`);route=(await boardModels(page)).strokes[0];await draw(page,route.slice(split-1));}else await draw(page,route);
 if(candidate.id==='va'){await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');expect(await attempts(page)).toEqual([]);await expect(page.locator('.trace-number-label')).toHaveText(['4 Titik akhir']);await capture(page,`${browserName}-${candidate.id}-${mode}-${width}-dot`);await tapDots(page);}
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await capture(page,`${browserName}-${candidate.id}-${mode}-${width}-complete`);await expect.poll(async()=>(await attempts(page)).length).toBe(1);
 const saved=(await attempts(page))[0];expect(saved).toMatchObject({letterId:candidate.id,contentVersion:candidate.contentVersion,mode,preview:true,geometryStatus:'pendingReview',audioStatus:'approved',metrics:{dotCount:candidate.geometry.dotTargets.length}});
 await page.reload();expect(await attempts(page)).toEqual([saved]);await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();await expect(page.locator('.garden-progress strong')).toHaveText('0');await chooseLetter(page,candidate.labelMs);await expect(page.locator('.preview-banner')).toHaveCount(0);await expect(page.locator('.reference-stroke')).toHaveAttribute('d',original.geometry.strokes[0].path);
});
for(const [index,{candidate}]of proposals.entries())test(`${candidate.id}: full and remaining demonstrations retain the partial frontier and recomputed cues`,async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await preview(page,index);let route=(await boardModels(page)).strokes[0];await draw(page,route.slice(0,Math.floor(route.length*.15)));const frontier=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await page.evaluate(()=>{window.smallHeadCues=[];window.cueObserver=new MutationObserver(()=>{const text=document.querySelector('.writing-cue')?.textContent;if(text&&text!==window.smallHeadCues.at(-1))window.smallHeadCues.push(text);});window.cueObserver.observe(document.body,{subtree:true,childList:true,characterData:true});});
 for(const action of ['Tunjuk cara','Tunjuk bahagian ini']){await menuAction(page,action);await expect(page.locator('path.demonstration-ink')).toHaveAttribute('d',candidate.geometry.strokes[0].path);await capture(page,`${browserName}-${candidate.id}-demo-${action==='Tunjuk cara'?'full':'remaining'}`);await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:15000});expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(frontier);expect(await attempts(page)).toEqual([]);}
 const cues=await page.evaluate(()=>{window.cueObserver.disconnect();return window.smallHeadCues;});expect(cues).toContain('Ke kiri, kemudian naik mengikut gelung.');expect(cues).toContain('Teruskan ekor ke kiri.');expect(corrections[candidate.id].sections[1][0]).toBeLessThan(.6131);
});
for(const [index,{candidate}]of proposals.entries())for(const type of ['touch','pen'])test(`${candidate.id} native ${type}: smaller head and separate final dot`,async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP input emulation only.');await page.setViewportSize({width:768,height:1024});await preview(page,index);const session=await context.newCDPSession(page);
 async function send(route){if(type==='touch'){await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...route[0],id:1}]});for(const p of route.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...route[0],pointerType:'pen'});await session.send('Input.dispatchMouseEvent',{type:'mousePressed',...route[0],button:'left',buttons:1,pointerType:'pen'});for(const p of route.slice(1))await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p,button:'left',buttons:1,pointerType:'pen'});await session.send('Input.dispatchMouseEvent',{type:'mouseReleased',...route.at(-1),button:'left',buttons:0,pointerType:'pen'});}}
 await send((await boardModels(page)).strokes[0]);for(const dot of (await boardModels(page)).dots){await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');await send([dot]);}await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await expect.poll(async()=>(await attempts(page)).length).toBe(1);expect((await attempts(page))[0]).toMatchObject({letterId:candidate.id,preview:true,pointerType:type,geometryStatus:'pendingReview'});
});
test('candidate card and help glyphs use the revised paths while approved student cards keep their current glyphs',async({page,browserName})=>{
 test.skip(!proposals.length,'Candidates have been approved; student glyphs are covered by the activation suite.');
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.addScriptTag({content:readFileSync('output/verification/wau-va-smaller-heads/glyph-harness.js','utf8')});
 for(const {candidate}of proposals){const card=page.locator(`.letter-card svg[data-letter-id="${candidate.id}"]`);await expect(card).toHaveAttribute('data-content-version',String(candidate.contentVersion));await expect(card.locator('path')).toHaveAttribute('d',candidate.geometry.strokes[0].path);await expect(page.locator(`[data-help="${candidate.id}"] svg path`)).toHaveAttribute('d',candidate.geometry.strokes[0].path);}
 await expect(page.locator('[data-approved] .letter-card svg')).toHaveCount(0);await page.screenshot({path:`${root}/${browserName}-candidate-thumbnails.png`,animations:'disabled'});
});
