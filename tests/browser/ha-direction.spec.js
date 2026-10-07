import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import correction from '../../src/content/haDirection.json' with {type:'json'};
import original from '../fixtures/ha-direction-original.json' with {type:'json'};
const candidate=letters.find(letter=>letter.id==='ha'),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/ha-approval/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function student(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Ha (ه)');await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
async function capture(page,name){
 await boardModels(page);const fit=await page.locator('.trace-board').evaluate(svg=>{
  const b=svg.getBoundingClientRect(),nodes=[...svg.querySelectorAll('.reference-stroke,.trace-number-badge,.trace-number-label-backdrop')];
  const clipped=nodes.some(n=>{const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;});
  const overlaps=(a,c)=>{const x=a.getBoundingClientRect(),y=c.getBoundingClientRect();return x.left<y.right&&y.left<x.right&&x.top<y.bottom&&y.top<x.bottom;};
  const labels=[...svg.querySelectorAll('.trace-number-label-backdrop')],controls=[...document.querySelectorAll('.stage-menu-button,.stage-letter-badge,.stage-cue')];
  return {clipped,controlsClear:labels.every(a=>controls.every(c=>!overlaps(a,c))),overflow:document.documentElement.scrollWidth>innerWidth};
 });expect(fit).toEqual({clipped:false,controlsClear:true,overflow:false});await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const [mode,width,height]of [['play',320,600],['guided',768,1024],['precision',1280,800]])test(`Ha approved ${mode} ${width}: photo order, crossings and student completion`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await student(page,mode);await expect(page.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);await capture(page,`${browserName}-${mode}-start`);
 if(mode==='play'){
  await expect(page.locator('.writing-cue')).toHaveText('Mula di 1. Turun dari hujung atas.');
  const old=await page.locator('.trace-board').evaluate((svg,d)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);svg.append(p);const n=Math.ceil(p.getTotalLength()/6),matrix=svg.getScreenCTM(),points=Array.from({length:n+1},(_,i)=>{const q=p.getPointAtLength(p.getTotalLength()*i/n),v=new DOMPoint(q.x,q.y).matrixTransform(matrix);return{x:v.x,y:v.y};});p.remove();return points;},original.geometry.strokes[0].path);
  await draw(page,old);await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');expect(await attempts(page)).toHaveLength(0);await menuAction(page,'Cuba lagi');
  // Recover after release on the outer loop, then traverse both crossings.
  let points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.25);await draw(page,points.slice(0,split));await capture(page,`${browserName}-play-outer-partial`);
  points=(await boardModels(page)).strokes[0];await draw(page,points.slice(split-1));
 }else await draw(page,(await boardModels(page)).strokes[0]);
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await expect.poll(async()=> (await attempts(page)).length).toBe(1);const saved=(await attempts(page))[0];expect(saved).toMatchObject({letterId:'ha',contentVersion:4,geometryStatus:'approved',preview:false,mode,metrics:{dotCount:0}});
 await page.screenshot({path:`${root}/${browserName}-${mode}-complete.png`,animations:'disabled'});await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
test('Ha demonstration follows all five phases without earning or replacing progress',async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await page.emulateMedia({reducedMotion:'no-preference'});await student(page);
 const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.2)));const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await page.evaluate(()=>{window.haCues=[];window.haObserver=new MutationObserver(()=>{const text=document.querySelector('.writing-cue')?.textContent;if(text&&text!==window.haCues.at(-1))window.haCues.push(text);});window.haObserver.observe(document.body,{subtree:true,childList:true,characterData:true});});
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink')).toHaveAttribute('d',candidate.geometry.strokes[0].path);await capture(page,`${browserName}-demo`);await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:22000});
 const cues=await page.evaluate(()=>{window.haObserver.disconnect();return window.haCues;});let last=-1;for(const [,text]of correction.sections){const index=cues.indexOf(text);expect(index,`${text}: ${cues.join('|')}`).toBeGreaterThan(last);last=index;}
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);expect(await attempts(page)).toHaveLength(0);
});
test('Ha reviewed route is approved and all seven adult review scopes have expired proposals',async({page})=>{
 await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
 await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 for(const scope of ['video','outline','ain-outline','direction','ha-direction','sin-syin-tail','ta-za-stem']){await page.getByLabel('Jenis semakan').selectOption(scope);await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);}
});
for(const mode of ['solo','duo'])test(`Ha ${mode} approved: independent scored photo routes`,async({page})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=ha&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/ha-approval/test-harness.js','utf8')});const count=mode==='duo'?2:1;
 await expect(page.locator('.trace-board')).toHaveCount(count);for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){const board=page.locator('.trace-board').nth(slot);await expect(board.locator('.reference-stroke')).toHaveAttribute('d',candidate.geometry.strokes[0].path);await draw(page,(await boardModels(page,board)).strokes[0]);await expect(board).toHaveAttribute('data-phase','complete');if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');}
 await expect(page.locator('.round-result')).toBeVisible();expect(await page.evaluate(()=>window.outlineAttempts)).toEqual(Array.from({length:count},()=>({letterId:'ha',contentVersion:4,geometryStatus:'approved',unscored:false})));
 for(const score of await page.locator('.round-score-grid strong').allTextContents())expect(score).not.toContain('—');
 await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
 const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:['ha']});
 for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:0}});
});
for(const [type,width,height]of [['touch',390,844],['pen',768,1024]])test(`Ha native emulated ${type}: photo route across both joins`,async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP emulation only.');
 await page.setViewportSize({width,height});await student(page);const points=(await boardModels(page)).strokes[0],session=await context.newCDPSession(page);
 if(type==='touch'){
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...points[0],id:1}]});
  for(const point of points.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,id:1}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{
  await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...points[0],pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mousePressed',...points[0],button:'left',buttons:1,pointerType:'pen'});
  for(const point of points.slice(1))await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point,button:'left',buttons:1,pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mouseReleased',...points.at(-1),button:'left',buttons:0,pointerType:'pen'});
 }
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');await expect.poll(async()=> (await attempts(page)).length).toBe(1);
 expect((await attempts(page))[0]).toMatchObject({pointerType:type,letterId:'ha',contentVersion:4,preview:false,geometryStatus:'approved'});
 await page.screenshot({path:`${root}/chromium-native-${type}-complete.png`,animations:'disabled'});
});
