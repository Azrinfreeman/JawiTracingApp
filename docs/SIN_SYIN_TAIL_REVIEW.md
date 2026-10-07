# Sin and Syin: slightly higher left tails

Prepared **6 October 2026**, Asia/Kuala_Lumpur, for the owner's screenshot request
to lift the circled tails a little while keeping them below the second peak.
The corrected shapes are ready in **adult review**, as **Sin revision 2** and
**Syin revision 3**. Geometry approval is pending. The 37 approved student
entries, including Sin 1 and Syin 2, remain exact until the owner reviews these
identified new shapes. No teacher assessment or geometry approval is invented.

## Exact change

Both share one body path. Only its last endpoint changes:
**(185, 550) → (185, 510)** in the 1000-unit model. The left tip rises **40 units**,
with its x-position preserved. It remains **95 units below** the adjacent head
peak at y=415, and below the other peak at y=390. The automatically measured
marker-2 anchor is about y=439, still more than 60 units above the raised tip.
The stroke's preceding segments and final control point remain unchanged.
This lengthens the upward finish naturally while preserving the bowl's bottom.

The one continuous body movement, right-to-left direction, start point, guide
widths, matcher profiles and valid sequence are unchanged. Sin has no dots;
Syin retains all three dots, positions and body-before-dots order. Display paths,
reference routes, demonstrations, completion fill and marker 3 use the same
corrected geometry. The new candidate revisions clear the old geometry review;
their original approved audio is preserved independently.

[Actual before/after boards](../output/verification/sin-syin-tails/browser/tail-comparison.png).
The comparison arranges screenshots from the actual app; neither letter is
redrawn for the image. Both sides use the same adult-preview space, so the banner
does not change the comparison's scale. Whole-letter fitted bounds differ by
less than 0.1 logical unit after browser path sampling.

## Review in the game

Refresh [the existing local game](http://127.0.0.1:5173/), open **Ruang guru →
Huruf → Semakan video · bandingkan cadangan**, then choose **Ekor Sin dan Syin**.
Compare **Asal** and **Cadangan**, and use **Semak Sin cadangan** or
**Semak Syin cadangan**. The review pager moves between the two letters.
The normal student game still uses the preceding approved models.

The repository's [AGENTS.md](../AGENTS.md) says: **“A geometry change needs a new
content revision and fresh review”** and **“explicit approval authorises the
identified reviewed content.”** Implementation is complete for this review
stage. Owner approval of the pictured Sin 2/Syin 3 is the remaining step before
promoting these exact paths to normal student lessons, with matching review
records. Approval promotion must preserve their tested paths, dots, sequence,
audio and content versions; only status/review metadata changes at that step.

## Files and verification

Candidate paths: `src/content/sinSyinTails.json`. Adult-only cloning/version gate:
`sinSyinTailReviewCandidates` in `src/content/reviewCandidates.js`. The existing
`VideoModelReview` gains the **Ekor Sin dan Syin** choice. Existing browser helpers
and the test-only match harness are reused. No approved catalogue entry or
recording file changed; Ga continues using the owner's complete audio revision 7.
The four independent earlier video proposals remain unchanged.

- `npm test -- --reporter=json --outputFile=output/verification/sin-syin-tails/unit.json`:
  **202 passes in 24 files**, no failures. New checks cover the modest shared
  lift, preserved curves/dots/audio, moved guide anchor, fresh revision gate and
  rejection of stale source corrections.
- `VITE_BUILD_ID=sin-syin-tail-review-20261006 npm run build`: passes; validation
  reports **37 student-ready lessons**. The existing large-bundle advisory remains.
- `JAWI_OUTLINE_HARNESS_DIR=output/verification/sin-syin-tails node scripts/build-outline-test-harness.mjs`:
  separate current-component match harness built; it is not imported by the app.
- `npx playwright test tests/browser/sin-syin-tails.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **34 distinct cases pass** (17 per engine), no unresolved failures or skips.
  They cover both letters in all three practice modes, actual finish-marker
  coordinates, body/dot completion, audio during partial tracing, demonstrations,
  saved preview revisions, normal student isolation, phone/tablet/desktop
  captures and independent Solo/Duo unscored completion.
- Initial browser run: **22 passes, 12 failures**. Two new test expectations were
  wrong: comparing student/preview fitted bounds despite different banner space,
  and expecting unscored previews to emit scored pupil attempts. Both tests were
  corrected; application code/geometry did not change. The affected selection
  `--grep "actual before/after|unscored tail"` passed **12 cases** in both engines.
  Combined evidence keeps 22 unaffected passes plus these 12 current passes.
  Initial source/report and recheck report remain preserved.
- Additional `node --input-type=module -` matcher simulation: **12 passes** for
  both letters with touch/pen profiles and 8/24/40-unit movement spacing, including
  every dot. This is simulated input, not physical-device verification.
- Existing server: candidate JSON and review component return HTTP 200; both
  corrected paths and the review choice are served. No duplicate server started.
- `node scripts/verify-sin-syin-tails.mjs`: validates both pending candidates,
  full catalogue preservation, all 37 original audio files and packaged hashes,
  readiness, prior proposals, current results and input fingerprints.

The actual comparison, 320×600 Syin start and 768×1024 guided completion captures
were visually inspected; raised tips remain lower than the peaks and controls
are clear. [Current inputs and results](../output/verification/sin-syin-tails/inputs.json).
Physical-device touch/pen and professional teaching review remain unverified.
No APK, deployment or publication was requested.
