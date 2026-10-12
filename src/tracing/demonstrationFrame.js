/** Latest reveal per part; section pauses and the marker retain the authored clock. */
export function demonstrationFrame(schedule, elapsed, reduced = false) {
  const reveals = new Map();
  let current = null;
  for (const [index, step] of schedule.entries()) {
    if (elapsed < 0) break;
    const duration = reduced ? 700 : step.duration;
    const fraction = reduced ? 1 : Math.min(1, elapsed / duration);
    const arc = step.from + (step.to - step.from) * fraction;
    reveals.set(step.id, { arc, fraction });
    if (elapsed < duration + step.pause) current = { id:step.id, arc, index, lifted:elapsed >= duration };
    elapsed -= duration + step.pause;
  }
  return { reveals, current, finished:elapsed >= 0 };
}
