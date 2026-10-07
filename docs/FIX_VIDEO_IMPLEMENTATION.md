# Implementation plan for the `fix` video findings

Date: 6 October 2026, Asia/Kuala_Lumpur.

**Status: implementation authorised on 6 October 2026 by the user's “proceed”.** The document was delivered before execution, as requested. Code fixes and separate adult review proposals are now implemented; completed checks and limits are recorded in [verification](FIX_VIDEO_VERIFICATION.md). Student geometry remains at its approved revisions; seven proposed revisions require review. A new APK or deployment was not requested.

## Intended result

A child should be able to see where to start, follow the correct branch through each loop, know when to lift and restart, finish every required dot, and hear or deliberately replay the letter name. Correct forward tracing must not stall at Sad/Dad's tight turn. Start, finish and direction indicators must remain readable together.

The work covers all findings in [the 23-video review](FIX_VIDEO_REVIEW.md). The review inspected one-second visual samples across every clip; spoken commentary and sound were not verified. An unchanged blue guide does not prove pen contact, and a completed assisted orange shape does not prove that the teaching movement is ideal. The plan distinguishes verified fixes from device diagnosis and proposed content corrections.

Jejak Ceria remains the preschool default. Guided/precision tracing and free copying retain their distinct behavior. Existing successful examples, protected saved progress, match scoring, readiness gates, unrelated approved letters and recordings remain supported.

## Work packages and observable acceptance

| Package | Scope | Intended behavior | Completion evidence |
| --- | --- | --- | --- |
| A | Sad/Dad turn acceptance | Legitimate forward tracing survives the sharp turn at realistic input spacing. | All 296 existing model/profile/spacing journeys complete; negative tracing cases still reject shortcuts and reversal. |
| B | Badge and arrow layout | Ta marbutah start/stop indicators do not overlap; the active point is identifiable. | Captures at start, mid-loop, end, restart and dot stages, including small phone and Duo lanes. |
| C | Loops, teeth, branches and starts | Wau, Ha ه, Sin/Syin and starting hooks show the immediate required movement. | Child-facing cues and demo follow the same route and active frontier; no premature branch switch. |
| D | Lift, return and dots | The user sees a new start and the dots still required after body completion. | Connected-looking multi-stroke letters and all affected dotted letters complete with fresh, validated gestures. |
| E | Teaching model corrections | Mim, Ta marbutah and questioned stroke orders are reviewed against explicit proposed models. | Dated before/after review, revised content versions when needed, genuine revision-matched approval. |
| F | Touch/contact reliability | Actual received contact, wrong starts and cancellation can be distinguished on the filmed display. | Recorded device/build/input diagnostics and successful touch/pen journeys; no acceptance of hover or fabricated input. |
| G | Speech playback and recovery | Completion speaks once where supported; failures have useful replay recovery. | Playback success/failure, mute, navigation, retry and shared Duo announcement checks plus device listening. |

Packages A–D can be implemented against current approved geometry once implementation is authorised. Packages E–G include evidence or review decisions; they must not be labelled fixed solely because a desktop simulation or visual preview passes.

## A. Fix Sad and Dad's tight turn

The current diagnostic reproduces `advanceGap` on stroke 2 at 32-unit arc spacing for both touch and pen. Accepted progress stops near arc 103.96; the first rejected input is at arc 160. Finer 2/8/16-unit inputs complete. This is a mid-stroke turn issue, separate from the previously implemented endpoint-release fix.

1. Promote the existing reproduction into a maintained regression using the actual Sad/Dad paths. Include points before the turn, across its apex and down the return branch, and check both completion and accepted progress.
2. Inspect projection selection and arc/chord credit around that local turn. Prefer a genuine forward, direction-consistent projection when the adjacent branches are close. Keep compensation bounded by local geometry and actual movement; do not globally increase coverage credit, widen every corridor or remove `advanceGap` protection.
3. Keep raw-gap, checkpoint, sample-limit, reverse-movement, fresh-dot and cancellation rules. Preserve existing endpoint release/confirmation behavior.
4. Test nearby input spacings and shifted sample origins around the turn, with modest corridor offsets. The existing 32-unit cases must pass; additional cases must define their spacing, offset and expected outcome rather than accepting every jump.
5. Repeat the 37-letter audit after the shared matcher change. Any geometry revision later invalidates evidence for that model and requires rerunning affected journeys.

Primary files: [playMatcher.js](../src/tracing/playMatcher.js), [geometry.js](../src/tracing/geometry.js), [profiles.js](../src/tracing/profiles.js), [playMatcher tests](../tests/geometry/playMatcher.test.js), [terminal tests](../tests/geometry/terminal.test.js). Touch the strict matcher only if a separately reproduced issue requires it.

## B. Fix badge collisions and arrow visibility

Ta marbutah's start/end anchors are approximately 33.58 logical units apart, while badges have a combined minimum diameter of 50. The existing coincident-endpoint special case handles distances below two units only.

1. Group colliding start/stop badges using their actual rendered bounds at the current scale. For a shared or near-shared location, show the currently relevant numbered badge and its label, then switch to the stop badge as progress approaches the finish. Maintain the exact authored contact anchors.
2. Give the active frontier arrow priority over decorative inactive badges. Where the arrow obscures a short starting movement or stop marker, place its visible cue beside the route with a leader to the true frontier. The gesture still starts at the authored point.
3. Include labels, arrow halos, dots, menu controls and reward decorations in collision checks. Keep the visible and accessible instructions consistent when a badge is hidden.
4. Recalculate after viewport/scale changes. Preserve minimum readable size and avoid shifting a badge so that it appears to authorise drawing at a different point.

Primary files: [NumberedTraceGuides.jsx](../src/components/NumberedTraceGuides.jsx), [numberedGuides.js](../src/tracing/numberedGuides.js), [liveRenderer.js](../src/tracing/liveRenderer.js), relevant rules in [playground.css](../src/styles/playground.css) and [fullscreen.css](../src/styles/fullscreen.css).

Acceptance includes Ta marbutah plus exact closed-loop models, Mim's start, Ra/Zal/Nun hooks, Wau and Ha crossings. No visual guidance element may intercept pen/touch input.

## C. Explain the actual route through loops and crossings

The current automatic start/halfway/end numbers do not describe every movement. The halfway badge can become active after only 1.5% progress, which can suggest that a nearby number is the immediate drawing destination.

Introduce presentation cues describing approved route sections, while keeping the existing movement and dot IDs. A proposed new module, `src/tracing/teachingCues.js`, should key authored cue overrides by letter ID, content version and part ID; stale revision overrides must fall back safely. Cues contain arc positions/ranges and short Malay text, not new acceptance gates or alternative geometry.

| Letter group | Cue behavior to implement against the current route |
| --- | --- |
| Wau | Show the initial upward turn, route around the head, return through the lower join and continuation into the tail. A direct chord to number 2 must never look like the demonstrated route. |
| Ha ه | Explicitly distinguish the inner route from the outer loop at the crossing. Highlight only the next required branch; advance that cue after accepted progress reaches it. |
| Sin / Syin | Use a short upcoming route highlight to explain successive tooth turns and the entry into the bowl. Avoid adding a crowd of permanent numbers. |
| Ra / Zal / Zai / Nun / Nya | Make the short initial hook readable before long-body movement. The start cue and first demo motion must agree. |
| Sad / Dad | Show head-loop completion, the new second gesture and the sharp return turn. A visual cue must not conceal a remaining matcher defect. |

Keep the main numbering stable for guidance-only changes. Show one immediate section cue at a time, with a compact next-route highlight where it helps. Cues must track accepted progress, not merely the position of a hovering pen or elapsed time.

Update the renderer's `controlKey` when cue boundaries change so React instructions and fast SVG presentation remain synchronized. Avoid per-sample state snapshots, layout measurements or unbounded SVG work; retain frame-batched paint and the lightweight Android presentation.

### Demonstration and recovery

Reuse the existing `Tunjuk cara` animation. Give it clearer pauses at tight turns, branch crossings, pen lifts and dots. Add a menu action such as `Tunjuk bahagian ini` to replay the currently pending section from its valid start/frontier. Show completed progress as context and a distinct demonstration overlay; do not count demonstration as tracing or award points.

Starting a demo cancels active contact safely. On return, preserve accepted Jejak Ceria progress and resume at its true frontier; retain the other modes' established retry/demo semantics. Each lift is shown as pen-up relocation without a connecting ink line. Reduced-motion presentation should show discrete route highlights and instructions instead of relying on animation alone.

Primary files: [TraceBoard.jsx](../src/components/TraceBoard.jsx), [liveRenderer.js](../src/tracing/liveRenderer.js), [numberedGuides.js](../src/tracing/numberedGuides.js), [BookLessonScreen.jsx](../src/screens/BookLessonScreen.jsx), [RaceTracePane.jsx](../src/components/RaceTracePane.jsx), [MatchScreen.jsx](../src/screens/MatchScreen.jsx).

## D. Make lift/restart and pending dots visible in full-screen play

`StageSupport` currently hides detailed instructions and shows the ordinary status only for selected recovery states. The new-stroke and pending-dot instructions can therefore be inaccessible visually even though the text exists in the code.

1. Show a small stage cue during initial acquisition, accepted stroke transitions and pending dots. Keep the single corner menu and full writing area; do not restore a permanent tools dock. Position the cue away from the route and controls, including separate Duo lanes.
2. At a completed stroke, identify the next start: for example, **“Angkat pen. Mula semula di 4.”** Pulse that real start after release. Do not draw a line between old and new starts or join them automatically.
3. If the user lifts before completing a resumable stroke, say **“Sambung dari anak panah.”** Keep the frontier where accepted progress ended.
4. Once all body strokes are committed, show **“Bentuk huruf siap. Tinggal 3 titik.”** Use the actual remaining count, including singular/plural wording.
5. Label every pending dot `Titik`; the last can be described as `Titik akhir`. Show **“Huruf siap!”** only after the final validated action is released. Numbering and dot order stay aligned with the authored sequence.
6. Preserve direct dot taps as the primary input and the existing optional dot pad. Do not count a drag, hover or stroke continuation as a fresh dot tap.

Apply to Ain/Ghain/Nga/Hamzah/Jim and Sad/Dad transitions; dot feedback covers Zal, Zai, Syin, Dad, Za ظ, Ghain, Nga, Ga, Nun, Nya, Ta marbutah and Jim, with shared behavior checked across all dotted models.

Duo readiness remains enforced. Show **“Tekan Saya sedia. Tunggu teman.”** where appropriate. After one player completes, keep **“Siap! Tunggu teman.”** The videos' readiness and waiting states are not input defects to remove.

Primary files: [TracingMenu.jsx](../src/components/TracingMenu.jsx) (`StageSupport`), [TraceBoard.jsx](../src/components/TraceBoard.jsx), [numberedGuides.js](../src/tracing/numberedGuides.js), [RaceTracePane.jsx](../src/components/RaceTracePane.jsx), stage styles.

## E. Review and correct the teaching shapes and writing steps

The visual review identifies concerns but does not provide a verified spoken correction or an authoritative replacement route. The current models have owner approvals. Do not invent a teacher decision or automatically erase those historical records.

Prepare concrete before/after review candidates after implementation is authorised:

| Model | Proposed review candidate / decision |
| --- | --- |
| Mim | Compare the existing open angular head with a clearly closed head followed by the descender. Show every movement and any retraced portion, rather than hiding a discontinuity with thicker fill. Select the intended preschool outline and start direction explicitly. |
| Ta marbutah | Compare the existing short head/join with a clean closed oval and two dots. Decide whether the small protruding join is intentional and where the loop starts/ends. Badge layout must work whichever model is selected. |
| Ain / Ghain / Nga | Compare the present two-stroke upper/body method with the intended classroom movement. Specify whether a lift/return is intentional or whether a reviewed connected route should replace it. Add the correct dots to each related glyph. |
| Hamzah | Review the upper-curve direction and the lift/return for the short tail. If a continuous movement is selected, author that actual movement without a teleport or unshown join. |
| Jim | Compare the current left-to-right head and return-to-middle bowl with the desired starting side, head direction and bowl continuation. A reversal or changed stroke division is a content change. |
| Sad / Dad | Confirm the intended head-loop, second-stroke lift and sharp tooth. Fixing matcher acceptance does not by itself approve a changed tooth or order. |
| Wau / Ha ه / Sin / Syin / Ra / Zal / Nun | Initially preserve the approved paths and improve cues. Revise shape/order only if review identifies a specific remaining mismatch; use the same revision process. |

For every candidate, provide a labelled static comparison, slow route demonstration, stroke count/order, pen-up locations, dot sequence and the relevant clip timestamps. Use the existing adult preview/review modules and comparison tools. A supplied teaching reference or reviewer demonstration determines the final movement; a catalogue outline alone does not determine stroke order.

When changing paths, dots, writing order or teaching geometry, increment the affected content version, set geometry to the appropriate draft/pending-review state and remove any apparent approval for the new revision. Retain the prior approval in the historical record. Record the actual reviewer, review date, scope, reference and approved revision when review occurs. Keep recordings and their independent approval/version unchanged unless a separate recording change is requested.

Pending revisions remain adult-preview content under the existing readiness gate. A later “proceed” authorises implementation, not an invented approval of unseen teaching candidates. Guidance-only changes that preserve geometry, order, dots and content meaning do not require fabricated geometry revisions.

Primary files: [letters.json](../src/content/letters.json), [validateContent.js](../src/content/validateContent.js), [DraftModelReview.jsx](../src/components/DraftModelReview.jsx), [LetterModelGlyph.jsx](../src/components/LetterModelGlyph.jsx), [CONTENT_REVIEW.md](CONTENT_REVIEW.md), [CONTENT_APPROVALS.md](CONTENT_APPROVALS.md), [NUMBERED_TRACING_GUIDES.md](NUMBERED_TRACING_GUIDES.md).

## F. Diagnose and address physical touch/contact problems

Ra, Zal, Nun and Nya contain apparent non-progress; Wau also visibly remains at a frontier. No raw events establish the cause. The existing input controller already consumes coalesced events, captures the pointer and validates samples synchronously. Do not replace it or guess that more generous tolerances will fix device contact.

1. Reuse the in-memory trace diagnostics and teacher export. Add only missing bounded fields needed to distinguish pointer down/move/up/cancel, capture loss, pointer type, sample timing, paused reason and measured frontier. Include the build/content revision and viewport/input environment. Keep developer details out of child-facing screens and avoid per-move storage writes.
2. Reproduce starts and loop turns on the filmed display with pen and finger. Distinguish no received down event from `wrongStart`, `corridor`, `backward`, `advanceGap`, cancellation or dropped/coarse movement.
3. Fix an input-controller, coordinate-conversion or cancellation issue only when reproduced. Maintain recalculation after scrolling, cancellation/re-fit on resize, separate pointers for Duo and no scoring from cancelled gestures.
4. Improve the visible cue for a received but misplaced start: **“Mula pada bulatan hijau.”** For a paused stroke, point to the real resumable frontier. Hover or pointing without contact must never create ink or completion.

Primary files: [inputController.js](../src/tracing/inputController.js), [TraceBoard.jsx](../src/components/TraceBoard.jsx), [TeacherScreen.jsx](../src/screens/TeacherScreen.jsx), [App.jsx](../src/App.jsx), [input-controller tests](../tests/geometry/inputController.test.js). Preserve existing progress/export formats unless a verified requirement needs a backward-compatible addition.

## G. Make completion speech and recovery reliable

Sin and Ye show the playback-recovery notice; the underlying reason and actual audio are unverified. The current manager distinguishes missing, blocked, unsupported, failed and obsolete requests. Reuse those results rather than replace approved recordings.

1. Record the playback result and affected recording/build in bounded adult diagnostics. Also handle media errors occurring after the initial `play()` promise resolves.
2. Prime a reusable voice playback element during an explicit user interaction, where supported, and preload the current approved name recording away from the drawing input path. Treat this as a compatibility improvement to verify; it cannot guarantee that every browser permits later automatic playback.
3. On completion, attempt one approved name announcement. Show replay recovery for a genuine blocked/failed request. Mute should be respected, with a clear muted state; obsolete requests after navigation must not show a false error or restart old speech.
4. Let **Dengar** retry from a direct gesture. A stale recovery notice must clear when replay succeeds. Provide an appropriate unavailable/unsupported message if replay also fails, without showing exception text to children.
5. Apply result handling consistently to practice and Solo/Duo. Keep one shared automatic announcement per Duo round. Sound failure must not block scoring, saving, dots, navigation or completion choices.
6. Preserve music settings, ducking during speech, pause/background behavior, approved recording assets and hashes. This review is not evidence that music or pronunciation is wrong.

Primary files: [audioManager.js](../src/audio/audioManager.js), [AudioControls.jsx](../src/components/AudioControls.jsx), [BookLessonScreen.jsx](../src/screens/BookLessonScreen.jsx), [MatchScreen.jsx](../src/screens/MatchScreen.jsx), [musicManager.js](../src/audio/musicManager.js), related wiring in [App.jsx](../src/App.jsx).

## Verification to run after implementation

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md). Record commands, actual totals, inputs, build/runtime and relevant environment limits. No checks below have been run for this proposed implementation.

1. Run `npm test` after the affected code is complete. Add meaningful Sad/Dad turn regressions and the new guide/state/audio behavior checks to existing relevant suites. Test reversal, chord shortcuts, stationary wiggles, wrong starts, missing dots, cancellation, recovery and end release as well as successful traces.
2. Run `npm run build` once; it includes content validation. Do not duplicate it with an immediately preceding unchanged content check.
3. Reuse the 37-letter, touch/pen, 2/8/16/32-unit audit as a regression benchmark: target **296/296 complete** with existing geometry. Add targeted shifted/offset turn cases and negative cases; a positive-only audit is insufficient.
4. Select and update affected browser cases from `play-tracing`, `tracing-terminal`, `touch`, `numbered-guides`, `glyph-matched`, `solo-duo`, `fullscreen-layout`, `fullscreen-tracing-audio`, `strict-tracing` and the relevant performance specs. Use existing helpers, normally no more than two workers. Check any existing server's address/build before reusing it.
5. Replace stale expectations only in tests affected by this work, using the current catalogue and authored sequences. Do not revert models or rewrite historical evidence to satisfy old counts/numbers. Report unrelated stale failures separately.
6. Inspect start, initial motion, turn, crossing, paused frontier, lift/restart, pending-dot and completion captures. Representative viewports: 320 × 740 phone, 768 × 1024 tablet, 1366 × 768 landscape, 1920 × 1080 and 3840 × 2160 displays, plus the filmed display's actual CSS viewport and zoom. Inspect Solo and both Duo lanes. Recompute SVG screen coordinates after any resize/scroll/capture that changes layout.
7. Check reduced motion, readable contrast/size, no cue/arrow/label overlap or overflow, direct dot taps and optional assistance. Guidance must remain synchronized in lightweight presentation without undoing the existing input-latency improvements.
8. Verify playback/replay with supported real media, plus simulated blocked/unsupported/late-error cases. Respect the recorded Windows WebKit codec/runtime limits: unsupported playback is error-handling evidence, not an audible success.
9. Run a complete current-source journey for all 37 letters, with special focus on revised content in play/guided/precision, free copy, adult preview, readiness and saved progress. Capture content readiness/revision decisions and unchanged audio hashes.
10. On the filmed physical display, verify pen/finger start acquisition, Sad/Dad turns, Wau/Ha branch guidance, stroke restarts, final dots, Duo contact separation and audible completion/replay. Record build identity. Desktop testing must not be reported as physical-device success.

Use [the per-video table](FIX_VIDEO_REVIEW.md#every-video) as the retest checklist: every one of the 23 clips needs a matching issue resolution or an explanation of its expected readiness/pending-dot/idle state. Ga, completed Ra/Zal/Nga/Syin/Ye/Nya and the successful Ha/Hamzah journeys are explicit regression examples.

## Execution order and delivery

After the user authorises implementation:

1. Capture the current code/content/asset inputs and existing saved-data compatibility baseline. Preserve unrelated local work.
2. Implement and verify A/B, then the shared cue, demo and full-screen state work in C/D. Integrate diagnostic/audio fixes F/G as their causes become established.
3. Prepare the concrete E review candidates, implement selected revisions under the content gate and obtain actual review evidence for changed teaching models. Continue independent code work while a content decision is pending.
4. Complete the affected verification once against the final inputs; repeat only for new changes, failures or unresolved concerns. Record any remaining device/audio/content-review limits explicitly.
5. Update current tracing/content/audio guidance and project state. Keep [FIX_VIDEO_REVIEW.md](FIX_VIDEO_REVIEW.md) and earlier verification reports as historical evidence; create a new result report mapping each package and clip to its final outcome.

Deliver the code/content diff, selected review comparisons, verification report and concise user explanation. APK packaging, installing on a device, publishing, pushing and deployment require the corresponding later request. If a physical device or teaching decision is unavailable, finish and verify independent work and identify precisely what remains unverified; do not claim all issues are fixed.

**Original stop point:** deliver this plan before execution. That step was completed; the later “proceed” authorised implementation. Remaining teaching review and physical-display checks are identified in [verification](FIX_VIDEO_VERIFICATION.md) and [content review](FIX_VIDEO_CONTENT_REVIEW.md).
