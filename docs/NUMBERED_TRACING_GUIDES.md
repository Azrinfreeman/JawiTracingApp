# Numbered writing guides

Added on 2 October 2026 following the user's request for numbered cues showing
where to start, follow, stop and finish a letter.

## Project-owner approval — 2 October 2026

The user explicitly wrote **“approve”** after being shown the implemented
numbered guides and the Ba review preview. This records acceptance of the
current numbered tracing guidance for the 12 existing lessons: start/follow/
stop/finish labels, sequential stroke and dot numbers, lifting instructions,
and the loop start/stop display.

Reviewer: **Project owner (Codex user; name not supplied)**.
Date: **2026-10-02**, using Asia/Kuala_Lumpur.
The accepted implementation's file hashes and existing verification references
are recorded in `output/verification/numbered-guides-approval.json`.

This feature approval preserves the existing 12 model approvals and 37 audio
approvals. It does not approve additional tracing models or assert a named
teacher assessment or a pupil trial of the new cues. The guides are already
active in the game; no additional switch is required.

Five additional revision-2 models now use these guides in student lessons: Sa,
Jim, Ca, Ha (ح) and Kha. Their geometry was subsequently approved by the project
owner on 2026-10-02; see
[the first batch review notes](LETTER_BATCH_1_REVIEW.md). Five further models use
the same guides in student lessons: Zal, Zai, Syin, Sad and Dad. The project owner
subsequently approved their revision-2 geometry and sequence on 2026-10-02;
see [the second batch notes](LETTER_BATCH_2_REVIEW.md).
The remaining 15 entries now have approved revision-2 models with the same numbered
guidance in student lessons; see [the final batch notes](LETTER_BATCH_3_REVIEW.md).
The project owner approved their geometry and sequences on 2026-10-02. The original
guide approval remains scoped to the 12
lessons listed in its dated record; the later batch approvals are recorded separately.

The second batch's phone QA also moved the small in-board reward leaf to the
lower corner and kept number labels out of that corner. This prevents it from
covering Syin's high dots or labels. Number anchors, input rules and model
approvals are unchanged; the original implementation hashes remain a dated
record of the earlier feature approval.

## What children see

The current part of a letter displays large numbered circles directly on its
trace points, with short labels beside the writing path:

- **Mula:** touch this number to start the current stroke.
- **Ikut:** follow the route through the middle number; keep tracing.
- **Henti:** stop at the stroke endpoint and lift before the next part.
- **Siap:** the endpoint or final dot that finishes the letter.
- **Titik:** touch a dot, then lift before the next dot.

Only the current stroke or dot is shown. Numbers continue through the letter's
existing movement sequence. For Ba, 1–3 show the body and 4 shows the final dot.
For Ta, the body uses 1–3, followed by separate dots 4 and 5. A short stroke uses
just its start and endpoint to keep its numbers apart.

A brief instruction under the board explains the numbers and when to lift.
The current waypoint is filled; passed waypoints become softer. In Jejak Ceria,
the final destination has an outlined dashed badge until validation is ready.
Then its filled badge and **Angkat jari untuk siap** cue ask for release; an
unfinished near-end lift shows an arrow to the saved frontier and the destination
number. A remaining tail stays visible without painting over the number. These
3 October refinements preserve the number anchors, model approvals and original
2 October guide approval scope. See [verification](TRACING_COMPLETION_AND_PERFORMANCE_VERIFICATION.md).

The 4 October endpoint correction distinguishes missing tracing from accepted
work awaiting confirmation. Once the existing coverage and checkpoints are
earned, the final badge is filled and **Sentuh titik …, kemudian angkat jari**
asks for a fresh endpoint tap and release. The missing-tail arrow is hidden in
this state. A held valid contact asks for a lift; Ghain's body then exposes its
separately numbered upper dot. Cancellation never commits a part, and incomplete
tracing still shows the saved frontier. This changes Play input policy to
`play-guided-v2`; anchors, model revisions and the dated approvals above remain
preserved. See [implementation and verification](ENDPOINT_FINISH_DETECTION_VERIFICATION.md).

Numbers and
labels scale for phone and tablet layouts. Labels are placed away from the
writing routes and from each other.

For a closed loop such as Mim's first stroke, the start and stop share a point.
One circle first displays the start number, then the stop number after passing
the middle. Separate start/stop labels explain this return to the same location.
The next stroke receives the next numbers after the loop is completed and lifted.

## Input and teaching content

The existing authored stroke paths, dot targets and movement sequence determine
the number positions. The follow waypoint is halfway along the authored arc.
These are visual landmarks, not extra mandatory checkpoints, extra taps or a
new scoring rule. The overlay does not intercept touch, pen or mouse events;
touching the start or dot circle uses the existing input handler at that point.

Numbered guidance appears in tracing modes. It disappears while a demonstration
plays and is absent from blank copying. Pause/resume, accepted progress, dot
validation, rewards and normal student attempt recording continue to work.
Geometry/audio approvals, content versions and the recordings are preserved.

## Files and checks

- `src/tracing/numberedGuides.js`: visual sequence, positions and label placement.
- `src/components/NumberedTraceGuides.jsx`: SVG numbers, labels and current cue.
- `src/components/TraceBoard.jsx`: active-part integration and the instruction.
- `tests/browser/numbered-guides.spec.js`: native number-to-trace interaction,
  body-to-dot transition, Mim loop return, demonstration/copy isolation, and
  the initial guides of all 12 models on 320- and 768-pixel layouts.

Engineering results and screenshots are recorded in the acceptance record and
`output/verification/numbered-guides-production.json`. Children should try the
new cues on the actual tablet/phone so their clarity can be observed directly.

The build and 59 unit checks pass. Across the broader run and four affected
rechecks, 44 distinct Chromium/WebKit browser cases pass, including all 12
initial number layouts on phone and tablet. Eight production screenshots have
no horizontal overflow, page errors or external requests. Actual numbered-dot
input completes Ba in student mode, and the previously approved catalogue and
audio hashes remain intact. The first eight-worker run had four timeouts;
rechecks used two workers, and the multi-letter layout check now reuses the
student garden without repeated teacher-screen reloads.
