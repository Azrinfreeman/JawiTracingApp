# Ya smaller head: approval and activation

Date: **12 October 2026**, Asia/Kuala_Lumpur.

The project owner replied **“approve d”** directly to **“Approve this Ya 3 for
student lessons?”** after the pictured reference/current/proposed review.
Reviewer: **Project owner (Codex user; name not supplied)**. This records owner
approval, without claiming teacher assessment. See the
[approval record](CONTENT_APPROVALS.md#approval-of-ya-smaller-head-2026-10-12)
and the preserved [candidate-stage evidence](YA_SMALLER_HEAD_REVIEW.md).

The exact reviewed Ya 3 is active in student lessons, cards/help and scored
Solo/Duo. Activation adds only approved geometry status and matching review
metadata relative to the reviewed candidate. Head curves, bowl junction,
unchanged lower bowl, both dots, widths, checkpoints, touch policies, order,
framing, guides and instructions are exact. The head remains at 72% of the
preceding curve size; framing keeps the lower bowl and dots at their prior
scale. Trace the continuous body through **1 Mula → 2 Ikut → 3 Henti**, then
lift and tap **4 Titik → 5 Titik akhir** separately.

The proposal expires. New student completions record approved revision 3 and
earn current progress only after both dots. Older revision-2 and pending
preview attempts retain their original records without receiving current
revision credit. The other 35 catalogue entries, all 78 audio files and 476
protected existing reviewed inputs are exact; all 36 lessons are ready.

## Completed verification

Final source/build fingerprints and distinct totals:
[integrity.json](../output/verification/ya-smaller-head-approval/integrity.json).

| Check | Scope and result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/ya-smaller-head-approval/unit-results.json` | **342 distinct passed, 0 unresolved failures, 50 files**, after the focused historical-test correction below. Includes exact activation/readiness and preview expiry, head-only geometry preservation, scale, movement/dot order and existing regressions. |
| `npm run build` | Passed, including content validation; all 36 lessons ready. JavaScript `index-OaHaSlzY.js`; existing bundle-size warning remains. |
| `JAWI_OUTLINE_HARNESS_DIR=output/verification/ya-smaller-head-approval node scripts/build-outline-test-harness.mjs` | Fresh test-only bundle of current match/result components with the approved catalogue. |
| `JAWI_STATIC_TEST=1 npx playwright test tests/browser/ya-smaller-head-approval.spec.js --project=chromium --project=webkit --workers=2 --reporter=json` | **20 passed, two skipped**, no failures or flaky cases. Actual production `dist` is intercepted by the existing `localTest` static fixture at the configured localhost origin. |
| `node scripts/verify-ya-smaller-head-approval.mjs` | Exact reviewed Ya 3; 35 other entries, 78 audio files and 476 protected existing reviewed inputs exact; all 36 lessons ready and all candidate factories expired. |
| Existing development server | HTTP 200 at `http://127.0.0.1:5173/`; served catalogue contains the Ya 3 approval reference. Checked independently of static browser verification. |

The initial unit report contains 341 passes and one historical glyph-revision
failure expecting Ya 2. That historical assertion now uses the preserved Ya 2
fixture; the new activation assertion verifies current Ya 3 independently.
Only the affected file was rerun with
`npm test -- tests/game/glyphMatched.test.js --reporter=json --outputFile=output/verification/ya-smaller-head-approval/unit-recheck-results.json`;
it passed. Both [initial results](../output/verification/ya-smaller-head-approval/unit-results.json)
and the [focused recheck](../output/verification/ya-smaller-head-approval/unit-recheck-results.json)
are preserved; the integrity report merges distinct cases without double
counting. Application inputs did not change during the test correction.

Browser coverage includes normal student navigation in Jejak Ceria, guided
and precision practice at phone/tablet/desktop sizes; exact card/help model
and dots; reversal rejection; lifted tracing; completion after both separate
dots; saved approved credit and preserved historical/preview records. Chromium
native emulated touch and pen pass; WebKit skips those two CDP-only cases.
Deterministic approved Ya selection in actual Solo/Duo components verifies
independent lanes, scored callbacks and completed results with two dots. It
does not claim full random-challenge navigation coverage.

Captures were visually inspected alongside fit, guide-overlap, instruction
clearance and page-overflow assertions:

- [Phone start, 320 × 740](../output/verification/ya-smaller-head-approval/browser/chromium-play-320-start.png)
- [Guided tablet final dot, 768 × 1024](../output/verification/ya-smaller-head-approval/browser/webkit-guided-768-dot-2.png)
- [Scored Duo, 1024 × 768](../output/verification/ya-smaller-head-approval/browser/chromium-duo-lane-0.png)
- [Student cards](../output/verification/ya-smaller-head-approval/browser/chromium-cards.png)
- [Student help](../output/verification/ya-smaller-head-approval/browser/chromium-help.png)

No physical Android-tablet test or new APK was produced. Repeat applicable
checks when their recorded content, source, tests, dependencies, assets or
runtime change, or when a new concern appears.
