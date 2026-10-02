import { describe, it, expect } from 'vitest';
import { createMatcher } from '../../src/tracing/matcher.js';
import { getProfile } from '../../src/tracing/profiles.js';
import { fixture, lineReference, lineTrace, trace } from '../fixtures/traces.js';

const engineFor = (options = {}, mode = 'guided') => {
  const f = fixture(lineReference, options);
  return createMatcher(f.letter, f.references, getProfile(mode));
};

describe('strict gesture decisions', () => {
  it('rejects starts inside the start halo but outside the tracing corridor', () => {
    const e = engineFor();
    const result = e.start({ x: 128, y: 100 });
    expect(result.inputDecision.action).toBe('reject');
    expect(result.inputDecision.acceptedRawPoints).toEqual([]);
    expect(result.blocked).toBe(true);
    lineTrace.forEach(p => e.move(p));
    expect(e.end(lineTrace.at(-1)).outcome).toBeNull();
    expect(trace(e, lineTrace).outcome).toBe('guidedComplete');
  });
  it('preserves raw accepted movement rather than substituting the centreline', () => {
    const e = engineFor(), down = { x: 105, y: 100 }, next = { x: 107, y: 120 };
    expect(e.start(down).inputDecision.acceptedRawPoints).toEqual([down]);
    expect(e.move(next).inputDecision.acceptedRawPoints).toEqual([next]);
    expect(e.snapshot()).not.toHaveProperty('inputDecision');
    expect(e.snapshot().metrics.meanError).toBeGreaterThan(5);
  });
  it('rolls back a dirty guided resume to the exact previously saved prefix', () => {
    const e = engineFor(); trace(e, lineTrace.slice(0, 70));
    const saved = e.snapshot().progress.body;
    e.start(lineTrace[69]); lineTrace.slice(70, 100).forEach(p => e.move(p));
    expect(e.snapshot().progress.body).toBeGreaterThan(saved);
    const result = e.move({ x: 160, y: lineTrace[99].y });
    expect(result.progress.body).toBe(saved);
    expect(result.inputDecision.discardGestureInk).toBe(true);
    e.move(lineTrace[99]); expect(e.end(lineTrace.at(-1)).progress.body).toBe(saved);
    expect(trace(e, lineTrace.slice(69)).phase).toBe('complete');
  });
  it('counts an entire wrong-start gesture without counting stationary frames as errors', () => {
    const e = engineFor(); e.start({ x: 500, y: 500 });
    for (let i = 0; i < 50; i++) e.move({ x: 500, y: 500 });
    e.move({ x: 550, y: 500 }); e.move({ x: 550, y: 560 }); e.end({ x: 550, y: 560 });
    expect(e.snapshot().metrics.invalidTravel).toBe(110);
    expect(e.snapshot().metrics.invalidEvents).toBe(1);
    expect(e.snapshot().metrics.wrongStartGestures).toBe(1);
    expect(e.snapshot().metrics.coverage).toBe(0);
  });
  it('removes all unfinished precision ink on an early lift', () => {
    const e = engineFor({}, 'precision'); e.start(lineTrace[0]);
    lineTrace.slice(1, 50).forEach(p => e.move(p));
    const result = e.end(lineTrace[49]);
    expect(result.inputDecision.clearPartInk).toBe(true);
    expect(result.inputDecision.discardGestureInk).toBe(true);
    expect(result.metrics.coverage).toBe(0);
    expect(trace(e, lineTrace).phase).toBe('complete');
  });
  it('rejects deviation even after reaching the endpoint but before releasing', () => {
    const e = engineFor(); e.start(lineTrace[0]); lineTrace.slice(1).forEach(p => e.move(p));
    expect(e.snapshot().outcome).toBeNull();
    e.move({ x: 160, y: 900 }); e.move(lineTrace.at(-1));
    expect(e.end(lineTrace.at(-1)).completed).toEqual([]);
    expect(e.snapshot().metrics.coverage).toBe(0);
  });
  it('cancels an unfinished resumed stroke, preserving previously completed parts', () => {
    const e = engineFor({ second: [{ x: 600, y: 100 }, { x: 600, y: 900 }] });
    trace(e, lineTrace);
    const second = lineTrace.map(p => ({ ...p, x: 600 })); trace(e, second.slice(0, 40));
    e.start(second[39]); e.move(second[40]); const result = e.cancel();
    expect(result.completed).toEqual(['body']); expect(result.progress.second).toBe(0);
    expect(result.inputDecision.clearPartInk).toBe(true);
    expect(trace(e, second).phase).toBe('complete');
    expect(e.cancel().phase).toBe('complete');
  });
  it('locks profiles and keeps teacher support from unlocking strict control', () => {
    const normal = getProfile(), support = getProfile('guided', 'touch', 'support');
    expect(Object.isFrozen(normal)).toBe(true); expect(normal.id).toMatch(/v2$/);
    expect(support.radius).toBe(42); expect(support.dotRadius).toBe(34);
    expect(support.interactionPolicy).toBe('strict-v2');
    expect(getProfile('precision', 'mouse', 'support').radius).toBe(16);
  });
});

describe('strict tap marks', () => {
  const ready = () => { const e = engineFor({ dots: [{ x: 300, y: 400 }, { x: 440, y: 400 }] }); trace(e, lineTrace); return e; };
  it('never creates stroke ink for a dot and stamps exactly one validated target', () => {
    const e = ready(), down = { x: 306, y: 401 }, up = { x: 309, y: 401 };
    expect(e.start(down).inputDecision.acceptedRawPoints).toEqual([]);
    expect(e.move(up).inputDecision.acceptedRawPoints).toEqual([]);
    const result = e.end(up);
    expect(result.inputDecision.mark).toMatchObject({ id: 'dot-0', x: 300, y: 400, rendering: 'targetStamp', down, up });
    expect(result.metrics.dotCount).toBe(1); expect(result.outcome).toBeNull();
  });
  it('rejects excessive cumulative travel inside a target and preserves raw travel accounting', () => {
    const e = ready(); e.start({ x: 300, y: 400 }); e.move({ x: 306, y: 400 });
    expect(e.move({ x: 300, y: 406 }).blocked).toBe(true);
    e.move({ x: 300, y: 400 }); e.end({ x: 300, y: 400 });
    expect(e.snapshot().metrics.dotCount).toBe(0);
    expect(e.snapshot().metrics.invalidTravel).toBeCloseTo(6 + Math.sqrt(72) + 6);
    expect(e.snapshot().metrics.rejectedDotGestures).toBe(1);
  });
  it('rejects a brief target exit even if a later release returns to its centre', () => {
    const e = ready(); e.start({ x: 323, y: 400 });
    expect(e.move({ x: 325, y: 400 }).blocked).toBe(true);
    expect(e.end({ x: 323, y: 400 }).inputDecision.mark).toBeNull();
    expect(e.snapshot().metrics.dotCount).toBe(0);
  });
  it('a cross-target drag cannot fill either dot; separate clean taps can finish', () => {
    const e = ready(); e.start({ x: 300, y: 400 });
    for (let x = 305; x <= 440; x += 5) e.move({ x, y: 400 });
    expect(e.end({ x: 440, y: 400 }).metrics.dotCount).toBe(0);
    expect(e.snapshot().completed).toEqual(['body']);
    e.start({ x: 300, y: 400 }); e.end({ x: 300, y: 400 });
    e.start({ x: 300, y: 400 }); e.end({ x: 300, y: 400 });
    expect(e.snapshot().metrics.dotCount).toBe(1);
    e.start({ x: 440, y: 400 }); expect(e.end({ x: 440, y: 400 }).outcome).toBe('guidedComplete');
  });
});
