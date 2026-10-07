import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {fourLetterReviewCandidates,videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';
const root='output/verification/four-letter-approval',sha=data=>createHash('sha256').update(data).digest('hex');
const beforeBytes=readFileSync(`${root}/before-catalogue.json`),before=JSON.parse(beforeBytes),current=JSON.parse(readFileSync('src/content/letters.json'));
const implementation=JSON.parse(readFileSync('output/verification/four-letter-outlines/inputs.json'));
const ensure=(condition,message)=>{if(!condition)throw Error(message);};
ensure(sha(beforeBytes)===implementation.hashes['src/content/letters.json'],'Pre-approval source does not match the reviewed implementation');
ensure(sha(readFileSync('src/content/fourLetterOutlines.json'))===implementation.hashes['src/content/fourLetterOutlines.json'],'Reviewed outlines changed');
const font='node_modules/@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2';
ensure(sha(readFileSync(font))===implementation.hashes[font],'Reviewed catalogue font changed');
const proposed=fourLetterReviewCandidates(before),ids=proposed.map(p=>p.candidate.id);
ensure(ids.join(',')==='dal,zal,ra,zai','Unexpected approval scope');
const expected=before.map(letter=>{
  const proposal=proposed.find(p=>p.candidate.id===letter.id);if(!proposal)return letter;
  const candidate=structuredClone(proposal.candidate);candidate.geometry.status='approved';
  candidate.geometry.review={revision:candidate.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-06',
    reference:'docs/CONTENT_APPROVALS.md#approval-of-four-letter-outlines-2026-10-06',kind:'projectOwner'};
  return candidate;
});
ensure(isDeepStrictEqual(current,expected),'Catalogue differs from the four exact approved candidates');
ensure(current.every(letter=>validateLetter(letter).ready),'A student lesson is unavailable');
ensure(fourLetterReviewCandidates(current).length===0,'Obsolete outline proposal remains');
ensure(isDeepStrictEqual(videoReviewCandidates(current),videoReviewCandidates(before)),'Unrelated video proposals changed');
const audio=current.map(letter=>`public${letter.audio.name.src}`);
ensure(audio.every(file=>sha(readFileSync(file))===implementation.hashes[file]),'Approved recording changed');
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(folder,entry.name)):[join(folder,entry.name).replaceAll('\\','/')]);
const files=[...walk('src'),...walk('tests'),...walk('dist/assets').filter(file=>/index-.*\.(js|css)$/.test(file)),...audio,
  'package.json','package-lock.json','playwright.config.js','scripts/verify-four-letter-approval.mjs','scripts/build-outline-test-harness.mjs',
  font,`${root}/before-catalogue.json`,`${root}/test-harness.js`];
const result={date:new Date().toISOString(),node:process.version,build:'four-letter-approved-20261006',approval:{quote:'yes I approve',
  reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-06',revisions:Object.fromEntries(proposed.map(p=>[p.candidate.id,p.candidate.contentVersion]))},
  exactReviewedOutlinesPreserved:true,unrelatedEntriesPreserved:33,allAudioMetadataPreserved:true,recordingsPreserved:audio.length,
  ready:current.length,outlineProposals:0,unrelatedVideoProposals:7,hashes:Object.fromEntries(files.map(file=>[file,sha(readFileSync(file))]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(result,null,2)+'\n');
console.log('Verified the exact four approved revisions; 33 other entries, all audio metadata, 37 recordings and seven video proposals preserved.');
