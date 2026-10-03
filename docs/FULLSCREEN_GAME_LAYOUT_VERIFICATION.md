# Fullscreen game layout — delivery and verification

**Delivered:** 3 October 2026, Asia/Kuala_Lumpur, after the user's “proceed”.
Scope follows [the approved implementation document](FULLSCREEN_GAME_LAYOUT_IMPLEMENTATION.md).

## Delivered behaviour

- The measured viewport contains the whole game. App pages, writing areas,
  collections and dialogs use fitted layouts or explicit pages rather than
  scrollable panels. Browser zoom remains available.
- Practice uses one large writing stage and a translucent bottom dock for the
  name, current cue, sound, navigation and tools. The complete letter is centred
  and uniformly fitted; later strokes and dots stay inside the same envelope.
  Completion preserves the position and size of the writing.
- The interactive book retains deliberate turns, reduced motion, closing page,
  saved completion stickers and save/discard/return protection for unsaved copies.
  Copying still saves coordinates in the original 1000 × 1000 frame.
- Solo and Duo use the fitted stage. Duo keeps equal upright stages, side by side
  in landscape and stacked in portrait. Resizing pauses the shared clock and
  cancels held input. Readiness, simultaneous contact checks, scoring and trophies
  retain their existing rules.
- Contents use measured pages and restore the filter and selected-letter page.
  Teacher tools use eight tabs; records and full details have page controls.
  Export still includes the complete store. Challenge setup has two short steps.
- Insufficient space shows fitted rotate/resize guidance. The global threshold
  is width below 320, height below 600, or width below 600 with height below 700
  CSS pixels. Duo also measures each real stage and requires at least 280 pixels
  in both dimensions. Global small-space fullscreen failures remain visible.
- Existing art, icons, fonts and recordings are reused. No dependency, teaching
  model, approval, recording, matcher tolerance or scoring change was required.

## Checks and evidence

Production preview at `http://127.0.0.1:4173` was reused; development remains at
`http://127.0.0.1:5173`. Checks ran on Windows with Node **v24.19.0**, Chromium and
WebKit, at most two Playwright workers. Browser reports retain exact command
arguments, test selections, viewports, outcomes and timings.

**Final total: 130 unique browser cases passed** (69 Chromium, 61 WebKit),
**four expected WebKit CDP skips, zero unresolved failures**. Repeated cases are
counted once using their latest checked outcome, rather than added to the total.

| Check | Scope and result | Evidence |
| --- | --- | --- |
| `npm test` | **87 passed**, eight test files. Includes six new fit/pagination checks alongside existing content, geometry, matcher, book, storage and race checks. | [Unit output](../output/verification/fullscreen-layout/unit.txt) |
| `npm run build` | Content validation and production compilation passed. All 37 models remain ready. | [Build output](../output/verification/fullscreen-layout/build.txt) |
| Main fullscreen browser suite | **42 passed** in Chromium/WebKit. Menus, all-letter containment, teacher paging, completion, copying, errors and equal Duo stages. | [Main production report](../output/verification/fullscreen-layout/final-layout.json) |
| Selected behaviour regressions | Initial selection: **54 passed, four expected skips**, six test-navigation failures. All six recovered in the scoped follow-up; no unresolved failure remains. | [Initial report](../output/verification/fullscreen-layout/regression.json), [follow-up](../output/verification/fullscreen-layout/regression-followup.json) |
| Scoped follow-up | **16 passed** in both browsers: recovered regressions, Ba/Mim numbered guides, demonstration/copy guide removal and small-space fullscreen failure. | [Follow-up output](../output/verification/fullscreen-layout/regression-followup.txt) |
| Race visual review | **Three passed, one expected skip**. Fresh racing, dot-placement, pause, round-result and trophy captures supplement the main layout evidence. | [Race report](../output/verification/fullscreen-layout/visual-race.json) |
| Extended viewports and panning | **20 unique cases passed** after scoped follow-ups. Extra tablet orientations and native 4K menus, letters and equal Duo stages; wheel/keyboard panning in both browsers and native touch panning in Chromium. | [Extended selection](../output/verification/fullscreen-layout/extended.json), [native 4K](../output/verification/fullscreen-layout/extended-4k-native.json), [final letter audit](../output/verification/fullscreen-layout/4k-envelope-final.json) |
| Protected input comparison | **84 files unchanged**, including teaching content, recordings/art, approvals, matching, storage, shared clock/reducer and scoring. | [Comparison](../output/verification/fullscreen-layout/protected-comparison.json) |

The regression selection covers book boundaries and duplicate turns, unsaved
copy exits, held input during turns/demonstrations, play pause/resume, invalid
starts and endpoint jumps, guided/precision invalid excursions, resize/capture
loss, dot-pad keyboard/drag behaviour and complex Sin/Kaf/Mim routes. It also
covers Android bridge navigation/pause/export handling, native emulated pen,
touch at different pixel densities, simultaneous Duo completion, lane isolation,
independent retry, shared clocks, stored attempts, combined export/reset and trophies.

The six initial failures were test paths: diagnostics moved into its tab, and
the letter selector advanced before the grid's first measurement. The helpers
now wait for the measured grid, support paging in both directions and open the
diagnostics tab. No application tracing behaviour was weakened to pass them.

Extended checks add 1280 × 800, 800 × 1280 and 3840 × 2160. The 4K WebKit entry
tests also exposed the splash helper's optional-click race with automatic entry;
it now accepts the already-dismissed splash instead of waiting for a removed
button. Initial WebKit 4K captures inherited DPR 2 (an 8K raster), which exceeded
the normal test budgets. Native 4K checks use DPR 1 via `JAWI_LAYOUT_DPR=1`; the
37-letter audit has a three-minute budget for its repeated rendering/captures.
Normal tablet WebKit checks retain DPR 2. These test-environment adjustments do
not change the application or its layout assertions.

The 300-attempt phone test reaches every retained record, reads full detail
fields and confirms a 300-record export. Copy testing compares the inverse SVG
matrix against the actual delivered pointer coordinates, accounting for browser
coordinate quantisation, rather than assuming a requested fractional coordinate
is delivered exactly.

## Visual review and input identity

Captures and assertions cover welcome, contents, teacher tabs/help/reset,
practice guides, demonstrations, dots, completion, copying, save/error dialogs,
closing page, Duo readiness/racing/shared turns, pause, results and trophies.
The main captures are in `output/verification/fullscreen-layout/`; additional
race states are in `visual-race/`. Screenshots remain local under the repository's
existing ignore rules. Visible controls and relevant panel contents are checked
for overflow and viewport containment.

Menu/catalogue/teacher journeys cover 320 × 740, 390 × 844, 1024 × 768,
768 × 1024, 1280 × 720, 1920 × 1080, 1280 × 800, 800 × 1280 and 3840 × 2160.
All 37 complete letter envelopes and initial guides are checked in both browsers
at seven of those sizes (390 × 844, both tablet orientations, 1920 × 1080 and
the three extended sizes): **518 letter/viewport inspections**. Duo has equal
stages at seven tablet/smartboard sizes and recovers from the 600 × 650 guidance
state. A 640 × 450 zoom-equivalent viewport checks global space guidance/recovery.
Wheel, ArrowDown and supported native touch panning leave the document and
visible panel bounds unchanged in welcome, contents, lesson/help and teacher/help.

The main 42-case layout run used `index-DuJ_B2dD.js` and
`index-Bsqr_XpW.css`. The only later application edit exposed the fullscreen
rejection message inside the small-space guidance. The rebuilt JavaScript is
`index-BXH_CpQi.js`, with unchanged CSS. Both browsers verify that branch in the
follow-up; the behaviour regressions and additional captures use the final build.
Earlier unaffected layout evidence is reused within this session.

Final [input fingerprints](../output/verification/fullscreen-layout/input-fingerprints.json)
record 168 source/test/content/dependency/configuration inputs and compiled
artifacts. The [verification summary](../output/verification/fullscreen-layout/verification-summary.json)
combines each unique browser case's latest outcome, retaining the failed initial
run as history rather than overwriting it. Documentation-only handoff edits do
not change the checked application build.

## Practical limits

The four final skips are WebKit cases requiring Chromium CDP for native emulated
touch; Chromium executes those journeys. Browser emulation does not establish
physical tablet, smartboard, stylus or pupil usability. No physical device
assessment is recorded. Firefox's previously recorded Windows `spawn UNKNOWN`
and the unsupported WebKit WAV fixture were not retried without changed conditions.

The signed Android 1.0.0 APK predates this layout. This request updates web source
and local preview; no new APK, commit/push, deployment or publication is included.
