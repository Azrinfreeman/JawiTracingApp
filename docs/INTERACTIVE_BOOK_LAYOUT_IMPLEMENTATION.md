# Buku Jawi Saya — interactive book layout

Date: 2 October 2026  
Status: Implemented after the user's “proceeed”. The design below records the approved plan; the completion notes describe the delivered layout.

## Recommended layout

Make tracing feel like opening a personal storybook in the existing **Taman Kawan Ceria** world. On a wide tablet or smartboard, one open-book spread teaches one letter: a friendly reference page beside a generous writing page. On phones and portrait screens, show one writing page with a compact reference header. Children turn to the next letter with a large labelled page-turn control.

The supplied Alif screenshot has a clear writing surface, but the letter heading, instructions and bottom controls form a long vertical stack. The book layout brings those elements into a connected activity: identify the letter, hear it, trace it, earn a completion sticker, then turn the page.

Retain the large, steady writing area. Add the feeling of a book through its cover, spine, paper edges, bookmarks, page numbers and transition effects. Keep the colourful garden companions around the book rather than inside the tracing route.

## The student journey

| Stage | Proposed layout and interaction |
| --- | --- |
| Welcome | A cheerful garden entrance with a large “Jom mula” button. Keep the three character portraits. Present Solo and Duo as two prominent choices with short explanations; place adult detail further down. |
| Untimed Solo | A “Buku Jawi Saya” entry leads to the letter catalogue, presented as the book's contents. Children can open any available letter directly. |
| Contents | Keep the existing readable letter grid, decorated as chapter tiles. Distinguish “Pernah dicuba” from “Siap dijejak”. A clear contents button remains available inside the book. |
| Tracing | One letter per spread/page, its name and recording, the writing surface, current numbered instruction and compact tool shelf. |
| Completion | Keep the child in the same book composition. Show a flower sticker and “Hebat! Huruf Alif siap!” in the support area, with “Huruf seterusnya” as the prominent next action. |
| Next letter | A brief page-fold effect introduces the next letter. Its writing board appears upright and ready, with a new page number and the correct name/recording. |
| End of book | A friendly closing page shows the child's recorded practice progress and offers “Buka isi kandungan” and “Main lagi”. Do not silently wrap from the final letter to Alif. |
| Challenges | Use the same book identity in Solo and Duo, with page turns between completed rounds and the existing trophy results at the end. |

The catalogue order remains the order in `letters.json`. Existing student eligibility and teacher-preview rules determine which pages are available. The contents remain accessible; tracing one letter does not become a prerequisite for opening another.

## Open-book composition

### Wide tablet and smartboard: two pages, one letter

Recommended visual order: **writing page on the left, reference page on the right**, with a slim spine between them. This is the proposed book presentation; teaching strokes and glyph direction retain their authored behaviour. Malay interface labels remain in their natural reading order.

| Writing page — left | Reference page — right |
| --- | --- |
| Small “Jejak Ceria” heading | Letter name and large, upright reference glyph |
| Large square tracing paper | Big “Dengar” button |
| Current numbered instruction | “Tunjuk cara” and “Cuba lagi” tools |
| Separate dot controls when required | A resting leaf friend with one short encouragement |
| Completion feedback in reserved space | Page number and genuine completion sticker |

The bottom book rail contains **Huruf seterusnya** on the left, **Isi kandungan** in the centre and **Huruf sebelumnya** on the right. Labels communicate the action; arrows reinforce it. The book opens from the right, with the decorative fold moving toward the left for the next page. This direction is independent of writing strokes.

Use light cream paper, a green fabric-like cover, softly rounded corners, small flower bookmarks and subtle page stacks. The writing surface stays plain white with its existing grid and guide colours. Avoid a deep centre gutter, heavy paper texture or shadows across the letter.

### Phone and portrait tablet: one usable page

Collapse the reference page into a compact top strip: glyph, letter name, “Dengar” and page number. Place the writing paper immediately below it. Follow with the current instruction, any dot pad, a compact “Tunjuk cara / Cuba lagi” tool row, and the page-turn rail.

Keep the cover edge and bookmark so it still looks like the same book. Hide extra scenery and full mascot groups before reducing writing space. The global student header becomes compact while the book is open; move the large footer below the activity. Keep contents/home, sound and teacher access discoverable.

Size the book from actual available width and height, including tool rows and safe-area insets. Use a two-page spread only when a readable reference page and sufficiently large writing square both fit. Prefer a single page to a squeezed spread. Target a writing square of at least 280 CSS pixels where space allows, with larger boards on tablets; preserve the existing guide and dot target requirements.

On very short screens, allow controlled vertical scrolling rather than clipping guides or shrinking controls. Keep navigation in normal layout flow; do not float buttons over the writing paper. Recheck coordinates after scrolling or changing orientation.

## Turning pages

### Reliable controls first

- **Huruf seterusnya:** a large next-page button with a folded-corner illustration. Supporting text can say “Selak halaman”.
- **Huruf sebelumnya:** a matching back-page button; disabled at the first letter.
- **Isi kandungan:** returns to the book's letter list without inventing a completed attempt.
- **Keyboard:** normal Tab order and Enter/Space activation. Optional PageDown/PageUp shortcuts apply only when focus is in the book navigation, never while another control or dialog is active.
- **Optional edge gesture:** on layouts with a dedicated outer margin, a short drag that starts in that margin can turn the page. The labelled buttons remain the primary controls. Omit edge dragging on narrow layouts that cannot provide a comfortable separate target.

A tracing swipe must never turn a page. An edge gesture starts outside the writing SVG, guide/dot controls and tool buttons, commits only after a clear distance threshold, and cancels on an ambiguous/vertical movement or interrupted contact. Mouse and pen users can use the same labelled buttons.

### Proposed page-turn effect

Use a lightweight 300–400 ms CSS paper-fold overlay and a brief cover shadow. The overlay contains blank paper and small garden decoration, with no mirrored or distorted teaching glyph. The actual SVG board and its ancestors never rotate, scale or translate during a live attempt.

Input stops before a turn starts. The current letter changes once, then the new page settles before input is enabled. The fold cannot intercept writing gestures or create a fake completion. Reduced motion replaces the turn with an immediate page change and a clear updated heading.

Use a bounded completion fallback as well as the animation-end event: changing motion preferences, a missing animation event, hidden tab or interrupted rendering must not leave the book stuck. Cancel timers/listeners on unmount. Do not add a page-flip library for this effect.

## Practice rules and progress

Untimed practice supports free browsing. Children can move on before finishing, but the page receives no completion sticker and no successful attempt record. A visited page and a completed page have different visual marks.

An unfinished tracing page starts fresh when reopened in this first version. Do not add persistent partial-ink storage. Explain this briefly when leaving an unfinished page; stop demonstration audio and cancel the current contact cleanly. Blank-copy mode retains deliberate “Simpan untuk guru”; if there is unsaved copy ink, offer “Simpan”, “Keluar tanpa simpan” and “Kembali” before discarding it.

Completion remains based on the existing validated outcomes (`playComplete`, `guidedComplete`, `precisionComplete`). The book sticker reflects a valid record for the current profile, letter revision and relevant mode. Preview records do not become student achievements; saved free copies do not become validated tracing completions. Preserve the distinction between Solo practice and competitive results in all labels and records.

Save a successful attempt once at validation. Showing its sticker, turning pages, revisiting a page or changing layouts must not save it again. “Cuba lagi” starts a genuine new attempt through the existing retry mechanism. The book contains the selected eligible sequence for the session; page numbers describe letters, not physical left/right leaves.

Keep the current default catalogue entry and learning mode. Existing profile progress and teacher exports remain compatible. This proposal adds no currency, streak penalties, forced unlocks or new scoring model.

## Completion inside the book

Replace the separate full-screen practice success card with a completed state in the same book frame. Freeze the accepted writing, place the completion sticker in the reference/support area, and make “Huruf seterusnya” prominent. Preserve “Main lagi”, “Dengar nama”, copying and contents actions.

Reserve space for feedback so completion does not move the paper. On phones, use that support area below the board; on a spread, use the reference page. A small flower burst or mascot cheer can run there for up to 800 ms.

Do not turn automatically after a fixed delay. Let the child see what they finished and choose when to continue. Retain the existing contact-click protection: the final dot's released touch must not activate a newly shown page button. Require a fresh intentional contact for navigation and the next board.

## Solo challenge and Duo 1v1

**Solo challenge:** use a single compact book with the existing round/score/clock toolbar. Disable free previous/next browsing during live rounds. At a completed round, the existing “Pusingan seterusnya” action turns to the next scheduled letter.

**Duo:** each player has one compact writing-page frame, their portrait bookmark and score. Two full reference/writing spreads would crowd the screen, so use one page per player. Preserve equal upright boards, the shared letter, shared clock and current side-by-side/stacked layouts.

- A player who finishes gets a sticker and “Siap! Tunggu teman.” on their own page; their book stays on the shared letter.
- Both books turn together only after the existing round-complete/timeout condition and shared next-round action.
- Run the turn while the round clock is stopped. The next round enters ready/countdown only after both new boards are stable; neither player earns a timing advantage from animation.
- Keep “Saya sedia!”, “Berhenti”, “Sambung bermain”, dot pads, exit confirmation, small-screen space guidance and trophies.
- No page turns during countdown, a held tracing contact, pause/recovery or active competition. Pause keeps both books on the current letter and preserves accepted progress.
- Reduced motion gives both players an immediate, simultaneous page change with the same existing rules.

The page effect is presentation around the shared round transition. It must not drive deadlines, scoring or result timestamps.

## Input and state design

Separate the book's **reading / completed / turning** presentation state from the existing lesson state and match reducer. Add a small navigation controller for the selected sequence, current index and a single pending destination.

Before starting a turn: require no active writing/dot contact or demonstration; disable controls for concurrent turns; cancel stale pointer capture through the current board API; stop the letter recording; preserve/save only already validated outcomes. If another finger is tracing, ignore a navigation activation rather than moving the page under that finger.

During the turn: block all new board input and duplicate next/back activation. On completion: commit the target index once, mount the correct letter with a distinct activity/attempt identity, wait for stable layout, then restore input and move focus to the new letter heading. Announce “Huruf Ba, halaman 2 daripada 37” politely once; do not announce every animation frame.

Keep the persistent book shell across practice tracing and completion, while resetting only the letter activity when intentionally navigating/retrying. Reuse the existing contact guard and pointer cancellation; extend their integration only where the new navigation requires it. Resizing or losing visibility cancels a pending decorative gesture and restores a clear stable page. It never marks unfinished work complete or advances the catalogue twice.

## Files likely to change after authorisation

| File or area | Responsibility |
| --- | --- |
| [App.jsx](../src/App.jsx) | Eligible book sequence, selected page and navigation; preserve saving/preview rules and replace final-letter wrap with an end page. |
| [LetterGarden.jsx](../src/screens/LetterGarden.jsx) | Book contents presentation, selected sequence/filter handoff and accurate attempted/completed marks. |
| [LessonScreen.jsx](../src/screens/LessonScreen.jsx) | Stable book activity and responsive reference/writing/tool placement. |
| [ResultScreen.jsx](../src/screens/ResultScreen.jsx) | Reuse success content/actions within the book's completed state rather than a separate layout. |
| New `BookFrame.jsx` / `BookNavigation.jsx` | Cover/spine/edge decoration, labelled controls and bounded fold effect. |
| New `src/game/bookNavigation.js` if needed | Pure eligible sequence/index/boundary helpers, without altering the content validator. |
| [TraceBoard.jsx](../src/components/TraceBoard.jsx) | Reuse `enabled`, `cancel` and existing completion callbacks; only expose minimal gesture/demo state if necessary for safe navigation. Preserve geometry, matcher and guide behaviour. |
| [MatchScreen.jsx](../src/screens/MatchScreen.jsx), [RaceTracePane.jsx](../src/components/RaceTracePane.jsx) | Compact book frames and a shared visual turn between rounds, preserving independent input and clock transitions. |
| [WelcomeScreen.jsx](../src/screens/WelcomeScreen.jsx) | Clearer entry hierarchy and a playful book invitation using the current theme. |
| [app.css](../src/styles/app.css), [match.css](../src/styles/match.css), [playground.css](../src/styles/playground.css) | Available-space sizing, book/page styles, control placement and reduced motion. A small `book.css` can isolate the new layout. |
| Existing tests/helpers and current docs | Verify meaningful navigation/input transitions; record the implemented layout, tested build and limitations. |

Reuse the generated garden scene and native SVG companions. New cover, bookmark and paper-fold art can be native SVG/CSS. Additional generated artwork is optional after implementation authorisation; no new assets are needed merely to simulate the page turn.

Approved teaching shapes, dots, stroke order, content/audio revisions and approval records remain unchanged. Jejak Ceria remains the preschool default. Existing academy branding, recording controls and “Berhenti / Henti” wording stay consistent.

## Implementation sequence after approval

1. Establish the book frame and available-space rules, then check a wide spread and compact phone page with representative dotted/complex letters.
2. Add eligible sequence navigation and first/last-page behaviour, keeping the contents entry and current recording/save rules.
3. Integrate completion into the stable book shell with accurate stickers and preserved retry/copy actions.
4. Add the bounded fold effect and reduced-motion path; integrate pointer/demo guards, interruption recovery and keyboard focus.
5. Apply compact books and a synchronised between-round turn to Solo challenges and Duo; keep the existing round controller authoritative.
6. Refine welcome/contents hierarchy, verify the finished implementation and update affected current documentation. Preserve earlier evidence as history.

Once implementation is authorised, continue through completion and verification without repeated confirmation.

## Verification and acceptance

Use [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md), current [project state](PROJECT_STATE.md) and the [browser helpers](../tests/browser/helpers/). Historical theme/pause verification does not prove the new book navigation.

- Checked build once after final code changes, including content validation; applicable unit checks for navigation boundaries and existing save/round rules.
- Visual captures: contents, Alif, a complex multi-stroke letter, Nga's separate dots, completed sticker, turning page, final page, copy warning, Solo and Duo ready/live/pause/results.
- Layout coverage: 320 × 740 and 390 × 844 phones; 1024 × 768 and 768 × 1024 tablets; 1280 × 720 short display and 1920 × 1080 smartboard. Check landscape phone, 200% zoom, high pixel density and reduced motion.
- Native touch/pen/mouse and keyboard coverage: deliberate page turn, writing swipe that stays writing, a second contact on navigation, held final dot, rapid double-next, previous/revisit, demo interruption and lost capture. Recalculate SVG coordinates after layout or scrolling changes.
- Completion saved exactly once; skipped/uncompleted pages get no false sticker; current profile/revision/mode and preview separation stay correct; copy ink is not silently discarded.
- Resize, visibility change and missing animation-end event never leave controls stuck, duplicate navigation or move active ink. Headings/focus update once after a successful turn.
- Solo/Duo retain matched letters, equal board space, ready/countdown, shared pause, valid timing, dot controls and final awards. Neither player can advance independently or gain extra time through effects.
- Buttons remain labelled and large: at least 48 px secondary, 56 px primary and existing larger dot/smartboard targets. Paper remains square, guide labels readable and decoration outside input regions.
- Compare protected teaching, recording and rule inputs. Record the production build, selected checks, outcomes and captures, and report real-device/runtime limitations accurately.

The change is accepted when children can recognise the activity as their own alphabet book, trace comfortably, turn to another letter intentionally and see their real progress, while all existing learning and match rules remain correct. Physical smartboard/tablet and classroom feedback remain separate review steps.

## Current status

**Buku Jawi Saya is implemented.** Wide screens show writing on the left and a
reference page on the right. Compact screens use a letter header above the
square paper; on phones, the page-turn rail follows the writing area before
the reward and extra tools so “Huruf seterusnya” stays easy to reach.

The cover remains mounted when a child completes a letter. Accepted writing
stays in place, while the support area shows the saved result. Contents tiles
distinguish attempted and completed practice. The selected eligible catalogue
filter becomes the book sequence; its final page closes the book rather than
wrapping to Alif. Unfinished pages restart when reopened.

Labelled buttons and PageUp/PageDown within the navigation rail turn pages.
The optional edge-drag gesture was omitted: buttons provide a clear interaction
without adding another touch region beside the tracing paper. A 360 ms blank
paper fold supplies the book effect, with immediate reduced-motion navigation
and a 420 ms completion fallback. Active writing, held dots, demonstrations and
duplicate turns cannot advance the page. Unsaved copies use Save/Discard/Return
on book, home, teacher and preview exits.

Solo challenges and Duo use compact writing books. Both Duo frames turn on the
shared next-round action after the clock has stopped. The existing countdown,
timing, scoring and trophy rules remain authoritative. Recording playback uses
the consistent “Dengar” label throughout a practice page.

The implementation reuses the garden artwork and native companions. Teaching
content, recordings, their approvals, geometry and competitive rules are
unchanged. See [implementation verification](INTERACTIVE_BOOK_VERIFICATION.md)
for the tested production build, captures and device limitations.
