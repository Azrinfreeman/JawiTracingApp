# Tracing completion and drag performance

**Prepared:** 3 October 2026, Asia/Kuala_Lumpur.  
**Status:** Implemented after the user's explicit implementation authorisation
on 3 October 2026. The original document-first stage is complete. See
[delivered behaviour, measurements and verification](TRACING_COMPLETION_AND_PERFORMANCE_VERIFICATION.md).
The proposal below preserves its original design and optional profiling steps.

## Requested outcome

Fix the confusing Alif finish/recovery interaction shown in `problem2.mp4` and
make dragging and tracing respond smoothly. Keep Jejak Ceria as the preschool
default, with genuine forward tracing, separate dots and reliable release handling.

The existing [Kaf/Ga implementation document](KAF_GA_SHAPE_CORRECTION_IMPLEMENTATION.md)
and [supplied reference picture](references/kaf-ga-user-reference.png) were
reviewed. They concern the already implemented shape correction. This proposal
preserves Kaf revision 2 and Ga revision 3, their shared connected body, Ga's
one upper dot and their pending geometry review. The other 35 geometry approvals
and all 37 independent audio approvals remain intact.

## Evidence and diagnosis

The [existing video contact sheet](../output/verification/problem2/contact-sheet.png)
shows Alif filling from 1 towards 3 over approximately the first six seconds.
The page then remains at **Sambung di sini**, and repeated contact with **3 / Siap**
does not produce the tracing completion state. Later views show the book's
recognition page; that page's **Siap dijejak** indicator does not establish that
the earlier tracing gesture completed. Video metadata records a 25.73-second,
576 × 1024 recording. Frames cannot reveal the device's exact input stream,
coverage, browser, refresh rate or input latency.

The current code confirms two separate concerns:

| Area | Confirmed behaviour | Implication |
| --- | --- | --- |
| `playMatcher.js`, `profiles.js` | Completion on release needs at least 95% contiguous progress, every authored checkpoint, and a contact inside the end radius. Alif's last checkpoint is 95%; touch end radius is 64 logical units. | Being visibly near the endpoint is insufficient by itself. |
| `NumberedTraceGuides.jsx` | The final waypoint becomes current after the halfway waypoint. | The highlighted **Siap** circle is a destination, but can look like an immediately usable finish button. |
| `TraceBoard.jsx` | The remaining-progress marker sits on the route beneath the numbered overlay. The fill has a round cap. | A short untraced tail can be hidden by the marker, badge and rounded fill. |
| `playMatcher.js` | Acquisition and stationary endpoint taps add no coverage. | A pupil who sees an apparently finished letter can repeatedly tap without recovering. |
| `geometry.js`, `playMatcher.js` | Local projection scans vertices from the beginning; the direction-candidate loop scans the reference again and repeatedly calls projection. References are sampled about every two logical units. | Repeated searches grow expensive along long or complex strokes, even though only a small arc interval is relevant. |
| `inputController.js`, `TraceBoard.jsx` | Coalesced movement and animation-frame painting already exist. Coordinate conversion reads/inverts the SVG matrix for each sample; each movement response builds a full snapshot. Release paints immediately and can leave another paint scheduled. | Optimise the existing pipeline and remove duplicated work. |
| `TraceBoard.jsx` | Each practice paint publishes React state and diagnostic structures; strict/copy painting rebuilds the entire dirty gesture path string. | Inspect render and long-gesture costs as well as matcher time. |

**Read-only diagnostic, completed during document preparation:** independently
sampled Alif's existing quadratic path and passed it to the unchanged touch play
matcher. At 94% it remained `awaitingStart`, with approximately 37.22 logical
units to the endpoint, inside the 64-unit end radius. An endpoint down/up kept
coverage at 94%. A fresh start at the saved frontier followed by forward movement
to 96% completed it, recording approximately 24.81 units of terminal display
assistance. The inline Node probe exited successfully and wrote no files. This
reproduces the finish/recovery mismatch, not the recording's unknown device events.

**Working diagnosis:** an unclear unfinished tail and finish cue explain the
repeat-tap dead end. Repeated geometry searches are a concrete performance
candidate. A lost release event or hardware lag is still unconfirmed and needs
event-level evidence during implementation.

## Completion and recovery changes

### Make readiness agree with validation

Expose a small play-state summary for the current stroke: measured frontier,
remaining arc, checkpoint satisfaction and whether the current valid contact is
eligible to finish on release. Use the same predicate in `end()` and in the
presentation, including paused/exhausted state and endpoint distance. A stale
pointer position must not report readiness after cancellation.

Keep the current 95% minimum, authored checkpoints and endpoint tolerance.
Reducing only the percentage would still leave Alif's 95% checkpoint and would
also obscure the real recovery problem. Do not complete a stroke on pointerdown,
a timer, a stationary tap, or a predicted/synthetic point.

### Show exactly how to finish

- While tracing towards the last number, show **Ikut hingga hujung**.
- When the existing finish predicate is satisfied while held, show
  **Angkat jari untuk siap**; for a non-final body, use
  **Angkat jari untuk bahagian seterusnya**.
- After an incomplete near-end lift, show **Sambung dari anak panah hingga 3**
  for Alif, deriving the number from the guide plan for other letters.
- Distinguish the next destination's highlight from actual finish readiness.
  The static final label may remain **Siap**, but its appearance must not imply
  completion before validation.
- Keep the unfinished tail visible. Where the frontier and final badge overlap,
  offset the resume cue with a short leader to the real frontier. Its contact
  location and matcher still use the authored route. Preserve number anchors,
  fit bounds and loop start/finish behaviour.
- A near-end tap with insufficient progress keeps the explicit forward-movement
  cue. Review resume acquisition so an ahead-of-frontier contact does not produce
  a misleading armed state that cannot earn the missing interval. Re-entry must
  require the existing local frontier relationship and add no coverage itself.

At 94% Alif must show a usable short remaining segment. Touching its frontier
and making the remaining valid forward movement must complete without restarting
the body. At eligible coverage and endpoint position, a valid release must commit
once. Ba/Ga body completion must still lead to the required dot, not finish the letter.

### Verify the release lifecycle

Keep synchronous validation of every real sample. The matcher already passes
the actual `pointerup` position through movement validation before its finish
check; preserve and regression-test this behaviour. Verify coalesced movement
order and the fallback when the API is absent or returns no samples.

Mark a normal release handled before its ensuing capture-loss notification can
cancel or duplicate it. Keep `pointercancel`, resize, disabled input, page turns,
background pause and navigation as cancellations. Cancelled input never scores.
Keep the existing contact-click guard so the tracing release cannot activate a
newly displayed control. Do not add a second mouse/touch listener stack.

The [Pointer Events specification](https://www.w3.org/TR/pointerevents3/#coalesced-events)
describes chronologically ordered coalesced samples and
[capture release after up/cancel](https://www.w3.org/TR/pointerevents3/#implicit-release-of-pointer-capture).
These lifecycle rules inform the checks; they do not establish the video's cause.

## Performance changes, in order

1. **Measure the current pipeline first.** Repair and extend the existing
   `scripts/measure-tracing.js` using the current navigation helpers and teacher
   diagnostics tab. It currently assumes an earlier navigation/export layout.
   Record sample processing, complete event-batch time, frame publication and
   long tasks separately. For play, observe changes in dash offset/measured
   frontier; an existing path's `d` attribute is not evidence of a new fill update.
2. **Search only relevant segments.** Add an arc-interval helper using binary
   search over the existing monotonically increasing `vertices[].s`. Use it for
   `projectLocal` and the play direction-candidate loop. Include boundary segments
   and preserve clipped projection, epsilon, earliest-arc tie decisions,
   direction tests and turn allowance. Keep two-unit reference sampling and
   movement subdivision. Compare results against the current scan with independent
   straight, curved, loop, crossing and hairpin fixtures before replacing it.
3. **Avoid a full snapshot per sample where measured useful.** Retain the public
   matcher API for existing callers/tests. If allocation is material, add a board
   path that returns the input decision and minimal live status, publishing a full
   immutable snapshot once per frame or at gesture boundaries. Keep raw capture,
   pause/resume decisions, ink rollback and validation synchronous. Do not share
   mutable internal state with saved attempts or exported diagnostics.
4. **Convert coordinates once per dispatched batch.** Read and invert a fresh
   SVG screen matrix for the dispatched event, then convert each of its coalesced
   samples with that matrix. Do not cache it indefinitely across gestures.
   Invalidate on viewBox/layout, resize, fullscreen, zoom or scroll changes and
   cancel active input when the existing resize policy requires it. A missing or
   non-invertible matrix follows safe invalid-input handling.
5. **Publish visuals once per frame.** Reuse `attachInput`'s animation-frame
   scheduler. Remove the duplicate scheduled paint after a synchronous final
   flush. Avoid React updates when displayed progress/phase has not changed.
   Keep stable reference/number/label layout outside changing progress renders;
   label placement is already memoised, so preserve that reuse. If profiling
   still shows render cost, update the small fill/cue layer through refs while
   React handles status and transitions. A node must have one update owner.
6. **Reduce diagnostic and long-ink work if the baseline warrants it.** Keep
   raw capture bounded and available for teacher export, but publish diagnostic
   structures on boundaries or a modest cadence, with a final flush before
   leaving. Avoid rebuilding every prior point's SVG string each frame in long
   copy/strict gestures; use bounded path chunks if necessary. Preserve joins,
   original export coordinates and removal of every rejected gesture chunk.
7. **Inspect paint costs last.** Profile the dock's existing backdrop blur and
   changing SVG regions. Simplify blur/shadows only if paint evidence identifies
   them as a material cost, keeping the current theme and legibility. Do not add
   persistent compositor hints or redesign the renderer without evidence.

All real coalesced points still reach validation in order. Throttle visual and
diagnostic publication, never the validation stream. Preserve the 18,000-point
and 100-gesture bounds and deliberate diagnostic rotation. Each Duo board owns
its own state, pointer and scheduled frame; one player cannot delay or overwrite
the other's completion. Keep `onValidated` and the match timestamp synchronous
with acceptance so render cadence cannot change scoring or deadline eligibility.

[Animation-frame callbacks follow display refresh and can pause in hidden tabs](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
Timing observations therefore need foreground state and refresh context; they
must not be labelled physical finger-to-screen latency.

## Proposed files

| File/area | Intended change after implementation authorisation |
| --- | --- |
| `src/tracing/playMatcher.js` | Shared finish readiness, clear terminal recovery state, bounded segment search; reduced snapshot work if justified. |
| `src/tracing/geometry.js` | Exact arc-interval search and batch coordinate conversion helpers. |
| `src/tracing/inputController.js` | One conversion per event batch; final flush scheduling and lifecycle checks. |
| `src/components/TraceBoard.jsx` | Visible remaining tail/resume cue, readiness messages, smaller render/publication work and bounded diagnostics. |
| `src/components/NumberedTraceGuides.jsx`, `src/tracing/numberedGuides.js` | Distinct destination/readiness presentation and truthful instructions; unchanged number anchors and stroke order. |
| `src/styles/app.css`, `src/styles/fullscreen.css` | Necessary cue clearance; paint simplification only if measured. |
| `src/tracing/matcher.js`, `src/App.jsx`, `src/screens/TeacherScreen.jsx` | Only if snapshot/diagnostic interfaces need integration; preserve strict policies and saved data. |
| `scripts/measure-tracing.js`, relevant geometry/browser tests and helpers | Current navigation, meaningful performance measures and completion/input regression coverage. |
| Current state/guide documents and a new verification report | Record delivered behaviour, exact measured inputs/results and limitations. |

No planned change to `letters.json`, recording files, content revisions, approval
records, strict tolerance values, storage format, match scoring or dependencies.
If implementation changes a numerical play tolerance or acceptance policy beyond
the described unchanged finish gates, give it an explicit new policy/profile
identifier and preserve older record meanings; do not silently relabel them.

## Verification after authorisation

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md). Use existing helpers and
at most two browser workers on this host. Confirm a running server's address
and current build before reusing it. Recompute SVG coordinates after resizing,
scrolling or any capture that changes layout.

| Check | Required evidence |
| --- | --- |
| Finish boundary | Alif below/at/above the 95% boundary; inside/outside the endpoint radius; incomplete endpoint taps; valid frontier-to-finish recovery; final movement arriving on up; exactly one completion. |
| Invalid/recovered input | Wrong start, reversal, curved shortcut, large raw gap, overlapping branches, stationary input, repeated re-acquisition, sample exhaustion and explicit continuation. No new skipped coverage. |
| Lifecycle | Coalesced and fallback batches, two independent pointers, normal up followed by capture loss, cancel, rotation/resize, page turn, pause/background, retry and navigation. Cancel never completes. |
| Shared modes | All 37 models complete valid sequences in adult preview where needed; guided/precision rejection and lift policies remain intact. Exercise copying/export and demonstration isolation. |
| Dots and challenges | Separate board/pad/keyboard dot actions, no cross-dot drag completion; Solo and simultaneous Duo, immediate validation timestamps, shared pause/deadline and one result per lane. |
| Visual recovery | Inspect 94% tail, held ready-to-release, resumed and completed Alif; Ba dot transition; Mim loop; Kaf/Ga elbows/dot. Check readable cues and unchanged fitted geometry. |
| Protected inputs | Compare all 37 entries, revisions/readiness, approval metadata and recording bytes with the pre-implementation working tree. Retain old saved attempts/copies/matches. |

Run `npm test` and `npm run build` once after the dependent edits settle; build
already includes content validation. Select relevant Chromium/WebKit cases from
`play-tracing`, `strict-tracing`, `numbered-guides`, `touch`, `kaf-ga`, `book-layout`
and `solo-duo`. Shared geometry/input changes require their broader affected
regressions, not only Alif. Exercise native Chromium CDP touch separately from
synthetic batch/pen fixtures; do not describe those as physical device coverage.

Capture affected states at 390 × 844, 1024 × 768, 768 × 1024, 1920 × 1080 and
native-DPR 3840 × 2160. Include the existing minimum-width layout case. Confirm
no clipping/scrolling, clear tail/endpoint cues and equal Duo stages. Smoke-test
the checked production preview after source checks pass.

### Performance comparison and targets

Use matched before/after runs with recorded source/build fingerprints, runtime,
browser, viewport/DPR, letter/revision, mode, input stream/cadence, hardware and
foreground state. Include Alif, Sin, Mim and Nya, both tablet orientations, native
4K and simultaneous Duo. Kaf/Ga can be measured in adult preview. Include sustained
copying and interrupted/recovered tracing. Use a fixed jitter seed, several runs,
and realistic frame-paced input; protocol command overhead is not engine time.

Record p50/p95/max sample time, dispatched-batch time, visual publication delay,
frame intervals, long tasks and sample/gesture counts. Check whether accepted
progress and the visible frontier agree by the next scheduled presentation.

**Initial engineering targets, not achieved results:** on the recorded local
60 Hz test environment, p95 sample processing ≤ 2 ms, p95 dispatched-batch work
≤ 8 ms, and p95 observed frame interval ≤ 25 ms during sustained replay, with
no tracing-attributable task over 50 ms. A verified final release must publish
its result by the next presentation cycle; scoring remains immediate. At other
refresh rates, report intervals against the measured frame budget. Require a
repeatable improvement where the baseline is slow and investigate any regression
where it is already fast. Report unmet targets honestly rather than adjusting
them after the measurements.

The physical smartboard/tablet from the recording is the decisive check for
perceived smoothness and endpoint recovery. Automated runs establish software
behaviour and timing in their recorded environments. If that device is unavailable,
document physical-device review as outstanding. Respect the recorded Windows
Firefox launch limitation unless the environment changes; WebKit checks do not
establish native iPad touch or Android WebView performance.

## Implementation sequence and handoff

1. Snapshot the current working tree's protected inputs and collect the reproducible
   completion/event/performance baseline without overwriting existing evidence.
2. Implement finish readiness and visible terminal recovery; validate real release
   handling and preserve the existing acceptance gates.
3. Optimise the repeated geometry searches, compare projection results, then
   address measured conversion, snapshot, render and diagnostic costs in order.
4. Run the selected checks, inspect changed visual states and compare matched
   performance recordings. Resolve failures introduced by the work.
5. Record actual results and remaining device limits in a new verification report;
   update only affected current documentation. Preserve historical reports.

No APK rebuild, commit, push, merge, publishing, deployment or external messaging
is included. Existing partial edits remain in place and one writer applies the
authorised implementation. Kaf/Ga geometry approval remains a separate decision.

**Document-stage verification completed:**

| Command/check | Scope and result |
| --- | --- |
| Inline Alif sampler via `node --input-type=module` | Unchanged local matcher/profile and independently sampled existing quadratic; reproduced 94% incomplete, no progress from endpoint tap, and completion after forward recovery to 96%. Exit 0; no files written. |
| Inline Markdown checker via `node --input-type=module` | This proposal: four local links and twelve unique referenced source paths exist; balanced fences and proposal-only status confirmed. Exit 0. |
| `rg --files` and `Get-FileHash -Algorithm SHA256` before/after comparison | All 159 existing source, test, script, documentation and selected root/configuration inputs in the preparation baseline unchanged. This Markdown file is the sole addition in that comparison. |
| `git status --short`, `git diff --check` | Existing modified/untracked work retained; the new proposal is untracked. No tracked whitespace errors, exit 0; Git emitted existing LF/CRLF conversion notices. |

The document was reviewed against the local evidence and implementation scope.
No build or browser suite was run for this documentation-only delivery.
Implementation, performance measurements and verification of changed behaviour
remain pending the user's implementation instruction.
