# Sin and Syin reference shape review

Prepared **11 October 2026**, Asia/Kuala_Lumpur, after the owner authorised the
[implementation plan](SIN_SYIN_REFERENCE_TAIL_IMPLEMENTATION.md) with “proceed”.
**Sin 3 and Syin 4 await fresh shape approval** in the adult review area.
Student lessons retain approved Sin 2 and Syin 3. No teacher assessment is asserted.

![Same-scale original and proposed bodies](../output/verification/sin-syin-reference/comparison.png)

## Proposed result

Both letters use a shared body adapted by hand from the third supplied photo:
shallower teeth, a compact bowl and a tapered left terminal rising to the level
through the tooth bases, below their peaks. This is an authored vector adaptation,
not a font conversion or automatic extraction from the photograph.

| Letter | Student revision retained | Proposed revision | Final actions |
| --- | --- | --- | --- |
| Sin | 2, approved | 3, pending review | Continuous body, then finish |
| Syin | 3, approved | 4, pending review | Continuous body, then three separate dots |

The purple construction line in the comparison is model **y = 515**. The visible
tail tip is **(230.5, 515.06916)**; the trace route ends at **(228.68, 518.64)**,
less than five model units inside the taper. The line describes the reference
photo's terminal height; the existing exercise baseline is unchanged.

Tracing follows the teeth from right to left, descends around the bowl and rises
to the left terminal without lifting. Guides 1 Mula, 2 Ikut and 3 Siap/Henti use
the actual route; Syin's unchanged dot actions follow as 4, 5 and 6. Dot centres,
visible radius, hit radius, allowed travel and order are retained. Its displayed
circles use 32 sides with less than 0.1 model-unit radial deviation.

The route and displayed outline/reveal share this new geometry. Existing matcher
tolerances, stroke checkpoints, audio revisions and all recordings are retained.
Preview attempts save as pending revision attempts and do not award student credit.

## Review in the app

Open **Ruang guru → Huruf → Semakan video · bandingkan cadangan**. Select
**Bentuk dan ekor Sin dan Syin**. Review the original/proposed pair, then select
**Semak Sin cadangan** or **Semak Syin cadangan**. Use the next-record button to
switch letters. All three practice modes and both demonstration actions work in
the adult preview.

Approval must identify **Sin 3 and Syin 4**. Student activation and scored Solo/Duo
verification belong to that subsequent approval stage.

## Verification

- Full unit suite: **295 passed / 46 files**. Build passed with **36 valid models
  and 36 ready lessons**; JavaScript `index-BiHo6S-D.js`, CSS `index-DbweFF8G.css`.
- Focused Chromium/WebKit suite: **22 passed / two skipped**. Coverage includes
  both letters in play at 320×600, guided at 768×1024 and precision at 1280×800;
  each dot, reversed input, partial-stroke recovery, completion, numbered guides,
  saved/reloaded preview attempts, retained approved student credit, full/remaining
  demonstrations and reduced motion. Both native emulated touch cases pass in
  Chromium; the two WebKit CDP cases are skipped.
- Existing approved outline regression: **16 distinct passes** across both browsers
  for Dal, Zal, Ra, Zai, Nun, Ain, Ghain and Nga. **38 distinct browser passes and
  two skips** in total. Results and commands are recorded in
  [the verification report](../output/verification/sin-syin-reference/verification.json).
- The active catalogue is **byte exact**, all **78 public/audio files are exact**,
  and both proposals validate while remaining not student-ready. All **631** sampled
  route points lie inside each body. The reveal omits two of 46,946 opaque body
  pixels (0.0043%) in a one-model-unit raster check; inspected phone/tablet/desktop
  captures show continuous ink without visible gaps or clipping.

Inspected captures include start, partial, finished, separate dots and demonstration
states. Browser tests use the production bundle through the existing static-route
fixture. Audio lifecycle is controlled in the focused tests; unchanged file hashes
establish preservation, not a new physical speaker playback check. No new APK or
physical-device run was requested.

The legacy `glyph-matched.spec.js` regression selection could not collect because
its historical ID list includes Ye, which is absent from the active catalogue.
It is preserved as historical scope; current approved outlines are covered by
`reference-outline-regression.spec.js` instead. The initial new shared checks
assumed every illustration exposes separate stroke outlines. Ain/Ghain/Nga use a
shared body; the assertion now checks that body and the independent dot outlines.
Their completion checks are rerun after this test correction; product code is unchanged.

## Evidence and provenance

Reference: `codex-clipboard-808388b5-ce4a-4999-8a2f-95b5e03ccf7b.png` (third image).
SHA-256: `6110bd00e0594943bd7a82a76ad3dc793faf96dca6261ac6de7e914924be53a1`.
Syin adapts that shared Sin body while retaining its original dot targets.

Candidate data: [sinSyinReferenceBodies.json](../src/content/sinSyinReferenceBodies.json).
Authoring: [author script](../scripts/author-sin-syin-reference.mjs).
Integrity: [integrity report](../output/verification/sin-syin-reference/integrity.json).
Commands, checked inputs and runtime/build fingerprints:
[verification report](../output/verification/sin-syin-reference/verification.json).
Browser captures: `output/verification/sin-syin-reference/browser/`.
