# Mim reference shape: approval and activation

Date: **12 October 2026**, Asia/Kuala_Lumpur.

The project owner replied **“approved”** directly to the pictured **Mim 6**
student-lesson approval question. Reviewer: **Project owner (Codex user; name
not supplied)**. This records owner approval, without claiming teacher review.
See the [approval record](CONTENT_APPROVALS.md#approval-of-mim-reference-shape-2026-10-12)
and the preserved [candidate-stage evidence](MIM_REFERENCE_REVIEW.md).

The exact reviewed Mim 6 is active in student lessons, cards, help and scored
Solo/Duo. Activation changes only Mim's geometry status and review metadata
relative to the reviewed candidate. Its open hooked head, defined shoulder,
flatter return, slender pointed tail, route, 16 reveal pieces, widths,
checkpoints, numbered guides and framing are unchanged. The continuous route
uses **1 Mula → 2 Ikut → 3 Siap**, with no dots or added lift.

The proposal expires after approval. New completed student work records
approved revision 6 and earns current progress; older revision-5 and pending
preview attempts retain their original records without receiving current
revision credit. The remaining 35 catalogue entries and all 78 audio files
match the preceding reviewed build exactly. All 36 lessons are ready.

## Completed verification

Evidence and final source/build fingerprints:
[integrity.json](../output/verification/mim-reference-approval/integrity.json).

| Check | Scope and result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/mim-reference-approval/unit-results.json` | **332 passed, 0 failed, 49 files**; current approval/readiness, historical candidate contracts, tracing, guides, storage and existing regressions. |
| `npm run build` | Passed, including content validation; all 36 lessons ready. JavaScript `index-BD58q4JP.js`; existing bundle-size warning remains. |
| `JAWI_OUTLINE_HARNESS_DIR=output/verification/mim-reference-approval node scripts/build-outline-test-harness.mjs` | Fresh harness using current approved content and actual match components for deterministic Solo/Duo verification. |
| `JAWI_STATIC_TEST=1 npx playwright test tests/browser/mim-reference-approval.spec.js --project=chromium --project=webkit --workers=2 --reporter=json` | **20 distinct passed, 2 skipped**, after the focused selector correction described below. Existing server `http://127.0.0.1:5173/`; phone, tablet and desktop viewports. |
| `node scripts/verify-mim-reference-approval.mjs` | Exact reviewed geometry; 35 other entries and 78 audio files exact; 36 ready; all review-candidate factories expired. |
| Existing server response | HTTP 200; served catalogue contains the Mim 6 approval reference. |

The initial browser run passed 18 cases and skipped two CDP-only cases. Two
help-dialog assertions selected mascot paths alongside Mim. The selector was
restricted to the Mim SVG, and only those two cases were rerun with
`--grep 'actual student card and help'`: both passed. The
[initial report](../output/verification/mim-reference-approval/browser-results.json)
and [focused recheck](../output/verification/mim-reference-approval/browser-glyph-recheck.json)
are retained; the integrity report combines distinct cases, without double
counting. Application/content inputs did not change during this correction.

Browser coverage includes normal student navigation, the actual card/help
glyph, Jejak Ceria, guided and precision practice, reversed-route rejection,
lift/resume, completion at the pointed tip, persisted approved credit and
historical/preview separation. Chromium native emulated touch and pen pass;
WebKit skips those two cases because they require Chromium CDP. Solo/Duo checks
use the current match components with deterministic approved Mim selection,
independent lanes, scored callbacks and completed results. They do not claim a
full random-selection challenge navigation test.

Relevant viewport captures were inspected for fit, clipping, guide spacing and
instruction clearance, alongside automated overlap and overflow checks:

- [Phone completion, 320 × 740](../output/verification/mim-reference-approval/browser/chromium-play-320-complete.png)
- [Guided tablet, 768 × 1024](../output/verification/mim-reference-approval/browser/webkit-guided-768-start.png)
- [Duo, 1024 × 768](../output/verification/mim-reference-approval/browser/chromium-duo-lane-0.png)
- [Student help](../output/verification/mim-reference-approval/browser/chromium-help.png)
- [Student cards](../output/verification/mim-reference-approval/browser/chromium-cards.png)

No physical Android-tablet performance or touch test was performed, and no new
APK was produced. Browser checks use the development server; the production
build was checked separately. Repeat applicable checks when their recorded
source, content, tests, dependencies or runtime inputs change, or when a new
concern appears.
