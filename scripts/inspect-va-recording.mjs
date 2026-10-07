import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='output/verification/va-audio';mkdirSync(root,{recursive:true});
const letters=JSON.parse(readFileSync('src/content/letters.json','utf8')),va=letters.find(l=>l.id==='va'),path=`public${va.audio.name.src}`,bytes=readFileSync(path);
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const decoded=await page.evaluate(async encoded=>{
  const ctx=new AudioContext({sampleRate:24000});try{
   const buffer=await ctx.decodeAudioData(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer),data=buffer.getChannelData(0);let peak=0,clipped=0;const rms=[];
   for(const p of data){peak=Math.max(peak,Math.abs(p));if(Math.abs(p)>=.999)clipped++;}
   const step=Math.round(buffer.sampleRate*.02);for(let i=0;i<data.length;i+=step){let power=0;const end=Math.min(data.length,i+step);for(let j=i;j<end;j++)power+=data[j]**2;rms.push({t:+(i/buffer.sampleRate).toFixed(2),rms:+Math.sqrt(power/(end-i)).toFixed(6)});}
   return {duration:buffer.duration,sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,peak,clippedSamples:clipped,rms};
  }finally{await ctx.close();}
 },bytes.toString('base64'));
 const active=decoded.rms.filter(f=>f.rms>.008),regions=[];for(const frame of active){let r=regions.at(-1);if(!r||frame.t-r.end>.14)regions.push(r={start:frame.t,end:frame.t+.02});else r.end=frame.t+.02;}
 const report={date:'2026-10-07',recording:va.audio.name,path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),...decoded,activeRegionsApprox:regions,
  decode:'Chromium Web Audio decodeAudioData succeeded',pronunciationAssessment:'User reports wrong pronunciation. Decode/envelope metrics cannot establish phonetic accuracy.',reference:'Awaiting user identification of Va sample; Recording (6).m4a found but not yet confirmed.'};
 writeFileSync(`${root}/current-analysis.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({revision:va.audio.name.version,bytes:bytes.length,duration:decoded.duration,clippedSamples:decoded.clippedSamples,regions,referenceConfirmed:false}));
}finally{await browser.close();}
