import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {instrument,voices} from './helpers/audio.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ga=letters.find(letter=>letter.id==='ga');
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/ga-audio-approval/browser';
mkdirSync(root,{recursive:true});test.setTimeout(90000);
const hear=page=>page.locator('.stage-badge').getByRole('button',{name:'Dengar nama Ga',exact:true});
async function openStudent(page,mode='play'){
  await page.goto('/');await dismissSplash(page);
  if(mode!=='play'){
    await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
    await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button',{name:'Kembali',exact:true}).click();
  }
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,'Ga');
  await expect(page.locator('.preview-banner')).toHaveCount(0);await boardModels(page);
}
for(const mode of ['play','guided','precision'])for(const [width,height]of [[320,600],[768,1024]])
test(`Ga ${mode} ${width}: supplied sound, replay and student completion`,async({page,browserName})=>{
  await page.setViewportSize({width,height});await instrument(page,{voiceMs:40});await openStudent(page,mode);
  await hear(page).click();await hear(page).press('Enter');
  const played=await voices(page);expect(played).toHaveLength(2);expect(played.every(event=>event.src===ga.audio.name.src)).toBe(true);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts)).toHaveLength(0);
  if(mode==='play')await page.screenshot({path:`${root}/${browserName}-ga-${width}.png`,animations:'disabled'});
  const count=(await boardModels(page)).strokes.length;
  for(let i=0;i<count;i++)await draw(page,(await boardModels(page)).strokes[i]);
  await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();
  expect((await voices(page)).at(-1).src).toBe(ga.audio.name.src);
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record).toMatchObject({letterId:'ga',contentVersion:ga.contentVersion,audioVersion:7,preview:false,audioStatus:'approved',mode});
});

test('Ga replay preserves partial tracing, obeys mute and stops on letter change',async({page})=>{
  // Keep the controlled voice active while the slower WebKit menu opens.
  // Native clip duration is verified separately; this case tests cancellation.
  await instrument(page,{voiceMs:60000});await openStudent(page);
  const points=(await boardModels(page)).strokes[0];await draw(page,points.slice(0,Math.floor(points.length*.3)));
  const frontier=await page.locator('.play-fill').first().getAttribute('data-measured-frontier');
  await hear(page).click();expect(await page.locator('.play-fill').first().getAttribute('data-measured-frontier')).toBe(frontier);
  await menuAction(page,'Senyapkan audio');await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Tutup',exact:true}).click();
  await hear(page).click();expect((await voices(page)).at(-1)).toMatchObject({src:ga.audio.name.src,muted:true});
  await menuAction(page,'Hidupkan audio');await page.getByRole('dialog',{name:'Menu permainan'}).getByRole('button',{name:'Tutup',exact:true}).click();
  await hear(page).click();const paused=await page.evaluate(()=>window.__media.voicePauses);
  await menuAction(page,'Huruf seterusnya');
  await expect(page.locator('.stage-badge').getByRole('button',{name:'Dengar nama Lam',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.__media.voicePauses)).toBeGreaterThan(paused);
  await page.locator('.stage-badge').getByRole('button',{name:'Dengar nama Lam',exact:true}).click();
  expect((await voices(page)).at(-1).src).toBe(letters.find(letter=>letter.id==='lam').audio.name.src);
});

test('teacher review identifies and replays the selected user recording',async({page})=>{
  await instrument(page);await page.goto('/');await dismissSplash(page);
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Suara',exact:true}).click();
  await page.getByLabel('Huruf untuk semakan suara').selectOption('ga');
  await expect(page.locator('.audio-review-transcript')).toContainText('Rakaman pilihan anda');
  await expect(page.locator('.audio-review-transcript')).toContainText('Suara diluluskan');
  for(let i=0;i<2;i++)await page.getByRole('button',{name:'Dengar rakaman Ga',exact:true}).click();
  expect((await voices(page)).map(event=>event.src)).toEqual([ga.audio.name.src,ga.audio.name.src]);
  await expect(page.locator('.audio-notice')).toContainText('Rakaman Ga dimainkan.');
});

for(const mode of ['solo','duo'])test(`Ga ${mode}: selected fallback during readiness and racing`,async({page})=>{
  await instrument(page);await page.goto('/');await dismissSplash(page);await page.clock.install();
  await page.getByRole('button',{name:mode==='duo'?'Duo 1v1':/Cabaran trofi/,exact:mode==='duo'}).click();
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await page.getByRole('button',{name:'Seterusnya',exact:true}).click();
  await page.getByLabel('Kumpulan huruf').selectOption('ready');
  const index=letters.findIndex(letter=>letter.id==='ga');
  // Select Ga in the real shuffle, preserving all other choices and normal routes.
  await page.evaluate(({last,index})=>{let i=last;Math.random=()=>i--===index?0:.99999;},{last:letters.length-1,index});
  if(mode==='duo'){
    await page.getByRole('button',{name:'Uji dua sentuhan'}).click();await page.getByRole('button',{name:/Pratonton susun atur dewasa/}).click();
  }else await page.getByRole('button',{name:'Buka cabaran Solo',exact:true}).click();
  const button=page.locator('.arena-hud-right').getByRole('button',{name:'Dengar nama Ga',exact:true});
  await expect(button).toBeVisible();await button.click();expect((await voices(page)).at(-1).src).toBe(ga.audio.name.src);
  for(let slot=0;slot<(mode==='duo'?2:1);slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  await page.clock.fastForward(3100);await expect(page.locator('.countdown-overlay')).toHaveCount(0);
  await button.click();expect((await voices(page)).at(-1).src).toBe(ga.audio.name.src);
  await expect(page.locator('.trace-board').first()).toHaveAttribute('data-phase','awaitingStart');
});

test('native Chromium: packaged full Ga decodes and plays twice to its ending',async({page,browserName})=>{
  test.skip(browserName!=='chromium','Known Windows WebKit native audio codec limitation; controlled tests cover its UI.');
  await page.addInitScript(()=>{
    const NativeAudio=window.Audio;window.nativeGa={starts:0,ended:0};
    window.Audio=function(...args){const element=new NativeAudio(...args);
      element.addEventListener('playing',()=>{if(element.src.endsWith('/ga-name-v7.wav')&&!element.muted&&!element.__jawiPrime)window.nativeGa.starts++;});
      element.addEventListener('ended',()=>{if(element.src.endsWith('/ga-name-v7.wav')&&!element.muted)window.nativeGa.ended++;});return element;};
    window.Audio.prototype=NativeAudio.prototype;
  });
  await openStudent(page);await hear(page).focus();
  const metrics=await page.evaluate(async src=>{
    const raw=await(await fetch(src)).arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',raw);
    const context=new AudioContext();try{
      const buffer=await context.decodeAudioData(raw);let clipped=0;
      for(const sample of buffer.getChannelData(0))if(Math.abs(sample)>=.999)clipped++;
      return {sha256:[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join(''),duration:buffer.duration,clipped};
    }finally{await context.close();}
  },ga.audio.name.src);
  expect(metrics).toEqual({sha256:createHash('sha256').update(readFileSync(`public${ga.audio.name.src}`)).digest('hex'),duration:1.05,clipped:0});
  for(let count=1;count<=2;count++){
    await hear(page).press('Enter');await expect.poll(()=>page.evaluate(()=>window.nativeGa.ended)).toBe(count);
  }
  expect(await page.evaluate(()=>window.nativeGa.starts)).toBe(2);
  await expect(page.getByRole('dialog',{name:'Dengar nama huruf'})).toHaveCount(0);
  writeFileSync(`${root}/native-playback.json`,JSON.stringify({date:'2026-10-06',browserName,src:ga.audio.name.src,
    metrics,playback:await page.evaluate(()=>window.nativeGa)},null,2)+'\n');
});
