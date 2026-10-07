# Four-letter tracing appearance: delivery and verification

**Subsequent status:** the owner approved all four identified revisions with
**“yes I approve”**. They are promoted into student lessons; see
[approval and promotion verification](FOUR_LETTER_TRACE_APPEARANCE_APPROVAL.md).
The record below describes the preceding pending-review implementation stage
and retains that stage's content status, inputs and verification evidence.

6 October 2026, Asia/Kuala_Lumpur. The owner's **“procede”** authorised the
[implementation plan](FOUR_LETTER_TRACE_APPEARANCE_IMPLEMENTATION.md). The four
revised models are implemented as adult review candidates. Their teaching-content
review is pending; no geometry approval has been recorded.

## Delivered behaviour

Dal, Zal, Ra and Zai use outlines derived from the same bundled Noto Naskh Arabic
400 font used in Isi kandungan. Their tapered ends, body proportions and diamond
dots are preserved under uniform scaling. The previous constant-width rounded
guide is replaced for these candidates.

All three tracing modes display the new reference. Jejak Ceria colours accepted
progress inside that outline in the existing copper colour. Static 48-unit pieces
follow the nearest route arc; only the current piece receives a moving cut, so a
later bend cannot be coloured by a shortcut. Completion fills the full body.
Zal/Zai's diamond dot still requires the existing accepted tap or opted-in assisted
dot action. Full/section demonstrations and authored play results use the same
outline. Guided/precision ink and copying retain the learner's actual drawing.

The existing routes, direction, checkpoints, pen-lift policies, dot centres/hit
areas, movement order and matching tolerances are unchanged. Small target rings
mark the real anchors; detached number badges and labels are placed beside the
letter with leaders. Their placement searches the stage when nearby space is
crowded and prioritises marker separation. Fitting includes the full outline and
148 units of clearance without following the moving frontier.

The adult comparison screen has a **Jenis semakan** selector. **Langkah video**
retains the earlier seven proposals. **Bentuk Isi kandungan** shows these four
proposals, their originals and the catalogue glyph. Pending preview attempts save
their new revision and `preview: true`, without joining student lessons.

## Content review

| Letter | Approved student revision | Pending appearance revision |
| --- | ---: | ---: |
| Dal | 2 | 3 |
| Zal | 3 | 4 |
| Ra | 2 | 3 |
| Zai | 3 | 4 |

Review at **Ruang guru → Huruf → Semakan video · bandingkan cadangan → Bentuk
Isi kandungan → Semak [letter] cadangan**. Use the pager for all four; test the
start, bend/tail, finished body and dot, plus **Menu → Tunjuk cara**. The candidates
have `pendingReview` geometry and no reviewer. The current approved originals
remain available to students. Jejak Ceria remains the preschool default.

[AGENTS.md](../AGENTS.md) requires: **“A geometry change needs a new content revision
and fresh review”**. Explicit approval of the identified revisions is required
before promotion to `letters.json`; record the actual reviewer, date, scope and
revision then. No teacher assessment is inferred from implementation authorisation.

## Appearance evidence

`node scripts/verify-four-letter-outlines.mjs` renders a fresh font mask and each
outline under its recorded uniform transform. The acceptance threshold is 0.97
intersection-over-union, separately for glyph agreement and body reveal coverage.

| Letter | Outline/font ink overlap | Body/reveal-piece overlap |
| --- | ---: | ---: |
| Dal | 0.99636 | 0.99435 |
| Zal | 0.99631 | 0.99517 |
| Ra | 0.99594 | 0.99325 |
| Zai | 0.99567 | 0.99358 |

All four pass. The [comparison sheet](../output/verification/four-letter-outlines/catalogue-outline-comparison.png)
was inspected for body proportions, terminals and both diamond dots. These are
close visual matches, with small raster/contour antialiasing differences rather
than a claim of pixel identity. [Metrics](../output/verification/four-letter-outlines/appearance-metrics.json)
record the pending revision and font hash.

Contours are authored at 2400 pixels, with maximum simplification error 0.34375
logical units. Data total 23,131 bytes, with 9 body pieces each for Dal/Zal and
11 each for Ra/Zai. Authoring is offline; runtime tracing performs no font
rasterisation or contour extraction. Font provenance and transform are stored in
[fourLetterOutlines.json](../src/content/fourLetterOutlines.json). The existing
[Noto font licence](../public/fonts/NotoNaskhArabic-LICENSE.txt) is retained.

## Checks and recorded inputs

Checked in Node **24.19.0**, Playwright **1.63.0**, the existing Windows Chromium
and WebKit runtimes. `PLAYWRIGHT_BROWSERS_PATH` points to
`C:\Users\azrin\AppData\Local\ms-playwright`; `TEMP`/`TMP` use the project's
`tmp/vitest-runtime`. No dependency or browser installation was needed.

| Command/selection | Scope | Recorded result |
| --- | --- | --- |
| `npm test` | Current source, including candidate isolation, preservation, validation and uniform fitting | **179 tests / 20 files passed** after the final marker placement change. |
| `VITE_BUILD_ID=four-letter-outline-20261006 npm run build` | Content validation and production bundle | Pass; **37 models / 37 student-ready lessons**. Final assets `index-CZKgW3xL.js`, `index-DSx9W6Tg.css`. |
| `node scripts/verify-four-letter-outlines.mjs` | All four current outlines/font masks/reveal pieces | Pass; table above. Font, authoring data and transforms remain unchanged since this check. |
| `node scripts/build-outline-test-harness.mjs` | Separate pending-candidate Solo/Duo/result fixture | Pass; rebuilt from the final components. |
| `npx playwright test tests/browser/four-letter-outlines.spec.js --grep 'four outlines fit' --project=chromium --project=webkit --workers=2 --reporter=line,json --output=tmp/outline-markers-layout-final` | All four letters at 320×600, 768×1024, 1024×768, 1920×1080; settled stage, actual ink obstruction, clipping, overflow and inter-marker collisions | **8 passed** on the final bundle; [report](../output/verification/four-letter-outlines/markers-layout-final.json). |
| `npx playwright test tests/browser/four-letter-outlines.spec.js tests/browser/outline-matches.spec.js --grep-invert 'four outlines fit' --project=chromium --project=webkit --workers=2 --reporter=line,json --output=tmp/outline-markers-behaviour-final` | Four letters × three tracing modes; shortcut/dot gates, saved candidate revisions, touch cancellation/recovery, browser pen, full/section demonstrations, assisted diamond dots, copying, bounded lightweight rendering, Solo/Duo and authored result | **58 passed / 4 skipped**, no failures, on the final bundle; [report](../output/verification/four-letter-outlines/markers-behaviour-final.json). The skips are CDP-only native touch in WebKit; all four WebKit pen cases pass. |
| `npx playwright test tests/browser/outline-review.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json --output=tmp/outline-review-final` | Catalogue glyph, original/pending revisions, both preview buttons and pager separation for all four comparisons at 320×600 and 768×1024 | **4 passed**, no failures, on the final bundle; [report](../output/verification/four-letter-outlines/review-final.json). |

These final-bundle selections total **70 passed browser cases and 4 documented
skips**, with zero unresolved failures. Each case is counted once. Layout assertions
check all four letters across all four viewports. Representative phone/tablet/desktop
captures, play partial/completed states, Zai full/section demonstrations and the
comparison pages were visually inspected.
Representative captures:
[Zai phone tracing](../output/verification/four-letter-outlines/browser/Zai-start-320x600.png),
[Dal phone comparison](../output/verification/four-letter-outlines/browser/chromium-Dal-comparison-320x600.png),
[Zai tablet comparison](../output/verification/four-letter-outlines/browser/webkit-Zai-comparison-768x1024.png).
Comparison filenames identify their browser; tracing filenames are shared and
the later WebKit run can replace the corresponding Chromium image.

Earlier regression evidence is retained separately: Chromium's all-37 approved
student completion journey, wrong-start and strict-excursion cases, plus the three
existing video comparison layouts; WebKit's 320×600 video comparison also passes.
Their relevant approved-model, matching, audio and review-layout behaviour is
unchanged by the final candidate-only marker placement. The original broad commands were:

```text
npx playwright test tests/browser/four-letter-outlines.spec.js tests/browser/outline-matches.spec.js tests/browser/fix-video.spec.js tests/browser/strict-tracing.spec.js --grep 'outline|candidate|adult comparisons|all 37 current|wrong-start scribbles|excursion removes' --project=chromium --workers=1 --reporter=line,json --output=tmp/outline-chromium-final
npx playwright test tests/browser/four-letter-outlines.spec.js tests/browser/outline-matches.spec.js --project=webkit --workers=1 --reporter=line,json --output=tmp/outline-webkit-final
npx playwright test tests/browser/four-letter-outlines.spec.js tests/browser/fix-video.spec.js --grep '320x600|lightweight outline' --project=chromium --project=webkit --workers=2 --reporter=line,json --output=tmp/outline-affected-final
npx playwright test tests/browser/four-letter-outlines.spec.js --grep 'lightweight outline' --project=chromium --project=webkit --workers=2 --reporter=line,json --output=tmp/outline-copying-final
```

The [latest-case summary](../output/verification/four-letter-outlines/browser-outcomes.json)
records **78 distinct passes** across final and retained relevant regression
evidence (44 Chromium, 34 WebKit), plus 4 WebKit skips. It identifies which cases
ran on the final bundle; the older stage reports are not presented as an execution
of the final build. Reports retain the failures and follow-ups that resolve them.

Resolved issues during verification:

- The initial high-resolution font canvas clipped Zal's dot. Canvas bounds were
  enlarged and the outlines re-authored before the final appearance audit.
- The 320×600 video comparison extended 4.75 pixels into its pager. Compact
  spacing fixed it; the affected Chromium/WebKit follow-ups pass.
- WebKit's copying check first wrote before the board settled. It now waits for
  enabled controls and paint, then recomputes screen coordinates. Its endpoint
  comparison allows browser screen-pixel rounding and the existing tenth-unit
  export precision while verifying that freehand points are preserved. Copying
  application code did not need a change.
- Visual inspection found overlapping Zai follow/stop markers that the initial
  ink-obstruction test did not detect. The candidate placement search and collision
  priorities were corrected, and final layout checks also test marker-to-marker
  overlap after settling. All eight layouts and all affected tracing cases pass.

`node scripts/record-four-letter-inputs.mjs` records
[final input hashes](../output/verification/four-letter-outlines/inputs.json):
source/tests, final application JS/CSS, test-only harness, font/licence, authoring
transform plan/scripts, packages/config and all 37 recordings. It checks the
catalogue against Git HEAD and recordings against the previous video verification.
The final source diff passes the CRLF-aware `git diff --check`; the five affected
current documents have no missing local Markdown-link targets.

Browsers use `JAWI_STATIC_TEST=1` and
[the production-bundle fixture](../tests/browser/helpers/localTest.js) because
ordinary sandbox connections to localhost are denied. It fulfils local requests
from `dist`, including bundled fonts and media; normal browser/dev-server operation
is unchanged. This tests production behaviour, separately from the running Vite
development server at `http://127.0.0.1:5173/`. The previous server had stopped and
was restarted only after connection refusal; the page and current outline source
then returned HTTP 200. No second server was started alongside an existing listener.

## Files and preservation

- Appearance data/validation and pending candidates:
  [fourLetterOutlines.json](../src/content/fourLetterOutlines.json),
  [reviewCandidates.js](../src/content/reviewCandidates.js),
  [validateContent.js](../src/content/validateContent.js).
- Shared rendering:
  [outlineAppearance.js](../src/tracing/outlineAppearance.js),
  [liveRenderer.js](../src/tracing/liveRenderer.js),
  [TraceBoard.jsx](../src/components/TraceBoard.jsx),
  [LetterModelGlyph.jsx](../src/components/LetterModelGlyph.jsx),
  [ResultScreen.jsx](../src/screens/ResultScreen.jsx).
- Review/guides/layout:
  [VideoModelReview.jsx](../src/components/VideoModelReview.jsx),
  [numberedGuides.js](../src/tracing/numberedGuides.js),
  [NumberedTraceGuides.jsx](../src/components/NumberedTraceGuides.jsx),
  [screenLayout.js](../src/game/screenLayout.js),
  [letter-model.css](../src/styles/letter-model.css).
- Authoring/evidence:
  [author-four-letter-outlines.mjs](../scripts/author-four-letter-outlines.mjs),
  [glyph-geometry.mjs](../scripts/lib/glyph-geometry.mjs),
  [verify-four-letter-outlines.mjs](../scripts/verify-four-letter-outlines.mjs),
  [record-four-letter-inputs.mjs](../scripts/record-four-letter-inputs.mjs).

The student catalogue is byte-identical to Git HEAD: **37 approved geometry
entries and 37 approved audio entries**. All 37 recording bytes match the previous
video implementation fingerprints. Existing seven video proposals are preserved.
No student revision, approval history, storage module or recording was changed.

## Limits and next step

Physical tablet/phone or hardware pen behaviour, perceptual latency and audible
playback were not assessed by these desktop browser checks. Browser pen events are
synthetic; Chromium touch is native emulation through CDP. The Solo/Duo test-only
harness passes candidates directly to the actual components with fake audio;
it demonstrates rendering/input isolation without authorising student access or
proving recorded speech playback. It is separately bundled outside `dist` and
never imported by the application.

The four revisions await the owner's content review. Promotion requires the
identified approval record and affected validation, build and student-access
checks. The seven earlier proposals and physical-display questions retain their
separate [review record](FIX_VIDEO_CONTENT_REVIEW.md). No new APK, Android sync,
deployment, commit or push was requested or made for this appearance change.
