import { screenConverter } from './geometry.js';
import { guardContactClick } from './contactClick.js';

/** Every real sample validates synchronously; only presentation is frame-batched. */
export function attachInput(svg, callbacks) {
  let activePointer = null, frames = 0, disposed = false, converter = null;
  let totalMs = 0, maxMs = 0, samples = 0;
  const frame = () => {
    if (!disposed && !frames) frames = requestAnimationFrame(() => { frames = 0; if (!disposed) callbacks.paint(); });
  };
  const flush = () => {
    cancelAnimationFrame(frames); frames = 0;
    if (!disposed) callbacks.paint(true);
  };
  const deliver = (kind, event, convert) => {
    const t = performance.now(), logical = convert(event.clientX, event.clientY);
    if (!logical) return false;
    callbacks[kind]({ ...logical, time: event.timeStamp }, event.pointerType || 'mouse');
    const elapsed = performance.now() - t;
    samples++; totalMs += elapsed; maxMs = Math.max(maxMs, elapsed);
    return true;
  };
  const timing = () => callbacks.timing?.({ samples, totalMs, maxMs });
  const down = event => {
    if (activePointer !== null || event.button > 0 || callbacks.disabled()) return;
    event.preventDefault();
    activePointer = event.pointerId;
    svg.setPointerCapture(event.pointerId);
    // One matrix per contact: reading it per move forces a style/layout flush inside the input handler.
    converter = screenConverter(svg);
    if (!deliver('start', event, converter)) cancel();
    timing(); frame();
  };
  const move = event => {
    if (event.pointerId !== activePointer) return;
    event.preventDefault();
    const convert = converter ||= screenConverter(svg);
    const coalesced = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    for (const sample of coalesced.length ? coalesced : [event]) {
      if (!deliver('move', sample, convert)) { cancel(); break; }
    }
    timing(); frame();
  };
  const up = event => {
    if (event.pointerId !== activePointer) return;
    guardContactClick(event);
    // Clear ownership before scoring/paint can disable or unmount the board.
    activePointer = null;
    if (!deliver('end', event, converter || screenConverter(svg))) callbacks.cancel();
    converter = null;
    timing(); flush();
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  };
  const cancel = event => {
    if (event && event.pointerId !== activePointer) return;
    const pointer = activePointer;
    if (pointer === null) return;
    activePointer = null; converter = null;
    callbacks.cancel(); frame();
    if (svg.hasPointerCapture(pointer)) svg.releasePointerCapture(pointer);
  };
  const resize = () => cancel();
  const moved = () => { converter = null; };
  const events = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: cancel, lostpointercapture: cancel };
  Object.entries(events).forEach(([type, handler]) => svg.addEventListener(type, handler));
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', moved, true); window.visualViewport?.addEventListener('scroll', moved);
  const observer = new ResizeObserver(resize); observer.observe(svg);
  const detach = () => {
    disposed = true; cancelAnimationFrame(frames); frames = 0; cancel();
    Object.entries(events).forEach(([type, handler]) => svg.removeEventListener(type, handler));
    window.removeEventListener('resize', resize); window.removeEventListener('scroll', moved, true); window.visualViewport?.removeEventListener('scroll', moved); observer.disconnect();
  };
  detach.cancel = cancel;
  detach.flush = flush;
  detach.requestPaint = frame;
  return detach;
}
