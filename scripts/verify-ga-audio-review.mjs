import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';

const variant=process.argv[2]||'gaa';
const revisions={gaa:2,gaar:3,gaaa:4,gah:4,'gar-calm':5,'garden-context':6,'user-recording':7,'guided-malay':8,'guided-malay-followup':9};
ok(Object.hasOwn(revisions,variant));
const root='output/verification/ga-audio-review'+(variant==='gaa'?'':`/${variant}-v${revisions[variant]}`);
const report=JSON.parse(readFileSync(`${root}/generation.json`));
const extension=['garden-context','user-recording','guided-malay','guided-malay-followup'].includes(variant)?'wav':'mp3';
strictEqual(report.src,`/audio/letters/review/ga-name-v${report.version}-${variant}.${extension}`);
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
strictEqual(hash('src/content/letters.json'),report.catalogueSha256);
for(const [src,sha]of Object.entries(report.protectedRecordings))strictEqual(hash(`public${src}`),sha);
const bytes=readFileSync(`public${report.src}`);
strictEqual(hash(`public${report.src}`),report.sha256);
const browser=await chromium.launch();
try{
  const page=await browser.newPage();
  await page.route('http://127.0.0.1:5173/**',route=>route.fulfill({
    status:200,contentType:extension==='wav'?'audio/wav':'audio/mpeg',body:bytes,
  }));
  await page.setContent('<button id="play">Play Ga sample</button><audio></audio>');
  const metrics=await page.evaluate(async({src,encoded})=>{
    const context=new AudioContext();
    try{
      const array=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
      const buffer=await context.decodeAudioData(array.buffer);
      const samples=buffer.getChannelData(0);
      let sum=0,peak=0,clipped=0;
      for(const sample of samples){sum+=sample*sample;peak=Math.max(peak,Math.abs(sample));if(Math.abs(sample)>=.999)clipped++;}
      const audio=document.querySelector('audio');audio.src=src;
      window.gaPlayback={starts:0,ended:0};
      audio.addEventListener('ended',()=>window.gaPlayback.ended++);
      document.querySelector('button').onclick=async()=>{await audio.play();window.gaPlayback.starts++;};
      return {duration:buffer.duration,sampleRate:buffer.sampleRate,rms:Math.sqrt(sum/samples.length),peak,clippedFraction:clipped/samples.length};
    }finally{await context.close();}
  },{src:`http://127.0.0.1:5173${report.src}`,encoded:bytes.toString('base64')});
  ok(metrics.duration>.3&&metrics.duration<8);ok(metrics.rms>.003);ok(metrics.clippedFraction<.001);
  for(let i=1;i<=2;i++){
    await page.getByRole('button',{name:'Play Ga sample',exact:true}).click();
    await page.waitForFunction(count=>window.gaPlayback.ended===count,i,{timeout:10000});
  }
  const playback=await page.evaluate(()=>window.gaPlayback);strictEqual(playback.starts,2);strictEqual(playback.ended,2);
  const verification={date:'2026-10-06',node:process.version,browser:browser.version(),
    src:report.src,sha256:report.sha256,metrics,playback,catalogueAndAll37ActiveRecordingsPreserved:true,
    pronunciationReviewed:false,scope:`Isolated revision-${report.version} candidate decode, signal integrity and native Chromium play/replay; no pronunciation approval or student replacement.`};
  writeFileSync(`${root}/verification.json`,JSON.stringify(verification,null,2)+'\n');
  console.log(JSON.stringify({duration:metrics.duration,rms:metrics.rms,clippedFraction:metrics.clippedFraction,nativePlays:2,preservedRecordings:37,pronunciationApproval:false}));
}finally{await browser.close();}
