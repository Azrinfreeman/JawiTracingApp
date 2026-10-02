# Solo and Duo 1v1 — implementation

**Prepared:** 2 October 2026, Asia/Kuala_Lumpur.  
**Status:** Implemented after the user's “continue” on 2 October 2026.  
**Request:** Add solo and simultaneous split-screen 1v1 play for tablets and
smartboards. Valid, faster Jawi tracing earns more marks and leads to a trophy.

The original proposal was delivered before application changes. The subsequent
“continue” authorised this feature. See [the verification record](SOLO_DUO_VERIFICATION.md)
for the delivered behaviour, checks and remaining device limitations.

## 1. Recommended experience

Extend the existing Taman Ceria game with **Solo** and **Duo 1v1** choices.
Retain untimed practice within Solo, and add a timed **Cabaran trofi**. Duo is
a local competition between two children on the same screen: equal spaces,
the same letter, the same start time and independent tracing progress.

Recommended defaults are **five rounds**, **90 seconds per letter** and the
original **12-letter starter pool**. Each match draws five different letters
once and uses that fixed order throughout. Both duo players see the identical
sequence. A faster valid completion earns a larger time bonus. The highest
total at the end wins the championship trophy.

These are proposed game rules, not an existing teaching assessment. Match marks
measure valid completion and speed in assisted tracing. They must not be labelled
as handwriting mastery, reading ability, KPM TP or free-writing accuracy.

| Choice | Experience | Finish |
| --- | --- | --- |
| Solo · Latihan santai | Current catalogue and Jejak Ceria, without a clock | Current lesson result and copying |
| Solo · Cabaran trofi | One large board, timed rounds and personal marks | Bronze, silver or gold trophy when every round is completed |
| Duo 1v1 | Two simultaneous boards, equal settings and shared rounds | Highest total wins; close ties can share the trophy |

No AI opponent is needed for Solo. This first release is on one device; online
rooms, remote players and public leaderboards are outside the requested scope.

## 2. Entry and match setup

Add a labelled **Cara bermain** choice to the welcome screen: **Solo** and
**Duo 1v1**, with Solo selected initially. In Solo, **Latihan santai** remains
the default and **Cabaran trofi** is an explicit choice. Keep the prominent
**Jom mula** action. This keeps the current preschool practice easy to reach.

Untimed Solo follows the existing garden → lesson → result flow. Timed Solo
and Duo open a setup screen before play:

1. Choose a profile for Solo or two distinct profiles for Duo. Reuse Bunga,
   Daun and Bintang; label duo lanes **Pemain 1** and **Pemain 2**. Default to
   the current profile and the next different profile. Do not change the saved
   single-player profile merely because a duo seat was selected.
2. Choose **Huruf permulaan** (12), **Semua huruf tersedia** (37 currently) or
   **Huruf tambahan** (6 currently). Derive eligibility and counts from
   `letters.json` and `validateLetter`; never hardcode availability.
3. Offer **3 / 5 / 10 rounds**, default 5, and **60 / 90 / 120 seconds**,
   default 90, in a collapsible adult settings area. Disable a round count
   larger than its pool. Do not repeat letters just to fill it.
4. Show concise rules: “Ikut semua bahagian dan titik. Siap lebih cepat,
   markah lebih tinggi.” Include the visible **Dengan bantuan** label.
5. For Duo, run a two-contact check before the first match on that device.
   Touch and hold the two separate test pads together. This is unscored.
6. Offer **Skrin penuh** as a deliberate button. If unavailable or denied,
   continue in the browser when the layout has sufficient usable space.
7. Both players press their own **Saya sedia**; Solo has one ready button.
   After the boards are laid out and assets are ready, show **3 → 2 → 1 → Mula!**.

Settings and selected letters are fixed once a match starts. Changing them
requires ending that match and creating another. A rematch reuses the exact
letter sequence/settings but starts fresh scores and a new match ID. **Huruf
baharu** creates a new selection.

Before the countdown, a shared **Dengar nama** button uses the approved recording.
An optional **Lihat bersama** demonstrates the same letter in both lanes while
input and scoring are disabled. Finish or cancel the demonstration before ready
and countdown; it must not award marks. During the live race, hide demonstration
and audio actions so replay cannot affect one player's clock or progress.

Implementation: each player has a **Lihat contoh** button during preparation.
Both have the same demonstration available. Pressing ready cancels any current
demonstration; countdown and live racing disable demonstration and audio actions.

## 3. Equal split-screen arena

Use the existing sky-blue, white, mint and sunny theme. Distinguish players by
profile, text and shape as well as coloured accents. Never change the tracing
guide colours just to identify a player.

**Landscape tablet and smartboard:** split into equal left and right lanes with
a clear central divider. Both players face the same upright screen. No mirrored
or rotated Jawi. Each lane has the same square board size.

```text
       Round 2 / 5 · Ba                 Pause / End
  ┌──────────────────────┬──────────────────────┐
  │ Pemain 1 · Bunga     │ Pemain 2 · Daun      │
  │ 189 marks · 01:12    │ 167 marks · 01:12    │
  │      BA / ب         │      BA / ب         │
  │  ┌──────────────┐   │  ┌──────────────┐   │
  │  │ Square paper │   │  │ Square paper │   │
  │  │ + own guides │   │  │ + own guides │   │
  │  └──────────────┘   │  └──────────────┘   │
  │ Cue / dot pad       │ Cue / dot pad       │
  │ Retry / status      │ Retry / status      │
  └──────────────────────┴──────────────────────┘
```

The example marks are accumulated from previous rounds, not a score awarded
before this letter is completed. Time remaining is shared and each lane displays
the same value until that player finishes; then show their recorded finish time.

**Portrait tablet:** stack two equal top/bottom lanes if each can retain a usable
square board and controls. The board size is derived from both available width
and lane height. The divider and player labels remain visible. Landscape is the
recommended default for side-by-side tablet use.

**Small phones or short windows:** keep Solo usable. If neither split arrangement
fits two boards of at least **280 CSS pixels** plus their controls, show a clear
rotate/enlarge/use-Solo message before countdown. Do not run a simultaneous race
with one player's controls off-screen or require scrolling mid-round.

Use a compact arena shell rather than duplicating two full `LessonScreen`s.
During live play, the large welcome/header/footer layout is replaced by a compact
round bar; branding remains on setup and results. Browser chrome is included in
available-space measurement. Fullscreen is optional, not assumed.

| Target | Proposed layout / verification |
| --- | --- |
| 1024 × 768 tablet landscape | Equal left/right lanes, both boards and dot controls visible |
| 768 × 1024 tablet portrait | Equal top/bottom lanes if measured space passes the minimum |
| 1280 × 720 smartboard | Equal left/right lanes with a compact round bar |
| 1920 × 1080 smartboard | Larger equal boards, reachable labelled controls |
| 1366 × 768 classroom display | Equal left/right lanes |
| 320 × 740 and 390 × 844 phones | Solo works; Duo reports insufficient space |
| 844 × 390 short landscape | Duo reports insufficient space unless its actual usable layout meets the minimum |

These are acceptance targets to verify during implementation, not a claim that
all tablet/smartboard hardware has already been tested. On large displays use
controls at least 64 pixels high; elsewhere primary actions are at least 56 pixels
and secondary controls 48 × 48. Dot pads stay at least 64 pixels high. Keep existing
36-pixel decorative guide badges and 48-pixel play start markers.

Instructions, timer and celebration stay outside the SVG. Reserve stable rows
for stroke/dot cues, status and dot pad so progress does not resize either board.
The timer uses fixed-width digits. Decorations are pointer-transparent and brief;
reduced motion shows a static trophy and result. Avoid a continuously animated
timer or moving board.

## 4. Round lifecycle and valid completion

One parent controller owns the match; each lane owns its independent matcher,
ink, current part and input capture. A player completing a letter must not route
the whole application to the existing single-player result page.

```text
Setup → Ready → Countdown → Racing → Round result
                                  ↕
                                Paused
Round result → Ready for next letter → Countdown → Racing
Final round result → Match result / Trophy
End confirmation → Abandoned match → Setup or welcome
```

During a round:

- Use **Jejak Ceria** for the first competition release. Both lanes trace the
  same approved geometry, movement order and required dots. Regular guided,
  precision and copying activities remain available outside competition.
- Completion requires the existing matcher to report `playComplete`. A click,
  demo, elapsed timer, partial stroke, skipped dot or display-only fill cannot
  substitute for valid completion.
- Give both competitive lanes the same immutable existing play-touch tolerance
  profile via an explicit board override. Preserve the actual input source in
  diagnostics. Existing untimed touch/pen/mouse defaults remain unchanged.
  Without this override the current `getProfile` grants different touch and
  pen/mouse radii, which would make a mixed-input race unequal.
- Allow the existing dot pad in both lanes, with its one press/release rule.
  Both players have the same assistance available; marks are labelled assisted.
- A local **Cuba lagi** clears only that player's trace, increases their retry
  count and keeps the original round start/deadline. It never restarts the clock.
- The first finisher's board locks and shows **Siap! Tunggu teman.** Their finish
  time and points are fixed. The other player continues until completion or the
  shared deadline. Never advance their unfinished letter automatically.
- End the round when both players finish, or at the deadline. Solo ends when its
  player finishes or reaches the deadline. Show round points and totals, then
  require deliberate readiness for the next letter.
- If time expires, mark an unfinished lane **Masa tamat · jom cuba lagi**, with
  zero round marks. Retain the visible trace for review; do not pretend it was
  completed or save it as a successful lesson.

Stroke guidance and off-route recovery work as before. Losing touch capture
cancels that contact without affecting the other lane. It does not grant a
private pause or free time to the affected player.

## 5. Clock and interruption policy

Use one monotonic clock for the round, based on `performance.now()`, rather than
separate ticking counters or wall-clock timestamps. The W3C
[High Resolution Time specification](https://www.w3.org/TR/hr-time-3/) defines
the monotonic clock used for elapsed intervals. Wall-clock dates are only for
saved history.

Both boards start on the same controller transition after countdown. Board,
font or illustration loading happens before that transition. Gate all pointer,
keyboard, virtual-click and dot-pad input during ready/countdown/results/pause.
A finger held down through countdown must lift and press again after “Mula!”.

Record the finish timestamp when the matcher validates completion in input
handling, before waiting for an animation-frame paint. The current `TraceBoard`
reports completion from its `paint` function; using that callback's arrival time
would include render delay. Add optional validated-completion timing metadata
for the match while preserving the regular lesson callback contract.

Score only completions with active elapsed time **≤ the configured deadline**.
Resolve a completion/deadline boundary using the captured validation timestamp,
not whichever React update or timeout callback happens to run first. Ignore
duplicate, previous-round and abandoned-match callbacks.

A shared **Berhenti** pauses both lanes, cancels held contacts, disables all input
and excludes that pause interval from both clocks. Preserve accepted play
progress; resume together after a short countdown. Count pauses in match history.
No player-specific pause is allowed.

Pause both lanes on hidden-tab/app backgrounding, orientation change, significant
arena resize or fullscreen transition. Use
[visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event)
to detect document visibility changes. Recompute both SVG screen transforms and
layout before shared resume. If the new size is insufficient, stay paused with
the rotate/enlarge message. Do not silently resume while a child is absent.

**Tamatkan permainan** pauses first and asks for confirmation. Cancel returns to
the paused match; confirmed exit marks it abandoned and awards no championship
trophy. Reload does not restore a live race or manufacture a finish time.

## 6. Marks and trophy rules

Version these rules as `speed-v1`. Calculate marks with a pure function from the
validated outcome, active duration and locked time limit. Keep the rules visible
on setup and explain the base/time bonus on round results.

For a completed letter:

```text
T = selected round limit in milliseconds
t = active completion duration, rounded UP to the next 100 ms
    and capped at T only after validating that the actual finish was on time
completion marks = 100
speed bonus = round(100 × (1 − t / T))
round marks = 100 + clamp(speed bonus, 0, 100)
```

Unfinished, abandoned, demonstrated or late work earns **0** round marks. There
are no negative marks or extra penalties for retries, off-route pauses or the
dot pad: these already consume live time. **100–200** marks per completed letter,
maximum **1,000** over the default five rounds.

| Valid finish in a 90-second round | Completion | Speed bonus | Round marks |
| --- | --- | --- | --- |
| 10 seconds | 100 | 89 | 189 |
| 30 seconds | 100 | 67 | 167 |
| 60 seconds | 100 | 33 | 133 |
| 90 seconds, accepted at the boundary | 100 | 0 | 100 |
| Incomplete or after 90 seconds | 0 | 0 | 0 |

Both duo players compete on the same letter each round, so a short Alif is never
raced against a longer Qaf. The bonus reflects speed only after the letter has
been validly followed. Rounded marks can tie even when finish times differ.

**Duo trophy:** highest total marks wins **Trofi Juara Taman Jawi**. If totals
tie, compare summed active durations across all rounds, charging the full round
limit for each unfinished round. A difference of **100 ms or less** is a shared
win; otherwise the shorter total wins. Use durations at the same 100 ms scoring
resolution. If both totals are zero, show encouragement and replay without a
championship winner. The other player receives an encouraging completion-of-match
message, without suggesting their trace was completed when it was not.

**Solo trophy:** finish every round to qualify. Bronze requires at least
`100 × rounds`, silver `140 × rounds`, gold `170 × rounds`. For five rounds:
bronze **500–699**, silver **700–849**, gold **850–1,000**. A session with unfinished
rounds still shows its earned marks and a replay action, without a completion
trophy. There is no opponent or invented personal-best score.

Results show both profiles, round breakdowns, valid completion/timeout, total
marks and the tie rule when used. Trophy art is a new native SVG in the Taman
Ceria style, with a leaf/star emblem and Malay text. No new sound recording,
background music or automatic navigation is required.

Compare results only within their recorded settings. Different letter pools,
round limits and assistance policies are not interchangeable personal records.

## 7. Simultaneous input and smartboard check

The current `attachInput` keeps one active pointer **per SVG instance**, which is
a useful foundation for two lanes. Each board must retain separate references,
engine state, buffers, pointer IDs and callbacks. Both contacts remain active
when two children trace at once; avoid a page-wide “one finger only” flag.

The [W3C Pointer Events specification](https://www.w3.org/TR/pointerevents3/)
provides pointer identifiers, capture and `touch-action` behaviour for this
design. Do not reject the second child because their pointer is non-primary.

- Capture the initiating contact to its original lane. Crossing the divider
  cannot transfer it to the other matcher or dot pad. Leaving the route follows
  the current pause/recovery rules.
- Ignore extra contacts within an occupied lane. A board stroke and its own
  dot pad cannot create two simultaneous gestures in that matcher.
- Hold dot pad 1 while player 2 traces or taps; releasing pad 1 must only commit
  the intended player/target. Preserve keyboard and screen-reader pad activation.
- No global SVG selectors in event handling. Scope all references and test
  helpers by lane. Replace the current fixed `boardDots` SVG pattern ID with a
  stable per-instance ID so two boards cannot resolve each other's definitions.
- Keep `touch-action: none` on writing surfaces and dot pads. Native controls
  outside them still work. Prevent accidental arena scrolling during a live
  split-screen round without globally disabling ordinary Solo navigation.
- Parent timer/score rendering must not recreate either matcher or resubscribe
  its input on every tick. Clock display can update about four times per second;
  scoring uses the actual timestamps, not that display frequency.

Two-contact capability depends on the device, driver and browser exposing
independent pointers. `navigator.maxTouchPoints` is only a hint; it cannot prove
two players can write simultaneously. Require the visible contact test, then
verify sustained drawing on the actual classroom hardware before claiming
smartboard support. One shared mouse cannot act as two independent players.

If the check cannot observe two simultaneous contacts, offer retry and Solo.
Do not silently call sequential turns “simultaneous 1v1”. An adult mouse preview
may inspect the layout but is labelled unscored and awards no trophy. Touch
emulation tests also cannot establish a physical board's palm rejection or
multi-pen behaviour.

## 8. Saved progress, match history and audio

Keep `taman-jawi.progress.v1`, its previous attempts and copies readable. Add a
separate bounded `taman-jawi.matches.v1` store for match summaries, recommended
maximum **50** recent matches. Match data includes:

- ID, date, status (`completed` or `abandoned`), Solo/Duo, rules version and
  selected profile IDs. Include an explicit competitive-session marker.
- Frozen pool/letter order, content and audio revisions, round count, time
  limit, tracing policy/profile and observed input sources.
- Per-round player outcome, active duration, completion timestamp relative to
  round start, base/bonus/total marks, retry count and matcher summary metrics.
- Final totals, winner/shared-win/trophy, global pause count and abandoned status.

Store validated successful lane completions as ordinary progress attempts with
additive `sessionType`, `matchId`, `roundIndex` and `playerSlot` fields. Record the
lane's selected profile, not the app's current single-player profile. Keep the
existing finite matcher metrics and assistance labels. Timeout is match history,
not a fabricated successful attempt. Show competitive attempts separately or
with an explicit tag in teacher history.

Use the **one parent store instance** for both lanes and save idempotently by
match/round/player key. Back-to-back finishes must append both records without
overwriting one another. A rematch gets new keys. A StrictMode remount or delayed
callback cannot double the marks, attempt or trophy.

Extend teacher export to include both existing progress and match history in a
clearly versioned export envelope. Reset confirmation explicitly names profiles,
attempts, copies **and matches**, then clears both stores. Preserve ordinary
progress when only match history is corrupted. Quota/private-storage failure
falls back to session memory with an honest notice and export option. Do not
persist raw pointer trails for every competitive round; summaries keep storage
bounded. Current deliberate diagnostics remain separate.

The existing single audio manager prevents overlapping recordings. Keep one
shared letter-name playback in match preparation, stop it before countdown and
on exit, and retain mute/volume settings. Audio failure gives readable feedback
and does not prevent a visual ready/start path. Do not make each lane interrupt
the other's playback or play a recording when a player finishes.

## 9. Proposed files and responsibilities

| File / module | Planned responsibility |
| --- | --- |
| `src/App.jsx` | Route setup/arena/results; preserve ordinary practice; supply one store/audio owner |
| `src/screens/WelcomeScreen.jsx` | Solo/Duo selection, Solo practice/challenge choice and descriptions |
| New `src/screens/MatchSetupScreen.jsx` | Profiles, approved pool, locked settings and contact check |
| New `src/screens/MatchScreen.jsx` | Equal lane layout, shared countdown/clock/pause and round lifecycle |
| New `src/screens/MatchResultScreen.jsx` | Round breakdown, totals, tie handling, trophy and rematch |
| New `src/components/RaceTracePane.jsx` | Compact lane, identity, scoped board, cues, local retry and finish status |
| New `src/components/DuoInputCheck.jsx` | Observe two real independent contacts before Duo starts |
| New `src/components/Trophy.jsx` | Native SVG trophy, static reduced-motion presentation |
| New `src/game/matchReducer.js` | Explicit session transitions and idempotent per-lane/round outcomes |
| New `src/game/scoring.js` | Pure scoring, tie resolution and Solo trophy thresholds |
| New `src/game/matchClock.js` | Shared injected monotonic clock and pause interval accounting |
| `src/components/TraceBoard.jsx` | Optional compact variant, input enable/cancel/freeze hooks, locked profile and validation-time metadata; keep regular defaults |
| `src/components/DotTapPad.jsx` | Honour disabled/cancel state through every input path without changing release semantics |
| `src/tracing/inputController.js` | Only narrowly necessary cancellation/gating support; keep per-board pointer ownership |
| New `src/storage/matchStore.js` | Bounded/validated local match summaries, fallback, export and reset |
| `src/storage/progressStore.js` | Validate additive match metadata without rejecting old attempts |
| `src/screens/TeacherScreen.jsx` | Match history, competitive attempt tags, combined export/reset |
| New `src/styles/match.css`, `src/main.jsx` | Arena/setup/trophy layouts using existing theme tokens |
| Unit/browser tests and scoped helper extensions | Timing, scores, persistence, simultaneous native input, viewport and regression evidence |
| `README.md`, `docs/PROJECT_STATE.md`, new feature verification record | Actual implemented behaviour and tested device limits after authorisation |

Keep geometry, content/audio approval records and recordings unchanged. Reuse
`createPlayMatcher`, profiles, numbered guides and `DotTapPad`; do not build a
second simplified matcher that accepts shortcuts just to make a race faster.
An optional profile override must be immutable and belong in the board adapter,
not an alteration of the stored letter or existing untimed defaults.

## 10. Implementation order after authorisation

1. Snapshot relevant content/audio/brand and current progress compatibility;
   confirm a running local server and preserve the finished theme.
2. Implement/test pure scoring, clock and match transitions with an injected
   test clock. Fix exact-boundary, duplicate and abandoned-event cases first.
3. Add optional board isolation/gating/timing support and lane-scoped helpers.
   Verify two simultaneous native pointers before completing trophy polish.
4. Build welcome choices, setup, contact check and Solo challenge using one lane.
5. Add Duo's second independent lane, equal responsive layouts, shared pause
   and round transitions. Verify each stroke/dot state in both lanes.
6. Implement results/trophies, idempotent saves, match history and teacher
   export/reset. Preserve old progress and ordinary practice.
7. Run the affected checks, inspect captures and correct task-related failures.
   Follow [the verification guide](VERIFICATION_GUIDE.md); use at most two workers.
8. Record final inputs, actual totals, limitations and physical device checks.
   Deliver the verified local build. Publishing is not part of this proposal.

## 11. Verification and acceptance

**Unit checks:** valid/invalid/late outcomes; scoring examples and bounds; Solo
thresholds for 3/5/10 rounds; score and time ties; shared clock after pause;
deadline equality; retry without clock reset; ready/countdown gating; one lane
finishing first; duplicate/stale callbacks; abandoned/reloaded matches; bounded,
corrupt and unavailable storage; two near-simultaneous saves; old progress/export.

**Native browser checks:** Chromium and WebKit pointer paths, plus Chromium CDP
for genuine simultaneous emulated contacts. Hold player 1's finger on a stroke
while player 2 starts/moves; move both in the same touch-event stream. Cover:

- Concurrent Alif, Ba and Ta, then Nga's three dots and Qaf's loop/bowl/dots.
- One lane's wrong start, excursion, capture loss or retry while the other keeps
  tracing. Crossing the divider must not alter the other lane.
- Simultaneous board/pad actions, two pads held/released in different order,
  extra contacts in one lane, second non-primary contact and blocked countdown input.
- Same shared start; no render-latency finish bias; exact deadline; first finisher
  locks without changing the other letter; both finish/timeout result handling.
- Pause/hidden tab/orientation/resize/fullscreen, contacts cancelled and preserved
  accepted progress, resumed shared clock and board coordinate recomputation.
- Solo tiers, Duo winner/tie/zero-total outcomes, deliberate next/rematch/exit,
  history under both profiles, combined export and confirmed reset.
- Existing untimed garden/play/guided/precision/copy/audio/branding/storage flows.
  Select affected existing suites and all model completions for shared-board changes.

**Visual checks:** setup, countdown, simultaneous active strokes, pause, every
representative dot stage, one-player-finished, timeout, round results, trophies,
history and no-space messaging. Inspect the target tablet/smartboard sizes and
small-phone Solo. Confirm equal square boards, contained readable guides, no
overlap/page scrolling during live Duo, labelled controls, focus, reduced motion
and zoom reflow. Resizing to insufficient space pauses rather than clips a lane.

**Physical checks:** actual target smartboard and iPad/Android tablet, with two
children/adults tracing simultaneously and touching dot pads. Record model,
driver/browser, orientation and observed support. Emulation does not replace
this. If hardware is unavailable during development, report that limitation;
do not claim its support has been verified.

Run `npm test` and the checked `npm run build` after relevant edits. Keep content,
audio and branding comparisons exact. Record commands, browser versions, inputs,
viewports and evidence in a new feature verification record, retaining historical
theme/letter reports. Existing Firefox launch and WebKit audio limits apply until
their environment changes; do not repeat a known failing runtime without cause.

| Acceptance area | Required outcome |
| --- | --- |
| Solo | Untimed practice preserved; trophy challenge completes with transparent scoring |
| Duo | Two equal lanes really process independent simultaneous contacts |
| Fair start | Same letter, dimensions, profile, ready/start time and deadline |
| Valid racing | Faster valid tracing earns a larger bonus; shortcuts/demos cannot score |
| Round progression | First finisher waits; next round begins deliberately after both finish or time expires |
| Trophies | Highest total wins; documented tie/zero-total/Solo thresholds are followed |
| Interruptions | Shared pauses, stable accepted progress and correct resumed timers |
| Data | Both player records survive; old progress works; no double awards |
| Devices | Required layouts pass; hardware limits are visible and honestly recorded |
| Preservation | All 37 models/recordings and the completed Taman Ceria theme remain intact |

## 12. Delivered scope

This release implements **local Solo + simultaneous Duo 1v1**,
with five shared-letter rounds, a 90-second default limit, valid-completion marks
plus a speed bonus, and final trophies. Setup can select 3/5/10 rounds and
60/90/120 seconds. Untimed practice remains available and selected by default.

Portrait tablets stack two equal upright lanes, placing each lane's support
controls beside its square board. Insufficient layouts pause both players and
retain accepted tracing while offering rotation, fullscreen or Solo. Match
summaries include revisions, settings, scores, pauses and input information;
abandoned summaries also retain completed work from their current round.
