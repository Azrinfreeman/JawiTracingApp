import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = 'output/verification/tracing-completion';
const before = JSON.parse(readFileSync(`${root}/before-inputs.json`, 'utf8').replace(/^\uFEFF/, ''));
const allowed = new Set(['README.md', 'docs/PROJECT_STATE.md', 'docs/NUMBERED_TRACING_GUIDES.md',
  'docs/TRACING_COMPLETION_AND_PERFORMANCE_IMPLEMENTATION.md', 'scripts/measure-tracing.js',
  'src/tracing/geometry.js', 'src/tracing/playMatcher.js', 'src/tracing/inputController.js', 'src/tracing/numberedGuides.js',
  'src/components/TraceBoard.jsx', 'src/components/NumberedTraceGuides.jsx', 'src/styles/app.css',
  'tests/browser/helpers/navigation.js', 'tests/browser/numbered-guides.spec.js', 'tests/browser/book-layout.spec.js', 'tests/browser/kaf-ga.spec.js', 'tests/browser/play-tracing.spec.js', 'tests/browser/strict-tracing.spec.js', 'tests/browser/solo-duo.spec.js']);
const changed = [], missing = [], protectedFiles = [];
for (const [path, hash] of Object.entries(before.hashes)) {
  if (!existsSync(path)) { missing.push(path); continue; }
  const current = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (hash !== current) changed.push(path);
  if (/^(src\/(content|audio|storage)\/|public\/audio\/|docs\/(CONTENT_APPROVALS|AUDIO_APPROVALS|CONTENT_REVIEW|KAF_GA_SHAPE_CORRECTION))/.test(path)) protectedFiles.push({ path, unchanged: hash === current });
}
const unexpected = changed.filter(path => !allowed.has(path));
const result = { date: new Date().toISOString(), baselineDate: before.date, checked: Object.keys(before.hashes).length,
  unchanged: Object.keys(before.hashes).length - changed.length - missing.length, changed, missing, unexpected,
  protectedCount: protectedFiles.length, protectedFiles };
writeFileSync(`${root}/protected-inputs.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ checked: result.checked, unchanged: result.unchanged, changed, missing, unexpected, protectedUnchanged: protectedFiles.filter(p => p.unchanged).length }));
if (missing.length || unexpected.length || protectedFiles.some(p => !p.unchanged)) process.exitCode = 1;
