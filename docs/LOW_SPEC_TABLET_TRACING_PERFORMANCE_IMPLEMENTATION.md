# Low-spec Android tablet tracing performance

**Prepared:** 3 October 2026, Asia/Kuala_Lumpur.  
**Status:** Proposal only. Awaiting implementation authorisation.  
**Requested by:** Project owner, after testing the Android game on a custom
low-to-medium-spec tablet. The owner reports lag during dragging for **all
letters in both Solo and Duo**. Tablet model, exact hardware, Android version
and WebView provider/version are unknown.

This request authorises investigation and this document only. No application,
Android host, teaching content, settings, tests or APK changes are applied at
this stage. Performance measurements described below are planned work.

## Intended result

Make the visible tracing response follow the finger promptly on the reported
tablet. Reduce CPU allocation, React work, SVG repaint and decorative GPU work
in the shared tracing path. Keep the fullscreen, fitted, no-scroll layout.

The recommended delivery is a lightweight Android presentation plus a smaller
live tracing renderer, followed by targeted input/ink optimisations. This is
more appropriate than another geometry-only matcher optimisation because the
problem affects every letter and both single-board and two-board play. That
pattern suggests shared overhead; it does not prove which cost dominates on
the physical tablet.

Jejak Ceria remains the preschool default. Correct tracing, actual pointer-up
validation, independent dots, accepted colour, saved progress and match scoring
must remain equivalent. No speed gain will be claimed from dropping genuine
input samples, making completion easier, shrinking the drawing, or delaying
validation until a later frame.

## What the current source shows

The earlier [tracing performance delivery](TRACING_COMPLETION_AND_PERFORMANCE_VERIFICATION.md)
already added binary arc searches, direct segment projection and one SVG matrix
conversion per dispatched input batch. Its desktop measurements showed lower
matcher CPU cost, but retained a 33.3 ms p95 frame interval for Sin at native
4K. Physical Android WebView smoothness was never established. Those historical
measurements are context, not a baseline for this tablet or a changed build.

| Observed work | Source | Why it is a candidate |
| --- | --- | --- |
| `paint()` calls `setState(next)` each presented frame; the component then constructs the board, routes, support controls and moving guides again. | [TraceBoard](../src/components/TraceBoard.jsx) | Finger movement changes numeric progress far more often than the controls or teaching structure need to change. |
| Matcher responses include full snapshots with copied progress/profile/metrics, pending arrays and finish summaries. Status checks also request snapshots. | [Play matcher](../src/tracing/playMatcher.js), [strict matcher](../src/tracing/matcher.js) | Repeated short-lived allocations occur for each delivered sample, including coalesced samples. This can increase CPU and garbage-collection pressure. |
| Every paint assembles diagnostic wrappers, gesture/ink arrays and assisted-fill records. | [TraceBoard](../src/components/TraceBoard.jsx) | Export/teacher inspection does not require publishing the complete diagnostic wrapper at frame rate. Existing arrays are often referenced rather than deeply copied; the plan does not assume every raw point is cloned here. |
| Strict/free-copy ink serialises all accumulated points into one SVG `d` string each dirty frame. | [TraceBoard](../src/components/TraceBoard.jsx) | Work grows with gesture length instead of being limited to the newest visible portion. This applies to raw ink, not Jejak Ceria's authored route-fill path. |
| The moving overlay computes eleven trail points, frontier/arrow positions, terminal-tail points and guide state. | [TraceBoard](../src/components/TraceBoard.jsx), [numbered guides](../src/components/NumberedTraceGuides.jsx) | Some elements are decorative; others can update through a small isolated layer. Essential numbered cues must remain. |
| The lesson dock uses a translucent background with `backdrop-filter: blur(8px)`. | [Fullscreen CSS](../src/styles/fullscreen.css) | A candidate paint/compositing cost on a weak GPU. Its actual cost depends on the WebView and scene and needs measurement. |
| The racing screen updates elapsed React state every 50 ms; both player panes are children of that screen. | [MatchScreen](../src/screens/MatchScreen.jsx) | Repeated parent updates can reach two live boards even when the displayed whole-second clock has not changed. |
| Input still reads and inverts `getScreenCTM()` per event batch. | [Input controller](../src/tracing/inputController.js), [geometry](../src/tracing/geometry.js) | Further caching may avoid repeated geometry reads, provided every coordinate-changing event invalidates it correctly. |

These are source-confirmed operations and performance hypotheses. No physical
CPU/GPU profile, queue-delay measurement or allocation recording was taken for
this request.

## Recommended implementation order

### 1. Establish a reproducible baseline before changing the app

Use the current production build and APK 1.0.3 as the starting point. Record
source/asset fingerprints, APK version, WebView provider/version when obtainable,
CSS viewport, device pixel ratio, refresh rate, orientation and presentation
setting. Unknown hardware fields may remain unknown; identifying the exact
tablet brand is not a prerequisite for the code changes.

Extend the existing [measurement helper](../scripts/measure-tracing.js) rather
than creating a separate tracing implementation. Measure input processing,
paint work, render counts, diagnostic publications, frame intervals, long tasks
and, where supported, allocation/GC activity. Keep instrumentation bounded and
disabled in normal play. Count coordinate reads and rewritten path vertices to
identify growing or repeated work.

Cover Alif, Sin, Mim, Nya and Ga in adult preview, then sample all 37 valid
models. Include Jejak Ceria, guided/precision, long copying gestures and two
simultaneous Duo contacts. Test sustained movement and repeated rounds, not
just initial touch. Compare matched paths, speeds, settings and orientations.

Desktop throttling is a reproducible screening tool, not an Android GPU or
vendor WebView emulator. Actual-tablet measurements remain the decisive check
when device access becomes available. No optical finger-to-screen latency
claim will be made from a DOM mutation timestamp or synthetic pointer event.

### 2. Add a lightweight Android presentation

Recommend **Paparan ringan** by default in the native Android app, with an adult
teacher-setting override for **Paparan penuh**. Select the preset at screen entry
and retain it for that device. Store the preference separately from pupil
progress and teaching approval data. Browser presentation can retain its normal
default and offer the same explicit lightweight choice.

Do not classify the tablet using screen width, CPU core count or guessed device
memory. The reported custom device cannot be identified reliably from those
values. Defaulting Android to a cheaper presentation gives a predictable result.

In lightweight tracing and match screens:

- Replace dock transparency/blur with an opaque cream background.
- Remove decorative moving trail dots, flower bursts, greeting/reward motion,
  drop shadows and unnecessary animated scenery around live boards.
- Replace the repeated paper-dot pattern with plain paper if the matched
  render comparison shows a useful gain. The teaching baseline remains.
- Use simple solid borders and static book framing; use an immediate page
  change or inexpensive fade rather than a folding page animation.
- Keep the letter, accepted fill/ink, required dots, current frontier, numbered
  writing cues, finish/recovery cues, readable controls and essential feedback.
- Keep audio available. Sound and teaching prompts are not removed as a
  substitute for fixing input latency.

Effects must not continue on one Duo lane while the other player is dragging.
Any interaction-wide pause flag uses a contact count, cleared on up, cancellation,
backgrounding and unmount. Apply appearance changes outside active writing;
do not change the letter's scale, stage or coordinate frame under the finger.

Reduced motion remains supported independently. The lightweight setting changes
rendering cost, not teaching geometry, match difficulty or saved outcomes.

### 3. Separate live drawing from React control updates

Keep one `requestAnimationFrame` presentation update per board. Split the
renderer into static authored content, a small dynamic overlay and semantic
controls. Cache/memoise static routes, dot targets, paper/frame and guide layout
by letter/revision, activity and viewport. Stable callbacks and props must make
that separation effective.

During ordinary pointer movement, update only the accepted-fill dash offset,
frontier/arrow transform, required remaining-tail attributes and changed guide
classes. Pre-create appropriate SVG nodes at a letter/part transition and skip
attribute writes when values have not changed. Cache completed route-fill
attributes. Do not rebuild unrelated routes and controls for numeric progress.

Publish React state when a semantic value changes: current part, guide step,
feedback text, blocked/retry state, finish readiness, body/dot completion, ink
limit, demonstration state or final result. A stationary contact and unchanged
feedback must not produce repeated control renders or live-region announcements.
Use the same authoritative finish predicate for the overlay and validation.

Keep DOM ownership explicit: React owns structural creation/removal and control
content; the drawing adapter owns designated dynamic attributes. Reconcile at
structural transitions so a React render cannot reset an imperatively updated
frontier or fill. Initialisation, resize, replay and cleanup must leave no stale
nodes or outstanding animation frames.

Acceptance/scoring remains synchronous with real input. The next animation
frame presents the accepted result; it must not determine whether the input
was valid. Pointer-up still processes the real final point and flushes the last
presentation once.

### 4. Remove full snapshots and diagnostic assembly from the sample hot path

Add a compact internal response/status interface for the board: phase, active
contact, changed part/frontier and input decision. Provide cheap busy/disabled
checks. Construct full immutable snapshots only for explicit snapshot requests,
semantic publication, final acceptance or export.

Preserve existing public matcher responses for current callers, or make compact
responses an explicit opt-in used by the board. Compare both interfaces with
the same ordered samples; their final state, decisions, metrics and accepted
points must agree. Do not cache stale finish readiness or share mutable metrics
with saved records.

Continue capturing genuine raw samples and their order. Throttle diagnostic
publication separately, initially to at most once every 250 ms during a gesture,
with immediate final publication on up/cancel/completion and an on-demand
snapshot before teacher export. When no consumer needs a publication, do not
assemble its wrapper. Preserve complete diagnostic/export contents and existing
18,000-point/100-gesture limits; this is not diagnostic data deletion.

Internal diagnostic counts and renderer timing must not enter the pupil's
scoring formula. Avoid per-move JSON serialisation, storage writes or bridge
messages.

### 5. Bound ink-path work and coordinate reads

For guided/precision and free-copy ink, use completed immutable path chunks and
one active chunk, initially capped around 128 vertices. Build/cache path commands
as points are accepted; each frame rewrites only the bounded active chunk.
Carry the previous endpoint into the next chunk to preserve continuous joins.
Check seams, round caps, taps, rejected-gesture removal and part-specific clearing.
Save/export the original raw coordinate sequence, not the chunked display nodes.

For coordinate conversion, measure first. If matrix reads are material, cache
the inverse matrix for a stable active gesture and invalidate it on stage/viewBox
changes, native viewport notifications, orientation/fullscreen changes, visual
viewport zoom/offset changes and relevant layout transformations. Refresh before
the next sample or cancel safely when the stage moves. Invalid/missing matrices
must retain the existing safe-cancellation behaviour. No stale-coordinate fast
path is acceptable.

Continue processing every ordered coalesced sample and the real up point.
Do not implement “latest point only”, input debouncing, event-rate caps,
predicted-pointer acceptance or reduced matcher checkpoints. Frame-batch the
display, not the validity of real movement.

### 6. Isolate match timing and both player boards

Give each board independent frame state and dirty attributes. Isolate the
whole-second clock display from the live boards and stabilise pane callbacks.
Only update clock presentation when its displayed value changes. Keep the
existing monotonic clock and deadline checks authoritative.

Current score acceptance uses `clock.elapsed(snapshot.validatedAt)`; preserve
that exact relationship. A slower clock display must not alter deadlines,
speed points, simultaneous-completion ordering, pause/resume or round results.
Verify two active contacts without allowing one lane's rendering or decorative
completion to stall the other lane.

### 7. Consider a canvas overlay only if the remaining profile justifies it

Do the preceding changes first. If tablet paint/raster work still dominates,
prototype a bounded-resolution canvas for dynamic raw ink, while retaining the
approved SVG model and accessible controls. Compare it against the optimised SVG
renderer on the same device. Cap only this presentation surface's pixel ratio;
do not change logical input coordinates or the whole WebView's scale.

Canvas is a measured fallback, not the default first rewrite. Keep SVG available
if joins, clipping, sharpness, memory, touch coordinates or performance regress.
Avoid adding workers, forced layers or a blanket `will-change` before evidence
shows a benefit. They can add communication, scheduling or memory costs.

Check the actual merged Android configuration and hardware-accelerated view
state. There is no software-layer override in the current host source; simply
turning on an already enabled default is not a performance fix. Do not switch
the WebView to software rendering or force a large hardware layer as a shortcut.
Keep release web debugging disabled and preserve native fullscreen/inset handling.

## Expected file scope

| Area | Planned files |
| --- | --- |
| Live renderer and diagnostic publication | `src/components/TraceBoard.jsx`; a small dedicated rendering helper if warranted |
| Compact matcher responses/status | `src/tracing/playMatcher.js`, `src/tracing/matcher.js` |
| Safe coordinate cache/input lifecycle | `src/tracing/inputController.js`, `src/tracing/geometry.js` only if profiling justifies the cache |
| Guides and stable board/pane props | `src/components/NumberedTraceGuides.jsx`, `src/components/RaceTracePane.jsx`, `src/screens/BookLessonScreen.jsx` |
| Clock display isolation | `src/screens/MatchScreen.jsx`; a small clock component if useful |
| Lightweight presentation/preference | `src/styles/fullscreen.css`, relevant book/playground/match styles, `src/App.jsx`, `src/screens/TeacherScreen.jsx` and a separate preference module |
| Native profiling/configuration | `android/app/src/main/java/com/hananaacademy/tamanjawi/MainActivity.java` and manifest only where actual findings require it |
| Evidence and regressions | Existing measurement/browser helpers; focused geometry/input/game/browser tests; current performance/release documents |

Preserve `letters.json`, its validator, recordings, geometry/audio approvals,
storage formats, matcher thresholds and scoring rules. No new geometry revision
or teacher approval is needed for this rendering-only plan. A later request to
change teaching paths must follow the separate revision/review process.

## Measurements and acceptance gates

Take matched baseline/after runs with the same build mode, actual viewport/DPR,
gesture paths, WebView, instrumentation and device power/thermal conditions.
Use several sustained runs and report distributions, not a single best frame.
Measure Solo and simultaneous Duo separately. Record unsupported metrics as
unavailable, not as zero.

The proposed targets are acceptance goals, not promises about unknown hardware:

| Measure | Target / decision rule |
| --- | --- |
| Input processing and frame paint JS | Aim for p95 input-batch work ≤4 ms and p95 drawing JS ≤4 ms on the target tablet. Improve the dominant measured cost; retain an already better baseline. |
| Frame pacing | Aim for p95 intervals ≤1.5 display periods: 25 ms at 60 Hz or 50 ms at 30 Hz. Record the actual refresh rate. If missed, quantify remaining cost and do not declare tablet smoothness complete. |
| Input-to-visible software publication | Aim for p95 within two display periods, with no accumulated queue/backlog. Distinguish event queue delay, DOM publication and physical display latency. |
| Sustained dragging | No repeated >50 ms main-thread stalls attributable to tracing; no increasing path-serialisation cost over a long gesture. Document exceptions and thermal throttling. |
| React/diagnostics | Numeric progress does not rerender static content/dock per frame. Full diagnostics do not publish per sample/frame; final export remains complete. |
| Behaviour | Same accepted samples, decisions, completion boundaries, final metrics, records and scoring for equivalent replayed input. |
| Presentation | Full letter envelope, required dots/numbering, finish/recovery cues and controls stay visible; no scrolling, layout jumps or drawing under the dock. |

Use [verification guidance](VERIFICATION_GUIDE.md) to select checks. After
implementation authorisation, run the unit suite and checked build, then targeted
production Chromium/WebKit regressions. Include real coalesced touch/pen delivery,
empty-coalesced fallback, release-only movement, near-end recovery, invalid
shortcuts/reversal, dot pads, capture loss, backgrounding, resize, demonstrations,
copy saving/export and Duo deadline/pause tests. CPU throttling complements these
checks; it does not substitute for the tablet's GPU/WebView.

On the reported tablet, verify offline native startup/fullscreen, continuous
writing on every letter, long-copy gestures and simultaneous Duo contacts in
both usable orientations. Watch for gradual degradation across rounds. Preserve
the existing sample limits and recoverable “continue/retry” behaviour. A local
diagnostic build, if needed, must be explicitly scoped to profiling; no normal
game upload or background telemetry is added.

## Delivery after approval

Implement in small stages with matched measurements so each retained change has
a clear effect. Preserve baseline and intermediate reports. Roll back individual
optimisations that regress accuracy, latency, memory or appearance; do not keep
complexity merely because it was planned.

Deliver the verified code, a concise performance report with before/after inputs
and limitations, updated current documentation, and a new signed APK at the next
unused version above 1.0.3. Preserve application ID, signing identity and previous
APK/checksum files. No deployment, publication or messaging is part of this plan.

If no physical tablet is connected during implementation, deliver measured
software improvements and identify tablet validation as pending. Do not label
desktop synthetic timing as a resolved physical-device lag report.

## Technical references

The proposed reduction in repeated layout reads/writes follows Google's
[layout and interaction-latency guidance](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing).
The actual presence and magnitude of forced layout in this game must still be
profiled. Android's [hardware-acceleration reference](https://developer.android.com/topic/performance/hardware-accel)
documents default acceleration and its memory implications; it does not prove
that this tablet's WebView is rendering efficiently.

**Next action:** Review this plan. Application changes begin only after the
project owner authorises implementation.
