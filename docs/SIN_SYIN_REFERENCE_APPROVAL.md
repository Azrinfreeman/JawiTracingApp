# Sin 3 and Syin 4: approval and activation

Date: **12 October 2026**, Asia/Kuala_Lumpur.
Status: **Exact reviewed shapes approved and active for students.**

The owner replied **“proceed”** directly to **“Approve Sin 3 and Syin 4 for student
lessons?”**, after viewing the exact before/proposed image and verification.
Reviewer: **Project owner (Codex user; name not supplied)**. No teacher assessment
is asserted. See [the approval record](CONTENT_APPROVALS.md#approval-of-sin-and-syin-reference-shapes-2026-10-12)
and the preserved [preceding review](SIN_SYIN_REFERENCE_REVIEW.md).

## Active behaviour

- Normal student lessons and scored Solo/Duo use the exact reviewed **Sin 3 / Syin 4**
  shallow teeth, compact bowl and tapered terminal at the illustrated reference
  level. The visible tip remains at model y = 515.06916. No route, outline, reveal
  piece, bound, version or provenance changes after review; promotion adds only
  approved geometry status and matching revision-specific review metadata.
- Trace the connected body from the right teeth, around the bowl and up to the
  left terminal without lifting. Guides 1/2/3 follow the reviewed route; Syin then
  requires its three original, separately tapped dots (4/5/6).
- Other **34 catalogue entries**, all audio metadata and all **78 public/audio
  files** remain exact. All 36 lessons are valid and ready. All geometry review
  factories now return no candidates; the Sin/Syin proposal cards expire.
- Earlier and preview attempts remain stored with their actual revisions. They
  cannot grant new-revision student credit. Current approved completion earns
  credit in its practice mode, and that credit survives reload. No storage reset
  or migration is introduced.

## Verification

Current commands, scope and input/runtime/build fingerprints:
[verification report](../output/verification/sin-syin-reference-approval/verification.json).
The preceding review evidence is historical and has not been rewritten.

| Check | Result and scope |
| --- | --- |
| Unit checks | **296 distinct passes / 46 files**, after repairing the affected historical tail-approval fixture and rerunning its five tests |
| `npm run build` | Passed; 36 valid models and 36 ready lessons; JS `index-B6zQcW83.js`, CSS `index-DbweFF8G.css` |
| Chromium/WebKit browser checks | **32 passed / two CDP-only skips**; both student models in play/guided/precision, mouse, native Chromium touch, continuous body, every Syin dot, reversal/restart/recovery, saved and reloaded revision credit, full/remaining demonstrations, reduced motion, expired review cards and scored independent Solo/Duo |
| `node scripts/verify-sin-syin-reference-approval.mjs` | Exact reviewed geometry, 34 other entries exact, 78 audio files exact, 36 ready lessons, all geometry candidate factories empty |
| Visual inspection | Current phone Sin start, tablet Syin guided start, desktop Syin precision completion and Syin Duo result; automated stage captures also check outline/guide clipping and horizontal overflow |

The full unit command was `npm test -- --pool=threads --maxWorkers=2 --reporter=dot`,
with TEMP/TMP set to the task verification folder's `temp` directory. It passed 295
tests and found one historical October-6 approval test expecting active Sin 2 /
Syin 3. That test now uses the preserved exact approved source revisions, retaining
its old shape and approval assertions. The affected file's five tests pass with
`npm test -- tests/geometry/sinSyinTails.test.js --pool=threads --maxWorkers=2
--reporter=dot`. This resolves the failure; repeated passes are counted once.
The new reference-shape tests independently assert current revision readiness,
exact reviewed geometry, old/preview credit isolation and proposal expiry.

Browser command: `npx playwright test tests/browser/sin-syin-reference-approval.spec.js
--project=chromium --project=webkit --workers=2 --reporter=list`. Production delivery
uses the existing static-route fixture (`JAWI_STATIC_TEST=1`) and installed browser
directory `C:/Users/azrin/AppData/Local/ms-playwright`. Viewports: 320×600 play,
768×1024 guided/demos/touch, 1280×800 precision and 1024×768 scored Solo/Duo.
The existing separate outline harness was rebuilt from current MatchScreen,
ResultScreen and catalogue inputs; it is never imported by the application.

The two skips require Chromium CDP native touch and cannot run in WebKit. Both
browsers pass mouse cases; Chromium passes both native emulated touch cases.
Audio lifecycle is controlled in tracing checks; unchanged hashes establish
recording preservation. Physical tablet/smartboard, speaker playback and Android
runtime are not newly tested. The APK is unchanged; no release or deployment was
requested. No approval or implementation work remains for these two revisions.
