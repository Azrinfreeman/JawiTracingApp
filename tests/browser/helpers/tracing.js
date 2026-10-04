import { expect } from '@playwright/test';
import { dismissSplash, selectPractice, chooseLetter } from './navigation.js';

export async function openLesson(page, label = 'Alif', mode = 'guided') {
  await page.goto('/'); await dismissSplash(page);
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByRole('button', { name: 'Buka pratonton dewasa' }).click();
  if (mode !== 'play') await selectPractice(page, mode);
  await chooseLetter(page, label);
  await expect(page.locator('.start-dot')).toBeVisible();
  await page.locator('.trace-board').scrollIntoViewIfNeeded();
}

export async function boardModels(page, board = page.locator('.trace-board')) {
  await board.scrollIntoViewIfNeeded();
  // WebKit updates the screen CTM on paint after scrolling a focused control.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return board.evaluate(svg => {
    const matrix = svg.getScreenCTM();
    const screen = p => { const q = new DOMPoint(p.x, p.y).matrixTransform(matrix); return { x: q.x, y: q.y }; };
    return { scale: Math.hypot(matrix.a, matrix.b),
      strokes: [...svg.querySelectorAll('.reference-stroke')].map(path => {
        const count = Math.ceil(path.getTotalLength() / 6);
        return Array.from({ length: count + 1 }, (_, i) => screen(path.getPointAtLength(path.getTotalLength() * i / count)));
      }),
      dots: [...svg.querySelectorAll('.reference-dot')].map(dot => screen({ x: +dot.getAttribute('cx'), y: +dot.getAttribute('cy') })),
    };
  });
}

export async function movePoints(page, points) { for (const point of points) await page.mouse.move(point.x, point.y); }
export async function draw(page, points) {
  await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  await movePoints(page, points.slice(1)); await page.mouse.up();
}

/** The tracing menu is the only tools surface; these helpers open it and press one action, paging if needed. */
export async function openMenu(page) {
  if (await page.getByRole('dialog', { name: /Menu permainan|Rehat sekejap/ }).isVisible()) return;
  await page.getByRole('button', { name: 'Menu permainan', exact: true }).click();
  await expect(page.getByRole('dialog', { name: /Menu permainan|Rehat sekejap/ })).toBeVisible();
}
export async function menuAction(page, name) {
  await openMenu(page);
  const dialog = page.getByRole('dialog', { name: /Menu permainan|Rehat sekejap/ });
  const button = dialog.getByRole('button', { name, exact: true }), more = dialog.getByRole('button', { name: 'Halaman menu seterusnya' });
  const previous = dialog.getByRole('button', { name: 'Halaman menu sebelumnya' });
  for (let i = 0; i < 3 && !(await button.isVisible()) && await previous.isVisible() && await previous.isEnabled(); i++) await previous.click();
  for (let i = 0; i < 3 && !(await button.isVisible()); i++) { if (!(await more.isVisible()) || !(await more.isEnabled())) break; await more.click(); }
  await button.click();
}
/** Direct taps on the authored dots are the primary input path. */
export async function tapDots(page, board = page.locator('.trace-board')) {
  const { dots } = await boardModels(page, board);
  for (const dot of dots) await page.mouse.click(dot.x, dot.y);
}
/** Opts in to the on-demand dot-pad popover for the rest of the attempt; safe to call when it is already on. */
export async function showDotHelp(page) {
  await openMenu(page);
  const dialog = page.getByRole('dialog', { name: /Menu permainan|Rehat sekejap/ });
  if (await dialog.getByRole('button', { name: 'Sembunyi bantuan titik', exact: true }).isVisible()) { await dialog.getByRole('button', { name: 'Tutup', exact: true }).click(); return; }
  await dialog.getByRole('button', { name: 'Bantuan titik', exact: true }).click();
}
/** Opens the teacher area from the header, or from the tracing menu while a lesson hides the header. */
export async function openTeacher(page) {
  const header = page.getByRole('button', { name: 'Ruang guru', exact: true });
  await expect(header.or(page.getByRole('button', { name: 'Menu permainan', exact: true }))).toBeVisible();
  if (await header.isVisible()) await header.click(); else await menuAction(page, 'Ruang guru');
}
