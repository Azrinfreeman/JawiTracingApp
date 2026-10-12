# Jim, Ca, Ha (ح) and Kha straight top review

Subsequently owner-approved and promoted on **11 October 2026**. See
[approval verification](JIM_CA_HA_KHA_STRAIGHT_TOP_APPROVAL.md). The record below
preserves the preceding preview stage and its evidence.

Implemented **11 October 2026**, Asia/Kuala_Lumpur, after the owner replied
“proceed” to the [implementation document](JIM_CA_HA_KHA_STRAIGHT_TOP_IMPLEMENTATION.md).
**Geometry approval is pending.** No new owner/teacher assessment is recorded.

## Delivered candidates

| Letter | Approved student revision retained | Adult candidate |
| --- | ---: | ---: |
| Jim (ج) | 4 | 5 |
| Ca (چ) | 3 | 4 |
| Ha (ح), `ha-pedat` | 3 | 4 |
| Kha (خ) | 3 | 4 |

All four top strokes are horizontal and run left to right: **1 Mula → 2 Ikut →
3 Henti**. The real path drives both matching and appearance. After lifting,
number 4 starts the original bowl; all existing dots follow. The lower paths,
directions, stroke properties, dot targets, sequences and recordings are exact.
Ha (ه), ID `ha`, is outside this correction.

Open **Ruang guru → Huruf → Semakan video → Kepala lurus Jim, Ca, Ha (ح), Kha**.
The four paged comparisons show original/candidate revisions. Select **Semak …
cadangan** to trace the proposed model. Both full and current-part demonstrations
use the straight top. Revision-scoped Jejak Ceria cues say “Tarik garis lurus ke
kanan hingga 3.” and explain restarting at 4 for the bowl. Other practice modes
retain their existing numbered instructions. No matcher, tolerance, renderer,
storage-schema or default-mode changes were needed.

Candidate geometry is `pendingReview` with `review: null`; it does not join
ordinary student lessons or scored pools. Preview attempts save their proposed
revision and preview status and cannot award student completion. The original
36 approved lessons remain ready. Candidate factories expire on base-revision
mismatch. All historical approval records remain intact.

## Evidence

Review sheet assembled from actual phone preview captures:

![Four straight top preview models](../output/verification/jim-family-straight-tops/review.png)

Individual phone/tablet/desktop start, mid-top, top-complete, finished,
demonstration and comparison captures are under
`output/verification/jim-family-straight-tops/browser/`. The sheet is also
available as [a local HTML review](../output/verification/jim-family-straight-tops/review.html).

Verified results:

| Check | Scope and result |
| --- | --- |
| `npm test -- --pool=threads --maxWorkers=2 --reporter=dot` | **267 passed / 42 files** on final source, including seven new geometry/review cases. |
| `npm run build` | Passed; content validator reports **36 letters / 36 student-ready lessons**. Final bundle: `index-BcrOdj-j.js`, stylesheet `index-DbweFF8G.css`. |
| New Playwright file, Chromium + WebKit | **48 distinct passes, four expected WebKit CDP-touch skips**. Every candidate completes in play/guided/precision; full/section demonstrations pass with normal/reduced motion, plus wrong-end/reversal/recovery/restart, preview persistence and comparison paging. |
| Final comparison/detail follow-up | Both browsers passed the updated review-note checks after adding “titik jika ada” so Ha (ح) is not instructed to add a dot. These two cases repeat existing cases and are not counted twice above. |
| Preservation | Catalogue plus **80 files in `public/audio/` and `src/audio/`** match all 81 baseline SHA-256 fingerprints exactly. |
| Visual inspection | Actual phone 320 × 600, tablet 768 × 1024 and desktop 1280 × 800 captures reviewed: horizontal top, increasing 1/2/3, accepted ink, bowl connection, number 4, dots, demonstrations and finished models. Automated bounds checks find no clipped paths/guides or page overflow. |

Browser command template:
`npx playwright test tests/browser/jim-family-straight-tops.spec.js --project=chromium --project=webkit --workers=2`.
The completed selection was split to reuse the first four successful Chromium
play cases and the first successful WebKit Jim play case. Chromium's remaining
22 cases used `--grep-invert 'play:.*straight'`; WebKit's remaining 25 used
`--grep-invert 'jim.play:'` (21 passes, four skips). The final note follow-up used
both projects with `--grep 'adult.review'`. Raw logs are in the evidence directory.

Runtime inputs: Windows, Node 24, the repository's locked Vite/Vitest/Playwright
dependencies, `JAWI_STATIC_TEST=1` with the existing local production-bundle
fixture, and installed browsers at
`C:/Users/azrin/AppData/Local/ms-playwright`. No duplicate server was started.
The 48 behavioural passes used bundle `index-DrzLDX2c.js`; the final bundle
differs only in the review-note sentence above. Final unit/build and the affected
two comparison/detail cases were rerun after that wording change. Routes,
rendering, instructions and matchers retain their preceding browser evidence.

The first default Vitest attempt failed while resolving sandbox temporary SSR
files; a workspace-local `TEMP`/`TMP` and thread workers resolved this. The first
browser attempt looked in a sandbox-specific browser directory; setting
`PLAYWRIGHT_BROWSERS_PATH` to the existing installation resolved it. Two initial
browser assertions expected the Jejak Ceria-only writing pill in strict modes;
they now assert that pill only in play, retaining guide/direction/completion
checks in all modes. No unresolved failures remain.

Final source/test/build/runtime fingerprints and preservation totals:
[verification.json](../output/verification/jim-family-straight-tops/verification.json).
Repeat affected checks only when their relevant inputs change or a new concern
requires investigation. Chromium CDP touch passes cover four candidates; they
do not prove WebKit touch or physical device behaviour.

## Files and approval handoff

Corrections are in `src/content/jimFamilyStraightTops.json`; the isolated
factory, review scope and cues are in `reviewCandidates.js`, `VideoModelReview.jsx`
and `teachingCues.js`. Focused geometry/browser tests and an immutable snapshot
of the four original approved entries cover this change. Three historical
geometry tests now exclude the later straight-top scope from their original
approval-stage inventories; their model and approval assertions are preserved.

Next action: the owner reviews **Jim 5, Ca 4, Ha (ح) 4 and Kha 4**. After explicit
approval, promote the exact reviewed candidates, record the actual reviewer/date/
scope/revisions in `CONTENT_APPROVALS.md`, and verify affected student access,
Solo/Duo completion and saved-revision handling. Implementation permission alone
does not authorise that geometry promotion under [AGENTS.md](../AGENTS.md):
“A geometry change needs a new content revision and fresh review”.

No APK, deployment or publication was requested. Physical tablet/smartboard
runtime remains untested; browser emulation is recorded separately.
