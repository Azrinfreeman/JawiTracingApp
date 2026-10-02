# Sa, Jim, Ca, Ha and Kha — implementation and review

Implemented on 2 October 2026 after the user authorised the first group of five
additional handwriting models. The user subsequently wrote **“approve”**, so
all five models are approved at their existing content revision 2. The app now
contains 17 approved student lessons. Twenty catalogue entries still have no
tracing model. See [the approval record](CONTENT_APPROVALS.md#approval-of-first-additional-batch-2026-10-02).

## Open the review

1. Open the local game at http://127.0.0.1:5173.
2. Choose **Jom mula → Huruf tersedia** to see all 17 approved lessons.
3. Choose **Sa**, **Jim**, **Ca**, **Ha (ح)** or **Kha**.
4. Press **Tunjuk cara**, then trace the body and each dot. The default is
   Jejak Ceria; select **Jenis latihan** in the teacher screen first to try
   Berpandu or Kurang panduan.
5. For the complete preview catalogue, choose **Buka pratonton dewasa →
   Model tersedia**. It contains 17 models. **Tamatkan pratonton** returns to
   the 17 approved student lessons. The five original draft-review cards are
   no longer shown; use **Ruang guru → Kandungan & semakan → Buka** for adult review.

The following screenshot records their initial draft review before approval:

![The five authored models in their initial teacher review](../output/screenshots/letter-batch-1-review-1280.png)

## Shapes and proposed writing order

Each body is an original, continuous SVG centreline on the existing 1000 × 1000
board. Sa reuses the approved Ta bowl. The other four share one open-bowl body,
with different dot targets. Font glyphs remain a separate visual comparison;
font outlines have not been converted into tracing routes.

| Model | Proposed body movement | Required dots after lifting | Numbers |
| --- | --- | --- | --- |
| Sa (ث) | Start at the right of the bowl, sweep down and left, finish at the left | Upper right, upper left, then the highest central dot | Body 1–3; dots 4–6 |
| Jim (ج) | Start at the upper left, move across the head to the right, sweep down and left around the bowl, finish at the lower right | One dot inside the bowl | Body 1–3; dot 4 |
| Ca (چ) | Same body as Jim | Two upper inner dots, right then left, followed by the lower central inner dot | Body 1–3; dots 4–6 |
| Ha (ح) | Same body as Jim | No dots | Body 1–3; 3 is Siap |
| Kha (خ) | Same body as Jim | One dot above the head | Body 1–3; dot 4 |

This Ha model is **ح**, catalogue ID `ha-pedat`. The separate **ه** model remains
unauthored. These authored paths and dot order were approved by the project owner;
they have not been established as an official KPM writing sequence.

The codepoint mapping is consistent with the
[Unicode Arabic chart](https://www.unicode.org/charts/PDF/U0600.pdf): Sa U+062B,
Jim U+062C, Ha U+062D, Kha U+062E and Ca U+0686. Unicode reference glyphs identify
characters and permit variations in style; they do not prescribe handwriting
stroke order. DBP's use of the Malay name **sa (ث)** can be checked in
[PRPM's guidance on “th”](https://prpm.dbp.gov.my/Cari1?d=175768&keyword=th).

## Initial authoring changes, before approval

- Existing numbered guides automatically show Mula → Ikut → Henti, then the
  separately numbered dots. The final required action is labelled Siap.
- Dots remain separate press-and-release actions. Jejak Ceria retains the large
  Tambah titik button. Missing dots cannot produce completion.
- The teacher screen shows the actual authored shapes in five review cards.
  Draft lessons and preview cards display **Draf · perlu semakan**.
- Adult preview's next-letter action can continue through all authored models,
  including Sa → Jim → Ca → Ha → Kha. Student navigation uses approved lessons.
- Each new model advances from content revision 1 (empty) to revision 2 (draft),
  with `geometry.status: pendingReview` and `geometry.review: null`.
- All 32 other catalogue entries and all audio metadata are unchanged. All 37
  active recording files match their approved hashes. No new audio was generated.
- The preschool assistance, strict tracing rules, tolerance profiles, copying
  board and approval gate have not been changed.

## Checks completed before approval

The production build and all 59 unit checks passed. The batch's browser suite
passed 38 cases in Chromium and WebKit, including all five models in all three
practice modes, required dot completion, draft-only access and next-letter
navigation. Initial body guides and every dot stage passed readability and
containment checks at 320 and 768 pixels. Chromium native emulated touch completed
Ca at both sizes using three separate dot-pad actions. The two corresponding
WebKit CDP cases were skipped because that input mechanism is Chromium-specific.

The production check traced all five models and captured 33 review, body, dot and
completion screenshots. It found no page errors, horizontal overflow or external
runtime requests. Metadata comparison confirmed 32 preserved entries, 37
unchanged approved recording files and 12 student-ready lessons.

These are browser and content-integrity checks. They do not approve the new
handwriting style or demonstrate a physical preschool pupil/device review.

Thirty existing Chromium/WebKit regression cases also passed, covering student
Ba completion, catalogue access, audio failure reporting, numbered guide layouts
for all 12 original models, demonstrations, copying, strict recovery, storage
and responsive navigation. In total, 68 browser cases passed for this change.
Firefox was not rerun because of the recorded Windows launch limitation.

Useful evidence:

- [Production verification report](../output/verification/letter-batch-1-production.json)
- [Implementation verification summary](../output/verification/letter-batch-1-summary.json)
- [Phone: Ca body and numbered route](../output/screenshots/letter-batch-1-ca-start-320.png)
- [Phone: Ca's final required dot](../output/screenshots/letter-batch-1-ca-dot-3-320.png)
- [Tablet: Kha's body and top dot](../output/screenshots/letter-batch-1-kha-start-768.png)
- [Catalogue before this batch](../output/verification/letter-batch-1-before.json)

To repeat the checks:

```sh
npm test
npm run build
npm run test:browser -- tests/browser/letter-batch-1.spec.js --project=chromium --project=webkit --workers=2
# Current approval check, with production preview running on port 4173:
node scripts/verify-letter-batch-1-approval.js
```

## Approval and later review

Approval records the user's explicit **“approve”** message after the five-model
implementation was delivered. It changes only their geometry status/review
metadata. All paths, dot locations, sequences, content/audio revisions, recording
files and the 32 other entries remain unchanged. Student entry now defaults to
all approved models. The original 12 remain under Huruf permulaan.

The production approval evidence is saved in
[letter-batch-1-approval.json](../output/verification/letter-batch-1-approval.json).
The earlier draft reports and screenshots above retain their original scope.

Check the isolated shape and head-to-bowl proportions, the proposed starting
point/direction, each dot's number and position, the separate lifts, and how
comfortable the activity feels on the intended device. In particular, compare
the open bowl with the handwriting style you want children to practise.

Any requested geometry correction must increment `contentVersion` and remain
pending until reviewed again. Approval must record the actual reviewer, date,
reference and current revision. Approval here comes from the later explicit
“approve” message. The remaining 20 models can be authored in later groups.
