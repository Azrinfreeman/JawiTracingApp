# Wau / Va approved left-first routes

Historical approval stage: Wau 4 / Va 5 subsequently retain these left-first
routes with smaller heads, approved on 12 October 2026. See
[current activation verification](WAU_VA_SMALLER_HEAD_APPROVAL.md).

On 7 October 2026 (Asia/Kuala_Lumpur), the project owner replied “approve” to
the exact Wau 3 / Va 4 approval question. These models now replace approved
Wau 2 / Va 3 in normal lessons and scored Solo/Duo challenges.

Both start at the right join, move left under the head like Pa, rise around
the loop, then continue into the original left tail as one continuous movement.
Va's single dot follows its body. Promotion adds only approval status and
matching owner/date/reference metadata to the exact reviewed candidates;
paths, checkpoints, widths, valid sequences, dot targets, audio and revision
numbers are preserved. No named teacher assessment is claimed.

The source catalogue has 36 ready lessons. All 34 unrelated entries are exact;
all audio metadata is retained, and the Wau/Va audio file hashes match the
pre-approval review evidence. All ten adult review factories now return no
proposals. Saved previous-revision and adult-preview attempts stay intact but
do not count as completion of these current student revisions.

## Verification

- `npm test`, workspace TEMP/TMP: **256 passed in 40 files**. An initial run
  found three historical assertions fixed to the earlier Wau/Va stage. The Va
  audio test now uses its audio-selection geometry snapshot, while still
  checking the active recording. The glyph-redraw inventory uses preserved
  original Wau geometry. Separate current-route tests assert exact promotion,
  independent audio approvals, student/challenge eligibility and saved-credit
  separation. The full suite passed after these fixture updates.
- `npm run build`: passed, including **36 letters/models/ready lessons**.
  Production JS `index-DCLuFVFI.js`, CSS `index-DbweFF8G.css`. Existing bundle
  size warning remains.
- Fresh test-only Solo/Duo harness built from the current components/catalogue
  with `JAWI_OUTLINE_HARNESS_DIR=output/verification/wau-va-approval node
  scripts/build-outline-test-harness.mjs`.
- `npx playwright test tests/browser/wau-va-directions.spec.js
  --project=chromium --project=webkit --workers=2`: **32 passed**, with four
  expected WebKit skips for Chromium-only CDP input emulation. Both letters
  complete in play/guided/precision and retain approved revision/status after
  reload. Demos preserve partial progress; touch/pen complete the correct route
  and Va dot. Both scored Solo/Duo routes complete independently. The obsolete
  review scope is empty. Phone/tablet/desktop captures pass fit checks.
- `node scripts/verify-wau-va-approval.mjs`: exact reviewed proposals preserved,
  34 unrelated entries unchanged, independent audio unchanged, all 36 lessons
  ready and all ten review scopes empty. Input hashes include source, tests,
  dependencies, production bundle, fresh harness and 75 retained audio assets.
- Inspected approved phone Wau partial tracing, tablet Va guided start and
  WebKit Va Duo result captures. Evidence is recorded in
  `output/verification/wau-va-approval/inputs.json`.

Evidence: `output/verification/wau-va-approval/`; preceding review evidence is
preserved separately under `output/verification/wau-va-direction/`.
The existing local server remains http://127.0.0.1:5173/. Physical tablet or
smartboard runtime is unverified. No new APK, publication, commit or push was
requested or performed for this approval.
