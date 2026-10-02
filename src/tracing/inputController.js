import { screenToLogical } from './geometry.js';
import { guardContactClick } from './contactClick.js';

/** Native events avoid React state churn. No synthetic scoring or smoothing. */
export function attachInput(svg, callbacks) {
  let activePointer = null, frames = 0, disposed = false;
  let totalMs = 0, maxMs = 0, samples = 0;
  const frame = () => {
    if (!frames) frames = requestAnimationFrame(() => { frames = 0; if (!disposed) callbacks.paint(); });
  };
  const point = event => ({ ...screenToLogical(svg, event.clientX, event.clientY), time: event.timeStamp });
  const deliver = (kind, event) => {
    const t = performance.now();
    callbacks[kind](point(event), event.pointerType || 'mouse');
    const elapsed = performance.now() - t;
    samples++; totalMs += elapsed; maxMs = Math.max(maxMs, elapsed);
    callbacks.timing?.({ samples, totalMs, maxMs }); frame();
  };
  const down = event => {
    if (activePointer !== null || event.button > 0 || callbacks.disabled()) return;
    event.preventDefault();
    activePointer = event.pointerId;
    svg.setPointerCapture(event.pointerId);
    deliver('start', event);
  };
  const move = event => {
    if (event.pointerId !== activePointer) return;
    event.preventDefault();
    const coalesced = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    for (const sample of coalesced.length ? coalesced : [event]) deliver('move', sample);
  };
  const up = event => {
    if (event.pointerId !== activePointer) return;
    guardContactClick(event);
    deliver('end', event);
    activePointer = null;
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  };
  const cancel = event => {
    if (event && event.pointerId !== activePointer) return;
    const pointer = activePointer;
    if (pointer === null) return;
    activePointer = null;
    callbacks.cancel(); frame();
    if (svg.hasPointerCapture(pointer)) svg.releasePointerCapture(pointer);
  };
  const resize = () => cancel();
  const events = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: cancel, lostpointercapture: cancel };
  Object.entries(events).forEach(([type, handler]) => svg.addEventListener(type, handler));
  window.addEventListener('resize', resize);
  const observer = new ResizeObserver(resize); observer.observe(svg);
  const detach = () => {
    disposed = true; cancelAnimationFrame(frames); cancel();
    Object.entries(events).forEach(([type, handler]) => svg.removeEventListener(type, handler));
    window.removeEventListener('resize', resize); observer.disconnect();
  };
  detach.cancel = cancel;
  return detach;
}
