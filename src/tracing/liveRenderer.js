import { playFillWidth } from '../content/displayWidth.js';
import { pointAt } from './geometry.js';
import { sectionIndex } from './teachingCues.js';
import { outlineAppearance, outlinePart, createOutlineReveal } from './outlineAppearance.js';

const NS = 'http://www.w3.org/2000/svg';
// Accepted progress is drawn as short fixed pieces. A frame then repaints one small
// region instead of re-dashing and re-rasterising the whole wide stroke.
const PIECE = 48;
const polyline = (ref, from, to) => {
  const points = [pointAt(ref, from)];
  for (const v of ref.vertices) if (v.s > from && v.s < to) points.push(v);
  points.push(pointAt(ref, to));
  return points.map((p, i) => `${i ? 'L' : 'M'}${+p.x.toFixed(2)} ${+p.y.toFixed(2)}`).join('');
};
export function controlKey(view, references, letter) {
  const id = view.pending[0], ref = references[id], fraction = ref ? (view.progress[id] || 0) / ref.length : 0;
  // All numbered-guide transitions, including shared start/end badge visibility.
  const step = fraction < .015 ? 0 : fraction < .45 ? 1 : fraction < .85 ? 2 : 3;
  return [view.phase, view.reason, view.feedback, view.blocked, view.exhausted, view.inkLimit, view.completed.length,
    letter && sectionIndex(letter, id, fraction),
    view.pending.join(','), step, view.finish?.nearEnd, view.finish?.canFinish,
    view.finish?.confirmationAvailable, view.finish?.confirmationActive].join('|');
}

/** This adapter exclusively owns these groups' children; React owns the groups. */
export function createLiveRenderer(groups, letter, references, isPlay, isCopy, lightweight) {
  const cache = new WeakMap(), fills = new Map();
  const outlined=outlineAppearance(letter);
  const attrs = (node, values) => {
    let previous = cache.get(node); if (!previous) cache.set(node, previous = {});
    for (const [key, value] of Object.entries(values)) {
      const text = String(value);
      if (previous[key] !== text) { node.setAttribute(key, text); previous[key] = text; }
    }
  };
  const make = (parent, type, values = {}) => {
    const node = document.createElementNS(NS, type); attrs(node, values); parent.append(node); return node;
  };
  Object.values(groups).forEach(group => group.replaceChildren());
  const cursor = make(groups.cursor, 'g', { 'pointer-events': 'none' });
  const halo = make(cursor, 'circle', { class: 'start-halo' });
  const dot = make(cursor, 'circle', { class: 'start-dot' });
  const plus = make(cursor, 'text', { class: 'mark-plus', 'text-anchor': 'middle' }); plus.textContent = '+';
  const arrow = make(cursor, 'path', { class: 'start-arrow', d: isPlay ? 'M-2-9 10 0-2 9M-12 0H10' : 'M-9-9 2 0-9 9M-12 0H10' });
  const direction = make(groups.trail, 'path', { class:'next-route-cue', 'pointer-events':'none' });
  const tail = make(groups.tail, 'path', { class: 'terminal-tail' });
  const resume = make(groups.resume, 'g', { class: 'terminal-resume-cue', 'pointer-events': 'none' });
  const leader = make(resume, 'line');
  const frontierDot = make(resume, 'circle', { class: 'terminal-frontier', r: 8 });
  const resumeArrow = make(resume, 'path', { class: 'start-arrow', d: 'M-2-9 10 0-2 9M-12 0H10' });
  const trail = isPlay && !lightweight ? Array.from({ length: 11 }, () => make(groups.trail, 'circle', { r: 6 })) : [];
  return {
    paint(view, { scale, presentation, demo }) {
      const id = view.pending[0], ref = references[id], progress = view.progress[id] || 0;
      const pendingDot = letter.geometry.dotTargets.find(target => target.id === id);
      const confirmation = isPlay && view.finish?.confirmationAvailable && view.phase !== 'tracing';
      const frontier = pendingDot || (ref && pointAt(ref, confirmation || view.finish?.confirmationActive ? ref.length : progress));
      const end = ref && pointAt(ref, Math.min(ref.length, progress + 55));
      const angle = frontier && end ? Math.atan2(end.y - frontier.y, end.x - frontier.x) * 180 / Math.PI : 90;
      const radius = outlined ? Math.max(7, 5 / scale) : isPlay ? Math.max(32, 24 / scale) : 23;
      const recovery = isPlay && view.finish?.nearEnd && !view.finish.canFinish && !view.finish.confirmationAvailable;
      const visible = !isCopy && !demo && frontier && view.phase !== 'complete';
      attrs(cursor, { display: visible && !recovery ? 'inline' : 'none' });
      attrs(resume, { display: visible && recovery ? 'inline' : 'none' });
      attrs(tail, { display: visible && recovery ? 'inline' : 'none' });
      if (visible && !recovery) {
        attrs(halo, { cx: frontier.x, cy: frontier.y, r: isPlay ? radius + 12 : 38 });
        attrs(dot, { cx: frontier.x, cy: frontier.y, r: radius });
        attrs(plus, { display: pendingDot ? 'inline' : 'none', x: frontier.x, y: frontier.y + (isPlay ? radius * .4 : 10), style: isPlay ? `font-size: ${radius * 1.2}px` : '' });
        const initial = isPlay && !outlined && progress < ref?.length * .015;
        attrs(arrow, { display: pendingDot || confirmation || view.finish?.confirmationActive || initial ? 'none' : 'inline', transform: `translate(${frontier.x} ${frontier.y}) rotate(${angle}) scale(${isPlay ? radius / 23 : 1})` });
      }
      attrs(direction, { display: isPlay && visible && ref && !confirmation ? 'inline' : 'none' });
      if (isPlay && visible && ref && !confirmation) attrs(direction, { d:polyline(ref, progress, Math.min(ref.length, progress + 95)), 'stroke-width': Math.max(6, 4/scale) });
      if (visible && recovery) {
        const normal = angle * Math.PI / 180 + Math.PI / 2, offset = radius + 38;
        const cue = {
          x: Math.max(presentation.x + radius + 14, Math.min(presentation.x + presentation.width - radius - 14, frontier.x + Math.cos(normal) * offset)),
          y: Math.max(presentation.y + radius + 14, Math.min(presentation.y + presentation.height - radius - 14, frontier.y + Math.sin(normal) * offset)),
        };
        attrs(tail, { d: Array.from({ length: 21 }, (_, i) => { const p = pointAt(ref, progress + view.finish.remainingArc * i / 20); return `${i ? 'L' : 'M'}${p.x} ${p.y}`; }).join(' ') });
        attrs(resume, { 'data-frontier-x': frontier.x, 'data-frontier-y': frontier.y });
        attrs(leader, { x1: cue.x, y1: cue.y, x2: frontier.x, y2: frontier.y });
        attrs(frontierDot, { cx: frontier.x, cy: frontier.y });
        attrs(resumeArrow, { transform: `translate(${cue.x} ${cue.y}) rotate(${Math.atan2(frontier.y - cue.y, frontier.x - cue.x) * 180 / Math.PI}) scale(${radius / 23})` });
      }
      trail.forEach((node, i) => {
        const arc = progress + (i + 1) * 40, shown = !demo && ref && arc < ref.length;
        attrs(node, { display: shown ? 'inline' : 'none' });
        if (shown) { const p = pointAt(ref, arc); attrs(node, { cx: p.x, cy: p.y }); }
      });
      if (isPlay) for (const stroke of letter.geometry.strokes) {
        const ref = references[stroke.id], length = ref.length, measured = view.progress[stroke.id] || 0;
        const filled = view.completed.includes(stroke.id) ? length : measured;
        let fill = fills.get(stroke.id);
        if(outlined) {
          if(filled>0 && !fill){fill=createOutlineReveal(groups.fill,outlinePart(letter,stroke.id),ref,'play-fill outline-progress',attrs,outlined.bodyContours);fills.set(stroke.id,fill);}
          if(fill){attrs(fill.group,{'data-measured-frontier':measured,'data-display-frontier':filled});fill.paint(filled,view.completed.includes(stroke.id));}
          continue;
        }
        if (filled > 0 && !fill) {
          const group = make(groups.fill, 'g', { class: 'play-fill', 'stroke-width': playFillWidth(stroke) });
          const count = Math.max(1, Math.ceil(length / PIECE));
          const pieces = Array.from({ length: count }, (_, i) => make(group, 'path', { display: 'none' }));
          fill = { group, pieces, shown: 0 }; fills.set(stroke.id, fill);
        }
        if (!fill) continue;
        attrs(fill.group, { 'data-measured-frontier': measured, 'data-display-frontier': filled });
        const count = fill.pieces.length, last = Math.min(count - 1, Math.floor(filled / PIECE));
        // Only pieces between the previous and current frontier can have changed.
        for (let i = Math.min(fill.shown, last); i <= Math.max(fill.shown, last); i++) {
          const from = i * PIECE, to = Math.min(length, from + PIECE), node = fill.pieces[i];
          if (filled >= to) attrs(node, { display: 'inline', d: polyline(ref, from, to) });
          else if (filled - from > .5) attrs(node, { display: 'inline', d: polyline(ref, from, filled) });
          else attrs(node, { display: 'none' });
        }
        fill.shown = last;
      }
    },
    clear() { Object.values(groups).forEach(group => group.replaceChildren()); },
  };
}
