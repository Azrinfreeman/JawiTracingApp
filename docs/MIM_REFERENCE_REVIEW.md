# Mim: reference-shaped candidate review

Historical candidate stage: the owner subsequently replied **“approved”**
directly to the pictured Mim 6 student approval question. See
[activation verification](MIM_REFERENCE_APPROVAL.md) for the current student
model. The evidence below preserves the preceding review stage.

Date: **12 October 2026**, Asia/Kuala_Lumpur.

The owner's **“go”** authorises implementation of the
[documented plan](MIM_REFERENCE_IMPLEMENTATION.md). **Mim 6** is an adult-only
candidate, pending shape approval. Approved **Mim 5** remains active for student
lessons and scored Solo/Duo. No teacher assessment or new geometry approval is
inferred from implementation authorisation.

![Reference, current Mim 5 and proposed Mim 6 at matching model scale](../output/verification/mim-reference/reference-comparison.png)

## Implemented shape and route

The [second supplied image](references/mim-photo-reference.png) is adapted into
a clean vector silhouette: open hooked head, defined right shoulder, flatter
return to the left and a connected slender tail ending in a point. The
[first image](references/mim-current-tracing.png) records the preceding model.
The reference is low resolution; the candidate follows its visible shape
rather than compression edges or the grey background.

There is one continuous `stroke-1`, no dots and no extra pen lift. It starts at
**(429.8, 449.8)**, follows the head and return, then descends to the pointed
terminal at **(416.6, 837)**. The route is approximately **735.342 model units**.
The sampled centreline lies inside the authored silhouette; the rasterised
outline tip is within 0.5 model units of its reachable route endpoint.

The display uses the existing `referenceOutline` renderer. **16 static reveal
pieces** are generated offline along the route; tracing adds no new input
handler, runtime image processing or global matcher changes. Trace width 44,
display width 50, continuous policy, checkpoints and audio remain exact.
Variable visible thickness comes from the outline, not altered touch tolerance.

Guides **1 Mula → 2 Ikut → 3 Siap** point to the actual route, with a measured
head/tail instruction boundary at **0.60348**. Full and current-section
demonstrations share that route. Candidate cards and shared help glyphs use
the new model only at revision 6. The adult comparison uses a common viewBox
`320 330 350 540` for the original and candidate, preserving scale.

Mim-6 framing reserves **120 model units below the outline** so the detached
finish badge clears the instruction bubble in Duo. This framing applies only
to the new revision. The outline and accepted route retain their authored
coordinates. Other letters and approved Mim 5 keep their existing framing.

## Review in the game

Refresh the [existing game](http://127.0.0.1:5173/) and open:

**Ruang guru → Huruf → Semakan video · bandingkan cadangan → Bentuk rujukan Mim**.

Compare **Asal · versi 5** with **Cadangan · versi 6**, then choose
**Semak Mim cadangan** to trace it. The proposed instructions are available
under **Langkah cadangan**. Preview work records revision 6 and pending geometry
without granting student credit. The candidate is excluded from scored pools.

## Verification

Evidence: [mim-reference](../output/verification/mim-reference/).
Final input/build fingerprints and totals are in
[verification.json](../output/verification/mim-reference/verification.json).

| Check | Scope and result |
| --- | --- |
| `node scripts/author-mim-reference.mjs` and subsequent `--refresh` authoring runs | Captured the original catalogue/input hashes, preserved reference images and Mim 5 fixture, generated route/outline/reveal data and same-scale comparison. Route-inside-ink check passed. Refresh preserves the original baseline. |
| `npm test -- --reporter=json --outputFile=output/verification/mim-reference/unit-clearance-results.json` | **331 passed / 49 files** on the final framing. Includes isolated revision/readiness, untouched movement/audio properties, measured cues, endpoint guides, touch/pen coarse sampling, continuous completion in three modes, early lift/resume, reversal and shortcut rejection, and preview credit separation. |
| `npm run build` | Passed, including validation of **36 ready student lessons**. Final JS `index-BJxDXRuG.js`, CSS `index-DbweFF8G.css`; existing large-bundle warning remains. |
| `node scripts/build-mim-test-harnesses.mjs` | Bundled current challenge components and card/shared-help glyph components separately for deterministic candidate tests; these harnesses are not imported by the app. |
| `JAWI_STATIC_TEST=1 PLAYWRIGHT_JSON_OUTPUT_NAME=output/verification/mim-reference/browser-clearance-results.json npx playwright test tests/browser/mim-reference.spec.js --project=chromium --project=webkit --workers=2 --reporter=json --output=output/verification/mim-reference/clearance-test-results` | **22 passed / two skipped**, no failures or flaky results, on the final framing. Both skips require Chromium CDP input emulation and cannot run in WebKit. |
| `node scripts/verify-mim-reference.mjs` | Passed: active catalogue byte-exact, **453 protected existing files and all 78 audio files exact**, 36 ready lessons, Mim 6 valid/pending and isolated. Accounted source/test changes plus current SHA-256 inputs/build are recorded. |
| Existing server read | `http://127.0.0.1:5173/src/content/mimReferenceShape.json?import` returned HTTP 200 and the new reference/revision. No duplicate server started. |

Browser coverage includes play at 320×740 and 1024×768, guided at 768×1024,
precision at 1280×800, real endpoint completion, reversal rejection, early
lift/resume, saved preview revision/status and reload isolation from student
credit. It checks the open mouth, tail thickness, route containment and partial
head reveal without premature lower-tail ink. Demonstrations preserve partial
progress. Chromium exercises native emulated touch and pen.

Current Solo/Duo components are mounted with deterministic candidate selection
in an unscored test harness. Both lanes complete independently, show no scores
and make no scored-attempt callback. This does not claim candidate access in
normal student challenge selection. Card/shared-help glyph selection is checked
through the real components; it does not claim a new student help dialog is active.

Captures check silhouette/guide bounds, badge overlap, page overflow and a
**six-pixel minimum gap** between guide bounds and the instruction bubble.
Coordinates are recomputed after captures before subsequent tracing. Inspected
phone start, tablet partial head, completed outline, candidate thumbnails and
both Duo lanes against the reference comparison.

- [Phone start](../output/verification/mim-reference/browser/chromium-play-320-start.png)
- [Phone completion](../output/verification/mim-reference/browser/chromium-play-320-complete.png)
- [Tablet guide start](../output/verification/mim-reference/browser/webkit-guided-768-start.png)
- [Partial head](../output/verification/mim-reference/browser/webkit-partial-head.png)
- [Duo clearance](../output/verification/mim-reference/browser/chromium-duo-lane-0.png)
- [Candidate card/shared help](../output/verification/mim-reference/browser/webkit-glyphs.png)

Earlier reports remain historical: the first unit run exposed three old tests
that enumerated review factories without excluding this later scope; their
historical contracts were preserved. Initial browser assertions incorrectly
expected play-fill in strict modes, a tail cue after lifting, and scored-attempt
callbacks in unscored previews. These expectations were corrected and checked.
Visual inspection then prompted extra finish-guide clearance; the changed
framing received a fresh build and full affected unit/browser checks.

No physical low-spec tablet verification, new APK, deployment, commit or push
was performed. The existing development server is reused. These reports apply
to the recorded inputs; repeat affected checks after relevant changes.

## Approval boundary

The active catalogue, other 35 entries, current Wau 4/Va 5 and Ta 9/Za 9, and all
existing audio remain unchanged. Jejak Ceria stays the default.

Approve the pictured **Mim 6** before student activation.
[AGENTS.md](../AGENTS.md) requires **“A geometry change needs a new content
revision and fresh review.”** After approval, promote exactly this candidate
with matching reviewer/date/revision metadata and check student access, saved
revision credit, completion and scored Solo/Duo against the active build.
