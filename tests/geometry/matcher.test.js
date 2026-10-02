import { describe,it,expect } from 'vitest';
import { createMatcher } from '../../src/tracing/matcher.js';
import { getProfile } from '../../src/tracing/profiles.js';
import { fixture,lineReference,lineTrace,arcReference,arcTrace,trace } from '../fixtures/traces.js';
const engineFor = (points=lineReference,options={},mode='guided') => { const f=fixture(points,options); return createMatcher(f.letter,f.references,getProfile(mode,'mouse')); };

describe('ordered continuous tracing',()=>{
  it('completes independent forward line and curved traces',()=>{
    expect(trace(engineFor(),lineTrace).outcome).toBe('guidedComplete');
    expect(trace(engineFor(arcReference),arcTrace).phase).toBe('complete');
    expect(trace(engineFor(arcReference,{},'precision'),arcTrace).outcome).toBe('precisionComplete');
  });
  it('rejects reverse input, wrong starts and endpoint taps',()=>{
    expect(trace(engineFor(),lineTrace.toReversed()).phase).not.toBe('complete');
    expect(trace(engineFor(),[{x:500,y:500},...lineTrace.slice(150)]).phase).not.toBe('complete');
    const e=engineFor(); e.start(lineTrace[0]); e.end(lineTrace[0]); e.start(lineTrace.at(-1));
    expect(e.end(lineTrace.at(-1)).phase).not.toBe('complete');
  });
  it('rejects teleporting and sparse checkpoint-only input',()=>{
    const e=engineFor(); trace(e,[lineTrace[0],lineTrace.at(-1)]);
    expect(e.snapshot().metrics.teleports).toBeGreaterThan(0);
    expect(e.snapshot().metrics.coverage).toBe(0);
    expect(trace(engineFor(),lineTrace.filter((_,i)=>i%50===0)).phase).not.toBe('complete');
  });
  it('validates chords between samples, not just curve endpoints',()=>{
    const tight=Array.from({length:121},(_,i)=>({x:500+29*Math.cos(Math.PI*i/120),y:500+29*Math.sin(Math.PI*i/120)}));
    const e=engineFor(tight,{},'precision');
    const result=trace(e,[tight[0],tight.at(-1)]);
    expect(result.phase).not.toBe('complete');
    expect(result.metrics.invalidEvents).toBeGreaterThan(0);
    expect(trace(engineFor(arcReference),[{x:800,y:250},...Array.from({length:151},(_,i)=>({x:800-i*4,y:250}))]).phase).not.toBe('complete');
  });
  it('requires each dot and rejects misplaced dots and broad gestures',()=>{
    const e=engineFor(lineReference,{dots:[{x:300,y:400},{x:440,y:400}]});
    expect(trace(e,lineTrace).phase).toBe('awaitingMark');
    e.start({x:300,y:400}); e.move({x:440,y:400}); e.end({x:440,y:400});
    expect(e.snapshot().metrics.dotCount).toBe(0);
    e.start({x:300,y:400}); e.end({x:300,y:400});
    expect(e.snapshot().metrics.dotCount).toBe(1);
    expect(e.snapshot().phase).not.toBe('complete');
    e.start({x:300,y:400}); e.end({x:300,y:400});
    expect(e.snapshot().metrics.dotCount).toBe(1);
    e.start({x:440,y:400}); expect(e.end({x:440,y:400}).phase).toBe('complete');
  });
  it('rejects wrong stroke order and supports reviewed alternative sequences',()=>{
    const second=[{x:600,y:100},{x:600,y:900}];
    const secondTrace=lineTrace.map(p=>({...p,x:600}));
    const e=engineFor(lineReference,{second});
    trace(e,secondTrace); expect(e.snapshot().completed).toEqual([]);
    trace(e,lineTrace); expect(trace(e,secondTrace).phase).toBe('complete');
    const alternative=engineFor(lineReference,{second,sequences:[['body','second'],['second','body']]});
    trace(alternative,secondTrace); expect(trace(alternative,lineTrace).phase).toBe('complete');
  });
  it('cannot gain coverage by dwelling or repeated scribbles',()=>{
    const e=engineFor(); e.start(lineTrace[0]);
    for(let i=0;i<100;i++) e.move(lineTrace[0]);
    expect(e.snapshot().metrics.coverage).toBe(0);
    for(let i=0;i<80;i++) e.move({x:100+15*Math.sin(i),y:100+15*Math.cos(i)});
    expect(e.end(lineTrace[0]).phase).not.toBe('complete');
    expect(e.snapshot().metrics.coverage).toBeLessThan(.08);
  });
  it('maintains branch continuity at close parallel paths and crossings',()=>{
    const hairpin=[{x:100,y:100},{x:100,y:800},{x:110,y:800},{x:110,y:100}];
    const e=engineFor(hairpin); e.start({x:100,y:100}); e.move({x:110,y:100});
    expect(e.snapshot().metrics.coverage).toBeLessThan(.02);
    const crossing=[{x:200,y:200},{x:800,y:800},{x:200,y:800},{x:800,y:200}];
    const c=engineFor(crossing); c.start({x:200,y:200});
    for(let i=1;i<=75;i++) c.move({x:200+i*4,y:200+i*4});
    const before=c.snapshot().metrics.coverage;
    c.move({x:510,y:490});
    expect(c.snapshot().metrics.coverage-before).toBeLessThan(.04);
  });
  it('resumes guided lifts at the frontier without bridging a missing section',()=>{
    const e=engineFor(); trace(e,lineTrace.slice(0,80));
    const before=e.snapshot().metrics.coverage;
    trace(e,lineTrace.slice(140));
    expect(e.snapshot().metrics.coverage).toBe(before);
    expect(trace(e,lineTrace.slice(79)).phase).toBe('complete');
  });
  it('restarts an unfinished continuous precision stroke after a lift',()=>{
    const e=engineFor(lineReference,{},'precision'); trace(e,lineTrace.slice(0,100));
    expect(e.snapshot().metrics.coverage).toBe(0);
    expect(trace(e,lineTrace.slice(99)).phase).not.toBe('complete');
    expect(trace(e,lineTrace).phase).toBe('retry');
    expect(trace(engineFor(lineReference,{},'precision'),lineTrace).phase).toBe('complete');
  });
  it('out-of-corridor input rolls back and same-gesture re-entry cannot recover',()=>{
    const e=engineFor(); e.start(lineTrace[0]); lineTrace.slice(1,60).forEach(p=>e.move(p));
    const before=e.snapshot().metrics.coverage;
    e.move({x:200,y:360}); e.move({x:100,y:750});
    expect(before).toBeGreaterThan(0);
    expect(e.snapshot().metrics.coverage).toBe(0);
    e.move(lineTrace[59]);
    expect(e.snapshot().metrics.coverage).toBe(0);
    lineTrace.slice(60).forEach(p=>e.move(p)); expect(e.end(lineTrace.at(-1)).phase).not.toBe('complete');
    expect(trace(e,lineTrace).phase).toBe('complete');
  });
  it('tolerates deterministic hand jitter but records large backtracking',()=>{
    const jitter=lineTrace.map((p,i)=>({...p,x:p.x+4*Math.sin(i*.8),y:p.y+2*Math.sin(i*.4)}));
    expect(trace(engineFor(),jitter).phase).toBe('complete');
    const e=engineFor(); e.start(lineTrace[0]); lineTrace.slice(1,100).forEach(p=>e.move(p));
    const before=e.snapshot().metrics.coverage;
    e.move({x:100,y:455});
    expect(before).toBeGreaterThan(0);
    expect(e.snapshot().metrics.coverage).toBe(0);
    expect(e.snapshot().metrics.backwardTravel).toBeGreaterThan(0);
  });
  it('cancellation clears unfinished movement, retains completed strokes and never awards success',()=>{
    const e=engineFor(lineReference,{dots:[{x:300,y:400}]});
    e.start(lineTrace[0]); lineTrace.slice(1,100).forEach(p=>e.move(p));
    expect(e.cancel().metrics.coverage).toBe(0);
    trace(e,lineTrace); e.start({x:300,y:400}); e.cancel();
    expect(e.snapshot().completed).toEqual(['body']);
    expect(e.snapshot().phase).not.toBe('complete');
  });
  it('precision completion rejects a high deviation budget even after later valid tracing',()=>{
    const e=engineFor(lineReference,{},'precision');
    e.start(lineTrace[0]); for(let i=0;i<20;i++) e.move({x:100+(i%2)*60,y:100});
    e.move(lineTrace[0]); lineTrace.slice(1).forEach(p=>e.move(p));
    expect(e.end(lineTrace.at(-1)).phase).not.toBe('complete');
    expect(trace(e,lineTrace).phase).toBe('retry');
    expect(e.snapshot().metrics.invalidTravel).toBeGreaterThan(100);
  });
  it('supports short strokes and exact gap boundaries without silently widening tolerance',()=>{
    const short=[{x:100,y:100},{x:100,y:112}];
    expect(trace(engineFor(short),[{x:100,y:100},{x:100,y:104},{x:100,y:108},{x:100,y:112}]).phase).toBe('complete');
    const e=engineFor(); e.start(lineTrace[0]); e.move({x:100,y:180});
    expect(e.snapshot().metrics.teleports).toBe(0);
    e.move({x:100,y:260.01}); expect(e.snapshot().metrics.teleports).toBe(1);
  });
  it('accepts a continuous independent loop without switching to its earlier branch',()=>{
    const reference=Array.from({length:721},(_,i)=>({x:500+65*Math.cos(2*Math.PI*i/720),y:500+65*Math.sin(2*Math.PI*i/720)}));
    const input=Array.from({length:145},(_,i)=>({x:500+65*Math.cos(2*Math.PI*i/144),y:500+65*Math.sin(2*Math.PI*i/144)}));
    expect(trace(engineFor(reference),input).phase).toBe('complete');
  });
  it('handles quantised input at an independently constructed tight pen turn',()=>{
    const quadratic=(a,b,c,t)=>({x:(1-t)**2*a.x+2*(1-t)*t*b.x+t*t*c.x,y:(1-t)**2*a.y+2*(1-t)*t*b.y+t*t*c.y});
    const sections=[[{x:750,y:520},{x:680,y:520},{x:685,y:390}],[{x:685,y:390},{x:685,y:530},{x:605,y:535}]];
    const reference=sections.flatMap((section,index)=>Array.from({length:301},(_,i)=>quadratic(...section,i/300)).slice(index?1:0));
    const input=sections.flatMap((section,index)=>Array.from({length:121},(_,i)=>quadratic(...section,i/120)).slice(index?1:0)).map(p=>({x:Math.round(p.x/1.62)*1.62,y:Math.round(p.y/1.62)*1.62}));
    expect(trace(engineFor(reference),input).phase).toBe('complete');
  });
  it('bounds sample growth and handles invalid coordinates safely',()=>{
    const f=fixture(lineReference); const profile={...getProfile(),maxSamples:3};
    const e=createMatcher(f.letter,f.references,profile);
    e.start({x:NaN,y:100}); expect(e.snapshot().active).toBeNull();
    e.start(lineTrace[0]); for(let i=1;i<=4;i++) e.move(lineTrace[i]);
    expect(e.snapshot().phase).toBe('retry');
    expect(e.snapshot().outcome).toBeNull();
  });
});
