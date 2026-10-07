# Sin and Syin: approved higher tails

6 October 2026, Asia/Kuala_Lumpur. The owner replied **“approved”** to the explicit
question **“Approve these pictured shapes for the normal game?”** after seeing
the actual before-and-after boards. **Sin 2 and Syin 3 now appear in regular
student lessons**, with matching project-owner geometry review records.
See [approval record](CONTENT_APPROVALS.md#approval-of-sin-and-syin-tails-2026-10-06).

The exact reviewed paths are promoted. Their left tip rises from (185,550) to
(185,510), remaining 95 logical units below the adjacent peak. No further path
edit or content-version increment occurs during promotion. All preceding
segments, final control point, direction, checkpoints, one continuous movement,
guide widths and audio match the pictured candidates. Sin has no dots; Syin
retains all three with the original positions and body-before-dots sequence.

All 35 unrelated entries, every audio manifest and the 37 recordings remain
unchanged, including Ga's complete supplied audio revision 7. All 37 letters
remain student-ready. Obsolete Sin/Syin preview cards expire through the existing
revision gate. The four independent Mim/Ta marbutah/Hamzah/Jim proposals remain
outside this approval. Prior attempts stay stored; old revisions and previews
do not count as completion of the approved revisions.

## Verification

The reviewed source fingerprints were checked before promotion. The approval
integrity checker compares the whole catalogue with the preceding reviewed
candidates plus only their approval metadata. It also checks all renderers,
audio metadata/recording hashes, packaged recordings and unrelated proposals.
Historical [review evidence](SIN_SYIN_TAIL_REVIEW.md) is preserved; its test
source was copied before adapting current checks to student lessons.

- `npm test -- --reporter=json --outputFile=output/verification/sin-syin-tail-approval/unit.json`:
  **203 passes in 24 files**, no failures. Includes exact candidate promotion,
  revision-specific readiness, stale approval rejection, expired proposals and
  exclusion of old/preview completions. The historical glyph-stage baseline test
  uses the preserved original Sin/Syin fixtures; separate current tail tests
  verify their approved replacements without rewriting historical evidence.
- `VITE_BUILD_ID=sin-syin-tail-approved-20261006 npm run build`: passes, content
  validation reports **37 student-ready lessons**. The existing bundle-size
  advisory remains. Production bundle: `dist/assets/index-CdHcgeTB.js`.
- `JAWI_OUTLINE_HARNESS_DIR=output/verification/sin-syin-tail-approval node scripts/build-outline-test-harness.mjs`:
  builds the separate current-component match harness, never imported by the app.
- `npx playwright test tests/browser/sin-syin-tails.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **32 passes**, 16 per engine, no failures or skips. Production static fixture
  checks normal student access, moved finish guides, full body/every dot, all
  three practice modes, sound without losing partial progress, demonstrations,
  completion revision/persistence on reload, approval status and expired cards,
  320×600/768×1024/1280×800 layouts, scored Solo/Duo attempts and independent lanes.
  Audio instrumentation checks routing; this does not retest native codec support.
- Existing server HTTP check: the complete catalogue at
  `http://127.0.0.1:5173/src/content/letters.json` matches the current source and
  returns HTTP 200, with approved Sin 2/Syin 3. No duplicate server started.
- `node scripts/verify-sin-syin-tail-approval.mjs`: exact promotion, 35 unrelated
  entries, 37 recordings, all audio metadata, 37 ready letters and current
  verification reports checked; fingerprints saved in
  [inputs.json](../output/verification/sin-syin-tail-approval/inputs.json).
- `git diff --check`: passes.

Actual Chromium Sin/Syin phone starts and WebKit Syin desktop guides were
visually inspected. The lifted tips stay below marker 2; controls and numbered
labels fit the student layout. Evidence lives under
`output/verification/sin-syin-tail-approval/browser/`.

Physical-device touch/pen and professional teacher/pupil review were not tested.
No APK, deployment or publication requested. Refresh the existing local game to
load the approved shapes.
