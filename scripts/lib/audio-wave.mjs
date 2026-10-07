import {chromium} from '@playwright/test';
export async function decodeMono24k(bytes){
 const browser=await chromium.launch();try{
  const page=await browser.newPage(),decoded=await page.evaluate(async encoded=>{
   const context=new AudioContext({sampleRate:24000});try{
    const buffer=await context.decodeAudioData(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer),mono=new Float32Array(buffer.length);
    for(let c=0;c<buffer.numberOfChannels;c++){const values=buffer.getChannelData(c);for(let i=0;i<values.length;i++)mono[i]+=values[i]/buffer.numberOfChannels;}
    const bytes=new Uint8Array(mono.buffer);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    return {rate:buffer.sampleRate,channels:buffer.numberOfChannels,duration:buffer.duration,pcm:btoa(binary)};
   }finally{await context.close();}
  },bytes.toString('base64'));
  const floats=Buffer.from(decoded.pcm,'base64'),pcm=Buffer.alloc(floats.length/2);for(let i=0;i<floats.length/4;i++)pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,floats.readFloatLE(i*4)))*32767),i*2);
  return {wave:encodeWave(pcm,decoded.rate),rate:decoded.rate,sourceChannels:decoded.channels,duration:decoded.duration};
 }finally{await browser.close();}
}
export function encodeWave(pcm,rate){
 const wave=Buffer.alloc(44+pcm.length);wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(rate,24);wave.writeUInt32LE(rate*2,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(pcm.length,40);pcm.copy(wave,44);return wave;
}
export function waveAnalysis(wave){
 const rate=wave.readUInt32LE(24),n=wave.readUInt32LE(40)/2,step=Math.round(rate*.02),rms=[];let peak=0,clipped=0;
 for(let i=0;i<n;i++){const x=wave.readInt16LE(44+i*2)/32768;peak=Math.max(peak,Math.abs(x));if(Math.abs(x)>=.999)clipped++;}
 for(let i=0;i<n;i+=step){const end=Math.min(n,i+step);let sum=0;for(let j=i;j<end;j++)sum+=(wave.readInt16LE(44+j*2)/32768)**2;rms.push({t:+(i/rate).toFixed(2),rms:+Math.sqrt(sum/(end-i)).toFixed(6)});}
 const active=rms.filter(f=>f.rms>.008),regions=[];for(const f of active){let r=regions.at(-1);if(!r||f.t-r.end>.14)regions.push(r={start:f.t,end:+(f.t+.02).toFixed(2)});else r.end=+(f.t+.02).toFixed(2);}
 const pitch=[];for(let position=0;position+Math.round(rate*.04)<n;position+=Math.round(rate*.04)){
  const length=Math.round(rate*.04),values=Array.from({length},(_,i)=>wave.readInt16LE(44+(position+i)*2)/32768),mean=values.reduce((a,b)=>a+b,0)/length;let energy=0;for(let i=0;i<length;i++){values[i]-=mean;energy+=values[i]**2;}if(Math.sqrt(energy/length)<.015)continue;
  let best=0,lag=0;for(let k=Math.round(rate/300);k<=Math.round(rate/65);k++){let c=0,a=0,b=0;for(let i=0;i<length-k;i++){c+=values[i]*values[i+k];a+=values[i]**2;b+=values[i+k]**2;}const confidence=c/Math.sqrt(a*b||1);if(confidence>best){best=confidence;lag=k;}}
  if(best>.8)pitch.push({t:+(position/rate).toFixed(2),hz:+(rate/lag).toFixed(2),confidence:+best.toFixed(3)});
 }
 const sorted=pitch.map(f=>f.hz).sort((a,b)=>a-b);return {rate,duration:n/rate,peak,clippedSamples:clipped,rms,regions,pitch,medianPitchApproxHz:sorted.length?sorted[Math.floor(sorted.length/2)]:null};
}
