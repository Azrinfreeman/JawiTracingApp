# Four-letter outline approval and promotion

6 October 2026, Asia/Kuala_Lumpur. The owner replied **“yes I approve”** to the
explicit request to approve **Dal 3, Zal 4, Ra 3 and Zai 4** for student lessons.
Reviewer: **Project owner (Codex user; name not supplied)**. The identified models
are promoted into the student catalogue and their geometry reviews reference
[the approval record](CONTENT_APPROVALS.md#approval-of-four-letter-outlines-2026-10-06).

| Letter | Earlier student revision | Approved outline revision |
| --- | ---: | ---: |
| Dal | 2 | 3 |
| Zal | 3 | 4 |
| Ra | 2 | 3 |
| Zai | 3 | 4 |

The approved versions are the exact reviewed candidates from
[implementation verification](FOUR_LETTER_TRACE_APPEARANCE_VERIFICATION.md).
No contour, reveal piece, route, direction, checkpoint, pen-lift policy, dot target,
movement order or guide behaviour was changed during promotion. No additional
version increment was made. All other 33 catalogue entries, all audio metadata
and approvals, all 37 recording files and the seven earlier video proposals are
preserved. All **37 lessons remain student-ready**. Jejak Ceria stays the default.

Students can use **Jom mula → Isi kandungan → Dal / Zal / Ra / Zai**. Teacher
content rows show their approved revisions. The four obsolete outline proposals
disappear from **Bentuk Isi kandungan**; the seven **Langkah video** proposals
retain their independent pending review. Older saved attempts retain their
original revisions and do not mark the newly approved revision complete.

This records the owner's actual approval. No named teacher assessment,
physical-device pupil review or new audio approval is inferred.

## Verification

The complete [pre-approval catalogue](../output/verification/four-letter-approval/before-catalogue.json)
was saved before promotion. Its byte hash matches the preceding implementation
fingerprint. The genuine four earlier entries also form
[a bounded test fixture](../tests/fixtures/four-letter-originals.json), so pending
candidate validation still has a historical baseline after promotion.

`node scripts/verify-four-letter-approval.mjs` compares the current catalogue to
the four exact reviewed candidates plus the recorded approval metadata. It verifies
all 33 unaffected entries, every audio object, every recording hash, student
readiness and removal of obsolete proposals. It records final source/test/bundle,
font, harness, package/config and recording hashes in
[approval inputs](../output/verification/four-letter-approval/inputs.json).
The existing authoring/font audit remains applicable: the reviewed outline file
and bundled font bytes are unchanged. Its four ink-overlap scores exceed 0.995.

| Check | Scope | Result |
| --- | --- | --- |
| `npm test` | Current catalogue/source; pending validation from the historical fixture; approved student readiness and old/new completion revisions | **181 tests / 20 files passed**. |
| `VITE_BUILD_ID=four-letter-approved-20261006 npm run build` | Content validation and production bundle | Pass: **37 models / 37 student-ready lessons**. Assets `index-WOozwIdu.js`, `index-DSx9W6Tg.css`. |
| `node scripts/build-outline-test-harness.mjs` with `JAWI_OUTLINE_HARNESS_DIR=output/verification/four-letter-approval` | Separate test-only harness using approved letters and scoring callbacks | Pass. Prior implementation harness/evidence are preserved. |
| `node scripts/verify-four-letter-approval.mjs` | Exact promotion, approvals, unrelated models/proposals, recordings and input fingerprints | Pass. |

The affected current browser command is:

```text
npx playwright test tests/browser/four-letter-outlines.spec.js tests/browser/outline-matches.spec.js tests/browser/outline-review.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json --output=tmp/outline-approval-final
```

**70 passed / 4 documented skips, zero failures** on the approved production
bundle: 37 Chromium passes; 33 WebKit passes and 4 CDP-only native-touch skips.
See [the browser report](../output/verification/four-letter-approval/browser-final.json).
This verifies actual student entry in all three modes, all four newly approved
saved attempt revisions, required dots, touch cancellation/recovery, browser pen,
demonstrations, copying, four-viewport shape/marker layouts, teacher approval rows
and removal of obsolete proposals. Approved Solo/Duo component checks confirm
independent lanes and scoring callbacks with the identified approved revisions.

Browsers use the checked production bundle through the existing sandbox fallback,
with `JAWI_STATIC_TEST=1`, the existing Windows browser cache and at most two workers.
`JAWI_EVIDENCE_DIR` and `JAWI_OUTLINE_HARNESS_DIR` point to
`output/verification/four-letter-approval`, preserving the earlier pending-stage
captures, harness and reports. Representative approved student captures were
inspected: [Dal phone](../output/verification/four-letter-approval/browser/Dal-start-320x600.png)
and [Zai tablet](../output/verification/four-letter-approval/browser/Zai-start-768x1024.png).
The existing local game and its catalogue source returned HTTP 200 with the new
approval reference. Refreshing the game loads the approved student catalogue.

The affected older glyph width/demonstration assertions now distinguish stroked
models from exact-outline models. Their four-letter Chromium/WebKit selection
also passes: **16 cases, zero failures** on the same approved bundle:

```text
npx playwright test tests/browser/glyph-matched.spec.js --grep '(dal|zal|ra|zai) play: every stroke|(dal|zal|ra|zai): the demonstration' --project=chromium --project=webkit --workers=2 --reporter=line,json --output=tmp/outline-approval-glyph
```

[The glyph regression report](../output/verification/four-letter-approval/glyph-regressions.json)
covers approved-model adult preview completion and full demonstrations. The two
selections total **86 distinct browser passes and 4 documented skips**, with no
unresolved failures. The final source diff passes CRLF-aware `git diff --check`,
and affected current documents have no missing local Markdown-link targets.

The initial unit run exposed an earlier glyph test that assumed the 4 October
redraw was each letter's only later revision. It now explicitly accounts for the
four additional reviewed outline revisions, while preserving its recording and
geometry assertions. The repeated unit suite passes; no app geometry was altered
to satisfy that historical expectation.

## Limits

The Solo/Duo harness uses actual match components and approved letter data, with
fake audio and recorded scoring callbacks. It checks model rendering, independent
lanes and the approved revision used for scoring; it does not verify real speech
playback or a physical Duo touch-screen gate. Browser pen is synthetic; native
emulated touch uses Chromium CDP. Physical tablet/pen behaviour, listening and
perceived latency retain the preceding verification limits.

No APK, Android sync, deployment, commit or push was requested or made. The
local development game remains the testing route; existing packaged releases
do not receive these changes automatically.
