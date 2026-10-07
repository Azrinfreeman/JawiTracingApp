import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {instrument,voices} from './helpers/audio.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {openLesson,boardModels,draw,menuAction} from './helpers/tracing.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {mkdirSync} from 'node:fs';
const evidence=process.env.JAWI_EVIDENCE_DIR||'output/verification/inline-letter-audio/browser';mkdirSync(evidence,{recursive:true});
const stageHear=page=>page.locator('.stage-badge').getByRole('button',{name:/^Dengar nama /});
async function layout(page){
  await page.evaluate(()=>document.fonts.ready);await boardModels(page);
  const state=await page.locator('.stage-badge').evaluate(badge=>{
    const button=badge.querySelector('button'),title=badge.querySelector('h1');
    const b=button.getBoundingClientRect(),h=title.getBoundingClientRect(),container=badge.getBoundingClientRect();
    const overlap=(a,c)=>a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom;
    const labels=[...document.querySelectorAll('.trace-number-label-backdrop,.trace-number-badge')];
    return {below:b.top>=h.bottom,touch:b.width>=48&&b.height>=48,inside:b.left>=0&&b.right<=innerWidth&&b.bottom<=innerHeight,
      clear:labels.every(n=>!overlap(n.getBoundingClientRect(),container)),scroll:document.documentElement.scrollWidth<=innerWidth};
  });expect(state).toEqual({below:true,touch:true,inside:true,clear:true,scroll:true});
}
for(const [width,height]of [[320,600],[768,1024]])test(`all 36 letters: direct current sound and clear badge ${width}x${height}`,async({page,browserName})=>{
  test.setTimeout(240000);await page.setViewportSize({width,height});await instrument(page);
  await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();
  for(const [index,letter]of letters.entries()){
    await chooseLetter(page,letter.labelMs);await expect(stageHear(page)).toHaveAccessibleName(`Dengar nama ${letter.labelMs}`);
    await expect(stageHear(page)).toBeEnabled();await layout(page);
    const before=(await voices(page)).length;await stageHear(page).click();
    await expect.poll(async()=>(await voices(page)).length).toBe(before+1);
    expect((await voices(page)).at(-1).src).toBe(letter.audio.name.src);
    await expect(page.getByRole('dialog',{name:'Menu permainan'})).toHaveCount(0);
    await expect(page.locator('.book-completed')).toHaveCount(0);
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts)).toHaveLength(0);
    if(['ha-pedat','ta-marbuta','zai','lam'].includes(letter.id))await page.screenshot({path:`${evidence}/${browserName}-${letter.id}-${width}.png`,animations:'disabled'});
    if(index<letters.length-1)await menuAction(page,'Isi kandungan');
  }
});
test('keyboard replay preserves partial tracing, switches with the page and obeys mute',async({page})=>{
  await instrument(page);await openLesson(page,'Fa','play');
  const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.25)));
  const frontier=await page.locator('.play-fill').first().getAttribute('data-measured-frontier');
  await stageHear(page).focus();await page.keyboard.press('Enter');await stageHear(page).press('Space');
  expect(await voices(page)).toHaveLength(2);expect(await page.locator('.play-fill').first().getAttribute('data-measured-frontier')).toBe(frontier);
  await menuAction(page,'Senyapkan audio');await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Tutup',exact:true}).click();
  await stageHear(page).click();expect((await voices(page)).filter(play=>!play.muted)).toHaveLength(2);expect((await voices(page)).at(-1).muted).toBe(true);
  await menuAction(page,'Hidupkan audio');await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Tutup',exact:true}).click();
  await menuAction(page,'Huruf seterusnya');await expect(stageHear(page)).toHaveAccessibleName('Dengar nama Pa');await stageHear(page).click();
  expect((await voices(page)).at(-1).src).toBe(letters.find(l=>l.id==='pa').audio.name.src);
});
for(const mode of ['guided','precision'])test(`${mode}: direct sound is available without recording a completion`,async({page})=>{
  await instrument(page);await openLesson(page,'Ha (ح)',mode);await stageHear(page).click();
  expect((await voices(page)).at(-1).src).toBe(letters.find(l=>l.id==='ha-pedat').audio.name.src);await expect(page.locator('.book-completed')).toHaveCount(0);
});
test('copying retains the direct sound button and its freehand ink',async({page})=>{
  await instrument(page);await openLesson(page,'Alif','play');await draw(page,(await boardModels(page)).strokes[0]);
  await page.getByRole('button',{name:'Sekarang, cuba salin sendiri'}).click();
  const board=page.locator('.copy-board');await board.scrollIntoViewIfNeeded();
  const bounds=await board.boundingBox();await draw(page,[{x:bounds.x+bounds.width*.4,y:bounds.y+bounds.height*.4},{x:bounds.x+bounds.width*.6,y:bounds.y+bounds.height*.6}]);
  const before=await page.locator('.pupil-ink').getAttribute('d');await stageHear(page).click();expect(await page.locator('.pupil-ink').getAttribute('d')).toBe(before);
});
test('a failed direct playback has the existing recovery dialog',async({page})=>{
  await instrument(page,{failVoice:true});await openLesson(page,'Ha (ح)','play');await stageHear(page).click();
  await expect(page.getByRole('dialog',{name:'Dengar nama huruf'})).toBeVisible();
  await expect(page.getByRole('dialog',{name:'Dengar nama huruf'})).toContainText('Dengar');
  await page.getByRole('button',{name:'Tutup',exact:true}).click();await expect(stageHear(page)).toBeEnabled();
});
for(const mode of ['solo','duo'])for(const [width,height]of [[390,844],[1280,800]])test(`${mode}: sound beneath the current letter during readiness and racing ${width}`,async({page,browserName})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height});await instrument(page);await page.addInitScript(()=>{Math.random=()=>.99999;});
  await page.goto('/');await dismissSplash(page);await page.clock.install();
  if(mode==='duo')await page.getByRole('button',{name:'Duo 1v1',exact:true}).click();else await page.getByRole('button',{name:/Cabaran trofi/}).click();
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await page.getByRole('button',{name:'Seterusnya',exact:true}).click();
  if(mode==='duo'){await page.getByRole('button',{name:'Uji dua sentuhan'}).click();await page.getByRole('button',{name:/Pratonton susun atur dewasa/}).click();}
  else await page.getByRole('button',{name:'Buka cabaran Solo'}).click();
  const button=page.locator('.arena-hud-right').getByRole('button',{name:/^Dengar nama/});
  await expect(button).toBeEnabled();await button.click();expect(await voices(page)).toHaveLength(1);
  const selected=await button.getAttribute('aria-label');expect((await voices(page)).at(-1).src).toBe(letters.find(l=>`Dengar nama ${l.labelMs}`===selected).audio.name.src);
  const placement=await page.locator('.arena-letter-audio').evaluate(group=>{const r=group.querySelector('.arena-round').getBoundingClientRect(),b=group.querySelector('button').getBoundingClientRect();return b.top>=r.bottom&&b.width>=48&&b.height>=48&&b.right<=innerWidth;});expect(placement).toBe(true);
  for(let slot=0;slot<(mode==='duo'?2:1);slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  await page.clock.fastForward(3100);await expect(page.locator('.countdown-overlay')).toHaveCount(0);await button.click();
  expect(await voices(page)).toHaveLength(2);await expect(page.getByRole('dialog',{name:'Rehat sekejap'})).toHaveCount(0);
  await expect(page.locator('.trace-board').first()).toHaveAttribute('data-phase','awaitingStart');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${evidence}/${browserName}-${mode}-${width}.png`,animations:'disabled'});
});
test('actual Chromium direct playback starts the selected recording',async({page,browserName})=>{
  test.skip(browserName!=='chromium','Recorded Windows WebKit native codec limitation; controlled playback checks cover its UI.');
  await page.addInitScript(()=>{
    const NativeAudio=window.Audio;window.directAudio=[];window.Audio=function(...args){const audio=new NativeAudio(...args);audio.addEventListener('playing',()=>{audio.started=true;});window.directAudio.push(audio);return audio;};window.Audio.prototype=NativeAudio.prototype;
  });await openLesson(page,'Ha (ح)','play');await stageHear(page).click();
  const src=letters.find(l=>l.id==='ha-pedat').audio.name.src;
  await expect.poll(()=>page.evaluate(src=>window.directAudio.some(audio=>audio.src.endsWith(src)&&audio.started&&audio.currentTime>0),src)).toBe(true);
});
test('desktop badge remains beneath short and long names with clear guides',async({page,browserName})=>{
  test.setTimeout(90000);await page.setViewportSize({width:1920,height:1080});await instrument(page);
  for(const label of ['Ha (ح)','Ta marbutah','Zai']){
    await openLesson(page,label,'play');await layout(page);await expect(stageHear(page)).toBeEnabled();await stageHear(page).click();
    if(label==='Ha (ح)')await page.screenshot({path:`${evidence}/${browserName}-ha-pedat-desktop.png`,animations:'disabled'});
  }
});
