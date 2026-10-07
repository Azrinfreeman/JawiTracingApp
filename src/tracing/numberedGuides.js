import { pointAt } from './geometry.js';

/** Visual landmarks only. They never become matcher gates or change authored movements. */
export function numberedGuidePlan(letter, references) {
  const sequence = letter.geometry.validSequences[0] || [];
  const plan = [];
  let number = 1;
  for (const [index, id] of sequence.entries()) {
    const reference = references[id];
    const dot = letter.geometry.dotTargets.find(item => item.id === id);
    const last = index === sequence.length - 1;
    if (reference) {
      const points = (reference.length < 320 ? [0, 1] : [0, .5, 1]).map(fraction => ({
        number: number++, fraction, anchor: pointAt(reference, reference.length * fraction),
        kind: fraction === 0 ? 'start' : fraction === 1 ? 'stop' : 'follow',
        label: fraction === 0 ? 'Mula' : fraction === 1 ? last ? 'Siap' : 'Henti' : 'Ikut',
      }));
      plan.push({ id, kind: 'stroke', reference, last, points });
    } else if (dot) {
      plan.push({ id, kind: 'dot', last, points: [{ number: number++, anchor: { x: dot.x, y: dot.y },
        kind: 'dot', label: last ? 'Titik akhir' : 'Titik' }] });
    }
  }
  return plan;
}

const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Place text beside the routes; numbered touch points stay on the authored path. */
export function placeNumberedGuides(part, letter, references, scale, viewport) {
  const radius = Math.max(25, 18 / scale), numberSize = Math.max(26, 16 / scale), labelSize = Math.max(20, 12 / scale);
  const obstacles = Object.values(references).flatMap(reference => reference.vertices.filter((_, i) => i % 6 === 0));
  obstacles.push(...letter.geometry.dotTargets);
  const dotBounds = letter.geometry.dotTargets.map(dot=>({x:dot.x-dot.visibleRadius-12,y:dot.y-dot.visibleRadius-12,
    width:dot.visibleRadius*2+24,height:dot.visibleRadius*2+24}));
  // Keep labels clear of the board's reward leaf and its flower animation.
  const rewardCorner = { x: 1000 - 90 / scale, y: 1000 - 90 / scale, width: 90 / scale, height: 90 / scale };
  // ...and of the stage Menu button (top left) and letter badge (top right), which sit on the board.
  const stageControls = viewport ? [
    { x: viewport.x, y: viewport.y, width: 96 / scale, height: 96 / scale },
    // The letter badge includes its sound button beneath the name.
    { x: viewport.x + viewport.width - Math.min(260 / scale, viewport.width * .46 + 16 / scale), y: viewport.y,
      width: Math.min(260 / scale, viewport.width * .46 + 16 / scale), height: 136 / scale },
    // The visible writing cue occupies the bottom centre of a full-screen stage.
    { x: viewport.x + viewport.width * .06, y: viewport.y + viewport.height - 86 / scale, width: viewport.width * .88, height: 86 / scale },
  ] : [];
  const placed = [];
  const detached=Boolean(letter.geometry.appearance);
  for (const guide of part.points) {
    const label = `${guide.number} ${guide.label}`;
    const textWidth = label.length * labelSize * .65 + labelSize;
    const width = textWidth+(detached?radius*2+12:0);
    const height = Math.max(labelSize * 1.8,detached?radius*2:0);
    const s = (guide.fraction || 0) * (part.reference?.length || 0);
    const a = part.reference ? pointAt(part.reference, Math.max(0, s - 20)) : { x: guide.anchor.x - 1, y: guide.anchor.y };
    const b = part.reference ? pointAt(part.reference, Math.min(part.reference.length, s + 20)) : guide.anchor;
    const angle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
    const directions = [angle, angle + Math.PI, ...Array.from({ length: 8 }, (_, i) => i * Math.PI / 4)];
    const gap = radius + 44 + 18 / scale;
    let best;
    const candidates = (detached ? [1, 1.5, 2, 3, 4] : [1, 1.5, 2]).flatMap(multiplier => directions.map(direction => ({
      x: guide.anchor.x + Math.cos(direction) * gap * multiplier,
      y: guide.anchor.y + Math.sin(direction) * gap * multiplier,
    })));
    if(detached && viewport) {
      // Narrow stages may need a marker farther from its anchor; its leader preserves the association.
      for(const x of [.15,.5,.85])for(const y of [.1,.25,.4,.55,.7,.85,.95])
        candidates.push({x:viewport.x+viewport.width*x,y:viewport.y+viewport.height*y});
    }
    for (const candidate of candidates) {
      const x = clamp(candidate.x, (viewport?.x ?? 0) + 28 + width / 2, (viewport ? viewport.x + viewport.width : 1000) - 28 - width / 2);
      const y = clamp(candidate.y, (viewport?.y ?? 72) + 28 + height / 2, (viewport ? viewport.y + viewport.height - 28 : 870) - height / 2);
      const bounds = { x: x - width / 2, y: y - height / 2, width, height };
      const outlineCollisions = detached ? letter.geometry.appearance.parts.filter(part=>overlaps(bounds,part.bounds)).length : 0;
      const expanded = { x: bounds.x - 44, y: bounds.y - 44, width: bounds.width + 88, height: bounds.height + 88 };
      const onRoute = obstacles.reduce((count, p) => count + (p.x > expanded.x && p.x < expanded.x + expanded.width && p.y > expanded.y && p.y < expanded.y + expanded.height ? 1 : 0), 0);
      const markerCollisions = placed.filter(p => {const b=p.occupiedBounds||p.bounds;return overlaps(bounds, { x: b.x - 16, y: b.y - 16, width: b.width + 32, height: b.height + 32 });}).length;
      const controlCollisions = (overlaps(bounds, rewardCorner) ? 1 : 0) + [...stageControls,...dotBounds].filter(control => overlaps(bounds, control)).length;
      const score = markerCollisions * (detached ? 1e9 : 1e6) + controlCollisions * (detached ? 1e8 : 1e6) + outlineCollisions * 1e6 + onRoute * 1e3 + Math.hypot(x - guide.anchor.x, y - guide.anchor.y);
      if (!best || score < best.score) best = { ...guide, x, y, bounds, radius, numberSize, labelSize, score };
    }
    if(detached){
      // Labels already avoid the route. The badge belongs beside that label, leaving the true target visible.
      const badgeX=best.bounds.x+radius,badgeY=best.y;
      const bounds={x:best.bounds.x+radius*2+12,y:best.y-labelSize*.9,width:textWidth,height:labelSize*1.8};
      best={...best,badgeX,badgeY,detached:true,occupiedBounds:best.bounds,x:bounds.x+textWidth/2,bounds};
    }
    placed.push(best);
  }
  return placed;
}

export function guideInstruction(part, finish, phase) {
  const [start, middle] = part.points, stop = part.points.at(-1);
  if (part.kind === 'stroke' && (finish?.nearEnd || finish?.confirmationAvailable)) {
    if (finish.liftReady ?? finish.canFinish) return part.last ? 'Angkat jari untuk siap.' : 'Angkat jari untuk bahagian seterusnya.';
    if (finish.confirmationAvailable && phase !== 'tracing') return phase === 'paused'
      ? `Angkat jari, kemudian sentuh titik ${stop.number}.`
      : `Sentuh titik ${stop.number}, kemudian angkat jari.`;
    return phase === 'tracing' ? `Ikut hingga hujung ${stop.number}.` : `Sambung dari anak panah hingga ${stop.number}.`;
  }
  return part.kind === 'dot'
    ? `Sentuh titik ${start.number}, kemudian angkat jari.${part.last ? ' Huruf siap!' : ''}`
    : `Mula di ${start.number}, ${part.points.length > 2 ? `ikut ${middle.number}, ` : ''}berhenti di ${stop.number}. ${part.last ? 'Kemudian angkat jari untuk siap.' : 'Angkat jari sebelum bahagian seterusnya.'}`;
}

export function visibleGuideIndexes(placed, fraction, frontier) {
  const last = placed.length - 1;
  const start = placed[0], stop = placed[last];
  const crowded = last > 0 && Math.hypot(start.anchor.x-stop.anchor.x, start.anchor.y-stop.anchor.y) < start.radius + stop.radius + 6;
  return placed.map((guide, index) => {
    if (crowded && index === (fraction < .85 ? last : 0)) return false;
    // The moving arrow owns its immediate area; keep the true start badge at rest.
    if (frontier && fraction > .015 && fraction < .85 && index !== last &&
      Math.hypot(frontier.x-guide.anchor.x, frontier.y-guide.anchor.y) < guide.radius + 38) return false;
    return true;
  });
}
