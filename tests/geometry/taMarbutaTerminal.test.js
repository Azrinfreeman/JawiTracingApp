import { describe, it, expect } from 'vitest';
import letters from '../../src/content/letters.json';
import fixture from '../fixtures/ta-marbuta-terminal.json';
import { makeReference, pointAt } from '../../src/tracing/geometry.js';
import { createPlayMatcher } from '../../src/tracing/playMatcher.js';
import { getProfile } from '../../src/tracing/profiles.js';

const letter = letters.find(l => l.id === 'ta-marbuta');
const ref = makeReference(fixture.reference), refs = { 'stroke-1': ref };
const at = s => pointAt(ref, s);
function drawnLoop(engine, { scale = 1, dy = 0, spacing = 6, quantize = 0 } = {}) {
  const point = s => {
    const p = at(s), x = 505.1 + (p.x - 505.1) * scale, y = 469 + (p.y - 469) * scale + dy;
    return { x: quantize ? Math.round(x / quantize) * quantize : x, y: quantize ? Math.round(y / quantize) * quantize : y };
  };
  engine.start(point(0));
  for (let s = spacing; s < ref.length; s += spacing) engine.move(point(s));
  return engine.end(point(ref.length));
}
function repair(engine, cancel = false) {
  const saved = engine.snapshot().progress['stroke-1'];
  engine.start(at(saved));
  expect(engine.snapshot().progress['stroke-1']).toBe(saved); // Contact alone earns nothing.
  for (let s = saved + 3; s < ref.length; s += 3) engine.move(at(s));
  if (cancel) return engine.cancel();
  return engine.end(at(ref.length));
}

describe('Ta marbutah closed-loop terminal recovery', () => {
  it('uses the current approved path and keeps the two dots separate', () => {
    expect(letter.contentVersion).toBe(4);
    expect(letter.geometry.strokes[0].path).toBe(fixture.path);
    for (const pointer of ['touch', 'pen', 'mouse']) {
      const e = createPlayMatcher(letter, refs, getProfile('play', pointer));
      expect(drawnLoop(e)).toMatchObject({ completed: ['stroke-1'], pending: ['dot-1'], outcome: null });
      const [a, b] = letter.geometry.dotTargets;
      e.start(b); e.end(b); expect(e.snapshot().completed).toEqual(['stroke-1']);
      e.start(a); e.move(b); e.end(b); expect(e.snapshot().completed).toEqual(['stroke-1']);
      e.start(a); e.end(a); expect(e.snapshot().outcome).toBeNull();
      e.start(b); expect(e.end(b).outcome).toBe('playComplete');
      expect(e.end(b).completed).toEqual(['stroke-1', 'dot-1', 'dot-2']);
    }
  });

  it.each([{ scale: .85, dy: -24, spacing: 24 }, { scale: .85, dy: -24, spacing: 6, quantize: 12 }])(
    'can retrace the displayed remaining tail after an off-centre loop: %j', input => {
      for (const compact of [false, true]) {
        const e = createPlayMatcher(letter, refs, getProfile('play', 'touch'), { compact });
        drawnLoop(e, input);
        const before = e.snapshot();
        expect(before.metrics.coverage).toBeLessThan(.95);
        expect(before.finish.confirmationAvailable).toBe(false);
        // Tapping the shared start/end cannot bypass the untraced tail.
        e.start(at(ref.length)); e.end(at(ref.length));
        expect(e.snapshot().progress).toEqual(before.progress);
        repair(e);
        expect(e.snapshot()).toMatchObject({ phase: 'awaitingMark', completed: ['stroke-1'], pending: ['dot-1'], outcome: null });
        expect(e.snapshot().metrics.coverage).toBeGreaterThanOrEqual(.95);
      }
    });

  it('recovery still requires forward movement and respects cancellation', () => {
    const e = createPlayMatcher(letter, refs, getProfile('play', 'touch'));
    drawnLoop(e, { scale: .85, dy: -24, spacing: 24 });
    const saved = e.snapshot().progress['stroke-1'];
    for (let i = 0; i < 30; i++) {
      e.start(at(saved)); e.move(at(saved - 24)); e.end(at(saved));
    }
    expect(e.snapshot().progress['stroke-1']).toBe(saved);
    expect(e.snapshot().completed).toEqual([]);
    repair(e, true); expect(e.snapshot().completed).toEqual([]);
    e.start(at(ref.length)); e.end(at(ref.length));
    expect(e.snapshot()).toMatchObject({ completed: ['stroke-1'], pending: ['dot-1'], outcome: null });
  });
});
