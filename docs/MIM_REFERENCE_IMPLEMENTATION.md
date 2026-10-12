# Mim: reference-shaped head and tapered tail

Date: **12 October 2026**, Asia/Kuala_Lumpur.

Subsequently implemented after the owner's “go” as an adult-only Mim 6
candidate; see [candidate review](MIM_REFERENCE_REVIEW.md). The owner then
replied “approved” to the pictured Mim 6 student approval question; see
[activation verification](MIM_REFERENCE_APPROVAL.md). The document below
preserves the original proposal stage.

Status: **Implementation proposal only. No game changes applied.** The owner
requested an implementation document first. Implementation awaits authorisation;
the newly drawn shape will then require review before student activation.

## Requested appearance

Use the owner's **second image** as the shape reference for **Mim (م)**.
The first image identifies the current tracing model and its numbered guides.

The reference has an open hooked head: an upper arch bends into a short, thick
right side, then returns left along a comparatively flat lower edge. The left
mouth remains visibly open. The returning stroke connects smoothly into a
slimmer descending tail that ends in a point. Preserve these proportions and
the contrast between the heavy head and thin tail.

Replace the current broad, rounded arch, swollen right corner and thick,
round-ended tail with that reference silhouette. Do not simply shrink the
entire letter or round another control point. The reference is only 95 × 142
pixels, so use a clean vector adaptation of its visible features rather than
tracing compression edges or reproducing its grey background.

Reference files supplied in this chat, currently under
`C:/Users/azrin/AppData/Local/Temp/`:

- Current model: `codex-clipboard-406cb3fe-da64-4c49-bb33-3d9ef71fea88.png`.
- Desired shape: `codex-clipboard-e606d552-56e3-45f0-91dd-b90deec50a12.png`.

When implementation is authorised, preserve both under `docs/references/`,
record their hashes, and present reference/current/proposed views together.
The image establishes appearance; it does not explicitly specify stroke order.
The proposed order below retains the existing continuous head-to-tail movement.

## Confirmed current model

Checked against [letters.json](../src/content/letters.json),
[mimTailGap.json](../src/content/mimTailGap.json) and the
[6 October approval](CONTENT_APPROVALS.md#approval-of-all-current-semakan-video-proposals-2026-10-06):

| Property | Current state | Proposed state |
| --- | --- | --- |
| ID and geometry revision | `mim`, approved revision **5** | Candidate revision **6**, pending review |
| Body | One continuous `stroke-1` | One continuous `stroke-1` following the new shape |
| Left mouth | Tiny opening beside the head/tail return | Open mouth adapted to the reference |
| Rendering | Uniform rounded stroke; no separate outline appearance | Authored vector outline with a tapered tail |
| Dots and sequence | No dots; `[["stroke-1"]]` | Unchanged |
| Audio | Approved Mim name recording, version **2** | Exact preservation |

The current route starts at `(449.2238, 542.170763)`, rises around the head,
returns left and descends to `(436.4, 843)`. Trace width is **44**, display width
**50**, with checkpoints `[0.25, 0.5, 0.75, 0.95]`. The visible uniform-width
stroke explains the thick tail and rounded ending. A centreline edit alone
cannot reproduce the reference's varying thickness and pointed terminal.

Mim's normal card/help glyph currently falls back to font text through
[LetterModelGlyph](../src/components/LetterModelGlyph.jsx). A tracing-only
change would leave those illustrations inconsistent with the new model.

## Implementation after authorisation

### 1. Create a separate Mim 6 candidate

Snapshot approved Mim 5 and catalogue/source/audio hashes before authoring.
Add `src/content/mimReferenceShape.json` with `baseRevision: 5`, `revision: 6`,
the new tracing route, outline, bounds and reference provenance. Preserve the
historical Mim 4/5 proposals, fixtures and approval records.

Add a revision-gated factory in
[reviewCandidates.js](../src/content/reviewCandidates.js): clone only approved
Mim 5, assign revision 6, mark geometry `pendingReview`, clear its geometry
review, and replace the route/display geometry. Preserve all audio and unrelated
entry fields. Leave the active student catalogue at approved Mim 5 during review.

### 2. Author the silhouette and its matching route

Use the existing `referenceOutline` format and
[outline renderer](../src/tracing/outlineAppearance.js), already used by other
reference-shaped letters. Adapt the authoring approach in
[author-sin-syin-reference.mjs](../scripts/author-sin-syin-reference.mjs), with
Mim-specific data rather than changing shared rendering behaviour.

- Draw a compact open arch, defined right shoulder and flatter returning head
  edge. Keep the white left mouth open in thumbnails and on the tracing board.
- Connect the return directly into the tail. Use a smooth bend near the join,
  then a slender descending stroke and tapered terminal matching the reference.
  Do not detach the tail, close the mouth into a circular eye or add a pen lift.
- Author the accepted centreline from the upper-left open tip, around the arch,
  down the right side, left through the returning stroke, then down the tail.
  Keep it inside the visible ink and away from ambiguous shortcuts near the mouth.
- End the route at the reachable terminal. If the outline tapers beyond the
  last comfortable centreline position, explicitly check endpoint distance and
  completion at the visible tip; reaching the drawn end must finish the letter.
- Set both `geometry.strokes[0].path` and `geometry.displayPaths[0]` to the new
  route. Retain stroke ID, continuous policy, checkpoints and input widths
  initially; visible thickness is controlled by the outline. Verify the accepted
  band against the thin tail instead of globally tightening touch tolerances.

Generate static reveal partitions along the new route, including valid source
metadata, bounds and contiguous arc ranges required by
[validateContent.js](../src/content/validateContent.js). Reuse existing offline
authoring helpers. Ship vector data only: no runtime image processing, extra
canvas loop or new pointer handler. Check partial ink for premature tail reveal
where the head returns close to the start.

### 3. Align guides, demonstration and illustrations

Recompute landmarks from the new route. Expect **1 Mula → 2 Ikut → 3 Siap**
along one drag, subject to the existing route-length rule. They are landmarks,
not separate taps. Use existing detached guide placement for outline models;
leaders must point to real route anchors without covering the mouth or terminal.
Do not change global numbering thresholds merely to force three markers.

Add revision-bound Mim 6 teaching sections in
[teachingCues.js](../src/tracing/teachingCues.js), with a measured head/tail arc
boundary. Suggested wording: “Ikut lengkung kepala, kemudian teruskan ekor ke
bawah.” Full and current-section demonstrations must follow this route and
preserve the existing distinction between demonstration and student credit.

Add an adult comparison scope such as **Bentuk rujukan Mim** in
[VideoModelReview.jsx](../src/components/VideoModelReview.jsx). Show approved
Mim 5 beside proposed Mim 6 using matching model scale, plus a traceable preview.
Avoid separate auto-fitting that hides proportion differences.

Extend `usesModelGlyph` for **Mim 6 only** so candidate cards/help use the
authored shape, and student cards/help will match after approval. Check lesson,
result and Solo/Duo illustrations through their existing shared components.
Use the new outline bounds for fit; leave unrelated letter framing unchanged.

### 4. Verify the candidate, then request shape approval

Select checks using [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md):

| Check | Required coverage |
| --- | --- |
| Unit/content and checked build | New revision and pending status, valid outline/route, no dots, one continuous sequence, exact audio and unrelated entries. Preserve historical Mim 5 tests as historical contracts. |
| Shape and reveal | Open left mouth, connected head/tail, pointed terminal, centreline inside ink, contiguous reveal pieces, partial head and partial tail without disconnected or early ink. |
| Actual tracing | Play/guided/precision; full head then tail, reversal and mouth-to-tail shortcut rejection, early lift/resume, coarse touch/pen movement, and completion when touching the visible endpoint. |
| Guides and layout | Phone/tablet/desktop plus both Duo lanes: readable numbers, reachable start/end, no overlap, clipping or page scrolling. Recompute coordinates after captures/resizing. |
| Demonstration and illustrations | Full/section demonstration, retained progress, exact model glyph in affected views and comparison at the same scale. |
| Review and storage separation | Mim 5 remains student-ready; Mim 6 preview saves its revision/pending status without student credit. Test current Solo/Duo components in preview mode without treating the candidate as approved scoring content. |
| Preservation | Other 35 entries, all existing recordings/audio approvals, current Wau 4/Va 5 and Ta 9/Za 9, default mode and unrelated source remain exact. |

Reuse the running server after checking its served inputs. Record actual
commands, results, browser/viewports, source/build fingerprints and inspected
captures in a separate candidate review. Do not treat older reports as proof
for the changed shape. A physical low-spec tablet remains a separate check.

Present the reference/current/proposed images and verification for owner review.
After explicit approval of the pictured Mim 6, promote only that exact geometry
with matching reviewer/date/revision metadata. Verify normal student access,
saved revision credit, real completion and scored Solo/Duo on the active build;
older attempts remain historical and the approved candidate card expires.

## Completion criteria and current boundary

The proposed Mim should visibly follow the reference's open hooked head,
flatter return and slender pointed tail, with a single traceable movement that
finishes at its visible end. Cards, guides, demonstration and completed ink must
agree with that shape.

Only this implementation document is created at this stage. No content, game
code, audio, approval status or APK is changed, and no runtime tests are claimed.
