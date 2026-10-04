# Current project state

Confirmed: **4 October 2026**, Asia/Kuala_Lumpur. This is a dated summary;
verify changing facts against [the catalogue](../src/content/letters.json) and
[its validator](../src/content/validateContent.js).

- **Inventory:** 37 letters and authored models; **all 37 are owner-approved and student-ready**.
  On 4 October the owner approved the 29 revisions that had awaited review (27 redrawn models plus Kaf
  revision 2 and Ga revision 3); see [the approval record](CONTENT_APPROVALS.md). All 37 name recordings
  are approved: 27 supplied files and 10 retained synthetic recordings.
- **Student entry:** Solo / Latihan santai → Jom mula → Buku Jawi Saya contents / Huruf tersedia. Huruf permulaan retains the
  original 12 pilot models. Jejak Ceria is the preschool default.
- **Fullscreen tracing, completion voice and music (4 October, verified locally):**
  implemented after the user's “proceed” and continuation of
  [the plan](FULLSCREEN_TRACING_AUDIO_IMPLEMENTATION.md). Practice and Solo/Duo use the full
  writing stage with no bottom dock. One corner **Menu** opens tools, navigation, optional dot
  assistance and sound/fullscreen controls. Readiness is temporary; the Duo menu pauses both
  lanes. A fully traced letter, including required dots, plays its approved name recording
  once (Duo: one shared announcement per round). Replay remains available and completion
  choices wait 700 ms after the final release. Original local music plays quietly, ducks under
  speech and stops on pause, hidden/native background or exit. Music has separate on/off and
  volume settings in `taman-jawi.music.v1`; master mute covers both voice and music. Fullscreen
  is requested at game entry. The existing tracing, scoring, save/copy protection and content
  gates remain enforced. See [delivery and verification](FULLSCREEN_TRACING_AUDIO_VERIFICATION.md)
  and [the music record](BACKGROUND_MUSIC_ASSETS.md).
  **Checked:** 156 unit tests; checked production build (37 models, 8 ready lessons);
  124 unique Chromium/WebKit browser passes and eight documented skips, with zero unresolved
  failures in the selected checks. All 37 letters fit across seven Chromium and four WebKit
  viewport journeys; phone, tablet, desktop/4K and menu/completion/copy captures were inspected.
  Real packaged music and completion speech play in Chromium. All 68 protected inputs match
  the resume snapshot; 66 match the original task snapshot, with catalogue/validator changes
  already present from the separate glyph-model work. No content or audio approval was added.
  **Limits:** Windows WebKit native 4K/media/AudioContext; CDP-only touch cases; physical-device
  fullscreen and listening review remain pending. Nobody has auditioned/approved the music.
  At that stage no new APK, Android sync, deployment, commit or push had been made; the 1.0.6 APK and
  the project save followed later on 4 October (below). The test helper neutralises
  native fullscreen for automated resizing; explicit fullscreen/bridge checks use their own stubs.
- **Glyph-matched tracing models (4 October, approved by the owner):** after the user's “proceed”
  twice, 27 tracing models were redrawn from the catalogue glyph centreline so the game draws the
  letter **Isi kandungan** shows: Ta marbutah, Zal, Ra, Zai, Ain, Ghain, Qaf, Lam, Mim, Nun, Wau, Va,
  Ha ه, Hamzah, Ya, Ye, Nya, Jim, Ca, Ha ح, Kha, Dal, Ta ط, Za, Nga, Fa, Pa. Each moved to a new revision and, after the
  owner tested them in the app, was approved on 4 October together with Kaf and Ga (all 29 pending
  revisions); recordings are untouched.
  Strokes may now author `displayWidth` (30–76, default 76) so the Jejak Ceria guide matches the
  letter's weight and loops stay open; matching tolerances do not use it. Writing orders are proposals;
  Ain, Ghain, Hamzah, Jim, Ca, Ha ح, Kha and Nga became two strokes and Mim one; Ha ه is one self-crossing stroke in the order the owner drew. Sa and Syin met the
  acceptance numbers and are unchanged. The comparison gate (`scripts/compare-model-to-glyph.mjs`)
  passes for all 27; 156 unit tests and the Chromium glyph spec pass at that delivery. The current
  production build and Chromium/WebKit layout checks include these models (see above).
  **Not done:** teacher review of the drawings, physical-device review, full WebKit glyph-mechanics
  checks, Android sync (the 1.0.5 package has the earlier models), and the optional exact-outline silhouette. See [delivery and verification](GLYPH_MATCHED_TRACING_MODELS_VERIFICATION.md),
  the [first plan](GLYPH_MATCHED_TRACING_MODELS_IMPLEMENTATION.md) and the
  [loop-fidelity plan](LOOP_LETTER_GLYPH_FIDELITY_IMPLEMENTATION.md).
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
  was pending until the owner approved both on 4 October (see above); at that earlier stage adult
  preview had both revised models while student and scored pools retained the other 35 approved lessons. All recordings, historical
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
- **Android release:** signed **1.0.6 (code 7)** was built on 4 October at the user's request with the
  approved glyph-matched models (APK SHA-256 `d7e5f9d7…3935`, 92 assets, same certificate); it also bundles
  the unverified fullscreen/music work. Not installed on any device. See [release](ANDROID_RELEASE.md). The
  paragraph below describes the earlier **1.0.5 (code 6)**, delivered under
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
  The current project save (4 October) includes the fullscreen layout, Kaf/Ga correction,
  tablet performance work, endpoint finish fix, fullscreen tracing/voice/music work, the approved
  glyph-matched models and releases through 1.0.6. Large generated screenshots (the fullscreen
  verification captures and the glyph-audit capture folder) stay local; the audit's metrics,
  sheets and capture measurements are tracked.
- **Recorded Windows limits:** Firefox launch failed with `spawn UNKNOWN`;
  WebKit rejected the tested WAV fixture. Reconsider when runtime/device changes.
  No physical pupil/device assessment is recorded.
- **Next application tasks:** (1) finish verifying the fullscreen tracing/voice/music work above, then
  audition the music and review it on devices; (2) install release 1.0.6 on a physical tablet and run native device review; (3) decide whether the
  eight earlier-approved letters should also get the loop and weight treatment, and whether to add the
  exact-outline silhouette; (4) a teacher review and physical pupil/device review of all 37 models remain
  pending, as no teacher assessment has been supplied.

Refresh this summary when facts change; retain dated evidence in its original
scope. Read [verification guidance](VERIFICATION_GUIDE.md) when selecting checks.
