/** Consume the click belonging to a released tracing contact across a UI handoff.
 * A fresh pointer/key action always removes this short-lived guard. Each contact
 * has its own guard, so two boards can release independently. */
export function guardContactClick(event, surface = window) {
  let timer;
  const clear = () => {
    clearTimeout(timer);
    surface.removeEventListener('click', click, true);
    surface.removeEventListener('pointerdown', clear, true);
    surface.removeEventListener('keydown', clear, true);
  };
  const click = next => {
    if (next.detail === 0) return;
    const samePointer = next.pointerId === event.pointerId;
    const legacyClick = next.pointerId === undefined && Math.hypot(next.clientX - event.clientX, next.clientY - event.clientY) < 8;
    if (!samePointer && !legacyClick) return;
    next.preventDefault(); next.stopImmediatePropagation(); clear();
  };
  surface.addEventListener('click', click, true);
  surface.addEventListener('pointerdown', clear, true);
  surface.addEventListener('keydown', clear, true);
  timer = setTimeout(clear, 750);
  return clear;
}
