import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';
import {encodeWave,waveAnalysis} from './lib/audio-wave.mjs';
const root='output/verification/va-audio',read=p=>JSON.parse(readFileSync(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex'),source=read(`${root}/source.json`),comparison=read(`${root}/comparison.json`),raw=readFileSync('src/content/letters.json');
strictEqual(hash(raw),source.catalogueSha256);for(const [src,sha]of Object.entries(source.protectedRecordings))strictEqual(hash(readFileSync(`public${src}`)),sha,src);
const letters=JSON.parse(raw),va=letters.find(l=>l.id==='va');strictEqual(va.audio.name.version,1);strictEqual(va.contentVersion,3);
const src='/audio/letters/alphabet/va-name-v2.wav';ok(!existsSync(`public${src}`));ok(!existsSync(`${root}/generation.json`));
const master=readFileSync(`${root}/source-user.wav`),rate=master.readUInt32LE(24),start=.70,end=1.80;
strictEqual(rate,24000);const pcm=master.subarray(44+Math.round(start*rate)*2,44+Math.round(end*rate)*2),wave=encodeWave(pcm,rate);
const analysis=waveAnalysis(wave);strictEqual(analysis.clippedSamples,0);strictEqual(wave.readInt16LE(44),0);strictEqual(wave.readInt16LE(wave.length-2),0);
writeFileSync(`public${src}`,wave,{flag:'wx'});writeFileSync('tests/fixtures/va-audio-original.json',JSON.stringify(va,null,2)+'\n',{flag:'wx'});
const processing={sourceStartSeconds:start,sourceEndSeconds:end,speechRegionStartApprox:.86,speechRegionEndApprox:1.70,fadeMs:0,
 method:'Complete first supplied Va utterance with silence before onset and after decay. Only surrounding silence/repeated second utterance omitted. Decoded 24-kHz mono PCM retained byte-for-byte; no fades, gain, filtering, pitch or timing changes.'};
const reviewer='Project owner (Codex user; name not supplied)';
va.audio.name={src,transcriptMs:'Va',version:2,status:'approved',review:{revision:2,reviewer,date:'2026-10-07',reference:'docs/AUDIO_APPROVALS.md#selection-of-supplied-va-recording-2026-10-07',kind:'projectOwner'},
 permission:'Project owner requested comparison with their Va recording and direct use if the guided match cannot be achieved, then supplied Recording (6).m4a in Codex on 2026-10-07. The complete first utterance is used as this authorised fallback.',
 origin:{kind:'userProvided',reference:'User attachment Recording (6).m4a; docs/VA_AUDIO_CORRECTION.md',speaker:'User-supplied speaker; identity not assessed',sha256:source.sourceSha256,recordingSha256:hash(wave),processing}};
writeFileSync('src/content/letters.json',JSON.stringify(letters,null,2)+'\n');
writeFileSync(`${root}/generation.json`,JSON.stringify({date:'2026-10-07',letterId:'va',version:2,src,transcriptMs:'Va',bytes:wave.length,sha256:hash(wave),duration:analysis.duration,rate,processing,
 quote:'try to compare with mine if cannot then use mine',attachmentConfirmation:'Recording (6).m4a attached; sorry forget to attach',reviewer,scope:'Va name audio only; exact supplied first utterance as conditionally authorised fallback.',comparison,sourceSha256:source.sourceSha256},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({src,version:2,duration:analysis.duration,bytes:wave.length,sha256:hash(wave),geometryRevision:va.contentVersion}));
