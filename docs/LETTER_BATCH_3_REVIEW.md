# Remaining 15 letter models — implementation and review

Authored on **2 October 2026**, Asia/Kuala_Lumpur, following the user's request
“lets finish the letter models”. All 37 catalogue entries now have tracing
geometry. The user subsequently wrote **“approve”** after the model review notes
and complete review-grid screenshot. **All 15 final models are approved at their
existing revision 2**, bringing the app to **37 student-ready lessons**. The other
22 model approvals and all 37 approved name recordings are preserved. See
[the approval record](CONTENT_APPROVALS.md#approval-of-final-letter-batch-2026-10-02).

## Try the models

1. Open [Taman Jawi locally](http://127.0.0.1:5173).
2. Choose **Jom mula → Huruf tersedia** and select any of the 37 letters.
3. Use **Tunjuk cara**, then follow every numbered stroke and dot. Lift at the
   end of each stroke and after every dot.
4. Jejak Ceria remains the default. To compare stricter input, select
   **Ruang guru → Jenis latihan → Berpandu** or **Kurang panduan** before opening
   a new lesson.
5. **Buka pratonton dewasa → Model tersedia** shows all 37 authored models.
   **Tamatkan pratonton → Jom mula** returns to the 37 approved student lessons.
   Individual **Buka** buttons in the teacher table also open approved models.
   Draft review cards disappear now that every model is approved.

![Draft-stage review grid shown before approval](../output/screenshots/letter-batch-3-review-1280.png)

## Authored shapes and sequence

All body movements precede dots. Numbered cues are calculated by the existing
guide module from the authored paths; they are visual landmarks, not additional
input gates. Closed loops share a start/stop position and show one number there
at a time. Each subsequent movement requires a release and new contact.

| Model | Body and direction | Dots in authored order |
| --- | --- | --- |
| Ta marbutah (ة) | Start at the oval's upper-right shoulder, curve down around its bottom, left side and top, and close the loop | Upper right, upper left |
| Ta (ط), ID `tho` | Start at the lower-left join of the head, loop up and right and return to the join, then extend the baseline left; lift and draw the upright from top to baseline | None |
| Za (ظ) | Same two body movements as Ta (ط) | One above the head, to the right of the upright |
| Ain (ع) | Open upper head from right to left and back right; continue diagonally down-left into the large lower curve, finishing at its raised right end | None |
| Ghain (غ) | Same continuous Ain body | One above the upper head |
| Nga (ڠ) | Same continuous Ain body | Upper right, upper left, highest centre |
| Fa (ف) | Close the small head from its lower join, travelling left, over the top and down its right side; lift and trace the shallow bowl from the join towards the left | One above the head |
| Pa (ڤ) | Same head and shallow bowl as Fa | Upper right, upper left, highest centre |
| Qaf (ق) | Same closed head as Fa; lift and trace a distinct deeper bowl towards the left | Upper right, upper left |
| Ga (ڬ) | Existing Kaf body and inner mark, in their existing order | One above the inner mark |
| Va (ۏ) | Existing continuous Wau head and descending leftward tail | One above the head |
| Ha (ه) | Same closed oval as Ta marbutah, without dots; distinct from the approved open Ha (ح) model | None |
| Hamzah (ء) | Open small upper curve, diagonally down-left, then finish the lower baseline towards the right | None |
| Ye (ى) | Existing Ya body, without Ya's two lower dots | None |
| Nya (ڽ) | Existing Nun bowl | Upper right, upper left, highest centre |

Fa, Pa and Qaf use a smooth oval head with its start/stop at the lower join.
Their final authoring revision replaces an earlier development loop with a small
upper kink. Fa/Pa have a shallow bowl; Qaf has a deeper, longer bowl.

Character identities were checked against the
[Unicode Arabic chart](https://www.unicode.org/charts/PDF/U0600.pdf): Ta marbutah
U+0629, Ta U+0637, Za U+0638, Ain U+0639, Ghain U+063A, Nga U+06A0, Fa U+0641,
Pa U+06A4, Qaf U+0642, Ga U+06AC, Va U+06CF, Ha U+0647, Hamzah U+0621,
Ye U+0649 and Nya U+06BD. The chart identifies characters and reference glyphs;
it does not prescribe handwriting direction or sequence. These SVG centrelines
have project-owner approval, not an official KPM handwriting-standard claim.

## Preservation and review

During initial authoring, only the 15 previously empty entries' geometry and
content versions changed.
Their revisions advanced from 1 to 2, with `geometry.status: pendingReview` and
`geometry.review: null`. The other 22 entries, including paths, dots, movement
order, revisions and approvals, remain identical to the pre-authoring snapshot.
All audio metadata and recording bytes are unchanged. No tolerance, input,
storage, demonstration or student-readiness rules were changed.

The owner approved the identified revision-2 models. For teacher and physical
review, check each isolated form, proportions, start, direction, pen lifts and dot
positions/order against the desired preschool handwriting style. In particular,
compare Ta marbutah/Ha (ه)/Ha (ح), Fa/Pa/Qaf bowl depth, Ain/Ghain/Nga,
Ga's mark, standalone Hamzah and Ye/Ya. Try tracing and blank copying on the
intended device. The project-owner reviewer, date, reference and reviewed
revision are recorded separately in CONTENT_APPROVALS.md. No named teacher or
pupil assessment is claimed.

The initial draft-stage completions recorded `preview: true`, content revision 2
and pending geometry; those historical records retain their original status.
Approval changed only the 15 geometry statuses and review metadata, without
altering paths, dots, sequences, content versions or audio. Student completions
now record `preview: false`, approved geometry and the same content revision 2.
All 37 letters are included in student entry and next-letter navigation. Later
geometry changes need a new content revision and fresh review.

## Engineering verification before approval

Content validation and the production build pass with **37 authored models and
22 student-ready lessons**. All **59 unit checks** pass on the final geometry.
Across the initial run and affected rechecks, **116 distinct Chromium/WebKit
browser cases pass**. Four WebKit native-touch cases skip because they use
Chromium CDP. No application, guide, input or tolerance change was needed.

The checks cover all 15 models in Jejak Ceria, Berpandu and Kurang panduan,
every movement and dot, closed-loop numbering, adult/student access, saved
pending revision-2 preview records and adult navigation through Ye/Nya and
back to Alif. Every new stroke/dot stage was checked at widths 320 and 768;
guides are contained, their labels do not overlap, badge diameters are at least
36 CSS pixels and the reward does not cover them. Chromium native emulated
touch completes Nga and Qaf, including every on-board dot, at both sizes.

Existing student entry, approved next-letter navigation and all 12 original
models' initial phone/tablet guide layouts also pass. The existing audio-failure
case passes with the current 37-model adult catalogue.

The first run had six test failures: two selectors omitted the disabled cards'
accessible-name suffix, and four layout checks measured the reward SVG after
a completed stroke. Corrected selectors measure the actual card and tracing
board. A regression check's historical count of 15 missing adult-preview models
was also updated to the current inventory. All affected checks then passed.
Fa, Pa and Qaf's final smooth head loop was rechecked in all three modes in
both browsers after the initial development captures.

The focused final recheck report is
[saved here](../output/verification/letter-batch-3-final-rechecks.json), and
[per-model input fingerprints](../output/verification/letter-batch-3-model-inputs.json)
identify the final geometry. The
[production report](../output/verification/letter-batch-3-production.json)
completes all 15 drafts in Chromium and records **62 screenshots** at desktop,
phone and tablet sizes. It verifies all 22 other entries and all 37 approved
recording hashes against the pre-authoring snapshots, with zero missing models,
page errors, horizontal overflow or external runtime requests. The 22 approved
student lessons remain available and the 15 new drafts remain gated.

Visual inspection covered the full 15-model desktop review grid and phone review
cards, phone Qaf head/Nga final dot/Ga inner mark/Hamzah, and tablet Ta marbutah
dot/Qaf bowl states. Paths and numbering are visible and the reward stays clear
of the active cues. The
[verification summary](../output/verification/letter-batch-3-summary.json)
records commands, scope, results and final inputs; historical earlier-batch
reports retain their original catalogue stages.

Recorded runtime limits remain: Firefox on this Windows host failed to launch;
Chromium-CDP touch cannot establish WebKit touch; physical pupils, stylus input,
iPad Safari and Android Chrome have not been assessed.

## Verification after approval

The checked build and all 59 unit checks pass with **37 student-ready lessons**.
Sixty focused Chromium/WebKit cases pass across the two selected runs. All 15
final models complete in student Jejak Ceria, require every body/dot movement
and save approved revision-2 attempts with `preview: false`. The catalogue shows
37 enabled lessons and zero unavailable entries; teacher review has no authored
drafts. Student Ye → Nya → Alif navigation, earlier approved models, approved Ba
saves, adult-preview access, the launch flow, mobile review labels and audio
failure handling also pass.

See [the main browser run](../output/verification/letter-batch-3-approval-browser.json)
and [entry/approval regressions](../output/verification/letter-batch-3-approval-entry.json).
The initial authoring reports above retain their original draft-stage scope.

The production Chromium check compares the pre-approval catalogue: only the
15 geometry statuses and review records changed. All 22 other entries, every
path, dot, sequence, content revision and all 37 recording hashes are preserved.
It completes all 15 newly approved letters as a student and verifies each
next-letter transition, including Nya → Alif. Four phone/tablet catalogue and
teacher approval captures show 37 ready lessons, with zero page errors,
horizontal overflow or external runtime requests. The phone/tablet catalogues
and teacher count capture were visually inspected.

See [the approval production report](../output/verification/letter-batch-3-approval.json)
and [the pre-approval catalogue](../output/verification/letter-batch-3-approval-before.json).
The [approval verification summary](../output/verification/letter-batch-3-approval-summary.json)
records the commands, check scopes, runtime and final input fingerprints.
Teacher and physical pupil/device assessment remains unperformed. The older
116-case/62-capture reports above describe the initial authoring stage and are
not the evidence for this metadata approval.

Relevant commands:

```sh
npm test
npm run build
npm run test:browser -- tests/browser/letter-batch-3.spec.js --project=chromium --project=webkit --workers=2
# With the checked production preview running on port 4173:
node scripts/verify-letter-batch-3-approval.js
```
