import { makeReference } from './geometry.js';

const documents = new WeakMap();
const MAX_ENTRIES = 48, MAX_VERTICES = 120000;

/** Browser preparation only; the matcher itself has no DOM dependency. */
export function prepareReferences(letter, documentObject = document) {
  let cache = documents.get(documentObject);
  if (!cache) documents.set(documentObject, cache = { entries:new Map(), vertices:0 });
  const key = JSON.stringify([letter.id,letter.contentVersion,letter.geometry.strokes.map(({id,path})=>[id,path])]);
  const existing = cache.entries.get(key);
  if (existing) {
    cache.entries.delete(key); cache.entries.set(key,existing);
    return existing.references;
  }
  const references = {};
  let vertices = 0;
  for (const stroke of letter.geometry.strokes) {
    const path = documentObject.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', stroke.path);
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) throw new Error('Invalid stroke length');
    // Two-unit arc sampling resolves tight curves in the 1000-unit model.
    const steps = Math.ceil(length / 2);
    if (steps > 12000) throw new Error('Reference too large');
    references[stroke.id] = makeReference(Array.from({ length: steps + 1 }, (_, i) => {
      const p = path.getPointAtLength(length * i / steps);
      return { x: p.x, y: p.y };
    }));
    const reference = references[stroke.id];
    vertices += reference.vertices.length;
    reference.vertices.forEach(Object.freeze); Object.freeze(reference.vertices); Object.freeze(reference);
  }
  Object.freeze(references);
  if (vertices <= MAX_VERTICES) {
    while(cache.entries.size >= MAX_ENTRIES || cache.vertices + vertices > MAX_VERTICES) {
      const oldest = cache.entries.keys().next().value;
      cache.vertices -= cache.entries.get(oldest).vertices; cache.entries.delete(oldest);
    }
    cache.entries.set(key,{references,vertices}); cache.vertices += vertices;
  }
  return references;
}
