# Fullscreen tracing, completion voice and background music

**Prepared:** 4 October 2026, Asia/Kuala_Lumpur.  
**Status:** Implemented and verified locally on 4 October 2026 after the user's “proceed”
and continuation. See [delivery and verification](FULLSCREEN_TRACING_AUDIO_VERIFICATION.md),
[current project state](PROJECT_STATE.md) and [the music record](BACKGROUND_MUSIC_ASSETS.md).
The text below is the original proposal.  
**Request:** Remove the tracing game's bottom panel and its buttons, make the
game fullscreen, say the letter after it is fully traced, and add friendly music.

## Intended result

During tracing, the child sees a large, centred letter on the writing paper.
The bottom panel, instruction rows, encouragement row and button strip disappear
completely. Their reserved layout space also disappears. Numbered guides and
required dots stay on the letter. A small menu in a safe corner provides access
to tools when needed; it does not become another permanent toolbar.

After the complete letter is validated, including every required stroke and dot,
the game plays that letter's existing approved name recording. Gentle, cheerful
instrumental music plays quietly during the game and lowers while the voice plays.

This proposal covers Jejak Ceria practice, Cabaran Solo and Duo tracing. It also
keeps adult guided/precision tracing usable through the same compact tools.
Copying retains its separate writing and save flow. The catalogue, setup screens
and teacher records retain their current layouts apart from new music settings.

This replaces the permanent tracing-dock decision in
[the earlier fullscreen plan](FULLSCREEN_GAME_LAYOUT_IMPLEMENTATION.md).
That document and its delivered verification remain historical records.

## Current implementation findings

| Area | Confirmed source and implication |
| --- | --- |
| Screenshot controls | `RaceTracePane.jsx` renders **Saya sedia!**, **Lihat contoh**, retry and status inside `.race-dock`. `MatchScreen.jsx` adds the bottom readiness note. Removing only the background would leave the controls and wasted space. |
| Practice panel | `BookLessonScreen.jsx` supplies `.lesson-dock` through `TraceBoard`'s `renderSupport`. It contains navigation, audio, demonstration, retry, help and dot assistance. |
| Space allocation | `fullscreen.css` reserves a second row in `.fitted-trace`, with further phone, tablet, race and smartboard overrides. All applicable dock-height reservations need removal. |
| Letter fitting | `fitTraceViewport()` already fits the complete authored letter and dots uniformly. `TraceBoard` measures the stage and maps screen input back into logical coordinates. Reuse these mechanisms. |
| Completion | Practice's `BookActivity.finish()` saves the result and stops audio. Matches validate through `TraceBoard.onValidated` and `MatchScreen.complete()`. These are the relevant completion integration points. |
| Voice playback | `audioManager.js` owns one foreground recording, cancels stale requests and handles blocked/unsupported playback. It has no ended/error lifecycle notification for coordinating music yet. |
| Recordings | The catalogue has letter-name recordings; pronunciation examples are currently absent. “Sound of the alphabet” will use the existing letter name, rather than inventing a phonics recording. |
| Music | There is no background-music player or music asset in the current audio flow. It needs a separate playback channel. |
| Fullscreen | `platform/fullscreen.js` supports browser and native Android toggling. Android already starts in native fullscreen. Browser entry should request fullscreen from the user's game-entry action. |

Findings describe the inspected source, not a runtime verification of this proposal.

## Fullscreen tracing experience

### Active play

- Remove `.lesson-dock`, `.race-dock`, `.race-dock-controls`, their persistent
  support rows and `.arena-ready-note` from tracing presentation.
- Remove the dock grid rows and responsive height budgets. Give the freed space
  to the tracing stage; do not leave a blank strip at the bottom.
- Replace the practice header and challenge toolbar with one small **Menu**
  control. Keep only compact contextual information where needed: letter/page
  identity in practice, and player identity, score, round and time in challenges.
  Keep this information at the edges, without a full-width panel.
- Keep the existing paper, numbered start/follow/finish cues, resume cues and
  active dot indication. Remove duplicated permanent prose below the letter.
  Retain accessible status announcements and show essential error/recovery cues
  briefly within a safe area of the stage.
- Use at least 48 CSS-pixel menu targets on small screens and larger targets
  where space allows. Keep the menu, status badges and letter guides clear of
  each other and of system cutouts.
- Fit each full letter uniformly inside the remaining safe drawing rectangle.
  Reuse the existing complete-letter envelope and guide clearance. Its position
  stays stable through tracing, dot entry and completion; progress does not move
  the letter. Duo retains two equal, independent drawing stages.
- Keep the existing insufficient-space guidance. Hiding overflow must not crop
  a required dot, guide, control or usable drawing area.

The screen fills the usable browser viewport even when browser fullscreen is
unavailable. At entry, request browser fullscreen during the user's click/tap
using an idempotent **enter fullscreen** helper, rather than blindly toggling an
already fullscreen session. Settle any resulting resize before enabling tracing
or starting the match countdown. Failure leaves a fitted, playable screen with
an optional retry in the menu. Native Android reuses its fullscreen bridge and
inset handling. Escape, Android Back and later resizing remain supported.

### Where the removed actions go

| Action | Proposed replacement |
| --- | --- |
| **Saya sedia!** | A temporary pre-round readiness overlay. Solo has one start action; Duo retains one ready action for each player and starts the shared countdown only when both are ready. |
| **Lihat contoh / Tunjuk cara** | Available before play or from the menu. Demonstrations remain optional and never count as a completed trace. A pre-round demonstration must leave the letter visible, then restore the ready choices. |
| **Cuba lagi** | Menu action. In practice it starts a fresh attempt; in Duo it resets only the selected player's attempt and retains the current shared timing rules. |
| **Dengar** | Menu replay and completion-overlay replay. Automatic playback handles a successful full trace. |
| **Panduan / Kenal huruf** | Fitted help overlay opened through the menu. |
| Previous/next page and contents | Practice menu while unfinished, and a clear next-page action in the completion overlay. Preserve book boundaries and page-turn protection. |
| Dot-pad assistance | Direct taps on the letter are the primary path. A small, on-demand assistance popover reuses the existing `DotTapPad` for the current required dot. There is no permanent bottom dot button. |
| **Teruskan jejak** at the ink/diagnostic limit | A fitted recovery prompt exposing the existing continuation action. Removing the dock must not leave an exhausted attempt stuck. |
| Music, master mute and fullscreen | Menu controls. Adult settings also expose music on/off and music volume. |
| Pause and exit | Menu and existing interruption/exit overlays. Preserve shared match pause, countdown and abandoned-match handling. |

Opening the challenge menu pauses both players, cancels held contacts and stops
demonstrations through the current pause flow. Normal resume requires fresh
contact and the existing shared countdown. Practice tools cancel held contact
and suspend input while open without discarding accepted tracing progress.

Dot assistance needs a specific flow: choose it while paused, close the ordinary
menu, resume through the existing countdown, then expose only the selected lane's
current dot popover during active play. The popover uses existing validation,
input provenance and fresh down/up rules; it never commits a dot while paused.
It must fit outside the letter/guide envelope. Repeated assistance can be used
for subsequent dots without creating a permanent panel or changing scoring.

Completion shows a brief celebration over the completed letter, then fitted
next/replay/again choices. It never opens a bottom dock, automatically advances
the page, or lets the final tracing release activate a newly appeared button.
Copying keeps an explicit **Simpan untuk guru** action and the current unsaved
copy confirmation, using its own compact tools and result flow.

## Letter-name playback after completion

1. Trigger from accepted full-letter completion, after the required release.
   Partial coverage, endpoint readiness, an individual stroke, a demonstration,
   a timeout and a saved freehand copy must not trigger the completion voice.
2. Practice uses the existing completion guard, keyed to the letter and attempt.
   Solo uses the accepted match completion, keyed to match and round. Retrying
   creates a fresh eligible attempt; rerendering or reopening saved results does
   not replay the recording automatically.
3. Duo plays one shared name announcement immediately after the first accepted
   complete letter in that round. Both players are tracing the same letter;
   the second completion keeps its own visual result without restarting or
   overlapping the voice. Each new round can announce again.
4. Use `letter.audio.name` from the catalogue through the existing audio manager.
   Keep student approval checks and explicit adult-preview behaviour. Do not
   replace, generate or reapprove any letter recording for this change.
5. Save progress, record the validated completion time and calculate scores
   independently of playback success or duration. The other Duo player's clock
   continues under the existing rules while the announcement plays.
6. Audit current `audio.stop()` calls. Leaving, changing letters, retrying,
   pausing or backgrounding cancels stale speech. Entering the round-result
   state must allow the current round's completion announcement to finish.
7. Start from the tracing interaction where practical and prepare playback
   during game entry. Handle autoplay denial, missing files, decode errors and
   interruptions explicitly. A small completion replay action can retry from
   a fresh gesture. Failure still permits normal game completion/navigation.
8. Master mute applies to both voice and music. Manual replay follows the same
   voice priority and music-lowering behaviour as automatic completion.

## Friendly background music

### Sound direction and asset

Create one original instrumental loop for Taman Jawi during implementation:
approximately 45–60 seconds at a gentle 90–105 BPM, with soft mallet/bell melody,
light plucked accompaniment and restrained percussion. Keep it cheerful and
predictable, without lyrics, spoken prompts, sudden loud changes or busy effects.
The loop should have a clean boundary without an obvious click or abrupt stop.

Package it locally under `public/audio/music/`, using a broadly compatible MP3
and retaining a reproducible composition/source record and asset checksum.
Record authorship, creation method and usage rights in
`docs/BACKGROUND_MUSIC_ASSETS.md`. No external stream, downloaded commercial
track or account connection is needed. Audition the actual loop and its boundary
during implementation; do not claim teacher or pupil approval from technical QA.
No music asset is being created as part of this document-only request.

### Playback and controls

- Add a separate music manager alongside the foreground audio manager. Use one
  loop instance for the session so changing letters does not layer tracks or
  restart the melody unnecessarily.
- Default music to enabled at a quiet level, initially about 15% player volume.
  Keep the existing voice default of 80%. These are initial mixing values to
  audition, not measured loudness guarantees.
- Start only after a game-entry interaction permits audio, during practice and
  challenge play. Stop outside the game, in teacher/audio review, during pause,
  while hidden/backgrounded and at final exit/results. A return to the game
  respects the saved preference and platform interaction requirements.
- During ready screens and countdowns, use a quieter level. During completion
  and foreground replay, fade music down to about 3–4% or silence if needed for
  clarity. Restore it after voice ends, fails or is cancelled, only if the game
  is still active and music remains enabled/unmuted.
- Expose **Muzik hidup / Muzik mati** separately from master mute, so adults can
  keep letter speech while disabling music. Provide a separate music-volume
  setting in the teacher area. Avoid another permanent sound button strip.
- Store music enabled/volume in a small, versioned preference record, separate
  from learning progress and match history. Handle unavailable or invalid
  storage with safe in-memory defaults.
- Use completion/error/cancellation notifications and request generations to
  coordinate voice and music. Stale playback events must not restore music
  after pause, exit, a newer voice request or a mute change.
- Audio load/playback failure must not block tracing, freeze a countdown or
  repeatedly prompt the child. Offer a deliberate retry through the menu.
- Keep playback outside the pointer/matcher path and avoid animation or React
  updates on every music tick. Preserve the lightweight Android presentation.

## Implementation scope

| Files/area | Planned work |
| --- | --- |
| `src/App.jsx` | Own music/settings lifecycle, master mute and game-only header/menu presentation; prepare audio and fullscreen from entry gestures. |
| `src/screens/BookLessonScreen.jsx` | Replace the practice dock with menu, help/recovery and completion overlays; connect full-letter voice; retain book/copy navigation guards. |
| `src/screens/MatchScreen.jsx` | Move readiness into temporary overlays, remove bottom note, expose paused tools, deduplicate round speech and keep timing independent. |
| `src/components/RaceTracePane.jsx` | Remove the race dock and button strip; retain lane identity, stage and compact result status. |
| `src/components/TraceBoard.jsx` | Support a stage-only presentation and on-demand status/dot/recovery rendering. Reuse existing engines and completion callbacks. |
| `src/components/DotTapPad.jsx`, `FitDialog.jsx`, `AudioControls.jsx` | Reuse existing input and overlay behaviour; adapt presentation only where necessary. |
| New shared tracing-menu component | Common compact actions with lane-aware match tools, focus management and clear Malay labels. |
| `src/styles/fullscreen.css`, `book.css`, `match.css` | Remove all tracing dock reservations and fit safe corner controls, overlays and equal Duo stages across responsive rules. |
| `src/audio/audioManager.js` | Add bounded voice lifecycle hooks while preserving approval gating, cancellation, mute and volume behaviour. |
| New `src/audio/musicManager.js` and preference module | Independent loop, fades, voice priority, lifecycle cleanup and persisted music preferences. |
| `src/screens/TeacherScreen.jsx` | Add music enabled/volume settings without overcrowding the fitted settings page. |
| `src/platform/fullscreen.js` | Add safe entry-to-fullscreen alongside the current toggle; retain native bridge behaviour. |
| `public/audio/music/` and music asset document | Local loop and provenance, created only after implementation authorisation. |
| Affected tests and browser helpers | Adapt removed-control journeys and add meaningful completion/music/fullscreen regressions. |

Preserve authored paths, dot coordinates, writing order, content/audio revisions,
approval records, readiness gates, Jejak Ceria default, endpoint confirmation,
matching tolerances, scoring rules, existing attempts and saved copies. Kaf/Ga
remain under their current geometry-review gate. Assisted dots continue to record
their actual input source and assistance. This task does not include deployment,
publication, a new APK or a release-version change. A later Android package should
include the local music through the existing asset-sync process.

## Work sequence after authorisation

1. Snapshot the protected teaching inputs and current affected source. Confirm
   the local server/build before reusing it.
2. Implement the shared compact tools and temporary readiness/recovery flows,
   then remove docks and their layout reservations. Inspect practice and both
   challenge layouts before connecting music.
3. Connect guarded completion-name playback and voice lifecycle events. Verify
   the final stroke/dot boundary and Duo deduplication.
4. Create/audition the original loop; add the separate music channel, controls,
   preference handling, voice lowering and pause/background cleanup.
5. Update affected journeys, run the checks below, fix relevant failures and
   inspect captures. Update current documentation and record the actual checks
   and remaining device limitations. Preserve historical reports.

## Acceptance and verification

Use [the verification guide](VERIFICATION_GUIDE.md) and existing browser helpers.
The following checks are planned; none has been run for an implementation yet.

- Run `npm test` once for the changed app/audio logic and `npm run build` once
  after edits settle. The build includes content validation. Add focused tests
  for playback generations, completion deduplication, voice lowering, errors,
  mute, preference fallback and cleanup rather than layout implementation details.
- Run affected Chromium and WebKit browser cases with at most two workers:
  fullscreen/book layout, Solo/Duo readiness/pause/navigation, tracing endpoint
  and numbered-dot flows, audio replay/failure, plus a new focused
  `fullscreen-tracing-audio.spec.js`. Adapt existing selectors without weakening
  input, scoring or content assertions.
- Inspect active tracing, readiness, dots, help/menu, completion, pause, rotation
  and insufficient-space states on portrait phones (320×600 and 390×844),
  tablets (768×1024, 1024×768 and 1280×800), desktop (1920×1080) and native 4K
  (3840×2160). Check Duo where usable; small Duo screens retain guidance.
  Verify no bottom dock/empty reserved strip, document scrolling, clipped
  guides, hidden required controls or menu/letter collisions. Recompute SVG
  screen coordinates after viewport changes or captures that move the page.
- Complete representative tall, broad, looping and dotted models: Alif, Lam,
  Mim, Sin, Ta/Syin and Ghain. Confirm a body's finish does not announce a letter
  with remaining dots. Compare every eligible model's fitted envelope for
  cropping, and exercise the current adult-preview gate for Kaf/Ga.
- Verify automatic voice plays once for a successful practice/Solo attempt and
  once per Duo round's first success, using the displayed letter's exact source.
  Check simultaneous completions, retry, next round, quick exit, muted play,
  missing/unsupported audio, replay and repeated rendering. Both-timeout rounds
  have no completion announcement. Audio must not change saved timestamps/scores.
- Decode and audition the actual music asset; check its loop boundary, quiet
  mix and voice clarity with representative existing MP3 and WAV names. Use
  instrumented playback for lifecycle assertions and actual media for codec
  evidence. Confirm no duplicate loops, stale restores or external music requests.
- Verify direct on-letter dots and optional assisted dots with fresh input,
  lane ownership and pause/countdown rules. Exercise keyboard/virtual dot
  activation, final-contact click protection and ink-limit continuation.
- Compare protected catalogue/recording/approval inputs to the before snapshot;
  confirm existing progress, copies, match records and content gates survive.
  Record command/selection, build, browser, viewport/input, totals and evidence
  for each completed check; rerun only when affected inputs change or failures
  remain unresolved.

Recorded environment limits still apply: Windows Firefox launch previously
failed with `spawn UNKNOWN`, and the tested WebKit WAV fixture was unsupported.
Unsupported-file feedback is not proof of successful sound playback. Physical
Android/tablet/smartboard and Safari audio/fullscreen review remains unverified
until tested on those devices; no connected device is currently recorded.

## Document-only handoff

Only this Markdown proposal is created now. No application code, teaching data,
recording, music asset, build or Android package is changed. Implementation and
the checks above begin only after the user authorises this plan.
