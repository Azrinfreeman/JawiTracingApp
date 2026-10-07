import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';
import {decodeMono24k,waveAnalysis} from './lib/audio-wave.mjs';
const input='C:/Users/azrin/OneDrive/Documents/Sound Recordings/Recording (6).m4a',root='output/verification/va-audio',hash=b=>createHash('sha256').update(b).digest('hex');mkdirSync(root,{recursive:true});
ok(!existsSync(`${root}/source.json`),'Preserve existing preparation evidence.');
const bytes=readFileSync(input),raw=readFileSync('src/content/letters.json'),letters=JSON.parse(raw),prior=JSON.parse(readFileSync('output/verification/ha-approval/inputs.json'));
strictEqual(hash(raw),prior.hashes['src/content/letters.json']);
writeFileSync(`${root}/source-user.m4a`,bytes,{flag:'wx'});writeFileSync(`${root}/before-catalogue.json`,raw,{flag:'wx'});
const decoded=await decodeMono24k(bytes),analysis=waveAnalysis(decoded.wave);writeFileSync(`${root}/source-user.wav`,decoded.wave,{flag:'wx'});
const report={date:'2026-10-07',letterId:'va',transcriptMs:'Va',sourceFile:input,sourceSha256:hash(bytes),sourceBytes:bytes.length,sourceChannels:decoded.sourceChannels,...analysis,
 permission:'Owner supplied Recording (6).m4a as Va on 2026-10-07 after requesting guided comparison and direct use if a match cannot be achieved.',
 catalogueSha256:hash(raw),protectedRecordings:Object.fromEntries(letters.map(l=>[l.audio.name.src,hash(readFileSync(`public${l.audio.name.src}`))]))};
writeFileSync(`${root}/source.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({duration:analysis.duration,regions:analysis.regions,medianPitchApproxHz:analysis.medianPitchApproxHz,clipped:analysis.clippedSamples}));
