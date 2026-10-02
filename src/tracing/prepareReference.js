import { makeReference } from './geometry.js';

/** Browser preparation only; the matcher itself has no DOM dependency. */
export function prepareReferences(letter, documentObject = document) {
  const references = {};
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
  }
  return references;
}
