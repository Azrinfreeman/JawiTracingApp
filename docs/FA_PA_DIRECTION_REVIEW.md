# Fa and Pa: Qaf starting direction

6 October 2026, Asia/Kuala_Lumpur. This report preserves the implementation/review stage after the owner confirmed **“Yes—match Qaf’s starting direction and sequence.”** At that stage **Fa revision 4 and Pa revision 4** awaited review. The owner subsequently wrote **“approve”** to the explicit approval request; the exact models are now promoted. See [approval verification](FA_PA_DIRECTION_APPROVAL.md). No teacher assessment is claimed.

The current Fa/Pa models already trace the head before the tail and dots. Their first curve, however, begins upward before turning left; Qaf immediately departs left/down across the bottom of its head. The correction removes that upward detour. Start at the right join, go left across the bottom of the head, rise around the loop and return to the join. Lift, start the tail at the same join, descend and follow it left, then tap the dots separately.

Only the first cubic's two control points change. The loop's start/end and every subsequent curve, tail, widths, checkpoints, hit areas, pen-lift policy, sequence, and audio are preserved. Fa still has one dot; Pa still has three. Qaf and the complete approved student catalogue remain byte-identical to the pre-task snapshot. The seven earlier video proposals and four-letter approvals retain their independent scope.

## Review route at the preceding stage

Refresh [the local game](http://127.0.0.1:5173/). Open **Ruang guru → Huruf → Semakan video → Arah Fa dan Pa**. The two paged comparisons show original revision 3 and proposed revision 4. Use **Semak Fa cadangan** / **Semak Pa cadangan**, then **Menu → Tunjuk cara** to see the complete movement, pen lift and dots. **Langkah cadangan** explains the sequence. Jejak Ceria displays explicit left-first and tail instructions; the stricter modes retain their usual numbered guides and trace the same corrected routes.

Candidates are isolated adult previews, saved as `preview: true` with `geometryStatus: pendingReview`. They cannot count as an approved student completion. The existing approved revisions remain in student lessons until the owner approves these exact new revisions. A later revision change removes the obsolete proposal.

## Changed files

- [Direction models](../src/content/faPaDirections.json), [candidate factory](../src/content/reviewCandidates.js), [review selector](../src/components/VideoModelReview.jsx) and [revision-specific cues](../src/tracing/teachingCues.js).
- [Unit checks](../tests/geometry/faPaDirections.test.js), [browser checks](../tests/browser/fa-pa-directions.spec.js) and [preservation/fingerprint checker](../scripts/verify-fa-pa-directions.mjs).
- Current state, content-review, numbered-guide and handoff documentation. Historical verification reports and approvals are preserved.

## Verification

Build identity: `fa-pa-direction-review-20261006`; Node 24.19.0. Browsers use the checked production bundle through the existing local static fixture (`JAWI_STATIC_TEST=1`), with at most two workers. The running local development server's source was confirmed separately at `http://127.0.0.1:5173/`.

- `npm test -- --reporter=dot`: **186 tests pass in 21 files**. Covers candidate isolation, exact first-curve scope, closed head, preserved tail/dots/audio, revision gates, cues and demonstration schedule, plus the existing unit suite.
- `VITE_BUILD_ID=fa-pa-direction-review-20261006 npm run build`: passes, including catalogue validation; **37 approved student-ready models**. Production bundle: `index-BkEV3Aau.js`; CSS: `index-DSx9W6Tg.css`.
- `node scripts/verify-fa-pa-directions.mjs`: passes. All 37 catalogue entries/audio objects are unchanged; all 37 recording hashes match the preceding approval stage. Qaf and the seven earlier proposals are preserved. [Inputs](../output/verification/fa-pa-order/inputs.json) record the source, tests, assets, runtime and production bundle hashes.

- Browser checks: **36 distinct passes, 18 Chromium and 18 WebKit; no unresolved failures or skips**. [Final case summary](../output/verification/fa-pa-order/browser-summary.json) selects the latest result for each case from the preserved runs:
  - 24 Fa/Pa cases: 320×600 phone and 768×1024 tablet tracing/review, all three modes, left/down departure, head closure, lift/restart numbering, full tail, required dots, rejected tail-first/reversed-head shortcuts, pending-revision saved attempts, complete demos and preserved earned progress. Review checks preserve the seven earlier proposals and absence of obsolete four-letter proposals.
  - 12 existing regressions: Qaf in all three modes and its demonstration, plus four approved teacher entries/no obsolete proposals at phone/tablet sizes, in both browsers.
  - The first run's eight strict-mode checks incorrectly expected Jejak Ceria's visible cue; one demonstration check missed a short cue transition. Strict checks now use their normal numbered guides; demonstration checks record the actual sequence of cue changes. The 12 corrected strict/demo checks pass. Eight Jejak Ceria cases were rechecked after adding the explicit `4 Mula` assertion. Application and bundle inputs did not change during these test corrections. Four unchanged comparison cases retain their initial passing evidence; historical failed-run evidence is preserved.
- Inspected images: original Qaf/Fa departure and progress; corrected Fa tablet start, Pa phone tail and review, Pa WebKit tablet head, and the final phone/dot/demo captures. Labels and number circles remain within the board; cue/control overlap and horizontal overflow checks pass. [Fa start](../output/verification/fa-pa-order/browser/chromium-fa-start-768.png), [Pa head](../output/verification/fa-pa-order/browser/webkit-pa-head-768.png), [Pa phone tail](../output/verification/fa-pa-order/browser/chromium-pa-tail-320.png).
- `git -c core.safecrlf=false -c core.whitespace=trailing-space,space-before-tab,cr-at-eol diff --check`: passes.

Evidence is kept under [the dated task folder](../output/verification/fa-pa-order/). Recheck these scopes if their geometry, cues, review UI, matcher/guide dependencies, assets, tests or environment change. Documentation-only changes do not invalidate the application checks.

Physical-device touch/pen behaviour and audible playback have not been checked in this task. No recording change, APK build, deployment or version-control publication was requested or made.

## Subsequent approval

The owner wrote **“approve”** in response to the request for **Fa 4 and Pa 4** for student lessons. The exact reviewed models are promoted with matching approval records; the obsolete adult proposals disappear. See [the approval record](CONTENT_APPROVALS.md#approval-of-fa-and-pa-directions-2026-10-06) and [current student verification](FA_PA_DIRECTION_APPROVAL.md). The earlier review-stage evidence above remains historical; its byte-identical catalogue claim describes that stage.
