import {readFileSync,writeFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {faPaReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter,validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/fa-pa-order';
const read=path=>readFileSync(path,'utf8'),hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const letters=JSON.parse(read('src/content/letters.json')),before=JSON.parse(read(`${root}/before-catalogue.json`));
strictEqual(hash('src/content/letters.json'),hash(`${root}/before-catalogue.json`));deepStrictEqual(letters,before);
const candidates=faPaReviewCandidates(letters);deepStrictEqual(candidates.map(p=>p.candidate.id),['fa','pa']);
for(const {original,candidate}of candidates){
  const expected=structuredClone(original);
  expected.contentVersion=4;expected.geometry.status='pendingReview';expected.geometry.review=null;
  expected.geometry.strokes[0].path=candidate.geometry.strokes[0].path;expected.geometry.displayPaths[0]=candidate.geometry.strokes[0].path;
  deepStrictEqual(candidate,expected);ok(validateLetter(candidate).valid);strictEqual(validateLetter(candidate).ready,false);
  deepStrictEqual(candidate.geometry.strokes[0].path.split(' C ').slice(2),original.geometry.strokes[0].path.split(' C ').slice(2));
}
const oldProposals=source=>source.match(/const proposals = \{[\s\S]*?\n\};/)[0];
strictEqual(oldProposals(read('src/content/reviewCandidates.js')),oldProposals(read(`${root}/before-reviewCandidates.js`)));
const previous=JSON.parse(read('output/verification/four-letter-approval/inputs.json'));
const recordings=Object.entries(previous.hashes).filter(([path])=>path.startsWith('public/audio/'));strictEqual(recordings.length,37);
for(const [path,digest]of recordings)strictEqual(hash(path),digest);
const stages=['browser-results.json','browser-corrections.json','browser-play-final.json','browser-regressions.json'].map(file=>`${root}/${file}`);
let browserSummary=null;
if(stages.every(existsSync)){
  const cases=new Map(),runs=stages.map(path=>({path,report:JSON.parse(read(path))}));
  const visit=(suite,path)=>{
    for(const spec of suite.specs||[])for(const test of spec.tests){
      const result=test.results.at(-1);cases.set(`${spec.file}:${spec.title}:${test.projectName}`,
        {file:spec.file,title:spec.title,project:test.projectName,status:result.status,evidence:path});
    }
    for(const child of suite.suites||[])visit(child,path);
  };
  for(const {path,report}of runs)for(const suite of report.suites)visit(suite,path);
  const final=[...cases.values()];strictEqual(final.length,36);ok(final.every(test=>test.status==='passed'));
  browserSummary={uniquePassed:final.length,unresolvedFailures:0,skipped:0,
    projects:Object.fromEntries(['chromium','webkit'].map(project=>[project,final.filter(t=>t.project===project).length])),
    resolvedInitialCheckFailures:runs[0].report.stats.unexpected,cases:final};
  writeFileSync(`${root}/browser-summary.json`,JSON.stringify(browserSummary,null,2)+'\n');
}
const walk=path=>readdirSync(path).flatMap(name=>{const file=`${path}/${name}`;return statSync(file).isDirectory()?walk(file):[file];});
const files=[...walk('src'),...walk('dist'),'package.json','package-lock.json','playwright.config.js','vite.config.js',
  'tests/geometry/faPaDirections.test.js','tests/browser/fa-pa-directions.spec.js','tests/browser/glyph-matched.spec.js',
  ...walk('tests/browser/helpers'),...recordings.map(([path])=>path),'scripts/verify-fa-pa-directions.mjs',...stages.filter(existsSync)];
const hashes=Object.fromEntries(files.map(path=>[path,hash(path)]));
const report={date:'2026-10-06',build:'fa-pa-direction-review-20261006',node:process.version,
  intent:'Owner confirmed Qaf departure and head → lift → tail → dots. This is implementation authorisation; Fa 4/Pa 4 await review.',
  catalogueByteIdentical:true,approvedStudentModels:validateCatalogue(letters).results.filter(x=>x.ready).length,
  qafUnchanged:true,allAudioMetadataUnchanged:true,recordingsPreserved:recordings.length,olderProposalsUnchanged:true,
  proposals:candidates.map(({candidate})=>({id:candidate.id,revision:candidate.contentVersion,status:candidate.geometry.status,
    path:candidate.geometry.strokes[0].path,dots:candidate.geometry.dotTargets.length,sequence:candidate.geometry.validSequences[0]})),browserSummary,hashes};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log('Verified: 2 isolated revisions; 37 approved catalogue entries and recordings preserved; Qaf and 7 earlier proposals unchanged.');
if(browserSummary)console.log(`Browser evidence: ${browserSummary.uniquePassed} distinct passes; no unresolved failures or skips.`);
