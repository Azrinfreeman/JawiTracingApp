import { it, expect, vi, afterEach } from 'vitest';
import { createInkPath } from '../../src/tracing/inkPath.js';
afterEach(() => vi.unstubAllGlobals());
function element() { return { children: [], attrs: {}, writes: [], append(node) { this.children.push(node); }, setAttribute(key, value) { this.attrs[key] = value; this.writes.push([key, value]); } }; }
it('bounds each ink rewrite and preserves all coordinates with continuous chunk endpoints', () => {
  vi.stubGlobal('document', { createElementNS: element });
  const parent = element(), points = [], record = createInkPath(parent, 'body', points);
  for (let i = 0; i < 5000; i++) { points.push({ x: i / 10, y: Math.sin(i / 9) }); if (i % 4 === 0) record.paint(); }
  record.paint();
  const paths = record.node.children.map(node => node.attrs.d.match(/[ML] [-\d.e]+ [-\d.e]+/g).map(command => command.slice(2)));
  expect(paths.every(path => path.length <= 128)).toBe(true);
  paths.slice(1).forEach((path, i) => expect(path[0]).toBe(paths[i].at(-1)));
  expect(paths.flatMap((path, i) => i ? path.slice(1) : path)).toEqual(points.map(p => `${p.x} ${p.y}`));
  const firstWrites = record.node.children[0].writes.length;
  points.push({ x: 999, y: 999 }); record.paint(); expect(record.node.children[0].writes.length).toBe(firstWrites);
  expect(record.points).toBe(points);
});
it('renders a single-point tap and does not rewrite a clean tail', () => {
  vi.stubGlobal('document', { createElementNS: element });
  const record = createInkPath(element(), null, [{ x: 7, y: 8 }]); record.paint();
  expect(record.node.children[0].attrs.d).toBe('M 7 8 l 0.1 0.1');
  const count = record.node.children[0].writes.length; record.paint(); expect(record.node.children[0].writes.length).toBe(count);
});
