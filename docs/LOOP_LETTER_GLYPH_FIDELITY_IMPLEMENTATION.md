# Qaf, Fa, Pa, Hamzah and the other redrawn letters: match the catalogue letter in the game

**Prepared:** 4 October 2026, Asia/Kuala_Lumpur.  
**Status:** Implemented on 4 October 2026 after the user's “proceed”, at the recommended
defaults (the optional silhouette was not added); see
[delivery and verification](GLYPH_MATCHED_TRACING_MODELS_VERIFICATION.md). The text below is the
proposal as authorised and is preserved as written.  
**Request:** Qaf, Fa and Pa look weird in the tracing game and are not the same as in
**Isi kandungan**. Make them exactly the same, or almost the same if there is a technical
limit. Provide this document first. Later messages added **Hamzah**, then **Wau, Va, Ha (ه), Ha (ح), Ca and Kha**, whose shapes also looked wrong.

## What was checked

The three letters were rendered the way the game draws them and beside the catalogue glyph
(`docs/references/qaf-fa-pa-fidelity-audit-2026-10-04.png`: Jejak Ceria guide width 76, the
authored width 44, and the catalogue form). The font's own stroke weight was measured
along its centreline, and the enclosed counters (the holes inside loops) of the catalogue
glyph were compared with the counters left by the model at both widths.

| Finding | Evidence |
| --- | --- |
| **Qaf's head loop is broken.** | `qaf` stroke 1 spans only 97 × 163 units and doubles back on itself at both ends. The catalogue head is a full oval about twice as wide. At 44 it draws a hook, not a loop; at 76 the counter disappears entirely. |
| **Fa and Pa heads are generic circles.** | Both use the same circle (610–789 × 355–525) joined to the base at one point. The catalogue head is a slanted oval that flows into the tail. |
| **The game guide is much heavier than the letter.** | Jejak Ceria draws the route at width 76 ([TraceBoard.jsx](../src/components/TraceBoard.jsx)). The catalogue stroke is about 42–45 units thick, which matches the authored width 44. |
| **Heavy width closes small loops.** | At 76 the remaining counter is 86% of the font's for Fa/Pa, 46–48% for Ta marbutah, Wau and Va, 31–37% for Ha (ه), and 0% for Qaf. At 44 it is close to the font's, except Fa/Pa (150%, circle too large). |
| **Hamzah.** | The Z-shaped Hamzah you captured is the **earlier** model (revision 2, approved), shown while the original catalogue was restored temporarily for a regression baseline. The current revision 3 redraw follows the catalogue letter (a curled arch ending in a flat sweep) and is pending review, but at the game's width 76 its arch is almost filled in, so it still reads as a blob rather than the small curled ء. It needs the same width and gate treatment. |
| **Wau, Va, Ha (ه), Ha (ح), Ca, Kha.** | The captures you sent (plain ring for Ha ه, a loop with a long tail for Wau and Va, a Z-like body for Kha) are the **earlier approved models**, shown while the original catalogue was restored temporarily. Their revision 2–3 redraws follow the catalogue letters and are pending review. At the game's width 76, though, the loops of Wau, Va and Ha (ه) are mostly filled (counters at 31–48% of the font's), and the Jim family (Ha ح, Ca, Kha) is much heavier than the font stroke, so the redraws still do not read like the cards. |
| **Why the earlier check passed Qaf.** | The audit gate measured mean distance, stray and uncovered ink. A shrunken, doubled-back loop still lies over catalogue ink, so it scored 0.9 / 0% / 18%. The gate cannot see missing loops or lost counters. |

Counter retention (font counter area ÷ model counter area at the game's width 76) for every
letter with a loop is in the JSON above. Sad and Dad (76% at width 76) are acceptable and out
of scope. Tho and Za have no closed counter at either width because their loop is open at the
stem foot; the new gate will report them, and they are already pending review.

### Root causes

0. **The play guide is far heavier than the small, open shapes it traces**: this alone makes the
   current Hamzah redraw read poorly even though its centreline is correct.
1. **My Qaf trace used wrong coordinates** for the head loop. This is a defect in the earlier
   redraw, not a design choice.
2. **Fa and Pa were never redrawn.** They passed the audit numerically ("Match") but not
   visually, and the audit tier note ("only stroke weight and dot style differ") was too
   generous for the head.
3. **Display width 76 is independent of the letter.** It suits open bowls but fills loops.
4. **The acceptance gate has no loop or counter check.**

A single-width pen cannot reproduce the font's thick-and-thin taper. With the fixes below the
centreline, proportions, loop size and stroke weight match the catalogue form; the taper would
remain slightly different unless the optional silhouette in decision 3 is added.

## Seeing every letter now

Adult preview already opens all 37 models, including the 27 awaiting review, without changing
any approval:

1. On the dev server (`http://127.0.0.1:5173`) press **Ruang guru → Buka pratonton dewasa**.
2. Choose **Model tersedia**. The page shows all 37 cards ("37 huruf untuk dikenali"); the banner
   reads "27 draf untuk semakan".
3. Cards marked **Buka halaman** are approved and available to pupils (10 now). Cards marked
   **Draf · perlu semakan** are the unreviewed revisions; press any card to trace it.
4. Set **Ruang guru → Jenis latihan** first to review a letter in Berpandu or Kurang panduan.

The reference sheet for all 25 redrawn letters is
[glyph-matched-models-review-2026-10-04.png](references/glyph-matched-models-review-2026-10-04.png).
This plan does not change who can see a letter: pupils still see only approved lessons, and
nothing becomes approved until you say so.

## Decisions needed before implementation

1. **Scope.** Recommended: Qaf, Fa, Pa, Hamzah, Wau, Va, Ha (ه), Ha (ح), Ca and Kha, as requested,
   with the strengthened gate and width fix applied to all 25 redrawn letters so no other redraw
   is left looking like these. Any letter the gate or your review rejects is retraced. Of the
   named letters only Fa and Pa are approved; the 25 redrawn letters are already unreviewed, so
   this costs no further review for them. Sad, Dad and
   the other approved letters are unchanged.
2. **Fa and Pa leave the student pool until reviewed.** They are approved at revision 2;
   a new shape needs revision 3 and fresh review. The student pool would drop from 10 to 8
   lessons. The alternative (width fix only) leaves the circle head, which is what you
   called weird. Nothing is approved on your behalf.
3. **Exact appearance (optional second stage).** For an identical outline, store a
   pre-computed silhouette of the catalogue glyph beside each affected model, aligned to its
   centreline. The game would fill that silhouette as the guide and clip the green progress
   fill to it, while the matcher keeps using the centreline. It adds a field, renderer and
   validator changes, and it must be reviewed with the letters. Recommended only if, after
   the first stage, the letters still look different to you. Reply **include silhouette** to
   add it.

## Design

1. **Strengthen the gate first.** Extend `scripts/compare-model-to-glyph.mjs` with:
   - *Shape coverage:* the 95th-percentile distance from the catalogue centreline to the
     model must be ≤ 6% of the box, so a missing or shrunken loop fails.
   - *Silhouette overlap:* the model stroked at the game's width must overlap the catalogue ink
     with an intersection-over-union above a floor set from the approved, unchanged letters' own
     scores. This catches open shapes such as Hamzah, Ain and Nga whose mouth fills in.
   - *Counters:* the number of enclosed counters must equal the catalogue's, and each must
     keep 70–130% of its area when the model is stroked at the width the game draws.
   Keep the earlier numbers. Run the gate on all 25 letters already redrawn and on Fa and Pa
   before editing; fix any further failure it reveals (Tho and Za are expected, Qaf certain).
2. **Retrace Qaf, Fa and Pa from the catalogue centreline** (Hamzah's centreline is already
   traced; retrace it only if the stronger gate or your review of its overlay rejects it) with
   `scripts/trace-glyph-centreline.mjs`. Keep each letter's structure: stroke 1 the head loop,
   stroke 2 the tail, then the dots. Keep dot count and order, dot style, tap-only policy and
   tolerances. The head follows the font's slanted oval and joins the tail where the font does.
   Add a check to the tracing tool that rejects a stroke whose bounding box is less than 70% of
   the catalogue part it traces, and print via-point snap distances above 15 units.
3. **Authored display width.** Add an optional per-stroke `displayWidth` to
   `src/content/letters.json` (validator: finite, 30–76, default 76). The tool chooses the
   largest value ≤ 76 and ≥ 44 that keeps every counter at ≥ 85% of the catalogue's. The play
   guide, active route and green progress fill use it, so filled progress cannot overspill.
   Guided corridor, precision guide, matcher radii, start/end radii and tolerances are not
   changed, so no letter becomes harder to complete. Letters without the field are
   byte-identical and unchanged.
4. **Single source of truth.** Keep `letters.json` and its validator authoritative. No font
   is read at runtime and no tolerance is broadened.
5. **Optional silhouette (decision 3).** Generate `outline` per letter from the same
   centreline transform, validate it as a path, show it in play mode as the guide and in other
   modes as a faint backdrop, and clip progress fill to it.

**Acceptance for each of the ten named letters (all required; the other redrawn letters must pass the numbers):** the existing numbers (mean distance
≤ 3.5%, stray ≤ 30%, uncovered ≤ 35%, aspect within 20%, identical dot count) plus the two
new checks; a side-by-side of catalogue card, **Kenal huruf** help and the Jejak Ceria screen
at 390 × 844, 768 × 1024, 1024 × 768 and 1920 × 1080 in which the loop, counter, tail and dots
read as the same letter; and your visual approval. The numbers are an engineering gate, not
a replacement for your review.

## Content revision and review

Qaf and Hamzah are unreviewed at revision 3 (Hamzah's approved revision 2 is historical); their corrected shapes stay revision 3 because no review has
been recorded against them. Fa and Pa move from approved revision 2 to revision 3 with geometry
`pendingReview` and no current-geometry review metadata. Historical approvals, all name
recordings, recording versions and audio approvals are preserved. Record the actual reviewer,
date, scope and revision when you approve; project-owner approval is labelled as such and no
teacher assessment is invented. **Proceed** authorises implementation, not approval of
drawings that have not been produced. Existing attempts and copies keep their revisions, and
an earlier Fa/Pa completion must not complete revision 3.

## Planned work after authorisation

| File/area | Purpose |
| --- | --- |
| `scripts/compare-model-to-glyph.mjs` | Add shape-coverage and counter checks; write before/after metrics. |
| `scripts/trace-glyph-centreline.mjs`, `scripts/glyph-trace-plan.json` | Retrace Qaf, Fa, Pa (Hamzah if needed); bounding-box and snap warnings; width suggestion. |
| `src/content/letters.json`, `src/content/validateContent.js` | New Qaf/Fa/Pa geometry, Fa/Pa revision 3, `displayWidth` where needed. |
| `src/components/TraceBoard.jsx`, tracing renderer | Use `displayWidth` for the play guide and progress fill. Nothing else. |
| `tests/geometry/`, `tests/game/` | Validator accepts/rejects `displayWidth`; baseline test updated; unchanged entries byte-identical. |
| `tests/browser/` | Extend `glyph-matched.spec.js` for Fa and Pa; assert counters remain open at the game's width. |
| `docs/` | Delivery and review record, state and readiness counts; history preserved. |

## Work sequence

1. Settle the earlier glyph-matched work (see Dependency) and snapshot Fa, Pa and Qaf.
2. Add and run the stronger gate on all letters; record the failing list.
3. Retrace Qaf, Fa and Pa (and Hamzah if rejected); overlay against the catalogue; check at the game's width.
4. Compute and record `displayWidth` for the affected letters; wire the renderer.
5. Run checks once settled; fix failures; show you the review sheet; update documents.
6. If you chose it, add the silhouette stage afterwards as a separate step with its own sheet.

## Verification after implementation

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md).

- `npm test` and `npm run build` (the build includes content validation).
- Comparison script: the ten named letters and all other redrawn letters meet every number; every other letter keeps its
  measurements except any letter the new gate sends back for repair.
- In Jejak Ceria, guided and precision modes, per letter: complete both strokes and all
  dots; reject wrong start, shortcut, reversal, cancellation and missing dots; retry; check
  the demonstration and numbered guides.
- Captures at 320 × 600, 390 × 844, 768 × 1024, 1024 × 768, 1920 × 1080 and native 4K: the
  loop counter stays open, nothing collides with the Menu or letter badge, and the letter
  does not move when completed. Compare catalogue card, help and tracing page side by side.
- Student pools and Solo/Duo exclude Fa, Pa and the other unreviewed revisions until you approve them.
- Protected inputs unchanged: every other entry, all recordings and all approval records.

Recorded limits still apply: Windows Firefox cannot launch and the tested WebKit WAV fixture
is unsupported. No physical tablet or smartboard review is recorded.

## Effort to use

Use **high** effort. The retrace of three loop letters and the judgement against the catalogue
need several overlay rounds each; the gate, width and bookkeeping are medium.

## Dependency

This builds on the 25 glyph-matched redraws, whose full Chromium regression run and
documents ([plan](GLYPH_MATCHED_TRACING_MODELS_IMPLEMENTATION.md)) were still in progress when
this proposal was written. Settle them first so the new checks are not mixed with their open
results. The uncommitted fullscreen tracing, voice and music work is also still unverified.
