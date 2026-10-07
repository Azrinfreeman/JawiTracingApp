# Fa and Pa direction approval

6 October 2026, Asia/Kuala_Lumpur. The project owner wrote **“approve”** in
response to the explicit request for **Fa revision 4 and Pa revision 4** for
student lessons. This approval is recorded against those exact revisions in
[CONTENT_APPROVALS.md](CONTENT_APPROVALS.md#approval-of-fa-and-pa-directions-2026-10-06).
Reviewer: Project owner (Codex user; name not supplied). No named teacher
assessment is claimed.

The exact reviewed candidates are now student models: start at the right join,
move left under the head, rise around the loop and return; lift, draw the tail,
then tap the dots. Fa has one dot; Pa has three. Promotion changes only their
status and matching approval records relative to the reviewed candidates. No
further path, width, checkpoint, dot, sequence, audio or revision edit is made.
The other 35 entries, including Qaf and the four catalogue-outline models, all
audio metadata/37 recordings and seven earlier proposals are preserved.

The two obsolete Fa/Pa proposals disappear from **Arah Fa dan Pa**. Student
lessons now save revision 4 with `geometryStatus: approved` and `preview: false`.
Old revision-3 attempts remain stored; those and adult-preview attempts do not
complete the new student revision. Jejak Ceria remains the default.

## Current verification

Production build: `fa-pa-approved-20261006`, Node 24.19.0; Playwright 1.63.0.
The running local server returned HTTP 200 with approved Fa 4 and Pa 4 and
matching review revisions. Browser checks use the existing static fixture
serving the checked production bundle, with at most two workers.

- `npm test -- --reporter=dot`: **188 tests pass in 21 files**, including exact
  promotion, student/challenge readiness, obsolete-candidate removal, stale
  approval rejection and old/preview completion isolation.
- `VITE_BUILD_ID=fa-pa-approved-20261006 npm run build`: passes, including
  catalogue validation; **37 ready student lessons**. Bundle
  `index-H-ohS9S1.js`; CSS `index-DSx9W6Tg.css`.
- `node scripts/verify-fa-pa-approval.mjs`: passes. Pre-approval catalogue and
  reviewed direction/cue sources match their recorded hashes; promoted entries
  match the two reviewed candidates with only approval metadata changed. All
  35 other entries, audio metadata/files and seven earlier proposals are preserved.
  [Inputs and hashes](../output/verification/fa-pa-approval/inputs.json) record
  relevant application, tests, assets, dependency and bundle inputs.
- `npx playwright test tests/browser/fa-pa-directions.spec.js --project=chromium
  --project=webkit --workers=2`: **24 passes, 12 per browser; no failures,
  retries or skips** against this approved production bundle. Cases cover both
  student models in all three tracing modes; 320×600 phone/768×1024 tablet
  stages; left-first departure, head closure, lift/restart, tail, required dots,
  rejected tail-first/reversed-loop shortcuts and stored approved revision-4
  completions. Full demonstrations preserve measured progress. Teacher records
  show both approvals, obsolete direction proposals disappear and the seven
  older proposals remain. [Browser results](../output/verification/fa-pa-approval/browser-final.json).
- Inspected current student captures: [Fa phone start](../output/verification/fa-pa-approval/browser/chromium-fa-start-320.png)
  and [Pa WebKit tablet head](../output/verification/fa-pa-approval/browser/webkit-pa-head-768.png).
  Both have the corrected routes and no adult-preview banner. Layout checks
  bound labels/badges and exclude cue/control overlap and horizontal overflow.
- CRLF-aware `git diff --check`: passes.

Evidence is stored separately under
[fa-pa-approval](../output/verification/fa-pa-approval/); the preceding
[review-stage checks](FA_PA_DIRECTION_REVIEW.md) and captures remain historical.
Repeat checks when affected content, code, tests, dependencies, assets or
environment change. Documentation-only changes do not invalidate the checks.

Physical-device touch/pen and listening review remain unverified. This change
does not build an APK, sync Android assets, deploy, commit or publish.
No Fa/Pa implementation or approval work remains;
the seven earlier proposals retain their own independent content-review gate.
