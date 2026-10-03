import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { makeReference } from '../src/tracing/geometry.js';
import { numberedGuidePlan } from '../src/tracing/numberedGuides.js';
import { fitTraceViewport } from '../src/game/screenLayout.js';

const evidence = 'output/verification/kaf-ga';
const before = JSON.parse(fs.readFileSync(`${evidence}/before.json`, 'utf8'));
const letters = JSON.parse(fs.readFileSync('src/content/letters.json', 'utf8'));
const ids = ['kaf', 'ga'];
const changedEntries = letters.filter(letter => JSON.stringify(letter) !== JSON.stringify(before.letters.find(old => old.id === letter.id))).map(letter => letter.id);
assert.deepEqual(changedEntries, ids);
for (const letter of letters) assert.deepEqual(letter.audio, before.letters.find(old => old.id === letter.id).audio);
const allowed = new Set(['README.md', 'docs/PROJECT_STATE.md', 'docs/CONTENT_REVIEW.md', 'docs/KAF_GA_SHAPE_CORRECTION_IMPLEMENTATION.md',
  'src/content/letters.json', 'src/components/LetterCard.jsx', 'src/components/DraftModelReview.jsx', 'src/components/AudioReviewPanel.jsx',
  'src/screens/TeacherScreen.jsx', 'src/screens/ResultScreen.jsx', 'src/screens/BookLessonScreen.jsx',
  'tests/geometry/support.test.js', 'tests/game/bookNavigation.test.js', 'tests/game/match.test.js']);
const unchanged = [], changed = [];
for (const [file, hash] of Object.entries(before.hashes)) {
  const same = fs.existsSync(file) && crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') === hash;
  (same ? unchanged : changed).push(file);
  assert.ok(same || allowed.has(file), `Unexpected modification/deletion: ${file}`);
}
const comparison = { changedEntries, unaffectedEntries: 35, unchangedAudioMetadata: 37,
  unchangedActiveRecordingFiles: letters.filter(letter => unchanged.includes(`public${letter.audio.name.src}`)).length,
  unchangedFiles: unchanged.length, changedFiles: changed, unchanged };
assert.equal(comparison.unchangedActiveRecordingFiles, 37);
fs.writeFileSync(`${evidence}/protected-comparison.json`, JSON.stringify(comparison, null, 2));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 910 }, deviceScaleFactor: 1 });
  const models = [];
  for (const letter of letters.filter(letter => ids.includes(letter.id))) {
    const points = await page.evaluate(pathData => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', pathData);
      const length = path.getTotalLength(), count = Math.ceil(length / 2);
      return Array.from({ length: count + 1 }, (_, i) => { const p = path.getPointAtLength(length * i / count); return { x: p.x, y: p.y }; });
    }, letter.geometry.strokes[0].path);
    const references = { 'stroke-1': makeReference(points) }, fit = fitTraceViewport(letter, references, 1, 1);
    const viewBox = `${fit.x} ${fit.y} ${fit.width} ${fit.height}`;
    const body = letter.geometry.strokes.map(stroke => `<path d="${stroke.path}" fill="none" stroke="currentColor" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    const dots = letter.geometry.dotTargets.map(dot => `<circle cx="${dot.x}" cy="${dot.y}" r="${dot.visibleRadius}" fill="currentColor"/>`).join('');
    const guides = numberedGuidePlan(letter, references).flatMap(part => part.points).map(p => `<g><circle cx="${p.anchor.x}" cy="${p.anchor.y}" r="29" fill="${p.kind === 'stop' ? '#f4bf56' : '#d2f0e1'}" stroke="#276252" stroke-width="5"/><text x="${p.anchor.x}" y="${p.anchor.y + 12}" text-anchor="middle" font-size="36" font-weight="bold" fill="#153e32">${p.number}</text></g>`).join('');
    models.push(`<article><h2>${letter.labelMs} · revision ${letter.contentVersion}</h2><svg viewBox="${viewBox}">${body}${dots}</svg><p>${letter.id === 'ga' ? 'Identical connected body + one upper dot' : 'One connected body · no detached chevron'}</p><h3>Proposed sequence for review</h3><svg viewBox="${viewBox}">${body}${dots}${guides}</svg><p>1 Start → 2 Follow → 3 ${letter.id === 'ga' ? 'Stop, lift → 4 Tap dot' : 'Finish, lift'}</p></article>`);
  }
  const reference = fs.readFileSync('docs/references/kaf-ga-user-reference.png').toString('base64');
  const html = `<!doctype html><meta charset="utf-8"><title>Kaf/Ga revised geometry review</title><style>*{box-sizing:border-box}body{margin:0;padding:28px;background:#fffdf5;color:#153e32;font:18px Arial,sans-serif}h1{margin:0 0 8px;font-size:30px}h2{font-size:24px}h3{font-size:18px;margin:10px 0 0}p{margin:8px 0;line-height:1.4}.status{color:#825118;font-weight:bold}.grid{display:grid;grid-template-columns:300px 1fr 1fr;gap:20px;margin-top:20px}article{background:white;border:2px solid #c2ceab;border-radius:20px;padding:18px;text-align:center}svg{display:block;width:100%;height:245px;color:#153e32}img{width:100%;height:auto;margin-top:35px}.reference p{text-align:left;margin-top:25px}.foot{margin-top:18px}</style><h1>Kaf and Ga — reference and revised models</h1><p class="status">Pending geometry review · 3 October 2026 · no reviewer approval recorded</p><div class="grid"><article class="reference"><h2>Supplied reference</h2><img src="data:image/png;base64,${reference}"><p>Ga is on the left; Kaf is on the right. The image establishes appearance, not writing direction.</p><p>Preschool round stroke/dot styling retained. Name recordings and their approvals are unchanged.</p></article>${models.join('')}</div><p class="foot">Review the silhouette, dot position, start/direction, lift and sequence. Revised models are available in adult preview; 35 other approved lessons remain student-ready.</p>`;
  fs.writeFileSync(`${evidence}/review-sheet.html`, html);
  await page.setContent(html); await page.screenshot({ path: 'docs/references/kaf-ga-revision-review.png', fullPage: true });
  fs.writeFileSync(`${evidence}/review-sheet.json`, JSON.stringify({ browser: browser.version(), revisions: { kaf: 2, ga: 3 }, reviewStatus: 'pendingReview', comparison }, null, 2));
  console.log(`Protected: 35 entries, 37 audio metadata records, 37 recording files; ${unchanged.length} files unchanged. Review sheet captured.`);
} finally { await browser.close(); }
