import { it, expect, vi, afterEach } from 'vitest';
import { attachInput } from '../../src/tracing/inputController.js';

afterEach(() => vi.unstubAllGlobals());
function setup() {
  let next = 1;
  const frames = new Map(), listeners = new Map();
  vi.stubGlobal('requestAnimationFrame', fn => { const id = next++; frames.set(id, fn); return id; });
  vi.stubGlobal('cancelAnimationFrame', id => frames.delete(id));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  const windowListeners = new Map();
  vi.stubGlobal('window', { addEventListener: (type, fn) => windowListeners.set(type, fn), removeEventListener: type => windowListeners.delete(type) });
  const svg = {
    getScreenCTM: vi.fn(() => ({ inverse: () => ({ scale: 2 }) })),
    createSVGPoint: () => ({ matrixTransform() { return { x: this.x / 2, y: this.y / 2 }; } }),
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type),
    setPointerCapture: vi.fn(), hasPointerCapture: () => true,
    releasePointerCapture: id => listeners.get('lostpointercapture')?.({ pointerId: id }),
  };
  const callbacks = { start: vi.fn(), move: vi.fn(), end: vi.fn(), cancel: vi.fn(), paint: vi.fn(), disabled: () => false, timing: vi.fn() };
  const detach = attachInput(svg, callbacks);
  const event = (type, extra = {}) => listeners.get(type)({ pointerId: 1, pointerType: 'touch', button: 0, clientX: 100, clientY: 200, timeStamp: 1, preventDefault() {}, ...extra });
  return { svg, callbacks, event, detach, frames, windowListeners };
}
it('converts once per contact and validates every ordered coalesced sample, with empty/no-API fallbacks', () => {
  const { svg, callbacks, event, detach, windowListeners } = setup();
  event('pointerdown'); expect(svg.getScreenCTM).toHaveBeenCalledTimes(1); svg.getScreenCTM.mockClear();
  event('pointermove', { getCoalescedEvents: () => [{ clientX: 102, clientY: 204, timeStamp: 2 }, { clientX: 104, clientY: 208, timeStamp: 3 }] });
  expect(svg.getScreenCTM).not.toHaveBeenCalled(); // No style/layout flush inside the move handler.
  expect(callbacks.move.mock.calls.map(([p]) => p)).toEqual([{ x: 51, y: 102, time: 2 }, { x: 52, y: 104, time: 3 }]);
  event('pointermove', { getCoalescedEvents: () => [] }); event('pointermove');
  expect(callbacks.move).toHaveBeenCalledTimes(4);
  windowListeners.get('scroll')(); event('pointermove'); expect(svg.getScreenCTM).toHaveBeenCalledTimes(1); // A scroll refreshes the matrix.
  detach();
});
it('up validates its real coordinate once, flushes once and ignores ensuing capture loss', () => {
  const { callbacks, event, frames, detach } = setup();
  event('pointerdown'); event('pointermove'); expect(frames.size).toBe(1);
  event('pointerup', { clientX: 120, clientY: 240 });
  expect(callbacks.end).toHaveBeenCalledExactlyOnceWith({ x: 60, y: 120, time: 1 }, 'touch');
  expect(callbacks.paint).toHaveBeenCalledTimes(1); expect(callbacks.cancel).not.toHaveBeenCalled(); expect(frames.size).toBe(0);
  event('lostpointercapture'); event('pointerup'); expect(callbacks.end).toHaveBeenCalledTimes(1); detach();
});
it('independent pointers and cancellation cannot commit; missing matrices safely cancel', () => {
  const { svg, callbacks, event, detach, frames } = setup();
  event('pointerdown'); event('pointermove', { pointerId: 2 }); event('pointerup', { pointerId: 2 });
  expect(callbacks.move).not.toHaveBeenCalled(); expect(callbacks.end).not.toHaveBeenCalled();
  event('pointercancel'); event('pointerup'); expect(callbacks.cancel).toHaveBeenCalledTimes(1);
  svg.getScreenCTM.mockReturnValue(null); event('pointerdown'); event('pointerup');
  expect(callbacks.end).not.toHaveBeenCalled(); detach(); expect(frames.size).toBe(0);
});
