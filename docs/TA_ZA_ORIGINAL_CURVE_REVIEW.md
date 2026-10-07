# Ta and Za: exact original-3 loop with the closer stem

7 October 2026, Asia/Kuala_Lumpur. The owner requested:
“can you make the curve in revised - 5 to be exactly like original 3?”
New **Ta (ط) 6 and Za 6** copy the original-3 head and loop without reshaping.
They are adult review proposals; normal student revision-3 entries remain exact.
Proposal 5 is superseded. Its [review](TA_ZA_SMOOTH_JOIN_REVIEW.md) and proposal-4
[review](TA_ZA_STEM_REVIEW.md) remain historical.

The first four body curves, including the small head rise, crest, rounded right
side and lower loop return, are translated 60 logical units left with the stem.
Every control point retains its original vertical coordinate and exact relative
position. There is no stretch, scale or added connector. The whole original stem
is likewise translated left, preserving its curve and height. Both joins remain
connected.

Tail finish number 3 stays at (310,575). The last tail approach is shortened to
join the translated loop to that fixed tip; it is not claimed identical to the
original tail curve. Its first control retains the original incoming direction.
Za's dot moves 60 units left with the head; its height, radius, touch policy and
count remain unchanged. Writing still follows body → lift → stem → Za's dot.
All 37 approved catalogue entries and 37 recordings are preserved, including
earlier model approvals and Ga audio 7. Jejak Ceria remains the default.

Review under **Ruang guru → Huruf → Semakan video → Batang Ta dan Za**. Both
candidates have revision 6, pendingReview geometry and no inherited approval.

## Verification

- `npm test -- --reporter=json --outputFile=output/verification/ta-za-original-curve/unit.json`:
  **213 tests in 27 files passed**. The geometry regression now checks exact
  original-3 head/loop control points under translation, an unscaled original
  stem, unchanged tail finish/order, aligned Za dot, connected head/foot joins,
  no flat connector, fresh review gates and 12 whole coarse touch/pen routes.
- `VITE_BUILD_ID=ta-za-original-curve-review-20261007 npm run build`: content
  validation and production build passed; **37 student-ready lessons**. Existing
  bundle-size advisory remains.
- `npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **24 cases passed**, 12 per browser. Both proposals complete in all three
  practice modes; every movement and aligned Za dot, preview-only revision-6
  saves/persistence, demonstrations without earned progress, phone/tablet guide
  fit, phone/desktop comparison and unchanged student paths are checked.
- Inspected enlarged original-3/revision-6 comparisons and complete tablet
  letters. The head/loop retains the original shape; the stem sits closer to the
  fixed tail tip. Za's dot stays above the translated loop. Enlarged figures use
  copies of the actual review SVGs and change presentation size only.
- The existing server returns exact final taZaStems.json with HTTP 200; no
  additional server was started.
- `node scripts/verify-ta-za-original-curve.mjs`: verifies exact translations,
  fixed tail finish, dot alignment, proposal metadata, preserved approved
  catalogue and other app modules, 37 recording/packaged-audio hashes, build
  identity and current reports, then records relevant input hashes.
- Whitespace diff check passed.

Evidence: `output/verification/ta-za-original-curve/` contains the original
catalogue, previous proposal/tests, final candidate snapshot, unit/browser
reports, final captures, server response and `inputs.json`. Prior revision-4/5
reports are not reused as proof for this geometry.

Owner review of **Ta 6 and Za 6** is needed before student promotion. AGENTS.md
states: “A geometry change needs a new content revision and fresh review.” No
teacher assessment is inferred. Physical-device touch/pen and fresh audible
playback were not tested. No APK, deployment or publication was requested.
