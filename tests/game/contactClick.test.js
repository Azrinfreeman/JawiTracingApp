import { test, expect, vi } from 'vitest';
import { guardContactClick } from '../../src/tracing/contactClick.js';
function surface() {
  const handlers = new Map();
  return { addEventListener(name, fn) { if (!handlers.has(name)) handlers.set(name, new Set()); handlers.get(name).add(fn); }, removeEventListener(name, fn) { handlers.get(name)?.delete(fn); },
    fire(name, params = {}) { const event = { detail: 1, preventDefault: vi.fn(), stopImmediatePropagation: vi.fn(), ...params }; for (const fn of [...handlers.get(name) || []]) fn(event); return event; } };
}
test('released contact cannot click a newly rendered action; another player remains independent', () => {
  const win = surface(), clear = guardContactClick({ pointerId: 2, clientX: 100, clientY: 100 }, win);
  expect(win.fire('click', { pointerId: 3 }).preventDefault).not.toHaveBeenCalled();
  expect(win.fire('click', { pointerId: 2 }).preventDefault).toHaveBeenCalledOnce();
  expect(win.fire('click', { pointerId: 2 }).preventDefault).not.toHaveBeenCalled(); clear();
});
test('legacy click matches its release position; virtual clicks and fresh intent remain usable', () => {
  const win = surface(); let clear = guardContactClick({ pointerId: 2, clientX: 100, clientY: 100 }, win);
  expect(win.fire('click', { detail: 0, clientX: 100, clientY: 100 }).preventDefault).not.toHaveBeenCalled();
  expect(win.fire('click', { clientX: 100, clientY: 100 }).preventDefault).toHaveBeenCalledOnce(); clear();
  for (const type of ['pointerdown', 'keydown']) {
    clear = guardContactClick({ pointerId: 2 }, win); win.fire(type);
    expect(win.fire('click', { pointerId: 2 }).preventDefault).not.toHaveBeenCalled(); clear();
  }
});
test('guard expires even if the browser never emits a click', () => {
  vi.useFakeTimers(); const win = surface(); guardContactClick({ pointerId: 2 }, win); vi.advanceTimersByTime(751);
  expect(win.fire('click', { pointerId: 2 }).preventDefault).not.toHaveBeenCalled(); vi.useRealTimers();
});
