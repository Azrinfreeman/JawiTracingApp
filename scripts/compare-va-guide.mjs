import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual} from 'node:assert';
import {decodeMono24k,waveAnalysis,encodeWave} from './lib/audio-wave.mjs';
const root='output/verification/va-audio',source=JSON.parse(readFileSync(`${root}/source.json`)),report=JSON.parse(readFileSync(`${root}/guided/source-generation.json`)),hash=b=>createHash('sha256').update(b).digest('hex');
strictEqual(hash(readFileSync('src/content/letters.json')),source.catalogueSha256);
const master=readFileSync(`${root}/source-user.wav`),reference=encodeWave(master.subarray(44+Math.round(.70*24000)*2,44+Math.round(1.80*24000)*2),24000);
const decoded=await decodeMono24k(readFileSync(`${root}/guided/source-guided.mp3`));writeFileSync(`${root}/guided/source-guided.wav`,decoded.wave,{flag:'wx'});
const guide=waveAnalysis(reference),guided=waveAnalysis(decoded.wave),span=a=>a.regions.length?a.regions.at(-1).end-a.regions[0].start:0;
const comparison={date:'2026-10-07',reference:{sourceSha256:source.sourceSha256,start:.70,end:1.80,activeSecondsApprox:span(guide),medianPitchApproxHz:guide.medianPitchApproxHz,pitchFrames:guide.pitch},
 guided:{...report,activeSecondsApprox:span(guided),medianPitchApproxHz:guided.medianPitchApproxHz,pitchFrames:guided.pitch,regions:guided.regions,duration:guided.duration},
 durationRatio:span(guided)/span(guide),pitchRatio:guided.medianPitchApproxHz/guide.medianPitchApproxHz,
 method:'40-ms normalized autocorrelation, 65–300 Hz with >0.8 confidence; 20-ms RMS envelope >0.008. Approximate engineering comparison only.',
 pronunciationReviewed:false,ownerRejectedGuidedAttempt:false,
 selection:'Use the supplied complete first utterance as the authorised fallback. These measurements cannot establish faithful phonetic pronunciation and natural tone; the synthetic match cannot be confidently verified.',
 authorisation:'try to compare with mine if cannot then use mine',catalogueSha256:source.catalogueSha256};
writeFileSync(`${root}/comparison.json`,JSON.stringify(comparison,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({referenceActive:span(guide),guidedActive:span(guided),referencePitch:guide.medianPitchApproxHz,guidedPitch:guided.medianPitchApproxHz,pitchRatio:comparison.pitchRatio,durationRatio:comparison.durationRatio,selected:'user fallback'}));
