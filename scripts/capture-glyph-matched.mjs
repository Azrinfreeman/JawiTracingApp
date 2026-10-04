// Capture the adult-preview lesson of each glyph-matched letter at the review viewports.
//   node scripts/capture-glyph-matched.mjs <outDir> [width x height ...]   (dev server at 127.0.0.1:5173)
// Writes <outDir>/<letter>-<w>x<h>.png and <letter>-<w>x<h>-done.png (completed) and a JSON of
// overlap/overflow measurements: the Menu button and letter badge against the traced letter.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const [out, ...sizes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const letters = JSON.parse(readFileSync(new URL('../src/content/letters.json', import.meta.url), 'utf8'));
const ids = (process.env.LETTERS || '').split(',').filter(Boolean);
const targets = letters.filter(l => (ids.length ? ids.includes(l.id) : l.geometry.status !== 'approved' && l.id !== 'kaf' && l.id !== 'ga'));
const viewports = (sizes.length ? sizes : ['390x844', '1024x768']).map(s => s.split('x').map(Number));
const browser = await chromium.launch();
const results = [];
for (const [width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width >= 3000 ? 1 : 1, reducedMotion: 'reduce' });
  for (const letter of targets) {
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5173/');
    const cont = page.getByRole('button', { name: 'Teruskan', exact: true });
    if (await cont.isVisible().catch(() => false)) await cont.click({ timeout: 2500 }).catch(() => {});
    await page.waitForSelector('.splash-screen', { state: 'detached' });
    await page.evaluate(() => { Element.prototype.requestFullscreen = () => Promise.resolve(); });
    await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
    await page.getByRole('button', { name: 'Buka pratonton dewasa' }).click();
    const escaped = letter.labelMs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const card = page.getByRole('button', { name: new RegExp(`^${escaped}(?:, pernah dijejak)?$`) });
    await page.evaluate(() => document.fonts.ready);
    for (let i = 0; i < 40 && !(await card.isVisible()); i++) {
      const next = page.getByRole('button', { name: 'Halaman huruf seterusnya', exact: true });
      if (!(await next.isVisible()) || !(await next.isEnabled())) break;
      await next.click(); await page.waitForTimeout(120);
    }
    await card.click();
    await page.waitForSelector('.start-dot');
    await page.waitForTimeout(400);
    const name = `${letter.id}-${width}x${height}`;
    await page.screenshot({ path: `${out}/${name}.png` });
    const boxes = await page.evaluate(() => {
      const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
      const board = document.querySelector('.trace-board');
      const letterBox = (() => { const items = [...board.querySelectorAll('.reference-stroke,.reference-dot')].map(rect); if (!items.length) return null; const x0 = Math.min(...items.map(i => i.x)), y0 = Math.min(...items.map(i => i.y)), x1 = Math.max(...items.map(i => i.x + i.w)), y1 = Math.max(...items.map(i => i.y + i.h)); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; })();
      return { menu: rect([...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Menu permainan' || b.textContent.trim() === 'Menu')), board: rect(board), letter: letterBox,
        scroll: { x: document.documentElement.scrollWidth > innerWidth, y: document.documentElement.scrollHeight > innerHeight } };
    });
    const hit = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    results.push({ id: letter.id, viewport: `${width}x${height}`, pageErrors: errors, menuOverlapsLetter: !!hit(boxes.menu, boxes.letter),
      letterInsideBoard: !!boxes.letter && boxes.letter.x >= boxes.board.x - 1 && boxes.letter.y >= boxes.board.y - 1 && boxes.letter.x + boxes.letter.w <= boxes.board.x + boxes.board.w + 1 && boxes.letter.y + boxes.letter.h <= boxes.board.y + boxes.board.h + 1,
      pageScroll: boxes.scroll });
    await page.close();
  }
  await context.close();
}
await browser.close();
writeFileSync(`${out}/measurements.json`, JSON.stringify(results, null, 1));
console.log(`${results.length} captures; page errors: ${results.filter(r => r.pageErrors.length).length}; menu overlaps: ${results.filter(r => r.menuOverlapsLetter).length}; letter outside board: ${results.filter(r => !r.letterInsideBoard).length}; scrolling: ${results.filter(r => r.pageScroll.x || r.pageScroll.y).length}`);
