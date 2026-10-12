# Android tablet and smartboard smoothness: implementation plan

Date: 7 October 2026, Asia/Kuala_Lumpur.
Status: **implementation authorised and applied**. The owner requested “perform
the optimisations”, then “continue”. See the
[implementation results and device limits](ANDROID_TABLET_SMARTBOARD_PERFORMANCE_VERIFICATION.md).

## Intended outcome

Keep tracing close to the finger/pen, avoid pauses at letter entry and release,
and maintain smooth independent left/right Duo boards on Android tablets and
smartboards. Preserve the approved alphabet shapes, directions, dots, tolerances,
audio, scoring and saved progress. Jejak Ceria remains the preschool default.

The original planning-stage audit read the current source and existing measurements. It did not run
the game, benchmark devices, change application code, rebuild an APK or change
device settings. The small Node read used here only counts outline data in the
catalogue. Current source has approved Wau 3 / Va 4 and the new navigation/Duo
layout; release APK 1.0.8 predates those changes. Compare matching builds during
the later performance work.

## What is already fixed

The [3 October delivery](LOW_SPEC_TABLET_TRACING_PERFORMANCE_VERIFICATION.md)
already introduced frame-batched SVG drawing, compact matcher responses,
memoised reference models, 128-vertex raw-ink chunks, reduced diagnostic
publication, an isolated clock display and a native light-presentation default.
Current input conversion is cached per contact, and projection searches use
binary-bounded arc ranges. These should be preserved, not proposed again as new
fixes. No evidence supports input debouncing or discarding coalesced samples.

Historical desktop measurements showed better 4K frame intervals in light mode,
but sometimes higher input-processing time. Sin still recorded a 33.4 ms p95
frame interval in a 4K light run, and isolated 58–61 ms tasks were unexplained.
Those are dated Windows/Chromium findings, not measurements of the current game
or an Android device. The Windows WebKit 4K timeout is also not proof of an
Android GPU problem.

## Remaining issues and likely causes

The operations below are confirmed in source. Their impact on the target devices
is a hypothesis until the relevant CPU, paint and input traces are collected.

| Priority | Finding and source | Where it could cause visible lag | Proposed treatment |
| --- | --- | --- | --- |
| P1 | `polyline()` in [liveRenderer.js](../src/tracing/liveRenderer.js) scans every reference vertex to build a short moving cue or 48-unit fill piece. | Repeated work on long routes, doubled during simultaneous Duo. The path output is bounded, but the search still scans the entire route. | Use the existing arc-index search to visit only vertices in the requested interval; cache completed piece strings and skip unchanged frontiers. |
| P1 | [outlineAppearance.js](../src/tracing/outlineAppearance.js) visits all reveal segments on each paint and updates a moving clip plane. [liveRenderer.js](../src/tracing/liveRenderer.js) also calls reveal painting for earlier unchanged strokes. | Catalogue-matched letters and large/high-DPR boards. Actual clipping/raster cost needs GPU/paint profiling; cached attributes already prevent many redundant DOM writes. | Skip unchanged arc/completion states; update only changed segment boundaries and the active cut. Retain exact contours, overlaps and whole-body clipping. |
| P1 | The demo loop in [TraceBoard.jsx](../src/components/TraceBoard.jsx) replays all elapsed schedule entries on every animation frame. Earlier sections of the same stroke can be painted before its current section in the same frame. | Tunjuk cara for multi-section Ha and other complex outlines; redundant path/clip writes. | Determine the active schedule entry once; finalise previous parts once; paint each affected part at most once per frame. Preserve section pauses, pen lifts and total duration. |
| P1 | [prepareReference.js](../src/tracing/prepareReference.js) samples SVG paths on every board setup. Duo prepares the same letter twice. The board also constructs a mouse engine before rebuilding it for the first touch/pen; [playMatcher.js](../src/tracing/playMatcher.js) derives tight-turn data per engine. | First-letter/round entry or first-contact hitch, rather than continuous dragging. | Share bounded, immutable reference/turn preparation keyed by exact geometry. Keep every board's matcher/progress separate; avoid redundant initial preparation. |
| P1 | [presentation.js](../src/platform/presentation.js) defaults APK installs to light, but browser installs to full. Saved full preferences apply on native devices too. | A smartboard using Chrome/browser can retain trails and effects even when the Android tablet runs light. | Use the existing Paparan ringan setting; propose light as the default for new browser installs too, retaining explicit saved preferences and the adult full-mode override. Never change presentation during contact. |
| P2 | [playMatcher.js](../src/tracing/playMatcher.js), [matcher.js](../src/tracing/matcher.js) and [geometry.js](../src/tracing/geometry.js) allocate interpolated samples and many candidate projection objects. Play can traverse an arc range more than once per interpolation step. | High touch/pen report rates, coalesced bursts and two active players on a slower CPU. | Measure allocation/GC and call costs; if dominant, reuse scratch results and combine equivalent searches without changing tie-breaking or turn protection. |
| P2 | Stage fitting/control measurement uses several resize observers in [TraceBoard.jsx](../src/components/TraceBoard.jsx), [useViewportLayout.js](../src/components/useViewportLayout.js) and [MatchScreen.jsx](../src/screens/MatchScreen.jsx). Header measurement is not frame-batched. | Fullscreen/orientation changes, font settlement and changing header dimensions. This is not a confirmed per-pointer-move layout flush. | Batch layout reads once per frame and ignore unchanged measurements; preserve pause/cancel when the coordinate space actually changes. |
| P2 | [App.jsx](../src/App.jsx) synchronously saves an attempt and refreshes the app when the first Duo player finishes. [progressStore.js](../src/storage/progressStore.js) parses/serialises the complete bounded history; App recalculates catalogue readiness and book entries on renders. | One player finishes while the other is still drawing, especially with large saved copy/history data. | Measure release/save time; memoise immutable catalogue validation and avoid unnecessary repeated parsing/parent work. Keep durable saves and exact validated timestamps. |
| P3 | All screens, content/review proposals and fonts are loaded from [App.jsx](../src/App.jsx) / [main.jsx](../src/main.jsx); latest JS is about 674 kB before compression. | Cold launch, first font/layout settlement and memory pressure. It does not by itself explain sustained tracing lag. | If startup profiling justifies it, lazy-load teacher/review screens and consolidate genuinely unused font weights after visual checks. Keep assets available offline. |

Current catalogue-outline data has 30 reveal segments for Sad/Dad, 23 for each
Ain-family body, 14 for Nun, 11 for Ra/Zai and 9 for Dal/Zal. These counts help
choose stress cases; they do not establish that 30 segments are inherently slow.

## Proposed implementation sequence

### 1. Establish a trustworthy baseline

Reuse [measure-tracing.js](../scripts/measure-tracing.js), the existing performance
test configuration and browser helpers. Update measurements for the current
approved catalogue and left/right Duo layout. Benchmark a production build,
not the Vite development page or an old APK. Record bundle/asset hashes and
configuration for every run.

Collect device model, Android version, WebView/browser version, APK versus browser
deployment, logical viewport, physical resolution/DPR, refresh rate, fullscreen,
light/full preference, touch/pen report rate, thermal state and battery saver.
For smartboards, identify whether Android runs locally or touch is sent to an
external Windows/Chrome computer. A lost second contact can be a hardware/input
problem and should be reported separately from slow rendering.

Extend opt-in measurement to separate:

- Trusted input event queue age, event-batch handler cost and raw sample count.
- Matcher work, SVG mutation/clip work, React commit work, style/layout and paint.
- Frame intervals, long tasks, allocation/GC, first-contact/setup cost and save cost.
- Both active Duo lanes, including the instant one player completes.
- Input-sequence-to-DOM publication markers. These measure software publication;
  only an external/high-speed recording can establish finger-to-screen latency.

The older synthetic mutation-age metric was not paired to a specific sample;
do not reuse it as measured input-to-visible latency. Feature-detect available
performance APIs and mark unavailable metrics explicitly. Keep diagnostics local,
bounded and off by default; avoid per-sample console logs. Compare instrumented
and uninstrumented runs so the probe does not become the bottleneck.

Use Chrome's [runtime performance tools](https://developer.chrome.com/docs/devtools/performance)
and [remote WebView debugging](https://developer.chrome.com/docs/devtools/remote-debugging/webviews)
for the appropriate runtime. The current native wrapper enables WebView debugging
only in debug builds; retain that release behaviour. A debug/profile build can
identify causes, but validate final performance in a release-equivalent build.

If the physical devices are unavailable, continue with repeatable desktop
screening at 1×/4×/6× CPU slowdown where supported, and label those results as
synthetic. CPU throttling cannot simulate the tablet GPU, touch hardware or
thermal throttling. Do not mark on-device smoothness fixed from desktop evidence.

### 2. Remove safe redundant renderer work first

Implement bounded `polyline` traversal using the existing arc-segment helpers,
with exact endpoint inclusion and the current rounding. Cache fixed completed
pieces only for the active prepared model. Preserve current 48-unit fill pieces
and 128-vertex raw-ink chunks until measurement justifies changing them.

Track each fill's last rendered arc/completion state. Do not rebuild an unchanged
direction cue, completed fill or outline cut. For outline segments, keep a
frontier index and update only visibility/clip changes; support rollback,
restart, cancellation and jumps across several boundaries. Never simplify the
approved letter contours to improve performance.

Update the demo schedule to paint each part once per frame, with final states
applied once. Test Ha's five phases, Wau/Va's two sections, Sad/Dad's separate
movements and dot-last letters. Keep demonstration progress separate from earned
progress and retain the existing section cues and pen-up pauses.

### 3. Reduce preparation and layout hitches

Cache only immutable geometry preparation with a bounded lifetime/size, using
the exact stroke paths/revision and preparation settings. Cache identity must
not mix adult proposals with approved models. Do not cache SVG screen matrices
across contacts, orientation, zoom or changed stages; current invalidation is
part of input correctness.

Reuse reference/turn data across Duo lanes, while keeping engines, raw samples,
dot confirmation and validated timestamps independent. Prepare work before
accepting a contact, using bounded tasks where needed, without accepting input
against incomplete references. Evict obsolete cache entries; repeated navigation
must not accumulate detached SVG nodes or references.

Coalesce resize/control reads and avoid redundant React state changes. Do not
move a board, resize its letter or change the coordinate frame under a finger.
Actual viewport changes must still cancel/pause safely and recompute guides.

### 4. Apply presentation and measured CPU fixes

Proposed default: light for new installs in either runtime, existing explicit
preferences preserved. Reuse the current teacher setting rather than adding a
child-facing technical menu. Check computed styles in light mode: some recent
navigation/card CSS has its own shadows, and the idle start halo still animates.
Remove only measured decorative costs. Keep bright buttons, legible numbered
guides, moving direction arrows, recovery cues and visible completion feedback.

If matcher/GC is dominant after renderer changes, reduce transient allocation
and duplicated projection work. Replay identical inputs before/after and require
identical progress, acceptance, dot metrics and scoring. Do not reduce genuine
input sampling, loosen tolerances or shortcut hairpin/backward protections.

If first-player completion stalls the other lane, first reduce repeated history
parsing and static catalogue validation and stabilise callbacks where profiles
show avoidable rerenders. Do not postpone persistence without preserving the
existing save/exit/visibility guarantees. Do not change race fairness or the
50 ms deadline enforcement merely to reduce timer activity.

### 5. Escalate rendering technology only with evidence

Keep SVG initially. Consider a canvas overlay only if release-device traces
still attribute significant time to SVG clipping/rasterisation. Such a prototype
must reproduce exact approved contours and guide positions, scale correctly,
bound backing-store memory at high DPR, and preserve independent Duo input.
Retain SVG if memory, appearance, latency or seams regress.

The native manifest does not disable hardware acceleration. Android documents
that it is [enabled by default](https://developer.android.com/topic/performance/hardware-accel).
Verify the actual view/device state before changing native flags; forcing a
hardware/software layer or adding `will-change` everywhere is not a planned fix.
Do not automatically lower smartboard resolution, remove letter detail or rebuild
the game in another engine.

## Verification and acceptance

| Scope | Required evidence after implementation |
| --- | --- |
| Correctness | Full unit suite and checked build; replay identical real/coalesced samples through compact/full engines; exact ordering, hairpins, reversals, shortcuts, dots, cancel/resume and completion timestamps. |
| Lesson modes | Current approved letters in play/guided/precision; long free-copy strokes near existing limits; saving/export still preserves coordinates. |
| Duo | Simultaneous independent touch/pen, first-player completion while the other draws, left/right layout in both orientations, fair scores/deadlines, pause/menu/fullscreen recovery. |
| Stress cases | Alif for a simple baseline; Sin/Syin and Ha for long/turning routes; Sad/Dad and Ain/Nun for outlines; Wau/Va for the new direction; long copying and repeated letter changes. |
| Displays | Tablet 1024×768 and 768×1024; smartboard 1920×1080 and 3840×2160; record actual device DPR/refresh rate. Desktop high-DPR emulation is screening only. |
| Load/history | Cold/warm launch; empty and near-limit existing history; audio/music on/off; light/full; 10-minute repeated Solo/Duo sessions with memory/thermal observations. |
| Visuals | Inspect fitted paths, outline reveal seams, guides, buttons and menus at relevant viewports. Recompute SVG screen coordinates after layout changes/captures. |

Provisional goals, to be judged on the target device:

- At 60 Hz, aim for p95 drawing-frame intervals within about 20 ms, with no
  repeated pauses over 50 ms. For other refresh rates, report the actual frame
  period and missed-frame rate rather than labelling every screen “60 FPS”.
  `requestAnimationFrame` generally follows the display's
  [refresh rate](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
- Aim for p95 input-batch JS and drawing JS each at or below 4 ms, while also
  measuring React, layout, paint and queued-input delay. Keep a better baseline.
- Aim for accepted progress to publish within two display periods without an
  accumulating backlog; report physical display latency separately.
- Repeat at least five equivalent runs and compare median/p95 distributions.
  A dominant cost should improve beyond run-to-run noise, with no correctness,
  visual or memory regression. Counters alone are not a smoothness result.
- No unbounded node/cache/diagnostic growth across repeated rounds; exact
  approved content/audio hashes and pupil storage formats remain unchanged.

Use the affected checks from [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md).
Preserve the historical 3 October measurements and current content approvals.
Save new evidence separately with runtime, build hashes, test inputs and device
limitations. Recheck only changed dependencies or unresolved concerns.

## Delivery boundary

After the owner authorises this plan, implement the safe renderer/preparation
work, resolve relevant failures and report measured before/after results. Device
access may remain a limitation, not a reason to claim a physical-device pass.
Update current project state after the work. A newly signed APK, installation,
publication, commit or push requires a request covering that action.

At the original planning stage only this document was created. Subsequent owner
authorisation enabled the implementation and production-build checks recorded
in the linked verification report. Deployment remains outside this task.
