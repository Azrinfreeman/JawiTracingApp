// Measurements of an authored tracing model against the catalogue glyph it should match (shared by
// compare-model-to-glyph.mjs and trace-glyph-centreline.mjs). Nothing in the app imports this file.
import { bounds, components, distanceTo, samplePath, splitGlyph, thin } from './glyph-geometry.mjs';

// shape95: 95th-percentile distance (% of box) from the catalogue centreline to the model, so a missing or
// shrunken loop fails. Counters: enclosed holes must match in number and keep counterMin..counterMax of their
// area when the model is stroked at the width the game draws. iou/weight: overlap with, and area relative to,
// the catalogue ink at that width (weight is guide area / ink area).
export const ACCEPTANCE = { meanDist: 3.5, stray: 30, uncovered: 35, aspectTolerance: .2, shape95: 6, counterMin: .7, counterMax: 1.3, iou: .5, weightMax: 1.25 };
export const DEFAULT_DISPLAY_WIDTH = 76;
// Kaf and Ga are shaped to the owner's earlier reference and stay out of this comparison's scope.
export const OUT_OF_SCOPE = new Set(['kaf', 'ga']);
const PAD = 6;

export function measureLetter(letter, raster) {
  const { w, h } = raster;
  const { bodyMask, dots: fontDots } = splitGlyph(raster);
  const skeleton = thin(raster, bodyMask);
  const inkDistance = distanceTo(raster, bodyMask);
  const skeletonDistance = distanceTo(raster, skeleton);

  const strokes = letter.geometry.strokes.map(stroke => ({ ...stroke, samples: samplePath(stroke.path, 1) }));
  const modelDots = letter.geometry.dotTargets;
  const centreline = strokes.flatMap(stroke => stroke.samples);
  const centreBox = bounds(centreline), half = Math.max(...strokes.map(s => s.width)) / 2;
  const edges = [{ x: centreBox.x0 - half, y: centreBox.y0 - half }, { x: centreBox.x1 + half, y: centreBox.y1 + half },
    ...modelDots.flatMap(d => [{ x: d.x - d.visibleRadius, y: d.y - d.visibleRadius }, { x: d.x + d.visibleRadius, y: d.y + d.visibleRadius }])];
  const modelBox = bounds(edges);
  const modelW = modelBox.x1 - modelBox.x0, modelH = modelBox.y1 - modelBox.y0;
  const fontW = w - PAD * 2, fontH = h - PAD * 2;
  // Both shapes share one bounding box (as in the audit); aspect is judged separately below.
  const sx = fontW / Math.max(modelW, 1), sy = fontH / Math.max(modelH, 1), scale = Math.sqrt(sx * sy);
  const toRaster = p => ({ x: w / 2 + (p.x - (modelBox.x0 + modelBox.x1) / 2) * sx, y: h / 2 + (p.y - (modelBox.y0 + modelBox.y1) / 2) * sy });

  const box = Math.max(fontW, fontH), pct = 100 / box;
  const mapped = strokes.map(stroke => stroke.samples.map(toRaster));
  const samples = mapped.flat();
  const inside = p => p.x >= 0 && p.y >= 0 && p.x < w - .5 && p.y < h - .5;
  const lookup = (grid, p) => inside(p) ? grid[Math.round(p.y) * w + Math.round(p.x)] : box;

  const modelMask = new Uint8Array(w * h);
  for (const p of samples) if (inside(p)) modelMask[Math.round(p.y) * w + Math.round(p.x)] = 1;
  const modelDistance = distanceTo(raster, modelMask);

  const meanDist = samples.reduce((sum, p) => sum + lookup(skeletonDistance, p), 0) / samples.length * pct;
  const stray = samples.filter(p => lookup(inkDistance, p) > box * .015).length / samples.length * 100;
  let ink = 0, uncovered = 0;
  for (let i = 0; i < bodyMask.length; i++) if (bodyMask[i]) { ink++; if (modelDistance[i] > box * .06) uncovered++; }
  uncovered = uncovered / ink * 100;
  // Loop fidelity at the width Jejak Ceria draws (stroke.displayWidth, default 76).
  const holesOf = mask => {
    const inverse = new Uint8Array(w * h);
    for (let i = 0; i < inverse.length; i++) inverse[i] = mask[i] ? 0 : 1;
    return components({ w, h, mask: inverse }).list.filter(c => c.x0 > 0 && c.y0 > 0 && c.x1 < w - 1 && c.y1 < h - 1 && c.area > 30).map(c => c.area).sort((a, b) => b - a);
  };
  const strokedAt = widthOf => {
    const covered = new Uint8Array(w * h);
    mapped.forEach((line, index) => {
      const mask = new Uint8Array(w * h);
      for (const p of line) if (inside(p)) mask[Math.round(p.y) * w + Math.round(p.x)] = 1;
      const distance = distanceTo(raster, mask), radius = widthOf(strokes[index]) / 2 * scale;
      for (let i = 0; i < covered.length; i++) if (distance[i] <= radius) covered[i] = 1;
    });
    return covered;
  };
  const skeletonSpread = [];
  for (let i = 0; i < skeleton.length; i++) if (skeleton[i]) skeletonSpread.push(modelDistance[i]);
  skeletonSpread.sort((a, b) => a - b);
  const shape95 = skeletonSpread[Math.floor(skeletonSpread.length * .95)] * pct;
  const fontCounters = holesOf(bodyMask);
  const loopFidelity = widthOf => {
    const covered = strokedAt(widthOf), counters = holesOf(covered);
    let both = 0, either = 0, area = 0, inkArea = 0;
    for (let i = 0; i < covered.length; i++) { if (covered[i] && bodyMask[i]) both++; if (covered[i] || bodyMask[i]) either++; area += covered[i]; inkArea += bodyMask[i]; }
    const ratios = fontCounters.map((area, i) => counters[i] ? +(counters[i] / area).toFixed(2) : 0);
    return { counters: counters.length, ratios, iou: +(both / either).toFixed(2), weight: +(area / inkArea).toFixed(2),
      counterOk: counters.length === fontCounters.length && ratios.every(r => r >= ACCEPTANCE.counterMin && r <= ACCEPTANCE.counterMax) };
  };
  const game = loopFidelity(stroke => stroke.displayWidth ?? DEFAULT_DISPLAY_WIDTH);
  const legacy = loopFidelity(() => DEFAULT_DISPLAY_WIDTH);
  const fontAspect = fontW / fontH, modelAspect = modelW / modelH;
  const mappedDots = modelDots.map(d => ({ ...toRaster(d), r: d.visibleRadius * scale }));
  const dotOffsets = mappedDots.map(d => Math.min(...fontDots.map(f => Math.hypot(f.cx - d.x, f.cy - d.y)), box) * pct);

  const result = {
    id: letter.id, label: letter.labelMs, revision: letter.contentVersion, geometry: letter.geometry.status,
    fontAspect: +fontAspect.toFixed(2), modelAspect: +modelAspect.toFixed(2),
    fontDots: fontDots.length, modelDots: modelDots.length, strokes: strokes.length,
    meanDist: +meanDist.toFixed(1), strayPct: Math.round(stray), uncoveredPct: Math.round(uncovered),
    worstDotOffset: dotOffsets.length ? +Math.max(...dotOffsets).toFixed(1) : 0,
    shape95: +shape95.toFixed(1), fontCounters: fontCounters.length, game, at76: legacy,
    displayWidth: strokes.map(stroke => stroke.displayWidth ?? DEFAULT_DISPLAY_WIDTH),
  };
  const failures = [];
  if (result.meanDist > ACCEPTANCE.meanDist) failures.push('mean distance');
  if (result.strayPct > ACCEPTANCE.stray) failures.push('stray');
  if (result.uncoveredPct > ACCEPTANCE.uncovered) failures.push('uncovered');
  if (Math.abs(modelAspect / fontAspect - 1) > ACCEPTANCE.aspectTolerance) failures.push('aspect');
  if (fontDots.length !== modelDots.length) failures.push('dot count');
  if (result.shape95 > ACCEPTANCE.shape95) failures.push('shape coverage');
  if (!game.counterOk) failures.push('counters');
  if (game.iou < ACCEPTANCE.iou) failures.push('overlap');
  if (game.weight > ACCEPTANCE.weightMax) failures.push('weight');
  result.meetsAcceptance = failures.length === 0;
  result.failures = failures;
  result.outOfScope = OUT_OF_SCOPE.has(letter.id);

  let binary = '';
  for (let i = 0; i < bodyMask.length; i += 8192) binary += String.fromCharCode(...bodyMask.subarray(i, i + 8192));
  let dotBinary = '';
  const dotInk = new Uint8Array(w * h);
  for (let i = 0; i < dotInk.length; i++) dotInk[i] = raster.mask[i] && !bodyMask[i] ? 1 : 0;
  for (let i = 0; i < dotInk.length; i += 8192) dotBinary += String.fromCharCode(...dotInk.subarray(i, i + 8192));
  const cell = { caption: `${letter.id} r${letter.contentVersion} · ${result.meanDist}/${result.strayPct}/${result.uncoveredPct} · asp ${result.fontAspect}/${result.modelAspect}${failures.length ? ' ✗ ' + failures.join(',') : ''}`,
    w, h, body: btoa(binary), dotInk: btoa(dotBinary), lines: mapped.map(line => line.filter((_, i) => i % 3 === 0)), dots: mappedDots };
  return { result, cell };
}

/**
 * The guide width Jejak Ceria should draw: the largest width in [44, 76] (44 is the authored stroke width,
 * 76 the original default) at which every counter survives, the stroked model overlaps the ink and the guide
 * is not much heavier than the letter. Falls back to the width with the best overlap.
 */
export function suggestDisplayWidth(letter, raster) {
  const tries = [];
  for (let width = 76; width >= 44; width -= 2) {
    const candidate = { ...letter, geometry: { ...letter.geometry, strokes: letter.geometry.strokes.map(stroke => ({ ...stroke, displayWidth: width })) } };
    const { result } = measureLetter(candidate, raster);
    tries.push({ width, ...result.game });
    if (result.game.counterOk && result.game.iou >= ACCEPTANCE.iou && result.game.weight <= ACCEPTANCE.weightMax) return { width, ...result.game, met: true };
  }
  return { ...tries.reduce((best, item) => item.iou > best.iou ? item : best), met: false };
}
