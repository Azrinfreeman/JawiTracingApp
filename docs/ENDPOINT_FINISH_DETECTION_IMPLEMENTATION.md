# Reliable endpoint finish detection

**Date:** 4 October 2026, Asia/Kuala_Lumpur  
**Status:** Proposed implementation; application and APK unchanged.  
**Request:** Fix the case where tracing reaches the final numbered point but
touching it still does not advance the letter.

## Intended behavior

Once a pupil has earned the existing stroke coverage and checkpoints, a fresh
**tap and release on its final numbered point** must finish that stroke. The
pupil must not need to wiggle or redraw an already accepted stroke. An ordinary
valid tracing release still finishes directly.

For Ghain, **3 Henti** finishes the main stroke. The game then asks for a separate
touch on **4 Siap**, the upper dot. Finishing the main stroke must not silently
fill the upper dot or award completion before it is touched.

This change applies to **Jejak Ceria in practice, Solo and Duo**, with both light
and full presentation. Berpandu, Kurang panduan and free-copy behavior stay as
currently implemented. Geometry, numbered anchors, stroke/dot order, recordings,
content revisions and approvals are preserved.

## Evidence and cause

In [problems.mp4](../problems.mp4), Ghain shows the instruction to lift at about
12 seconds, returns to a resume arrow at about 12.5–13 seconds, and repeats the
finish/resume interaction until about 24.5 seconds. The upper-dot step remains
locked during that interval. The video has no pointer-event log; it does not
prove a particular Android event sequence or installed APK version.

The [source-level reproduction](../output/verification/problems-video/finish-reproduction.json)
demonstrates the current failure:

1. Trace Ghain normally: `canFinish` becomes true.
2. Release with displacement away from the endpoint: `end()` calls `move(p)`
   before testing readiness. A corridor failure revokes readiness.
3. The matcher keeps **100% measured coverage**, but returns to `awaitingStart`.
4. A fresh stationary endpoint down/up still fails because the new gesture has
   `validTravel === 0`. The UI requests further tracing despite no remaining arc.

Two concerns must be handled separately: the pupil needs a dependable endpoint
confirmation action after accepted tracing, and limited movement delivered only
on release should not unnecessarily revoke an otherwise valid finish.

## 1. Separate earned tracing from the current contact

In `src/tracing/playMatcher.js`, derive a per-pending-stroke predicate:

```js
strokeEligible =
  isPendingStroke &&
  hasAcceptedTravelForThisStroke &&
  coverageSatisfied &&
  checkpointsSatisfied &&
  !exhausted;
```

Keep the current **95% Jejak Ceria coverage requirement** and every authored
checkpoint. Track accepted travel for each stroke; global travel from another
stroke must not qualify the pending stroke. Start acquisition, tapping, display
fill and diagnostic rotation must not manufacture accepted travel or coverage.

Eligibility persists when a gesture ends or is cancelled because accepted Play
progress already persists. Cancellation never commits a stroke. It clears active
finish contacts/release assistance; a later, separately validated endpoint tap
can confirm preserved eligible work. Retry, a new letter/attempt or stroke commit
clears the corresponding state. Exhaustion blocks confirmation until the existing
continue mechanism legitimately restores input capacity.

Expose `finish.confirmationAvailable` separately from `finish.canFinish` in both
`snapshot()` and `view()`. The former describes earned work that can be confirmed;
the latter describes whether releasing the current contact would commit.

## 2. Accept a fresh endpoint confirmation tap

Before ordinary stroke acquisition in `start(p)`, test whether the pending stroke
is eligible and the new contact is inside its authored endpoint's existing
`profile.endRadius`. If so, start an **endpoint-confirmation gesture**. Keep the
existing stroke identity and response kind, with an explicit confirmation flag
and input source for diagnostics.

This contact confirms previously earned work. It does not need the ordinary
20-unit forward acquisition window or new positive tracing travel. Those two
requirements currently prevent an otherwise legitimate stationary endpoint tap.

Require all of the following before committing on `pointerup`:

- A fresh down and up belong to the same owned pointer and pending stroke.
- Eligibility still holds; the board is enabled, unpaused and within its limits.
- Down, every delivered move and up remain in the endpoint hit area.
- Total contact travel is bounded using the existing pointer-specific `dotTravel`
  value: 40 logical units for touch, 24 for pen/mouse.
- No cancellation, capture loss, invalid coordinate or invalid confirmation
  movement occurred. A failed confirmation gesture requires a fresh down.

A stationary tap now satisfies these conditions. A drag into the endpoint from
elsewhere is not a confirmation tap; it follows ordinary tracing validation.
The visual stop badge remains a guide owned by the SVG board, so no independent
DOM click handler can bypass pointer ownership or matcher validation.

Commit through the existing `commit(id)` path **on release only**, once. Report
`inputDecision.action = 'commit'`, preserve measured coverage/raw coordinates,
and let normal sequence selection expose the next stroke/dot or final result.
Do not set progress to 100% to manufacture completion. Existing terminal display
fill remains explicitly assisted and separate from measured coverage.

Taps on an unstarted letter, at 94% coverage, with a missing checkpoint or on a
future dot remain insufficient. In particular, endpoint confirmation must never
skip Ghain's upper dot or advance another Duo player's board.

## 3. Allow bounded movement on an otherwise valid final release

Keep processing the actual `pointerup` sample. Capture readiness and the last
accepted contact **immediately before** that processing. First try the normal
release path, including forward movement that arrives only on up.

If the normal path fails solely because the up coordinate moved slightly outside
the endpoint/corridor, permit a release-assistance fallback only when:

1. This same active tracing gesture was ready immediately before up and was not
   paused, cancelled, exhausted or previously invalid at the terminal contact.
2. The up coordinate is finite and within `endRadius + finishReleaseSlack`.
3. Its displacement from the pre-up accepted contact is at most
   `finishReleaseTravel`.
4. Projection on the terminal part of the authored route does not retreat more
   than the existing `backwardJitter`. A real reversal must remain a reversal.
5. The pending identity, earned coverage/checkpoints and input ownership remain
   valid; the action occurs before the existing match deadline.

Proposed initial parameters, expressed in the model's logical units:

| New Play parameter | Touch | Pen/mouse |
| --- | --- | --- |
| `finishReleaseSlack` | 36 | 18 |
| `finishReleaseTravel` | 60 | 30 |

These are bounded engineering defaults to verify, not device-calibrated values.
They enlarge only the eligible **final release** decision. Normal corridor,
start/end acquisition, maximum raw gap, coverage and dot hit testing retain their
existing values. Record the actual up sample and the assistance decision.

A prior move that already paused the gesture does not receive this fallback.
The pupil can use the fresh endpoint confirmation tap instead. Do not keep a
global “once ready, always complete” latch: it could incorrectly commit after
dragging away, a pause, cancellation or another part becoming pending.

## 4. Show an actionable finish cue

Update `TraceBoard.jsx`, `liveRenderer.js`, `NumberedTraceGuides.jsx` and
`guideInstruction()` to distinguish three states using the same matcher fields:

| State | Visible behavior |
| --- | --- |
| Coverage/checkpoints still incomplete | Show the actual remaining tail, resume arrow and “Sambung dari anak panah hingga 3.” |
| Work eligible, no valid active contact | Highlight the final badge and show “Sentuh titik 3, kemudian angkat jari.”; hide the misleading missing-tail arrow. |
| Valid tracing or confirmation contact ready | Show “Angkat jari untuk bahagian seterusnya.” or “Angkat jari untuk siap.” according to the pending part. |

Use the actual endpoint number rather than hard-coding 3. While a confirmation
contact is held, its final badge must agree with the release predicate. Once
Ghain's body commits, show the existing upper-dot cue and dot pad for point 4.

Include confirmation availability/contact status in `controlKey()` so this
semantic transition reaches React without restoring per-frame numeric renders.
Use the existing dynamic SVG groups and fitted positions. No new animation,
timer, listener per sample or full per-sample diagnostic snapshot is needed.

## 5. Record the changed interaction honestly

This intentionally allows a stationary endpoint confirmation after valid prior
tracing. Give new Play attempts **`interactionPolicy: play-guided-v2`** and
version the Play profile IDs to v2. Derive the board's policy attribute from the
selected profile rather than leaving its current hard-coded v1 string.

Add bounded counters such as `endpointConfirmations` and `releaseAssistances`,
plus a diagnostic completion method (`tracedRelease`, `endpointConfirmation` or
`releaseAssistance`). Keep complete raw down/move/up/cancel events. Apply optional
nonnegative-counter validation to new saved fields; older records remain valid
and keep their original profile/policy and metrics. No storage migration or
rewriting of existing pupil history is required.

Use the existing synchronous `onValidated` timestamp. Solo/Duo scoring, pause
rules, deadlines and one-record-per-completion behavior remain unchanged.
An assisted finish is still Jejak Ceria route following, with its actual measured
coverage; it is not reported as independent handwriting mastery.

## Files to change after authorisation

| File | Planned change |
| --- | --- |
| `src/tracing/playMatcher.js` | Per-stroke eligibility, endpoint confirmation, bounded release assistance and final decision/diagnostics |
| `src/tracing/profiles.js` | Play v2 identity and explicit release-assistance parameters |
| `src/components/TraceBoard.jsx` | Consistent finish instructions/policy attribute and confirmation diagnostics |
| `src/tracing/liveRenderer.js` | Honest endpoint cue, hidden recovery tail when eligible, semantic control key |
| `src/components/NumberedTraceGuides.jsx`, `src/tracing/numberedGuides.js` | Confirmation/held-ready badge states and numbered instructions |
| `src/storage/progressStore.js` | Optional new counter validation without rewriting records |
| Existing terminal, compact matcher, storage, browser and Solo/Duo tests | Meaningful regressions for the changed interaction |
| Android version metadata and current release/verification docs | New verified APK after checks pass |

Keep `inputController.js` sample order, coordinate conversion, pointer ownership
and cancellation semantics. Change that shared module only if reproduction
reveals a separate event-delivery defect. The strict matcher needs no change.

## Verification and delivery

Before editing, preserve relevant source/build hashes and the confirmed failure
replay. Reuse [existing helpers](../tests/browser/helpers/) and select checks
using [the verification guide](VERIFICATION_GUIDE.md).

| Regression | Required result |
| --- | --- |
| Ghain eligible/full body, displaced release, fresh stationary endpoint tap | Exactly one body commit; point 4 becomes available; dot still requires its own valid tap |
| 94%, missing checkpoint, unstarted endpoint taps | No manufactured coverage, completion or stored attempt |
| Eligible 95%/100%, touch/pen/mouse | Stationary confirmation succeeds under its bounded tap rules |
| Direct tracing release and release-only forward movement | Existing successful completion retained |
| Release assistance at/inside/outside each limit | Only eligible, bounded final-up cases pass; raw samples and assistance remain visible |
| Large overshoot, real reversal, bad confirmation move, far-away release | No automatic commit; accepted progress remains recoverable |
| Cancel, resize, background, pause, capture loss and sample/gesture limits | No completion from cancellation; a valid fresh contact can confirm eligible preserved work when input is enabled |
| Alif final body, Ba/Ghain dots, Mim shared loop endpoint, multi-stroke letters | Correct next part, no skipped loop/stroke/dot, no duplicate completion |
| Simultaneous Duo contacts, deadline and pause boundaries | Independent commits and unchanged timestamp/scoring/deadline enforcement |
| Compact/full response APIs, raw export and old saved attempts | Equivalent decisions, complete diagnostics, backward-compatible storage |
| Light/full presentation, phone/tablet orientations | Endpoint target and all required cues fit; no scrolling or conflicting prompts |
| All 37 authored valid sequences | Correct order and separate dots; unchanged content/readiness gates |

After implementation: run the unit suite and checked build, then affected
production Playwright terminal/play/strict/touch, numbering, low-spec performance,
Android lifecycle and Solo/Duo cases. Use Chromium native touch plus precise
synthetic touch for both browsers. Inspect Ghain before finish, awaiting endpoint
confirmation, held ready and the upper-dot transition at 320×740, 1024×768,
768×1024 and the video's 1280×800 viewport. Recompute SVG screen coordinates
after resizing/capturing. Retain the already recorded Windows native-4K WebKit
limitation; do not treat it as successful verification or repeat unchanged stalls.

Check that render/diagnostic throttling and bounded ink remain intact. Compare
representative sequential Play/Duo measurements on the same viewport/build mode;
do not claim improved physical latency from desktop timings. Confirm protected
content/audio/scoring assets against their before hashes.

Package the next unused release (expected **1.0.5, code 6** after 1.0.4), preserving
application ID, signing identity, previous APKs and progress. Verify build/lint,
signature, alignment, version, checksum and packaged asset hashes. Record actual
results in a new verification document and update current release references.
Physical tablet verification must repeat the video interaction: trace to the
endpoint, lift naturally, and, when confirmation is requested, tap and lift once.
It must advance without repeated tapping or wiggling.

**This document is the only requested deliverable at this stage. No matcher,
presentation, test, storage, Android or APK changes have been applied.**
