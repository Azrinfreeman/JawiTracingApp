# Sin and Syin: reference shape and final tail height

Date: 11 October 2026, Asia/Kuala_Lumpur.
Status: **Reviewed Sin 3 / Syin 4 activated on 12 October 2026** after the owner
replied “proceed” directly to their pictured student approval question.
See [activation verification](SIN_SYIN_REFERENCE_APPROVAL.md) and the preserved
[preceding review](SIN_SYIN_REFERENCE_REVIEW.md). The plan below records the
original document-first request and implementation scope.

## Requested result

Correct the tracing bodies of **Sin (س)** and **Syin (ش)** using the third
attached photograph as the shape reference. Picture 1 identifies the letters;
picture 2 shows the current tracing shape. Give particular attention to the
height of the final, upward-curving left tail.

In picture 3, the left tip reaches approximately the horizontal reference line
through the lower part of the teeth/neck area. It remains below the tooth peaks.
Use this relationship to place the tail, rather than copying a screen pixel
coordinate from the tilted photograph or aligning it to the bottom of the bowl.
Show the intended line and final tip in a review comparison so their height can
be checked before approval. The line is a construction reference, not an added
tracing movement.

Match the connected teeth, their transition into the bowl, and the rounded
lower bowl to the reference as needed. Keep the left terminal naturally curved
and upward-facing; avoid an exaggerated tall upright or a blunt horizontal end.
The current large, deep bowl and uniform rounded tooth ends should be assessed
against the photo, rather than moving only a number badge or endpoint circle.
Prioritise the body proportions and tail level; preserve the existing rendering
system where it can express the reference faithfully.

## Confirmed current source

Checked against [letters.json](../src/content/letters.json):

| Letter | ID | Current approved geometry | Proposed geometry | Body/dots |
| --- | --- | ---: | ---: | --- |
| Sin | `sin` | 2 | 3 | One continuous body, no dots |
| Syin | `syin` | 3 | 4 | Same continuous body, then three independent dot taps |

Both current bodies share the exact path:

```text
M 825 360 Q 820 520 750 520 Q 680 520 685 390
Q 685 530 605 535 Q 530 535 535 415
Q 550 735 330 735 Q 165 735 185 510
```

The current final centreline point is **(185, 510)**. Both strokes have width 44,
continuous pen policy and normalised checkpoints 0.25, 0.5, 0.75, 0.95. They
currently use centreline rendering rather than an authored filled outline.
The visible tail edge and the centreline endpoint differ because of the stroke
width and cap. Choose the new endpoint from the desired **visible tip height**,
then verify both the visible shape and actual touch target.

Current geometry approvals date from 6 October 2026 and cover the earlier
[higher-tail review](SIN_SYIN_TAIL_REVIEW.md). The old candidate file
[sinSyinTails.json](../src/content/sinSyinTails.json) represents that historical
revision; preserve it instead of overwriting its reviewed geometry.

Syin's dots are (760, 250), (620, 250), (690, 130), in that order after the body.
Preserve these dot objects, actions and order. Both name recordings are approved
at audio revision 2 and remain unchanged. The separate Ra-4/Zai-5 approval in the
same original user message authorised those already-reviewed shapes only. The
subsequent “proceed” authorises implementation of this new Sin/Syin plan; fresh
approval of the resulting shapes is still required before student activation.

## Implementation after authorisation

1. Snapshot the current Sin/Syin entries and relevant recordings. Prepare new
   isolated Sin-3/Syin-4 adult-review candidates, using the existing review
   factory and comparison UI pattern. Mark candidate geometry `pendingReview`
   with no inherited geometry approval; keep the approved student entries active.
2. Establish a common model-space reference level corresponding to picture 3's
   horizontal line. Correct the photograph's apparent tilt when comparing the
   tooth row, bowl connection and tail tip. Record the selected relationship and
   proposed model coordinates in the review; no exact replacement coordinate is
   prescribed at this document-only stage.
3. Redraw the shared body once and apply the same body path to both candidates.
   Adjust the final curve's control point and endpoint together for a smooth,
   upward finish at the reference level. Refine the bowl/neck/teeth only where
   needed to match the photographed proportions. Do not change the whole canvas
   scale or move a global guide to disguise a wrong tail height.
4. Keep one continuous movement from the rightmost start through the teeth,
   down around the bowl and up to the left terminal. Update `displayPaths`,
   references, fit bounds, automatic guide anchors and demonstration geometry
   together. Keep the checkpoint policy unless a demonstrated issue requires
   a documented change. The final body number and its leader must point at the
   actual corrected endpoint; Syin's three dots still follow separately.
5. Start with the existing path renderer. If a centreline with its current cap
   cannot reproduce the reference's terminal/teeth, author a bounded filled
   contour and progressive reveal through the existing outline workflow. Record
   that as a reference-photo adaptation with appropriate provenance; do not
   describe it as an unchanged font outline or introduce an unnecessary global
   renderer change. Any contour and matching path must agree throughout tracing.
6. Present same-scale before/after illustrations, a tail-height construction
   comparison and interactive adult previews. Ask for approval of the exact
   Sin-3/Syin-4 shapes. After explicit shape approval, promote only those two
   candidates and record the actual reviewer, date, scope and revisions.

## Expected files

- New `src/content/sinSyinReferenceBodies.json` for the revised candidate data.
- [reviewCandidates.js](../src/content/reviewCandidates.js) and
  [VideoModelReview.jsx](../src/components/VideoModelReview.jsx) for the isolated
  comparison scope and previews.
- Focused geometry/browser regressions and baseline fixtures, reusing the current
  tracing/outline helpers and content validator.
- [letters.json](../src/content/letters.json) only when promoting approved shapes.
- A new review record and current content/guide status documentation as applicable.

No audio, shared tolerances, saved-history reset or unrelated letter correction
is included. Preserve historical approval records and earlier local work.

## Verification and acceptance

Use [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) for new geometry:

- Same-scale comparison shows both bodies following picture 3; the final visible
  left tip reaches the documented reference level and stays below the tooth
  peaks. The bowl/neck connection is smooth, with no added kink or hidden stub.
- The visible corrected tail, numbered endpoint, demonstration and accepted
  tracing route coincide. Check cap/width offsets, including any outline variant.
- New candidates stay adult-only; stale approvals are rejected. Preserve all
  other entries, recordings and Syin dot data exactly.
- Run meaningful geometry tests, the unit suite and a checked build once after
  implementation. Cover continuous completion, endpoint contact, early-lift
  recovery, reversed/tail-only shortcuts and all three separate Syin dots.
- Exercise Jejak Ceria, guided and precision with mouse and supported native
  emulated touch in Chromium/WebKit. Inspect phone/tablet/desktop captures for
  tail height, proportions, guide overlap, clipping and progressive-fill seams.
  Recompute SVG screen coordinates after scrolling or resizing.
- Verify saved preview attempts cannot grant student credit. After approval,
  check student revision access, saved history and scored Solo/Duo completion.
  Keep historical attempts tagged with their actual earlier geometry revisions.
- Record commands, scope, results, build/input fingerprints and actual runtime
  limits. Physical smartboard/Android claims require actual device evidence.

## Original document-only stop point

The initial request authorised only this Markdown. The subsequent “proceed”
authorised preparation and verification of the review candidates described above.
No student activation occurs before fresh review of those exact shapes. No APK
rebuild or deployment is included. The preceding Ra/Zai approval remains intact.
