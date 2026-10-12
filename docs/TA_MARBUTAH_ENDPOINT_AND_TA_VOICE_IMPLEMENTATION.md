# Ta marbutah: finish the loop and say “Ta”

Date: 11 October 2026  
Status: **Tracing implemented; audio revision 2 explicitly approved and active.**
See [the approval and verification](TA_MARBUTAH_TA_VOICE_APPROVAL.md) and
[the preceding implementation review](TA_MARBUTAH_ENDPOINT_AND_TA_VOICE_REVIEW.md).
The original proposal follows.

## Requested result

Fix Ta marbutah getting stuck at the end of its tracing loop. Once the child
has traced the required route to **3 Henti** and lifts their finger, accept
the loop and move to the two dot taps. Complete the letter only after both
dots are accepted. Change its spoken letter name to **“Ta”**, with no “marbutah”
at the end. Keep the displayed label **Ta marbutah**, glyph ة and letter identity.

The original document-only stage changed no application code, teaching content or recordings.
The earlier approval of Jim/Ca/Ha/Kha does not approve this new proposal.

## Observations and current source

The supplied image shows the loop mostly coloured, contact near its top,
the end marker and the instruction “Ikut hingga hujung 3.” The two dots remain
unfilled. A still image cannot establish the preceding pointer movement,
accepted coverage, release event or installed application version; the exact
cause of the stall remains to be reproduced.

In [the catalogue](../src/content/letters.json), `ta-marbuta` currently has:

| Item | Current value |
| --- | --- |
| Geometry/content revision | 4, owner-approved |
| Body | One continuous closed stroke; start and end both `(505.1, 469)` |
| Checkpoints | 25%, 50%, 75%, 95% |
| Required order | `stroke-1`, `dot-1`, `dot-2` |
| Voice | Audio revision 1, `/audio/letters/ta-marbuta-name.mp3` |
| Voice transcript | `Ta marbutah` |

[The play matcher](../src/tracing/playMatcher.js) already has endpoint
confirmation, final-release processing and bounded overshoot assistance.
[Numbered guides](../src/tracing/numberedGuides.js) already handle overlapping
start/end markers and derive instructions from finish eligibility. Investigate
the remaining closed-loop case rather than assuming these features are absent.

## Implementation sequence after authorisation

### 1. Reproduce and identify the failing condition

Use the current approved Ta marbutah model in a lesson, Solo and both Duo lanes.
Trace from the shared top point around the loop, through checkpoint 95%, back
to the top and release. Include slow touch movement, ordinary drawing speed,
small final movements and a release whose coordinate supplies the last sample.

Record the build, viewport, input type and event sequence. Inspect accepted
arc progress, local projection near the shared start/end, checkpoint status,
finish eligibility, pause reason and pointer-up/capture handling. Distinguish
a projection stall from missing route coverage, a lost release or stale UI.
Save a failing deterministic regression before making the correction. Confirm
the smartboard's installed version when available; do not infer it from the image.

### 2. Apply the smallest supported tracing correction

Follow the existing local, forward-progress matcher design. If the final arc
is being confused with the starting branch, resolve it using the accepted
frontier and actual movement. If the final release or UI state is responsible,
fix that specific handling instead. Keep feedback and completion based on the
same finish predicate.

- Accept a legitimately finished loop on release exactly once, without requiring
  repeated rubbing or restarting the whole loop.
- Retain the existing bounded endpoint-confirmation/recovery path for an
  eligible interrupted trace. Show an accurate lift or resume instruction.
- Keep coverage, checkpoints, direction and bounded movement requirements.
  Endpoint proximity alone must not complete a newly started closed loop.
- Reject shortcuts, reversal, teleporting and missing route intervals. Do not
  increase global tolerances or manufacture coverage to hide the failure.
- After the loop, require two separate dot contacts/releases in the authored
  order. Do not complete the letter at marker 3 or award duplicate score.
- Keep each Duo player's pointer, progress and result independent.

Preserve Ta marbutah's approved path, dots, stroke order and content revision 4
for a matcher/input correction. If reproduction demonstrates that geometry
must change, isolate that candidate with a new revision and obtain fresh review
before replacing the approved model. Preserve unrelated models and approvals.

### 3. Replace only the spoken name

Prefer reusing the existing approved **Ta** recording at
[`public/audio/letters/alphabet/ta-name-v2.mp3`](../public/audio/letters/alphabet/ta-name-v2.mp3).
Its manifest transcript is already “Ta”; its supplied source is
`voices/alphabet/03_ta.mp3`. This avoids clipping a word or generating a new voice.
Audition the exact recording before selecting it for Ta marbutah.

Prepare Ta marbutah audio revision **2**, transcript `Ta`, using an unchanged,
versioned copy of those recording bytes with a Ta-marbutah-specific URL. Preserve
the source hash and permission provenance. Leave the original Ta entry and both
old recording files intact. Do not carry over the old synthetic voice metadata
or revision-1 approval to the new audio revision.

Follow [the recording rules](AUDIO_RECORDING.md): present the exact replacement
for review, then record the actual reviewer, date, scope and revision when
approved. Source Ta's previous approval is provenance, not a fabricated new
Ta-marbutah review. Keep the current approved voice active until the replacement
is approved; a review candidate must not disable the existing student lesson.
Geometry approval remains independent of the audio revision.

## Expected files and verification

| Area | Likely files / checks |
| --- | --- |
| Tracing | `src/tracing/playMatcher.js`; input/controller or guide/rendering code only if reproduction implicates it |
| Regression | Extend `tests/geometry/terminal.test.js` and relevant matcher/input tests; add the captured closed-loop case |
| Browser | Extend `tests/browser/tracing-terminal.spec.js`, `endpoint-finish.spec.js` and relevant Solo/Duo cases using existing helpers |
| Audio | Target entry in `src/content/letters.json`, versioned MP3, focused audio metadata/hash regression |
| Records | Current audio review/approval records and project state only when their status actually changes; preserve historical reports |

After implementation, follow [the verification guide](VERIFICATION_GUIDE.md):

1. Run the unit suite and `npm run build` once for the completed change; the
   build includes content validation. Record commands, inputs and results.
2. Verify legitimate loop completion, early lift/resume, eligible endpoint
   confirmation, final-sample-on-release, overshoot, cancellation and all two-dot
   requirements. Check near-start taps, wrong direction and missing checkpoints
   cannot finish the loop. Exercise affected play and strict behaviour.
3. Check lesson/Solo/Duo using mouse and Chromium touch; inspect phone, tablet
   and desktop captures of the overlapping end marker and subsequent dot cues.
   If shared matcher code changes, cover other closed loops and existing
   shortcut/reversal/interruption regressions as well.
4. Audition the actual replacement in a supported runtime: it must say only
   “Ta”. Check playback/replay, mute, navigation and playback failure handling.
   Mocked audio tests do not establish pronunciation or audible playback.
5. Compare before/after content and asset hashes: only the intended Ta-marbutah
   audio fields/new asset and necessary tracing code may change. Verify original
   Ta audio, all unrelated letter content, saved progress and readiness remain
   intact. Do not invalidate geometry credit for an audio-only revision.

Consult [recorded environment limits](PROJECT_STATE.md) before runtime testing.
Browser emulation does not establish physical smartboard or Android behaviour;
report any unavailable device verification. APK packaging, deployment and
publication are outside this request.

## Completion criteria

A valid Ta-marbutah loop no longer stalls at the shared top endpoint; lifting
advances to the two dots and completing them finishes the letter once. Invalid
or incomplete tracing remains incomplete. The reviewed replacement says “Ta”
through every letter-name playback entry point. Displayed identity and unrelated
teaching content remain unchanged.

The original document-only stage checked links, source facts and scope without
executing app changes. Implementation and verification after authorisation are
recorded in the linked review document. The subsequently reviewed audio revision 2
is now explicitly approved and active, as recorded in the linked approval document.
