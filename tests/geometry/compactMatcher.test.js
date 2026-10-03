import { describe, it, expect } from 'vitest';
import { createMatcher } from '../../src/tracing/matcher.js';
import { createPlayMatcher } from '../../src/tracing/playMatcher.js';
import { getProfile } from '../../src/tracing/profiles.js';
import { fixture, lineReference, lineTrace } from '../fixtures/traces.js';

for (const [mode, factory] of [['play', createPlayMatcher], ['guided', createMatcher], ['precision', createMatcher]]) {
  describe(`${mode} compact input compatibility`, () => {
    it('preserves every decision, metric and snapshot through accepted, invalid and interrupted input', () => {
      const f = fixture(lineReference), profile = getProfile(mode, 'touch');
      const full = factory(f.letter, f.references, profile), compact = factory(f.letter, f.references, profile, { compact: true });
      const invoke = (method, point) => {
        const expected = full[method](point), actual = compact[method](point);
        expect(actual.phase).toBe(expected.phase); expect(actual.inputDecision).toEqual(expected.inputDecision);
        expect(compact.snapshot()).toEqual(full.snapshot());
        expect(compact.view().progress).toEqual(expected.progress);
      };
      invoke('start', lineTrace[0]); lineTrace.slice(1, 45).forEach(p => invoke('move', p));
      const saved = compact.snapshot(), frozen = structuredClone(saved);
      invoke('move', { x: 900, y: 900 }); invoke('end', { x: 900, y: 900 });
      invoke('start', lineTrace[0]); invoke('cancel');
      invoke('start', lineTrace[0]); lineTrace.slice(1).forEach(p => invoke('move', p)); invoke('end', lineTrace.at(-1));
      expect(saved).toEqual(frozen); expect(compact.isBusy()).toBe(false);
    });
  });
}
it('compact equivalent-pad input preserves containment, separate dots and release-only commits', () => {
  const f = fixture(lineReference, { dots: [{ x: 300, y: 400, visibleRadius: 19 }, { x: 440, y: 400, visibleRadius: 19 }] });
  const profile = getProfile('play', 'touch');
  const full = createPlayMatcher(f.letter, f.references, profile), compact = createPlayMatcher(f.letter, f.references, profile, { compact: true });
  const invoke = (method, ...args) => {
    const expected = full[method](...args), actual = compact[method](...args);
    expect(actual.inputDecision).toEqual(expected.inputDecision); expect(compact.snapshot()).toEqual(full.snapshot());
  };
  invoke('start', lineTrace[0]); lineTrace.slice(1).forEach(p => invoke('move', p)); invoke('end', lineTrace.at(-1));
  const p = { x: 42, y: 42 }, bounds = { x: 10, y: 10, width: 64, height: 64 };
  invoke('startPad', 'dot-1', p, bounds); invoke('startPad', 'dot-0', p, bounds); invoke('move', { x: 90, y: 42 }); invoke('end', p);
  invoke('startPad', 'dot-0', p, bounds); invoke('end', p); invoke('end', p);
  invoke('startPad', 'dot-1', p, bounds); expect(compact.snapshot().outcome).toBeNull(); invoke('end', p);
  expect(compact.snapshot().outcome).toBe('playComplete'); expect(compact.snapshot().metrics.equivalentDotActions).toBe(2);
});

it.each(['confirmation', 'assistance'])('compact Play preserves %s decisions and immutable completion diagnostics', method => {
  const f = fixture(lineReference), profile = getProfile('play', 'touch');
  const full = createPlayMatcher(f.letter, f.references, profile), compact = createPlayMatcher(f.letter, f.references, profile, { compact: true });
  const invoke = (name, p) => {
    const a = full[name](p), b = compact[name](p);
    expect(b.inputDecision).toEqual(a.inputDecision); expect(compact.snapshot()).toEqual(full.snapshot());
    return a;
  };
  invoke('start', lineTrace[0]); lineTrace.slice(1).forEach(p => invoke('move', p));
  const saved = compact.snapshot(), frozen = structuredClone(saved);
  if (method === 'confirmation') { invoke('cancel'); invoke('start', lineTrace.at(-1)); invoke('end', lineTrace.at(-1)); }
  else { invoke('move', { x: 143, y: 900 }); invoke('end', { x: 198, y: 900 }); }
  expect(compact.snapshot().outcome).toBe('playComplete'); expect(saved).toEqual(frozen);
});
