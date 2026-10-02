# Taman Ceria UI verification

Implemented on **2 October 2026**, following the user's “proceed” authorisation
of [the UI implementation plan](UI_THEME_REVAMP_IMPLEMENTATION.md).

## Implemented scope

- Shared semantic colour tokens, local typography, readable spacing, white
  learning surfaces, visible keyboard focus and large labelled controls.
- Splash, welcome, local profiles, garden catalogue, lessons, results, teacher
  panels, audio review, preview banners, notices and reset confirmation.
- Refreshed native SVG garden scene and leaf companion. No added dependency or
  remote runtime asset.
- Two catalogue columns on phones, four on tablets and six on wide screens.
  All 37 lessons remain available; the original 12-letter pilot filter remains.
- Square tracing paper with mode, device hint, feedback and instructions outside
  its SVG. Celebration occupies reserved normal page flow below the paper.
- Distinct assisted play, actual strict ink and blank copying. Jejak Ceria remains
  the default. Controls and status labels keep their existing meaning.
- Supplied Hanana Academy logo and its fallback, aspect ratio and independent
  1.8-second splash deadline retained.
- Narrow header keeps the visible “Guru” label with the accessible name “Ruang
  guru”. Fallback preview copy derives model and lesson counts from the catalogue.

Presentation changes live in `src/styles/theme.css` and the consolidated
`src/styles/app.css`. Structural changes are limited to `App.jsx`, the welcome,
lesson and result markup, `TraceBoard.jsx`'s render section and the decorative SVGs.
The result markup groups its leaf and letter side by side, with next/replay
actions before audio. The next-letter button fits the initial 320-pixel phone view.
Other screens inherit the shared styles without replacing their callbacks.

## Preservation evidence

[The pre-change fingerprint](../output/verification/ui-theme-before.json)
contains 85 protected files: content and validator, tracing/audio/storage modules,
public recordings and branding, the original supplied logo and package files.
Their exact preservation is checked by
[the production verification script](../scripts/verify-ui-theme.js).
Geometry, ordering, coordinates, versions and content/audio approvals are not
changed by this implementation. No progress migration or reset is performed.

## Checks and evidence

Final checks passed. The following evidence is scoped to this UI implementation;
the overlapping browser selections are follow-up checks, not added unique totals:

| Check | Scope | Evidence |
| --- | --- | --- |
| `npm test` | **59 passed**; unit/content, matcher, audio and progress modules | [Unit output](../output/verification/ui-theme-unit.txt) |
| `npm run build` | Passed; **37 valid, student-ready models** and final production bundle | [Build output](../output/verification/ui-theme-build.txt) |
| Chromium / WebKit broad regression | **326 passed, 10 expected skips, 0 failures**; branding, navigation, play/strict input, all authored letters, guides, copying, export, reset and audio control/error presentation | [Browser results](../output/verification/ui-theme-browser.json), [tested inputs](../output/verification/ui-theme-regression-inputs.json) |
| Follow-up after primary-height correction | **50 passed, 2 expected audio skips, 0 failures**; branding, navigation, audio controls, teacher/reset, square board and zoom-equivalent reflow | [Control results](../output/verification/ui-theme-final-controls-browser.json) |
| Final follow-up after result layout | **34 passed, 0 skipped/failed**; UI, game, student-access and zoom cases in both browsers; next-letter visibility on a 320-pixel phone | [Final browser results](../output/verification/ui-theme-final-browser.json) |
| `node scripts/verify-ui-theme.js` | Passed; final production Chromium at `http://127.0.0.1:4173`, **85 protected files unchanged, 80 captures, 6 student completions, 5 saved copies, 0 page errors or external runtime requests** | [Final production evidence](../output/verification/ui-theme-final-production.json) |

Broad command: `npx playwright test --project=chromium --project=webkit --workers=2
--grep-invert "all 37 active local recordings decode" --reporter=list,json`.
This deliberately excludes a repeated decode audit of unchanged recordings.
The unit inputs (content/tracing/audio/storage and their unit tests) did not change
after their successful run. The final build was repeated after presentation edits.

The broad run covers every model in play and guided practice, and all 25 extended
models in precision practice, with representative pilot precision/input checks.
Its ten skips are two WebKit successful-audio cases and eight Chromium-CDP-only
touch cases. These limitations are separate from passing native pointer checks.

After the broad run, application changes were confined to two primary-button
minimum heights and the result's presentation/order. Their affected controls,
result, navigation, copying, teacher/audio and viewport checks were rerun. Final
production evidence fingerprints the final source, tests, dependencies and bundle;
the broad input record retains its earlier tested scope.

Follow-up commands use `npx playwright test` with the same two projects,
`--workers=2 --reporter=list,json`. The height follow-up selects
`ui-theme.spec.js`, `ui-zoom.spec.js`, `game.spec.js`, `audio-approval.spec.js`,
`branding.spec.js` and `draft-audio.spec.js`, excluding the unchanged decode
audit. The final result follow-up selects the first four of those files without
the decode filter. All named files are under `tests/browser/`.

The five production viewports are **320 × 740**, **390 × 844**, **768 × 1024**,
**1280 × 900** and **844 × 390**. Captures cover entry, catalogue, tracing,
pause/recovery, all three Nga dot stages, copying, results, teacher/audio review
and reset confirmation, with additional Qaf-loop and guided/precision examples.
SVG coordinates are measured again after scrolling or capture.

Visual inspection covered the final 320-pixel result and dot states, 390-pixel
welcome/copy/Qaf/demo screens, 768-pixel tracing recovery and teacher panels,
1280-pixel welcome/catalogue/precision views and the 844 × 390 writing board.
All five journeys have no page overflow. Short landscape supports vertical
scrolling while retaining a 300-pixel square board.

Representative captures: [welcome](../output/screenshots/ui-theme-final-welcome-1280x900.png),
[phone result](../output/screenshots/ui-theme-final-result-320x740.png),
[tablet recovery](../output/screenshots/ui-theme-final-nga-pause-768x1024.png),
[Qaf's second stroke](../output/screenshots/ui-theme-final-qaf-stroke-2-390x844.png)
and [teacher panels](../output/screenshots/ui-theme-final-teacher-768x1024.png).

Rendered contrast/focus assertions check normal text, primary buttons, supporting
copy, control borders and keyboard focus. Token colour ratios against their
specified backgrounds are 12.58:1 for main text, 5.52:1 for supporting text,
5.39:1 for the primary action, 3.58:1 for control borders and 5.44–6.43:1 for
numbered guide roles on white. Start markers and decorative numbered badges keep
their existing visual minimums; authored hit regions are unchanged.

## Repairs during verification

The first UI run found a WebKit percentage-height difference that made the SVG
two pixels taller than its width. The SVG now uses its intrinsic square aspect
ratio with automatic height. The focused square and keyboard-dot cases passed
after this correction.

A recovery test reused coordinates after clicking Retry scrolled the page.
It now remeasures the board after each retry. Shared coordinate reads wait for
paint after scrolling, which also lets WebKit refresh its screen CTM. The native
recovery check then passed; tracing-engine behaviour was not changed.

Final visual review brought the saved-copy and adult-preview primary actions to
56 pixels, then compacted the result illustration and moved next/replay before
audio. Fresh follow-up checks and final production captures verify those changes.

The initial failed checks remain in their dated UI reports and are superseded
only within the scopes of the final checks.

## Material limits

Firefox is not rerun: this unchanged Windows runtime previously failed to launch
with `spawn UNKNOWN`. WebKit's recorded audio codec limitations remain; skipped
successful-playback checks do not establish playback there. Native emulated
touch uses Chromium CDP and does not prove WebKit touch. Physical tablet/stylus,
pupil assessment and a named teacher content review remain outside this UI task.
The reflow case emulates zoom's available CSS space; it does not operate a
physical browser's zoom menu. These checks are not a complete WCAG audit.

Repeat verification when relevant application, tests, content, assets, dependencies,
runtime or build inputs change, or an unresolved concern warrants it. Final
production evidence fingerprints the source, tests, dependencies and bundle.
