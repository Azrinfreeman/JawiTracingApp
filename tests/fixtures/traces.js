import { makeReference } from '../../src/tracing/geometry.js';

export function fixture(points, { dots = [], second = null, sequences = null } = {}) {
  const strokes = [{ id: 'body', path: 'M100 100L100 900', width: 44, penLiftPolicy: 'continuous', checkpoints: [.25,.5,.75,.95] }];
  const references = { body: makeReference(points) };
  if (second) { strokes.push({ ...strokes[0], id: 'second' }); references.second = makeReference(second); }
  const dotTargets = dots.map((dot,i) => ({ id:`dot-${i}`, ...dot, policy:'tap', hitRadius:34, maxTravel:22 }));
  return { letter: { geometry: { strokes, dotTargets, validSequences: sequences || [[...strokes.map(s=>s.id), ...dotTargets.map(d=>d.id)]] } }, references };
}
export const lineReference = [{x:100,y:100},{x:100,y:900}];
export const lineTrace = Array.from({length:201}, (_,i)=>({x:100,y:100+i*4,time:i*8}));
export const arcReference = Array.from({length:601},(_,i)=>({x:500+300*Math.cos(Math.PI*i/600),y:250+300*Math.sin(Math.PI*i/600)}));
export const arcTrace = Array.from({length:241},(_,i)=>({x:500+300*Math.cos(Math.PI*i/240),y:250+300*Math.sin(Math.PI*i/240),time:i*8}));
export function trace(engine, points) {
  engine.start(points[0]); points.slice(1).forEach(p=>engine.move(p)); return engine.end(points.at(-1));
}
