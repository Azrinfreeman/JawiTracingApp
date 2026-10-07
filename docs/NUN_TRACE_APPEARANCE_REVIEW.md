# Nun tracing appearance review

7 October 2026, Asia/Kuala_Lumpur. The owner reported that Nun tracing does not
match Isi kandungan. The original model uses a constant-width rounded stroke
and a circular dot; the catalogue uses Noto Naskh Arabic 400 with tapered ends,
varying bowl thickness and a diamond dot.

**Nun 3** reuses the existing catalogue-outline rendering pipeline. Static
contours are authored from the actual bundled font at 2400 pixels, with a uniform
transform into the existing Nun coordinate system. The silhouette is not scaled
separately in either direction. Its route, tracing direction, single stroke then
dot, checkpoints, touch targets and approved audio remain unchanged.

![Catalogue and Nun 3](../output/verification/nun-outline/catalogue-outline-comparison.png)

Review in **Ruang guru → Huruf → Semakan video → Bentuk Isi kandungan → Semak
Nun cadangan**. This is the only current proposal, with pending geometry review
and revision 3. Preview saves are marked preview/pending; unscored match previews
do not create student attempts. Normal lessons still use approved Nun 2.
All 37 approved catalogue entries and recordings remain byte-identical, including
Nga audio 2 and Ta/Za 6. No new geometry approval is inferred from the request.

## Verification

- `node scripts/author-nun-outline.mjs`: creates the separate Nun asset, leaving
  earlier outline assets and the approved catalogue unchanged.
- `node scripts/measure-nun-outline.mjs`: **99.62% raster ink overlap** with the
  catalogue font; **99.38% reveal-piece coverage**. The remaining raster difference
  comes from contour simplification/antialiasing; model-space contour error bound
  is 0.344 units. This is font fidelity evidence, not a teaching assessment.
- `npm test -- --reporter=json --outputFile=output/verification/nun-outline/unit.json`:
  initial 221 passes and one outdated assertion requiring all historical scopes
  to remain empty. That historical test now checks expiry of its own four approved
  entries; the new Nun test checks all six current scopes explicitly. Recheck:
  `npx vitest run tests/geometry/videoReviewApproval.test.js --reporter=json --outputFile=output/verification/nun-outline/unit-recheck.json`:
  **2 passes**. Combined: **222 distinct checks in 30 files**, 220 unchanged initial
  cases plus the two repaired cases. New checks cover isolation, identity/route/audio
  preservation, font provenance, appearance validation and stale approval rejection.
- `VITE_BUILD_ID=nun-outline-review-20261007 npm run build`: passes, including
  content validation with 37 student-ready models.
- `JAWI_OUTLINE_HARNESS_DIR=output/verification/nun-outline node scripts/build-outline-test-harness.mjs`:
  current shared match components bundled for preview verification.
- `npx playwright test tests/browser/nun-outline.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  14 initial passes; four new match cases incorrectly expected attempt callbacks
  from unscored previews. Source confirms previews deliberately suppress those
  callbacks. The tests now verify zero attempts, unscored results and completed
  lane metrics. Recheck of the same file/projects with `--grep 'unscored independent'`:
  **4 passes**. Combined **18 distinct passes**, nine per engine; no skipped cases.
  All three modes, wrong finish-start rejection, partial reveal, dot-last gate,
  pending preview saves, demonstrations preserving earned progress, normal-student
  isolation, phone/tablet/desktop fit and independent Solo/Duo preview lanes pass.
- Existing local server: HTTP 200 for the exact Nun outline proposal, base 2/
  proposed 3, using the existing server.
- `node scripts/verify-nun-outline.mjs`: validates unchanged catalogue, all 37
  audio metadata/assets, other application source, proposal provenance, build,
  measurements and combined current reports; records final input fingerprints.

Actual Chromium phone start/tablet completed letter and WebKit phone dot-stage
captures were inspected. Numbering sits beside the contour and fits the page.
Play: 320×600; guided/precision and fit: 768×1024; desktop fit: 1280×800; match
preview: 1024×768. SVG screen coordinates are recomputed after captures/scrolling.
Node 24.19.0, Playwright 1.63.0, current production static fixture. Evidence:
`output/verification/nun-outline/inputs.json` and adjacent reports/captures.

Pending: fresh owner approval of Nun 3 before promotion, as required by
[AGENTS.md](../AGENTS.md): “A geometry change needs a new content revision and
fresh review”. No named teacher assessment, physical-device touch/pen or new
native audio check is claimed. Audio is unchanged. No APK, deployment or
publication requested. Repeat checks only if affected inputs change or a new
concern appears.
