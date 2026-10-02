# Jejak Ceria — preschool tracing implementation plan and Codex super prompt

Prepared: 2 October 2026.

**Status: implementation authorised and completed locally on 2 October 2026.**
The user subsequently requested execution. This document retains the design and
reusable super prompt; README.md and [ACCEPTANCE.md](ACCEPTANCE.md) record the
implemented behaviour and actual verification. Teaching assets and their review
states are unchanged. No deployment was requested or performed.

**Subsequent audio update:** the user later authorised synthetic recordings for
review. All 37 name MP3 drafts now play in adult preview; audio approval remains
pending. See [AUDIO_DRAFT_REVIEW.md](AUDIO_DRAFT_REVIEW.md) for the current inventory.

## 1. Recommended direction

Make **Jejak Ceria**, an assisted tracing activity, the default preschool experience. The child follows one large Jawi route, sees it gradually fill with colour, receives a small celebration, and chooses whether to continue or repeat.

When the finger wanders, **pause the colour fill and keep the good progress**. Show where to continue. Let the child return there with the same held finger or lift and touch again. No restart, error sound or loss of earned progress is needed for an ordinary excursion.

This changes the preschool default from strict handwriting validation to supported practice. The earlier concern about unrestricted scribbling still matters: off-route movement produces no freehand marks and cannot fill skipped sections. The letter fills only as the child makes eligible forward movements through the current part.

Keep existing strict guided/precision practice available through **Ruang guru**, with its current `strict-v2` rules. Keep blank copying as actual free writing for teacher observation.

The coloured letter is an **assisted display of progress**, not a reproduction of the child's exact handwriting. Record that distinction in outcomes and teacher diagnostics. Learning aims are recognising the letter, hearing its name when a recording is available, noticing direction and required dots, and practising hand movement with support.

## 2. What was reviewed in the video

Reference: [ABC Kids - Tracing & Phonics┇Kids Mobile Games 1, ABC Genius — start at 0:29](https://www.youtube.com/watch?v=GLADskpj6dU&t=29s). The requested interval is **0:29–0:39**.

The video was played in the browser and its frames were inspected within that interval, including the start at 0:29, partial fill at 0:31/0:34 and celebration at 0:39.

| Visible feature | Adaptation for Taman Jawi |
| --- | --- |
| A large uppercase B occupies most of the activity area. | Give one Jawi model most of the lesson area; reduce surrounding reading and settings. |
| A line of dots and a direction arrow indicate the current route. | Show an uncluttered dotted trail and one clear start/frontier marker on the active authored Jawi stroke. |
| The letter changes from a dark base to a bright coloured fill as tracing progresses. | Reveal a coloured segment along the authored route as eligible progress grows. |
| Small sparkles appear during progress/completion. | Use a brief reward when a required stroke or dot is completed. |
| A cheerful character and confetti accompany the completed letter. | Use Taman Jawi's own simple leaf/flower motif and a brief completion celebration. |

The clip demonstrates the presentation and a successful interaction. It does **not** establish its internal tolerance values, off-route recovery algorithm, scoring rules or educational effectiveness. The pause/resume and accessibility rules in this proposal are our recommended adaptation, not verified claims about the reference game's implementation.

Use original assets and the existing Hanana Academy branding. Do not copy the video's characters, artwork, sounds or Latin-letter movement rules into the Jawi game. Jawi direction and stroke order continue to come from the authored model and eventual teacher review.

### Supporting design guidance

NAEYC describes developmentally appropriate practice as responsive, playful learning that builds on a child's strengths. Its teaching guidance supports cues, demonstrations, appropriate assistance and meaningful feedback. These principles inform the gentle recovery and optional help proposed here; they do not validate a particular digital Jawi tolerance or establish a KPM rule. [NAEYC definition](https://www.naeyc.org/node/3807), [NAEYC teaching guidance](https://www.naeyc.org/node/3812).

For ordinary buttons and equivalent tap controls, aim for at least **48 × 48 CSS pixels**, preferably 56–64 for the main child action. W3C's enhanced target-size guidance uses 44 × 44 CSS pixels with specified exceptions; our larger value is a product choice. It is not a claim that every letter detail can have a separate 48-pixel hit region. [W3C Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced).

## 3. Mode boundaries and relationship to the existing specification

| Activity | Audience/default | Display | Recovery | Meaning of completion |
| --- | --- | --- | --- | --- |
| **Jejak Ceria** / `play` | Preschool default | Assisted coloured route, dotted active guide | Pause and resume, retain accepted progress | `playComplete`: required parts followed with assistance |
| **Berpandu** / `guided` | Teacher-selected practice | Actual validated pupil stroke ink | Existing gesture rejection and rollback until release | Existing `guidedComplete` |
| **Kurang panduan** / `precision` | Teacher-selected later practice | Actual validated pupil stroke ink, lighter guides | Existing strict continuity and deviation budget | Existing `precisionComplete` |
| **Salin sendiri** / `copy` activity | Optional teacher observation | Actual unrestricted drawing | Existing copying behaviour | `copySaved`, without automatic handwriting judgement |

This proposal supersedes the **default child flow** in the earlier [strict implementation](STRICT_TRACING_IMPLEMENTATION.md). It deliberately permits assisted route rendering and same-pointer recovery in `play` only. The existing strict matcher and its no-snapping/rollback guarantees remain applicable to strict modes.

Do not treat `play` as a wider instance of `createMatcher()`: widening its radius would still leave rollback, lift and precision-budget behaviour unsuitable for the intended default. Implement a separate pure assisted matcher, sharing geometry/input infrastructure where useful.

Teacher selection is fixed for a lesson attempt. Changing activity/mode starts a new attempt; it does not convert a partially completed strict attempt into an assisted success. The child does not have to choose a difficulty level before playing.

## 4. Child experience

### A. Enter and recognise

1. Keep the Hanana Academy splash and existing welcome flow.
2. Select a letter in the garden. In the current build, the adult-preview gate remains because the models and recordings are not approved.
3. Enter a lesson in Jejak Ceria by default. Show the name and glyph, a prominent writing board, and the short prompt **`Ikut titik ini.`**
4. Offer **`Dengar`** and **`Tunjuk cara`** as large icon-plus-text controls. Play a reviewed name recording when supplied and permitted by the browser. Missing audio must not block play.

Avoid automatically starting a full demonstration on every lesson. A static start cue is sufficient for the first invitation; an optional help animation shows the next movement without earning any progress.

### B. Follow and recover

- Show one active route with a large start/frontier cue. Other required parts remain visible more quietly so the complete Jawi form can still be recognised.
- Start filling when eligible forward input is received. Fill follows the authored route rather than freehand pointer coordinates.
- Keep the finger area clear: put the short prompt outside the path and avoid a mascot covering the current route.
- On a sideways excursion or reversal, stop progress and retain the existing colour. Gently pulse the continuation cue and show **`Sambung di sini.`**
- The child may return to the saved frontier in the same gesture or lift and resume. Re-acquisition itself earns no progress; movement after it is checked independently.
- No red error border, buzzer, accuracy percentage, countdown, lives or lost progress for ordinary mistakes.
- A short backward wiggle is harmless but cannot add coverage. Scribbling away from the current frontier cannot fill the letter.

### C. Add required dots

- After the required body sequence, emphasise one pending dot with **`Sentuh titik ini.`**
- A deliberate contained tap fills that target and gives a small response. One gesture marks one dot.
- A dot drag creates no line and leaves earlier body/dot progress intact. Invite another tap after release.
- On small screens, provide a large equivalent **`Tambah titik`** button/pad for the active target if the board target is too small. It adds exactly that pending target after a valid press/release. Record this as assisted button input, not as an accurate tap at the dot's actual location.
- For Ta, the first valid tap/button action marks one target; the second requires a separate action. Previously completed targets and the other target cannot satisfy the current one accidentally.

### D. Celebrate and choose

- On completion, retain the coloured letter and show a brief original flower/leaf celebration, approximately **800–1,200 ms**.
- Use specific text such as **`Kamu sudah ikut huruf Ta!`**, with **`Dengan bantuan`** as a small understandable label.
- Present **`Huruf seterusnya`** and **`Main lagi`**. Continue only when the child chooses; do not automatically send them to another letter.
- Keep copying optional. Hide large teacher metric tables and difficulty selectors from this child screen.
- Celebration does not prevent pressing next/repeat and respects reduced motion and mute.

### Example: Ta

`Pilih Ta → ikut badan huruf → berhenti sekejap jika tersasar → sambung → sentuh titik pertama → sentuh titik kedua → huruf berwarna + bunga → pilih seterusnya atau ulang.`

At no point does an ordinary excursion remove the finished body or require starting the whole letter again.

## 5. Layout, colour and feedback

Use the existing React/Vite/JavaScript, plain CSS and native SVG stack. A new game framework is unnecessary for this change.

- Give the board the dominant space. On phones place the compact name/audio row above it and the help controls below it; collapse the current long side instructions.
- Use the established cream/green palette with a brighter, contrasting accent for the coloured progress. Do not encode active/completed states with colour alone: add a direction cue, dotted trail or check.
- Keep one prominent moving/pulsing cue rather than several simultaneous arrows. In reduced motion, use a static marker and static completion decoration.
- A small original smiling leaf/flower can acknowledge completed parts. Use repo-native SVG/CSS and existing motifs; no new image-generation dependency is required.
- Space dotted guide points by arc length, approximately 35–50 logical units initially. For long routes reveal a short active guide ahead of the frontier rather than filling the whole board with markers.
- Make child controls at least 48 CSS pixels in both target dimensions. Keep reset/back distinct from the tracing surface so stray strokes do not activate them.
- Use concise Malay instructions. Avoid explaining projection, accuracy thresholds or input policies in the child flow; those belong in Ruang guru.

Suggested cues:

| Situation | Child text | Display response |
| --- | --- | --- |
| Start | `Ikut titik ini.` | Large start marker and dotted active route |
| Paused/off-route | `Sambung di sini.` | Retain colour and emphasise saved frontier |
| Next part | `Ikut bahagian ini.` | Move cue to next required authored stroke |
| Required dot | `Sentuh titik ini.` | Highlight one pending target and show equivalent large pad when needed |
| Completed | `Kamu sudah ikut huruf Ta!` | Completed coloured model and brief flowers |

Help and reward animations are presentation only. A moving helper must not feed synthetic points into either matcher.

## 6. Assisted input and progress rules

### Separate engine

Add `src/tracing/playMatcher.js` with a pure API compatible with the board's event lifecycle:

```text
start(rawPoint) → snapshot + inputDecision
move(rawPoint)  → snapshot + inputDecision
end(rawPoint)   → snapshot + inputDecision
cancel()       → snapshot + inputDecision
snapshot()     → state only, no replayable event decision
```

Suggested phases: `awaitingStart`, `tracing`, `paused`, `awaitingMark`, `complete`.

Keep ordered sequences, completed parts, each stroke's retained frontier, a current raw anchor and a paused flag. Reuse prepared reference polylines, logical coordinates, local projection and segment-subdivision helpers. Do not search a whole letter for the nearest path.

### Start and resume

1. Resolve the eligible part using authored `validSequences` and already completed parts.
2. A down inside its permitted start/resume region may arm that part. Acquisition alone adds no coverage or fill.
3. A down elsewhere is ignored for progress, while the single captured pointer may subsequently enter the correct start region. Entering arms a new raw anchor only; it does not join the wrong-start movement to the route.
4. Resume must be close to the retained frontier in both space and local arc position. A point near a later branch or endpoint cannot acquire that branch.
5. Preserve the actual raw down/move/up coordinates for diagnostics, including ignored movement.

### Valid movement

Validate the actual chronological raw movement between anchors before advancing. Use a local arc window, corridor checks, direction/branch continuity, capped arc advancement and sufficiently fine subdivision to detect curved shortcuts. Small jitter is tolerated; stationary input, repeated taps and backward motion earn no forward distance.

Only advance the contiguous retained frontier of the active part. Renderer instructions identify the accepted frontier; they do not represent the child's raw ink as a perfect drawn route.

**Verified implementation refinement:** keep an observed projection high-water
mark per stroke across gestures, separately from credited colour progress.
Resolve overlapping tight turns with raw movement direction. For a genuine local
turn whose intervening authored arc stays inside the corridor, use a maximum
18-unit projection allowance per stroke to handle quantisation and the arc/chord
difference. Its total does not reset on a lift, pause or diagnostic rotation.
Record `turnProjectionAllowanceUnits` as assistance within projected route
coverage. Never credit the artificial edge of a clipped search window: repeated
tiny loops and repeated re-acquisition must remain unable to fill a whole route.

### Pause and re-acquire

On an invalid segment, excessive gap, meaningful reverse or route departure:

1. Keep all previously accepted progress and completed parts.
2. Drop the movement segment that caused the pause. Do not join its endpoints or interpolate it into credited coverage.
3. Clear the raw continuity anchor and show the resume cue at the retained frontier.
4. While paused, off-route samples add no progress.
5. A later sample inside the legal resume region, even with the same held pointer, sets a fresh anchor and returns to tracing. That sample earns zero coverage.
6. Check subsequent movement from that new anchor normally. No segment bridges the paused interval.

The start/resume region is an acquisition aid. It must not grant a large arc jump merely because the pointer lands within a broad halo. Include tests for jitter inside the halo, distant re-entry and repeated tiny movements to prevent fill without meaningful route-following.

### Lifts, cancellation and completion

- Clean or off-route early lifts retain accepted play progress. The next gesture can continue from the saved frontier.
- Pointer cancellation, capture loss or resize drops only the active input anchor. Retain accepted logical progress in `play` and require re-acquisition; never commit solely because of interruption.
- Keep strict cancellation/rollback behaviour unchanged in strict modes.
- Complete each required stroke on a deliberate eligible pointer-up after its required coverage/checkpoints/end gate are met. Release away from the route cannot complete it.
- Give play mode its own assisted outcome; it does not use precision's whole-attempt invalid-distance budget or impose a session failure for many pauses.
- Retain the existing bounded raw-buffer limits. If they are reached, stop capture and provide a deliberate resume action that keeps play progress, rotates bounded diagnostics and starts fresh input. Do not silently award completion or grow memory without bounds.
- Completion of the full letter requires all required strokes and dots in an allowed authored sequence.

## 7. Candidate play tolerances

Keep the **1000 × 1000 logical board**. These are initial engineering candidates for the new `play` policy, not preschool norms or KPM thresholds. Test them on the pilot models and actual target devices before settling on final values.

| Setting | Mouse/pen | Touch |
| --- | ---: | ---: |
| Active corridor radius | 40 | 60 |
| Start/resume acquisition radius | 56 | 76 |
| End gate radius | 48 | 64 |
| Minimum contiguous coverage | 95% | 95% |
| Backward jitter allowance | 18 | 18 |
| Total tight-turn projection allowance per stroke | 18 | 18 |
| Board dot hit radius before geometry/separation clamps | 36 | 48 |
| Dot cumulative travel limit | 24 | 40 |

Retain the existing raw-gap ceiling 80, maximum arc advance 90, local projection tie band 3 and approximately 3-unit segment subdivision as initial safety bounds. Raw gaps pause rather than erase. Verify touch sampling in practice before adjusting any bound; record final choices explicitly.

Use the smaller board-dot radius allowed by the authored hit region and safe separation from other dot targets, including completed targets. The equivalent large pad handles cases where a physically small or tightly spaced dot cannot provide an easy isolated target. Do not enlarge all dot regions until they overlap.

Coverage and checkpoints must remain coherent: with a 95% threshold, all existing required checkpoints still have to be passed. After eligible completion, the display may fill the short remaining terminal section as assistance. Keep the achieved coverage and any terminal display fill distinguishable in teacher diagnostics; never overwrite measured coverage with 100% merely because the displayed letter is fully coloured.

Profiles are fixed for the attempt and identified separately, for example `play-touch-standard-v1`. Do not alter the existing `guided-*‑v2` or `precision-*‑v2` values. Additional help cues may appear without silently widening the numerical profile.

The play start/resume search uses a 20-unit acquisition arc. The equivalent pad
uses a 24-CSS-pixel cumulative travel cap. Native checks on Sin and Kaf exposed
the tight-turn ambiguity, so the bounded direction-aware refinement above was
added without widening corridor radii, altering content or changing strict v2.

## 8. Rendering and dot policy

### Three distinct representations

| Data/display | Meaning |
| --- | --- |
| Raw gestures | Actual hand/pointer movement, including ignored/paused intervals; bounded diagnostics |
| Play colour fill | Assisted progress revealed along authored geometry; never exported as freehand handwriting |
| Strict/copy ink | Existing actual validated strict ink or unrestricted copy drawing |

Add a distinct `play-fill` group/layer. Reveal a stroke prefix from zero to its accepted arc length using SVG stroke dash length or an equivalent authored-path reveal. Use round caps/joins and an authored display mask if helpful. Rendering must never award progress.

Do not generate the fill from arbitrary off-route points. Do not pass its ideal route coordinates into raw metrics, `exportInk()`, copy thumbnails or handwriting assessments. Give the diagnostic a policy such as `inkPolicy: 'assistedRouteFill'`.

Keep existing actual-ink layers for strict and copy activities. Ensure demonstration nodes and play helper nodes are separate, pointer-transparent and unscored. Cue/celebration updates should not resize the board or rebuild the matcher.

### Dots

For existing `policy: 'tap'` targets:

- Start only on an eligible pending dot or its explicit equivalent pad.
- Validate a board tap's live containment, travel and release. Select the intended target unambiguously; tapping the wrong/previous target earns no mark.
- A failed dot gesture produces no ink or stamp; it keeps all accepted letter progress and requires a fresh tap after release.
- A valid board tap stamps one authored circle and records actual down/up positions.
- A valid pad press/release stamps only the current pending dot and records `inputSource: 'equivalentPad'`, its target ID and actual input separately.
- Holding, dragging across both Ta dots or repeated activation of a completed dot cannot satisfy multiple targets.
- Provide keyboard operation of the equivalent pad. Ignore held-key repeats and duplicate pointer/click delivery; a fresh press/release is required for the next target. This is an assisted accessible action, not evidence of a spatially accurate board tap.

## 9. Sound, hints and rewards

Continue using actual reviewed recordings for Jawi names/pronunciation. The current project has **37 missing letter-name recordings** and **zero student-ready lessons**. This plan does not fabricate recordings, reviewers or approvals.

Useful optional Malay instruction assets are `Ikut titik ini`, `Sambung di sini` and a specific completion phrase. Track permission/transcript/review metadata if these recordings are supplied. The UI and visual prompts remain usable without them.

Optional short completion effects can be bundled/licensed sounds or a simple locally produced chime, clearly used as a reward effect. It must not stand in for pronunciation. Respect the shared mute and volume settings and browser user-gesture restrictions; stop stale audio on navigation.

Hints may appear after a short idle period, initially around 4 seconds, and repeat only after a reasonable cooldown. A timer can draw attention to the frontier but must never move it. Hints should stop on accepted progress, navigation or demonstration; reduced motion uses static cues.

Celebrate meaningful parts or the finished letter rather than emitting effects for every input sample. Avoid repeating sounds/sparkles for dwell, tiny wiggles, duplicate taps or paused movement. Keep all rewards skippable and prevent them from stealing pointer input or keyboard focus.

## 10. Outcomes, teacher view and persistence

Preserve local storage key `taman-jawi.progress.v1`, its version 1, bounds, corruption/quota handling and old records. Proposed optional fields:

```json
{
  "mode": "play",
  "outcome": "playComplete",
  "interactionPolicy": "play-guided-v1",
  "inkPolicy": "assistedRouteFill",
  "dotInputPolicy": "validatedTapOrEquivalentPad",
  "displayAssistance": "routeFill",
  "toleranceProfile": "play-touch-standard-v1"
}
```

Keep the existing numeric `assistance` field as the demonstration count. Do not replace it with an object. Add finite optional metrics such as `pauseEpisodes`, `resumeCount`, `ignoredStartGestures`, `equivalentDotActions` and `terminalDisplayFillUnits` if useful.

Preserve required finite metric fields for storage compatibility. Define play `coverage` as retained eligible raw-driven route progress before any final display-only fill. Define mean error using accepted raw movement; include ignored/off-route raw travel in the relevant diagnostic metric without making it a child score. Stationary frames do not become new pause episodes.

Teacher attempt rows must explicitly distinguish `Jejak Ceria · dengan bantuan` from guided, precision and legacy results. The current two-branch mode label in `TeacherScreen.jsx` must be updated so `play` is not mislabelled as `Kurang panduan`.

The result view should use `playComplete` wording and retain strict/copy wording for their own outcomes. In the garden, a completion can still mean the letter was tried, but must not become an independent mastery badge. Record the policy so exported results remain interpretable.

Raw diagnostics stay in memory until deliberate teacher export. Include actual raw gestures, paused intervals, accepted progress, assisted fill metadata and dot input source separately. A mode change cannot relabel old attempts or erase saved copying.

## 11. Proposed file changes

All paths below are relative to this project. **These changes are planned, not executed.**

| File | Proposed responsibility |
| --- | --- |
| `src/tracing/playMatcher.js` — new | Pure assisted acquisition, ordered progress, pause/resume, tap/pad validation and play outcome |
| `src/tracing/profiles.js` | Add explicitly separate play profiles; retain strict v2 definitions |
| `src/tracing/geometry.js` | Reuse local geometry; add shared helpers only if needed, preserving strict regressions |
| `src/components/TraceBoard.jsx` | Select engine/layer by mode; render assisted route fill and clear continuation cue; keep raw capture separate |
| `src/components/PlayFeedback.jsx` — optional new | Small original hint/celebration visuals, reduced-motion handling and cleanup |
| `src/components/DotTapPad.jsx` — new if needed | Large equivalent target action, one pending dot per valid activation |
| `src/tracing/traceReducer.js` | Default child mode to play; preserve attempt boundaries and strict/copy actions |
| `src/screens/LessonScreen.jsx` | Board-first layout and short cues; receive teacher-selected mode instead of requiring child difficulty choice |
| `src/screens/TeacherScreen.jsx` | Choose play/guided/precision before lessons; correct mode/outcome/policy labels |
| `src/screens/ResultScreen.jsx` | Assisted completion copy, brief optional celebration and deliberate next/repeat |
| `src/App.jsx` | Carry practice-mode selection and optional new summary metadata; retain preview/readiness gate |
| `src/storage/progressStore.js` | Validate any new optional fields while reading legacy and strict records unchanged |
| `src/audio/` | Only if optional cues/effects are included: shared mute/volume and safe playback lifecycle |
| `src/styles/app.css` | Large child targets, compact lesson header, distinct fill, minimal cues and reduced motion |
| `tests/geometry/playMatcher.test.js` — new | Independent assisted-state/geometry tests |
| `tests/browser/play-tracing.spec.js` — new | Actual child flow, fill, recovery, dots, layout, input and teacher export |
| Existing browser navigation helpers | Explicitly select strict practice for existing strict cases via the real teacher UI |
| `README.md`, `IMPLEMENTATION.md`, `CONTENT_REVIEW.md`, `ACCEPTANCE.md` | Document actual default, assistance, values and real verification after authorised implementation |

Keep authored paths, content versions and approvals unchanged solely for this interaction change. A genuine handwriting-model edit has its own teacher-review/version requirements.

## 12. Verification required after implementation

The strict game's previous 43 unit and 71 Chromium/WebKit browser checks were the
baseline. The implementation adds independent assisted-matcher fixtures and native
play input coverage, and deliberately selects strict practice through teacher
controls for its regression tests. See [ACCEPTANCE.md](ACCEPTANCE.md) for the
completed runs, production checks, visual evidence and remaining device review.

### Deterministic tests

1. A deliberate forward trace finishes required strokes and dots as `playComplete`.
2. Touching endpoints, dwelling, tapping around the board or repeated tiny wiggles cannot fill a route.
3. Ordinary jitter within the play profile remains usable; accepted progress is monotonic.
4. A sideways excursion pauses without removing the existing prefix.
5. Same-pointer return at the saved frontier arms a new segment and earns no skipped coverage.
6. Wrong-start movement can acquire the legal start later, without bridging the original invalid movement.
7. Early lifts and interruptions retain play progress, while strict cancellation/rollback regression tests still pass.
8. Reversed movement, chord shortcuts, excessive gaps and switching to nearby branches cannot advance skipped intervals.
9. Dots require separate actions; cross-target drags, completed-target taps, dwell and duplicate pad events do not add extra marks.
10. Pad use and final display fill remain distinguishable from measured raw movement.
11. Hints, demonstrations and celebrations cannot change the matcher or complete a part.
12. Legacy, strict and play records round-trip together; malformed optional fields are handled consistently; bounds remain enforced.

### Native browser checks

- Complete **all 12 pilot models in play mode** through actual pointer handlers; exercise independent jitter and recovery, not only exact centreline samples.
- Keep the existing strict suite meaningful by deliberately entering strict modes through teacher controls. Do not change strict expected outcomes to make assisted behaviour pass.
- Test native mouse and emulated touch/pen. Inspect no-overflow and actual target sizes at widths 320, 390, 768 and 1280; test short landscape screens, scrolling and coordinate transforms.
- Verify no freehand trace appears off-route, accepted colour survives pauses, and same-pointer re-entry cannot skip sections.
- Verify a small-screen Ta has an easy equivalent tap action without ambiguous overlapping regions.
- Verify keyboard menus/pad, reduced motion, muted/failed/missing audio, no stale hints/rewards, cancellation, capture loss and rotation.
- Verify mode switching starts a fresh attempt; teacher records label assisted results correctly; strict/copy exports keep their original meanings.
- Preserve splash/logo, catalogue gating, storage quota fallback, reset confirmation and copying regressions.
- Inspect accepted, paused, resumed, dot and completed screenshots. Record timing and raw-buffer bounds without claiming physical display latency from headless measurements.
- Run the unit suite, content validation and production build. Smoke-test the built preview, including colour fill and recovery. Check Firefox if its runtime can launch; record a launch failure honestly.

### Actual preschool/device review

Have a Jawi teacher observe children on the intended device: can they find the start, continue after a pause, touch each dot and understand the celebration without repeated adult correction? Record device, profile, teacher observations and changes. Compare supported tracing with copying and paper writing before making learning or mastery claims.

Physical iPad/Android/stylus and pupil trials are pending. No invented teacher identities, approvals, accessibility-conformance claims or KPM TP scores may be added.

## 13. Implementation order after authorisation

1. Implement the separate play matcher and meaningful tests, preserving strict behaviour.
2. Add assisted fill, continuation cues, dot/pad actions and diagnostic separation.
3. Make play the child default and expose teacher-selected strict practice.
4. Simplify lesson/result screens and add restrained original rewards.
5. Integrate optional cues/effects only when the asset/playback conditions are satisfied.
6. Run meaningful browser/production checks, inspect responsive captures and update the acceptance record with actual results.

This is one local feature update. Deployment, new handwriting assets and pronunciation production are separate work. No implementation starts from creating this document alone.

## 14. Reusable Codex super prompt

Use this only after the user authorises implementation.

```text
Implement the authorised Jejak Ceria preschool experience in this existing
Taman Jawi project. Read docs/PRESCHOOL_PLAYFUL_TRACING_IMPLEMENTATION.md,
the existing implementation and acceptance records, and applicable repository
instructions before editing. The user wants an easy, enjoyable learning flow
inspired by the visible guided tracing and colour fill in the YouTube reference
GLADskpj6dU at 0:29–0:39. Do not infer its hidden scoring algorithm or copy its
characters, sounds or artwork.

Keep React/Vite, JavaScript, plain CSS, native SVG and Pointer Events. Add a
separate pure play matcher and make Jejak Ceria the default child activity.
Keep strict-v2 guided/precision practice available through teacher selection;
keep its matcher, rollback, raw-ink and deviation guarantees intact. Keep
copying as actual unrestricted ink for teacher observation.

In play mode, show one large authored Jawi route with a clear start/frontier,
dotted guide and coloured progress. Validate actual chronological raw input
using local arc windows, direction, segment continuity, gap/advance limits,
checkpoints and authored valid sequences. Fill only a contiguous eligible
prefix. A wrong start or off-route movement produces no freehand trace.

When play input wanders, pause fill and preserve accepted progress. Do not erase
the prefix or require a restart for an ordinary excursion. Permit re-acquisition
at the saved frontier in the same held gesture or after a lift. Clear the old
raw anchor: re-acquisition earns no coverage, and no segment bridges an invalid
interval. Distant re-entry, wrong branches, backtracking, endpoint taps, dwell,
teleports, curved shortcuts and tiny repeated wiggles must not skip sections.
Play cancellation/resize retains accepted logical progress but clears active
input; strict cancellation still follows strict policy.

Treat play colour fill as assisted authored-route rendering. Separate it from
raw hand coordinates, actual strict ink, copying and demonstrations. Never
export ideal fill as pupil handwriting or change measured coverage to 100%
just because the completed display fills a small terminal remainder. Record
playComplete, play-guided-v1 and assistedRouteFill explicitly.

Use the candidate play profile values in the document, verify them across all
12 pilot models and independent jitter/incorrect traces, and record final
engineering choices. Do not silently widen tolerance or alter content geometry
and approvals to force tests to pass. Keep profiles fixed for each attempt.

Preserve a separate per-stroke observed projection high-water mark across input
gestures to prevent repeated acquisition from ratcheting progress. Resolve local
tight turns using real input direction and genuine authored projections, with
the documented 18-unit total turn allowance and its explicit diagnostic metric.
Never credit a clipped search-window edge or reset the allowance on pauses,
lifts or diagnostic continuation. Keep independent repeated-loop checks.

Dots require one valid contained tap per pending target and leave no drag trail.
Keep body and earlier-dot progress after a failed tap. Avoid overlapping hit
regions. On small screens provide a large equivalent pad/button for the active
dot when needed; it stamps one target per deliberate activation, records its
assisted input source and supports keyboard operation. Cross-dot drags,
previous-target taps and duplicate events cannot satisfy additional dots.

Simplify the child layout: board first, a compact name/audio row, one short Malay
prompt, large help/replay controls and no compulsory difficulty choice. Use
Ikut titik ini, Sambung di sini and Sentuh titik ini. Add restrained original
flower/leaf feedback and a brief skippable completion celebration. The child
chooses Huruf seterusnya or Main lagi. Respect reduced motion, mute, volume,
focus and scrolling. Hints and rewards never feed input or earn progress.

Use actual reviewed recordings for Jawi names. Missing/blocked audio must not
prevent play; reward chimes are not pronunciation. Do not fabricate recordings,
teacher reviews, readiness or KPM scoring. Preserve the adult-preview gate,
37-entry catalogue, 12 draft models, zero ready lessons, Hanana Academy splash
and credits. Do not change content versions solely for this interaction update.

Preserve storage version 1, legacy/strict records, numeric demonstration
assistance, bounded raw diagnostics, copy records and quota fallback. Add only
compatible optional metadata/metrics. Update teacher and result labels so play
is shown as assisted practice, not precision or independent mastery. Maintain
raw gestures, paused intervals, accepted progress and dot assistance separately
in deliberate diagnostic exports.

Add meaningful deterministic and native browser tests for pause/resume, no
skipped coverage, wrong starts, all pilot letters, separate dots/pad actions,
input/resize/capture loss, reduced motion, audio and persistence. Existing strict
tests must deliberately select strict practice through the real teacher UI;
keep their guarantees and assertions meaningful. Do not manufacture completion
or set application state from tests to bypass the input pipeline.

Run required unit/content/build checks and relevant full Chromium/WebKit
regressions. Check Firefox if it can launch. Inspect responsive screenshots,
actual target sizes and production preview behaviour. Measure handler/render
performance with honest scope. Record physical-device and teacher/pupil
calibration as pending unless performed.

Update README.md, IMPLEMENTATION.md, CONTENT_REVIEW.md and ACCEPTANCE.md with
the implemented modes, assistance, thresholds, real verification and remaining
dependencies. Complete the local feature and verification. Do not deploy.
```
