# Right-to-left letter catalogue — verification (2026-10-05)

Changes: `src/screens/LetterGarden.jsx` (`dir="rtl"` on `.letter-grid`, `rtl` on the pager), `src/components/Pager.jsx`
(optional `rtl` prop: reversed order, flipped arrows, counter kept left-to-right; default unchanged),
`src/styles/fullscreen.css` (`.letter-card { direction: ltr }`, no-wrap pager buttons on the catalogue page only).
Data order, content and lessons are unchanged.

| Check | Result |
|---|---|
| New `tests/browser/rtl-catalogue.spec.js` (Chromium): 320x740, 768x1024, 1280x800, 1920x1080 | 4 passed: Alif is the top-right card, Ba and Ta continue leftwards, every new row starts at the right edge, DOM order stays Alif first, the number badge stays on each card's left |
| Same spec, pager test | passed: Next is left of Previous, labels `Sebelumnya →` / `← Seterusnya`, one page per click, page 2 also starts at the right, counter `n / total` |
| `fullscreen-layout.spec.js` | passed (11 tests) after the no-wrap rule was scoped to the catalogue page; the first attempt applied it to every pager and overflowed the 320 px teacher pages, which the spec caught |
| `npx vitest run`, `npm run build` | passed |
| Wider Chromium run (game, book-layout, android-platform, letter-batch-1/2/3, low-spec-performance, numbered-guides, solo-duo) | no new failures: the same 88 (`game` 6, `letter-batch-1/2/3` 82) and `book-layout` 1 fail as before, from stale expectations unrelated to this work |
| Visual captures | `output/verification/rtl-catalogue/*.png` checked at 320 and 1280 |

Not run: Firefox/WebKit, a real Android device. No other letter grids were changed (teacher and challenge pickers were
not searched beyond the catalogue; they were out of scope).
