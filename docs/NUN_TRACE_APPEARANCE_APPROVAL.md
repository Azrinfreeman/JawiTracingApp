# Nun catalogue-outline approval verification

7 October 2026, Asia/Kuala_Lumpur. The owner replied **“approve”** to
**“Approve Nun 3 for the normal game?”** after seeing the actual catalogue/Nun-3
comparison. See [approval](CONTENT_APPROVALS.md#approval-of-nun-catalogue-outline-2026-10-07).

Normal lessons and scored challenges now use the exact reviewed revision-3 model:
catalogue-font bowl, tapered ends and diamond dot. Promotion changes only geometry
approval status/review; contours, routes, writing order, touch targets, audio and
revision number are retained. All 36 other entries and all 37 recordings/audio
metadata remain exact. The previous Nun proposal expires; all six review scopes
are empty, and all 37 lessons remain ready. Old attempts stay stored; old revisions
and adult previews do not complete current approved Nun 3.

## Completed checks

- `npm test -- --reporter=json --outputFile=output/verification/nun-approval/unit.json`:
  initial 223 passes and one historical glyph-stage check expecting Nun 2. That
  comparison now uses the preserved genuine Nun-2 fixture. Recheck:
  `npx vitest run tests/game/glyphMatched.test.js --reporter=json --outputFile=output/verification/nun-approval/unit-recheck.json`:
  all seven cases pass. Combined: **224 distinct unit passes in 31 files**, 217
  unchanged initial cases plus seven rechecked cases. New approval tests check
  exact reviewed-model promotion, eligibility, scope expiry and revision-aware
  progress in all three modes; historical preview tests retain their own fixture.
- `VITE_BUILD_ID=nun-outline-approved-20261007 npm run build`: passes, including
  content validation of 37 models and 37 student-ready lessons.
- `JAWI_OUTLINE_HARNESS_DIR=output/verification/nun-approval node scripts/build-outline-test-harness.mjs`:
  current shared Solo/Duo components bundled into the verification harness.
- `npx playwright test tests/browser/nun-outline.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **18 passes**, nine per engine, no failures, flakes or skips. All three student
  practice modes, partial reveal, wrong finish-start rejection, dot-last gate,
  approved revision saves/reload, demonstrations preserving earned progress,
  scored independent Solo/Duo lanes, matching teacher approval and six empty
  review scopes pass. Play: 320×600; guided/precision: 768×1024; desktop fit:
  1280×800; teacher review: 320×600/1280×800; matches: 1024×768.
- Existing local server: HTTP 200 for the exact approved catalogue, Nun geometry
  3, audio 2 and catalogueOutline appearance. No duplicate server.
- `node scripts/verify-nun-approval.mjs`: exact reviewed candidate and owner
  metadata, 36 preserved entries, unchanged application source, all 37 original/
  packaged audio hashes, build, server and combined current evidence validated.

Actual Chromium phone completed outline, WebKit tablet guided reference/ink,
Chromium desktop guide fit and phone empty review screen were inspected. SVG
coordinates are recomputed after captures and scrolling. Node 24.19.0,
Playwright 1.63.0, current production bundle via the static fixture. Final
fingerprints and snapshots: `output/verification/nun-approval/inputs.json` and
adjacent reports/captures. The preceding
[appearance review](NUN_TRACE_APPEARANCE_REVIEW.md) remains unchanged; its font
metrics still apply because the exact reviewed contours were preserved.

Physical-device touch/pen and native audible playback were not newly tested.
Audio is unchanged. No named teacher assessment, APK, deployment or publication
requested. Repeat checks only if affected inputs change or a new concern appears.
