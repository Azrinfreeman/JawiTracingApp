# Ta and Za: smooth rising head without the dent

Follow-up completed **7 October 2026**, Asia/Kuala_Lumpur; started on 6 October.
The owner pointed at the flat/dented shoulder in proposal 4 and requested:
“the curve that i am pointing at is wrong, it's not curvy enough and dented.
Remove the dent”. New **Ta (ط) 5 and Za 5** are adult review proposals. Their
approved revision-3 student models remain exact. Proposal 4 is superseded and
its [preceding review evidence](TA_ZA_STEM_REVIEW.md) is retained.

The short straight connector and small intervening bends are replaced with one
continuous rising cubic. It meets the retained outer loop with a matching
tangent, removing the flat step and sharp change of direction. Both letters use
the same body and stem. The stem's 60-unit left shift and attached foot from
proposal 4 are exact; the tail and dot targets are unchanged. Writing still
follows body → lift → stem → Za's dot. All 37 approved catalogue entries and
recordings are preserved. Jejak Ceria remains the default.

Review at **Ruang guru → Huruf → Semakan video → Batang Ta dan Za**. Each
candidate has content revision 5, pendingReview geometry and no stale approval.
The next approval must identify these corrected models rather than proposal 4.

## Verification

- `npm test -- --reporter=json --outputFile=output/verification/ta-za-smooth-join/unit.json`:
  **213 tests in 27 files passed**. A new regression check verifies a single
  curved rise, strictly increasing horizontal progression, no flat shoulder in
  the marked span and matching tangents into the retained loop. Existing join,
  anchor/order/dot/approval and 12 coarse touch/pen routes continue to pass.
- `VITE_BUILD_ID=ta-za-smooth-join-review-20261006 npm run build`: content validation
  and production build passed; **37 student-ready lessons**. The build identity
  records the task's starting date. Existing bundle-size advisory remains.
- `npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **24 cases passed**, 12 per browser. Both revision-5 proposals complete in
  play/guided/precision modes; movement order, every Za dot, pending preview save
  status and persistence, demonstrations without earned progress, phone/tablet
  guide fit, phone/desktop review and unchanged student routes are checked.
- Inspected completed tablet Ta/Za letters, phone guides and enlarged copies of
  the actual review-renderer SVGs. The marked shoulder rises smoothly with no
  horizontal step; both joins remain connected. Enlarged figures copy the
  original SVG/viewBox/paths from the review screen, changing presentation size
  only. These figures do not change the game interface or model geometry.
- The running server returns exact final taZaStems.json with HTTP 200. No
  additional server was started.
- `node scripts/verify-ta-za-smooth-join.mjs`: compares against the preceding
  revision-4 review and approved catalogue, proves the stem/tail/dots/order/audio
  preservation, checks other app modules, packaged audio, current reports/build
  and records relevant input hashes.
- Whitespace diff check passed.

Evidence: `output/verification/ta-za-smooth-join/` contains the original catalogue,
previous proposal/tests, final proposal snapshot, unit/browser reports, final
captures, server response and `inputs.json`. The earlier revision-4 files and
reports remain historical; they are not proof for this revised geometry.

Owner review of **Ta 5 and Za 5** is needed before student promotion. AGENTS.md
states: “A geometry change needs a new content revision and fresh review.” No
teacher assessment is inferred. Physical-device touch/pen and fresh audible
playback were not tested. No APK, deployment or publication was requested.
