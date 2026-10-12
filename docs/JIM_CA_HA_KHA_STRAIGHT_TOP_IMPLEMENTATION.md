# Straight top tracing for Jim, Ca, Ha (ح) and Kha

Date: **11 October 2026**, Asia/Kuala_Lumpur.
Status: **Owner-approved and promoted on 11 October 2026.**

The user authorised implementation with “proceed”, then explicitly approved
Jim 5, Ca 4, Ha (ح) 4 and Kha 4. Those exact reviewed models now appear in
student lessons and scored challenges; obsolete candidate cards expire.
See [approval verification](JIM_CA_HA_KHA_STRAIGHT_TOP_APPROVAL.md) and the preserved
[preceding review](JIM_CA_HA_KHA_STRAIGHT_TOP_REVIEW.md). The plan below records
the implemented review-and-promotion workflow.

## Requested result

Apply the user's second attached picture to the four letters identified in the
first picture: **Jim (ج), Ca (چ), Ha (ح) and Kha (خ)**. Replace the curved top
tracing stroke with one straight stroke running **left to right**:

```text
1 Mula  ───────────  2 Ikut  ───────────  3 Henti
   left                 middle               right
```

The red handwritten numbers in picture 2 indicate the intended new order:
left = 1, middle = 2, right = 3. The printed right-to-left numbers in that
picture describe the current Jim model and must change. Interpret "straight"
as a horizontal top line for the proposed preview, without the existing hump,
dip or curled ends. Exact placement will be visible in the geometry review.

Only the top stroke changes. Retain the curved lower bowl/tail, its direction,
the separate pen lift before it, and all dot positions and actions. Ha here is
`ha-pedat` (ح), **not** `ha` (ه). Catalogue text and its font glyphs remain the
letter reference; the authored tracing model receives the requested straight top.

## Confirmed current source

Checked against [letters.json](../src/content/letters.json) and
[numberedGuides.js](../src/tracing/numberedGuides.js) on the date above:

| Letter | ID | Current approved revision | Current top direction | Proposed revision |
| --- | --- | ---: | --- | ---: |
| Jim | `jim` | 4 | Right to left | 5 |
| Ca | `ca` | 3 | Left to right | 4 |
| Ha (ح) | `ha-pedat` | 3 | Left to right | 4 |
| Kha | `kha` | 3 | Left to right | 4 |

All four have two body strokes. Their first stroke is curved; their second
stroke starts near the middle of the head and draws the lower bowl. Body
movements precede the dots: Jim has one lower dot, Ca three lower dots, Ha none,
and Kha one upper dot. These sequences and dot objects must remain exact.

Numbered guides derive their anchors from the actual tracing route. Routes at
least 320 model units long receive start, midpoint and endpoint numbers; shorter
routes receive two numbers. Changing labels alone would leave tracing and
demonstrations curved, so the authored path itself must change.

## Implementation steps after authorisation

### 1. Create four isolated review candidates

Add `src/content/jimFamilyStraightTops.json` with explicit base/proposed revisions
and the replacement top path. Extend the existing candidate factories in
[reviewCandidates.js](../src/content/reviewCandidates.js), cloning each matching
approved entry and changing only:

- `contentVersion` to the proposed revision in the table;
- `geometry.status` to `pendingReview` and `geometry.review` to `null`;
- `geometry.strokes[0].path` to the straight top path;
- the corresponding `geometry.displayPaths[0]` to that same path.

Proposed coordinates in the existing 1000 × 1000 model space:

| Models | Replacement `stroke-1.path` | Midpoint for number 2 |
| --- | --- | --- |
| Jim, Ca, Ha (ح) | `M 377.6 389.3 L 710.9 389.3` | `(544.25, 389.3)` |
| Kha | `M 377.6 389.7 L 710.9 389.7` | `(544.25, 389.7)` |

Each line is 333.3 units long, preserving the current automatic three-number
rule. Its height matches the existing bowl start, so the unchanged bowl joins
the straight head without a gap. The left/right extent retains the current
head's endpoint x coordinates. These are proposed review coordinates, not
already approved geometry.

Keep stroke IDs, widths, display widths, checkpoints, pen-lift policies,
`stroke-2`, dot objects and `validSequences` unchanged. Preserve every audio
object and recording. Do not reverse the entire letter, redraw its bowl, or
connect the right endpoint to the bowl with an extra traced movement.

### 2. Reuse tracing, guides and demonstrations

Use the new candidate paths through the existing reference preparation,
renderer, matcher and demonstration pipeline. Both the displayed top and the
accepted tracing route must be straight; completed model illustrations and
demonstrations must agree with them.

The first stroke must show **1 Mula** at its left endpoint, **2 Ikut** at its
midpoint and **3 Henti** at its right endpoint. They describe one continuous
movement; touching 2 is not a separate tap action. The second stroke starts
with number 4 at its existing bowl start after lifting. Dots remain last and
continue the numbering generated from the existing sequence.

Add revision-scoped guidance in
[teachingCues.js](../src/tracing/teachingCues.js) for these four candidates:
"Mula di 1. Tarik garis lurus ke kanan hingga 3."
For the bowl, retain its route and make the lift/restart instruction clear.
Full and current-section demonstrations must draw the top from left to right,
pause for the existing lift, and then draw the bowl and dots in order.

Keep Jejak Ceria as the default and retain existing tolerances, completion rules,
shortcut/reversal protection and scoring. A first contact at the right endpoint
must not earn a completed left-to-right top stroke. Do not change global guide
thresholds or matcher behaviour unless an actual regression requires it.

### 3. Expose a concrete adult comparison

Add a dedicated **Kepala lurus Jim, Ca, Ha (ح), Kha** option to
[VideoModelReview.jsx](../src/components/VideoModelReview.jsx), using the existing
original/candidate comparison and tracing preview. Keep it separate from the
historical Jim video proposal, which produced approved Jim revision 4.

Show all four before/after models, their candidate revision numbers, and a note
explaining the straight left-to-right top. Preview tracing must exercise the
actual candidate route, guides, demonstrations, bowl and dots. Preview attempts
must remain excluded from normal student completion and scored eligibility.

### 4. Preserve the geometry approval boundary

Under [AGENTS.md](../AGENTS.md), implementing this proposal creates new geometry
that needs fresh review. Keep the current four approved entries in `letters.json`
active for students while the candidates await approval. Implementation
authorisation does not approve the new shapes.

After explicit approval of the identified candidate revisions, promote those
exact reviewed models. Record the actual reviewer, approval date, scope and
revision in `docs/CONTENT_APPROVALS.md`; retain historical records. Audio approval
remains independent. Keep older saved attempts, but do not credit their old
content revisions as completion of the revised models. Candidate cards must
expire once their base revisions no longer match the catalogue.

## Expected files

| File | Planned work |
| --- | --- |
| `src/content/jimFamilyStraightTops.json` (new) | Four revision-bound straight top corrections. |
| `src/content/reviewCandidates.js` | Isolated candidate factory using the existing review pattern. |
| `src/components/VideoModelReview.jsx` | Dedicated comparison/preview scope. |
| `src/tracing/teachingCues.js` | Revision-scoped straight-to-the-right instruction. |
| `tests/geometry/jimFamilyStraightTops.test.js` (new) | Direction, straightness, numbering, review isolation and preserved content. |
| `tests/browser/jim-family-straight-tops.spec.js` (new) | Actual tracing, demonstrations, guide placement and preview separation. |
| `docs/NUMBERED_TRACING_GUIDES.md`, `docs/CONTENT_REVIEW.md`, `docs/PROJECT_STATE.md` | Current delivery/review status when implementation is complete. |
| `src/content/letters.json`, `docs/CONTENT_APPROVALS.md` | Exact promotion only after explicit geometry approval. |

Renderer, reference preparation and guide layout changes are conditional on a
demonstrated issue; the existing modules already consume authored paths. Leave
the validator schema intact unless genuinely needed. Preserve unrelated local
work and all other 32 catalogue entries.

## Verification after implementation

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md); these checks are planned,
not completed evidence:

1. Run `npm test` once after edits. New focused tests must confirm the four
   candidates validate but are not student-ready; sampled top points are
   collinear and advance in x; guides are 1/2/3 in increasing x; the bowl,
   dots, sequence and audio match the implementation baseline exactly. Exercise
   base-revision mismatch and preview progress isolation. Preserve historical
   approval assertions using their original fixtures when live revisions change.
2. Run `npm run build` once; it includes content validation. Before approval,
   all 36 existing approved lessons must remain ready and exact. Do not run a
   duplicate content-validation command immediately beforehand.
3. Run the new browser cases with Chromium and WebKit, at most two workers:
   `npx playwright test tests/browser/jim-family-straight-tops.spec.js --project=chromium --project=webkit --workers=2`.
   Cover all four candidates in Jejak Ceria, strict tracing and outline tracing;
   trace the complete top, lift, bowl and every dot. Verify wrong-end starts,
   reverse movement, endpoint release, restart/recovery and completion. Test full
   and section demonstrations, including reduced motion, without earning progress.
4. Inspect initial, mid-top, top-complete and finished captures at representative
   phone, tablet and desktop sizes. Check the straight reference/accepted ink,
   left-to-right arrow, 1/2/3 placement, bowl connection, dot clearance, readable
   instructions and no clipping. Recompute SVG screen coordinates after resizing,
   scrolling or captures that move the page. Include Chromium emulated touch;
   record physical tablet/smartboard testing separately if hardware is available.
5. After approval/promotion, verify normal student lessons and Solo/Duo challenges
   use the exact new revisions, all movements finish, and older saves remain
   readable without granting new-revision completion. Confirm unchanged hashes
   for unrelated catalogue entries and audio. Run only checks affected by that
   promotion; do not reuse pre-promotion evidence for changed eligibility.

Reuse a running local server after confirming its address and current build.
Record commands, scope, input revisions, browser/viewport/input type, totals and
capture locations in the implementation verification report. Check existing
environment limitations before retries; do not claim native device verification
from browser emulation. No APK build, deployment or publication is in this plan.

## Document-stage verification

This document was checked against the four current catalogue entries, guide
generation, candidate review flow and verification guide. Referenced existing
paths and the document's scope were reviewed. No application build or browser
suite is required for this documentation-only delivery. Implementation and
visual acceptance remained pending at that document-only stage. The implemented
preview and its current evidence are recorded in the linked delivery report.
