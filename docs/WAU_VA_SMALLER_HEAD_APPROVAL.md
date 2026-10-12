# Wau and Va smaller heads: activation verification

Date: **12 October 2026**, Asia/Kuala_Lumpur.

The project owner replied **“proceed”** directly to **“Approve Wau 4 / Va 5 for
student lessons?”**, after the same-scale comparison and candidate verification.
Reviewer: **Project owner (Codex user; name not supplied)**. No teacher
assessment is claimed. See the [approval record](CONTENT_APPROVALS.md#approval-of-wau-and-va-smaller-heads-2026-10-12).

The exact pictured **Wau 4 / Va 5** are now active in student lessons, cards,
help illustrations and scored Solo/Duo. Both head loops are approximately 17%
smaller. Promotion changes only geometry approval status and matching review
metadata relative to the reviewed candidates. Tails, junctions, endpoints,
widths, checkpoints, input policies, original framing and audio are exact.
The retained numbered guides trace the continuous left-first body through 1–3;
Va still requires its separate dot at 4. Proposal cards expire automatically.
Older and preview work retains its recorded revision/status without gaining
credit for the newly approved revision. Jejak Ceria remains the default.

The preceding [candidate review](WAU_VA_SMALLER_HEAD_REVIEW.md) and
[implementation proposal](WAU_VA_SMALLER_HEAD_IMPLEMENTATION.md) remain
historical. Their evidence describes the pre-approval build.

## Completed checks

Evidence root: [activation evidence](../output/verification/wau-va-smaller-head-approval/).

| Check | Scope and result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/wau-va-smaller-head-approval/unit-results.json` | **318 passed, 48 files**. Includes exact promotion, readiness, revision-bound model glyphs, guide geometry, historical direction contracts, unchanged tails/dots and preview separation. |
| `npm run build` | Passed; includes content validation: **36 ready lessons**. Production JS `index-DcSBzvAh.js`, CSS `index-DbweFF8G.css`. Existing large-bundle warning remains. |
| `JAWI_OUTLINE_HARNESS_DIR=output/verification/wau-va-smaller-head-approval node scripts/build-outline-test-harness.mjs` | Fresh current-component harness for scored Solo/Duo; uses active approved catalogue. |
| `JAWI_STATIC_TEST=1 PLAYWRIGHT_JSON_OUTPUT_NAME=output/verification/wau-va-smaller-head-approval/browser-results.json npx playwright test tests/browser/wau-va-smaller-head-approval.spec.js --project=chromium --project=webkit --workers=2 --reporter=json --output=output/verification/wau-va-smaller-head-approval/test-results` | **30 passed, two skipped**. Both letters: play 320×740, guided 768×1024, precision 1280×800, actual student access/completion, body reversal rejection, early lift/resume, Va dot-last, saved current revision/status and reload credit. Historical/preview records retained. Exact card paths and expired proposals checked. Current Solo/Duo lanes score independently. |
| Same browser command with `--grep 'student cards and help'`, report `browser-help-results.json`, output `help-test-results` | **Two passed**, superseding the original two card cases after extending them to open both real help dialogs and check their exact paths/dot. **30 distinct passing browser cases in total**, not 32. |
| `node scripts/verify-wau-va-smaller-head-approval.mjs` | Reviewed candidate geometry exact; **34 unrelated entries, 78 audio files and all other application source files exact** against the preceding reviewed build. All 36 lessons ready; no remaining proposal candidates. Current source/test/asset/dependency/build SHA-256 inputs recorded in [integrity.json](../output/verification/wau-va-smaller-head-approval/integrity.json). |
| Existing development server check | `http://127.0.0.1:5173/src/content/letters.json?import` returned HTTP 200 and the new approval reference. Existing server reused. |

Browser checks use the freshly built static app. The scored harness mounts the
real current challenge components with deterministic letter selection; it does
not constitute an end-to-end check of random challenge selection. The two skips
are WebKit cases requiring Chromium CDP native touch. Chromium native emulated
touch completed both approved models. No physical tablet test or new APK was
performed.

## Visual inspection

Inspected the phone Wau completion, tablet Va guide start, Va Duo lanes,
student cards and Va help dialog. Smaller heads match the approved candidates;
retained tails and Va dot remain visible. Checked guide bounds and badge
separation, with no document overflow in captured tracing states. Coordinates
were recomputed after captures before subsequent tracing.

- [Phone Wau completion](../output/verification/wau-va-smaller-head-approval/browser/chromium-wau-play-complete.png)
- [Tablet Va guides](../output/verification/wau-va-smaller-head-approval/browser/webkit-va-guided-start.png)
- [Va Duo](../output/verification/wau-va-smaller-head-approval/browser/chromium-va-duo-lane-0.png)
- [Student cards](../output/verification/wau-va-smaller-head-approval/browser/chromium-student-cards.png)
- [Va help](../output/verification/wau-va-smaller-head-approval/browser/chromium-va-help.png)

Application source and build stayed unchanged after the successful unit/build
checks. The subsequent browser test extension affected only its card/help
case, which was rerun in both engines. Repeat relevant checks when affected
inputs change or a new concern arises; this report is evidence for this stage.
