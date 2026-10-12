# Ra 4 and Zai 5: shorter head review

Date: **11 October 2026**, Asia/Kuala_Lumpur.
Status: **Implemented for adult preview; awaiting approval of the exact shapes.**

Subsequently approved with **“yes approved”** and activated on 11 October 2026.
See [approval and activation verification](RA_ZAI_SHORTER_HEAD_APPROVAL.md).
The review-stage body and checks below are preserved as historical evidence.

The owner authorised [the implementation plan](RA_ZAI_SHORTER_HEAD_IMPLEMENTATION.md)
with “proceed”. The proposed models cut the upper sloping head at the black band
in the supplied photo. The surviving lower outlines and all following cubic
curves are retained at their original coordinates and scale. The new route
begins inside the cut cap; its first cubic is the exact mathematical remainder
of the original, rounded to five decimals. The direction remains down through
the curve and left along the tail. Zai's existing dot stays at (547, 293) and
requires its own tap after the body. It sits farther above the shortened head;
the comparison makes this spacing visible for review.

![Same-scale before/after comparison](../output/verification/ra-zai-short-heads/comparison.png)

| Model | Active student revision | Proposed revision | Proposed start | Body length |
| --- | ---: | ---: | --- | ---: |
| Ra | 3 | 4 | (605.85676, 515.95013) | 353.70 units |
| Zai | 4 | 5 | (605.83927, 503.30625) | 353.72 units |

The cut rises to the right, matching the marked band. In model coordinates its
line is `y = 518 - 0.35 × (x - 600)` for Ra and 12.65 units higher for Zai.
This removes approximately 131 units of route from each original 485-unit body.
No black annotation stroke or extra dot is added.

## Implemented behaviour

- Filled body contours are genuinely shortened, and the tracing centreline is
  shortened with them. Progressive fill uses eight new pieces measured from the
  new start. Bounds are recomputed. Original font provenance is retained, with
  separate `appearance.authoring` metadata describing the cut.
- Existing numbering rules provide 1 Mula, 2 Ikut and 3 Siap for Ra; Zai's body
  ends at 3 Henti and its independent dot is 4. Leaders point to the new cap
  and original lower anchors. Demonstrations use the shortened outline.
- In **Ruang guru → Huruf → Semakan video → Kepala pendek Ra dan Zai**, compare
  Asal and Cadangan, then use Semak Ra/Zai cadangan to try the pending model.
  The existing next-page control switches between the two comparisons.
- Candidates are `pendingReview`, with no geometry approval. Preview completions
  remain tagged as preview/pending and do not award student credit. All 36
  approved student lessons, current Ra/Zai completions, the active catalogue
  bytes and all **78 existing public/audio files** remain unchanged.

## Verification

Evidence: [verification folder](../output/verification/ra-zai-short-heads/), including
`integrity.json`, `verification.json`, logs, baseline snapshots and browser captures.

| Check | Scope and result |
| --- | --- |
| `npm test -- --pool=threads --maxWorkers=2 --reporter=dot` | **283 passed / 45 files**; includes new curve-preservation, gating, numbering, forward recovery, shortcut rejection, touch/mouse and separate-dot cases |
| `npm run build` | Passed; **36 valid models / 36 student-ready lessons**; production JS `index-DMyvB2mW.js`, CSS `index-DbweFF8G.css` |
| Focused Playwright spec, Chromium + WebKit, two workers | **20 distinct passed / 2 skipped**; both letters in play/guided/precision, phone/tablet/desktop, partial reveal, restart/recovery, native Chromium touch, persistence without student credit, adult comparison and demonstrations |
| `node scripts/verify-ra-zai-short-heads.mjs` | Active catalogue byte-exact; 78 audio files hash-exact; both candidates valid and not ready; 36 active lessons ready |
| Vector and raster comparison | Original lower contour vertices retained; no changed occupied pixels below the cut margin, no upper ink past the cut margin, and no missing opaque body pixels in the union of reveal pieces at the recorded raster resolution |
| Visual inspection | Same-scale comparison, 320×600 Ra start, 768×1024 Zai start, partial/finished tracing and demonstration captures reviewed; no stage clipping or horizontal overflow in the tested captures |

The initial full unit run exposed three historical tests that assumed no later
review scopes existed. Their existing later-scope exclusions now also exclude
this independently gated scope; the full unit rerun passed. Four initial browser
demonstration assertions addressed a path attribute on an outline group. The
tests now inspect the actual outline part/contour; all four affected cases passed
on rerun. These retries are not counted as additional distinct cases.

Browser checks use the existing production static-route fixture with
`JAWI_STATIC_TEST=1`, installed Chromium/WebKit and
`PLAYWRIGHT_BROWSERS_PATH=C:/Users/azrin/AppData/Local/ms-playwright`. The selected
command was `npx playwright test tests/browser/ra-zai-short-heads.spec.js
--project=chromium --project=webkit --workers=2 --reporter=list`; the four corrected
demonstration cases were rerun with `--grep 'demonstration follows'`.
The two skips are Chromium-CDP-only native touch cases in WebKit. Audio lifecycle
is controlled in these tracing tests; native playback is outside this geometry
change. No physical smartboard, tablet or Android runtime is verified, and the
existing APK has not been rebuilt. Scored Solo/Duo activation checks remain for
the approval stage; pending candidates cannot enter the student-ready pool.

## Approval and activation

Review **Ra revision 4 and Zai revision 5** in the comparison above. Approval will
promote only these exact reviewed candidates, record the actual project-owner
review and expire their review cards. Existing audio approval stays independent.
Historical attempts retain their original revisions; they are not relabelled as
completions of the new geometry. Check student access, saved revision behaviour
and scored Solo/Duo after promotion. No deployment or APK release is authorised.

[AGENTS.md](../AGENTS.md) requires: “A geometry change needs a new content revision
and fresh review”. The previous approvals cover Ra 3 and Zai 4, not these new cuts.
