import { describe, it, expect } from 'vitest';
import { createPlayMatcher } from '../../src/tracing/playMatcher.js';
import { getProfile } from '../../src/tracing/profiles.js';
import { fixture, lineReference, lineTrace, arcReference, arcTrace, trace } from '../fixtures/traces.js';

const setup = (points = lineReference, options = {}, profile = getProfile('play')) => {
  const f = fixture(points, options); return createPlayMatcher(f.letter, f.references, profile);
};
describe('assisted route progress', () => {
  it('finishes forward input as assisted practice and never returns raw ink decisions', () => {
    const e = setup(); expect(e.start(lineTrace[0]).inputDecision.acceptedRawPoints).toEqual([]);
    lineTrace.slice(1).forEach(p => e.move(p));
    expect(e.snapshot().outcome).toBeNull();
    expect(e.end(lineTrace.at(-1))).toMatchObject({ outcome: 'playComplete', inkPolicy: 'assistedRouteFill' });
    expect(e.snapshot()).not.toHaveProperty('inputDecision');
  });
  it('preserves a paused prefix and re-acquires with the held pointer without bridging', () => {
    const e = setup(); e.start(lineTrace[0]); lineTrace.slice(1, 60).forEach(p => e.move(p));
    const saved = e.snapshot().progress.body;
    e.move({ x: 180, y: lineTrace[59].y });
    expect(e.snapshot()).toMatchObject({ phase: 'paused', progress: { body: saved } });
    expect(e.move(lineTrace[59]).inputDecision.action).toBe('resume');
    expect(e.snapshot().progress.body).toBe(saved);
    lineTrace.slice(60).forEach(p => e.move(p));
    expect(e.end(lineTrace.at(-1)).outcome).toBe('playComplete');
    expect(e.snapshot().metrics.pauseEpisodes).toBe(1);
  });
  it('a wrong start can acquire later, while endpoint taps and distant re-entry earn nothing', () => {
    const e = setup(); e.start({ x: 500, y: 500 }); e.move(lineTrace.at(-1));
    expect(e.snapshot().metrics.coverage).toBe(0);
    expect(e.move(lineTrace[0]).inputDecision.action).toBe('resume');
    expect(e.snapshot().metrics.coverage).toBe(0);
    lineTrace.slice(1).forEach(p => e.move(p)); expect(e.end(lineTrace.at(-1)).phase).toBe('complete');
    const tap = setup(); expect(trace(tap, [lineTrace.at(-1)]).metrics.coverage).toBe(0);
  });
  it('retains unfinished work through lifts, cancellation and diagnostic rotation', () => {
    const e = setup(); trace(e, lineTrace.slice(0, 60)); const saved = e.snapshot().progress.body;
    e.start(lineTrace[59]); e.cancel(); expect(e.snapshot().progress.body).toBe(saved);
    e.rotateDiagnostics(); expect(e.snapshot().progress.body).toBe(saved);
    expect(trace(e, lineTrace.slice(59)).outcome).toBe('playComplete');
    expect(e.snapshot().metrics.diagnosticRotations).toBe(1);
  });
  it('rejects curved chords and reversals while accepting ordinary off-centre jitter', () => {
    const curve = setup(arcReference); curve.start(arcTrace[0]); curve.move(arcTrace[120]);
    expect(curve.snapshot().phase).toBe('paused'); expect(curve.snapshot().metrics.coverage).toBe(0);
    curve.cancel(); expect(trace(curve, arcTrace).outcome).toBe('playComplete');
    const reverse = setup(); trace(reverse, lineTrace.slice(0, 70)); reverse.start(lineTrace[69]);
    reverse.move(lineTrace[50]); expect(reverse.snapshot().phase).toBe('paused');
    const jitter = setup(); expect(trace(jitter, lineTrace.map((p,i) => ({ ...p, x:p.x + 8 + Math.sin(i*.5)*4 }))).outcome).toBe('playComplete');
  });
  it('stationary input and repeated acquisition wiggles cannot ratchet a whole route', () => {
    const e = setup();
    for (let i = 0; i < 120; i++) trace(e, [{ x:100, y:116 }, { x:100, y:120 }, { x:100, y:116 }]);
    expect(e.snapshot().progress.body).toBeLessThanOrEqual(20.01);
    expect(e.snapshot().outcome).toBeNull();
    const loopPoints = Array.from({length:301}, (_,i) => ({ x:100+28*Math.cos(i*Math.PI*2/300), y:100+28*Math.sin(i*Math.PI*2/300) }));
    const loop = setup(loopPoints); loop.start({x:100,y:100});
    for (let i=0;i<1200;i++) loop.move({x:100+Math.cos(i*.3),y:100+Math.sin(i*.3)});
    expect(loop.end({x:100,y:100}).outcome).toBeNull();
    expect(loop.snapshot().metrics.coverage).toBeLessThan(.3);
    for(let j=0;j<200;j++) {
      loop.start({x:100,y:100});
      for(let i=0;i<30;i++)loop.move({x:100+Math.cos(i*.3),y:100+Math.sin(i*.3)});
      loop.end({x:100,y:100});if(j%40===0)loop.rotateDiagnostics();
    }
    expect(loop.snapshot().outcome).toBeNull();expect(loop.snapshot().metrics.coverage).toBeLessThan(.3);
    expect(loop.snapshot().metrics.turnProjectionAllowanceUnits).toBeLessThanOrEqual(getProfile('play').turnAllowance);
  });
  it('does not relabel terminal display assistance as measured coverage', () => {
    const e = setup(); const partial = lineTrace.slice(0, 194);
    const result = trace(e, partial);
    expect(result.outcome).toBe('playComplete'); expect(result.metrics.coverage).toBeCloseTo(.965);
    expect(result.metrics.terminalDisplayFillUnits).toBeCloseTo(28);
  });
  it('buffers exhaust without completing, then deliberately rotate without losing progress', () => {
    const e = setup(lineReference, {}, {...getProfile('play'),maxSamples:3});
    e.start(lineTrace[0]); lineTrace.slice(1,5).forEach(p=>e.move(p));
    const saved = e.snapshot().progress.body;
    expect(e.end(lineTrace[4]).outcome).toBeNull(); expect(e.snapshot().exhausted).toBe(true);
    e.rotateDiagnostics(); expect(e.snapshot().exhausted).toBe(false); expect(e.snapshot().progress.body).toBe(saved);
  });
  it('respects separate movement order and explicitly authored alternatives', () => {
    const second=[{x:600,y:100},{x:600,y:900}], input=lineTrace.map(p=>({...p,x:600}));
    const ordered=setup(lineReference,{second});trace(ordered,input);expect(ordered.snapshot().completed).toEqual([]);
    trace(ordered,lineTrace);expect(trace(ordered,input).outcome).toBe('playComplete');
    const alternative=setup(lineReference,{second,sequences:[['body','second'],['second','body']]});
    trace(alternative,input);expect(trace(alternative,lineTrace).outcome).toBe('playComplete');
  });
  it('nearby return branches cannot be selected ahead of the retained frontier', () => {
    const hairpin=[{x:100,y:100},{x:100,y:800},{x:110,y:800},{x:110,y:100}];
    const e=setup(hairpin);trace(e,[{x:100,y:100},{x:110,y:100}]);expect(e.snapshot().metrics.coverage).toBe(0);
    trace(e,lineTrace.slice(0,100));const saved=e.snapshot().metrics.coverage;
    trace(e,[{x:110,y:200},{x:110,y:100}]);expect(e.snapshot().metrics.coverage).toBe(saved);
    expect(e.snapshot().outcome).toBeNull();
  });
  it('accepts independent quantised tight turns and continuous loops without a scoring timeout', () => {
    const q=(a,b,c,t)=>({x:(1-t)**2*a.x+2*(1-t)*t*b.x+t*t*c.x,y:(1-t)**2*a.y+2*(1-t)*t*b.y+t*t*c.y});
    const sections=[[{x:750,y:520},{x:680,y:520},{x:685,y:390}],[{x:685,y:390},{x:685,y:530},{x:605,y:535}]];
    const reference=sections.flatMap((s,j)=>Array.from({length:301},(_,i)=>q(...s,i/300)).slice(j?1:0));
    const input=sections.flatMap((s,j)=>Array.from({length:121},(_,i)=>q(...s,i/120)).slice(j?1:0)).map(p=>({x:Math.round(p.x/1.62)*1.62,y:Math.round(p.y/1.62)*1.62}));
    expect(trace(setup(reference),input).outcome).toBe('playComplete');
    const loop=n=>Array.from({length:n+1},(_,i)=>({x:500+65*Math.cos(i*2*Math.PI/n),y:500+65*Math.sin(i*2*Math.PI/n)}));
    expect(trace(setup(loop(720)),loop(144)).outcome).toBe('playComplete');
  });
  it('exact gap limits allow brisk valid input, while sparse and invalid input never completes', () => {
    const e=setup();e.start(lineTrace[0]);e.move({x:100,y:180});expect(e.snapshot().metrics.teleports).toBe(0);
    const saved=e.snapshot().progress.body;e.move({x:100,y:260.01});expect(e.snapshot().progress.body).toBe(saved);
    expect(e.snapshot().metrics.teleports).toBe(1);e.move({x:NaN,y:200});expect(e.snapshot().outcome).toBeNull();
    expect(trace(setup(),lineTrace.filter((_,i)=>i%50===0)).outcome).toBeNull();
  });
});
describe('assisted dot gestures', () => {
  const ready = () => { const e = setup(lineReference, {dots:[{x:300,y:400,visibleRadius:19},{x:440,y:400,visibleRadius:19}]}); trace(e,lineTrace);return e; };
  it('cross-target drags fail without trails or lost body work, separate taps complete', () => {
    const e = ready(); trace(e, [{x:300,y:400},{x:440,y:400}]);
    expect(e.snapshot().metrics.dotCount).toBe(0); expect(e.snapshot().completed).toEqual(['body']);
    expect(trace(e,[{x:306,y:400}]).inputDecision.mark).toMatchObject({id:'dot-0',inputSource:'board',coordinateSpace:'boardLogical'});
    trace(e,[{x:300,y:400}]);expect(e.snapshot().metrics.dotCount).toBe(1);
    expect(trace(e,[{x:440,y:400}]).outcome).toBe('playComplete');
  });
  it('equivalent pads require a pending target and valid containment through release', () => {
    const e = ready(), bounds={x:10,y:10,width:64,height:64}, p={x:42,y:42};
    expect(e.startPad('dot-1',p,bounds).inputDecision.action).toBe('none');
    e.startPad('dot-0',p,bounds); e.move({x:90,y:42}); e.end(p);
    expect(e.snapshot().metrics.dotCount).toBe(0);
    e.startPad('dot-0',p,bounds); const first=e.end(p);
    expect(first.inputDecision.mark).toMatchObject({id:'dot-0',inputSource:'equivalentPad',coordinateSpace:'clientCSS'});
    expect(e.end(p).inputDecision.mark).toBeNull();
    e.startPad('dot-1',p,bounds);expect(e.end(p).outcome).toBe('playComplete');
    expect(e.snapshot().metrics.equivalentDotActions).toBe(2);
  });
  it('a tiny or invalid pad cannot be used to bypass spatial targets', () => {
    const e=ready();expect(e.startPad('dot-0',{x:10,y:10},{x:0,y:0,width:20,height:20}).gestureActive).toBe(false);
  });
});
