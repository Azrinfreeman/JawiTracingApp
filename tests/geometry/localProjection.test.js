import { describe, it, expect } from 'vitest';
import { makeReference, pointAt, projectLocal } from '../../src/tracing/geometry.js';

// Independent full scan kept as a numerical oracle for the bounded search.
function scan(p, ref, minimum, maximum) {
  minimum = Math.max(0, minimum); maximum = Math.min(ref.length, maximum);
  let best = null;
  for (let i = 1; i < ref.vertices.length; i++) {
    const a = ref.vertices[i - 1], b = ref.vertices[i];
    if (b.s < minimum) continue;
    if (a.s > maximum) break;
    const span = b.s - a.s, dx = b.x - a.x, dy = b.y - a.y;
    const raw = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (span * span);
    const t = Math.max(Math.max(0, (minimum - a.s) / span), Math.min(Math.min(1, (maximum - a.s) / span), raw));
    const x = a.x + dx * t, y = a.y + dy * t, error = Math.hypot(p.x - x, p.y - y), s = a.s + span * t;
    if (!best || error < best.error - .00001 || Math.abs(error - best.error) < .00001 && s < best.s) best = { x, y, error, s };
  }
  return best;
}
const fixtures = {
  line: Array.from({ length: 501 }, (_, i) => ({ x: 100, y: i * 2 })),
  curve: Array.from({ length: 501 }, (_, i) => ({ x: 500 + 300 * Math.cos(i * Math.PI / 500), y: 500 + 300 * Math.sin(i * Math.PI / 500) })),
  loop: Array.from({ length: 501 }, (_, i) => ({ x: 500 + 28 * Math.cos(i * 2 * Math.PI / 500), y: 500 + 28 * Math.sin(i * 2 * Math.PI / 500) })),
  crossing: [{ x: 100, y: 100 }, { x: 800, y: 800 }, { x: 100, y: 800 }, { x: 800, y: 100 }],
  hairpin: [{ x: 100, y: 100 }, { x: 100, y: 800 }, { x: 110, y: 800 }, { x: 110, y: 100 }],
};
describe('bounded projection equivalence', () => {
  for (const [name, points] of Object.entries(fixtures)) it(name, () => {
    const ref = makeReference(points);
    const intervals = [[0, 0], [0, ref.length], [ref.length, ref.length], ...ref.vertices.filter((_, i) => i % 7 === 0).map(v => [v.s, v.s])];
    for (let i = 0; i < 120; i++) intervals.push([ref.length * i / 120 - 18, ref.length * i / 120 + 90]);
    for (const [minimum, maximum] of intervals) {
      const p = pointAt(ref, minimum + (maximum - minimum) * .7);
      for (const offset of [0, 2, 39, 61]) {
        const sample = { x: p.x + offset, y: p.y - offset / 3 };
        expect(projectLocal(sample, ref, minimum, maximum)).toEqual(scan(sample, ref, minimum, maximum));
      }
    }
  });
});
