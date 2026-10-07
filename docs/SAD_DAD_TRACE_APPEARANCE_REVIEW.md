# Sad and Dad catalogue shape review

Prepared 7 October 2026 (Asia/Kuala_Lumpur), following the owner’s instruction
“yess now you see it, fix them”. This authorises implementation of the correction;
approval of the pictured revision-3 teaching content remains pending.

## Correction

Sad 3 and Dad 3 use contours extracted from the exact bundled Noto Naskh Arabic
400 font used by Isi kandungan. This replaces the oversized round head, prominent
round join and deep bowl with the catalogue proportions, tapered ends and Dad’s
diamond dot. The head and bowl are partitioned into separate reveal regions;
completed ink is clipped to the actual font silhouette.

Both retain two movements: head loop, lift, then join/tooth and bowl. Dad’s dot
comes last. Routes are fitted to the font centreline and Dad’s tap target is
aligned with its actual dot. Both audio revision-2 records are unchanged.

Candidates are separate adult-only entries in **Ruang guru → Huruf → Semakan
video → Bentuk Sad dan Dad**. Normal lessons retain approved revision 2 pending
approval. All 36 catalogue entries and 37 previous recording files are exact.
No teacher assessment is implied.

## Verification

- Complete unit suite: **247 passed, 38 files**, no failures. Command:
  `npm test -- --maxWorkers=2 --reporter=json --outputFile=output/verification/sad-dad-outline/unit.json`.
  TEMP/TMP point to the task-local temporary directory.
- Checked production build: `VITE_BUILD_ID=sad-dad-outline-review-20261007 npm run build`.
  Content valid; 36 student-ready entries. Existing bundle-size advisory remains.
- Actual high-resolution font/contour comparison:
  `node scripts/measure-sad-dad-outlines.mjs`.
  Sad overlap 0.996417; Dad 0.996382. Full reveal coverage exceeds 0.9948;
  all sampled route points are inside the actual ink. The slight raster comparison
  difference comes from contour simplification and antialiasing, not alternate proportions.
- Chromium and WebKit: **28 browser cases passed** across play/guided/precision,
  each movement and dot, phone 320×600, tablet 768×1024 and desktop 1280×800,
  partial reveal, demonstration preservation, student/preview separation and
  independent unscored Solo/Duo lanes. Command:
  `npx playwright test tests/browser/sad-dad-outlines.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`.
  Uses `JAWI_STATIC_TEST=1` and the installed browser path. Separate current
  match harness built with `JAWI_OUTLINE_HARNESS_DIR=output/verification/sad-dad-outline`.
- Running local server at http://127.0.0.1:5173/ serves the exact proposal JSON
  and new review controls. Production browser checks use the static fixture;
  live source is checked separately. No new server started.

Phone Sad start, tablet completed Sad, phone completed Dad and tablet Dad dot
captures were inspected. Mouse automation does not establish physical-device
touch/pen behaviour. Unit matcher checks cover all three pointer profiles.
Audio is unchanged and has no new audible assessment.

Evidence: `output/verification/sad-dad-outline/inputs.json`, saved before-catalogue,
exact reviewed proposals, unit/browser reports, appearance metrics and captures.
The previous Nya approval reports remain historical and unmodified.

## Remaining

Owner approval of the pictured Sad 3 and Dad 3, then exact promotion with a matching
revision/date/reviewer record and affected student checks. This follows AGENTS.md:
“A geometry change needs a new content revision and fresh review.” No deployment,
APK, audio change or publication is requested.
