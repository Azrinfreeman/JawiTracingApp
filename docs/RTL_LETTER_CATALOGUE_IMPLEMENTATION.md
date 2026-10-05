# Right-to-left letter catalogue (Alif to Ya) — implementation plan

Status: **applied 2026-10-05** (pager mirrored). Verification: RTL_LETTER_CATALOGUE_VERIFICATION.md.

## Request

On the letter catalogue ("Hari ini, huruf apa?"), cards currently run left to right: Alif is top-left, then Ba, Ta
and so on. Jawi/Arabic is read right to left, so Alif should be top-right and the sequence should continue leftwards,
row by row, down to Ya.

## What the code shows

- `src/screens/LetterGarden.jsx` renders the cards in data order (`visible.slice(offset, offset + capacity)`) inside
  `<div className="letter-grid">`. The data order is already the Alif-to-Ya catalogue order, so **no content or
  ordering change is needed**.
- `.letter-grid` is a CSS grid with `grid-template-columns: repeat(var(--grid-columns), …)` (`src/styles/fullscreen.css`
  line 57, with phone/tablet overrides in `app.css` at 2 and 4 columns, and up to 8 columns from `gridCapacity`). The
  page and grid have no `dir`, so the browser lays them out left to right.
- Each card's glyph is already `dir="rtl"`; card names, numbers and captions are Malay (left to right).
- `src/components/Pager.jsx` (the "← Sebelumnya … Seterusnya →" bar under the grid) is shared and hard-codes the
  arrows and button order.
- Pages are counted from `view.anchor / capacity`, so page 1 holds the first `capacity` letters; that does not change.

## Approach (recommended)

Use the browser's own right-to-left layout rather than reordering data or reversing arrays, so the DOM, keyboard Tab
order and screen-reader order stay Alif first and also match the visual order:

1. **Grid direction.** Add `dir="rtl"` to the `.letter-grid` element in `LetterGarden.jsx`. A grid in `rtl` starts
   column 1 at the right, so Alif lands top-right and rows fill leftwards. A short last row aligns to the right edge,
   as an Arabic page would. The same rule works at every column count (2, 4, 6 and up to 8) with no media-query change.
2. **Keep card internals unchanged.** Add `direction: ltr` to `.letter-card` so the number badge, sparkle, Latin name
   and caption keep their current layout. Only the card positions move. The Arabic glyph keeps its own `dir="rtl"`.
3. **Pager for the catalogue only.** Add an optional `rtl` prop to `Pager` (default false, so other screens do not
   change). With it, the Next button sits on the left with "← Seterusnya" and Previous on the right with
   "Sebelumnya →", matching a book read right to left. Accessible names (`Halaman huruf sebelumnya/seterusnya`) and
   the `1 / 3` counter stay the same.
4. **Everything else unchanged:** filters ("Huruf tersedia", "Huruf permulaan", "Semua huruf", "Huruf tambahan"),
   the progress card, mascots, the book lesson, and Jejak Ceria stay as they are.

### Not included unless you ask

- Mirroring the in-book page turn and the previous/next letter buttons inside a lesson.
- Any other letter lists (teacher screens, challenge pickers). A quick search for other letter grids will be done
  during implementation and reported, but they will not be changed without your say-so.
- Making the whole app right to left. The interface text is Malay and stays left to right.

## Tests

- New browser test (Chromium, plus Firefox/WebKit since it is layout): on the catalogue at phone, tablet and
  fullscreen sizes, the Alif card's right edge is greater than Ba's, Ba's greater than Ta's, the first card of row 2
  starts at the right edge like row 1, and the visual order read right-to-left, top-to-bottom equals the DOM order.
  Also checks the last short row and page 2 and 3 start at the right.
- Pager test: with `rtl`, Next is left of Previous and still advances one page; default Pager is unchanged.
- Run the specs that open the catalogue or click cards by position: `game`, `fullscreen-layout`, `book-layout`,
  `letter-batch-1/2/3`, `android-platform`. Note: `game` and `letter-batch-1/2/3` already fail (88 tests) with stale
  expectations unrelated to this work, so the comparison will be against the same failure list as before.
- `npx vitest run` and `npm run build`.
- Visual captures of the catalogue page 1, a middle page and the last page at 320, 768 and fullscreen widths.

## Risks

- Layout tests that assume left-to-right card positions may need their order assertions updated (reported, not hidden).
- `dir="rtl"` on the grid flips its text alignment for any bare text inside; cards reset to `ltr`, so nothing visible
  should change inside them, and the captures will confirm.
- The progress and filter rows above the grid stay left to right, so the screen is mixed by design: Malay UI
  left to right, the letters right to left.

## Decision for you

Mirror the catalogue pager too (recommended, step 3), or leave it as is and change only the card grid? I will do the
mirror unless you say otherwise.
