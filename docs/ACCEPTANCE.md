# Acceptance record

Engineering implementation date: 2 October 2026. Current inventory: 22 models
approved by the project owner, 22 student-ready lessons and 15 unauthored models.
All 37 current name recordings are approved. The dated sections below record
each stage; pupil/device assessment has not been performed.

## Project-owner approval of the second additional batch — 2 October 2026

The user explicitly wrote **“approve”** after being shown the second group of
five models. Zal (ذ), Zai (ز), Syin (ش), Sad (ص) and Dad (ض) are approved at their
existing content revision 2, with reviewer/date/reference metadata pointing to
CONTENT_APPROVALS.md. Approval changes only these five statuses and review
records. Their shapes, dots, sequences, versions, all 32 other entries and all
37 approved recordings are preserved.

Jom mula → Huruf tersedia now shows all 22 approved lessons. Huruf permulaan
retains the original 12. Fifteen unauthored models remain unavailable, and the
five draft review cards disappear. Teacher rows show Diluluskan · pemilik projek
and the date. Student next-letter navigation now includes these five letters.

- Content validation, production build and all 59 unit checks passed.
- Eighteen focused Chromium/WebKit browser cases passed: all five letters
  complete in student play with approved revision-2, preview=false records;
  every required body/dot part is retained; student catalogue counts and teacher
  readiness match 22; Sin → Syin and Syin → Sad work. Approved Ba saves, adult
  preview access and audio failure handling still pass.
- Production Chromium compares the pre-approval catalogue, checks every approved
  recording hash, traces all five in student mode and captures phone/tablet
  catalogues plus teacher approval rows. No page errors, horizontal overflow or
  external runtime requests were recorded.

See output/verification/letter-batch-2-approval.json and
scripts/verify-letter-batch-2-approval.js. Earlier sections retain their dated
scope. This records actual project-owner approval, without inferring a named
teacher assessment or physical pupil/device trial.

## Second additional handwriting batch — 2 October 2026

Zal (ذ), Zai (ز), Syin (ش), Sad (ص) and Dad (ض) now have revision-2 models, each
with `pendingReview` geometry and no approval record. Zal, Zai and Syin reuse
the approved Dal, Ra and Sin paths. Sad and Dad share an original closed head
loop and a second movement for the tooth/bowl, with a separate lift at their join.
Dad additionally requires its upper dot; Syin requires all three dots.

Teacher review shows five authored-shape cards. Adult preview now offers 22
models while student entry and next-letter navigation retain the 17 approved
lessons. Fifteen catalogue entries still have no tracing model. The 32 other
entries and all 37 approved recording files/metadata are preserved.

Numbered guides handle the shared loop start/stop and advance to the next movement
on release. The reward leaf moves to the lower corner and label placement reserves
space for it: visual QA
found and corrected a clash with Syin's final-dot label on the phone layout.
This changes label layout only, preserving trace targets, order and tolerances.

- Content validation, build and all 59 unit checks passed.
- Forty new Chromium/WebKit browser cases passed: all five models in play,
  guided and precision; every required dot; ordered head/bowl input; shared-loop
  numbering; draft-only access; separate adult/student next-letter actions;
  every body/dot guide stage at 320/768 pixels; native Chromium touch for Dad.
  Two corresponding WebKit touch cases skip because CDP dispatch is Chromium-only.
- Eight existing approval/entry/navigation cases passed, including approved Ba
  saves, Sa → Jim, student/preview catalogue counts and audio failure handling.
- Fourteen focused layout/guide cases passed after the decoration fix, including
  the new loop/guide rechecks, five earlier-batch layouts, all 12 original guide
  layouts, Ba's numbered dot, Mim's shared-point numbering and demo/copy isolation.
  The change has 58 distinct browser cases passing across these runs.
- Production verification traces all five, compares the 32 unchanged entries,
  checks all 37 approved audio hashes and captures 39 review/body/dot/result
  screens. No page errors, horizontal overflow or external runtime requests
  were recorded.

See LETTER_BATCH_2_REVIEW.md, tests/browser/letter-batch-2.spec.js,
scripts/verify-letter-batch-2.js and output/verification/letter-batch-2-production.json.
New model geometry/order remain pending approval. Earlier dated reports retain
their own scope; this implementation stage had 22 authored models and 17 student lessons.

## Project-owner approval of the first additional batch — 2 October 2026

The user explicitly wrote **“approve”** after reviewing the first five additional
models. Sa, Jim, Ca, Ha (ح) and Kha are now approved at content revision 2, with
reviewer/date/reference metadata in CONTENT_APPROVALS.md. Paths, dots, sequences,
versions, the 32 other entries and all 37 approved recording files are preserved.

Jom mula now opens all 17 approved lessons under Huruf tersedia. Huruf permulaan
still offers the original 12, and the 20 unauthored models remain unavailable.
The five draft cards disappear from the teacher screen; their approval rows
display Diluluskan · pemilik projek and the approval date.

- Content validation, production build and all 59 unit checks passed.
- Eighteen focused Chromium/WebKit browser cases passed: all five models complete
  in student play and save approved, preview=false records; student access shows
  all 17; Sa continues to Jim; Ba student saves, adult preview and audio failure
  handling still work. Missing dots still prevent completion.
- Production Chromium verifies only the five approval status/review changes,
  compares all 32 other entries exactly, checks the hashes of all 37 recordings,
  completes all five as a student and captures phone/tablet catalogues and teacher
  approval rows without page errors, overflow or external runtime requests.

See output/verification/letter-batch-1-approval.json and
scripts/verify-letter-batch-1-approval.js. Earlier draft reports below retain
their dated scope; this approval stage had 17 student-ready lessons.

## First additional handwriting batch — 2 October 2026

Sa (ث), Jim (ج), Ca (چ), Ha (ح) and Kha (خ) now have revision-2 centreline models,
separate required dot targets and ordered sequences. All five remain
`pendingReview` with no approval record. The existing 12 approved models and all
37 approved recordings are preserved. The catalogue now has 17 authored models,
12 student-ready lessons and 20 unauthored entries.

The teacher screen offers five authored-shape review cards. Adult preview adds
a Model tersedia filter, shows a dynamic model/draft count, and continues through
all authored models with Huruf seterusnya. Normal student entry still enables
only 12 lessons; leaving preview restores that selection.

- Production build and all 59 unit checks passed.
- 38 new Chromium/WebKit browser cases passed: five models in play, guided and
  precision modes; all required dots; draft-only access; next-letter navigation;
  every body/dot guide layout at 320/768 pixels; native Chromium touch at both sizes.
  Two WebKit native-touch cases skip because the CDP dispatch is Chromium-only.
- Production Chromium tracing of all five models passed. Thirty-three captures
  cover teacher review, body starts, every Sa/Ca/Kha dot stage and completions.
  No page errors, horizontal overflow or external runtime requests were found.
- All 32 other entries compare exactly with the pre-batch snapshot. All audio
  metadata and the hashes of all 37 approved recording files are unchanged.
- Thirty existing Chromium/WebKit regression cases also passed, covering student
  saves, catalogue access, audio failure handling, all 12 original guide layouts,
  demo/copy isolation, strict recovery, storage and responsive navigation.
  The combined browser total for this change is 68 passed and two CDP-only cases
  skipped. Firefox was not rerun because of the known Windows launch limitation.

See LETTER_BATCH_1_REVIEW.md, tests/browser/letter-batch-1.spec.js,
scripts/verify-letter-batch-1.js and output/verification/letter-batch-1-production.json.
New geometry/style and real child/device review remain pending. This section
describes that implementation stage; the dated records below describe earlier stages.

## Numbered tracing guides — 2 October 2026

The project owner subsequently wrote **“approve”** after reviewing the numbered
guide implementation and preview. Acceptance is recorded in
NUMBERED_TRACING_GUIDES.md and output/verification/numbered-guides-approval.json.
The 12 existing lessons keep the guides enabled.

Implemented the user's request for numbers showing where to start, follow,
stop and finish. Only the active stroke or dot displays its numbered touch
points, with Mula/Ikut/Henti/Siap/Titik labels and a short lifting instruction.
Numbers follow the authored movement sequence; for Ba the body uses 1–3 and
the final dot uses 4. Short strokes use start/end numbers. A closed loop uses
one badge at its shared start/stop position, changing from its start number to
its stop number after the middle. Labels are placed beside the route.

The guides do not intercept input or add matcher requirements. Existing paths,
content/audio revisions, 37 audio approvals and 12 model approvals are preserved.
Demonstrations and blank copying hide the numbers. The current waypoint fills;
passed waypoints fade, and numbers advance only with actual tracing progress.

- Build and all 59 deterministic unit checks passed.
- 44 distinct Chromium/WebKit browser cases passed across the broader run and
  four affected rechecks. They cover numbered start/dot input, body/dot lifts,
  Mim's loop and next stroke, demonstration/copy isolation, play recovery,
  dot containment/pads, complex-letter jitter, strict rollback and student saves.
- All 12 initial guide layouts passed containment and readability checks at
  320 and 768 pixels. Other preschool controls still pass the existing
  320/390/768/1280/short-landscape responsive checks.
- Eight production screenshots cover Ba's body and final dot, Mim's loop stop,
  Kaf's short second stroke, Ta's separate dots, Alif and Sin, at widths
  320/390/768/1280. Production numbered-dot input completes Ba in student mode.
  No horizontal overflow, page errors or external runtime requests were recorded.
- Current catalogue metadata and all audio hashes match the prior approved set;
  the app continues to report 12 student-ready lessons.

The first run used eight browser workers and timed out in four navigation/layout
cases. The all-letter visual check now reuses the student garden rather than
reloading through the teacher screen for every letter. It and the two strict
jitter cases passed when repeated with two workers; no tracing rule was relaxed
and the existing strict test timeout was not increased.

See NUMBERED_TRACING_GUIDES.md, tests/browser/numbered-guides.spec.js,
output/verification/numbered-guides-production.json and numbered-guides screenshots.
Physical child/device review of the new cues remains pending.

## Project-owner approval of all current name recordings — 2 October 2026

The user explicitly wrote **“approve all”** after being directed to review all
37 current name recordings. All 37 are now approved at their existing revisions,
with project-owner reviewer/date/reference metadata in AUDIO_APPROVALS.md.
Audio bytes, sources, transcripts, versions and all geometry are unchanged.
The app now reports 12 student-ready lessons; 25 missing models remain unavailable.
Jom mula opens the student letter garden directly, without the adult-preview gate.

- Checked production build and all 59 unit checks passed.
- 45 focused Chromium/WebKit browser checks passed across the game, audio,
  student approval flow, entry helper, Alif/Lam pilot, splash navigation and
  narrow-screen branding runs.
  Three Windows WebKit audio cases skip for the known runtime codec limitation.
- Native student Ba completion saves preview=false and approved audio/model
  statuses in both engines. Teacher review shows all 37 audio approvals.
- Production Alif, Qaf and Lam (WAV) teacher playback and Ba student playback
  passed in Chromium. All 37 source/build/HTTP hashes match; phone/desktop
  approval layouts have no overflow, page errors or external requests.

Evidence: output/verification/audio-approval-summary.json,
output/verification/audio-approval-metadata.json,
output/verification/audio-approved-production.json and audio-approved screenshots.
Physical tablet/pupil testing remains pending. The sections below are historical.

## Supplied alphabet recording replacement — 2 October 2026

Replaced 27 matching letter-name recordings from voices/alphabet (21 MP3 and
6 WAV). The other 10 entries retain their files, metadata and revisions.
The user explicitly mapped 20_kof.mp3 to Qaf (ق), keeping Kaf (ک) unchanged.
Supplied bytes and formats were preserved; no new audio was generated.
All 37 active recordings remain pendingReview with null review metadata.
The 12 model approvals and all non-name-audio content remain unchanged.

- Build and 59 unit checks passed; 9 focused Chromium/WebKit browser cases
  passed, with three Windows WebKit audio cases skipped for the known runtime
  limitation. All 37 active files decoded to non-silent audio in Chromium.
- Source/build/HTTP hashes match for all 37 active recordings (1,761,779 bytes),
  with HTTP 200 and correct MP3/WAV content types. All original source files
  and public assets remain unchanged.
- Teacher playback passed for Alif, Qaf and Lam (WAV); Ba lesson playback passed.
  Review layouts at 1280, 390 and 320 pixels have no overflow, page errors or
  external runtime requests.

See AUDIO_REPLACEMENT_REVIEW.md and output/verification/alphabet-audio-*.json.
The records below describe earlier stages and their inventories at those times.

## Synthetic audio update — 2 October 2026

The user authorised generation and preview use of Jawi name recordings, with
pronunciation review deferred. All 37 letter-name MP3s are now linked locally;
audio status remains pendingReview, review metadata remains null, all 12 model
approvals are preserved and zero lessons are student-ready.

Added Ruang guru → Semakan suara Jawi, with a 37-letter selector, explicit
listen/replay, next selection and draft transcripts. Pilot lessons use their own
recording through Dengar/Dengar nama. Selection or playback never grants approval.

- 59 unit tests passed; checked production build passed.
- 27 Chrome/WebKit browser checks passed; three Windows WebKit audio checks
  skipped because AudioContext is absent and actual MP3 playback returns
  NotSupportedError. Its unsupported-file feedback and review UI were checked.
- All 37 files decoded as non-silent speech in Chromium, within tested duration,
  signal and clipping bounds. This is not a pronunciation assessment.
- All 37 source/build/HTTP SHA-256 values matched the generation log; production
  returned audio/mpeg and HTTP 200 for each file, totalling 441,936 bytes.
- Production Alif teacher playback and Ba lesson playback passed in Chromium.
  Desktop, 390- and 320-pixel review layouts had no overflow or page errors, and
  playback made no external runtime requests.

See AUDIO_DRAFT_REVIEW.md, output/verification/draft-audio-generation.json,
output/verification/draft-audio-production.json and the draft-audio screenshots.
Pronunciation review and physical Safari/Android playback remain pending.
The records below describe the earlier stages and their inventories at that time.

## Implementation status

The React/Vite application, ordered SVG tracing engine, 37-entry catalogue,
12-model adult preview, demonstrations, guided/precision practice, copy capture,
audio integration, teacher diagnostics, local progress and documentation are
implemented. No deployment or publication occurred.

## Initial game verification record

| Check | Result |
| --- | --- |
| Deterministic unit tests (`npm test`) | 30 passed |
| Full Chromium + WebKit browser run | 44 passed |
| Subsequent persistence regression run | 6 passed, including 2 new quota-error cases |
| Manifest/file check | 37 entries, 12 draft models, 0 student-ready lessons; valid |
| Production build | Passed |
| Production preview smoke | Native Alif tracing reaches result; 0 page errors, 0 failed requests |
| Visual capture | 6 screenshots; 0 page errors, 0 external runtime requests |
| Firefox | Browser launch failed before interactions; unverified |

The persistence run repeats four cases from the full run and adds the quota case
in each browser, so **46 distinct Chromium/WebKit browser cases passed across
the completed runs**. The final persistence changes were checked with the relevant
native tracing/copy and corrupt/unavailable/quota storage flows. The suite covers:

- Independent line, curve, loop and quantised tight-turn fixtures.
- Valid tracing versus wrong starts/direction/order, endpoint taps, teleports,
  sparse samples, curved shortcuts, nearby branches, scribbling and dwell.
- Required marks, separate tap gestures, guided resume, precision continuity,
  cancellation and deviation budgets.
- Content gating, malformed geometry, missing review/recording metadata,
  corrupted/unavailable storage, audio failure/replay/mute and stale narration.
- Native mouse flows for all 12 draft pilot models, real input handlers,
  demonstration isolation, copies, teacher export/reset, navigation and reduced motion.
- Real browser cancellation/capture release, interference from an extra contact,
  viewport changes and drawing outside the board.
- 320, 768 and 1280 CSS-pixel layouts; Chromium emulated native touch at 768/DPR2
  and 390/DPR3 through browser input dispatch. Emulation is not hardware validation.
- Rendered welcome, catalogue, lesson and teacher screens; local font delivery
  and no external runtime requests during screenshot capture.

## Hanana Academy branding update — 2 October 2026

Implemented the supplied company logo on a launch splash, beneath the welcome
note and in the shared footer. The original 375 × 181 PNG is copied unchanged
to `public/branding/hanana-academy-logo.png`; the source, public copy, production
copy and served production response match exactly.

The splash automatically continues after 1,800 ms, offers immediate `Teruskan`,
and does not replay during navigation. Reload shows it again while preserving
the existing local progress. Normal screens are unmounted during the splash;
focus moves from the continue button to the welcome heading. Slow or failed
image loading cannot block continuation. Missing logos have a text fallback,
with reserved image dimensions to prevent layout movement. The footer credit
remains visible on phones. No teaching assets or tracing rules were changed.

| Check | Result |
| --- | --- |
| Existing unit suite | 30 passed |
| Production build and content validation | Passed; 37 entries, 12 draft models, 0 student-ready lessons |
| Focused branding suite, Chromium + WebKit | 12 passed |
| Broader Chromium + WebKit run | 56 passed; 2 precision test coordinate failures investigated and corrected |
| Focused precision regression after helper correction | 2 passed |
| Final existing game-flow suite, Chromium + WebKit | 20 passed |
| Pilot tracing in the broader run | All 12 letters passed in both browsers: 24 cases |
| Emulated native touch in the broader run | 2 Chromium cases passed at tablet/DPR2 and phone/DPR3 |
| Responsive capture | 14 screenshots, 0 page errors, 0 external runtime requests, no horizontal overflow in the five captured layouts |
| Production preview smoke | Local logo HTTP 200; real-clock auto continuation, manual continuation, focus transfer, logo fallback and native Alif completion passed |
| Splash CSS zoom smoke | 200% at 1280 × 900 passed without horizontal overflow |
| Firefox launch check | Still fails with `spawn UNKNOWN`; interactions unverified |

**58 distinct Chromium/WebKit browser cases passed across these runs.** This
includes the 12 branding, 20 existing game-flow, 24 pilot and 2 touch cases; it
does not claim a single final 58-case run. The final game-flow rerun covers every
case affected by the shared board-coordinate helper change.

The two broader-run failures occurred because clicking `Kurang panduan` scrolled
the page and placed the Alif start point above the viewport. The tests now scroll
the board into view before measuring coordinates, matching normal user access
to the board. Their assertions and the precision validator remain unchanged.
An initial narrow-screen splash overflow was also corrected by bounding the
grid track and allowing its content to shrink; both browser layout checks pass.

Screenshots were checked at widths 320, 390, 768 and 1280, and a short
844 × 390 landscape viewport. The splash scrolls when needed on short screens.
Keyboard focus, reduced motion, failed/delayed image requests, timer cleanup,
reload persistence and mobile footer visibility have focused browser coverage.
The zoom smoke is a CSS zoom check, not a claim of testing every browser's native
zoom or assistive technology.

Evidence: `output/verification/branding-production-smoke.json`,
`output/verification/branding-summary.json`, `output/screenshots/render-check.json`
and the splash/welcome/lesson captures in `output/screenshots/`. Run
`node scripts/verify-branding-preview.js` against the built preview on port 4173
to repeat the production smoke. No deployment or publication occurred.

## Strict tracing update — 2 October 2026

Implemented the subsequently authorised rules in
`docs/STRICT_TRACING_IMPLEMENTATION.md`. The matcher now controls visible ink
through per-event decisions. Valid stroke ink uses actual delivered coordinates;
rejected movement remains in bounded session diagnostics. Wrong starts,
excursions, shortcuts and substantial reversals block the held gesture until
release. Rejection removes that gesture's provisional ink and restores its
baseline, including earlier clean guided prefixes. Completed parts survive.

Clean guided early lifts can resume; continuous precision strokes restart after
an early lift. Cancellation and resize clear unfinished work. Tap dots validate
containment and cumulative travel during movement and on release. They produce
no freehand trails; each accepted tap stamps one authored target as explicit
assistance, with actual tap positions retained separately. Copying remains free
writing. Fixed v2 profiles and optional strict policy/metrics fields preserve
older storage-version-1 records and numeric demonstration assistance.

| Check | Result |
| --- | --- |
| Deterministic unit suite | 43 passed |
| Checked production build | Passed; 37 entries, 12 draft models, 0 student-ready lessons |
| Full Chromium + WebKit browser run | 71 passed in one run |
| Pilot coverage within that run | All 12 models in both browsers: 24 cases |
| New strict browser cases within that run | 12 passed: wrong starts, held-pointer re-entry, both modes, guided rollback, Ta scribbles and raw-coordinate jitter |
| Native input emulation within that run | Chromium touch at 768/DPR2 and 390/DPR3, plus pen: 3 passed |
| Existing game and branding checks within that run | 32 passed: copying, cancellation, capture loss, layout, storage, audio handling, splash and logo |
| Responsive strict captures | 18 screenshots; 0 page errors, 0 external runtime requests, no overflow at 320/390/768/1280 widths |
| Production preview | Strict Alif rollback, held-pointer blocking and clean retry passed; logo, splash, focus and fallback passed; 0 page errors or failed/external requests |
| Firefox launch retry | Still fails with `spawn UNKNOWN`; interactions unverified |

The first focused run found two verification-coordinate errors: a phone's
wrong-start point was outside the SVG and WebKit quantised requested pointer
coordinates. The phone case now starts inside the board; the raw-ink assertion
compares ink against the native event actually delivered. All four affected
cases passed before the full run. No profile or geometry was widened to pass.

Capturing a full-page screenshot during a held gesture resizes Chromium's
viewport and correctly invokes cancellation. Held-gesture captures therefore
use ordinary viewport screenshots; finished states can use full-page capture.
The capture helper also recognises the catalogue's visited-letter label when
repeating the same letter at another width. Accepted, rejected, dot and copying
images were visually inspected.

The strict performance record measures native Sin input on the same Windows
headless Chromium host: 284 handler observations, mean **0.096 ms**, maximum
**0.50 ms**; 283 animation-frame observations of SVG ink, median **0.30 ms**,
p95 **0.40 ms**, maximum **0.60 ms**. This is handler/DOM availability timing,
not physical display, finger or stylus latency. Real device and pupil calibration
remain pending. A clean guided completion after rejected attempts is completion
of the required parts, not a claim of a mistake-free session or handwriting mastery.

Evidence: `output/verification/strict-tracing-summary.json`,
`output/verification/strict-tracing-performance.json`,
`output/screenshots/strict-render-check.json`, strict screenshots in
`output/screenshots/`, and the refreshed
`output/verification/branding-production-smoke.json`. No deployment occurred.

## Jejak Ceria preschool update — 2 October 2026

Implemented the authorised `docs/PRESCHOOL_PLAYFUL_TRACING_IMPLEMENTATION.md`.
The default lesson now uses a separate assisted matcher and a compact board-first
layout. Ordered forward input reveals a warm colour fill, a dotted trail and a
large frontier marker. Ordinary excursions pause the fill without erasing the
accepted prefix. A held pointer or a new gesture can re-acquire the frontier;
acquisition earns no coverage and does not bridge invalid movement. Lifts,
cancellation, capture loss, resize and demonstrations preserve play progress.

Board dots require separate contained taps. The equivalent 64-pixel-high pad
supports mouse, touch, keyboard and virtual activation, with drag containment,
travel limits and one target per release. Failed dot actions keep the body.
An original smiling leaf and flower reward lasts 1 second; reduced motion uses
static decoration. Replay and the next letter require deliberate choices.
The idle cue never scores input. Optional reward/instruction audio assets were
not added; the existing missing-recording and mute/replay handling remains.

The teacher area selects play, guided or precision for a new attempt. Strict
v2 profiles, rollback, raw ink and precision budgets are preserved. Blank
copying still saves actual unrestricted drawing. Play outcomes and exports
explicitly distinguish assisted fill, raw movement, board taps, equivalent pad
coordinates, projected coverage, turn allowance and terminal display fill.
Numeric `assistance` remains the demonstration count; legacy, strict and play
records remain readable in storage version 1. Content versions, geometry
approvals, audio states and the supplied company artwork are unchanged.

### Verification

| Check | Result |
| --- | --- |
| Final deterministic unit suite | 58 passed: 43 prior checks and 15 assisted-matcher cases |
| Full Chromium + WebKit suite | 120 passed in one run |
| Final cue-size regression | 4 affected native dot/layout cases passed in Chromium + WebKit after visual-only arrow/plus scaling |
| Pilot input within that run | All 12 models in both play and guided, in both browsers: 48 cases |
| Play interaction checks within that run | 22 passed, including complex Sin/Kaf/Mim hand jitter |
| Strict regression within that run | 12 passed, entered through teacher controls |
| Native input emulation within that run | 6 Chromium touch/pen cases across strict and play; tablet/DPR2 and phone/DPR3 |
| Existing game and branding within that run | 32 passed, including actual copying, storage failures, audio handling, splash and unchanged logo |
| Checked production build | Passed; 37 letters, 12 draft models, 0 student-ready lessons |
| Responsive capture | 28 images across 320 × 740, 390 × 844, 768 × 1024, 1280 × 1000 and 844 × 390; no horizontal overflow, page errors or external runtime requests |
| Production preview | Strict Alif rollback/retry and assisted Ba pause/recovery/pad completion, plus splash, logo, focus, fallback and 200% CSS zoom checks |
| Firefox launch retry | Still fails with `spawn UNKNOWN`; interactions unverified |

The unit fixtures cover independent lines, curves, loops, quantised turns,
nearby branches, movement order, repeated acquisition, tiny repeated loops,
teleports, invalid coordinates, dot drags, pad containment, terminal assistance
and bounded diagnostic rotation. Native tests check retained colour, no raw
play ink, same-pointer recovery, lift/resize/capture loss, demo isolation,
keyboard repeat, failed pad drags, actual session exports and the 100-gesture
continuation action. Large controls and cues remain usable at the captured
phone/tablet/desktop and short-landscape sizes.

Native Sin/Kaf jitter exposed ambiguity at overlapping or sharp turns. The
correction selects genuine local projections using raw direction, checks the
intervening authored arc, and bounds extra projection credit to 18 units per
stroke. The source high-water mark and allowance persist across gestures and
diagnostic rotation. Repeated tiny loops still cannot fill a route. The used
allowance is recorded as `turnProjectionAllowanceUnits`, within assisted
projected coverage. No corridor, strict tolerance or content model was widened
to force completion.

An earlier browser run also exposed two verification issues: SVG paint is
batched, so comparing immediately could read an earlier frame in WebKit; and
overlapping test jobs shared and removed each other's report files. The helpers
now wait for the relevant frame, and the final full suite ran on its own. The
application's paused state and input decisions were not changed to conceal
those reporting issues. The small-screen teacher button now has a stable
accessible name even when its visible text is hidden.

The final visual polish scales the arrow and plus symbol with the large play
marker so they stay legible on small boards. The affected native dot and layout
checks are repeated after this visual-only change; production smoke and visual
captures use the final build. The full 120-case run precedes that cue-size polish.

Final headless Sin measurement: **284** native handler observations, mean
**0.270 ms**, maximum **1.20 ms**; **282** animation-frame observations of
available route fill, median **0.20 ms**, p95 **0.30 ms**, maximum **0.50 ms**.
This describes handler/DOM timing on this Windows Chromium host, not physical
display, finger or stylus latency. Raw buffers stay bounded at 18,000 samples
and 100 gestures; deliberate continuation retains play progress while rotating
diagnostic buffers and preserving aggregate metrics.

Evidence: `output/verification/play-tracing-summary.json`,
`output/verification/play-tracing-performance.json`,
`output/verification/branding-production-smoke.json`,
`output/screenshots/play-render-check.json` and `play-*.png` captures.
The full browser report remains in `playwright-report/`; the final cue checks
use a separate output directory. No deployment or publication occurred.
Actual teacher/pupil and physical device review remain pending.

## Runtime limitations

The downloaded Firefox 1543 executable fails to launch with `spawn UNKNOWN` on
this Windows host, including a separate attempt outside the process sandbox.
No Firefox interactions passed; its project remains available for a functioning
runtime. The browser executable has a valid AMD64 PE header, but the OS launch
failure was not resolved by this implementation.

Windows Playwright WebKit rejects the actual PCM WAV fixture with
`NotSupportedError` (media error 4), despite advertising WAV capability. The game
reports unsupported playback correctly. Successful audio decoding is verified
in Chromium, and still needs testing in a supported WebKit/Safari audio runtime.
Denied-playback and replay handling are separate checks.

## Teaching readiness

**Zero student-ready lessons.** All 12 supplied geometries are unreviewed drafts,
the other 25 models are pending, and all 37 name recordings are missing. No
teacher identities, approvals or pronunciation assets have been fabricated.
See CONTENT_REVIEW.md and AUDIO_RECORDING.md for the exact inventory and workflow.

Teacher/pupil calibration, physical iPad Safari and Android Chrome, real stylus
pressure, handwritten model review and actual pronunciation review are pending.
There is no independent handwriting recogniser and no official KPM TP scoring.

## Performance scope

The input controller measures handler time and bounds each attempt to 18,000
samples and 100 gestures. Copy drawings retain at most 700 points per gesture
and 12 drawings in storage. Rendering is batched to animation frames. These are
engineering bounds, not a claim of universal 50 ms display latency.

A tracing measurement is saved in `output/verification/tracing-performance.json`.
On the AMD Ryzen 7 5700X / Windows 10.0.26200 host, Node 24.19.0 and headless
Chromium 153.0.8010.12, a native mouse Sin trace at 1280 × 1000 / DPR1 produced
284 input-handler measurements: mean **0.094 ms**, maximum **0.50 ms**.
283 animation-frame observations of available SVG ink had median **0.30 ms**,
p95 **0.50 ms** and maximum **0.70 ms** in this headless session. Headless input
and frame scheduling differ from physical screen updates; these values are not
end-to-end display, pupil-finger or stylus latency. Physical device latency and
teacher calibration still need verification.
