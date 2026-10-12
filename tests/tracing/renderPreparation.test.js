import { it, expect, vi, afterEach } from 'vitest';
import { makeReference, pointAt } from '../../src/tracing/geometry.js';
import { polyline } from '../../src/tracing/liveRenderer.js';
import { prepareReferences } from '../../src/tracing/prepareReference.js';
import { createOutlineReveal } from '../../src/tracing/outlineAppearance.js';
import { demonstrationFrame } from '../../src/tracing/demonstrationFrame.js';

afterEach(() => vi.unstubAllGlobals());

it('bounded route serialization preserves endpoints, boundary vertices and rounding', () => {
  const ref = makeReference(Array.from({length:1800},(_,i)=>({x:i*.71,y:80*Math.sin(i*.027)})));
  const previous = (from,to) => [pointAt(ref,from),...ref.vertices.filter(v=>v.s>from&&v.s<to),pointAt(ref,to)]
    .map((p,i)=>`${i?'L':'M'}${+p.x.toFixed(2)} ${+p.y.toFixed(2)}`).join('');
  for(const from of [0,ref.vertices[30].s,17.37,ref.length-20,ref.length])
    for(const to of [from,Math.min(ref.length,from+48),ref.length]) expect(polyline(ref,from,to)).toBe(previous(from,to));
});

it('shares immutable exact references across players, invalidates edits and bounds retained revisions', () => {
  let preparations = 0;
  const doc = { createElementNS:()=>({setAttribute(){},getTotalLength(){preparations++;return 10;},getPointAtLength:s=>({x:s,y:0})}) };
  const letter = (revision=1,path='M0 0L10 0') => ({id:'sample',contentVersion:revision,geometry:{strokes:[{id:'body',path}]}});
  const first=prepareReferences(letter(),doc);
  expect(prepareReferences(letter(),doc)).toBe(first); expect(preparations).toBe(1);
  expect(Object.isFrozen(first.body.vertices[0])).toBe(true);
  expect(()=>first.body.vertices.push({x:0,y:0})).toThrow();
  expect(prepareReferences(letter(1,'M0 0L20 0'),doc)).not.toBe(first);
  expect(prepareReferences(letter(2),doc)).not.toBe(first);
  for(let revision=3;revision<=55;revision++)prepareReferences(letter(revision),doc);
  expect(prepareReferences(letter(),doc)).not.toBe(first);
  const secondDoc={...doc}; expect(prepareReferences(letter(),secondDoc)).not.toBe(prepareReferences(letter(),doc));
});

it('outline reveal keeps all visible and clipped partitions correct through jumps, rollback and completion', () => {
  let writes=0;
  const node = tag => ({tag,attributes:{},children:[],setAttribute(key,value){this.attributes[key]=String(value);writes++;},append(child){this.children.push(child);}});
  vi.stubGlobal('document',{createElementNS:(_,tag)=>node(tag)});
  const part={id:'body',contours:['M0 0L100 0L100 10Z'],segments:Array.from({length:30},(_,i)=>({from:i*10,to:(i+1)*10,contours:[`M${i*10} 0L${i*10+10} 0L${i*10} 10Z`]}))};
  const ref=makeReference([{x:0,y:0},{x:300,y:0}]),parent=node('g');
  const reveal=createOutlineReveal(parent,part,ref,'test');
  const ink=reveal.group.children[1],full=ink.children[0],segments=ink.children.slice(1);
  for(const [arc,complete] of [[5,false],[6,false],[10,false],[299,false],[30,false],[300,true],[15,false],[0,false]]) {
    reveal.paint(arc,complete);
    expect(full.attributes.display).toBe(complete?'inline':'none');
    segments.forEach((segment,i)=>{
      const visible=!complete&&arc>part.segments[i].from;
      expect(segment.attributes.display).toBe(visible?'inline':'none');
      const clipped=visible&&arc<part.segments[i].to;
      expect(segment.attributes['clip-path']?.startsWith('url(')||false).toBe(clipped);
    });
    const before=writes;reveal.paint(arc,complete);expect(writes).toBe(before);
  }
});

it('demonstration sections retain lifts and timing while publishing only the latest arc per part', () => {
  const schedule=[{id:'body',from:0,to:20,duration:100,pause:30},{id:'body',from:20,to:100,duration:200,pause:40},{id:'dot',from:0,to:1,duration:60,pause:10}];
  expect(demonstrationFrame(schedule,110).current).toMatchObject({id:'body',arc:20,index:0,lifted:true});
  const frame=demonstrationFrame(schedule,230);
  expect([...frame.reveals]).toEqual([['body',{arc:60,fraction:.5}]]);
  expect(frame.current).toMatchObject({id:'body',arc:60,index:1,lifted:false});
  expect(demonstrationFrame(schedule,350).current.lifted).toBe(true);
  expect(demonstrationFrame(schedule,440).finished).toBe(true);
  expect(demonstrationFrame(schedule,705,true).current).toMatchObject({id:'body',arc:20,lifted:true});
});
