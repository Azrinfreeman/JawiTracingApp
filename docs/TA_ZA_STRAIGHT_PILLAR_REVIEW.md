# Ta (ط) and Za (ظ): straight-pillar candidate verification

Verified: **12 October 2026**, Asia/Kuala_Lumpur.

Historical revision-7 verification: the owner subsequently requested a rounder
upper loop, then supplied a new photo. Revision 9 was subsequently approved and
activated; its review cards expire. See [activation verification](TA_ZA_REFERENCE_APPROVAL.md)
and [the photo-reference review](TA_ZA_PHOTO_REFERENCE_REVIEW.md).
The [revision-8 review](TA_ZA_ROUNDED_LOOP_REVIEW.md) is also historical. The checks, hashes and
captures below describe the preceding revision-7 stage.

Implemented the authorised [plan](TA_ZA_STRAIGHT_PILLAR_IMPLEMENTATION.md) as
two **adult-only revision-7 candidates**. Both use one straight downward pillar:

```svg
M 387.6 194.4 L 387.6 609.29486
```

The top anchor is retained and the lower endpoint meets the existing lower
body curve. The loop, left tail, stroke policies/widths, checkpoints, writing
order, Za's separate upper dot and every audio object are preserved. The pillar
and its display path agree. No matcher, input-controller or renderer change
was needed.

## Review these exact shapes

Open [the running game](http://127.0.0.1:5173/) and select:

**Ruang guru → Huruf → Semakan video · bandingkan cadangan → Batang lurus Ta dan Za**.

Each page compares approved revision 6 with candidate revision 7. Use
**Semak … cadangan** to trace the actual proposed model. Draw the loop/tail,
lift, then draw the pillar from **4 Mula** at the top, through **5 Ikut**, to
**6 Siap** for Ta or **6 Henti** for Za. Za then requires **7 Titik akhir**.
Both full and current-part demonstrations follow the same downward path.

![Exact revision-7 candidate models](../output/verification/ta-za-straight-pillars/candidate-review.png)

The [supplied reference](references/ta-za-straight-pillar-reference.png) is now
saved independently of the temporary clipboard file. Its SHA-256 is
`8278e9125d7ad951763963dcc0d76f6eb4f793f2178f2ceefa2b3239a31080a4`.

**Approval is pending.** `letters.json` still contains the approved revision-6
models for normal lessons and scored Solo/Duo. The new candidates have
`pendingReview` geometry and no geometry approval. They are excluded from student
and scored pools; completed previews are saved as previews without student credit.
Candidate scopes expire when their base revisions no longer match.

Under [AGENTS.md](../AGENTS.md), “A geometry change needs a new content revision
and fresh review”. After explicit approval of **Ta 7 / Za 7**, promote these
exact models, record the actual reviewer/date/scope, and verify student and
scored-lane behaviour. No owner or teacher assessment is invented here.

## Changes

- Added [revision-bound corrections](../src/content/taZaStraightPillars.json)
  and the isolated factory in [reviewCandidates.js](../src/content/reviewCandidates.js).
- Added a dedicated comparison scope to
  [VideoModelReview.jsx](../src/components/VideoModelReview.jsx) and
  revision-scoped downward instructions to [teachingCues.js](../src/tracing/teachingCues.js).
- Added original-model fixtures and meaningful
  [geometry checks](../tests/geometry/taZaStraightPillars.test.js) and
  [browser checks](../tests/browser/ta-za-straight-pillars.spec.js).
- Updated three historical test scope filters to exclude this later independent
  proposal. Their historical model assertions and historical reports are retained.
- Updated current content/guide/project-state documentation. The preceding
  proposal and the revision-6 correction remain historical and unchanged.

## Completed checks

| Check | Scope and result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/ta-za-straight-pillars/unit-results.json` | **304 passed / 47 files**, including eight new tests covering both models, all three modes and mouse/touch/pen profiles. |
| `npm run build` | Passed; includes catalogue validation: **36 letters, 36 models, 36 student-ready lessons**. Existing large-bundle warning remains. |
| New browser spec, Chromium/WebKit | **24 passed / two expected CDP-only skips**. Comparison, play/guided/precision completion, separate dot, preview persistence/credit isolation, demonstrations, wrong-end starts, partial recovery and native emulated Chromium touch. |
| Retained Ta/Za and shared guide/copy regressions, Chromium/WebKit | **22 passed**. Approved revision-6 completion and saves in all modes, remaining-section demonstrations, historical scope expiration, and demonstration/copy guide separation. |
| Preservation hashes | **169 protected files unchanged**, including the complete catalogue, matcher/input/renderer modules and all **78 public/audio files**. Thus the other 34 entries and both active approved entries remain exact. |
| Visual/layout checks | Candidate stages at **320×740, 1024×768, 768×1024 and 1280×800** pass containment and page-overflow assertions. Inspected comparison, tablet pillar guides, phone completion and exact-model review captures. |
| `git -c core.safecrlf=false diff --check` | Passed. |
| Existing development server | HTTP **200** for the page and new candidate module at port 5173. Existing server reused; attempted additional startup exited because the port was already occupied. |

Browser commands used the existing production-file routing helper
(`JAWI_STATIC_TEST=1`) against the checked `dist` bundle, with two workers:

```powershell
$env:JAWI_STATIC_TEST='1'
$env:PLAYWRIGHT_JSON_OUTPUT_NAME='output/verification/ta-za-straight-pillars/browser-results.json'
npx playwright test tests/browser/ta-za-straight-pillars.spec.js --project=chromium --project=webkit --workers=2 --reporter=json --output=output/verification/ta-za-straight-pillars/test-results

$env:JAWI_EVIDENCE_DIR='output/verification/ta-za-straight-pillars/regression-browser'
$env:PLAYWRIGHT_JSON_OUTPUT_NAME='output/verification/ta-za-straight-pillars/browser-regression-results.json'
npx playwright test tests/browser/ta-za-stems.spec.js tests/browser/numbered-guides.spec.js --grep 'approved closer stem|approved stem demonstration|matching approvals|demonstrations and blank copying' --project=chromium --project=webkit --workers=2 --reporter=json --output=output/verification/ta-za-straight-pillars/regression-test-results
```

The first sandboxed unit attempt could not load many modules because of
temporary-file isolation (`ENOENT`); the report is retained. Running outside
that environment exposed three historical scope assertions that assumed no
later proposals. After excluding only the new independent factory from those
historical filters, the full suite passed. All new geometry tests passed on
the first unrestricted run. No application failure remains in the selected scope.

## Evidence and limits

Reports are under [output/verification/ta-za-straight-pillars](../output/verification/ta-za-straight-pillars):
[unit results](../output/verification/ta-za-straight-pillars/unit-results.json),
[candidate browser results](../output/verification/ta-za-straight-pillars/browser-results.json),
[regression results](../output/verification/ta-za-straight-pillars/browser-regression-results.json),
[preservation/build identity](../output/verification/ta-za-straight-pillars/preservation-and-build.json)
and [442 input fingerprints](../output/verification/ta-za-straight-pillars/final-inputs.json).
Screenshots are local visual evidence; generated screenshots are ignored by Git.

Tested JavaScript: `/assets/index-2uimFGHY.js`, SHA-256
`263d17e70b31ab846b7d8412e8ba50e4867bff4f9868eda0a3d0ea31c9a288c1`.
CSS: `/assets/index-DbweFF8G.css`, SHA-256
`0764aa3bb4839f976f3639e0ed8e8839c748d1acd73a1fea5dae1715bbcc67d0`.

Physical tablet/native APK behaviour and latency were not tested. Chromium CDP
touch emulation does not verify WebKit native touch. These are content-shape
checks, not a performance benchmark. No new APK or deployment was requested.
The active student catalogue and audio approvals are unchanged; activation
checks for the proposed revisions follow approval of the pictured shapes.
