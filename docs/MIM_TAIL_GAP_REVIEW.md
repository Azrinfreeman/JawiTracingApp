# Mim: small gap above the tail

6 October 2026, Asia/Kuala_Lumpur. The owner requested a small gap at the top of
the tail in the pictured **Mim proposal 3**. A new **Mim revision 4** adult review
candidate separates the downward tail from the closed head. It uses **two
movements**: close the loop, lift, then start the tail below it. This interprets
the requested gap as separation between head and tail; the illustrated version
is ready for the owner to review. The approved student Mim 2 is unchanged.

The head exactly retains proposal 3's closed-loop path. The tail restarts at
(437.4995,678.1255), leaving about **19.7 logical units of visible space** even
between the 50-unit tracing bands, and about 25.7 units between the 44-unit
illustration strokes. Its lower curve and final endpoint (436.4,843) are
preserved. The original first tail cubic is trimmed at t=0.3 using subdivision;
the retained curve is not shifted. No dots or recording changes are introduced.
The head uses numbers 1–3; the shorter tail uses 4–5 and an explicit lift cue.

## Review

Refresh the existing game, then open **Ruang guru → Huruf → Semakan video ·
bandingkan cadangan → Langkah video → Mim → Semak Mim cadangan**.
The card shows **Cadangan · versi 4**, **2 gerakan · 0 titik**.
[Proposal 3 versus revision 4](../output/verification/mim-tail-gap/browser/chromium-before-after.png)
uses the actual LetterModelGlyph renderer in the separate test-only harness.
The tracing capture shows the real app's tail-start state with the lift cue.

Geometry status remains pendingReview with no approval metadata. The
[AGENTS.md](../AGENTS.md) rule, “A geometry change needs a new content revision
and fresh review,” requires owner review before replacing student Mim. The
earlier proposal 3 is preserved in the verification baseline and fixture;
revision 4 supersedes that pending proposal without reusing its revision.
Ta marbutah, Hamzah and Jim remain separate pending alternatives. All 37
approved catalogue entries and audio metadata/recordings remain exact.

## Verification

- `npm test -- --reporter=json --outputFile=output/verification/mim-tail-gap/unit.json`:
  **206 passes in 25 files**. Added tests cover the visible guide gap, preserved
  head/lower-tail curve, fresh revision gate, unchanged student model/audio,
  rejection of tail-first/bridging attempts and complete touch/pen sequences.
- `VITE_BUILD_ID=mim-tail-gap-review-20261006 npm run build`: passes, **37 ready
  lessons**. Existing bundle-size advisory remains.
- `JAWI_OUTLINE_HARNESS_DIR=output/verification/mim-tail-gap node scripts/build-outline-test-harness.mjs`:
  builds the separate current-renderer comparison harness, never imported by the app.
- Browser selection uses `mim-tail-gap.spec.js` and the `adult comparisons`
  cases in `fix-video.spec.js`, Chromium/WebKit, two workers, production fixtures.
  **20 distinct cases pass**, no unresolved failure/skip: all practice modes,
  phone/tablet/desktop, two-stage completion and revision, lift cue, demonstration
  preserving progress, adult card layout, student isolation and before/after.
  Initial run had 14 passes and six old comparison-test failures because the
  demonstration now has two paths. The assertion now selects the head path.
  Eight scoped cases (six comparisons plus two resized illustration captures)
  were rerun; the final report combines 12 unaffected passes and those eight.
  No application geometry changed during test repair.
- Existing server returns HTTP 200 for `src/content/mimTailGap.json`, serving
  revision 4 and both paths. No duplicate server started.
- `node scripts/verify-mim-tail-gap.mjs` checks preservation and current results;
  fingerprints and report history are under `output/verification/mim-tail-gap/`.
- `git diff --check`: passes. Actual before/after and 768×1024 tail-start captures
  were visually inspected: the gap is visible and guides fit.

Owner approval of the pictured Mim 4 is pending before normal-game promotion.
No teacher assessment, physical-device test, APK, deployment or publication is claimed.
