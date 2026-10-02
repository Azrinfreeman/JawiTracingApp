/** One monotonic active-time clock; display frequency never determines marks. */
export function createMatchClock(now = () => performance.now()) {
  let accumulated = 0, start = null;
  return {
    reset() { accumulated = 0; start = null; },
    resume() { if (start === null) start = now(); },
    pause() { if (start !== null) { accumulated += Math.max(0, now() - start); start = null; } },
    elapsed(at = now()) { return accumulated + (start === null ? 0 : Math.max(0, at - start)); },
  };
}
