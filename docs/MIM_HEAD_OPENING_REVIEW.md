# Mim: tiny opening on the left of the head

6 October 2026, Asia/Kuala_Lumpur. The owner corrected the gap location with an
arrow at the opening on the left of Mim's head: bring the ends closer, leaving
only a tiny gap. The earlier detached-tail interpretation (pending Mim 4) is
rejected and preserved as historical evidence. It is superseded by **Mim 5**.

The corrected candidate keeps the tail connected and uses **one continuous
stroke**. It extends the upper left end downward toward the returning head
curve, leaving roughly 5 logical units of clear space in the wider 50-unit
tracing guide and roughly 11 units in the 44-unit illustration. The opening
stays visible without closing the head completely. Everything after the new
short opening segment—including the original head curves, head/tail connection,
entire tail curve and ending at (436.4,843)—is exactly preserved from Mim 2.

The start is (449.2238,542.170763). The added segment is the remaining portion
of the preceding closed-head left edge, trimmed at t=0.55 using cubic subdivision.
The original path follows directly without a pen lift or a detached tail.
No widths, checkpoints, dot actions or audio change. Geometry approval is reset
for fresh review at revision 5. All 37 student catalogue entries/recordings,
including approved Mim 2 and Ga audio 7, remain exact.

## Review and verification

Refresh the existing game and open **Ruang guru → Huruf → Semakan video ·
bandingkan cadangan → Langkah video → Mim → Semak Mim cadangan**.
The card shows **Cadangan · versi 5**, **1 gerakan · 0 titik**.
[Original versus tiny opening](../output/verification/mim-head-gap/browser/chromium-before-after.png)
uses the actual LetterModelGlyph renderer, through the separate test-only harness.

- `npm test -- --reporter=json --outputFile=output/verification/mim-head-gap/unit.json`:
  **206 checks in 25 files pass**. The gap is nonzero in the illustration and
  tracing band; the old tail remains byte-identical within the new path. Current
  student content/audio, revision-specific approval rejection, six coarse
  touch/pen sequences and a start-to-return shortcut rejection are checked.
- `VITE_BUILD_ID=mim-head-gap-review-20261006 npm run build`: passes, **37 ready
  student lessons**. Existing bundle-size advisory remains.
- `JAWI_OUTLINE_HARNESS_DIR=output/verification/mim-head-gap node scripts/build-outline-test-harness.mjs`:
  actual-renderer comparison harness built; never imported by the app.
- `npx playwright test tests/browser/mim-head-gap.spec.js tests/browser/fix-video.spec.js --grep "Mim keeps|demonstration follows the continuous|review card shows revision|old and revised proposals|adult comparisons" --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **20 browser cases**, 10 per engine, pass. They cover all three modes,
  phone/tablet/desktop tracing, partial and full completion, saved preview
  revision 5, demonstrations retaining progress, actual illustrations, adult
  review layout and isolation from the approved student model.
  The initial run passed 18 cases; two precision cases incorrectly lifted
  midway through a continuous stroke. The test was corrected to draw the full
  path without lifting, and both cases passed a scoped recheck. The report
  preserves all initial results and combines 18 unaffected plus two rechecked
  passes; candidate geometry and application source did not change during repair.
- Existing server: updated model JSON returns HTTP 200, revision 5, one path.
  The previous server was reused; no duplicate server was started.
- `node scripts/verify-mim-head-gap.mjs`: exact catalogue/recording and unrelated
  source preservation, candidate geometry, current result totals and input hashes.
  [Evidence](../output/verification/mim-head-gap/inputs.json) preserves rejected
  revision-4 geometry and tests separately from the current checks.
- `git diff --check`: passes. Actual before/after and tablet tracing completion
  images were inspected for the small opening and connected tail.

The other three pending video alternatives (Ta marbutah, Hamzah and Jim) remain
unchanged. Owner review of pictured Mim 5 is pending before student promotion:
[AGENTS.md](../AGENTS.md) requires “A geometry change needs a new content revision
and fresh review.” No teacher approval is inferred. Physical-device input,
APK creation, deployment and publication are outside this request.
