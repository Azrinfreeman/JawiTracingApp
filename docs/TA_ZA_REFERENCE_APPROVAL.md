# Ta and Za photo-reference shapes: approval and activation

Date: **12 October 2026**, Asia/Kuala_Lumpur.

The project owner replied **“proceed”** directly after the pictured **Ta 9 /
Za 9** review and statement that student activation awaited shape approval.
Those exact candidates are now approved in the active catalogue and available
in normal student lessons and scored Solo/Duo. Reviewer: **Project owner
(Codex user; name not supplied)**. No teacher assessment is claimed. See the
[approval record](CONTENT_APPROVALS.md#approval-of-ta-and-za-photo-reference-shapes-2026-10-12).

The photo-adapted compact lower loop, pointed tail, thin tapered pillar and
straight downward pillar route retain the reviewed data exactly. Body guides
are 1–3; lift before the top-to-bottom pillar at 4–6. Za's unchanged separate
dot is required at 7. Audio and the Jejak Ceria default remain unchanged.

[Promotion](../scripts/promote-ta-za-reference.mjs) checked source fingerprints
from the preceding review before editing. It preserved the old catalogue and
exact reviewed proposals, then changed only geometry approval status and matching
review metadata relative to those candidates. Content versions stay **9**.
The candidate factory now returns no proposals for the activated revisions.

## Checks and evidence

- Unit suite: **306 distinct tests passed / 47 files**. The initial run passed
  304 tests and exposed two historical revision-6 approval checks that still
  compared the live catalogue with the October-7 shapes. Those checks now use
  the existing exact revision-6 fixture; both passed in the affected-file rerun.
  The new revision-9 activation, review expiry, eligibility, paths, every
  mode/pointer profile, direction, lift/resume and credit checks passed initially.
- Checked production build: passed, **36/36 lessons ready**. The existing
  bundle-size warning remains.
- Browser verification: **28 Chromium/WebKit passes / two CDP-only WebKit
  skips**, with no failures. Coverage: student play/guided/precision at phone 320×740, tablet
  768×1024 and 1280×800; exact active silhouettes/routes, guides, downward
  pillar and dot-last completion; reverse rejection and partial resume;
  persisted approved credit; retained old/preview history without new-revision
  credit; expired review cards; Chromium native emulated touch.
- Scored Solo/Duo use the existing separate test-only harness built from current
  MatchScreen and ResultScreen components with the active approved catalogue.
  Both lanes use the exact approved geometry, complete independently and report
  scored revision-9 results. No test harness is bundled into the application.
- [Integrity verification](../scripts/verify-ta-za-reference-approval.mjs): exact
  reviewed geometry, **34 other entries unchanged**, **78 public/audio files
  unchanged**, no unrelated source changes, all **36 lessons ready** and no
  remaining review candidates. The report fingerprints current source, tests,
  scripts, assets and production bundle.
- Inspected the current student phone completion and tablet/Duo captures for
  shape, guide placement and clipping. No physical tablet test or new APK.
- Existing development server confirmed HTTP 200 and the revision-9 approval
  reference in its catalogue module. `git -c core.safecrlf=false diff --check`
  passed. Current documentation links were checked.

Commands:

```text
node scripts/promote-ta-za-reference.mjs
npm test -- --reporter=json --outputFile=output/verification/ta-za-reference-approval/unit-results.json
npm test -- tests/geometry/taZaApproval.test.js --reporter=json --outputFile=output/verification/ta-za-reference-approval/unit-historical-repair-results.json
npm run build
JAWI_OUTLINE_HARNESS_DIR=output/verification/ta-za-reference-approval node scripts/build-outline-test-harness.mjs
JAWI_STATIC_TEST=1 PLAYWRIGHT_JSON_OUTPUT_NAME=output/verification/ta-za-reference-approval/browser-results.json npx playwright test tests/browser/ta-za-reference-approval.spec.js --project=chromium --project=webkit --workers=2 --reporter=json --output=output/verification/ta-za-reference-approval/test-results
node scripts/verify-ta-za-reference-approval.mjs
git -c core.safecrlf=false diff --check
```

Environment variables above are shown in portable notation; execution used
PowerShell `$env:` assignments. Browser tests route the checked production files
through the existing local-test helper. The existing development server remains
at `http://127.0.0.1:5173/`; no duplicate server is required.

Evidence: [initial unit results](../output/verification/ta-za-reference-approval/unit-results.json),
[historical-fixture repair](../output/verification/ta-za-reference-approval/unit-historical-repair-results.json),
[browser results](../output/verification/ta-za-reference-approval/browser-results.json),
[integrity and input/build fingerprints](../output/verification/ta-za-reference-approval/integrity.json),
[old catalogue](../output/verification/ta-za-reference-approval/before-catalogue.json),
[exact reviewed proposals](../output/verification/ta-za-reference-approval/reviewed-proposals.json),
[student phone completion](../output/verification/ta-za-reference-approval/browser/chromium-tho-play-complete.png)
and [Duo capture](../output/verification/ta-za-reference-approval/browser/chromium-tho-duo-lane-0.png).

The [preceding review](TA_ZA_PHOTO_REFERENCE_REVIEW.md) remains evidence of the
pending-review stage. Earlier attempts retain their actual revisions; preview
attempts retain their preview flag. No automatic migration grants student credit
for the new shapes. No deployment, APK, commit, push or physical-device
performance claim is included in this activation.
