// Author tracing-model geometry from the catalogue glyph.
//
//   node scripts/trace-glyph-centreline.mjs help  <id...>   skeleton + grid sheet to choose via points
//   node scripts/trace-glyph-centreline.mjs trace <id...>   route/fit the plan, write proposals + overlay
//   node scripts/trace-glyph-centreline.mjs apply <id...>   write the traced geometry into letters.json
//   node scripts/trace-glyph-centreline.mjs widths <id...>  choose each stroke's displayWidth (play guide) from the glyph
//
// The glyph is thinned to a centreline and each stroke is routed along it through the via points
// recorded in scripts/glyph-trace-plan.json (coordinates are pixels of the cropped glyph raster,
// as shown on the help sheet). The geometry therefore follows the catalogue letter; the stroke
// order, direction and pen lifts are authored in the plan and are proposals for review.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { suggestDisplayWidth, DEFAULT_DISPLAY_WIDTH } from './lib/glyph-metrics.mjs';
import { bounds, fitPolyline, nearestSet, rasterGlyphs, routeOnSkeleton, smooth, splitGlyph, thin, toPath } from './lib/glyph-geometry.mjs';

const [mode, ...ids] = process.argv.slice(2);
const root = fileURLToPath(new URL('..', import.meta.url));
const planFile = `${root}scripts/glyph-trace-plan.json`;
const cataloguePath = `${root}src/content/letters.json`;
const outDir = `${root}output/verification/glyph-model-audit`;
const plan = JSON.parse(readFileSync(planFile, 'utf8'));
const catalogue = JSON.parse(readFileSync(cataloguePath, 'utf8'));
if (!['help', 'trace', 'apply', 'widths'].includes(mode) || !ids.length) { console.error('usage: <help|trace|apply|widths> <letter id...>'); process.exit(2); }
mkdirSync(`${outDir}/helpers`, { recursive: true });
mkdirSync(`${outDir}/proposals`, { recursive: true });

const letters = ids.map(id => {
  const letter = catalogue.find(item => item.id === id), entry = plan.letters[id];
  if (!letter) throw new Error(`Unknown letter ${id}`);
  if (!entry && mode !== 'help' && mode !== 'widths') throw new Error(`No plan for ${id}`);
  return { letter, entry };
});
const rasters = await rasterGlyphs([...new Set(letters.map(({ letter }) => letter.glyph))]);

if (mode === 'widths') {
  for (const { letter } of letters) {
    const target = catalogue.find(item => item.id === letter.id);
    const pick = suggestDisplayWidth(target, rasters[letter.glyph]);
    for (const stroke of target.geometry.strokes) {
      if (pick.width === DEFAULT_DISPLAY_WIDTH) delete stroke.displayWidth; else stroke.displayWidth = pick.width;
    }
    console.log(`${letter.id}: displayWidth ${pick.width}${pick.met ? '' : ' (best overlap; targets not all met)'} counters ${JSON.stringify(pick.ratios)} iou ${pick.iou} weight ${pick.weight}`);
  }
  writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');
  process.exit(0);
}

function analyse({ letter, entry }) {
  const raster = rasters[letter.glyph], { w, h } = raster;
  const { bodyMask, dots } = splitGlyph(raster);
  const skeleton = thin(raster, bodyMask);
  const k = entry?.k ?? plan.k, cx = entry?.cx ?? 500, cy = entry?.cy ?? 500;
  const toModel = p => ({ x: cx + (p.x - w / 2) * k, y: cy + (p.y - h / 2) * k });
  return { raster, w, h, bodyMask, skeleton, dots, k, toModel };
}

function traceStroke(context, spec, label) {
  const { w, h, skeleton, toModel } = context;
  const route = [];
  const shift = spec.shift ?? [0, 0];
  const pieces = spec.via.map(v => ({ v: [v[0] + shift[0], v[1] + shift[1], v[2]], raw: v[2] === 'raw' }));
  let previous = null;
  const anchors = [];
  for (const { v, raw } of pieces) {
    if (raw) { anchors.push({ raw: { x: v[0], y: v[1] } }); continue; }
    const found = nearestSet(w, h, skeleton, v[0], v[1], spec.snap ?? 70);
    if (!found) throw new Error(`${label}: no skeleton near ${v[0]},${v[1]}`);
    anchors.push({ index: found.index, from: { x: v[0], y: v[1] }, snapped: found.distance });
  }
  const corners = [];
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    if (a.raw) { route.push(a.raw); if (spec.corners?.includes(i)) corners.push(route.length - 1); previous = null; continue; }
    if (previous != null) {
      const leg = routeOnSkeleton(w, h, skeleton, previous, a.index);
      if (!leg) throw new Error(`${label}: no skeleton route to via ${i}`);
      route.push(...leg.slice(1));
    } else route.push({ x: a.index % w, y: (a.index / w) | 0 });
    previous = a.index;
    if (spec.corners?.includes(i)) corners.push(route.length - 1);
  }
  // A closed loop must end exactly where it starts, so the numbered guides share one start/stop badge.
  if (spec.close) route[route.length - 1] = { ...route[0] };
  const radius = spec.smooth ?? 9;
  let points = route;
  // Smooth each run between corners separately so sharp joins survive the averaging.
  if (corners.length) {
    const cuts = [0, ...corners, route.length - 1];
    points = [];
    for (let i = 0; i < cuts.length - 1; i++) points.push(...smooth(route.slice(cuts[i], cuts[i + 1] + 1), radius).slice(i ? 1 : 0));
  } else points = smooth(route, radius);
  const model = points.map(toModel);
  const fitted = fitPolyline(model, corners, spec.tolerance ?? 4);
  return { route: points, path: toPath(fitted), snapped: anchors.map(a => a.snapped ?? null) };
}

function orderDots(model, order) {
  const sorted = [...model].sort((a, b) => b.x - a.x);
  if (order === 'ltr') return sorted.reverse();
  // Right-to-left; a lone apex dot (triangle arrangement) comes last, as in the existing models.
  if (sorted.length === 3) {
    const apex = sorted.reduce((best, d) => (d.y < best.y !== (order === 'apex-below')) ? d : best, sorted[0]);
    return [...sorted.filter(d => d !== apex), apex];
  }
  return sorted;
}

const sheets = [];
for (const item of letters) {
  const { letter, entry } = item, context = analyse(item);
  const { raster, w, h, skeleton, dots, toModel } = context;
  const cell = { id: letter.id, w, h, body: Buffer.from(context.bodyMask).toString('base64'), dotInk: '', skeleton: Buffer.from(skeleton).toString('base64'), routes: [], dots: dots.map(d => ({ x: d.cx, y: d.cy })), fitted: [], mode };
  const dotInk = new Uint8Array(w * h);
  for (let i = 0; i < dotInk.length; i++) dotInk[i] = raster.mask[i] && !context.bodyMask[i] ? 1 : 0;
  cell.dotInk = Buffer.from(dotInk).toString('base64');
  if (mode === 'help') { sheets.push(cell); continue; }

  const strokes = entry.strokes.map((spec, index) => ({ id: `stroke-${index + 1}`, ...traceStroke(context, spec, `${letter.id} stroke-${index + 1}`) }));
  const dotModel = orderDots(dots.map(d => toModel({ x: d.cx, y: d.cy })), entry.dotOrder);
  const proposal = {
    id: letter.id, glyph: letter.glyph, frame: { k: context.k, cx: entry.cx, cy: entry.cy },
    strokes: strokes.map(s => ({ id: s.id, path: s.path })),
    dots: dotModel.map((d, i) => ({ id: `dot-${i + 1}`, x: Math.round(d.x), y: Math.round(d.y) })),
    sequence: entry.sequence ?? [...strokes.map(s => s.id), ...dotModel.map((_, i) => `dot-${i + 1}`)],
    note: entry.note ?? '',
  };
  const box = bounds(strokes.flatMap(s => s.route.map(toModel)));
  proposal.centrelineBox = { width: Math.round(box.x1 - box.x0), height: Math.round(box.y1 - box.y0) };
  writeFileSync(`${outDir}/proposals/${letter.id}.json`, JSON.stringify(proposal, null, 1));
  cell.routes = strokes.map(s => s.route);
  cell.snapped = strokes.map(s => s.snapped);
  sheets.push(cell);
  console.log(`${letter.id}: ${strokes.length} stroke(s), ${dotModel.length} dot(s); snap distances ${JSON.stringify(strokes.map(s => s.snapped.map(v => v == null ? '-' : Math.round(v))))}`);
  for (const s of strokes) console.log(`  ${s.id}: ${s.path}`);

  {
    const target = catalogue.find(l => l.id === letter.id), old = target.geometry;
    const prototypeStroke = old.strokes[0], template = id => old.strokes.find(s => s.id === id) ?? prototypeStroke;
    const dotTemplate = old.dotTargets[0] ?? { visibleRadius: 19, hitRadius: 48, maxTravel: 30, policy: 'tap' };
    // A new revision is needed only where a reviewed (approved) geometry changes; an unreviewed one keeps its revision.
    if (old.status === 'approved') target.contentVersion += 1;
    target.geometry = {
      status: 'pendingReview',
      displayPaths: strokes.map(s => s.path),
      strokes: strokes.map(s => ({ id: s.id, path: s.path, width: template(s.id).width, penLiftPolicy: template(s.id).penLiftPolicy, checkpoints: template(s.id).checkpoints })),
      dotTargets: proposal.dots.map(d => ({ id: d.id, x: d.x, y: d.y, visibleRadius: dotTemplate.visibleRadius, hitRadius: dotTemplate.hitRadius, maxTravel: dotTemplate.maxTravel, policy: 'tap' })),
      validSequences: [proposal.sequence],
    };
    const pick = suggestDisplayWidth(target, raster);
    for (const stroke of target.geometry.strokes) if (pick.width !== DEFAULT_DISPLAY_WIDTH) stroke.displayWidth = pick.width;
    console.log(`  displayWidth ${pick.width}${pick.met ? '' : ' (targets not all met)'}`);
    if (mode === 'apply') console.log(`  applied: revision ${target.contentVersion}, geometry pendingReview`);
  }
}
// `trace` leaves letters.json alone and writes a proposed copy for compare-model-to-glyph.mjs --catalogue.
if (mode === 'apply') writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');
else if (mode === 'trace') writeFileSync(`${outDir}/proposals/letters-proposed.json`, JSON.stringify(catalogue, null, 2) + '\n');

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  await page.setContent('<body style="margin:0;background:#fff;font:14px sans-serif"><div id="g" style="display:flex;flex-wrap:wrap;gap:10px;padding:10px"></div></body>');
  await page.evaluate(cells => {
    const grid = document.getElementById('g');
    const unpack = data => Uint8Array.from(atob(data), c => c.charCodeAt(0));
    for (const cell of cells) {
      const scale = Math.min(2, 900 / Math.max(cell.w, cell.h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(cell.w * scale) + 40; canvas.height = Math.ceil(cell.h * scale) + 40;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.translate(30, 10);
      const layer = (data, colour, alpha = 255) => {
        const bytes = unpack(data), tmp = document.createElement('canvas'); tmp.width = cell.w; tmp.height = cell.h;
        const tc = tmp.getContext('2d'), image = tc.createImageData(cell.w, cell.h);
        for (let i = 0; i < bytes.length; i++) if (bytes[i]) { image.data.set([...colour, alpha], i * 4); }
        tc.putImageData(image, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, cell.w * scale, cell.h * scale);
      };
      layer(cell.body, [190, 205, 196]); layer(cell.dotInk, [215, 222, 218]);
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.fillStyle = '#444'; ctx.font = '11px sans-serif'; ctx.lineWidth = 1;
      for (let x = 0; x <= cell.w; x += 50) { ctx.beginPath(); ctx.moveTo(x * scale, 0); ctx.lineTo(x * scale, cell.h * scale); ctx.stroke(); ctx.fillText(String(x), x * scale - 8, cell.h * scale + 14); }
      for (let y = 0; y <= cell.h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y * scale); ctx.lineTo(cell.w * scale, y * scale); ctx.stroke(); ctx.fillText(String(y), -28, y * scale + 4); }
      if (cell.mode === 'help') layer(cell.skeleton, [200, 40, 30]);
      cell.routes.forEach(route => { ctx.strokeStyle = '#c0281c'; ctx.lineWidth = 3; ctx.beginPath(); route.forEach((p, i) => i ? ctx.lineTo(p.x * scale, p.y * scale) : ctx.moveTo(p.x * scale, p.y * scale)); ctx.stroke();
        ctx.fillStyle = '#0a7'; ctx.beginPath(); ctx.arc(route[0].x * scale, route[0].y * scale, 6, 0, 7); ctx.fill();
        ctx.fillStyle = '#d70'; ctx.beginPath(); ctx.arc(route[route.length - 1].x * scale, route[route.length - 1].y * scale, 6, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#1b4fd0';
      cell.dots.forEach((d, i) => { ctx.beginPath(); ctx.arc(d.x * scale, d.y * scale, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillText(String(i + 1), d.x * scale + 8, d.y * scale); ctx.fillStyle = '#1b4fd0'; });
      const wrap = document.createElement('div'); wrap.dataset.id = cell.id; wrap.append(canvas); grid.append(wrap);
    }
  }, sheets);
  for (const cell of sheets) await (await page.$(`[data-id="${cell.id}"]`)).screenshot({ path: `${outDir}/helpers/${mode === 'help' ? 'skeleton' : 'trace'}-${cell.id}.png` });
} finally { await browser.close(); }
