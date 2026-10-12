# Ya: smaller head from the supplied reference

Historical candidate stage: the owner subsequently replied **“approve d”**
directly to the pictured Ya 3 student-lesson approval question. The exact
candidate is now active; see [activation verification](YA_SMALLER_HEAD_APPROVAL.md).
The candidate evidence below is preserved. Environment clarification: the
`JAWI_STATIC_TEST=1` runs used the built `dist` game intercepted through the
existing `localTest` fixture, while the running development server was checked
separately. Earlier wording below describing browser checks as development
server checks should be read with this correction.

Date: **12 October 2026**, Asia/Kuala_Lumpur.

The owner requested a smaller head at **1**, using the
[first supplied picture](references/ya-smaller-head-reference.png). The
[second picture](references/ya-current-tracing.png) shows the preceding tracing
model. This request authorises implementation; the revised shape needs fresh
review under [AGENTS.md](../AGENTS.md). **Ya 3** is an adult-only pending
candidate. Approved **Ya 2** remains active for student lessons and scored
Solo/Duo. No new owner/teacher approval is claimed.

![Reference, current Ya 2 and proposed Ya 3](../output/verification/ya-smaller-head/reference-comparison.png)

## Implemented change

The first two cubic curves, including the head and its return to the bowl, are
scaled to **72%** of their previous coordinates around their fixed join at
**(627.2, 632.5)**. This reduces the head curve's width and height by **28%**.
Visible stroke thickness stays unchanged, so this percentage describes the
curve rather than every outside edge. The joint retains the original tangent
direction and connects smoothly to the untouched lower bowl.

The last two cubic curves, the bowl's left endpoint, both dots, dot radii and
touch policies, movement IDs, order, checkpoints, widths and audio remain
exact. The reference guides head proportions; its calligraphic thickness,
diamond dots, arrows, numerals and background are not copied into the model.
Ya keeps one continuous body followed by two separate dot taps.

The existing route renderer and matchers are reused. No new drag listener,
runtime image processing, matcher tolerance or global guide rule is added.
Revision-specific framing retains the preceding complete-letter scale, so a
smaller head does not enlarge the lower bowl or dots through automatic fitting.
The candidate's card/help glyph uses its tracing model only at revision 3.
The adult comparison uses the same `220 300 540 580` viewBox for both models.

Instructions follow the shorter route: trace the compact head, then the bowl.
The measured head/bowl boundary is **0.4349** of total length. Landmarks remain
**1 Mula → 2 Ikut → 3 Henti**; lift and tap **4 Titik**, then **5 Titik akhir**.
Full/current-section demonstrations use the same route without awarding work.

## Review the candidate

Refresh the [existing game](http://127.0.0.1:5173/) and open:

**Ruang guru → Huruf → Semakan video · bandingkan cadangan → Kepala kecil Ya**.

Choose **Semak Ya cadangan** to trace it. Preview attempts record revision 3
and pending geometry without receiving student credit. The candidate is
excluded from approved student/scored pools and expires when the catalogue
advances beyond its approved revision-2 base.

## Verification

Current checks and source/build fingerprints are recorded in
[verification.json](../output/verification/ya-smaller-head/verification.json).
The source of truth remains the unchanged
[student catalogue](../src/content/letters.json); the candidate is authored in
[yaSmallerHead.json](../src/content/yaSmallerHead.json).

| Check | Scope and result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/ya-smaller-head/unit-results.json` | **341 passed, 0 failed, 50 files**. Head-only transform/join, unchanged scale and dots, readiness/revision gates, all three practice modes with mouse/touch/pen, reversal/jump rejection, lifted/coarse tracing and preview credit separation. |
| `npm run build` | Passed, including content validation: **36 student-ready lessons**. JavaScript `index-CjeeSF_v.js`; existing bundle-size warning remains. |
| `JAWI_OUTLINE_HARNESS_DIR=output/verification/ya-smaller-head node scripts/build-outline-test-harness.mjs` | Fresh test-only harness using current match/result components and pending Ya 3. |
| `JAWI_STATIC_TEST=1 npx playwright test tests/browser/ya-smaller-head.spec.js --project=chromium --project=webkit --workers=2 --reporter=json` | **20 distinct passed, two skipped**, after the focused selector correction below. Existing development server; 320 × 740, 1024 × 768, 768 × 1024 and 1280 × 800. |
| `node scripts/verify-ya-smaller-head.mjs` | Catalogue byte-exact; all **36 entries**, **78 audio files** and **466 protected existing inputs** exact. Only Ya 3 is pending; all 36 student lessons remain ready. |

The initial browser report contains 18 passes, two CDP-only skips and two
student-help selector failures. Nested `.jawi` wrappers caused the help
assertion to match twice; the test now selects the outer glyph wrapper and
the actual card accessible name. Only the two affected cases were rerun with
`--grep 'student Ya remains'`; both passed, without application changes.
The [initial report](../output/verification/ya-smaller-head/browser-results.json)
and [focused recheck](../output/verification/ya-smaller-head/browser-student-recheck.json)
are preserved. The final report merges distinct cases without double counting.

Browser checks cover the actual adult comparison, preview tracing with reversal
and lift/resume, separate final dots, persisted pending records without student
credit, full/current-section demonstrations and unchanged student lesson,
card/help glyphs. Chromium native emulated touch and pen pass; WebKit skips
those two cases because they require Chromium CDP. Deterministic candidate
Solo/Duo checks cover independent lanes, both dots and unscored results using
current components, rather than random challenge selection.

Relevant captures were visually inspected, with automated fit, overlap and
page-overflow checks:

- [Phone tracing](../output/verification/ya-smaller-head/browser/chromium-play-320-start.png)
- [Tablet final dot](../output/verification/ya-smaller-head/browser/webkit-guided-768-dot-2.png)
- [Duo preview](../output/verification/ya-smaller-head/browser/chromium-duo-lane-0.png)
- [Adult comparison](../output/verification/ya-smaller-head/browser/chromium-comparison.png)

The server returned HTTP 200 and served the new candidate factory. Browser
checks used that development server; production build validation was separate.
Repeat applicable checks when their recorded inputs/runtime change or a new
concern appears.

No new APK or physical-tablet test is included. Owner approval must identify
this reviewed Ya 3 before activation; audio approval remains independent.
