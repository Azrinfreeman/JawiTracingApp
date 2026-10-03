# Current project state

Confirmed: **4 October 2026**, Asia/Kuala_Lumpur. This is a dated summary;
verify changing facts against [the catalogue](../src/content/letters.json) and
[its validator](../src/content/validateContent.js).

- **Inventory:** 37 letters and authored models; 35 are owner-approved and
  student-ready. Kaf revision 2 and Ga revision 3 await fresh geometry review.
  All 37 name recordings are approved: 27 supplied files and 10
  retained synthetic recordings.
- **Student entry:** Solo / Latihan santai → Jom mula → Buku Jawi Saya contents / Huruf tersedia. Huruf permulaan retains the
  original 12 pilot models. Jejak Ceria is the preschool default.
- **Latest approved batch:** all 15 final letter models, content revision 2.
  Approval sources: [model record](CONTENT_APPROVALS.md) and
  [audio record](AUDIO_APPROVALS.md).
- **Final authored batch:** ta-marbuta, tho, za, ain, ghain, nga, fa, pa, qaf,
  ga, va, ha, hamzah, ye and nya. Fourteen retain approved content revision 2;
  Ga's corrected revision 3 is pending review.
  See [review notes](LETTER_BATCH_3_REVIEW.md); no missing models remain.
- **Kaf/Ga correction:** implemented on 3 October after the user's explicit
  implementation authorisation. Kaf revision 2 and Ga revision 3 use one shared
  connected slanted body; Ga adds one upper dot. Catalogue, help, teacher/audio
  and completion illustrations use the authored model. Fresh geometry review
  is pending; adult preview has both revised models, while student and scored
  pools retain the other 35 approved lessons. All recordings, historical
  approvals and unrelated entries are preserved. See [delivery, review sheet
  and verification](KAF_GA_SHAPE_CORRECTION_VERIFICATION.md).
- **Endpoint finish detection:** implemented on 4 October after authorisation
  of the implementation document. Jejak Ceria preserves earned per-stroke
  eligibility and accepts a fresh endpoint tap and release without requiring
  more tracing. A bounded release allowance handles small final-up drift from
  an immediately valid terminal contact. Incomplete strokes, reversals,
  cancellation, pause/deadline limits and separate dots remain enforced; Ghain
  still needs point 4 after its body finishes. New Play records use
  `play-guided-v2`, with confirmation/release-assistance counters and raw
  diagnostic provenance. Existing lightweight rendering, teaching geometry,
  audio, approvals, strict/copy modes and scoring are preserved. See
  [current verification and device limits](ENDPOINT_FINISH_DETECTION_VERIFICATION.md).
- **Earlier tracing finish and performance:** implemented on 3 October after explicit
  authorisation. Jejak Ceria now distinguishes the final destination from held
  release readiness, exposes the saved near-end frontier and retains incomplete
  progress through endpoint taps. Real release movement still validates, and
  normal capture loss cannot cancel a completed release. Binary arc searches,
  direct segment projection and one coordinate conversion per input batch reduce
  matcher/input work. All teaching geometry, audio, readiness and strict profiles
  remain unchanged. Checked build and 107 unit checks passed; production
  Chromium/WebKit passed 127 unique cases with seven expected CDP skips after
  focused fixture/native-DPR follow-ups. All 75 protected inputs match the prior
  working tree. Matcher median CPU totals fell by 73–88% across six measured
  letters; Sin's native 4K p95 frame interval remains 33.3 ms. Physical-device
  smoothness review remains pending. See [delivery and current measurements](TRACING_COMPLETION_AND_PERFORMANCE_VERIFICATION.md).
- **Low-spec tablet tracing:** implemented on 3 October after the owner approved
  the implementation document. Android defaults to Paparan ringan, with an adult
  full-presentation override. Dynamic SVG cues, compact matcher responses,
  throttled diagnostics, bounded 128-vertex ink sections and an isolated Duo
  clock reduce repeated drawing/control work. Content, matching/scoring and
  storage remain unchanged; all 89 protected inputs match the before snapshot.
  The checked build and 115 unit tests passed. Production Chromium/WebKit passed
  223 unique cases after affected follow-ups, with six expected WebKit CDP skips.
  One Windows WebKit native-4K all-letter sequence timed out even with captures
  disabled; Chromium 4K and WebKit phone/tablet checks passed. Light Play SVG
  writes fell 39–60%; guided ink serialization fell 57%. Input-batch CPU timing
  did not consistently improve, and physical tablet latency/smoothness remains
  unverified. See [delivery and measured limits](LOW_SPEC_TABLET_TRACING_PERFORMANCE_VERIFICATION.md).
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
  and [verification at that delivery](INTERACTIVE_BOOK_VERIFICATION.md).
- **Fullscreen game layout:** implemented after the user's “proceed” on
  3 October. The game fills the measured viewport without scrolling. Practice
  uses a large centred letter and translucent bottom dock, retaining book flips,
  completion and unsaved-copy protection. Solo/Duo use fitted equal stages;
  insufficient space offers resize/rotate guidance. Letter contents and teacher
  records use reachable pages, teacher tools use tabs, and match setup has two
  steps. All teaching geometry, recordings, approvals, matching and scoring
  remain unchanged. See [delivery and current verification](FULLSCREEN_GAME_LAYOUT_VERIFICATION.md).
  The checked build, 87 unit checks and 130 unique Chromium/WebKit cases passed,
  with four expected WebKit CDP skips and no unresolved failures. Nine viewport
  journeys and 518 letter/viewport inspections cover phones, tablets and native
  4K; 84 protected files are unchanged. Physical device review remains pending.
- **Current pause wording:** Solo/Duo uses **Berhenti**; teacher records use
  **Henti / peraturan**, **kali berhenti** and **kali sambung**. The wording change
  passed the checked build, 78 unit checks and three production Chromium
  pause/resume journeys on phone and both tablet orientations. Only the two
  screen source files changed from the previous theme's recorded inputs. See
  [verification](PAUSE_WORDING.md).
- **Android release:** signed **1.0.5 (code 6)** is delivered under
  `output/releases/` on 4 October after authorisation of the endpoint finish fix,
  using the same certificate as preserved releases 1.0.0–1.0.4. Application ID
  `com.hananaacademy.tamanjawi`, Android 8.0+ and target API 36. The offline package
  includes all 91 production assets and 37 active recordings, with guarded Back
  navigation, background pause and native teacher export/audio-file pickers.
  Paparan ringan is the Android default, with an adult full-presentation override.
  Release assembly/lint and signature/alignment/version/checksum/asset checks
  passed; lint has zero errors and four existing warnings. Native fullscreen
  starts automatically, with native toggle controls and
  cutout/keyboard/resize handling. Document panning is locked; portrait phones
  from 320×600 CSS pixels have fitted welcome, lesson, teacher controls and adult
  preview banners. Smaller windows and undersized Duo stages retain guidance.
  Corrected Kaf/Ga adult previews and tracing finish/performance fixes remain;
  35 approved lessons are student-ready while Kaf revision 2 and Ga revision 3
  await geometry review. At the earlier 1.0.3 fullscreen correction, the checked
  production build, 107 unit checks, Android release checks and all 42
  Chromium/WebKit cases passed; preview-server teardown timed out afterward.
  Six final fullscreen/resize/scrolling cases completed cleanly against the
  confirmed external preview. Teaching content, audio and matching/scoring are
  preserved. Current tracing verification is recorded above. No device/emulator
  is connected; physical native fullscreen,
  installation and runtime review remain pending. See [release](ANDROID_RELEASE.md)
  and [earlier fullscreen correction verification](ANDROID_FULLSCREEN_FIT_VERIFICATION.md).
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
  The current project save includes the fullscreen layout, Kaf/Ga correction,
  tablet performance work, endpoint finish fix and releases through 1.0.5.
- **Recorded Windows limits:** Firefox launch failed with `spawn UNKNOWN`;
  WebKit rejected the tested WAV fixture. Reconsider when runtime/device changes.
  No physical pupil/device assessment is recorded.
- **Next application task:** Kaf revision 2 and Ga revision 3 need explicit
  review of their new drawings and proposed writing sequence before student
  or scored access. Implementation and technical verification are recorded in
  the correction report. The authorised Solo/Duo feature and
  selected storybook theme, interactive alphabet book, fullscreen layout and
  earlier requested APK are complete.
  The other 35 models remain project-owner approved; teacher and physical
  pupil/device review, including native Android installation testing, remain pending.

Refresh this summary when facts change; retain dated evidence in its original
scope. Read [verification guidance](VERIFICATION_GUIDE.md) when selecting checks.
