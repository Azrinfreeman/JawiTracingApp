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
