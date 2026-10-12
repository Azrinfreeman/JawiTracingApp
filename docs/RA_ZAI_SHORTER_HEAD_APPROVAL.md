# Ra 4 and Zai 5: approval and activation

Date: **11 October 2026**, Asia/Kuala_Lumpur.
Status: **Exact reviewed shapes approved and active for students.**

The owner replied **“yes approved”** to the pictured Ra-4/Zai-5 question, then
requested a separate implementation document for Sin/Syin. The actual reviewer
is **Project owner (Codex user; name not supplied)**; no educator assessment is
invented. See [approval record](CONTENT_APPROVALS.md#approval-of-ra-and-zai-shorter-heads-2026-10-11)
and the preserved [preceding review](RA_ZAI_SHORTER_HEAD_REVIEW.md).

## Active behaviour

- Ra 4 and Zai 5 use the exact reviewed shorter heads, cut contours, route starts,
  eight reveal pieces, bounds and provenance. Only their candidate geometry status
  and matching review metadata are added during promotion; no shape is revised
  after approval. Normal lessons and scored Solo/Duo use these approved entries.
- Ra is one continuous movement. Zai follows its same reviewed body then requires
  the original separate dot. Existing guide anchors and demonstrations follow
  the shorter routes. Their adult candidate cards expire automatically.
- All **34 other catalogue entries** are exact, explicitly including **Sin 2 and
  Syin 3**. All audio metadata and all **78 public/audio files** remain unchanged.
  All 36 lessons remain valid and student-ready.
- Saved earlier/preview attempts remain stored under their actual revisions.
  They do not grant credit for the new student geometry. Completing a current
  approved shape grants credit in its actual practice mode; the credit persists
  after reload. No storage migration or reset is introduced.

## Verification

Current evidence and fingerprints:
[approval verification folder](../output/verification/ra-zai-short-head-approval/).
The earlier review folder remains historical and has not been rewritten.

| Check | Actual scope/result |
| --- | --- |
| `npm test -- --pool=threads --maxWorkers=2 --reporter=dot` | **284 passed / 45 files**; new approval readiness/expiry and preserved history checks included |
| `npm run build` | Passed; 36 valid models and 36 student-ready lessons; JS `index-BJm87mnf.js`, CSS `index-DbweFF8G.css` |
| Focused Chromium/WebKit browser checks | **32 distinct passed / 2 CDP-only skips**; both approved models in play/guided/precision, phone/tablet/desktop, native Chromium touch, restart/recovery, dot-last, persisted revision credit, demonstrations, expired review cards, and scored Solo/Duo with independent lanes |
| `node scripts/verify-ra-zai-short-head-approval.mjs` | Exact reviewed geometry; other 34 entries exact; Sin/Syin unchanged; all 78 audio files exact; zero corresponding review candidates and all 36 lessons ready |
| Visual inspection | Current phone/tablet/desktop tracing and Duo results inspected; automated stage captures check outline/guide clipping and horizontal overflow |

The full browser command was `npx playwright test tests/browser/ra-zai-short-heads.spec.js
--project=chromium --project=webkit --workers=2 --reporter=list`, using the existing
production static-route fixture (`JAWI_STATIC_TEST=1`) and the installed browser
directory `C:/Users/azrin/AppData/Local/ms-playwright`. The separate existing
outline harness was built from current production components for scored cases;
it is never imported by the application.

The first unit run found one older glyph-redraw test assuming the previous
Ra/Zai revisions. It now uses the preserved original models for that historical
stage, like the preceding outline-approval test; the full unit rerun passed.
The first browser run passed 24 cases and exposed eight reload assertions that
assumed the teacher's session-only mode remained selected. Those tests now
reselect guided/precision before checking that mode's retained credit; all eight
affected cases passed on rerun (`--grep 'guided:|precision:'`). No app change was
needed. Reruns are not counted as additional distinct cases.

The two skips are WebKit tests requiring Chromium CDP native touch. Mouse input
covers both browsers; native Chromium touch covers both letters. Audio lifecycle
is controlled in these geometry checks, and unchanged recordings are verified by
hash. Physical smartboard/tablet and Android runtime remain unverified. The
existing APK is unchanged; no release or deployment was requested.

## Separate Sin/Syin request

Only [the Sin/Syin implementation Markdown](SIN_SYIN_REFERENCE_TAIL_IMPLEMENTATION.md)
is prepared. No candidate data or Sin/Syin tracing changes are applied. That
document uses picture 3 for the body proportions and final visible tail height;
implementation remains explicitly unauthorised at this stage.
