import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual} from 'node:assert';

const input='C:/Users/azrin/OneDrive/Documents/Sound Recordings/Recording (4).m4a';
const root='output/verification/ga-audio-review/user-recording-v7';
mkdirSync(root,{recursive:true});
const bytes=readFileSync(input),sourceHash=createHash('sha256').update(bytes).digest('hex');
if(existsSync(`${root}/source-user.m4a`))strictEqual(createHash('sha256').update(readFileSync(`${root}/source-user.m4a`)).digest('hex'),sourceHash);
else writeFileSync(`${root}/source-user.m4a`,bytes);
const raw=readFileSync('src/content/letters.json'),letters=JSON.parse(raw);
if(!existsSync(`${root}/before-catalogue.json`))writeFileSync(`${root}/before-catalogue.json`,raw);
const browser=await chromium.launch();
try{
  const page=await browser.newPage();
  const decoded=await page.evaluate(async encoded=>{
    const context=new AudioContext({sampleRate:24000});
    try{
      const buffer=await context.decodeAudioData(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer);
      const mono=new Float32Array(buffer.length);
      for(let channel=0;channel<buffer.numberOfChannels;channel++){
        const samples=buffer.getChannelData(channel);for(let i=0;i<samples.length;i++)mono[i]+=samples[i]/buffer.numberOfChannels;
      }
      const pcm=new Uint8Array(mono.buffer);let binary='';
      for(let from=0;from<pcm.length;from+=8192)binary+=String.fromCharCode(...pcm.subarray(from,from+8192));
      return {sampleRate:buffer.sampleRate,duration:buffer.duration,sourceChannels:buffer.numberOfChannels,pcm:btoa(binary)};
    }finally{await context.close();}
  },bytes.toString('base64'));
  const pcm=Buffer.from(decoded.pcm,'base64'),count=pcm.length/4,wave=Buffer.alloc(44+count*2);
  wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);
  wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(decoded.sampleRate,24);
  wave.writeUInt32LE(decoded.sampleRate*2,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);
  wave.write('data',36);wave.writeUInt32LE(count*2,40);
  for(let i=0;i<count;i++)wave.writeInt16LE(Math.round(Math.max(-1,Math.min(1,pcm.readFloatLE(i*4)))*32767),44+i*2);
  writeFileSync(`${root}/source-user.wav`,wave);
  const report={date:'2026-10-06',letterId:'ga',transcriptMs:'Ga',version:7,status:'pendingReview',review:null,
    sourceFile:`${root}/source-user.m4a`,sourceSha256:sourceHash,sourceBytes:bytes.length,
    sourceDuration:decoded.duration,sourceChannels:decoded.sourceChannels,decodedRate:decoded.sampleRate,
    permission:'User supplied this recording as a pronunciation reference after request in Codex on 2026-10-06; direct game reuse has not yet been confirmed.',
    origin:{kind:'userProvided',reference:'User attachment Recording (4).m4a',speaker:'User-supplied speaker; identity not assessed',sha256:sourceHash},
    previousRecording:letters.find(letter=>letter.id==='ga').audio.name,
    catalogueSha256:createHash('sha256').update(raw).digest('hex'),
    protectedRecordings:Object.fromEntries(letters.map(letter=>[letter.audio.name.src,createHash('sha256').update(readFileSync(`public${letter.audio.name.src}`)).digest('hex')]))};
  writeFileSync(`${root}/source-generation.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({sourceDuration:decoded.duration,channels:decoded.sourceChannels,sampleRate:decoded.sampleRate,sourceCopied:true}));
}finally{await browser.close();}
