# Ain, Ghain and Nga: catalogue-shaped tracing

6 October 2026, Asia/Kuala_Lumpur. **Historical review stage. The owner has
approved these exact catalogue outlines; see [student promotion and current
verification](AIN_FAMILY_TRACE_APPEARANCE_APPROVAL.md).**

The owner supplied the three catalogue cards and circled the unwanted bend below
the head in the tracing illustration. The requested reference is the appearance
in Isi Kandungan, including the thin neck, changing stroke weight, tapered ends
and diamond dots. A straightened round band would still differ from that reference.

## Review the correction

At `http://127.0.0.1:5173/`, choose **Ruang guru → Huruf → Semakan video →
Bentuk Ain, Ghain dan Nga**. Each comparison shows the catalogue glyph, the
original model and the corrected candidate. **Semak … cadangan** opens the
traceable preview, with Dengar, full/section demonstrations and the normal mode
selection. The three reviewed candidates are **Ain 4, Ghain 4 and Nga 4,
catalogue outlines**.

The earlier continuous-stroke video proposals also use revision 4. They remain
separate alternatives under **Langkah video**; this correction preserves the
approved two-stroke order. Approval must identify the catalogue outlines in this
review, rather than the earlier continuous-stroke proposals. No new approval,
teacher assessment or pupil trial is recorded here.

## Implementation

- Visible ink comes from the bundled **Noto Naskh Arabic 400** font used in the
  catalogue. A 2400-pixel authoring raster becomes static closed vector contours,
  using one uniform scale and translation. Source file, hash, glyph, transform
  and maximum contour simplification error (**0.344 logical units**) are stored
  in each candidate. No font conversion runs during tracing.
- The head path is preserved. The second stroke starts at the lower font join
  and descends directly along the sloping neck, replacing the extra early turn.
  Its later bowl/tail curves, stroke widths, checkpoints and lift policy remain
  unchanged. Existing dot centres, hit areas and body → dots order are preserved.
- One unsplit body outline renders the reference and authored result. Accepted
  progress and demonstrations still reveal separate stroke pieces, overlapping
  their shared edges inside the full body clip. This removes partition seams
  while preserving the outer silhouette and later-part/dot gates.
- Number badges sit beside the silhouette, with leaders to the actual targets.
  Uniform fitting includes the complete outline and dots; the selected-letter
  sound button remains accessible beneath the name. Copying keeps the learner's
  freehand drawing.

The source catalogue is byte-identical to its pre-task snapshot: **37 approved
student lessons**. All 37 name recordings, audio metadata, prior four-letter and
Fa/Pa approvals, and the seven older video proposals are preserved. The new
models are isolated through `ainFamilyReviewCandidates`; their geometry status
is `pendingReview`, with no invented review record.

## Verification and evidence

Final production build: **ain-family-outlines-20261006**,
`dist/assets/index-CcHSU3iK.js` and `dist/assets/index-BhPf4j4G.css`.
Tests route local requests to that saved production bundle with
`JAWI_STATIC_TEST=1`; browser runs use at most two workers.

- `npm test`: **194 passes**, 22 files; includes candidate validation, student
  exclusion, retained head/order/dots/audio and unsplit-body validation.
- `npm run build` with the build ID above: passes, including content validation
  of 37 ready lessons. Vite reports its existing large-bundle advisory; no
  dependency or build configuration changed.
- `npx playwright test tests/browser/ain-family-outlines.spec.js
  --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **29 passes, one native-font comparison skip**, no failures/flaky cases;
  results in `output/verification/ain-family-outlines/browser-final.json`.
  The scope is all three models in Jejak Ceria/guided/precision, wrong-part starts,
  interrupted head progress, separate bowl restart, every dot, preview-only saved
  results, stable fitting, demonstrations and phone/tablet/desktop layouts.
- Selected `ain-family-matches.spec.js`, `outline-review.spec.js` and
  `four-letter-outlines.spec.js`: **26 distinct checks pass**, with no unresolved
  failures or skips; current results are in `browser-regression-current.json`.
  They cover all three models in unscored Solo/Duo component previews, independent
  lanes/unique clip IDs, authored results, and existing approved outline/review
  regressions at phone and desktop sizes. The separately built match harness is
  test-only; it does not forge approval or grant scores to these proposals.
  The first run retained 13 successful, unaffected checks. Its twelve match
  cases had incorrectly expected attempt-save callbacks from unscored previews;
  the assertion was corrected to require complete boards, no saved student
  attempts and unscored results. One WebKit phone teacher check timed out waiting
  for a stable home button during that run. Only those 13 affected checks were
  rerun; raw reports remain in `browser-matches-final.json` and
  `browser-teacher-final.json`. The preservation checker verifies that every
  failed case is covered by the corresponding successful rerun.
- `node scripts/verify-ain-family-outlines.mjs`: validates the three proposals,
  checks catalogue bytes and recording hashes, preserves earlier proposals,
  checks final browser totals and fingerprints source, tests, assets, bundle,
  authoring inputs and test harness in `inputs.json`.

Chromium compares the corrected body/dots with the actual catalogue font under
one uniform transform, with a required whole-glyph ink overlap above **98.5%**.
This allows raster antialiasing/subpixel contour differences without permitting
the original bulge or rounded terminals. The side-by-side capture is
`browser-final/chromium-catalogue-before-corrected.png`.
Final stage captures are in `browser-final/` under the evidence directory.
Inspected captures include Ain at 1920×1080, Ghain's bowl restart at 320×600,
and the Chromium catalogue/original/corrected comparison. Final source is also
served by the existing local server with HTTP 200; no duplicate server was started.

The preceding `browser-first.json` records the pre-seam stage. Enlarged visual
inspection found a faint partition seam, resolved through the whole-body clip.
The Windows WebKit font-canvas comparison failed for Ghain/Nga because its
high-resolution canvas places dotted glyph marks differently from the Chromium
authoring reference; explicitly loading the glyph font did not change that
result. The diagnostic comparison is preserved in `font-check/`. Further retries
of that native comparison were stopped. Font pixel matching is therefore checked
in Chromium; WebKit's actual tracing, demonstrations, fitting and independent
lane rendering are checked separately, with that one native comparison skipped.

Physical-device input and listening were not checked. No new APK, deployment or
publication was requested. At this recorded stage, explicit approval remained
the only step before promotion. The subsequent approval and regular-game checks
are recorded in [the promotion report](AIN_FAMILY_TRACE_APPEARANCE_APPROVAL.md).
