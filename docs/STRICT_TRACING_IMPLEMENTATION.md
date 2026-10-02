# Stricter tracing control — implementation plan and Codex super prompt

Prepared: 2 October 2026.

**Status: implementation authorised and completed on 2 October 2026.** This document was first provided without application changes. The user then asked to proceed. The rules below are implemented locally; see [the acceptance record](ACCEPTANCE.md) for actual verification and remaining device/content review.

This is an addendum to [the original implementation specification](../IMPLEMENTATION.md). It addresses the supplied screenshots while preserving the existing letter routes, company branding, audio integration and teaching-readiness checks.

**Current scope:** the later authorised [Jejak Ceria update](PRESCHOOL_PLAYFUL_TRACING_IMPLEMENTATION.md)
makes assisted play the preschool default. The strict rules here continue to
apply to **Berpandu** and **Kurang panduan**, selected through **Ruang guru →
Jenis latihan** before a new lesson. The assisted play matcher has separate
pause/recovery, display and outcome rules; it does not change strict v2.

## 1. Intended behaviour

During **tracing**, the pupil should be able to produce ink only by following the active letter route in the correct direction. A wrong start, a substantial sideways excursion, a shortcut or scribbling around a dot should not leave freehand lines on the board or earn completion.

Recommended approach: **validate the actual movement first, then render only valid tracing ink**. Once a gesture becomes invalid, block that gesture until the pupil lifts their finger or pen, or releases the mouse button. Require a fresh valid gesture to continue.

The browser cannot physically prevent a hand or ordinary cursor from moving. The restriction applies to visible ink and credited progress. Pointer capture will keep events routed to the board; it will not lock the cursor.

Apply the new control to both existing tracing modes:

- **Berpandu:** visible guides, modestly narrower tolerances and clean partial-stroke resumption.
- **Kurang panduan:** lighter guides, narrower tolerances and the existing continuous-stroke requirement.

Keep **cuba salin sendiri** as a separate free-writing activity. That board intentionally records the pupil's actual drawing for teacher observation. Do not turn copying into tracing or give it an automatic handwriting score.

## 2. What the screenshots and code reveal

The screenshots show a recognisable traced Ta body with additional broad marks around the dot area, off-route ink beside the body, and a guided completion screen. The images alone do not establish the exact input sequence; the current code explains how these behaviours are possible.

| Code before this update | Consequence |
| --- | --- |
| `TraceBoard.jsx` creates an ink path and calls `addInk()` before checking `engine.start()`. | A rejected starting point still produces visible ink. |
| The same component adds every move/end point to the ink independently of the matcher decision. | Movement rejected for progress remains visible as freehand scribbling. |
| `matcher.js` allows guided progress to freeze and then re-enter within the same gesture. | A pupil can leave the route, return and continue the gesture. |
| Guided completion requires the required parts, without the precision mode's overall deviation budget. | A clean retry may finish after earlier rejected movement; the currently visible scribbles can remain. |
| Dot movement accumulates travel but is only validated when the gesture ends. The renderer draws its entire path. | A rejected dot drag leaves a long mark instead of behaving like a small tap. |
| A wrong-start gesture has no active matcher stroke; subsequent movement is not measured by that matcher. Failed dot validation records an invalid event without its travel. | Some visible scribbling is poorly represented in the recorded deviation distance. |

The ordered path validator already provides useful direction, continuity, local branch and dot-count checks. Extend it to make its decisions control rendering and gesture recovery.

## 3. Concrete interaction rules

### A. Start at the current permitted location

1. Resolve the next eligible stroke or dot from the authored sequence.
2. Accept a stroke start only near its current permitted start/frontier and inside the active local tracing corridor.
3. A rejected down event produces no ink or credited progress.
4. Track that rejected pointer gesture until release. Dragging into the green start marker with the same held pointer must not begin tracing.
5. Show `Mula pada bulatan hijau.` and wait for a new down event.

The start gate is a tolerance for starting, not permission to skip an untraced portion. Keep coverage, checkpoints and the existing ordered frontier checks.

### B. Follow the active route

1. Validate chronological raw coordinates in logical board units.
2. Keep the existing local arc-window projection, direction checks, segment subdivision, raw-gap rejection and branch-continuity rules.
3. Render a raw movement segment only after the matcher accepts the **whole segment**. The accepted ink follows the actual sampled movement; do not replace it with the ideal centreline.
4. Never join two accepted points across a rejected interval.
5. Substantial deviation, excessive backtracking, a teleport or a shortcut makes the current gesture irreversibly rejected until release.
6. On rejection, remove that gesture's provisional ink and restore progress to the baseline saved before that gesture. Keep work saved by earlier clean gestures and already completed strokes/marks.
7. Highlight the relevant start/frontier and show `Laluan terkeluar. Angkat jari dan cuba semula.` Once the pointer is released, a new valid start is required.

Small ordinary jitter inside the configured corridor remains valid. A lower tolerance should not turn every tiny hand movement into a rejection.

### C. Commit only a clean gesture

- Only a clean pointer-up may commit a stroke or dot.
- A gesture that has been rejected cannot be repaired by returning to the route or ending at the correct endpoint.
- Preserve the current coverage, checkpoint, end-position and reviewed sequence requirements.
- In guided mode, a **clean early lift** may save its accepted prefix and allow a later clean gesture to resume at that frontier. This is deliberate guided assistance.
- In precision mode, an early lift on a continuous stroke restarts that unfinished stroke and removes its unfinished ink, as required by the reviewed pen-lift policy.
- A failed guided resume rolls back to the prefix saved before that gesture. It must not retain progress earned during its rejected movement.
- Cancellation, capture loss or board resize clears the currently unfinished stroke and its provisional ink, while keeping completed strokes/marks. Do not count an interrupted gesture as success.

A clean retry can eventually finish the letter. Completion means the required work was completed through valid gestures; it does not mean the entire session contained no mistakes. Keep retry/rejection information available to the teacher.

### D. Treat the current dots as taps

All currently authored pilot dot targets use `policy: 'tap'`.

- Do not draw a freehand line during a dot gesture.
- A valid down may show a temporary target highlight, without committing a mark.
- During movement, check the cumulative travel limit and whether each raw point remains inside the active dot hit region. Leaving the region or exceeding the limit blocks that gesture immediately.
- Returning to the dot with the same held pointer does not restore validity.
- Commit on a valid up only; one down/up gesture can satisfy one pending dot.
- A drag between Ta's two targets, repeated scribbling or tapping a previously completed target cannot fill another dot.
- After a valid tap, render a filled mark at the authored target location. This is an explicitly **assisted dot stamp**, not a claim that the pupil drew a perfect freehand dot.
- Record the actual tap coordinates and `dotInputPolicy: 'validatedTapStamp'` in diagnostics/attempt metadata. Keep the distinction available to teachers.

Use the reviewed display shape where supplied; the current pilot targets are circles. Do not infer new Jawi mark shapes or change dot order. Future short-stroke mark policies need their own validator and renderer; do not silently treat them as taps.

## 4. Implemented v2 tolerances

Use the existing **1000 × 1000 logical board**. The following are implemented engineering defaults for the `v2` profile, subject to actual device and teacher/pupil calibration. They are not KPM requirements or verified preschool thresholds.

| Setting | Guided mouse/pen | Guided touch | Precision mouse/pen | Precision touch |
| --- | ---: | ---: | ---: | ---: |
| Tracing radius, previous → implemented | 28 → **22** | 42 → **34** | 18 → **16** | 28 → **24** |
| Start/frontier gate radius | **30** | **46** | **24** | **34** |
| End gate radius | **26** | **38** | **20** | **30** |
| Required continuous coverage | **98%** | **98%** | **99%** | **99%** |
| Backward jitter allowance | **10** | **10** | **6** | **6** |
| Maximum dot hit radius | **24** | **34** | **20** | **28** |
| Maximum cumulative dot travel | **14** | **20** | **10** | **14** |

Additional rules:

- Apply the smaller of the profile dot limits and the authored target limits. Do not overwrite teaching content just to narrow a runtime tolerance.
- Keep the existing raw-gap limit **80**, advance cap **90**, advance ratio **1.8**, local projection tie band **3**, sample spacing **3** and input cap **18,000** initially. The tie band has an existing tight-turn/quantisation regression; do not remove it merely to make tracing stricter.
- Lock the pointer/profile selection for the attempt. Do not silently widen tolerance after a rejection.
- Retain the teacher's explicit guided extra-support option. Its existing +8 adjustment can apply to body/start/end tolerances; it must not unlock free drawing, relax dot tap policy or alter precision mode.
- Keep adjacent branches and dot hit regions separable. Per-letter issues should be resolved through explicit review/calibration rather than global tolerance expansion.
- On a 350 CSS-pixel board, 34 logical units are about 11.9 CSS pixels. Verify real touch usability rather than judging the numbers from a desktop screenshot alone.

The primary behaviour change is strict gesture rejection and validated rendering. A narrower corridor complements that change; reducing a radius alone would have left the previous renderer free to draw everywhere.

### Visible corridor and ink thickness

The current pupil ink is 15 logical units wide. Allow for its 7.5-unit half-width when displaying the permitted corridor so accepted ink does not visibly protrude beyond the illustrated region.

For example, render the full guided corridor using at least `2 × (profile.radius + inkWidth / 2)`. The accepted movement centre remains limited to `profile.radius`. Keep caps/joins contained; an optional visual mask may provide a final display safeguard, but masking must never replace raw-input validation.

In precision mode, keep lighter guides while applying the same validation rules. The start halo is an instruction marker, not a separate drawing area.

## 5. Engine and renderer design

### Gesture transaction

Keep a small per-gesture record:

```text
gestureId
pendingPartId / kind
status: active | rejected | ended | cancelled
baselineProgress / baselineCompletedParts
rawDown / rawLast / cumulativeTravel
provisionalInkHandle
rejectionReason
```

The matcher owns acceptance, progression, rollback and completion. The renderer owns SVG nodes. Do not make the renderer guess which movement is valid by finding the nearest point on the whole letter.

When a clean guided partial gesture ends, its prefix/ink becomes saved guided work. A later gesture gets a new baseline. Completed strokes and marks are immutable until an explicit lesson retry/reset.

### Per-event decision

Extend matcher event results with a small decision object, while retaining the existing snapshot fields for compatibility:

```js
// Implemented event-result contract; snapshot() alone has no inputDecision.
{
  ...snapshot,
  inputDecision: {
    gestureId,
    partId,
    kind,            // stroke | dot | invalid
    action: 'append', // begin | append | reject | commit | partial | cancel
    acceptedRawPoints: [],
    discardGestureInk: false,
    clearPartInk: false,
    mark: null,       // Present only for a successfully validated mark.
    reason: null
  }
}
```

Interpretation:

- `begin`: allocate provisional stroke ink only for a legal stroke start.
- `append`: add only the raw segment that was fully validated, including any validated interpolated raw samples needed for rendering.
- `reject`: remove this gesture's provisional ink, roll back its provisional progress, and keep the pointer gesture blocked until release.
- `partial`: preserve a clean guided prefix/ink for resumption.
- `commit`: retain a clean stroke or stamp one independently validated mark.
- `cancel`: clear unfinished work according to the cancellation policy, without completion.

Consume each event decision once. `paint()` may read the latest snapshot for the UI, but must not replay a previous append/commit decision on every animation frame.

### Input pipeline

```text
Native pointer event / chronological coalesced samples
    → screen-to-logical conversion
    → bounded raw diagnostic capture
    → matcher event and gesture decision
    → accepted ink buffer / rollback / mark stamp
    → animation-frame rendering and UI feedback
```

In `TraceBoard.jsx`, remove unconditional tracing `addInk()` calls. Keep unconditional bounded actual ink capture only for the independent copy activity.

Continue using native Pointer Events, one active pointer, pointer capture, `touch-action: none` on the board, chronological coalesced events and animation-frame batching. Keep capture until up/cancel even after rejection so releasing outside the board reliably ends the blocked gesture.

Do not use pointer lock, synthetic pointer movement, whole-letter nearest-point snapping, automatic route completion or ideal-line replacement. Do not release capture early and accidentally let a still-held pointer start a second gesture.

## 6. Diagnostics, outcomes and persistence

Maintain separate representations:

| Representation | Use |
| --- | --- |
| Raw pointer coordinates, including rejected gestures | Actual validation and bounded in-memory diagnostics. |
| Validated visible stroke ink | Child tracing display, with transactional rollback. |
| Assisted dot stamps | Target completion display after deliberate validated taps. |
| Copy ink | Actual unrestricted free-writing result for teacher observation. |

Count rejected movement even when it started outside the permitted location or occurred during a dot gesture. Record rejection episodes without counting every stationary frame as a new error; continue measuring actual travel while blocked. Zero-distance dwell earns no coverage.

Suggested additional fields:

- `interactionPolicy: 'strict-v2'`.
- `inkPolicy: 'validatedSegments'`.
- `dotInputPolicy: 'validatedTapStamp'`.
- `blockedGestures`, `wrongStartGestures`, `rejectedDotGestures` and `rollbackCount`.
- Raw gesture status/reason and tap coordinates in diagnostic exports.

Keep the existing finite numeric metrics and numeric `assistance` field compatible. Do not replace `assistance` with an object or confuse demonstration counts with dot assistance. Mark the tap-stamp policy separately.

Coverage is the retained valid prefix/completed work, not distance scribbled. Error/travel summaries must state whether they include rejected attempts; do not present filtered visible ink as proof of perfect hand accuracy. Preserve raw invalid travel and teacher-visible retry information after rollback.

Guided completion may follow clean retries. Precision retains its configured whole-attempt deviation budget, with correctly measured invalid movement. If that budget is exceeded, use the existing explicit `Cuba lagi` workflow; returning to the path must not silently reset the attempt's errors.

Keep `guidedComplete` and `precisionComplete` distinct. The current result message can continue describing completion of the required parts after those parts pass the new checks. It must not claim perfect freehand drawing or independent writing mastery.

Use new profile IDs ending in `v2`. Existing local records stay readable under storage version 1 with optional new fields; older records are displayed as legacy policy when the field is absent. Do not wipe progress or falsely relabel old attempts. Keep raw traces in memory unless the teacher exports them.

Do not change `contentVersion` solely for runtime tolerance/rendering changes. Existing model/audio review states, 37 catalogue entries, 12 draft pilot models and zero student-ready lessons remain intact.

## 7. Planned file changes

Paths are relative to the workspace root; these are proposed implementation changes.

| File | Planned change |
| --- | --- |
| `src/tracing/matcher.js` | Add strict gesture lifecycle, event decisions, immutable rejection, rollback, clean commits and complete invalid-input accounting. |
| `src/tracing/dotMatcher.js` | Share live and final tap checks; reject excessive travel, departure and cross-target gestures. |
| `src/tracing/profiles.js` | Add the calibrated candidate v2 values and explicit strict interaction policy. |
| `src/tracing/inputController.js` | Change only if needed to expose a stable gesture lifecycle; preserve native capture/coalescing/cancellation behaviour. |
| `src/components/TraceBoard.jsx` | Separate raw diagnostics from visible ink, consume matcher decisions, remove rejected provisional ink, stamp validated dots and preserve copy capture. |
| `src/screens/LessonScreen.jsx`, `src/tracing/traceReducer.js` | Integrate recovery/retry state if needed; preserve the two existing child-facing modes. |
| `src/styles/app.css` | Add restrained blocked-gesture/target feedback and corridor sizing. Keep the board stable during input. |
| `src/App.jsx` | Include new optional policy/rejection metadata in completed attempt summaries. |
| `src/screens/TeacherScreen.jsx` | Explain the policy, assisted dots and rejection counts; handle legacy records safely. |
| `src/storage/progressStore.js` | Update optional-field validation only if necessary, keeping existing records and bounded persistence compatible. |
| `src/screens/ResultScreen.jsx` | Adjust wording only if needed to avoid implying that assisted ink is independent handwriting. |
| `tests/geometry/matcher.test.js`, `tests/geometry/support.test.js`, `tests/fixtures/traces.js` | Add meaningful valid/invalid gesture and rollback cases; update deliberately superseded permissive re-entry expectations. |
| `tests/browser/strict-tracing.spec.js` | Reproduce the screenshot failure patterns through native input and verify visible ink and completion together. |
| Existing browser tests and capture/measurement scripts | Adapt genuine changed interactions while preserving their core assertions and splash handling. |
| `IMPLEMENTATION.md`, `docs/CONTENT_REVIEW.md`, `README.md`, `docs/ACCEPTANCE.md` | After implementation, document the revised display policy, candidate values, honest results and outstanding calibration. |

No new package, framework, teaching asset approval or deployment is required.

## 8. Verification required after implementation

The following checklist guided implementation. Executed checks and their results
are recorded in [ACCEPTANCE.md](ACCEPTANCE.md) and
`output/verification/strict-tracing-summary.json`; physical device and pupil
calibration remain pending.

### Deterministic geometry and gesture tests

1. Independent forward line, curve, loop and quantised tight-turn traces pass with reasonable in-corridor jitter.
2. A wrong start creates no accepted ink/progress; moving to the start while still pressed stays rejected.
3. An excursion rejects the gesture, removes provisional ink and restores its exact baseline progress.
4. Re-entering the corridor and reaching the endpoint in that same gesture cannot commit.
5. A fresh clean gesture can retry/resume according to the mode; earlier completed work survives.
6. Clean guided partial lifts resume; dirty resumes roll back; precision continuous lifts restart unfinished work.
7. Wrong direction, curve chords, teleports, distant re-entry, crossing/nearby branches, dwell and scribbles earn no skipped coverage.
8. Visible append decisions correspond only to fully validated raw segments, never the reference route substituted for raw movement.
9. Dot drags, loops, target exits, down/up outside the target and one gesture across two dots do not commit or produce line ink.
10. Each valid tap stamps only one permitted target; completed targets cannot be counted twice.
11. Cancel, resize, extra contact, capture loss, mode change, retry and demonstration leave no stale transaction or duplicate commit.
12. Invalid-start/dot/blocked travel appears in diagnostics; rejected gesture counts do not depend on stationary sample frequency.
13. No outcome is produced with a missing stroke/dot or a dirty uncommitted gesture; precision deviation limits still apply.
14. Legacy saved summaries remain readable, new optional fields export correctly and storage limits remain bounded.

### Browser checks tied to the screenshots

- **Ta dot scribbles:** trace the body, then scribble around a dot and drag between dots. No freehand dot trails are visible, neither dot is credited and no result screen opens. Fresh clean taps can then complete the intended targets.
- **Body excursion:** follow part of Ba/Ta, depart sideways and return to the endpoint without releasing. Provisional work rolls back, the gesture stays blocked and no completion occurs. A clean retry follows the authored route.
- **Wrong-start scribble:** scribble elsewhere on the board. No pupil ink appears; the correct start marker remains available after release.
- **Accepted near-edge input:** verify actual accepted ink remains inside the displayed corridor once ink thickness is considered. The movement is not silently snapped to the centreline.
- **All 12 pilot models:** correct native mouse/pen-like traces and required taps remain usable, including Sin's tight turns and Mim/Wau loops.
- **Touch:** repeat valid/invalid cases on phone and tablet viewports with native browser touch dispatch. Treat physical iPad/Android/stylus testing as pending unless actual hardware is available.
- **Copy board:** unrestricted actual freehand drawing still works and saves for teacher observation; it does not use the strict matcher or dot stamps.
- **Existing flows:** company splash, adult-preview gate, demonstration isolation, replay, mute, navigation, progress, export/reset and unavailable audio still behave correctly.

Run the current unit suite and production build, focused strict-tracing browser checks and affected existing browser flows in Chromium and WebKit. Attempt Firefox if its runtime works; report the existing launch limitation honestly if it persists.

Inspect screenshot evidence showing clean tracing, rejected excursions and rejected dot drags at 320, 390, 768 and 1280 CSS-pixel widths. Verify scrolling, screen-to-logical coordinates and reduced motion. Measure input processing under the revised renderer and keep the current sample/gesture bounds; do not claim physical device latency from a headless check.

### Acceptance criteria

- Tracing no longer behaves like an unrestricted drawing pad.
- Rejected starts, movement and dot gestures create no persistent freehand ink and cannot commit progress from the rejected gesture.
- Returning to the path with the same held pointer cannot rescue an invalid gesture.
- Clean tracing remains responsive and completes required parts through actual valid input.
- Dots require individual deliberate taps and show only explicitly assisted validated marks.
- Diagnostics preserve what the pupil actually did, including rejected movement and assistance.
- Copying remains a separate free-writing activity.
- Saved progress, branding, content gates and existing reviewed sequence rules remain compatible.
- Technical test results and outstanding teacher/device calibration are documented accurately.

## 9. Codex super prompt for later execution

This prompt is retained for reuse. The user's subsequent request to proceed
authorised this local implementation; publication was not requested.

```text
Implement stricter tracing in the existing Taman Jawi React/JavaScript project
according to docs/STRICT_TRACING_IMPLEMENTATION.md. Read applicable repository
instructions and the existing matcher/renderer/tests before changing code.

The reported problem is visible freehand scribbling while following a letter
or tapping its dots. TraceBoard currently draws raw movement even when the
matcher rejects it. Make the matcher decision control visible tracing ink.

Apply strict gesture control to both existing guided and precision tracing
modes. Require legal starts, validate actual chronological raw segments, keep
ordered coverage/direction/checkpoint/local-branch checks, and render only fully
accepted raw movement. Do not snap movement to an ideal line or use a CSS mask
as the validator. Keep the independent copy activity unrestricted.

Implement a per-gesture transaction with saved baseline progress and provisional
ink. Wrong starts and meaningful deviation block that held gesture until up or
cancel. Returning to the route in the same gesture cannot restore validity.
Remove rejected provisional ink and roll back to the pre-gesture baseline. Keep
earlier clean guided prefixes and completed parts. Clean guided early lifts can
resume; precision continuous strokes restart after an early lift. Cancellation
and resize clear unfinished work and never award success.

For the current tap-policy dots, never render a freehand trail. Validate their
raw positions, target containment and cumulative travel live and at release.
Rejected dots remain blocked until lift. One deliberate valid down/up stamps
one pending authored target. Record this as validatedTapStamp assistance and
retain actual tap coordinates; do not claim independent freehand dot accuracy.

Use the proposed v2 tolerances in the document as engineering candidates, then
verify valid jitter, all pilot models, tight turns and loops. Keep the existing
local projection tie behaviour, no-teleport/shortcut checks and explicit teacher
support setting. Never silently widen tolerances or change authored geometry,
dot sequence or approval state to force a test to pass.

Separate raw diagnostic capture from accepted visible ink and assisted marks.
Count invalid-start, dot and blocked movement accurately. Preserve guided versus
precision outcomes and precision's whole-attempt deviation limits. Use optional
strict-v2 policy/metrics fields and v2 profile IDs without deleting or relabelling
legacy local records. Keep numeric assistance/schema compatibility and bounded
raw traces/gesture buffers. Consume each event decision once; keep animation-
frame rendering, native pointer capture, single-pointer input and chronological
coalesced samples. Do not lock or reposition the user's cursor.

Add meaningful deterministic and native-browser tests for the screenshot cases:
wrong-start scribbling, leaving/returning without lifting, rollback, dirty dot
drags, one gesture across two dots, clean retry, actual accepted ink, completion
gating, all 12 pilot letters, touch, cancellation and copying. Update permissive
re-entry expectations that this requested strict policy explicitly supersedes.
Keep other regression assertions intact and scroll the board into view before
measuring browser input coordinates. Preserve the Hanana Academy splash/credits,
adult-preview gate, demonstrations, audio handling and saved progress.

Run the current unit suite, checked production build, strict-tracing browser
checks and relevant regressions in Chromium/WebKit; test Firefox if it can
launch. Inspect responsive rejected/accepted tracing screenshots and measure
handler/render performance without claiming physical device latency. Teacher
and actual pupil/device calibration stay pending unless performed.

Update IMPLEMENTATION.md, CONTENT_REVIEW.md, README.md and ACCEPTANCE.md with the
actual implemented policy, thresholds, assistance and real verification results.
Do not fabricate approvals, successful tests or handwriting mastery. Complete
the local implementation and verification; do not deploy. Report the resulting
behaviour, checks and material limitations concisely.
```
