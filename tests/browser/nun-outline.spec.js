import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync,readFileSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};

const candidate=letters.find(letter=>letter.id==='nun'),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/nun-approval/browser';
mkdirSync(root,{recursive:true});test.setTimeout(90000);
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts||[]);
async function student(page,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();
 }
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Nun');await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
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
for(const mode of ['play','guided','precision'])test(`Nun ${mode}: approved outline, partial reveal, dot-last gate and saved student revision`,async({page,browserName})=>{
 await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await student(page,mode);await fitCapture(page,`${browserName}-${mode}-start`);
 expect(await page.locator('.reference-outline').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('d')))).toEqual(candidate.geometry.appearance.parts.map(part=>part.contours.join(' ')));
 await page.mouse.click((await boardModels(page)).strokes[0].at(-1).x,(await boardModels(page)).strokes[0].at(-1).y);await expect(page.locator('.book-completed')).toHaveCount(0);await menuAction(page,'Cuba lagi');
 let points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.4);
 if(mode==='play'){
  await draw(page,points.slice(0,split));await expect(page.locator('.outline-progress')).toBeVisible();await expect(page.locator('.outline-progress > g > path').first()).toBeHidden();
  await page.screenshot({path:`${root}/${browserName}-play-partial.png`,animations:'disabled'});points=(await boardModels(page)).strokes[0];await draw(page,points.slice(split-1));
 }else await draw(page,points);
 await expect(page.locator('.book-completed')).toHaveCount(0);expect(await attempts(page)).toHaveLength(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');
 await fitCapture(page,`${browserName}-${mode}-dot`);await tapDots(page);await expect(page.locator('.validated-dot.outline-dot')).toHaveCount(1);await expect(page.locator('.book-completed')).toBeVisible();
 const saved=(await attempts(page)).at(-1);expect(saved).toMatchObject({letterId:'nun',contentVersion:3,geometryStatus:'approved',audioStatus:'approved',audioVersion:2,preview:false,mode,metrics:{dotCount:1}});
 await page.screenshot({path:`${root}/${browserName}-${mode}-complete.png`,animations:'disabled'});
 await page.reload();expect(await attempts(page)).toContainEqual(saved);
});
test('Nun approved desktop: outline and numbering fit',async({page,browserName})=>{
 await page.setViewportSize({width:1280,height:800});await student(page);await fitCapture(page,`${browserName}-fit-1280`);
});
test('Nun outline demonstration preserves earned drawing',async({page})=>{
 await page.setViewportSize({width:768,height:1024});await student(page);await page.emulateMedia({reducedMotion:'no-preference'});
 const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.25)));const frontier=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.outline-demonstration')).toBeVisible();await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(frontier);expect(await attempts(page)).toHaveLength(0);
});
for(const [width,height]of [[320,600],[1280,800]])test(`Nun approval ${width}: matching teacher record and six empty review scopes`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
 await page.evaluate(()=>document.fonts.ready);const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await settle();
 const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:'Nun',exact:true})});
 for(let i=0;i<40&&!(await card.isVisible());i++){const next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true});if(!(await next.isEnabled()))break;await next.click();await settle();}
 await expect(card).toContainText('Diluluskan · 3');await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 for(const scope of ['video','outline','ain-outline','direction','sin-syin-tail','ta-za-stem']){await page.getByLabel('Jenis semakan').selectOption(scope);await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.screenshot({path:`${root}/${browserName}-all-approved-${width}.png`,animations:'disabled'});
});
for(const mode of ['solo','duo'])test(`Nun ${mode}: approved scored independent lanes`,async({page})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=nun&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/nun-approval/test-harness.js','utf8')});const count=mode==='duo'?2:1;
 await expect(page.locator('.trace-board')).toHaveCount(count);for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);await expect(board.locator('.reference-outline')).toHaveCount(2);await draw(page,(await boardModels(page,board)).strokes[0]);await tapDots(page,board);await expect(board).toHaveAttribute('data-phase','complete');
  if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
  await expect(page.locator('.round-result')).toBeVisible();const saved=await page.evaluate(()=>window.outlineAttempts);expect(saved).toHaveLength(count);
  for(const attempt of saved)expect(attempt).toEqual({letterId:'nun',contentVersion:3,geometryStatus:'approved',unscored:false});
  for(const text of await page.locator('.round-score-grid strong').allTextContents())expect(text).not.toContain('—');
  await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
  const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:['nun']});
  for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:1}});
});
