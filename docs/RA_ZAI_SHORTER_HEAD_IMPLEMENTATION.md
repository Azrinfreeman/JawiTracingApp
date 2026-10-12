# Shorter tracing heads for Ra and Zai

Date: 11 October 2026 (Asia/Kuala_Lumpur).
Status: **Ra 4 and Zai 5 approved and activated on 11 October 2026.** The owner
replied “yes approved” to the pictured two-model question. See
[activation verification](RA_ZAI_SHORTER_HEAD_APPROVAL.md) and the preserved
[preceding review](RA_ZAI_SHORTER_HEAD_REVIEW.md). The plan below records the
implemented review-and-promotion workflow.

## Requested result

Shorten the upper head of **Ra (ر)** and **Zai (ز)** using the black cut mark
in the first supplied picture. The second picture identifies the two letters.
Remove the portion above the marked band and begin tracing at the new, lower
tip. Keep the remaining lower curve and leftward tail at their existing size
and position. Do not shrink the whole letter to achieve the shorter head.

The photographed mark is a visual guide rather than an exact SVG coordinate.
Map its position to the upper sloping section of each current body, then show
the proposed cut in a before/after comparison. Use the same relative cut for
both bodies, accounting for their existing vertical offset. The black mark and
the extra black annotation dot are not new tracing strokes or dot targets.

This request shortens the head; it does not reverse the current writing direction.
Ra remains one continuous movement down through the curve and towards the left
tail. Zai follows the same body movement, then its existing separate dot tap.

## Confirmed current models

Source: [letters.json](../src/content/letters.json).

| Letter | ID | Current approved geometry | Proposed geometry | Current start (model units) | Dot action |
| --- | --- | ---: | ---: | --- | --- |
| Ra | `ra` | 3 | 4 | (583.4, 393.1) | None |
| Zai | `zai` | 4 | 5 | (583.4, 380.5) | One dot after the body |

Both models have one continuous body stroke and a `catalogueOutline` appearance.
Their filled contours and pre-authored progress segments are separate from the
tracing centreline. Changing only the centreline would leave the long head visible;
changing only the outline would leave an invisible tracing requirement.

Ra's body ends at (410.7, 707.7), and Zai's at (410.7, 695.1). Preserve these
endpoints and the remaining lower curve. Zai's dot target is (547, 293), with
visible radius 19, hit radius 48 and maximum travel 30; preserve its action and
position. Show its spacing clearly in the proposed review.

Both name recordings are already approved at audio revision 2. Preserve all
audio metadata and files. Catalogue text glyphs remain the reference glyphs;
the requested change applies to the authored tracing models.

## Implementation after authorisation

1. Snapshot the two approved entries and relevant audio hashes. Create isolated
   Ra-4 and Zai-5 candidates using the existing adult review workflow, leaving
   the approved student catalogue available during review. Set candidate geometry
   to `pendingReview`, clear the previous geometry approval on the candidates,
   and preserve the independent approved audio records.
2. Locate the cut band on each current outline. Trim only the upper section,
   close the remaining contour with a clean short cap, and keep all lower outline
   coordinates unchanged. Use a true contour edit rather than a cosmetic overlay
   hiding an unchanged long head. Retain the original font provenance and record
   the authored shortening separately so it is not described as an untouched font
   contour.
3. Start the centreline inside the new cap. Trim the corresponding prefix of
   the first cubic curve using a curve split, retaining the surviving curve
   exactly; use a small local start adjustment only if needed to align the cap
   and route. Preserve subsequent curves, endpoint, direction and continuity.
   Update `displayPaths` to match the new movement path.
4. Regenerate the body appearance segments against the shortened route, with
   arc distances beginning at zero. Recompute affected body/overall bounds and
   revision metadata. Preserve Zai's dot contour and dot target. Validate closed
   contours, continuous segment partitions and complete progressive filling.
5. Recompute numbered guide anchors, demonstration timing and checkpoints from
   the new route. Keep the existing normalised checkpoint policy unless a
   demonstrated problem requires an explicit change. Ensure `1 Mula` points to
   the new cap, the final body cue remains on the existing tail, and Zai's dot
   cue remains a separate later action. Use the existing automatic numbering
   rules; do not force a redundant midpoint on a shorter route.
6. Present before/after images and interactive adult previews identifying the
   exact revisions. Once those shapes are explicitly approved, promote only the
   two reviewed entries and record the actual reviewer, date, scope and revision.
   Expire the corresponding candidate cards after promotion.

Proceed authorises implementation and preparation of the reviewable candidates.
The new teaching shapes require fresh approval before student activation under
[AGENTS.md](../AGENTS.md). Earlier Ra-3/Zai-4 approvals do not approve the new cut.

## Expected files

| File | Planned purpose |
| --- | --- |
| New `src/content/raZaiShortHeads.json` | Isolated candidate routes, contours and progress segments |
| [reviewCandidates.js](../src/content/reviewCandidates.js) | Version-scoped candidate construction |
| [VideoModelReview.jsx](../src/components/VideoModelReview.jsx) | Ra/Zai before/after review scope using the existing preview |
| [validateContent.js](../src/content/validateContent.js) | Reuse content and readiness validation; extend only if the authored contour metadata requires it |
| [letters.json](../src/content/letters.json) | Promote the exact two revised models only after shape approval |
| New focused geometry/browser tests | Shortened start, unchanged lower body, completion and separate Zai dot |
| Review/approval documents | Record candidate geometry, captures, checks and eventual approval |

Reuse [outlineAppearance.js](../src/tracing/outlineAppearance.js), the current
guide generator and browser helpers. A shared matcher or tolerance change is not
expected. Update current content/guide status documentation when its state changes;
preserve historical evidence and unrelated local work.

## Verification and acceptance

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) for revised geometry:

- Compare both candidates with their snapshots: lower curves/tails, Zai's dot,
  sequences, audio and all other letters remain unchanged. Only the requested
  head and its dependent route/appearance/guide data change.
- Validate candidate gating and revision checks. Stale approval must not make a
  changed candidate student-ready. Preserve historical progress records with
  their original geometry revisions; do not relabel old attempts as new shapes.
- Run the unit suite and one checked production build after implementation.
  Add meaningful cases for starting at the new cap, full continuous completion,
  rejection of tail-only/endpoint shortcuts and the required separate Zai tap.
- Exercise Jejak Ceria, guided and precision tracing for both candidates; check
  Solo/Duo after activation. Cover restart/recovery, demonstrations, numbering,
  navigation and revision-tagged saving using existing browser helpers.
- Inspect phone, tablet and desktop captures: the head is visibly shorter,
  the cut cap joins smoothly, no old upper ink appears during reveal or
  completion, the lower curve retains its shape, and labels do not hide the
  new tip or Zai's dot. Recompute screen coordinates after any viewport change.
- Record actual commands, results, relevant input/build fingerprints and runtime
  limits in the review. Browser emulation does not establish physical smartboard
  or Android behaviour. No APK rebuild or deployment is included in this request.

## Original document-only stage

The initial request created only this Markdown file, without changing the app.
The subsequent “proceed” authorised the implementation described above. The
completed review stage is recorded separately; “yes approved” then authorised
student activation of those exact candidate revisions.
