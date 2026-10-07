import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';

const input='C:/Users/azrin/OneDrive/Documents/Sound Recordings/Recording (5).m4a';
const root='output/verification/nga-audio';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
mkdirSync(root,{recursive:true});
ok(!existsSync(`${root}/source.json`),'Keep existing preparation evidence.');
const bytes=readFileSync(input),raw=readFileSync('src/content/letters.json'),letters=JSON.parse(raw);
writeFileSync(`${root}/source-user.m4a`,bytes,{flag:'wx'});
writeFileSync(`${root}/before-catalogue.json`,raw,{flag:'wx'});
const previous=JSON.parse(readFileSync('output/verification/ta-za-approval/inputs.json'));
strictEqual(hash(raw),previous.hashes['src/content/letters.json']);
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const decoded=await page.evaluate(async encoded=>{
  const context=new AudioContext({sampleRate:24000});
  try{
   const buffer=await context.decodeAudioData(Uint8Array.from(atob(encoded),char=>char.charCodeAt(0)).buffer),mono=new Float32Array(buffer.length);
   for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const samples=buffer.getChannelData(channel);for(let i=0;i<samples.length;i++)mono[i]+=samples[i]/buffer.numberOfChannels;
   }
   let binary='';const pcm=new Uint8Array(mono.buffer);for(let from=0;from<pcm.length;from+=8192)binary+=String.fromCharCode(...pcm.subarray(from,from+8192));
   return {sampleRate:buffer.sampleRate,duration:buffer.duration,sourceChannels:buffer.numberOfChannels,pcm:btoa(binary)};
  }finally{await context.close();}
 },bytes.toString('base64'));
 const pcm=Buffer.from(decoded.pcm,'base64'),count=pcm.length/4,wave=Buffer.alloc(44+count*2),rms=[];
 wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);
 wave.writeUInt32LE(decoded.sampleRate,24);wave.writeUInt32LE(decoded.sampleRate*2,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(count*2,40);
 let peak=0;for(let i=0;i<count;i++){const sample=pcm.readFloatLE(i*4);peak=Math.max(peak,Math.abs(sample));wave.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),44+i*2);}
 const step=Math.round(.02*decoded.sampleRate);
 for(let from=0;from<count;from+=step){let sum=0;const to=Math.min(count,from+step);for(let i=from;i<to;i++)sum+=pcm.readFloatLE(i*4)**2;rms.push({t:+(from/decoded.sampleRate).toFixed(2),rms:+Math.sqrt(sum/(to-from)).toFixed(6)});}
 writeFileSync(`${root}/source-user.wav`,wave,{flag:'wx'});
 const report={date:'2026-10-07',letterId:'nga',transcriptMs:'Nga',sourceFile:input,sourceSha256:hash(bytes),sourceBytes:bytes.length,
  sourceDuration:decoded.duration,sourceChannels:decoded.sourceChannels,decodedRate:decoded.sampleRate,peak,rms,
  catalogueSha256:hash(raw),protectedRecordings:Object.fromEntries(letters.map(letter=>[letter.audio.name.src,hash(readFileSync(`public${letter.audio.name.src}`))]))};
 writeFileSync(`${root}/source.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 const active=rms.filter(frame=>frame.rms>.008);const regions=[];for(const frame of active){let region=regions.at(-1);if(!region||frame.t-region.end>.14)regions.push(region={start:frame.t,end:frame.t});else region.end=frame.t;}
 console.log(JSON.stringify({duration:decoded.duration,channels:decoded.sourceChannels,rate:decoded.sampleRate,peak,regions}));
}finally{await browser.close();}
