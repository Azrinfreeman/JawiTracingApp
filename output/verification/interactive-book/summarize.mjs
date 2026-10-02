import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const directory = 'output/verification/interactive-book';
const cases = new Map();
const runs = ['browser-results.json', 'browser-followup.json'];
function collect(suites, run) {
  for (const suite of suites) {
    for (const spec of suite.specs || []) for (const test of spec.tests) {
      const entry = { project: test.projectName, file: spec.file, title: spec.title, status: test.results.at(-1).status, run };
      cases.set(JSON.stringify([entry.project, entry.file, entry.title]), entry);
    }
    collect(suite.suites || [], run);
  }
}
for (const run of runs) { const report = JSON.parse(readFileSync(`${directory}/${run}`, 'utf8')); assert.equal(report.errors.length, 0); collect(report.suites, run); }
const list = [...cases.values()];
const totals = { passed: list.filter(item => item.status === 'passed').length, skipped: list.filter(item => item.status === 'skipped').length, failed: list.filter(item => !['passed', 'skipped'].includes(item.status)).length };
assert.deepEqual(totals, { passed: 157, skipped: 9, failed: 0 });
const visual = JSON.parse(readFileSync(`${directory}/visual-results.json`, 'utf8'));
const inputs = JSON.parse(readFileSync(`${directory}/final-inputs.json`, 'utf8').replace(/^\uFEFF/, ''));
const report = { date: new Date().toISOString(), baseURL: visual.baseURL, build: inputs.build, totals, reports: runs, visualCaptures: visual.screenshots.length, protectedFilesUnchanged: visual.protectedFilesUnchanged, inputHashes: Object.keys(inputs.hashes).length, cases: list };
writeFileSync(`${directory}/final-results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ totals, build: report.build, captures: report.visualCaptures, protected: report.protectedFilesUnchanged, hashes: report.inputHashes }));
