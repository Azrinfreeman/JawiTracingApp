import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,deepStrictEqual,ok} from 'node:assert';
import {ainFamilyReviewCandidates,videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter,validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/ain-family-outlines';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const letters=read('src/content/letters.json'),before=read(`${root}/before-catalogue.json`);
strictEqual(hash('src/content/letters.json'),hash(`${root}/before-catalogue.json`));
deepStrictEqual(videoReviewCandidates(letters),videoReviewCandidates(before));
strictEqual(videoReviewCandidates(letters).length,7);
const baseline=read('output/verification/inline-letter-audio/inputs.json');
const recordings=letters.map(letter=>`public${letter.audio.name.src}`);
for(const path of recordings)strictEqual(hash(path),baseline.hashes[path]);
const candidates=ainFamilyReviewCandidates(letters);strictEqual(candidates.length,3);
for(const {original,candidate}of candidates){
  const validation=validateLetter(candidate);ok(validation.valid);strictEqual(validation.ready,false);
  strictEqual(candidate.contentVersion,4);strictEqual(candidate.geometry.strokes.length,2);
  deepStrictEqual(candidate.geometry.strokes[0],original.geometry.strokes[0]);
  deepStrictEqual(candidate.geometry.dotTargets,original.geometry.dotTargets);
  deepStrictEqual(candidate.geometry.validSequences,original.geometry.validSequences);
  deepStrictEqual(candidate.audio,original.audio);
}
strictEqual(validateCatalogue(letters).results.filter(l=>l.ready).length,37);
const main=read(`${root}/browser-final.json`);
strictEqual(main.stats.expected,29);strictEqual(main.stats.unexpected,0);strictEqual(main.stats.flaky,0);strictEqual(main.stats.skipped,1);
const specs=suite=>[...(suite.specs||[]),...(suite.suites||[]).flatMap(specs)];
const cases=report=>report.suites.flatMap(specs).flatMap(spec=>spec.tests.map(test=>({key:`${test.projectName}: ${spec.title}`,status:test.status})));
const initialPath=`${root}/browser-regression.json`,initial=read(initialPath);
const retryPaths=[`${root}/browser-matches-final.json`,`${root}/browser-teacher-final.json`];
const retried=retryPaths.flatMap(path=>{
  const report=read(path);strictEqual(report.stats.unexpected,0);strictEqual(report.stats.skipped,0);strictEqual(report.stats.flaky,0);
  return cases(report);
});
const originalCases=cases(initial),failed=originalCases.filter(test=>test.status==='unexpected');
strictEqual(originalCases.length,26);strictEqual(failed.length,13);
deepStrictEqual(retried.map(test=>test.key).sort(),failed.map(test=>test.key).sort());
const latest=new Map(retried.map(test=>[test.key,test]));
const resolved=originalCases.map(test=>latest.get(test.key)||test);
ok(resolved.every(test=>test.status==='expected'));
const summaryPath=`${root}/browser-regression-current.json`;
const regression={passed:26,failed:0,skipped:0,retainedPassed:13,rechecked:13,reports:[initialPath,...retryPaths],cases:resolved};
writeFileSync(summaryPath,JSON.stringify(regression,null,2)+'\n');
const browser=[{path:`${root}/browser-final.json`,passed:29,failed:0,skipped:1},{path:summaryPath,...regression}];
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{
  const path=`${folder}/${entry.name}`;return entry.isDirectory()?walk(path):[path];
});
const files=[...walk('src'),...walk('tests'),...walk('dist'),...recordings,'package.json','package-lock.json','playwright.config.js',
  'scripts/author-ain-family-outlines.mjs','scripts/lib/outline-contours.mjs','scripts/lib/glyph-geometry.mjs','scripts/glyph-trace-plan.json',
  'scripts/verify-ain-family-outlines.mjs',`${root}/test-harness.js`,`${root}/before-catalogue.json`,...browser.map(r=>r.path),initialPath,...retryPaths];
writeFileSync(`${root}/inputs.json`,JSON.stringify({date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,
  build:'ain-family-outlines-20261006',proposals:candidates.map(({candidate})=>({id:candidate.id,revision:4,status:'pendingReview'})),
  catalogueByteIdentical:true,recordingsPreserved:37,olderVideoProposalsPreserved:7,studentReady:37,browser,
  hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))},null,2)+'\n');
console.log('Verified three valid unapproved outline candidates; approved catalogue, 37 recordings and seven older proposals preserved; final browser evidence fingerprinted.');
