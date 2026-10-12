# Wau and Va: smaller-head candidate review

Historical candidate stage: the owner subsequently approved the pictured
**Wau 4 / Va 5** by replying “proceed” directly to the student approval question
on 12 October 2026. See [activation verification](WAU_VA_SMALLER_HEAD_APPROVAL.md)
for current student content. The evidence below records the preceding stage.

Date: **12 October 2026**, Asia/Kuala_Lumpur.

Implemented the authorised [plan](WAU_VA_SMALLER_HEAD_IMPLEMENTATION.md) as
**adult-only Wau 4 / Va 5 candidates**. The owner requested slightly smaller
circular heads using [the second picture](references/wau-va-smaller-head-reference.png).
The [first supplied screenshot](references/wau-va-smaller-head-current-cards.png)
identifies the letters. Existing approved Wau 3 / Va 4 remain active for students
and scored Solo/Duo; implementation does not approve the proposed shapes.

![Same-scale original and proposed models](../output/verification/wau-va-smaller-heads/candidate-review.png)

## What changed

The first two head cubics and their closing line are scaled **0.78** about the
fixed right junction. With unchanged 50-unit display width, the visible head
width is approximately **16.9% smaller**, and height **16.7% smaller**, for both
letters. This is a moderate reduction chosen from the request, not a claim of
pixel-exact photo tracing. The white counters remain open in the inspected
matching-scale and game captures.

The following three cubic segments (connector and tail), final endpoints,
44-unit trace width, 50-unit display width, checkpoints, policies, dot targets,
valid sequences, viewBox, audio metadata and recordings are exact. Each body
still starts left under the head and continues around the loop into the tail
without lifting. Va's separate dot remains last.

[Candidate data](../src/content/wauVaSmallerHeads.json) and
[the authoring script](../scripts/author-wau-va-smaller-heads.mjs) record the
transform, old/new head bounds, visible-size reduction and original fitting
bounds. A revision-bound addition to `fitTraceViewport` retains the original
complete-letter framing so the smaller head does not enlarge the tail on screen.
Unit checks compare framing at phone, tablet and illustration sizes. The new
condition also handles layout fixtures without an ID or content version.

`LetterModelGlyph` selects model SVGs for these proposed revisions, so cards and
help illustrations show the actual smaller-head paths. Earlier revisions and
unrelated glyph selection stay unchanged. A separate test-only harness exercises
cards and help glyphs without forcing `model=true`; it is not bundled into the app.

Automatic numbering remains 1/2/3 along the continuous body, with Va dot 4.
The head-to-tail cue fractions are recomputed as **0.55275 / 0.55274**, replacing
the old model's 0.6131 for these new revisions only. Full and remaining-part
demonstrations follow the revised route without altering earned progress.
Visual inspection caught the now-nearby start/midpoint badges overlapping at the
neck. These revisions reuse detached badges beside the labels, with pointers
to the unchanged route anchors; the old models retain on-route badges. Browser
captures explicitly check badge overlap as well as clipping. No matcher, input,
tolerance or global guide-threshold change was needed.

## Review and approval

Open **Ruang guru → Huruf → Semakan video → Kepala kecil Wau dan Va** on the
existing server at `http://127.0.0.1:5173/`. Compare original/proposed models at
matching scale, then use **Semak … cadangan** to trace or play **Tunjuk cara**.
Preview attempts retain their pending revision/status and do not grant student
credit. Returning to student lessons still shows the approved original paths.

The new geometry is `pendingReview`, with no reviewer record. Explicit approval
of these pictured **Wau 4 / Va 5** shapes is needed before activation under
[AGENTS.md](../AGENTS.md): “A geometry change needs a new content revision and
fresh review.” No teacher assessment or approval has been invented. After
approval, promote these exact candidates and preserve old/preview history.

## Verification

- Final unit run: **317 passed / 48 files**. Covers geometric preservation,
  measured head reduction, gates, stale approvals, framing, glyph selection,
  guide/cue boundaries, detached-badge separation, all three tracing modes and mouse/touch/pen profiles,
  reversal/jump rejection, cancellation/resume and preview credit separation.
- Initial unit run exposed an undefined-revision framing guard and three
  historical tests whose scope inventories included the new proposals. The
  guard now requires an actual correction entry; the historical scope checks
  exclude the separately tested new factory. The final full run passed.
- Checked production build passed after the guide correction: **36/36 active
  lessons ready**. JS `index-Cp2dv9ah.js`, CSS `index-DbweFF8G.css`; existing
  bundle-size warning remains.
- Final browser selection: **32 Chromium/WebKit passes / four CDP-only WebKit
  skips**, no failures. Covers adult comparison, exact paths, matching framing,
  play/guided/precision on phone and tablet, reverse rejection, partial resume,
  Va's dot-last rule, pending saved revision/status, preview isolation, both
  demonstrations, touch/pen and actual candidate thumbnails/help glyphs. The
  final selection also checks unchanged Ba/Qaf on-route badge and lift/dot
  mechanics in both browsers because the guide module changed.
- Inspected matching-scale originals/proposals, phone Wau completion, tablet Va
  guided state with separated badges, and actual candidate card/help rendering.
  The existing server returned HTTP 200 with the new candidate data and recomputed
  cue boundary. Documentation links and `git diff --check` passed.
- [Integrity verification](../scripts/verify-wau-va-smaller-heads.mjs) compares
  the active catalogue and protected source/audio with the pre-authoring baseline,
  then records current source/test/script/reference and production-bundle hashes.
  The original baseline is preserved, with the subsequent `numberedGuides.js`
  edit explicitly accounted for rather than silently excluding it.
  The active catalogue, **167 protected files** and all **78 audio files** are
  exact; all 36 lessons remain ready.

Commands and reports:

```text
node scripts/author-wau-va-smaller-heads.mjs
npm test -- --reporter=json --outputFile=output/verification/wau-va-smaller-heads/unit-final-results.json
npm run build
node tmp/build-wau-va-glyph-review.mjs
JAWI_STATIC_TEST=1 PLAYWRIGHT_JSON_OUTPUT_NAME=output/verification/wau-va-smaller-heads/browser-results.json npx playwright test tests/browser/wau-va-smaller-heads.spec.js tests/browser/numbered-guides.spec.js --grep 'smaller|revised|candidate|full and remaining|Ba numbers|Qaf head' --project=chromium --project=webkit --workers=2 --reporter=json --output=output/verification/wau-va-smaller-heads/final-test-results
node scripts/verify-wau-va-smaller-heads.mjs
git -c core.safecrlf=false diff --check
```

Environment assignments above are portable notation; actual execution uses
PowerShell `$env:`. Browser checks route checked production files through the
existing local-test helper; no duplicate server is started.

Evidence: [initial unit results](../output/verification/wau-va-smaller-heads/unit-results.json),
[final unit results](../output/verification/wau-va-smaller-heads/unit-final-results.json),
[unit results before the guide correction](../output/verification/wau-va-smaller-heads/unit-before-guide-results.json),
[browser results before the guide correction](../output/verification/wau-va-smaller-heads/browser-before-guide-results.json),
[browser results](../output/verification/wau-va-smaller-heads/browser-results.json),
[integrity and input/build hashes](../output/verification/wau-va-smaller-heads/verification.json),
[original catalogue](../output/verification/wau-va-smaller-heads/before-catalogue.json)
and [same-scale review image](../output/verification/wau-va-smaller-heads/candidate-review.png).
Visual captures: [phone completion](../output/verification/wau-va-smaller-heads/browser/chromium-wau-play-320-complete.png),
[tablet Va guides](../output/verification/wau-va-smaller-heads/browser/chromium-va-guided-768-start.png)
and [candidate thumbnails](../output/verification/wau-va-smaller-heads/browser/chromium-candidate-thumbnails.png).

The preceding [direction approval](WAU_VA_DIRECTION_APPROVAL.md) remains evidence
for the active Wau 3 / Va 4. Ta 9 / Za 9 and other approved content remain intact.
No APK, deployment, commit or push was requested. Physical-tablet performance
has not been measured in this task; touch and pen tests are emulated.
