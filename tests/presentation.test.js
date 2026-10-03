import { it, expect, vi, afterEach } from 'vitest';
import { readPresentation, savePresentation, presentationKey, setTracingContact, resetTracingContacts } from '../src/platform/presentation.js';
afterEach(() => vi.unstubAllGlobals());
it('defaults native Android to light, honours explicit choices and tolerates blocked storage', () => {
  const values = new Map(), storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  expect(readPresentation(storage, true)).toBe('light'); expect(readPresentation(storage, false)).toBe('full');
  expect(savePresentation(storage, 'full')).toBe(true); expect(readPresentation(storage, true)).toBe('full');
  expect([...values.keys()]).toEqual([presentationKey]); expect(savePresentation(storage, 'invalid')).toBe(false);
  const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); } };
  expect(readPresentation(blocked, true)).toBe('light'); expect(savePresentation(blocked, 'light')).toBe(false);
});
it('keeps decorations paused until both contacts release and clears on interruption', () => {
  const dataset = {}; vi.stubGlobal('document', { documentElement: { dataset } });
  const a = Symbol(), b = Symbol(); setTracingContact(a, true); setTracingContact(b, true);
  setTracingContact(a, false); expect(dataset.tracing).toBe('true'); setTracingContact(b, false); expect(dataset.tracing).toBe('false');
  setTracingContact(a, true); resetTracingContacts(); expect(dataset.tracing).toBe('false'); setTracingContact(a, false); expect(dataset.tracing).toBe('false');
});
