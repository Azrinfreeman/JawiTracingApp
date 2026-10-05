# Stroke-end stall — verification (2026-10-05)

Change: `src/tracing/playMatcher.js`, `profiles.js` (`finishOvershoot`: touch 120, pen/mouse 60), `numberedGuides.js`.
No content, geometry, audio or approval change.

| Check | Scope | Result |
|---|---|---|
| Before fix, real geometry in browser | 37 letters, 52 strokes, 90-unit overshoot then lift | 0/52 commit; drag-recovery 0/52 |
| After fix, same simulation | touch (overshoot 90) and mouse (overshoot 50), same 52 strokes | clean 52/52, overshoot lift 52/52, lift 400 away rejected 52/52, dragged endpoint touch 52/52 |
| `npx vitest run` | all 17 files | 161 passed (5 new overshoot tests; 6 existing terminal tests updated to the new bounds) |
| `npm run build` | includes content validation | passed |
| `npx playwright test --project=chromium` | tracing-terminal, endpoint-finish, play-tracing, touch, numbered-guides, strict-tracing | 50 passed |

Not run: Firefox/WebKit projects, real-device touch, full Playwright suite.

Behaviour change: after the finger has reached the end, a lift within `endRadius + finishOvershoot`
commits even if the gesture drifted off the path; the endpoint confirmation touch tolerates a drag
(travel up to 2 x endRadius, lift within endRadius + finishReleaseSlack). Coverage, checkpoints and
the reversal check still gate completion.

## Follow-up (2026-10-05): leaving the route after reaching the end

The first fix only covered a moderate overshoot (lift within `finishOvershoot` of the end). A screen recording from the
owner (Waw, fill reached the end, pointer then left the route, no progress for several seconds) showed the same stall.
Reproduced with the real geometry of all 37 letters (52 strokes): after the finish was reached, a fast flick (`rawGap`
pause), a slow drift 260 units away (`corridor` pause) or a sideways exit each committed on **0 of 52** strokes, whether
held or lifted, and only an endpoint tap recovered it.

Rule now (`src/tracing/playMatcher.js`): once a stroke gesture has reached the end with 95% coverage, all checkpoints and
the finger within `endRadius` (`active.reachedEnd`), the stroke is complete. Leaving the route (`corridor`, `rawGap`,
`backward`, `advanceGap` pause) commits it immediately without waiting for a lift, and a lift anywhere also commits it.
A cancelled contact (`pointercancel`, resize, sample limit) never commits; the endpoint touch remains the recovery for
that case. Coverage, checkpoints and the finish-distance condition at the moment of reaching the end are unchanged.
Completion is recorded as `releaseAssistance` and counted in `releaseAssistances` (no new stored metric).

| Check | Result |
|---|---|
| Real geometry, 37 letters / 52 strokes, touch and mouse/pen profiles | flick 52/52, slow 260-unit drift 52/52, sideways 52/52 commit while held; lift 52/52; cancel 0 commits; stopping at 80% then drifting away 0 commits; next target becomes pending 52/52 |
| `npx vitest run` | 162 passed (terminal tests rewritten to the new rule; old tests asserted that a drift after the end left the stroke uncommitted) |
| `tests/browser/endpoint-finish.spec.js` | 15 passed after the helper's excursion became a cancelled contact; two new tests cover flick-while-held and lift-far advancing without a tap |
| Other tracing specs (play-tracing, touch, tracing-terminal, strict-tracing, tracing-latency) | 38 passed |
| Wider Chromium set (solo-duo, android-platform, numbered-guides, fullscreen-tracing-audio, low-spec-performance, kaf-ga, game, pilot, letter-batch-1/2/3, glyph-matched) | 316 passed, 88 failed; the same 88 tests (game 6, letter-batch-1 16, letter-batch-2 12, letter-batch-3 54) fail identically with these changes stashed (stale expectations after the catalogue/model change, e.g. 37 vs 14 ready letters, Jim `4 Siap` vs `7 Siap`), so they are not caused by this work and were not changed |

Not verified: the owner's video could not be decoded frame by frame in the tools available here beyond a coarse
sampling; the diagnosis rests on the reproduction above. Not run on a real tablet.
