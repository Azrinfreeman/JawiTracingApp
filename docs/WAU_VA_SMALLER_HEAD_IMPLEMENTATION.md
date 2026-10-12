# Wau and Va: smaller head loops

Date: **12 October 2026**, Asia/Kuala_Lumpur.

Subsequently implemented after the owner's “proceed”; see
[the candidate review](WAU_VA_SMALLER_HEAD_REVIEW.md). The owner then replied
“proceed” directly to the pictured Wau 4 / Va 5 student approval question;
see [activation verification](WAU_VA_SMALLER_HEAD_APPROVAL.md). The proposal
below preserves the document-first stage.

Status: **Implementation proposal only. No game changes applied.** The owner
requested this document first and explicitly said not to execute the change yet.
The preceding Ta 9 / Za 9 approval and activation remain intact.

## Requested result

Make the circular head at the top of **Wau (و)** and **Va (ۏ)** slightly smaller,
using the second supplied picture as the proportion reference. The smaller head
should sit naturally above the existing descending left tail, with a clearly
open white centre. Preserve the size and shape of the tail; do not shrink the
whole letter or redesign the entire glyph to reproduce the photo's calligraphy.

Start with a **15–20% reduction in the visible head's width and height** relative
to the current model, measured in the same model coordinates and at the same
stroke width. This is a proposed interpretation of “small a bit,” not a measured
ratio from the reference. Confirm the result with original/proposed pictures
at matching scale before approval. Use the same proportional correction for both
letters while retaining their existing individual vertical positioning.

References supplied in this chat:

- Identification/current cards:
  `codex-clipboard-6f5c751c-cb01-49cd-86d1-19a405ee5202.png`.
- Desired smaller-head proportion:
  `codex-clipboard-b7c36bde-2fc0-4593-b0ea-3e1c7092d2a5.png`.

Both are currently in `C:/Users/azrin/AppData/Local/Temp/`. When implementation
is authorised, preserve copies under `docs/references/`. The second image's
arrows and numbers describe handwriting; this request changes head size, so
retain the approved tracing order rather than importing new stroke breaks.

## Confirmed current content

Checked against [letters.json](../src/content/letters.json) and
[wauVaDirections.json](../src/content/wauVaDirections.json):

| Letter | ID | Active approved geometry | Proposed geometry |
| --- | --- | ---: | ---: |
| Wau | `wau` | 3 | 4 |
| Va | `va` | 4 | 5 |

Each body is a single continuous `stroke-1`. It starts at the right junction,
moves left under the head, rises around the loop, returns to the junction, then
continues down and left through the tail. Va requires a separate dot afterwards.
The [existing approval](WAU_VA_DIRECTION_APPROVAL.md) covers this direction.

The first two cubic curves and their closing line form the head loop. The
following three cubic curves form the small junction connector and descending
tail. Junction/start anchors are **(612.1, 582.6)** for Wau and
**(612.1, 572)** for Va. Tail endpoints are **(394.3, 718.8)** and
**(394.3, 708.3)** respectively.

Both have trace width **44**, display width **50**, continuous pen policy and
checkpoints `[0.25, 0.5, 0.75, 0.95]`, without separate outline appearances.
Va's dot remains at **(528, 315)**, with visible radius **19**, hit radius **48**,
maximum travel **30** and tap policy. Wau has no dot. Independently approved
audio and all unrelated catalogue content must remain exact.

The card screenshot uses font glyphs: [LetterCard](../src/components/LetterCard.jsx)
calls [LetterModelGlyph](../src/components/LetterModelGlyph.jsx) without `model`.
Wau/Va currently fall through to font text. Changing a tracing path alone would
therefore leave those thumbnails showing the old head proportions.

## Implementation after authorisation

### 1. Author two isolated, revision-bound candidates

Add `src/content/wauVaSmallerHeads.json`, based on approved Wau 3 / Va 4, with
proposed revisions 4 / 5. Preserve exact pre-change entries as fixtures and take
catalogue/source/audio fingerprints before authoring.

Reduce the head control points about each fixed junction anchor. As a starting
construction, scale head coordinates with `pNew = anchor + scale * (pOld - anchor)`;
choose the scale by checking the rendered outer bounds. A centreline scale is
not the same as the visible-size reduction because stroke thickness stays fixed.
Keep the start and returning junction fixed. Retain the tail/connector cubic
coordinates and final endpoint exactly. Inspect the join for a kink, gap or
bulge; adjust the head-side controls locally if required rather than changing
the preserved tail.

Update both `geometry.strokes[0].path` and `geometry.displayPaths[0]` with the
same revised path. Keep width, display width, checkpoints, policies, dot objects,
valid sequence, viewBox and audio unchanged. A thinner stroke or smaller CSS
container would not meet the requested proportional correction.

Use the existing stroked-vector renderer. A modest head reduction does not
require a new filled-outline pipeline, raster asset or runtime image processing.
The white loop opening must remain visibly open at phone/tablet sizes.

Add `wauVaSmallerHeadReviewCandidates` to
[reviewCandidates.js](../src/content/reviewCandidates.js): clone only matching
approved base revisions, set the new content revision, mark geometry
`pendingReview`, clear geometry review and replace the body/display paths.
Preserve the previous direction data and its historical approval fixtures.

### 2. Keep tracing, guides and demonstration on the same route

Reuse the existing reference preparation, matcher, input and renderer. The
smaller head must still trace left first, around the loop and continuously into
the tail without a pen lift at the junction. Va's dot remains last.

Bind the existing Wau/Va instruction text to the new revisions in
[teachingCues.js](../src/tracing/teachingCues.js). Recompute the head-to-tail
section fraction from the shortened route; the old `0.6131` boundary describes
the old head length and must not be copied blindly. Full and remaining-part
demonstrations must follow the revised path without granting tracing credit.

Keep automatic numbering on the real route: expected body guides **1 Mula,
2 Ikut, 3 Siap** for Wau and **1 Mula, 2 Ikut, 3 Henti** for Va, followed by
**4 Titik akhir** for Va. Confirm the shortened total length still meets the
current three-guide threshold. The midpoint guide moves with the path length;
it is not required to sit at the old coordinates. Do not change global guide
thresholds, touch tolerance or completion rules for this content edit.

### 3. Show the actual revised model in every affected view

Add an adult comparison scope such as **Kepala kecil Wau dan Va** in
[VideoModelReview](../src/components/VideoModelReview.jsx), showing original and
candidate models plus traceable previews. Save matching-scale original/proposed
pictures so auto-fitting does not disguise whether only the head got smaller.

Extend `usesModelGlyph` with a revision-bound Wau/Va condition so the new models'
cards, help views and other shared glyph presentations display their authored
paths. Preserve existing behaviour for earlier revisions and unrelated letters.
Check result illustrations and both Solo/Duo boards against the same revised
geometry. Do not alter the global font, card size or page scaling to simulate a
smaller head.

### 4. Review first, then activate the exact approved shapes

During implementation, keep active Wau 3 / Va 4 unchanged for students and scored
challenges. New pending candidates belong only in adult review; preview attempts
must not count as student completion.

After explicit approval of the pictured Wau 4 / Va 5 candidates, promote those
exact shapes and record the actual reviewer/date/revisions. Geometry approval
changes independently of audio approval. Preserve all historical attempts;
neither old revisions nor preview attempts automatically grant completion of the
new shapes. Candidate cards expire after promotion.

[AGENTS.md](../AGENTS.md) requires: “A geometry change needs a new content revision
and fresh review.” Authorisation to implement this document does not invent an
assessment of shapes that have not yet been drawn and reviewed.

## Verification and acceptance after implementation

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md), using existing tests and
[browser helpers](../tests/browser/helpers/). Do not run application checks for
this document-only stage.

- Geometry/content checks: new revision gating and stale-approval rejection;
  measurable moderate head reduction; open loop; preserved junction, exact
  tail/endpoint, dots, policies and audio; common proportional correction for
  both letters; preserved current Ta 9 / Za 9 and all other entries.
- Unit checks: continuous left-first completion in play/guided/precision for
  mouse/touch/pen; reversal and shortcut rejection; early lift/resume; Va's
  dot-last rule; guide anchors and recomputed demonstration boundary; preview
  and saved-revision credit separation.
- Checked build once, including content validation. After candidate authoring,
  all 36 existing approved lessons must remain ready.
- Chromium/WebKit browser checks: both candidate previews in supported tracing
  modes, full/remaining demonstrations and progress preservation; phone 320×740,
  portrait tablet 768×1024 and landscape tablet 1024×768; no clipped guides,
  closed counters, overflow or scrolling. Recompute screen coordinates after
  viewport/scroll changes. Use Chromium native emulated touch/pen where supported
  and record WebKit-specific skips accurately.
- Inspect real captures of the original/proposed heads at matching scale,
  thumbnails, partial tracing, completed shapes and Va's separate dot. Confirm
  the tail keeps its original dimensions rather than enlarging through auto-fit.
- After shape approval, verify exact promotion, student thumbnails and lessons,
  saved revision/status, expired review cards and scored independent Solo/Duo
  lanes using the existing current-component harness. Compare other 34 entries
  and all audio hashes against the pre-change baseline.

Record actual commands, results, relevant input fingerprints and inspected
captures in a new review report; preserve earlier approval/review evidence.
No physical tablet performance result, new APK, publication, commit or push is
part of this document-only request.

## Planned files

New candidate data and review scope; revision-bound glyph selection and teaching
cues; targeted geometry/browser tests and pre-change fixtures; reference copies
and review evidence. Existing matcher/input modules need no planned change.
Update current content/numbering/project documentation only when implementation
changes the relevant state. Add a separate exact promotion record only after
approval. No implementation files have been created or edited at this stage.
