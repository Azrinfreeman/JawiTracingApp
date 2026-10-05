# Stroke-end stall (Jim 4 → 5 → 6, never reaches 7) — implementation plan

Status: **applied 2026-10-05** (lift-to-advance kept). Verification: STROKE_END_STALL_VERIFICATION.md.

## Symptom

On Jim (`stroke-2`, guides 4 Mula / 5 Ikut / 6 Henti) the fill reaches 6 but the
game does not advance to 7 (the dot). Dragging out of or into 6 does nothing.
Only a stationary tap on 6 advances. A tap should not be the only way through.

## Root cause (`src/tracing/playMatcher.js`)

A stroke only commits on **finger lift**, and only if the gesture is *not paused*
at that moment. Three behaviours combine into a trap:

1. **Overshoot pauses the gesture.** `stroke-2` ends travelling right, so a
   natural drag runs past 6. Once the finger is further than `profile.radius`
   (touch 60) from the path, `move()` pauses with reason `corridor`.
   Reproduced in the browser with the real Jim geometry: dragging 80 units past
   the end gives `pause/corridor`; dragging back in gives `resume`.
2. **Lift while paused cannot complete.** In `end()`, `mayAssist` uses
   `finishStatus()` computed *before* the final `move(p)`. If the gesture was
   already paused by an earlier sample, `canFinish` is false, so release
   assistance is skipped. The result is `partial/corridor`: coverage and
   checkpoints are satisfied, but the stroke is not committed and `stroke-2`
   stays pending. Release at 90 units past the end reproduced exactly this.
3. **The recovery gesture is an endpoint tap, not a drag.** With coverage met,
   a new touch near 6 enters the `confirmation` branch of `start()`. In `move()`
   that branch pauses with `confirmationDrag` once travel exceeds
   `profile.dotTravel` (touch 40) or the finger leaves `endRadius`, and
   `end()` never assists a confirmation gesture. So dragging in or out cancels
   the only gesture that could finish, and only a still tap works.

A clean trace to the end, a 3% short release, a small backward wiggle and a
small overshoot all commit correctly in the same simulation. The failure is
specific to overshooting past the end, then lifting, then retrying by dragging.

## Change

All in `src/tracing/playMatcher.js` and `src/tracing/profiles.js` (play profile
only). No content, geometry, audio, or approval change, so no content revision
or review is needed.

1. **Remember that the end was reached.** In `move()`, set
   `active.reachedEnd = true` whenever `finishStatus(active).canFinish` becomes
   true on an accepted sample (frontier at or past coverage with checkpoints
   met, finger within `endRadius`).
2. **Let a lift after reaching the end commit even if paused afterwards.** In
   `end()`, replace the pre-move `before?.canFinish` test with
   `before?.canFinish || active.reachedEnd`. Keep the existing safeguards:
   `confirmationAvailable`, not `exhausted`, and the reversal check
   (`projection.s >= previousSource - backwardJitter`). Replace the fixed
   `finishReleaseSlack` distance bound with a new profile value
   `finishOvershoot` (touch 120, mouse 60), measured from the stroke end, so an
   overshoot past the end counts but a lift far away from it does not.
   `finishReleaseTravel` still bounds the final jump.
3. **Make the confirmation touch tolerant of a drag.** When the confirmation
   gesture starts within `endRadius` of the end, allow travel up to
   `endRadius * 2` and a finger up to `endRadius + finishOvershoot` from the
   end before `confirmationDrag` pauses it. On lift, commit if the finger is
   within `endRadius + finishReleaseSlack`. It still adds no tracing credit or
   coverage, and it still only exists once coverage and checkpoints are met.
4. **Guidance text.** `guideInstruction()` already says "Angkat jari untuk
   bahagian seterusnya" when `canFinish` is true. Leave it. A paused gesture
   that has `reachedEnd` should keep showing that instruction instead of
   "Sambung dari anak panah", so the child lifts rather than keeps dragging.

### Decision for you

Advancing needs a lift by design (it is what separates a finished stroke from a
stroke in progress, and the on-screen hint says so). I plan to keep that and
fix the cases where lifting failed. The alternative is to commit automatically
the moment the finger reaches 6 while still held. That is simpler for a child
but removes the lift and skips the pause between strokes, and it needs
`TraceBoard.jsx` changes (it expects `commit` on `pointerup`). Say if you want
that instead.

## Tests (`tests/geometry/terminal.test.js`, using `lineReference`)

- Trace to the end, overshoot past `endRadius + radius`, lift: outcome is
  `commit` (currently `partial/corridor`).
- Same overshoot, drag back toward the end, lift: `commit` (already passes;
  guards against regression).
- Lift far from the end after pausing at the end: still `partial` (no
  over-permissive completion).
- Overshoot, then a backward reversal before lifting: still `partial`.
- After a failed (partial) lift with coverage met, a new touch at the end that
  drags 60 units and lifts within tolerance commits; a touch that ends far
  away does not.
- Coverage below 95%: none of the above commits.
- A real-geometry case on Jim `stroke-2` in the browser (overshoot 90 units,
  lift) so the fix is checked on the actual curve, plus the existing
  compact-matcher tests to confirm no regression.

## Verification (per `docs/VERIFICATION_GUIDE.md`)

- `npm test` (the matcher change affects all play-mode letters).
- `npm run check:content` and `npm run build` are not needed for content, but
  `npm run build` runs once to confirm it compiles.
- Browser run of Jim in the in-app browser: trace strokes 1 and 2, overshoot
  6, lift, and confirm 7 (the dot) becomes the next target. Also check one
  more letter whose last stroke ends in a straight line.
- Record command, scope and result in
  `docs/STROKE_END_STALL_VERIFICATION.md`, and update
  `docs/PROJECT_STATE.md` only if the pending-work list changes.

## Risks

- A larger overshoot allowance makes completion slightly easier. It stays
  gated by 95% coverage, all checkpoints, no reversal and a bounded distance
  from the true end, so a stroke cannot be skipped by lifting elsewhere.
- Tablets use the touch profile and mouse/pen the tighter one, so values are
  set per pointer type, as the existing profile already does.
