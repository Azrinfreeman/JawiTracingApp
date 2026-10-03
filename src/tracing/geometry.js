export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const finitePoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);

export function makeReference(points) {
  if (points.length < 2 || points.some(p => !finitePoint(p))) throw new Error('Invalid reference');
  const vertices = [{ ...points[0], s: 0 }];
  for (const p of points.slice(1)) {
    const previous = vertices.at(-1);
    const length = distance(previous, p);
    if (length > 0.0001) vertices.push({ ...p, s: previous.s + length });
  }
  if (vertices.length < 2) throw new Error('Zero length reference');
  return { vertices, length: vertices.at(-1).s };
}

export function pointAt(reference, s) {
  const { vertices, length } = reference;
  s = Math.max(0, Math.min(length, s));
  let low = 0, high = vertices.length - 1;
  while (low + 1 < high) {
    const middle = (low + high) >> 1;
    if (vertices[middle].s < s) low = middle; else high = middle;
  }
  const a = vertices[low], b = vertices[high];
  const t = (s - a.s) / (b.s - a.s || 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Half-open segment-index range, including both segments at an exact boundary. */
export function arcSegments(reference, minimum, maximum) {
  const vertices = reference.vertices;
  if (minimum > maximum || maximum < 0 || minimum > reference.length) return [1, 1];
  let low = 1, high = vertices.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (vertices[middle].s < minimum) low = middle + 1; else high = middle;
  }
  const first = low;
  low = 0; high = vertices.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (vertices[middle].s <= maximum) low = middle + 1; else high = middle;
  }
  return [first, Math.min(vertices.length, low + 1)];
}

export function projectSegment(p, a, b, minimum, maximum) {
  const span = b.s - a.s;
  const dx = b.x - a.x, dy = b.y - a.y;
  const raw = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (span * span);
  const t = Math.max(Math.max(0, (minimum - a.s) / span), Math.min(Math.min(1, (maximum - a.s) / span), raw));
  const q = { x: a.x + dx * t, y: a.y + dy * t };
  return { ...q, error: distance(p, q), s: a.s + t * span };
}

/** Project only within the active arc interval. Earliest-arc ties stay unchanged. */
export function projectLocal(p, reference, minimum, maximum) {
  minimum = Math.max(0, minimum);
  maximum = Math.min(reference.length, maximum);
  const [first, end] = arcSegments(reference, minimum, maximum);
  let best = null;
  for (let i = first; i < end; i++) {
    const candidate = projectSegment(p, reference.vertices[i - 1], reference.vertices[i], minimum, maximum);
    if (!best || candidate.error < best.error - 0.00001 || (Math.abs(candidate.error - best.error) < 0.00001 && candidate.s < best.s)) best = candidate;
  }
  return best;
}

export function movementSamples(a, b, spacing = 4) {
  const count = Math.max(1, Math.ceil(distance(a, b) / spacing));
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / count;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  });
}

/** Fresh per event batch; never retained across layout, scroll or zoom changes. */
export function screenConverter(svg) {
  try {
    const matrix = svg.getScreenCTM();
    if (!matrix) return () => null;
    const inverse = matrix.inverse(), point = svg.createSVGPoint();
    return (clientX, clientY) => {
      point.x = clientX; point.y = clientY;
      const logical = point.matrixTransform(inverse);
      return finitePoint(logical) ? { x: logical.x, y: logical.y } : null;
    };
  } catch { return () => null; }
}

export function screenToLogical(svg, clientX, clientY) {
  return screenConverter(svg)(clientX, clientY);
}
