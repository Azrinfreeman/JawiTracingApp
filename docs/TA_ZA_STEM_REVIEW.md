# Ta and Za: tall stroke closer to tail number 3

6 October 2026, Asia/Kuala_Lumpur. The owner confirmed the intended correction:
move the tall stroke left, closer to the left tail at number 3, then wrote
“yesss proceeed”. This authorises implementation. New **Ta (ط) 4 and Za 4** models
are adult review proposals; their approved revision-3 student models remain exact.
Find them at **Ruang guru → Huruf → Semakan video → Batang Ta dan Za**.

Both models shift the tall stroke 60 logical units left. Its top remains at the
same height. A short connector extends the head's start to meet the shifted stem;
the original head/loop and tail curves after that connector remain exact. The
stem's lower bend is adjusted to stop on the tail instead of protruding below it.
Tail number 3 remains anchored at (310,575). Stem start moves from (447.6,194.4)
to (387.6,194.4); its foot now meets the tail at (357.9,584.9).

Writing remains body → lift → tall stroke → Za's dot. Numbered cues follow the
real routes. Dot targets, stroke widths/tolerances and audio are unchanged.
Candidates have content revision 4, pendingReview geometry and no carried-over
approval. All 37 approved catalogue entries and all 37 recordings are preserved,
including the previous Mim/Ta marbutah/Hamzah/Jim approvals and Ga audio 7.
Jejak Ceria remains the default. Preview attempts cannot count as student completion.

## Verification

- `npm test -- --reporter=json --outputFile=output/verification/ta-za-stems/unit.json`:
  **212 tests in 27 files passed**. New checks cover connected head/foot joins,
  retained curves/height/dots/order, cue anchors, review gates, stale reviews,
  12 whole touch/pen routes at 4/24/40-unit sampling and rejection of stem-first
  drawing. The previous approval test now names the five scopes reviewed at its
  stage, allowing a later independent scope to contain new proposals.
- `VITE_BUILD_ID=ta-za-stem-review-20261006 npm run build`: content validation and
  production build passed; **37 student-ready lessons**. Existing bundle-size
  advisory remains.
- `npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **24 cases passed**, 12 in each browser. Both proposals trace completely in
  play/guided/precision modes; every movement and Za's dot gate, pending preview
  records and reload persistence, stem-only demonstrations without earned progress,
  320×600/768×1024 guides, 320×600/1280×800 comparisons and unchanged normal student
  paths are checked.
- The first direct-translation draft revealed a detached upper join and a lower
  stub in the large tracing capture. It was revised before owner review. Initial
  completion tests also used an exact SVG coordinate string; they now compare
  numerically because native SVG returns 387.6000061035156. Those draft reports
  are retained separately and are not evidence for the final geometry. Following
  the join correction, the full affected unit and browser selections and checked
  build were run again against the final models.
- Inspected final Ta/Za tablet completed letters, stem guides and actual renderer
  original/revised comparisons. Both joins stay connected; stroke and labels fit.
- The existing server returns the exact final taZaStems.json with HTTP 200.
  It was reused; no additional server started.
- `node scripts/verify-ta-za-stems.mjs`: catalogue bytes match the pre-change and
  preceding approved stage; other app modules, all 37 recordings and packaged
  audio hashes are preserved. The checker verifies proposal metadata, build and
  current reports and records input fingerprints.

Evidence: `output/verification/ta-za-stems/` contains the before catalogue,
final proposal snapshot, current unit/browser reports, final captures, server
response and `inputs.json`. Earlier draft reports remain separate. Current
application changes are limited to taZaStems.json, reviewCandidates.js and
VideoModelReview.jsx; test/documentation changes support this review.

Owner review of these pictured revision-4 models is needed before student
promotion. AGENTS.md states: “A geometry change needs a new content revision and
fresh review.” Approval will promote these exact models with matching owner
metadata; it must preserve their paths, dots/order and audio. No teacher
assessment is inferred. Physical-device touch/pen and fresh audible playback
were not tested. No APK, deployment or publication was requested.
