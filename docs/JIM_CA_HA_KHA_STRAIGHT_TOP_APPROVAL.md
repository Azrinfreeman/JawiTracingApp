# Approved straight tops for Jim, Ca, Ha (ح) and Kha

The owner replied **“approve”** on **11 October 2026**, Asia/Kuala_Lumpur, to the
explicit four-revision approval question after seeing the review sheet.
**Jim 5, Ca 4, Ha (ح) 4 (`ha-pedat`) and Kha 4** are now active in normal
student lessons and scored Solo/Duo challenges.

Each top is horizontal, traced from left to right through **1 Mula → 2 Ikut →
3 Henti**. After lifting, the original bowl starts at 4; the original dots
follow. Promotion adds only `geometry.status: approved` and the matching owner
review record to the exact candidates. Reviewed paths, dot targets, order,
widths, checkpoints, versions and all recordings are preserved. Jejak Ceria
remains the default. Ha (ه) is unchanged.

The four obsolete adult comparison cards expire automatically. All 36 lessons
are ready, and all 11 review scopes are empty. Older attempts remain stored;
their earlier revisions and preview records cannot complete the new student
models. New ordinary completions record the approved revision and status.

Approval provenance: [owner record](CONTENT_APPROVALS.md#approval-of-jim-ca-ha-and-kha-straight-tops-2026-10-11).
The [preceding review and its evidence](JIM_CA_HA_KHA_STRAIGHT_TOP_REVIEW.md)
remain historical records of the preview stage.

## Verification

Completed unit check: `npm test -- --pool=threads --maxWorkers=2 --reporter=dot`
with workspace-local `TEMP`/`TMP`: **268 passes / 42 files**. Historical Jim/video
and glyph-stage assertions use preserved original fixtures; the new approval
check verifies the exact promoted models, current provenance and eligibility.

Completed `npm run build`: content validation reports **36 letters / 36
student-ready lessons**. Production bundle is `index-Cb7TwXMy.js`, stylesheet
`index-DbweFF8G.css`. A fresh separate test harness was built with
`JAWI_OUTLINE_HARNESS_DIR=output/verification/jim-family-straight-top-approval`
and `node scripts/build-outline-test-harness.mjs` for scored Solo/Duo cases.

`npx playwright test tests/browser/jim-family-straight-tops.spec.js
--project=chromium --project=webkit --workers=2 --grep-invert 'demonstrations:|wrong-end'`
passed **54 distinct cases**, with **four expected WebKit skips** for Chromium
CDP touch emulation. This covers all four ordinary models in play/guided/
precision, every bowl and dot, release and approved saves, review expiry,
old/preview record retention, saved revision handling, independent scored
Solo/Duo lanes, results and Chromium touch. Viewports: phone **320 × 600**,
tablet **768 × 1024**, desktop **1280 × 800**, and scored lanes **1024 × 768**.
No unresolved failures in that selection.

After strengthening the saved-revision cases, the targeted follow-up
`npx playwright test tests/browser/jim-family-straight-tops.spec.js --project=chromium --project=webkit --workers=2 --grep 'saved.revisions:'`
passed **eight cases**. It verifies that old/preview records award zero completed
letters and no lesson badge, then a new ordinary completion awards one letter
and the badge after reload, while retaining both older records. These repeat
eight of the 54 distinct cases and are not counted twice.

Prior demonstration/reversal/recovery evidence is preserved in the preceding
review: paths, cues, renderer, matcher and input policies are unchanged by
approval. The selection above exercises the new student/scoring eligibility
and saved approval/version state rather than repeating those unchanged checks.

`node scripts/verify-jim-family-straight-top-approval.mjs` confirms exact reviewed
models with current approval provenance, **32 unrelated entries preserved**,
**80 audio-tree files preserved**, **36 ready lessons**, **11 empty review
scopes** and **246 source/test/build/fixture input fingerprints**.
See [verification.json](../output/verification/jim-family-straight-top-approval/verification.json).

Current student start, mid-top, top-complete and finished captures plus review
expiry and scored results are in
`output/verification/jim-family-straight-top-approval/browser/`. Inspected phone,
tablet/desktop and Duo captures show the requested straight route, retained
bowls/dots, unobscured guide numbers and current ordinary presentation without
the preview banner. Automated bounds checks find no clipped paths/guides or
page overflow in the selected lesson captures.

## Limits

Tests use Windows, Node 24, installed Chromium/WebKit and the existing
`JAWI_STATIC_TEST=1` fixture serving the production bundle. Browser processes
use `PLAYWRIGHT_BROWSERS_PATH=C:/Users/azrin/AppData/Local/ms-playwright`.
Controlled audio lifecycle checks do not claim a new native audition; audio
files are preserved. Physical tablet/smartboard testing remains unverified.
No APK was requested; existing APK 1.0.9 predates these changes.
