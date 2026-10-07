// One-time promotion of the exact fallback authorised by the project owner.
import {readFileSync, writeFileSync, copyFileSync, mkdirSync, constants, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual, deepStrictEqual, ok} from 'node:assert';

const root='output/verification/ga-audio-approval';
const catalogue='src/content/letters.json';
const bytes=readFileSync(catalogue);
const letters=JSON.parse(bytes);
const candidate=JSON.parse(readFileSync('output/verification/ga-audio-review/user-recording-v7/generation.json'));
const guided=JSON.parse(readFileSync('output/verification/ga-audio-review/guided-malay-v8/generation.json'));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
strictEqual(hash(catalogue),candidate.catalogueSha256);
strictEqual(hash(catalogue),guided.catalogueSha256);
strictEqual(guided.referenceComparison.fallbackRevision,7);
strictEqual(hash(`public${candidate.src}`),candidate.sha256);
for(const [src,sha] of Object.entries(candidate.protectedRecordings))strictEqual(hash(`public${src}`),sha);
const ga=letters.find(letter=>letter.id==='ga');
deepStrictEqual(ga.audio.name,candidate.previousRecording);
const src='/audio/letters/alphabet/ga-name-v7.wav';
ok(!existsSync(`public${src}`),'Never overwrite a previously promoted recording.');
ok(!existsSync(`${root}/before-catalogue.json`),'Never overwrite promotion evidence.');
mkdirSync(root,{recursive:true});
writeFileSync(`${root}/before-catalogue.json`,bytes);
writeFileSync('tests/fixtures/ga-audio-original.json',JSON.stringify(ga,null,2)+'\n',{flag:'wx'});
copyFileSync(`public${candidate.src}`,`public${src}`,constants.COPYFILE_EXCL);
const authorisation={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',
  reviewer:'Project owner (Codex user; name not supplied)',
  quote:'make it as a guide, if the guide still failed then use mine',
  scope:'Use the supplied Recording (4).m4a as the synthesis guide first; use its prepared complete first utterance as the game fallback if guidance is unsuccessful.',
  selectedRevision:7,selectedSrc:src,selectedSha256:candidate.sha256,
  guidedAttemptRevision:8,comparison:guided.referenceComparison,
  syntheticPronunciationApproved:false,teacherAssessmentInferred:false};
ga.audio.name={src,transcriptMs:'Ga',version:7,status:'approved',
  review:{revision:7,reviewer:authorisation.reviewer,date:authorisation.date,
    reference:'docs/AUDIO_APPROVALS.md#approval-of-ga-recording-fallback-2026-10-06',kind:'projectOwner'},
  permission:'Project owner authorised using Recording (4).m4a as a pronunciation guide and, if the guided synthesis failed, using this recording in the game in Codex on 2026-10-06. The complete prepared first utterance is used as that fallback.',
  origin:{...candidate.origin,recordingSha256:candidate.sha256,
    processing:candidate.editing,reference:'User attachment Recording (4).m4a; docs/GA_AUDIO_REVIEW.md'}};
writeFileSync(catalogue,JSON.stringify(letters,null,2)+'\n');
writeFileSync(`${root}/authorisation.json`,JSON.stringify(authorisation,null,2)+'\n');
strictEqual(hash(`public${src}`),candidate.sha256);
console.log('Promoted exact authorised Ga revision 7; geometry unchanged; original audio files preserved.');
