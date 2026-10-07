# Ha photo tracing order: approved and applied

7 October 2026, Asia/Kuala_Lumpur. The owner replied **“proceed”** to the explicit
question “Approve Ha 4 for the normal game?”, then requested a separate Va audio
correction. This approves the exact pictured Ha-4 geometry; audio is unchanged.

The reviewed path is now in `src/content/letters.json`, with matching revision-4
owner/date/reference metadata. All candidate fields are retained exactly:
top tip → outer right loop → up the left loop → inner downstroke → left tail,
one continuous stroke and zero dots. Five cues and demonstration pauses remain.
All 36 other entries and all 37 recordings/audio metadata are preserved at this
approval stage. All seven review scopes expire; all 37 lessons are ready. The
preceding [review](HA_TRACE_ORDER_REVIEW.md) and its evidence remain historical.

## Verification

- `npx vitest run --maxWorkers=2 --reporter=json`, task-local TEMP/TMP:
  **232 passing checks in 33 files**, no failures. Exact reviewed model, approval,
  eligibility, older/preview attempt isolation and current student completion
  modes are checked. Ha-3 fixtures preserve historical geometry tests.
- `VITE_BUILD_ID=ha-photo-order-approved-20261007 npm run build`: content/build
  pass, **37 ready lessons**. Existing bundle-size warning remains.
- Ha browser selection, Chromium/WebKit production static fixture, two workers:
  **16 passing cases**, plus two expected WebKit skips for Chromium-only native
  emulation. Approved route, all three modes, old-order rejection, release/recovery,
  save/reload, demonstration phases and retained progress, phone/tablet/desktop
  fit, seven empty review scopes and scored independent Solo/Duo outcomes pass.
  Chromium native emulated touch/pen completes the approved route.
- Relevant student viewport/state captures inspected. Existing local server
  serves the exact approved Ha-4 catalogue with HTTP 200. Preservation checks
  compare promotion to the reviewed candidate and protect all other entries and
  active recordings. Commands, environment, cases and input hashes:
  `output/verification/ha-approval/inputs.json`.

Physical devices and pronunciation were not newly assessed. No teacher approval
is inferred. No APK, publishing or deployment requested.
