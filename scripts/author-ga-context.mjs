import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';

const followup=process.argv.includes('--guided-followup');
const guided=followup||process.argv.includes('--guided');
const root='output/verification/ga-audio-review/'+(followup?'guided-malay-followup-v9':guided?'guided-malay-v8':'garden-context-v6');
const report=JSON.parse(readFileSync(`${root}/source-generation.json`));
const bytes=readFileSync(report.sourceFile);
strictEqual(createHash('sha256').update(bytes).digest('hex'),report.sourceSha256);
const browser=await chromium.launch();
try{
  const page=await browser.newPage();
  const decoded=await page.evaluate(async encoded=>{
    const context=new AudioContext({sampleRate:24000});
    try{
      const buffer=await context.decodeAudioData(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer);
      const raw=new Uint8Array(buffer.getChannelData(0).slice().buffer);
      let binary='';for(let from=0;from<raw.length;from+=8192)binary+=String.fromCharCode(...raw.subarray(from,from+8192));
      return {sampleRate:buffer.sampleRate,duration:buffer.duration,samples:btoa(binary)};
    }finally{await context.close();}
  },bytes.toString('base64'));
  const raw=Buffer.from(decoded.samples,'base64'),count=raw.length/4;
  const wave=Buffer.alloc(44+count*2);
  wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);
  wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(decoded.sampleRate,24);
  wave.writeUInt32LE(decoded.sampleRate*2,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);
  wave.write('data',36);wave.writeUInt32LE(count*2,40);
  for(let i=0;i<count;i++)wave.writeInt16LE(Math.round(Math.max(-1,Math.min(1,raw.readFloatLE(i*4)))*32767),44+i*2);
  writeFileSync(`${root}/${guided?'source-guided':'source-garden'}.wav`,wave);
  console.log(JSON.stringify({duration:decoded.duration,sampleRate:decoded.sampleRate,decoded:true}));
}finally{await browser.close();}
