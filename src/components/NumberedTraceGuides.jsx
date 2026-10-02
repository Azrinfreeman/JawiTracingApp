import { useMemo } from 'react';
import { placeNumberedGuides } from '../tracing/numberedGuides.js';

export function NumberedTraceGuides({ part, letter, references, scale, progress }) {
  const placed = useMemo(() => placeNumberedGuides(part, letter, references, scale), [part, letter, references, scale]);
  const fraction = part.reference ? progress / part.reference.length : 0;
  const current = part.kind === 'dot' ? 0 : fraction < .015 ? 0 : part.points.length === 2 || fraction < .5 ? 1 : 2;
  const sharedEndpoint = part.kind === 'stroke' && Math.hypot(part.points[0].anchor.x - part.points.at(-1).anchor.x, part.points[0].anchor.y - part.points.at(-1).anchor.y) < 2;
  return <g className="numbered-trace-guides" pointerEvents="none" aria-hidden="true" data-part-id={part.id}>
    {placed.map((guide, index) => <g key={guide.number} className={`trace-number-guide trace-number-guide--${guide.kind} ${index === current ? 'is-current' : index < current ? 'is-passed' : ''}`}
      data-number={guide.number} data-kind={guide.kind} data-anchor-x={guide.anchor.x} data-anchor-y={guide.anchor.y}>
      <line className="trace-number-leader" x1={guide.anchor.x} y1={guide.anchor.y} x2={guide.x} y2={guide.y}/>
      {(!sharedEndpoint || index === 1 || (fraction < .5 ? index === 0 : index === 2)) && <>
        <circle className="trace-number-badge" cx={guide.anchor.x} cy={guide.anchor.y} r={guide.radius}/>
        <text className="trace-number-value" x={guide.anchor.x} y={guide.anchor.y} dy=".35em" textAnchor="middle" style={{ fontSize: guide.numberSize }}>{guide.number}</text>
      </>}
      <rect className="trace-number-label-backdrop" x={guide.bounds.x} y={guide.bounds.y} width={guide.bounds.width} height={guide.bounds.height} rx={guide.labelSize * .45}/>
      <text className="trace-number-label" x={guide.x} y={guide.y} dy=".35em" textAnchor="middle" style={{ fontSize: guide.labelSize }}>{guide.number} {guide.label}</text>
    </g>)}
  </g>;
}
