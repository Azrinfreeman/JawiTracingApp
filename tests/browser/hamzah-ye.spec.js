import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {mkdirSync,readFileSync} from 'node:fs';
const approved=letters.filter(l=>['hamzah'].includes(l.id));
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/hamzah-ye/browser';mkdirSync(root,{recursive:true});test.setTimeout(90000);
async function student(page,letter,mode='play'){
 await instrument(page);await page.goto('/');await dismissSplash(page);
 if(mode!=='play'){await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('button',{name:'Kembali',exact:true}).click();}
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,letter.labelMs);
 await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
for(const letter of approved)for(const mode of ['play','guided','precision'])test(`${letter.id} ${mode}: approved whole letter, every dot and saved current revision`,async({page,browserName})=>{
 await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await student(page,letter,mode);
 const paths=await page.locator('.reference-stroke').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')));expect(paths).toEqual(letter.geometry.strokes.map(s=>s.path));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:`${root}/${browserName}-${letter.id}-${mode}-start.png`,animations:'disabled'});
 for(let index=0;index<letter.geometry.strokes.length;index++){
  await draw(page,(await boardModels(page)).strokes[index]);
  await page.screenshot({path:`${root}/${browserName}-${letter.id}-${mode}-unobscured.png`,animations:'disabled'});
  if(index<letter.geometry.strokes.length-1){await expect(page.locator('.book-completed')).toHaveCount(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id',letter.geometry.strokes[index+1].id);}
 }
 if(letter.geometry.dotTargets.length){await expect(page.locator('.book-completed')).toHaveCount(0);await tapDots(page);}
 await expect(page.locator('.book-completed')).toBeVisible();
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
 expect(record).toMatchObject({letterId:letter.id,contentVersion:letter.contentVersion,preview:false,geometryStatus:'approved',audioStatus:'approved',mode,metrics:{dotCount:letter.geometry.dotTargets.length}});
 await page.screenshot({path:`${root}/${browserName}-${letter.id}-${mode}-complete.png`,animations:'disabled'});
 await page.reload();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts)).toContainEqual(record);
});
test('Ye is absent from every catalogue page and teacher audio choices; old records remain saved',async({page,browserName})=>{
 const old={id:'ye-historical',timestamp:'2026-10-07T01:00:00Z',profile:'Bunga',letterId:'ye',mode:'play',pointerType:'mouse',toleranceProfile:'fixture',contentVersion:3,outcome:'playComplete',preview:false,geometryStatus:'approved',audioStatus:'approved',assistance:0,retries:0,metrics:{coverage:1,meanError:0,invalidTravel:0,invalidEvents:0}};
 await page.addInitScript(record=>{if(!localStorage.getItem('taman-jawi.progress.v1'))localStorage.setItem('taman-jawi.progress.v1',JSON.stringify({version:1,profile:'Bunga',attempts:[record],copies:[]}));},old);
 await instrument(page);await page.setViewportSize({width:768,height:1024});await page.goto('/');await dismissSplash(page);
 await page.getByRole('button',{name:'Jom mula',exact:true}).click();await page.getByRole('button',{name:'Semua huruf',exact:true}).click();
 await expect(page.locator('.garden-count')).toHaveText('36 huruf untuk dikenali');
 const seen=[];for(let i=0;i<40;i++){
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  seen.push(...await page.locator('.letter-card').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label'))));
  await expect(page.getByRole('button',{name:'Ye',exact:true})).toHaveCount(0);
  const next=page.getByRole('button',{name:'Halaman huruf seterusnya',exact:true});if(!await next.isEnabled())break;await next.click();
 }
 expect(new Set(seen).size).toBe(36);expect(seen.some(label=>/^Ya(?:,|$)/.test(label))).toBe(true);expect(seen.some(label=>/^Nya(?:,|$)/.test(label))).toBe(true);
 await page.screenshot({path:`${root}/${browserName}-catalogue-without-ye.png`,animations:'disabled'});
 await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Suara',exact:true}).click();
 const options=await page.getByLabel('Huruf untuk semakan suara').locator('option').evaluateAll(nodes=>nodes.map(n=>n.value));
 expect(options).toEqual(letters.map(l=>l.id));expect(options).not.toContain('ye');
 await page.getByLabel('Huruf untuk semakan suara').selectOption('ya');await page.getByRole('button',{name:'Rakaman seterusnya',exact:true}).click();
 await expect(page.getByLabel('Huruf untuk semakan suara')).toHaveValue('nya');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts)).toEqual([old]);
});
test('Ya turns directly to Nya, and Nya ends the 36-letter book',async({page})=>{
 const ya=letters.find(l=>l.id==='ya');await page.setViewportSize({width:768,height:1024});await student(page,ya);
 await draw(page,(await boardModels(page)).strokes[0]);await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();
 await page.getByRole('button',{name:'Huruf seterusnya',exact:true}).click();await expect(page.locator('.stage-badge')).toContainText('Nya');
 await expect(page.locator('.stage-badge')).toContainText('36/36');
 await draw(page,(await boardModels(page)).strokes[0]);await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();
 await page.getByRole('button',{name:'Huruf seterusnya',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Hebat, sampai halaman terakhir!',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Huruf seterusnya',exact:true})).toBeDisabled();
});
for(const letter of approved)test(`${letter.id}: approved demonstration preserves earned progress`,async({page})=>{
 await student(page,letter);await page.emulateMedia({reducedMotion:'no-preference'});
 const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.2)));
 const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
 await menuAction(page,'Tunjuk cara');await expect(page.locator('.demonstration-ink').first()).toHaveAttribute('d',letter.geometry.strokes[0].path);
 await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
 expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);await expect(page.locator('.book-completed')).toHaveCount(0);
});
for(const [width,height]of [[320,600],[768,1024]])test(`review ${width}: all matching approvals and no current proposals in any category`,async({page,browserName})=>{
 await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
 const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await expect(page.locator('.record-grid-host')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await settle();
 for(const letter of approved){
  const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:letter.labelMs,exact:true})}),next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true}),previous=page.getByRole('button',{name:'Halaman kandungan sebelumnya',exact:true});
  for(let i=0;i<40&&!(await card.isVisible())&&await previous.isEnabled();i++){await previous.click();await settle();}
  for(let i=0;i<40&&!(await card.isVisible())&&await next.isEnabled();i++){await next.click();await settle();}await expect(card).toContainText(`Diluluskan · ${letter.contentVersion}`);
 }
 await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
 for(const scope of ['video','outline','ain-outline','direction','sin-syin-tail','ta-za-stem','ha-direction']){
  await page.getByLabel('Jenis semakan').selectOption(scope);await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
 }
 await page.screenshot({path:`${root}/${browserName}-all-approved-${width}.png`,animations:'disabled'});
});
for(const letter of approved)for(const mode of ['solo','duo'])test(`${letter.id} ${mode}: approved scored lanes complete independently`,async({page})=>{
 await page.setViewportSize({width:1024,height:768});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(url=>history.replaceState(null,'',url),`/?approved=1&letter=${letter.id}&mode=${mode}`);
 await page.addScriptTag({content:readFileSync('output/verification/hamzah-ye/test-harness.js','utf8')});
 const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
 for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
 await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
 for(let slot=0;slot<count;slot++){
  const board=page.locator('.trace-board').nth(slot);for(let i=0;i<letter.geometry.strokes.length;i++)await draw(page,(await boardModels(page,board)).strokes[i]);await tapDots(page,board);await expect(board).toHaveAttribute('data-phase','complete');
  if(slot===0&&count===2)await expect(page.locator('.trace-board').nth(1)).toHaveAttribute('data-phase','awaitingStart');
 }
 await expect(page.locator('.round-result')).toBeVisible();
 const attempts=await page.evaluate(()=>window.outlineAttempts);expect(attempts).toHaveLength(count);for(const attempt of attempts)expect(attempt).toEqual({letterId:letter.id,contentVersion:letter.contentVersion,geometryStatus:'approved',unscored:false});
 for(const text of await page.locator('.round-score-grid strong').allTextContents())expect(text).not.toContain('—');
 await page.getByRole('button',{name:'Lihat keputusan',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.outlineResult?.status)).toBe('completed');
 const result=await page.evaluate(()=>window.outlineResult);expect(result).toMatchObject({unscored:false,letterIds:[letter.id]});
 for(const player of result.rounds[0].players)expect(player).toMatchObject({outcome:'playComplete',metrics:{dotCount:letter.geometry.dotTargets.length}});
});
