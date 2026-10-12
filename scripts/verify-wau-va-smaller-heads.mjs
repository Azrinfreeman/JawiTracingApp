import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {wauVaSmallerHeadReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';
const root='output/verification/wau-va-smaller-heads',read=p=>JSON.parse(readFileSync(p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const baseline=read(`${root}/protected-inputs.json`),letters=read('src/content/letters.json'),before=read(`${root}/before-catalogue.json`);
assert.deepEqual(letters,before);const mismatches=Object.entries(baseline.files).filter(([p,h])=>!existsSync(p)||hash(p)!==h).map(([p])=>p);
// Visual inspection required revision-scoped detached guides after the baseline was taken.
// Keep that original baseline intact and explicitly account for the one additional source edit.
const additionalEdits=['src/tracing/numberedGuides.js'];assert.deepEqual(mismatches.filter(p=>!additionalEdits.includes(p)),[]);
const proposals=wauVaSmallerHeadReviewCandidates(letters);assert.deepEqual(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion]),[['wau',4],['va',5]]);
for(const {candidate}of proposals){assert.equal(validateLetter(candidate).valid,true);assert.equal(validateLetter(candidate).ready,false);assert.equal(candidate.geometry.review,null);}
assert.equal(letters.filter(l=>validateLetter(l).ready).length,36);
const inputs={};function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())walk(p);else inputs[p]=hash(p);}}
for(const dir of ['src','tests','scripts','public/audio'])walk(dir);
for(const p of ['package.json','package-lock.json','vite.config.js','playwright.config.js','docs/references/wau-va-smaller-head-reference.png','docs/references/wau-va-smaller-head-current-cards.png'])inputs[p]=hash(p);
const build={};for(const p of ['dist/index.html',...readdirSync('dist/assets').filter(p=>p.endsWith('.js')||p.endsWith('.css')).map(p=>`dist/assets/${p}`)])build[p]=hash(p);
const unit=read(`${root}/unit-final-results.json`),browser=existsSync(`${root}/browser-results.json`)?read(`${root}/browser-results.json`).stats:null;
assert.equal(unit.numFailedTests,0);if(browser){assert.equal(browser.unexpected,0);assert.equal(browser.flaky,0);}
const report={date:'2026-10-12',activeCatalogueExact:true,protectedFilesExact:Object.keys(baseline.files).length-mismatches.length,additionalSourceEdits:mismatches,audioFilesExact:Object.keys(baseline.files).filter(p=>p.startsWith('public/audio/')).length,readyLessons:36,candidates:proposals.map(p=>({id:p.candidate.id,revision:p.candidate.contentVersion,status:p.candidate.geometry.status})),unit:{passed:unit.numPassedTests,failed:unit.numFailedTests,files:unit.testResults.length},browser,inputs,build};
writeFileSync(`${root}/verification.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({activeCatalogueExact:report.activeCatalogueExact,protectedFilesExact:report.protectedFilesExact,audioFilesExact:report.audioFilesExact,readyLessons:36,unit:report.unit,browser},null,2));
