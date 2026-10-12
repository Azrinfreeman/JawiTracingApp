# Ta (ط) and Za (ظ): latest photo-reference review

Date: **12 October 2026**, Asia/Kuala_Lumpur.

Historical candidate verification: the owner subsequently replied “proceed”
directly after the pictured review and student activation approval statement.
These exact Ta 9 / Za 9 shapes are now approved and active. See
[activation verification](TA_ZA_REFERENCE_APPROVAL.md). The pending-review state,
checks and captures below describe the preceding candidate stage.

The owner rejected the preceding rounded loop and supplied
[this photo](references/ta-za-photo-reference.png). The adult review now shows
**Ta 9 / Za 9**, with a low compact sloping loop, a pointed left tail, and a
thin pillar with a tapered top. This is an authored vector adaptation of the
photo, ready for visual review; it is not a claim of measured pixel fidelity.

![Revision-9 candidates](../output/verification/ta-za-photo-reference/candidate-review.png)

Open **Ruang guru → Huruf → Semakan video → Batang lurus Ta dan Za** to
compare and trace both proposals. Approved revision 6 remains active for students
and scored Solo/Duo. These new shapes are pending review, with no invented
teacher assessment. Under [AGENTS.md](../AGENTS.md), “A geometry change needs a
new content revision and fresh review.” Explicit approval of these pictured
revision-9 shapes is required before student activation.

## Shape and tracing

Both models share the same revised body and pillar. The latest photo supersedes
revision 8's rounded arch and its preserved lower return/tail: the body and tail
are now adapted together to match the new reference proportions. The straight
pillar centreline required in the earlier request is retained exactly:

```svg
M 387.6 194.4 L 387.6 609.29486
```

Trace the loop and tail first through 1–3, lift, then follow the single downward
pillar through **4 Mula → 5 Ikut → 6 Siap/Henti**. Za's unchanged separate dot
follows as **7 Titik akhir**. Dot targets/actions, audio approvals/recordings,
matcher rules, tolerances, input handling and the preschool default are unchanged.
Detached outline guides point to the actual trace routes.

[The authoring script](../scripts/author-ta-za-reference.mjs) records the photo
coordinate paths and their scale/translation in
[the candidate data](../src/content/taZaStraightPillars.json). Filled vector
silhouettes provide the thin stem and tapered terminals; the existing outline
renderer reveals 17 body pieces and 9 pillar pieces. The union silhouette retains
one white counter without an extra hole at the body/pillar overlap. No shared
renderer or input code changed for this request.

The source photo SHA-256 is
`7d0115a6c8c1ae9bb6262218afce4224679f12fb32b6611123cdb325e47b9ef5`.
The 0.48-unit contour error bound concerns the authored vector raster/contour
conversion, not similarity to the photographed glyph. Geometry revision 9 is
based on the approved revision-6 entries; appearance metadata records the
preceding revision 8. An exact snapshot of revision 8 is retained in the evidence.

## Verification

- `npm test -- --reporter=json --outputFile=output/verification/ta-za-photo-reference/unit-results.json`:
  **305 tests passed across 47 files**. Includes review gating, revision expiry, source restoration,
  outline bounds/counter, all tracing modes, direction, lift/resume and Za's dot.
- `npm run build`: passed content validation and production compilation;
  **36/36 active lessons ready**. Existing bundle-size warning remains.
- Chromium/WebKit browser cases cover comparison, phone 320×740, landscape tablet
  1024×768, portrait tablet 768×1024 and 1280×800; play/guided/precision tracing,
  complete silhouettes, numbering, no overflow, reversed starts, partial resume,
  demonstrations, persistence and preview credit isolation. Chromium also covers
  native emulated touch. Final coverage is **24 distinct passed cases / two
  CDP-only WebKit skips**, using the unchanged passing cases from the initial
  run and the four final animation cases below.
- The initial browser run had 23 passes, two skips and one animation-sampling
  assertion failure. A follow-up similarly exposed skipped final marker frames.
  The final observation checks downward marker movement and the exact fully
  revealed pillar separately; all four affected Chromium/WebKit cases passed.
  Application code did not change for this correction.
- Inspected actual phone and tablet captures, including the WebKit portrait
  guide state and completed landscape model, plus the side-by-side review image.
- Preservation checks compare the active catalogue, unrelated source and all
  78 public/audio files against the pre-change baseline: **169 protected files,
  zero differences**. Build hashes and 444 final source/test fingerprints identify
  the checked inputs.
- The existing `http://127.0.0.1:5173/` server returned HTTP 200 for the candidate
  module with revision 9 and the latest photo provenance. No duplicate server
  was started. `git -c core.safecrlf=false diff --check` passed.

Evidence: [unit results](../output/verification/ta-za-photo-reference/unit-results.json),
[initial browser results](../output/verification/ta-za-photo-reference/browser-results.json),
[first animation follow-up](../output/verification/ta-za-photo-reference/browser-animation-results.json),
[final animation results](../output/verification/ta-za-photo-reference/browser-animation-final-results.json),
[preservation and build hashes](../output/verification/ta-za-photo-reference/preservation-and-build.json),
[final input fingerprints](../output/verification/ta-za-photo-reference/final-inputs.json),
[phone tracing capture](../output/verification/ta-za-photo-reference/browser/chromium-tho-play-320-pillar.png)
and [portrait tablet capture](../output/verification/ta-za-photo-reference/browser/webkit-za-guided-768-pillar.png).

The [revision-7 report](TA_ZA_STRAIGHT_PILLAR_REVIEW.md) and
[revision-8 report](TA_ZA_ROUNDED_LOOP_REVIEW.md) remain historical; they do not
verify this changed geometry. No physical tablet test, performance benchmark,
new APK, commit or push was performed for this request.
