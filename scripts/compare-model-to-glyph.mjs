// Compare each authored tracing model with the catalogue glyph it should match.
//
//   node scripts/compare-model-to-glyph.mjs [--tag after] [--letters ra,zai] [--check] [--catalogue path]
//
// Writes output/verification/glyph-model-audit/metrics-<tag>.json and sheet-<tag>.png (model
// centreline in red, dots in blue, over the catalogue glyph). With --check the process exits
// with status 1 when a selected letter misses the acceptance numbers below. The numbers are
// an engineering gate; they do not replace the visual review of the overlay.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rasterGlyphs } from './lib/glyph-geometry.mjs';
import { measureLetter, ACCEPTANCE } from './lib/glyph-metrics.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(`--${name}`); return i < 0 ? fallback : args[i + 1]; };
const root = fileURLToPath(new URL('..', import.meta.url));
const tag = option('tag', 'current');
const catalogue = JSON.parse(readFileSync(option('catalogue', `${root}src/content/letters.json`), 'utf8'));
const selected = option('letters', '') ? new Set(option('letters').split(',')) : null;
const letters = catalogue.filter(letter => !selected || selected.has(letter.id));

const rasters = await rasterGlyphs([...new Set(letters.map(letter => letter.glyph))]);
const metrics = [], cells = [];
for (const letter of letters) {
  const { result, cell } = measureLetter(letter, rasters[letter.glyph]);
  metrics.push(result); cells.push(cell);
}

mkdirSync(`${root}output/verification/glyph-model-audit`, { recursive: true });
writeFileSync(`${root}output/verification/glyph-model-audit/metrics-${tag}.json`, JSON.stringify(metrics, null, 1));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 400 } });
  await page.setContent('<body style="margin:0;background:#fff;font:12px sans-serif"><div id="g" style="display:grid;grid-template-columns:repeat(6,220px);gap:6px;padding:6px"></div></body>');
  await page.evaluate(cellList => {
    const grid = document.getElementById('g');
    for (const cell of cellList) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'border:1px solid #bbb;padding:3px';
      const caption = document.createElement('div');
      caption.textContent = cell.caption;
      caption.style.cssText = 'height:30px;font-weight:bold;overflow:hidden';
      const canvas = document.createElement('canvas');
      canvas.width = 210; canvas.height = 240;
      const ctx = canvas.getContext('2d');
      const k = Math.min(canvas.width / cell.w, canvas.height / cell.h) * .94;
      const ox = (canvas.width - cell.w * k) / 2, oy = (canvas.height - cell.h * k) / 2;
      const paint = (data, colour) => {
        const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const layer = document.createElement('canvas'); layer.width = cell.w; layer.height = cell.h;
        const lc = layer.getContext('2d'), image = lc.createImageData(cell.w, cell.h);
        for (let i = 0; i < bytes.length; i++) if (bytes[i]) { image.data[i * 4] = colour[0]; image.data[i * 4 + 1] = colour[1]; image.data[i * 4 + 2] = colour[2]; image.data[i * 4 + 3] = 255; }
        lc.putImageData(image, 0, 0);
        ctx.drawImage(layer, ox, oy, cell.w * k, cell.h * k);
      };
      paint(cell.body, [172, 190, 180]); paint(cell.dotInk, [205, 215, 210]);
      ctx.strokeStyle = '#c0281c'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      for (const line of cell.lines) { ctx.beginPath(); line.forEach((p, i) => i ? ctx.lineTo(ox + p.x * k, oy + p.y * k) : ctx.moveTo(ox + p.x * k, oy + p.y * k)); ctx.stroke(); }
      ctx.fillStyle = '#1b4fd0';
      for (const d of cell.dots) { ctx.beginPath(); ctx.arc(ox + d.x * k, oy + d.y * k, Math.max(3, d.r * k), 0, Math.PI * 2); ctx.fill(); }
      wrap.append(caption, canvas); grid.append(wrap);
    }
  }, cells);
  await page.screenshot({ path: `${root}output/verification/glyph-model-audit/sheet-${tag}.png`, fullPage: true });
} finally { await browser.close(); }

// --check covers the letters under review (not approved) or those named with --letters; approved
// letters keep their earlier measurements and are listed for information only.
const rows = metrics.filter(m => !m.outOfScope && (selected || m.geometry !== 'approved'));
console.log('letter          mean stray  unc  s95  aspect(font/model) dots  counters(font/game,ratios) iou(game|76) result');
for (const m of metrics) console.log(`${m.id.padEnd(14)} ${String(m.meanDist).padStart(5)} ${String(m.strayPct).padStart(5)} ${String(m.uncoveredPct).padStart(4)} ${String(m.shape95).padStart(4)}  ${String(m.fontAspect).padStart(5)}/${String(m.modelAspect).padEnd(5)}  ${m.fontDots}/${m.modelDots}   ${m.fontCounters}/${m.game.counters} ${JSON.stringify(m.game.ratios)} ${m.game.iou}|${m.at76.iou} w${m.game.weight}|${m.at76.weight}  ${m.outOfScope ? 'out of scope' : m.meetsAcceptance ? 'ok' : 'FAIL ' + m.failures.join(',')}`);
if (args.includes('--check') && rows.some(m => !m.meetsAcceptance)) process.exit(1);
