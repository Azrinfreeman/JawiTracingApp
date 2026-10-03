import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { cpus } from 'node:os';

// The baseline modules are the preserved pre-change files, not a git HEAD.
const browser = await chromium.launch();
try {
  const page = await browser.newPage(); await page.goto('http://127.0.0.1:5173');
  const results = await page.evaluate(async () => {
    const { default: letters } = await import('/src/content/letters.json');
    const { prepareReferences } = await import('/src/tracing/prepareReference.js');
    const { getProfile } = await import('/src/tracing/profiles.js');
    const { createPlayMatcher: before } = await import('/output/verification/tracing-completion/baseline/playMatcher.js');
    const { createPlayMatcher: after } = await import('/src/tracing/playMatcher.js');
    const { pointAt } = await import('/src/tracing/geometry.js');
    const summary = values => {
      const s = values.sort((a, b) => a - b), at = p => s[Math.min(s.length - 1, Math.floor(s.length * p))];
      return { count: s.length, p50: at(.5), p95: at(.95), max: s.at(-1) };
    };
    const results = [];
    for (const id of ['alif', 'sin', 'mim', 'nya', 'kaf', 'ga']) {
      const letter = letters.find(l => l.id === id), refs = prepareReferences(letter);
      const streams = letter.geometry.strokes.map(stroke => {
        const ref = refs[stroke.id], n = Math.ceil(ref.length / 5);
        return Array.from({ length: n + 1 }, (_, i) => { const p = pointAt(ref, ref.length * i / n); return { x: p.x + 2 * Math.sin(i * .37), y: p.y }; });
      });
      const runs = { before: [], after: [] }, samples = { before: [], after: [] };
      for (let repeat = 0; repeat < 13; repeat++) {
        for (const [name, create] of repeat % 2 ? [['after', after], ['before', before]] : [['before', before], ['after', after]]) {
          const engine = create(letter, refs, getProfile('play', 'touch')), start = performance.now();
          for (const points of streams) {
            engine.start(points[0]);
            for (const p of points.slice(1)) { const t = performance.now(); engine.move(p); if (repeat >= 3) samples[name].push(performance.now() - t); }
            engine.end(points.at(-1));
          }
          for (const dot of letter.geometry.dotTargets) { engine.start(dot); engine.end(dot); }
          if (engine.snapshot().outcome !== 'playComplete') throw new Error(`${name} ${id} did not finish`);
          if (repeat >= 3) runs[name].push(performance.now() - start);
        }
      }
      results.push({ id, revision: letter.contentVersion, totalMs: { before: summary(runs.before), after: summary(runs.after) }, sampleMs: { before: summary(samples.before), after: summary(samples.after) } });
    }
    return results;
  });
  writeFileSync('output/verification/tracing-completion/matcher-comparison.json', JSON.stringify({ date: new Date().toISOString(), browser: browser.version(), cpu: cpus()[0]?.model,
    method: 'Alternating original working-tree/new engines; 3 warmups and 10 repetitions each. Real reference sampling, 5-unit movement with fixed jitter, every stroke and dot. Software CPU time only.', results }, null, 2));
  for (const r of results) console.log(`${r.id}: median ${r.totalMs.before.p50.toFixed(2)} -> ${r.totalMs.after.p50.toFixed(2)} ms; sample p95 ${r.sampleMs.after.p95.toFixed(2)} ms`);
} finally { await browser.close(); }
