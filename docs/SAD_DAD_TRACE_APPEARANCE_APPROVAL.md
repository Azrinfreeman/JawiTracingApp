# Sad and Dad approved shapes and APK 1.0.8

Completed 7 October 2026, Asia/Kuala_Lumpur. The owner replied “approve and generate
newly released apk” to the pictured approval question. Sad 3 and Dad 3 were
promoted exactly as reviewed: catalogue outlines, matching head/join/bowl routes,
two movements and Dad’s diamond dot last. Only status/review changed during
promotion. Both audio revision-2 records, the other 34 entries and all 37 prior
recordings remain exact. All 36 lessons are ready and all nine scopes are empty.

Reviewer: Project owner (Codex user; name not supplied), projectOwner, 2026-10-07,
revision 3 for each. See the [approval record](CONTENT_APPROVALS.md#approval-of-sad-and-dad-catalogue-shapes-2026-10-07).
No teacher assessment is inferred. The [preceding review](SAD_DAD_TRACE_APPEARANCE_REVIEW.md)
and its reports remain historical and unchanged.

## Completed verification

- `npm test -- --maxWorkers=2 --reporter=json --outputFile=output/verification/sad-dad-approval/unit.json`:
  249 cases / 39 files, 246 initial passes and three assertions tied to old geometry.
  Historical baseline now uses the preserved Sad/Dad originals. The current
  shortcut/reversal regression uses the revised route’s first-quarter bound and
  requires a pause, incomplete bowl and no completion.
- Targeted recheck of `tests/game/glyphMatched.test.js` and
  `tests/geometry/fixVideo.test.js`: 15 passed. Combined report has **249 passes**,
  234 unchanged initial cases plus 15 repaired-file cases. Application source
  did not change during repair. Both runs use task-local TEMP/TMP.
- Checked build: `VITE_BUILD_ID=taman-jawi-1.0.8-sad-dad-approved-20261007 npm run build`.
  All 36 entries valid/ready. Existing bundle-size advisory remains.
- `npx playwright test tests/browser/sad-dad-outlines.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **30 passed**, no failures/skips/flaky cases. Production static fixture covers
  play/guided/precision, both strokes and Dad dot-last, partial reveal, saved
  approved revision 3/reload, demonstration preservation, scored Solo/Duo
  independent lanes, phone/tablet/desktop fit and nine expired review scopes.
  Harness built separately from current components; no harness enters the APK.
- Existing server serves the exact approved catalogue. Chromium phone completed
  Dad and WebKit tablet completed Sad captures were inspected.
- `scripts/build-android.ps1 -Offline -SkipWebBuild` with the installed Unity
  Android SDK: successful release assembly/lint after documented local socket
  and Windows cache-finalization failures. Zero lint errors, four existing warnings.
- `scripts/verify-android-release.ps1`: same release certificate, ZIP alignment,
  package/version/code/API, release flags, checksum and **103 bundled assets**
  verified. Old 1.0.7 APK is unchanged. **1.0.8/code 9**, 7,439,815 bytes.
- `adb devices -l`: no connected Android device or emulator.

Evidence and input fingerprints: `output/verification/sad-dad-approval/inputs.json`,
before-catalogue, exact reviewed proposals, authorisation, unit-final/browser
reports, live catalogue and captures. APK evidence is under
`output/verification/android-release-1.0.8/`.

## Delivery and limits

[Download signed APK 1.0.8](../output/releases/Taman-Jawi-1.0.8-release.apk).
See [release metadata and checksum](ANDROID_RELEASE.md).

APK bundles the current approved game and earlier fixes. Physical-device
installation, native WebView drawing/audio and progress retention after updating
remain unverified because no device is connected. Browser checks use the static
production fixture with separate exact live-source verification. No store
publication or installation was performed. No authorised work remains.
