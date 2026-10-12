import {pointAt} from './geometry.js';

export const outlineAppearance = letter => ['catalogueOutline','referenceOutline'].includes(letter.geometry.appearance?.kind) ? letter.geometry.appearance : null;
export const outlinePart = (letter, id) => outlineAppearance(letter)?.parts.find(part => part.id === id);
export const outlinePath = part => part.contours.join(' ');
export const outlineIllustrationParts = letter => {
  const appearance=outlineAppearance(letter);
  if(!appearance.bodyContours)return appearance.parts;
  const dots=new Set(letter.geometry.dotTargets.map(dot=>dot.id));
  return [{id:'body',contours:appearance.bodyContours},...appearance.parts.filter(part=>dots.has(part.id))];
};
let serial = 0;
const NS = 'http://www.w3.org/2000/svg';

/** Static pre-authored pieces follow nearest route arc; only the current cut moves. */
export function createOutlineReveal(parent, part, reference, className, setAttrs, bodyContours) {
  const cache = new WeakMap();
  const attrs = setAttrs || ((node, values) => {
    let previous = cache.get(node); if (!previous) cache.set(node, previous = {});
    for (const [key,value] of Object.entries(values)) {
      const text = String(value);
      if (previous[key] !== text) { node.setAttribute(key,text); previous[key] = text; }
    }
  });
  const make = (parent, tag, values) => { const node=document.createElementNS(NS,tag); attrs(node,values); parent.append(node); return node; };
  const prefix=`outline-reveal-${++serial}`;
  const group=make(parent,'g',{class:className,'data-part-id':part.id,...(bodyContours?{'data-whole-body':'true'}:{})});
  const defs=make(group,'defs',{}),body=make(defs,'clipPath',{id:`${prefix}-body`,clipPathUnits:'userSpaceOnUse'});
  make(body,'path',{d:bodyContours?bodyContours.join(' '):outlinePath(part),'clip-rule':'evenodd'});
  const cut=make(defs,'clipPath',{id:`${prefix}-cut`,clipPathUnits:'userSpaceOnUse'}),plane=make(cut,'path',{});
  const ink=make(group,'g',{'clip-path':`url(#${prefix}-body)`});
  const full=make(ink,'path',{d:outlinePath(part),class:'outline-ink',display:'none','fill-rule':'evenodd'});
  const segments=part.segments.map(segment=>make(ink,'path',{d:segment.contours.join(' '),class:'outline-ink',display:'none','fill-rule':'evenodd',
    // Slight overlap removes subpixel seams between pre-authored adjacent pieces.
    'data-from':segment.from,'data-to':segment.to}));
  let lastArc, lastComplete, visibleCount = 0, clippedFrom = 0;
  // Authored segments are sorted contiguous arc partitions (content validator).
  const lowerBound = (field, arc, inclusive) => {
    let low=0, high=part.segments.length;
    while(low<high){const mid=(low+high)>>1;
      if(inclusive ? part.segments[mid][field]<=arc : part.segments[mid][field]<arc) low=mid+1; else high=mid;
    }
    return low;
  };
  // Shared-body styles overlap adjacent partitions inside the exact outer clip;
  // they cannot widen the visible font silhouette.
  return {group,paint(arc,complete=false){
    if (arc === lastArc && complete === lastComplete) return;
    attrs(full,{display:complete?'inline':'none'});
    const nextCount=complete?0:lowerBound('from',arc,false);
    const nextClipped=Math.min(nextCount,lowerBound('to',arc,true));
    const changed = new Set();
    for(let i=Math.min(visibleCount,nextCount);i<Math.max(visibleCount,nextCount);i++)changed.add(i);
    for(let i=clippedFrom;i<visibleCount;i++)changed.add(i);
    for(let i=nextClipped;i<nextCount;i++)changed.add(i);
    for(const i of changed){
      const visible=i<nextCount;
      attrs(segments[i],{display:visible?'inline':'none','clip-path':visible&&i>=nextClipped?`url(#${prefix}-cut)`:'none'});
    }
    if(!complete&&arc>0&&nextClipped<nextCount){
      const p=pointAt(reference,arc),a=pointAt(reference,Math.max(0,arc-1)),b=pointAt(reference,Math.min(reference.length,arc+1));
      const angle=Math.atan2(b.y-a.y,b.x-a.x),dx=Math.cos(angle),dy=Math.sin(angle),reach=3000;
      const points=[{x:p.x-dy*reach,y:p.y+dx*reach},{x:p.x+dy*reach,y:p.y-dx*reach},
        {x:p.x+dy*reach-dx*reach,y:p.y-dx*reach-dy*reach},{x:p.x-dy*reach-dx*reach,y:p.y+dx*reach-dy*reach}];
      attrs(plane,{d:points.map((q,i)=>`${i?'L':'M'}${q.x} ${q.y}`).join(' ')+' Z'});
    }
    visibleCount=nextCount;clippedFrom=nextClipped;lastArc=arc;lastComplete=complete;
  }};
}
