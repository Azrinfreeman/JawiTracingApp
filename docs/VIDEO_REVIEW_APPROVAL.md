# Approval of all current Semakan video proposals

6 October 2026, Asia/Kuala_Lumpur. The owner wrote
**“approve all tthe alphabets in semakan video”**. The current review inventory
contained **Mim 5, Ta marbutah 4, Hamzah 4 and Jim 4**. Their exact reviewed models
are now active in normal practice and scored Solo/Duo challenges. Each review
records the project owner, date, matching revision and
[approval reference](CONTENT_APPROVALS.md#approval-of-all-current-semakan-video-proposals-2026-10-06).

| Letter | Active revision | Reviewed model retained |
| --- | --- | --- |
| Mim | 5 | Tiny opening on the left of the head; connected tail, one continuous stroke |
| Ta marbutah | 4 | Closed loop, then two dots |
| Hamzah | 4 | Continuous head, return and tail |
| Jim | 4 | Head from right to left, lift, bowl, then dot |

No geometry edits or extra revision increment occurred during promotion.
All other 33 catalogue entries and all 37 audio records/files are preserved,
including Ga audio 7. All five current review factories return no candidates;
obsolete cards disappear through their existing revision gates. Rejected Mim 4
remains historical and is not included in this approval. Old attempts remain
saved, but neither old revisions nor adult previews complete the new versions.
Jejak Ceria remains the default.

## Verification

- `npm test -- --reporter=json --outputFile=output/verification/video-review-approval/unit.json`:
  **208 tests in 26 files passed**. This includes exact candidate promotion,
  all review scopes, student/challenge eligibility and saved revision separation.
- `VITE_BUILD_ID=video-review-approved-20261006 npm run build`: content validation
  and production build passed; **37 student-ready lessons**. Existing bundle-size
  advisory remains. No second application build was needed.
- `node scripts/build-outline-test-harness.mjs`, with `JAWI_OUTLINE_HARNESS_DIR`
  pointing at the evidence folder: separate test-only challenge harness built
  from the current components; it is excluded from the application entry.
- `npx playwright test tests/browser/video-review-approval.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **52 distinct cases passed**, 26 in each browser. Three practice modes for all
  four letters, every stroke/dot, demonstrations, approved saved revisions and
  persistence, phone/tablet layouts, teacher approval records, all five empty
  review scopes and scored Solo/Duo outcomes are covered.
- The initial run had 51 passes and one WebKit review-screen test failure. The
  test paged before the measured grid settled. It now waits for font/layout
  measurement and settles after each page. All four affected review-screen cases
  were rechecked with `--grep "all matching approvals"` and passed. Final evidence
  combines 48 unchanged initial cases with these four checks; it does not claim
  a second full-suite execution. Application source remained unchanged during repair.
- Inspected all four 768×1024 guided-start captures, WebKit Mim and Chromium Jim
  320×600 starts, and the phone's empty review screen. Guides, shapes and controls
  remain visible within the page.
- Existing server `http://127.0.0.1:5173/` returns the exact approved catalogue
  with HTTP 200. No duplicate server was started.
- `node scripts/verify-video-review-approval.mjs`: compares the before catalogue
  and reviewed proposal snapshot, checks matching metadata, preserves other app
  source/audio hashes, verifies packaged audio, results and build identity, and
  records current evidence fingerprints.
- Whitespace diff check passed.

Evidence is under `output/verification/video-review-approval/`: before catalogue,
reviewed proposals and scope inventory, unit report, initial/rechecked/combined
browser reports, current screenshots, server response and `inputs.json`.
The preceding [Mim opening review](MIM_HEAD_OPENING_REVIEW.md) and older review
records are preserved as evidence of their dated stages.

Physical-device touch/pen were not tested. Audio is unchanged and browser checks
use controlled audio instrumentation; native audible playback was not newly
verified. No APK, deployment or publication was requested.
