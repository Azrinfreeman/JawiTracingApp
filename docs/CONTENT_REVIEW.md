# Teaching content review

Status: 37 student-ready lessons as of 2026-10-04. The project owner approved the 27 tracing
models redrawn from the catalogue glyph that day, with Kaf revision 2 and Ga revision 3, after testing
them in the app ([approval record](CONTENT_APPROVALS.md#approval-of-glyph-matched-models-2026-10-04),
[review sheet and verification](GLYPH_MATCHED_TRACING_MODELS_VERIFICATION.md)). See [the correction review sheet and
verification](KAF_GA_SHAPE_CORRECTION_VERIFICATION.md).
The project owner approved the earlier 12 pilot models and 25 additional
revision-2 models on 2026-10-02; those historical approvals are preserved in
[the approval record](CONTENT_APPROVALS.md).
All 37 current name recordings were subsequently approved by the project owner;
see [the audio approval record](AUDIO_APPROVALS.md). No named teacher assessment
has been supplied. The user's
subsequent authorisation produced 37 synthetic audio drafts, then supplied files
replaced 27 matching entries while 10 were retained. See
[the current recording review list](AUDIO_REPLACEMENT_REVIEW.md).

The source of truth is `src/content/letters.json`. Review geometry and audio
independently. Teacher review is required for teaching accuracy, beyond the
behavioural tests of the tracing engine.

## Current asset inventory

| Content | Count | State |
| --- | --- | --- |
| Jawi catalogue entries | 37 | Labels/glyphs from the existing research bank |
| Pilot handwriting models | 12 | 11 approved at revision 1; corrected Kaf revision 2 pending review |
| Additional handwriting models | 5 | Sa, Jim, Ca, Ha (ح), Kha; revision 2; approved by project owner |
| Second additional handwriting batch | 5 | Zal, Zai, Syin, Sad, Dad; revision 2; approved by project owner |
| Final handwriting batch | 15 | 14 approved at revision 2; corrected Ga revision 3 pending review |
| Letter-name recordings | 37 | 27 supplied MP3/WAV recordings and 10 retained synthetic MP3s; approved by project owner |
| Pronunciation examples | As selected by educator | Not yet specified/recorded |
| Current geometry approvals | 37 | Every model at its current revision; project-owner approval (29 of them on 2026-10-04) |
| Audio approvals | 37 | Project-owner approval of current recording revisions |
| Student-ready lessons | 37 | Current model and required audio approvals match their revisions |
| Numbered tracing guidance | All 37 authored models | Sequential movement and dot cues; Kaf/Ga reviewed through adult preview |

All 37 models are approved at their current revisions. The earlier 2026-10-02 approvals of 27
of them were for previous revisions and are historical; the redrawn revisions (and Kaf and Ga) were
approved on 2026-10-04.

The approval source is the user's explicit message, not a fabricated teacher
identity. All 37 name recordings are approved at their current revisions; all 37
approved models are student-ready in the app. See the
[additional model notes](LETTER_BATCH_1_REVIEW.md).
The second batch is also available to students; see
[its review notes](LETTER_BATCH_2_REVIEW.md). The final batch's earlier approvals
at revision 2 remain in [their historical review notes](LETTER_BATCH_3_REVIEW.md).

No catalogue entry remains without a tracing model. Kaf/Ga's new revisions need
fresh geometry approval. Teacher assessment and physical pupil/device review remain
outstanding and are separate from the recorded project-owner approvals.

The chosen pilot order is not a compulsory KPM teaching order. PI 1.5.1 concerns
recognition and naming. Tracing is preparation for writing; it does not by itself
satisfy PI 1.5.2 reading or PI 1.5.3 copying words.

## Review a model

1. Open Ruang guru → Buka beside the model. Compare its drawing and demonstration
   with the intended preschool handwriting style and the research reference.
2. Check the isolated form, all dots/marks, start, direction, pen lifts and sequence.
   Do not infer every stroke direction from RTL text order. Decide whether actual
   assisted tap stamps are appropriate or a later short-mark policy is needed.
3. Check consistency across similar bodies (ba/ta/nun) and differences between
   ha forms, ta forms, ye and ya. Check all additional Jawi characters.
4. Confirm the display model matches the intended pen route. Edit centreline
   paths rather than turning glyph outlines into strokes.
5. Trace valid examples on the actual target device. Try plausible incorrect
   forms, missing dots and the wrong direction. Adjust the explicit profile or
   model, then rerun geometry and browser checks.
6. Record the real reviewer, date, source/reference and reviewed revision. Keep
   `pendingReview` until review has actually happened. Never fabricate approval.
7. Increment `contentVersion` when changing a model. Clear stale geometry review
   metadata and review it again. Older attempt versions remain distinguishable.

`geometry.review` for an approved model records `revision` matching
`contentVersion`, `reviewer`, an ISO `date` and `reference`. These values must
describe a real review. Approved geometry alone does not enable student lessons;
required recordings must also be approved and present.

## Engine calibration

`src/tracing/profiles.js` contains initial engineering values for the 1000-unit
board. The implemented `strict-v2` defaults are:

| Setting | Guided mouse/pen | Guided touch | Precision mouse/pen | Precision touch |
| --- | --- | --- | --- | --- |
| Corridor centre radius | 22 | 34 | 16 | 24 |
| Start / end gate | 30 / 26 | 46 / 38 | 24 / 20 | 34 / 30 |
| Contiguous coverage | 98% | 98% | 99% | 99% |
| Backward jitter | 10 | 10 | 6 | 6 |
| Dot hit radius / maximum travel | 24 / 14 | 34 / 20 | 20 / 10 | 28 / 14 |

End gates and checkpoints are also required. Raw-gap limit is 80 units, per-event
advancement cap 90, and the local projection tie band is
3 units to handle pixel quantisation at a tight turn. That band does not widen
the corridor or search a later branch. Numerical values are not KPM standards.

The standard and extra-support settings are fixed for an attempt and stored in
its summary; guided support adds 8 units to body/start/end radii only. Keep neighbouring dot hit regions separable. Inspect narrow teeth,
loops, crossings and very small boards rather than globally enlarging tolerance.

Precision completion also limits invalid travel to max(20 units, 6% of total
reference length) and eight rejected gesture episodes. Wrong starts, failed dots
and movement after rejection contribute to invalid travel; stationary samples
do not multiply the episode count. A rejected gesture removes its provisional
ink and restores its pre-gesture baseline. It cannot resume until release.
Clean guided prefixes can resume; an early lift restarts an unfinished continuous
precision stroke. A resize, cancel or lost capture clears an unfinished stroke
and retains completed parts.

Current dots use separate validated taps and assisted target stamps, without
freehand trails. Actual tap locations and rejected raw input remain in session
diagnostics, separately from accepted ink. Mean error includes accepted segments
throughout the attempt, including segments later rolled back. Completion after
clean retries does not imply a mistake-free session or independent dot writing.

## Physical and pupil review record

### Jejak Ceria assistance — 2 October 2026

The preschool default uses a separate `play-guided-v1` profile. Its initial
engineering settings on the 1000-unit board are:

| Setting | Mouse/pen | Touch |
| --- | --- | --- |
| Corridor radius | 40 | 60 |
| Start/resume / end gate | 56 / 48 | 76 / 64 |
| Contiguous measured coverage | 95% | 95% |
| Backward jitter / acquisition arc | 18 / 20 | 18 / 20 |
| Total tight-turn projection allowance per stroke | 18 | 18 |
| Board-dot radius / travel cap | 36 / 24 | 48 / 40 |

Authored dot hit and travel limits, and 45% of neighbouring-target separation,
can reduce those board-dot values. The alternative pad is at least 48 × 48 CSS
pixels (currently 64 pixels high), permits at most 24 CSS pixels of cumulative
travel, and needs its own valid press/release. Its coordinates are client CSS
coordinates, not board coordinates. One pad action fills one pending target.

Play keeps the 80-unit raw gap and 90-unit event advance limits. Re-acquisition
sets an anchor without adding coverage; the local projected high-water mark and
forward direction check prevent repeated wiggles from ratcheting a route.
At overlapping tight turns, movement direction selects the appropriate local
segment. A maximum 18-unit allowance per stroke accommodates the difference
between a short raw chord and its genuine authored turn projection; the entire
intervening authored arc must remain inside the corridor. The allowance and
observed source frontier survive lifts, pauses and diagnostic rotation. Its
used amount is exported as `turnProjectionAllowanceUnits`; it is part of
assisted route coverage, never independent handwriting precision.
Ordinary deviation, lifting, cancellation and resize retain accepted play
progress. The 18,000-sample/100-gesture diagnostic cap offers deliberate
continuation that rotates diagnostics while retaining progress and aggregate
metrics. Demonstrations preserve progress and cannot score pupil input.

The colour fill and terminal completion display are authored geometry assistance.
`playComplete`, `displayAssistance: routeFill`, measured coverage, pause/resume
counts, final display fill and equivalent-dot actions distinguish this result
from validated strict ink and actual blank copying. This is supported movement
practice, not evidence of independent handwriting or dot placement precision.
The Jejak Ceria implementation did not change content versions, teaching
approvals or recording statuses. The subsequent project-owner model approval
is recorded separately above and in CONTENT_APPROVALS.md.

Review the start cue, route width, dot pad, pause recovery and reward with actual
children on the intended device before setting final tolerances. These numbers
are development candidates, not KPM standards or validated preschool norms.

### Actual review still required

For every session record device/browser, board size, input type, handedness,
content revision, profile, teacher observations and any adjustments. Compare
tracing with blank copying and writing on paper. Record outcomes without public
ranking or official TP claims. A pupil pilot, iPad Safari, Android Chrome and
physical stylus/pressure checks have not been performed.
