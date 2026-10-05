import { describe, it, expect } from 'vitest';
import { createPlayMatcher } from '../../src/tracing/playMatcher.js';
import { getProfile } from '../../src/tracing/profiles.js';
import { fixture, lineReference } from '../fixtures/traces.js';

const profile = getProfile('play', 'touch');
const point = fraction => ({ x: 100, y: 100 + 800 * fraction });
const setup = options => { const f = fixture(lineReference, options); return createPlayMatcher(f.letter, f.references, profile); };
function held(engine, fraction) {
  engine.start(point(0));
  for (let i = 1; i <= 200 * fraction; i++) engine.move(point(i / 200));
  return engine.move(point(fraction));
}

describe('finish readiness and terminal recovery', () => {
  it.each([.94, .95, .96])('readiness agrees with release at %s coverage', fraction => {
    const e = setup(); const status = held(e, fraction).finish;
    expect(status.frontier).toBeCloseTo(800 * fraction);
    expect(status.remainingArc).toBeCloseTo(800 * (1 - fraction));
    expect(status.canFinish).toBe(fraction >= .95);
    expect(e.end(point(fraction)).outcome === 'playComplete').toBe(status.canFinish);
  });
  it('shows remaining work after a lift and endpoint taps cannot add or commit it', () => {
    const e = setup(); held(e, .94); e.end(point(.94));
    expect(e.snapshot().finish).toMatchObject({ nearEnd: true, canFinish: false });
    for (let i = 0; i < 4; i++) {
      expect(e.start(point(1)).phase).toBe('paused');
      expect(e.end(point(1)).progress.body).toBeCloseTo(752);
    }
    e.start(point(.94)); e.move(point(.95));
    expect(e.snapshot().finish.canFinish).toBe(true);
    expect(e.end(point(.96)).outcome).toBe('playComplete');
    expect(e.end(point(1)).inputDecision.action).toBe('none');
  });
  it('uses real movement delivered on up, while cancellation clears readiness', () => {
    const e = setup(); held(e, .94);
    expect(e.end(point(.96)).outcome).toBe('playComplete');
    const cancelled = setup(); held(cancelled, .96); cancelled.cancel();
    expect(cancelled.snapshot().finish.canFinish).toBe(false);
    expect(cancelled.snapshot().finish.confirmationAvailable).toBe(true);
    cancelled.start(point(.96));
    expect(cancelled.end(point(.96)).outcome).toBe('playComplete');
    expect(cancelled.snapshot().metrics.endpointConfirmations).toBe(1);
  });
  it('requires endpoint contact and all authored checkpoints, then advances to a separate dot', () => {
    const f = fixture(lineReference); f.letter.geometry.strokes[0].checkpoints = [.25, .5, .75, .99];
    const checkpoints = createPlayMatcher(f.letter, f.references, profile);
    held(checkpoints, .96); expect(checkpoints.snapshot().finish.canFinish).toBe(false);
    const outside = setup(); held(outside, .96); outside.move({ x: 159, y: point(.96).y });
    expect(outside.snapshot().finish.canFinish).toBe(false);
    // The finger reached the end first, so drifting a little past it before lifting still finishes.
    expect(outside.end({ x: 159, y: point(.96).y }).outcome).toBe('playComplete');
    const dot = setup({ dots: [{ x: 300, y: 400, visibleRadius: 19 }] });
    held(dot, .96); expect(dot.end(point(.96))).toMatchObject({ phase: 'awaitingMark', completed: ['body'], outcome: null });
  });
  it('paused and exhausted input cannot report readiness', () => {
    const e = setup(); held(e, .96); e.move({ x: 240, y: 868 });
    expect(e.snapshot().completed).toEqual(['body']); // Reached the end first, so leaving the route cannot undo it.
    const early = setup(); held(early, .5); early.move({ x: 240, y: 500 });
    expect(early.snapshot().finish.canFinish).toBe(false); expect(early.snapshot().completed).toEqual([]);
    const f = fixture(lineReference), limited = createPlayMatcher(f.letter, f.references, { ...profile, maxSamples: 1 });
    limited.start(point(0)); limited.move(point(.01)); limited.move(point(.02));
    expect(limited.snapshot().finish.canFinish).toBe(false);
  });

  it.each(['touch', 'pen', 'mouse'])('confirms earned 95%% and 100%% work with a stationary %s endpoint tap', pointer => {
    for (const fraction of [.95, 1]) {
      const f = fixture(lineReference), e = createPlayMatcher(f.letter, f.references, getProfile('play', pointer));
      held(e, fraction); const measured = e.snapshot().progress.body;
      e.cancel();
      expect(e.snapshot().finish).toMatchObject({ confirmationAvailable: true, canFinish: false });
      expect(e.start(point(1)).finish).toMatchObject({ confirmationActive: true, canFinish: true });
      expect(e.snapshot().completed).toEqual([]);
      const result = e.end(point(1));
      expect(result.outcome).toBe('playComplete'); expect(result.progress.body).toBe(measured);
      expect(result.inputDecision).toMatchObject({ completionMethod: 'endpointConfirmation', confirmation: true });
      expect(result.completionMethods).toEqual({ body: 'endpointConfirmation' });
      expect(result.metrics.endpointConfirmations).toBe(1);
      e.end(point(1)); expect(e.snapshot().metrics.endpointConfirmations).toBe(1);
    }
  });

  it('never arms unearned work, future parts or missing checkpoints', () => {
    const initial = setup(); initial.start(point(1)); initial.end(point(1));
    expect(initial.snapshot().finish.confirmationAvailable).toBe(false);
    const f = fixture(lineReference, { second: [{ x: 600, y: 100 }, { x: 600, y: 900 }] });
    const e = createPlayMatcher(f.letter, f.references, profile);
    held(e, 1); e.end(point(1));
    e.start({ x: 600, y: 900 }); e.end({ x: 600, y: 900 });
    expect(e.snapshot().completed).toEqual(['body']);
    expect(e.snapshot().finish.confirmationAvailable).toBe(false);
    const checkpoints = fixture(lineReference); checkpoints.letter.geometry.strokes[0].checkpoints = [.99];
    const c = createPlayMatcher(checkpoints.letter, checkpoints.references, profile);
    held(c, .96); c.cancel(); c.start(point(1)); c.end(point(1));
    expect(c.snapshot().completed).toEqual([]); expect(c.snapshot().finish.confirmationAvailable).toBe(false);
  });

  it('confirmation stays rejected after an excursion, excess travel or cancellation and needs a fresh down', () => {
    for (const action of ['excursion', 'travel', 'cancel', 'invalid']) {
      const e = setup(); held(e, 1); e.cancel(); e.start(point(1));
      if (action === 'excursion') { e.move({ x: 300, y: 900 }); e.move(point(1)); }
      if (action === 'travel') { e.move({ x: 190, y: 900 }); e.move(point(1)); }
      if (action === 'cancel') e.cancel();
      if (action === 'invalid') e.move({ x: NaN, y: 900 });
      expect(e.end(point(1)).outcome).toBeNull(); expect(e.snapshot().metrics.endpointConfirmations).toBe(0);
      e.start(point(1)); expect(e.end(point(1)).outcome).toBe('playComplete');
    }
  });

  it('confirmation respects endpoint/travel boundaries and never creates tracing travel', () => {
    for (const [travel, succeeds] of [[100, true], [100.01, false]]) {
      const e = setup(); held(e, 1); e.cancel(); const before = e.snapshot().metrics.validTravel;
      e.start(point(1)); const result = e.end({ x: 100 + travel, y: 900 });
      expect(result.outcome === 'playComplete').toBe(succeeds); expect(result.metrics.validTravel).toBe(before);
    }
    for (const [offset, succeeds] of [[64, true], [64.01, false]]) {
      const e = setup(); held(e, 1); e.cancel(); const p = { x: 100 + offset, y: 900 };
      e.start(p); expect(e.end(p).outcome === 'playComplete').toBe(succeeds);
    }
  });

  it('exhaustion blocks eligible confirmation until input capacity is restored', () => {
    const f = fixture(lineReference), e = createPlayMatcher(f.letter, f.references, { ...profile, maxSamples: 201 });
    held(e, 1); e.move(point(1)); expect(e.snapshot().exhausted).toBe(true); e.cancel();
    expect(e.start(point(1)).finish.confirmationAvailable).toBe(false);
    e.rotateDiagnostics(); e.start(point(1)); expect(e.end(point(1)).outcome).toBe('playComplete');
  });

  it('finishes on release wherever the finger is after the end was reached', () => {
    for (const [x, y] of [[198, 900], [300, 900], [100, 1300], [-400, 900]]) {
      const e = setup(); held(e, 1); e.move({ x: 143, y: 900 });
      const result = e.end({ x, y });
      expect(result.outcome).toBe('playComplete'); expect(result.metrics.releaseAssistances).toBe(1);
      expect(result.completionMethods.body).toBe('releaseAssistance'); expect(result.progress.body).toBe(800);
    }
  });

  it('release cannot rescue early drift, incomplete work or a failed confirmation', () => {
    const early = setup(); held(early, .5); early.move({ x: 182, y: 500 });
    expect(early.end({ x: 182, y: 500 }).outcome).toBeNull();
    const incomplete = setup(); held(incomplete, .94);
    expect(incomplete.end({ x: 140, y: point(.94).y }).outcome).toBeNull();
    const tap = setup(); held(tap, 1); tap.cancel(); tap.start({ x: 143, y: 879 });
    expect(tap.end({ x: 230, y: 847 }).outcome).toBeNull();
  });

  it.each(['pen', 'mouse'])('finishes on release anywhere after the end for %s', pointer => {
    const f = fixture(lineReference), e = createPlayMatcher(f.letter, f.references, getProfile('play', pointer));
    held(e, 1); e.move({ x: 136, y: 900 });
    const result = e.end({ x: 400, y: 900 });
    expect(result.outcome).toBe('playComplete'); expect(result.metrics.releaseAssistances).toBe(1); expect(result.progress.body).toBe(800);
  });

  it('endpoint confirmation advances only the stroke and still requires the separate dot', () => {
    const e = setup({ dots: [{ x: 300, y: 400, visibleRadius: 19 }] });
    held(e, 1); e.cancel(); e.start(point(1));
    const body = e.end(point(1)); expect(body.phase).toBe('awaitingMark');
    expect(body.pending).toEqual(['dot-0']); expect(body.outcome).toBeNull();
    e.start({ x: 300, y: 400 }); expect(e.end({ x: 300, y: 400 }).outcome).toBe('playComplete');
    expect(e.snapshot().metrics.dotCount).toBe(1); expect(e.snapshot().metrics.endpointConfirmations).toBe(1);
  });

  describe('leaving the route after the end', () => {
    const past = d => ({ x: 100 + d, y: 900 });
    const overshoot = (e, d) => { held(e, 1); for (const k of [20, 40, 60, 80, d]) e.move(past(k)); return past(d); };
    it('finishes as soon as the finger drifts off the route, without waiting for a lift', () => {
      const e = setup(); overshoot(e, 90);
      expect(e.snapshot().phase).toBe('complete'); expect(e.snapshot().completionMethods.body).toBe('releaseAssistance');
      expect(e.end(past(90)).inputDecision.action).toBe('none'); expect(e.snapshot().completed).toEqual(['body']);
    });
    it('finishes on a fast flick far away and on a lift far away', () => {
      const flick = setup(); held(flick, 1); flick.move({ x: 400, y: 900 });
      expect(flick.snapshot().phase).toBe('complete');
      const far = setup(); overshoot(far, 400); expect(far.snapshot().phase).toBe('complete');
    });
    it('does not finish below coverage even if the finger drifts away', () => {
      const e = setup(); held(e, .5); for (const k of [20, 40, 60, 80]) e.move({ x: 100 + k, y: 500 });
      expect(e.end({ x: 180, y: 500 }).inputDecision.action).toBe('partial');
    });
    it('a dragged endpoint touch commits after a cancelled gesture', () => {
      const e = setup(); held(e, .96); e.cancel(); e.start(point(1));
      for (const k of [10, 20, 30, 45, 55]) e.move({ x: 100 + k, y: 900 });
      expect(e.end({ x: 155, y: 900 }).outcome).toBe('playComplete');
    });
    it('an endpoint touch dragged far away does not commit', () => {
      const e = setup(); held(e, .96); e.cancel(); e.start(point(1));
      for (const k of [30, 90, 150, 220]) e.move({ x: 100 + k, y: 900 });
      expect(e.end({ x: 320, y: 900 }).inputDecision.action).not.toBe('commit');
    });
    it('a cancelled gesture never finishes by itself', () => {
      const e = setup(); held(e, 1); e.cancel();
      expect(e.snapshot().completed).toEqual([]);
    });
  });
});
