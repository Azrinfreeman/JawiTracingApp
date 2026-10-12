# Ta (ط) and Za (ظ): straight downward pillar

Date: **12 October 2026**, Asia/Kuala_Lumpur.

Status: **Proposal only. No game changes applied.** The user requested an
implementation document first and explicitly asked not to execute it yet.

## Requested result

Use the second supplied picture as the reference for the upright part of both
letters: one straight pillar drawn continuously from its top down to the base.
Remove the current bend and hooked lower section. The visible guide, accepted
tracing path, demonstration and completed drawing must use the same straight line.

The affected letters are **Ta (ط)**, catalogue ID `tho`, and **Za (ظ)**, ID `za`.
This request concerns their pillar. Preserve the existing loop and left tail,
and preserve Za's separate upper dot. Interpret the photograph's slight camera
tilt as perspective; propose a vertical pillar in the game's model coordinates.
Keep the existing loop-first writing sequence; top-to-bottom describes the
direction of the pillar, rather than a request to reorder the whole letter.

Reference supplied in this chat:
`codex-clipboard-6633cce4-1320-4acf-9a72-7dff17cacbf3.png` (second image).
When implementation starts, preserve a copy under `docs/references/` so the
review does not depend on a temporary clipboard file. The first image identifies
the two catalogue cards; it is not a tracing-path specification.

## Confirmed source and cause

Checked against [letters.json](../src/content/letters.json):

| Letter | Current approved revision | Pillar | Proposed revision |
| --- | ---: | --- | ---: |
| Ta (ط), `tho` | 6 | `stroke-2` | 7 |
| Za (ظ), `za` | 6 | `stroke-2` | 7 |

Both use the same two body paths and have no separate outline appearance.
Their current pillar is:

```svg
M 387.6 194.4 C 339 267.1 403.7 442.3 401.4 523.3 C 400.8 545.2 365.9 579.5 357.9 603.6
```

Those cubic curves introduce the sideways bend and lower hook. Changing only
labels or drawing a straight overlay would leave the accepted route curved.
Both `geometry.strokes[1].path` and `geometry.displayPaths[1]` must change.

Current order is `stroke-1` (loop/tail), then `stroke-2` (pillar), then Za's
`dot-1`. Ta has no dot. Za's dot is at `(552, 297)` with its own tap policy.
The previous [taZaStems.json](../src/content/taZaStems.json) describes the already
approved revision-6 correction; retain that historical proposal and its tests.

## Implementation after authorisation

### 1. Author two revision-bound candidates

Add `src/content/taZaStraightPillars.json`, with base revision 6 and proposed
revision 7 for both IDs. Use the existing candidate pattern in
[reviewCandidates.js](../src/content/reviewCandidates.js): clone the current
entry, increment its content revision, set geometry to `pendingReview`, clear
its geometry review, and replace only the pillar and matching display path.

Proposed shared path in the existing 1000 × 1000 viewBox:

```svg
M 387.6 194.4 L 387.6 609.29486
```

This retains the current top anchor. The lower endpoint is the intersection
of that vertical line with the existing lower loop/tail curve, calculated at
approximately `(387.6, 609.29486)`. It joins the retained body without a dangling
hook or a gap. Confirm the visible junction in the review captures before
presenting the candidates for approval.

The path is approximately 414.895 units long and contains one straight movement,
without extra intermediate strokes or a pen lift inside the pillar. Preserve
stroke IDs, width 44, display width 58, checkpoints, continuous pen-lift policy,
`stroke-1`, dot objects, valid sequences, viewBox and all audio metadata/assets.
Both letters must share exactly the same pillar geometry.

### 2. Keep guides, tracing and demonstration aligned

Reuse the current preparation, renderer and matcher; they already consume
authored paths. No global input, tolerance, completion or performance changes
are planned for this content correction.

[numberedGuides.js](../src/tracing/numberedGuides.js) assigns three landmarks to
strokes at least 320 units long. The retained body uses 1–3, so the pillar gets:

- **4 Mula:** `(387.6, 194.4)` at the top.
- **5 Ikut:** approximately `(387.6, 401.84743)` halfway down.
- **6 Siap** for Ta, or **6 Henti** for Za, at the base.
- **7 Titik akhir** for Za's unchanged separate dot.

These are landmarks along one drag, not separate tap requirements. Add a
revision-scoped pillar instruction in
[teachingCues.js](../src/tracing/teachingCues.js), for example:
“Mula di atas. Tarik satu garis lurus ke bawah hingga pangkal.”
The full and current-part demonstrations must descend along this exact line.
Preserve the existing lift between the body and pillar and Za's dot-last action.

Do not force the catalogue's font glyph to become the tracing path. Its text
remains the letter label; the authored tracing model and its miniature preview
must reflect the new candidate geometry wherever those previews are used.

### 3. Present a separate adult review

Add a **Batang lurus Ta dan Za** scope to
[VideoModelReview.jsx](../src/components/VideoModelReview.jsx), separate from
the historical revision-6 stem proposal. Show original and candidate models,
revision numbers and an actual tracing preview for each letter. Explain the
straight downward movement and preserved loop/tail/dot.

Preview attempts must stay excluded from student completion credit and scored
Solo/Duo eligibility. Candidate scopes must expire when their base revisions
no longer match the active catalogue.

### 4. Activate only the reviewed revisions

Under [AGENTS.md](../AGENTS.md), implementation authorisation permits creating
and verifying these candidates. New geometry requires fresh review; keep the
current approved revision-6 student models active until the owner approves the
identified revision-7 shapes.

After that approval, promote the exact reviewed candidates to
`src/content/letters.json`, recording the actual reviewer, date, scope and
revision in `docs/CONTENT_APPROVALS.md`. Audio approvals remain independent.
Preserve old saved attempts, but do not treat revision-6 credit or adult preview
attempts as completion of revision 7. Preserve the other 34 catalogue entries
and every recording exactly.

## Expected implementation files

| File | Planned change |
| --- | --- |
| `src/content/taZaStraightPillars.json` (new) | Shared straight path, two base/proposed revisions. |
| `src/content/reviewCandidates.js` | Isolated revision-7 candidate factory. |
| `src/components/VideoModelReview.jsx` | Dedicated original/candidate review scope. |
| `src/tracing/teachingCues.js` | Revision-scoped downward-pillar instruction. |
| `tests/geometry/taZaStraightPillars.test.js` (new) | Straightness, direction, guides, preserved content and review isolation. |
| `tests/browser/ta-za-straight-pillars.spec.js` (new) | Real tracing, demonstration, review and layout checks. |
| `docs/references/ta-za-straight-pillar-reference.png` (new) | Stable copy of the user's second picture. |
| Current content/guide/project-state documents | Actual delivery and review status after implementation. |
| `src/content/letters.json`, `docs/CONTENT_APPROVALS.md` | Exact promotion only after approval of the reviewed shapes. |

Renderer, guide layout, storage and validator changes are conditional on a
demonstrated issue. Reuse existing modules and browser helpers. Preserve the
workspace's unrelated pending changes. This request does not include a new APK,
commit, push or deployment.

## Verification and acceptance

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md). The checks below are
planned; this document does not claim they have run.

1. Run the unit suite and checked build once after implementation. Verify valid
   candidate metadata, review gating, expiration and independent audio approval.
2. Assert the pillar has constant x and increasing y, no curves/hook, identical
   geometry in both letters, and a visible junction with the retained body.
   Compare the other 34 entries and all audio against a pre-change snapshot.
3. Exercise complete candidate tracing in Jejak Ceria and strict guided mode
   with touch, pen and mouse as supported. Test a bottom-first drag, endpoint-only
   shortcut, interruption/resumption and duplicate release against the existing
   policies. Do not weaken those policies to make the new line pass.
4. Verify Ta completes after body and pillar, while Za still requires its dot.
   Check full and pillar-only demonstration direction, numbering, restart and
   preview-credit isolation.
5. Inspect Chromium/WebKit captures at phone, tablet portrait/landscape and
   desktop sizes, including `320×740`, `768×1024`, `1024×768` and `1280×800`.
   Check the pillar's straight appearance, base junction, legible guide placement,
   accessible controls and absence of overflow. Recompute screen coordinates
   after viewport changes. Chromium native touch emulation is not WebKit proof.
6. After explicit geometry approval, verify normal lessons and scored Solo/Duo
   use the exact approved shapes, with independent lane progress, the separate
   Za dot and correct saved-revision credit. Inspect affected student captures.

Record commands, scope, input/build identity, pass/fail/skip totals and actual
limitations in a new verification document. Physical tablet smoothness and
native APK behaviour require their own device checks if requested later.

## Current delivery

Only this implementation document is created for the present request. No
candidate, geometry, application code, tests, approvals or APK is changed.
