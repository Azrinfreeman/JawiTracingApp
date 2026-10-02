# Zal, Zai, Syin, Sad and Dad — implementation and review

Implemented on 2 October 2026 after the user authorised the next group of five
tracing models. The user subsequently wrote **“approve”** after the implementation
and review notes. **All five are now approved at their existing revision 2.**

The catalogue now contains 37 entries, 22 approved student lessons and 15 entries
without a tracing model. All 37 approved name recordings and the previous 17
model approvals are preserved. See
[the second-batch approval record](CONTENT_APPROVALS.md#approval-of-second-additional-batch-2026-10-02).

## Try the five models

1. Open the game at http://127.0.0.1:5173.
2. Choose **Jom mula → Huruf tersedia**.
3. Choose **Zal**, **Zai**, **Syin**, **Sad** or **Dad**.
4. Press **Tunjuk cara**, then try tracing the numbered body parts and each dot.
   Jejak Ceria remains the default. Select **Jenis latihan** in the teacher screen
   first to try Berpandu or Kurang panduan.
5. **Buka pratonton dewasa → Model tersedia** shows all 22 authored models.
   **Tamatkan pratonton** returns to the 22 approved student lessons.
   Individual **Buka** buttons in the teacher table also open the approved models.

![Approved models in the teacher table](../output/screenshots/letter-batch-2-approved-teacher-1280.png)

## Approved shapes and sequence

| Model | Body | Required dots after the body | Numbered guidance |
| --- | --- | --- | --- |
| Zal (ذ) | The approved Dal path: start near the upper left, curve to the lower right, sweep left | One dot above the body | Body 1–3; dot 4 |
| Zai (ز) | The approved Ra path: start upper right, curve down and left | One dot above the upper end | Body 1–3; dot 4 |
| Syin (ش) | The approved Sin path: follow the teeth from right to left, then the lower bowl | Upper right, upper left, then the highest central dot | Body 1–3; dots 4–6 |
| Sad (ص) | First trace the closed head loop, lift, then trace the tooth and bowl | None | Head 1–3; bowl 4–6; 6 is Siap |
| Dad (ض) | The same head loop and bowl as Sad, with a lift between them | One dot above the head loop | Head 1–3; bowl 4–6; dot 7 |

Sad and Dad share two original SVG centrelines. The head starts at its lower-left
join, curves up and right around the loop, and returns to that join. The second
movement starts at the join, forms the short tooth and sweeps down and left
around the bowl. Its endpoint is the raised left end of the bowl. This split
provides a deliberate lift and clear steps. The project owner approved the
existing shapes and sequence at revision 2.

The closed loop shares its start and stop position. As with the existing Mim
model, only one number badge occupies that position at a time: 1 initially and
3 after passing the middle. On release, the bowl begins with 4 at the join.
Only the active movement or dot displays numbered guides.

The character identities were checked against the
[Unicode Arabic chart](https://www.unicode.org/charts/PDF/U0600.pdf): Zal U+0630,
Zai U+0632, Syin U+0634, Sad U+0635 and Dad U+0636. Unicode reference glyphs allow
stylistic variation and do not prescribe a handwriting sequence. These routes
have project-owner approval; no official KPM stroke order is claimed.
Font glyphs remain separate visual references rather than tracing outlines.

## Preserved behaviour and content

- Preschool tracing still fills only accepted forward progress, pauses on
  deviation and allows recovery without erasing accepted work.
- Each dot remains a separate contained press-and-release action. Jejak Ceria's
  large Tambah titik button can add one required dot per action.
- Sad cannot complete after its head alone. Dad also needs the bowl and its dot;
  Syin requires all three dots. A demonstration cannot record completion.
- Student entry, catalogue access and next-letter navigation include these
  approved models. Sin continues to Syin, and Syin continues to Sad.
- Initial authoring advanced the five empty revision-1 entries to draft revision 2.
  Approval subsequently changes only `geometry.status` to `approved` and records
  the real reviewer, date, revision and approval reference. Content stays at 2.
- The 32 other catalogue entries remain identical to the pre-approval snapshot,
  including existing model approvals, paths, versions and audio metadata.
- All 37 recording hashes match the approved recordings. No audio was generated
  or replaced. Existing tolerance profiles and tracing-engine code are unchanged.
- The reward leaf sits in the lower corner, and number-label placement keeps
  that corner clear. This resolves a
  phone-layout clash on Syin's highest dot without moving its target or changing
  the accepted tracing movements.

## Implementation verification before approval

Content validation, the production build and all 59 unit checks passed.
Forty new Chromium/WebKit browser cases passed, with two Chromium-CDP-only touch
cases skipped in WebKit. Eight existing entry/approval/navigation cases also
passed. After correcting the reward placement, 14 focused layout/guide cases
passed, including rechecks of the new loops and layouts, all five earlier batch
models and all 12 original models. Across these runs, 58 distinct browser cases
passed. The browser suite covers all five models in Jejak Ceria, Berpandu and Kurang
panduan, every required dot, ordered head/bowl input, shared loop numbering,
adult-only access and separate student/adult next-letter navigation.

Phone and tablet checks exercise every stroke and dot stage at widths 320 and
768 pixels. Native Chromium emulated touch exercises Dad's loop, bowl and dot
at both sizes. The corresponding WebKit CDP cases are skipped because that input
mechanism is Chromium-specific. Firefox retains its recorded Windows launch
limitation. Physical pupil/device review has not been performed.

Production captures use the actual lesson board and teacher review cards.
The production report compares preserved catalogue metadata and approved audio
hashes, traces all five models and checks responsive review layouts and the
student readiness gate. It captures 39 screenshots and records no horizontal
overflow, page errors or external runtime requests. Number-guide layout checks
also verify that badges and labels are not covered by the reward decoration.

Evidence:

- [Production checks and captures](../output/verification/letter-batch-2-production.json)
- [Pre-batch catalogue](../output/verification/letter-batch-2-before.json)
- [Verification summary](../output/verification/letter-batch-2-summary.json)
- [Phone: Sad head loop](../output/screenshots/letter-batch-2-sad-stroke-1-320.png)
- [Phone: Sad bowl](../output/screenshots/letter-batch-2-sad-stroke-2-320.png)
- [Phone: Dad's required final dot](../output/screenshots/letter-batch-2-dad-dot-1-320.png)
- [Tablet: Syin's three-dot stage](../output/screenshots/letter-batch-2-syin-dot-1-768.png)

## Verification after approval

Content validation, the production build and all 59 unit checks passed with
22 student-ready lessons. Eighteen focused Chromium/WebKit browser cases passed:
all five new letters complete in student play, require each body/dot movement
and save approved revision-2 records with `preview: false`. The catalogue shows
22 available lessons and 15 unavailable models; teacher review has no authored
drafts. Sin → Syin and Syin → Sad navigation, approved Ba student saves, adult
preview access and audio failure handling also passed.

The production Chromium check compares the pre-approval catalogue: only the
five approval statuses and review records changed. All 32 other entries,
paths, dots, sequences, versions and 37 approved audio hashes are preserved.
It completes all five as a student and captures phone/tablet catalogues and
teacher approval rows, with no page errors, overflow or external runtime requests.

See [the approval verification](../output/verification/letter-batch-2-approval.json)
and [the pre-approval catalogue](../output/verification/letter-batch-2-approval-before.json).
The earlier reports above retain the initial draft-stage checks and screenshots.

Repeat current checks with:

```sh
npm test
npm run build
npm run test:browser -- tests/browser/letter-batch-2.spec.js --project=chromium --project=webkit --workers=2
# With production preview running on port 4173:
node scripts/verify-letter-batch-2-approval.js
```

## What to review

Check Sad/Dad's head-to-bowl proportions and the split into two movements, the
start and direction of each movement, comfortable lifting at the shared join,
and every dot's position and order. Compare the shapes with the preschool
handwriting style you want children to practise. Try Tunjuk cara, trace, and
blank copying on the intended device.

The user's explicit approval is now recorded with the actual reviewer, date,
reference and current revision. Any later path/dot/sequence edit requires a new
content revision and fresh review. Fifteen models remain to be authored.
