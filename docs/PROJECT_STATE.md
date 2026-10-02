# Current project state

Confirmed: **2 October 2026**, Asia/Kuala_Lumpur. This is a dated summary;
verify changing facts against [the catalogue](../src/content/letters.json) and
[its validator](../src/content/validateContent.js).

- **Inventory:** 37 letters and authored models, all owner-approved and
  student-ready. All 37 name recordings are approved: 27 supplied files and 10
  retained synthetic recordings.
- **Student entry:** Solo / Latihan santai → Jom mula → Buku Jawi Saya contents / Huruf tersedia. Huruf permulaan retains the
  original 12 pilot models. Jejak Ceria is the preschool default.
- **Latest approved batch:** all 15 final letter models, content revision 2.
  Approval sources: [model record](CONTENT_APPROVALS.md) and
  [audio record](AUDIO_APPROVALS.md).
- **Final authored batch:** ta-marbuta, tho, za, ain, ghain, nga, fa, pa, qaf,
  ga, va, ha, hamzah, ye and nya. All are approved at content revision 2.
  See [review notes](LETTER_BATCH_3_REVIEW.md); no missing models remain.
- **UI theme:** the user selected Option A, Taman Kawan Ceria, and authorised
  implementation and generated assets. The completed storybook playground has
  painted scenery, leaf/flower/star companions, chunky controls, colourful letter
  stations and brief greeting/trophy effects across Solo and Duo. Writing paper
  remains steady; reduced motion and an artwork fallback are supported. See the
  [selected plan](KIDS_GAME_THEME_IMPLEMENTATION.md), [asset record](KIDS_GAME_THEME_ASSETS.md)
  and [current verification](KIDS_GAME_THEME_VERIFICATION.md). Earlier Taman Ceria
  [planning](UI_THEME_REVAMP_IMPLEMENTATION.md) and [verification](UI_THEME_VERIFICATION.md)
  remain historical records.
- **Solo and Duo 1v1:** implemented after the user's “continue”. Solo retains
  untimed practice and adds trophy challenges. Duo uses two independent touch
  boards, shared letters/countdowns/deadlines/pauses, speed points and final
  trophies. Setup supports 3/5/10 rounds and 60/90/120 seconds; defaults are
  five rounds and 90 seconds. Competitive attempts and separate match history
  are available in the teacher area, with combined export/reset. See
  [implementation](SOLO_DUO_IMPLEMENTATION.md) and
  [verification](SOLO_DUO_VERIFICATION.md).
- **Interactive alphabet book:** the user's “proceeed” authorised the book plan.
  Buku Jawi Saya now has wide open spreads, compact writing pages, deliberate
  animated turns, accurate practice stickers, a closing page and unsaved-copy
  protection. Solo/Duo use compact books with a synchronized shared round turn.
  The checked production build and 81 unit checks passed; 157 unique production
  Chromium/WebKit cases passed with nine expected CDP skips and no unresolved
  failures. Seven viewport journeys add 45 practice captures, with no page errors;
  match captures cover readiness, racing, dots, pauses and trophies. All 93 protected
  files remain unchanged. See the [delivered plan](INTERACTIVE_BOOK_LAYOUT_IMPLEMENTATION.md)
  and [current verification](INTERACTIVE_BOOK_VERIFICATION.md).
- **Current pause wording:** Solo/Duo uses **Berhenti**; teacher records use
  **Henti / peraturan**, **kali berhenti** and **kali sambung**. The wording change
  passed the checked build, 78 unit checks and three production Chromium
  pause/resume journeys on phone and both tablet orientations. Only the two
  screen source files changed from the previous theme's recorded inputs. See
  [verification](PAUSE_WORDING.md).
- **Android release:** the user requested a current Android APK. Signed release
  **1.0.0 (code 1)** is delivered under `output/releases/`, application ID
  `com.hananaacademy.tamanjawi`, Android 8.0+ and target API 36. The offline package
  includes all 91 production assets and 37 active recordings, with guarded Back
  navigation, background pause and native teacher export/audio-file pickers.
  Checked web build, 81 unit checks, 26 production Chromium/WebKit cases, Android
  release assembly/lint and APK signature/alignment/asset checks passed. Teaching
  content and recordings remain unchanged. No connected Android device/emulator
  was available, so installation and native runtime review remain pending. See
  [release, build and verification](ANDROID_RELEASE.md).
- **Earlier theme verification:** Taman Kawan Ceria passed the checked build,
  78 unit checks and 51 production Chromium/WebKit cases, with three expected
  WebKit CDP skips and zero final failures. Six viewport journeys and 26 visual
  captures verify practice completion, motion, zoom and artwork fallback; match
  cases add 25 captures covering Duo, pauses and trophies. All 94 protected files
  remain unchanged, and 141 final input hashes are recorded. See
  [verification](KIDS_GAME_THEME_VERIFICATION.md) and
  [production results](../output/verification/kids-game-theme/browser-results.json).
- **Earlier Solo/Duo verification:** checked production build and 78 unit
  checks passed. Broader Chromium/WebKit checks passed 349 cases with 10 expected
  touch skips; one WebKit context teardown timeout was resolved by the final
  production repeat. Final production follow-up passed 35 cases with 3 expected
  CDP skips, including simultaneous touch in both tablet orientations, dot pads,
  pauses/recovery, saved profiles, trophies and Solo phone/short-screen layouts.
  Ten repeated mobile handoff cases passed. All 75 protected files are unchanged;
  final source fingerprints match and 25 captures record the feature. See
  [production results](../output/verification/solo-duo-production.json).
- **Earlier UI verification:** UI revamp passed the checked build and
  59 unit checks; broad Chromium/WebKit regression passed 326 checks with 10
  expected runtime/input skips. Scoped follow-ups passed 50 checks (2 audio skips)
  and 34 final checks. Production Chromium confirms five viewport journeys,
  80 captures, 6 student completions, 5 saved copies, 85 protected files unchanged
  and no page errors/external runtime requests. See
  [final production evidence](../output/verification/ui-theme-final-production.json).
- **Earlier model-approval verification:** final-model approval passed the checked
  build, 59 unit checks and 60 focused Chromium/WebKit browser cases. See
  [current scope and checks](LETTER_BATCH_3_REVIEW.md) and
  [browser evidence](../output/verification/letter-batch-3-approval-browser.json).
  Production Chromium confirms all 15 new student completions and next-letter
  transitions, 22 unchanged entries and 37 unchanged approved recording hashes;
  see [production evidence](../output/verification/letter-batch-3-approval.json).
- **Local addresses:** development `http://127.0.0.1:5173`, production preview
  `http://127.0.0.1:4173`. Confirm reachability and build before reuse.
- **Version control:** source, reviewed teaching assets, Android APK and lightweight
  verification records are tracked in the private
  [Azrinfreeman/JawiPrasekolah](https://github.com/Azrinfreeman/JawiPrasekolah)
  repository on `main`, following the user's commit/push request. Signing keys,
  local SDK configuration, caches, temporary files and generated screenshots stay
  local. No website deployment or app-store publication was requested.
- **Recorded Windows limits:** Firefox launch failed with `spawn UNKNOWN`;
  WebKit rejected the tested WAV fixture. Reconsider when runtime/device changes.
  No physical pupil/device assessment is recorded.
- **Next application task:** none pending. The authorised Solo/Duo feature and
  selected storybook theme, interactive alphabet book and requested APK are complete.
  All letter models remain project-owner approved; teacher and physical
  pupil/device review, including native Android installation testing, remain pending.

Refresh this summary when facts change; retain dated evidence in its original
scope. Read [verification guidance](VERIFICATION_GUIDE.md) when selecting checks.
