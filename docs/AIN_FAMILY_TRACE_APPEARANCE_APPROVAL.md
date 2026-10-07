# Ain, Ghain and Nga: approved catalogue outlines

6 October 2026, Asia/Kuala_Lumpur. The owner replied **“proceed”** to the explicit
question approving replacement of the three game models with the corrected
outlines shown in the catalogue/original/corrected comparison. This approval
identifies **Ain 4, Ghain 4 and Nga 4 catalogue outlines**, recorded against each
revision in [CONTENT_APPROVALS.md](CONTENT_APPROVALS.md#approval-of-ain-ghain-and-nga-outlines-2026-10-06).
Reviewer: Project owner (Codex user; name not supplied). No teacher assessment
is claimed.

The regular game now uses the exact reviewed outlines. The unwanted thick neck
bend is removed; the silhouette uses the catalogue font's thin connection,
changing weight, tapered ends and diamond dots. Head → lift → bowl → dots stays
as reviewed. Promotion changes only approval metadata relative to those
candidates, with no further shape, checkpoint, dot, sequence, audio or revision
edit. All 34 unrelated entries and 37 recordings/audio records are preserved.
Jejak Ceria remains the preschool default.

Ain-family outline review cards disappear because their base revision has
changed. The older continuous-stroke Ain/Ghain/Nga alternatives also expire;
the four remaining Mim, Ta marbutah, Hamzah and Jim proposals are unchanged.
Those alternatives remain outside this approval scope. Old revision-3 attempts
and adult-preview attempts do not complete the new student revision.

## Current verification

Production build: **ain-family-approved-20261006**, Node 24.19.0,
Playwright 1.63.0. JavaScript: index-BvKfMiOp.js; CSS: index-BhPf4j4G.css.
Browser checks use the existing static production fixture and two workers.
The existing local server returned HTTP 200 for the current catalogue, with
Ain/Ghain/Nga all approved at revision 4 and catalogueOutline appearance.

- Unit/content checks: npm test -- --reporter=dot, then only the affected file
  via npx vitest run tests/geometry/outlineAppearance.test.js --reporter=dot; **195 distinct tests pass in 22 files**. The initial unit
  run passed 194 and exposed one historical test that incorrectly excluded all
  outline letters instead of its four candidate IDs. That assertion and the
  current proposal count were corrected; all six cases in that file passed on
  targeted rerun. Other successful cases were retained with unchanged inputs.
- Checked build: passes, including catalogue validation; **37 ready student
  lessons**. Command: VITE_BUILD_ID=ain-family-approved-20261006 npm run build.
- Selected cases in ain-family-outlines.spec.js and ain-family-matches.spec.js,
  Chromium/WebKit, two workers: **44 passes (22 per browser), no failures,
  retries or skips**. Selection: head/lift/bowl/dots, silhouettes and guides,
  approved teacher revisions, student Solo/Duo outlines and authored results.
  Every required stroke/dot completes in play/guided/precision student lessons;
  completions store approved revision 4 with preview false. Phone/tablet/desktop
  layouts fit, wrong starting parts are rejected and partial ink stays partial.
  Teacher records show the three approvals and no stale Ain-family proposals.
  Test-only current-component Solo/Duo checks verify independent lanes, scored
  callbacks carrying approved revision 4, unique clips and authored results.
  [Browser report](../output/verification/ain-family-approval/browser-final.json).
- Promotion evidence: node scripts/verify-ain-family-approval.mjs. Exact reviewed
  source/shape preservation, 34 unrelated entries, 37 recordings, four remaining
  proposals and 37 ready lessons pass; [inputs and hashes](../output/verification/ain-family-approval/inputs.json).
- CRLF-aware git diff --check passes.
- The promotion comparison verifies that the entire rendering/input source and
  authored outline data match the reviewed build. Approved entries match the
  three candidates with only review/status metadata changed; all unrelated
  entries, recordings and remaining alternatives are preserved.
- Inspected regular student captures: Ain at 1920×1080, Ghain at 320×600 and
  Nga at 768×1024 in precision mode, including its bowl restart. Shapes fit the
  board and controls, with no adult-preview banner. The new neck and silhouette
  appear in the regular student game.

Evidence and hashes are stored separately under
[ain-family-approval](../output/verification/ain-family-approval/), preserving the
[preceding review evidence](AIN_FAMILY_TRACE_APPEARANCE_REVIEW.md). Repeat checks
when affected content, rendering/input code, tests, dependencies, assets or
runtime change; documentation-only edits do not invalidate successful checks.

Physical-device input/listening remains unverified. The earlier native Windows
WebKit canvas-font comparison limitation is unchanged; that specific pixel gate
was not retried during metadata promotion. No APK, Android asset sync,
deployment or publication was requested.
