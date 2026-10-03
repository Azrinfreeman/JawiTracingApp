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
        kind: 'dot', label: last ? 'Siap' : 'Titik' }] });
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
  // Keep labels clear of the board's reward leaf and its flower animation.
  const rewardCorner = { x: 1000 - 90 / scale, y: 1000 - 90 / scale, width: 90 / scale, height: 90 / scale };
  const placed = [];
  for (const guide of part.points) {
    const label = `${guide.number} ${guide.label}`;
    const width = label.length * labelSize * .65 + labelSize;
    const height = labelSize * 1.8;
    const s = (guide.fraction || 0) * (part.reference?.length || 0);
    const a = part.reference ? pointAt(part.reference, Math.max(0, s - 20)) : { x: guide.anchor.x - 1, y: guide.anchor.y };
    const b = part.reference ? pointAt(part.reference, Math.min(part.reference.length, s + 20)) : guide.anchor;
    const angle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
    const directions = [angle, angle + Math.PI, ...Array.from({ length: 8 }, (_, i) => i * Math.PI / 4)];
    const gap = radius + 44 + 18 / scale;
    let best;
    for (const multiplier of [1, 1.5, 2]) for (const direction of directions) {
      const x = clamp(guide.anchor.x + Math.cos(direction) * gap * multiplier, (viewport?.x ?? 0) + 28 + width / 2, (viewport ? viewport.x + viewport.width : 1000) - 28 - width / 2);
      const y = clamp(guide.anchor.y + Math.sin(direction) * gap * multiplier, (viewport?.y ?? 72) + 28 + height / 2, (viewport ? viewport.y + viewport.height - 28 : 870) - height / 2);
      const bounds = { x: x - width / 2, y: y - height / 2, width, height };
      const expanded = { x: bounds.x - 44, y: bounds.y - 44, width: bounds.width + 88, height: bounds.height + 88 };
      const onRoute = obstacles.reduce((count, p) => count + (p.x > expanded.x && p.x < expanded.x + expanded.width && p.y > expanded.y && p.y < expanded.y + expanded.height ? 1 : 0), 0);
      const collisions = placed.filter(p => overlaps(bounds, { x: p.bounds.x - 16, y: p.bounds.y - 16, width: p.bounds.width + 32, height: p.bounds.height + 32 })).length + (overlaps(bounds, rewardCorner) ? 1 : 0);
      const score = collisions * 1e6 + onRoute * 1e3 + Math.hypot(x - guide.anchor.x, y - guide.anchor.y);
      if (!best || score < best.score) best = { ...guide, x, y, bounds, radius, numberSize, labelSize, score };
    }
    placed.push(best);
  }
  return placed;
}

export function guideInstruction(part, finish, phase) {
  const [start, middle] = part.points, stop = part.points.at(-1);
  if (part.kind === 'stroke' && (finish?.nearEnd || finish?.confirmationAvailable)) {
    if (finish.canFinish) return part.last ? 'Angkat jari untuk siap.' : 'Angkat jari untuk bahagian seterusnya.';
    if (finish.confirmationAvailable && phase !== 'tracing') return phase === 'paused'
      ? `Angkat jari, kemudian sentuh titik ${stop.number}.`
      : `Sentuh titik ${stop.number}, kemudian angkat jari.`;
    return phase === 'tracing' ? `Ikut hingga hujung ${stop.number}.` : `Sambung dari anak panah hingga ${stop.number}.`;
  }
  return part.kind === 'dot'
    ? `Sentuh titik ${start.number}, kemudian angkat jari.${part.last ? ' Huruf siap!' : ''}`
    : `Mula di ${start.number}, ${part.points.length > 2 ? `ikut ${middle.number}, ` : ''}berhenti di ${stop.number}. ${part.last ? 'Kemudian angkat jari untuk siap.' : 'Angkat jari sebelum bahagian seterusnya.'}`;
}
