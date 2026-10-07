# Ta and Za approval verification

7 October 2026, Asia/Kuala_Lumpur. The project owner replied **“proceed”** to
**“Approve Ta 6 and Za 6 for the normal game?”** after both actual comparisons.
See [the approval record](CONTENT_APPROVALS.md#approval-of-ta-and-za-original-curves-2026-10-07).

The normal game now uses the exact reviewed revision-6 candidates. Geometry,
dots, writing sequence and revision numbers were not changed during promotion;
only matching geometry approval metadata was added. The original-3 head/loop
and complete stem are translated 60 units left without reshaping. Tail finish
number 3 remains fixed, with a shortened final approach. Za's dot follows the
head. Superseded proposals 4 and 5 remain historical.

All 35 other catalogue entries and all 37 recordings/audio metadata are exact
matches to the preceding verified stage. Ga audio 7 remains active. All six
Semakan video scopes are empty, and all 37 lessons are student-ready. Old
attempts are retained; old revisions and adult previews do not complete the
current approved versions.

## Completed checks

| Check | Scope and result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/ta-za-approval/unit.json` | 215 passes in 28 files; exact promotion, current readiness/eligibility, revision-aware student progress, historical original-3 fixture and tracing regressions |
| `npm run build` | Passed, including catalogue validation: 37 valid models and 37 student-ready lessons. Build identity `ta-za-approved-20261007` |
| `node scripts/build-outline-test-harness.mjs` | Current shared Solo/Duo components bundled into the verification harness |
| `npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json` | 28 passes: 14 per engine, no failures, flakes or skips. Every movement/dot in all three modes, student saves/reload, stem demonstrations preserving earned progress, scored Solo/Duo lanes, matching approvals and all six empty review scopes |
| Existing local server | HTTP 200 at `http://127.0.0.1:5173/src/content/letters.json`; exact current catalogue, Ta/Za revisions 6 |
| `node scripts/verify-ta-za-approval.mjs` | Exact reviewed candidates and approval metadata, all other application source unchanged, other 35 entries preserved, all 37 original/packaged recording hashes preserved, current reports/build/server validated |

Browser checks use the production static fixture with the current build, Node
24.19.0 and Playwright 1.63.0. Normal play uses 320×600; guided/precision use
768×1024; review screens use 320×600 and 1280×800; matches use 1024×768. SVG
screen coordinates are recomputed before subsequent gestures after captures.
Inspected actual Chromium tablet completed letters, WebKit phone stem guides
for both letters, and the Chromium phone empty review screen: joined curves,
aligned dot, visible guides and page fit are correct.

Inputs, hashes and exact pre-promotion snapshots are recorded in
`output/verification/ta-za-approval/inputs.json`. Browser captures and reports
are in the same evidence folder. The preceding
[original-curve review](TA_ZA_ORIGINAL_CURVE_REVIEW.md) remains unchanged.
Tests adapted for current approval retain the original-3 models in a fixture;
their earlier preview test is preserved in the evidence folder.

Physical-device touch/pen was not tested. Audio is unchanged; controlled browser
instrumentation does not newly verify native audible playback. No APK,
deployment or publication was requested. Repeat verification only when affected
inputs change or a new concern appears.
