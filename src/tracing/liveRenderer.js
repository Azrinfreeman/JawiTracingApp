import { playFillWidth } from '../content/displayWidth.js';
import { pointAt } from './geometry.js';

const NS = 'http://www.w3.org/2000/svg';
export function controlKey(view, references) {
  const id = view.pending[0], ref = references[id], fraction = ref ? (view.progress[id] || 0) / ref.length : 0;
  // All numbered-guide transitions, including shared start/end badge visibility.
  const step = fraction < .015 ? 0 : fraction < .5 ? 1 : 2;
  return [view.phase, view.feedback, view.blocked, view.exhausted, view.inkLimit, view.completed.length,
    view.pending.join(','), step, view.finish?.nearEnd, view.finish?.canFinish,
    view.finish?.confirmationAvailable, view.finish?.confirmationActive].join('|');
}

/** This adapter exclusively owns these groups' children; React owns the groups. */
export function createLiveRenderer(groups, letter, references, isPlay, isCopy, lightweight) {
  const cache = new WeakMap(), fills = new Map();
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
      const radius = isPlay ? Math.max(32, 24 / scale) : 23;
      const recovery = isPlay && view.finish?.nearEnd && !view.finish.canFinish && !view.finish.confirmationAvailable;
      const visible = !isCopy && !demo && frontier && view.phase !== 'complete';
      attrs(cursor, { display: visible && !recovery ? 'inline' : 'none' });
      attrs(resume, { display: visible && recovery ? 'inline' : 'none' });
      attrs(tail, { display: visible && recovery ? 'inline' : 'none' });
      if (visible && !recovery) {
        attrs(halo, { cx: frontier.x, cy: frontier.y, r: isPlay ? radius + 12 : 38 });
        attrs(dot, { cx: frontier.x, cy: frontier.y, r: radius });
        attrs(plus, { display: pendingDot ? 'inline' : 'none', x: frontier.x, y: frontier.y + (isPlay ? radius * .4 : 10), style: isPlay ? `font-size: ${radius * 1.2}px` : '' });
        attrs(arrow, { display: pendingDot || confirmation || view.finish?.confirmationActive ? 'none' : 'inline', transform: `translate(${frontier.x} ${frontier.y}) rotate(${angle}) scale(${isPlay ? radius / 23 : 1})` });
      }
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
        const length = references[stroke.id].length, measured = view.progress[stroke.id] || 0;
        const filled = view.completed.includes(stroke.id) ? length : measured;
        let node = fills.get(stroke.id);
        if (filled > 0 && !node) {
          node = make(groups.fill, 'path', { class: 'play-fill', d: stroke.path, 'stroke-width': playFillWidth(stroke), 'stroke-dasharray': `${length} ${length}` }); fills.set(stroke.id, node);
        }
        if (node) attrs(node, { 'stroke-dashoffset': length - filled, 'data-measured-frontier': measured, 'data-display-frontier': filled });
      }
    },
    clear() { Object.values(groups).forEach(group => group.replaceChildren()); },
  };
}
