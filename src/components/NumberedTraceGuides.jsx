import { useMemo } from 'react';
import { placeNumberedGuides, visibleGuideIndexes } from '../tracing/numberedGuides.js';
import { pointAt } from '../tracing/geometry.js';

export function NumberedTraceGuides({ part, letter, references, scale, progress, viewport, finish }) {
  const placed = useMemo(() => placeNumberedGuides(part, letter, references, scale, viewport), [part, letter, references, scale, viewport]);
  const fraction = part.reference ? progress / part.reference.length : 0;
  const current = part.kind === 'dot' || fraction < .45 ? 0 : part.points.length === 2 || fraction >= .85 ? part.points.length - 1 : 1;
  const visible = visibleGuideIndexes(placed, fraction, part.reference && pointAt(part.reference, progress));
  return <g className="numbered-trace-guides" pointerEvents="none" aria-hidden="true" data-part-id={part.id}>
    {placed.map((guide, index) => visible[index] && <g key={guide.number} className={`trace-number-guide trace-number-guide--${guide.kind} ${index === current ? finish && guide.kind === 'stop' ? finish.canFinish ? 'is-current is-ready' : finish.confirmationAvailable ? 'is-current is-confirmable' : 'is-destination' : 'is-current' : index < current ? 'is-passed' : ''}`}
      data-number={guide.number} data-kind={guide.kind} data-anchor-x={guide.anchor.x} data-anchor-y={guide.anchor.y}>
      <line className="trace-number-leader" x1={guide.anchor.x} y1={guide.anchor.y} x2={guide.detached?guide.badgeX:guide.x} y2={guide.detached?guide.badgeY:guide.y}/>
      {guide.detached&&<circle className="outline-target" cx={guide.anchor.x} cy={guide.anchor.y} r={Math.max(5,4/scale)}/>}
      <>
        <circle className="trace-number-badge" cx={guide.detached?guide.badgeX:guide.anchor.x} cy={guide.detached?guide.badgeY:guide.anchor.y} r={guide.radius}/>
        <text className="trace-number-value" x={guide.detached?guide.badgeX:guide.anchor.x} y={guide.detached?guide.badgeY:guide.anchor.y} dy=".35em" textAnchor="middle" style={{ fontSize: guide.numberSize }}>{guide.number}</text>
      </>
      <rect className="trace-number-label-backdrop" x={guide.bounds.x} y={guide.bounds.y} width={guide.bounds.width} height={guide.bounds.height} rx={guide.labelSize * .45}/>
      <text className="trace-number-label" x={guide.x} y={guide.y} dy=".35em" textAnchor="middle" style={{ fontSize: guide.labelSize }}>{guide.number} {guide.label}</text>
    </g>)}
  </g>;
}
