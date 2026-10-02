# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: strict-tracing.spec.js >> accepted jitter is actual raw ink within the displayed corridor on phone and desktop
- Location: tests\browser\strict-tracing.spec.js:88:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.scrollIntoViewIfNeeded: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=f3e3]:
  - link "Langkau ke kandungan" [ref=f3e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=f3e5]:
    - button "Taman Jawi, halaman utama" [ref=f3e6] [cursor=pointer]:
      - generic [ref=f3e12]:
        - text: Taman Jawi
        - generic [ref=f3e13]: TUMBUH BERSAMA HURUF
    - navigation "Navigasi utama" [ref=f3e14]:
      - button "Ruang guru" [ref=f3e15] [cursor=pointer]
      - button "Senyapkan audio" [ref=f3e20] [cursor=pointer]
      - generic "Profil Bunga" [ref=f3e24]: ✿
  - status [ref=f3e25]:
    - generic [ref=f3e26]: Pratonton dewasa · 12 model huruf · suara diluluskan
    - button "Tamatkan pratonton" [ref=f3e27] [cursor=pointer]
  - main [ref=f3e29]:
    - generic [ref=f3e30]:
      - button "Taman huruf" [ref=f3e31] [cursor=pointer]
      - generic [ref=f3e34]:
        - text: Kenal›Lihat›
        - strong [ref=f3e35]: Jejak
      - generic [ref=f3e36]: ✦ Satu langkah baharu
    - generic [ref=f3e37]:
      - complementary [ref=f3e38]:
        - generic [ref=f3e39]: MARI KENAL HURUF
        - heading "Ba" [active] [level=1] [ref=f3e40]
        - generic [ref=f3e41]:
          - generic [ref=f3e42]: ب
          - generic [ref=f3e43]: ✿
        - button "Dengar nama" [ref=f3e45] [cursor=pointer]
        - generic [ref=f3e49]:
          - generic [ref=f3e50]: "1"
          - generic [ref=f3e51]:
            - strong [ref=f3e52]: Dari bulatan hijau
            - paragraph [ref=f3e53]: Ikut arah anak panah. Angkat jari untuk setiap bahagian atau titik.
        - paragraph [ref=f3e54]: Berpandu · pilihan guru
        - paragraph [ref=f3e55]: Perlahan pun boleh. Kita cuba bersama.
      - region "Aktiviti menulis" [ref=f3e59]:
        - generic [ref=f3e60]:
          - generic: JOM JEJAK
          - img "Ruang jejak huruf Ba. Gunakan jari, pen atau tetikus." [ref=f3e61]:
            - generic [aria-hidden]:
              - generic:
                - generic: "1"
                - generic: 1 Mula
              - generic:
                - generic: "2"
                - generic: 2 Ikut
              - generic:
                - generic: "3"
                - generic: 3 Henti
          - status: Mula pada bulatan hijau.
        - paragraph [ref=f3e69]:
          - generic [aria-hidden] [ref=f3e70]: "1"
          - text: Mula di 1, ikut 2, berhenti di 3. Angkat jari sebelum bahagian seterusnya.
        - generic [ref=f3e71]:
          - button "Lihat cara" [ref=f3e72] [cursor=pointer]
          - button "Cuba lagi" [ref=f3e75] [cursor=pointer]
          - generic [ref=f3e78]: Jari · Pen · Tetikus
  - contentinfo [ref=f3e79]:
    - generic [ref=f3e80]: Dibuat untuk langkah kecil yang bermakna.
    - generic [ref=f3e84]: Kenal. Dengar. Jejak.
    - generic [ref=f3e85]:
      - generic [ref=f3e86]: Dibangunkan oleh
      - img "Hanana Academy" [ref=f3e88]
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import { dismissSplash, selectPractice } from './navigation.js';
  3  | 
  4  | export async function openLesson(page, label = 'Alif', mode = 'guided') {
  5  |   await page.goto('/'); await dismissSplash(page);
  6  |   await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  7  |   await page.getByRole('button', { name: 'Buka pratonton dewasa' }).click();
  8  |   if (mode !== 'play') await selectPractice(page, mode);
  9  |   await page.getByRole('button', { name: new RegExp(`^${label}(?:, pernah dijejak)?$`) }).click();
  10 |   await expect(page.locator('.start-dot')).toBeVisible();
  11 |   await page.locator('.trace-board').scrollIntoViewIfNeeded();
  12 | }
  13 | 
  14 | export async function boardModels(page) {
> 15 |   await page.locator('.trace-board').scrollIntoViewIfNeeded();
     |                                      ^ Error: locator.scrollIntoViewIfNeeded: Target page, context or browser has been closed
  16 |   return page.locator('.trace-board').evaluate(svg => {
  17 |     const matrix = svg.getScreenCTM();
  18 |     const screen = p => { const q = new DOMPoint(p.x, p.y).matrixTransform(matrix); return { x: q.x, y: q.y }; };
  19 |     return { scale: Math.hypot(matrix.a, matrix.b),
  20 |       strokes: [...svg.querySelectorAll('.reference-stroke')].map(path => {
  21 |         const count = Math.ceil(path.getTotalLength() / 6);
  22 |         return Array.from({ length: count + 1 }, (_, i) => screen(path.getPointAtLength(path.getTotalLength() * i / count)));
  23 |       }),
  24 |       dots: [...svg.querySelectorAll('.reference-dot')].map(dot => screen({ x: +dot.getAttribute('cx'), y: +dot.getAttribute('cy') })),
  25 |     };
  26 |   });
  27 | }
  28 | 
  29 | export async function movePoints(page, points) { for (const point of points) await page.mouse.move(point.x, point.y); }
  30 | export async function draw(page, points) {
  31 |   await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  32 |   await movePoints(page, points.slice(1)); await page.mouse.up();
  33 | }
  34 | 
```