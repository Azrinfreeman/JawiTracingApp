# Dal, Zal, Ra and Zai: match tracing to Isi Kandungan

Date: 6 October 2026, Asia/Kuala_Lumpur.

**Status: implemented after the owner's “procede”; Dal 3, Zal 4, Ra 3 and Zai 4 explicitly approved and promoted on 6 October 2026.** The plan below records the authoring/review scope. See [implementation verification](FOUR_LETTER_TRACE_APPEARANCE_VERIFICATION.md) and the subsequent [approval and promotion verification](FOUR_LETTER_TRACE_APPEARANCE_APPROVAL.md).

The owner supplied two screenshots and requested that the four letters in the first screenshot look the same in tracing as in Isi Kandungan. The four letters are **Dal (د), Zal (ذ), Ra (ر) and Zai (ز)**. The second screenshot demonstrates the mismatch for Dal. The owner initially requested this document first and withheld implementation authorisation; the subsequent “procede” authorised the implementation below.

Delivery details: vector contours are authored from the bundled font's 2400-pixel ink mask, with at most 0.344 logical-unit contour simplification error. Static pieces follow nearest route arc, and the live frontier clips only the current piece. No conversion occurs during tracing. The existing copper accepted-ink colour is retained rather than the green mentioned in the original proposal. A compact review selector replaces separate scope tabs, and revised-model clearance is 148 units so badges and labels can sit beside the letter.

Detached badge placement also searches available stage space beyond the immediate anchor, with leaders retaining the connection to each target. Marker separation takes priority over the conservative outline bounding-box penalty. Final layout checks inspect both actual ink obstruction and overlap between different badges/labels after the stage has settled.

## Intended result

Keep the appearance shown in Isi Kandungan as the reference. On entering a tracing page, each of these four letters should retain that reference's proportions, tapered beginning, curved body, terminal shape and dot shape/placement. Completing the trace should colour the same shape green. Demonstrations and the finished-letter illustration should agree with it.

Dal and Zal must retain their compact bent body and short base; Ra and Zai must retain their longer descending curve and leftward tail. Zal and Zai each have one upper dot; Dal and Ra have none. Scaling the letter up for writing must preserve its proportions.

This scope covers practice, Solo and Duo, Jejak Ceria, the other tracing modes' reference illustrations, full/section demonstrations, adult previews and authored completion illustrations for these four letters. Copy mode continues to display the learner's actual drawing.

## What was checked

The two supplied screenshots were inspected, and the current rendering, four catalogue entries, content validator, fitting code and glyph-authoring helpers were read.

| Location | Current behaviour | Consequence |
| --- | --- | --- |
| `LetterModelGlyph.jsx`, `main.jsx`, `theme.css` | These four catalogue cards display the glyph in bundled Noto Naskh Arabic, weight 400. | The card has the font's changing thickness, shaped terminals and diamond dot. |
| `TraceBoard.jsx`, `displayWidth.js`, `app.css` | The writing guide strokes a centreline with one width and round caps/joins. | A similar route becomes a round, thick band instead of the catalogue's outline. |
| `liveRenderer.js` | Jejak Ceria colours short centreline pieces at about 79% of the guide width. | Accepted progress still has the rounded-band appearance. |
| Demonstration in `TraceBoard.jsx` | Animates a stroked route and circular dots. | The example does not reproduce the font outline. |
| `ResultScreen.jsx` | Jejak Ceria's authored result uses a fixed 60-unit stroke and circular dots. | The result can differ again from both the reference and writing guide. |

The large numbered badges also cover the small letters' terminals. The supplied Dal screenshot shows the start and finish hidden under badges. Clearer badge placement is part of the visual correction.

A fresh, read-only comparison was run against the current source:

```text
PLAYWRIGHT_BROWSERS_PATH=C:\Users\azrin\AppData\Local\ms-playwright
node scripts/compare-model-to-glyph.mjs --letters dal,zal,ra,zai --tag four-letter-plan-20261006
```

| Letter | Current revision | Current play guide width | Guide/font ink overlap | Guide/font ink area |
| --- | ---: | ---: | ---: | ---: |
| Dal | 2 | 58 | 0.77 | 1.24 |
| Zal | 3 | 52 | 0.77 | 1.24 |
| Ra | 2 | 52 | 0.73 | 1.20 |
| Zai | 3 | 48 | 0.75 | 1.23 |

The script completed successfully and the [current overlay sheet](../output/verification/glyph-model-audit/sheet-four-letter-plan-20261006.png) was visually inspected. [Metrics](../output/verification/glyph-model-audit/metrics-four-letter-plan-20261006.json) record the inputs' current revisions. The earlier comparison gate accepts all four: it checks approximate route agreement and permits this difference in stroke weight. That pass is insufficient for the owner's requested visual match. Its alignment also scales the axes separately, so the new visual check must use uniform scaling.

The first comparison attempt could not find the browser in the sandbox's default cache. Using the existing documented browser path resolved it; no browser or dependency was installed. No app build or behavioural test suite was run for this documentation request.

## Proposed implementation

### 1. Author the visible outline from the existing catalogue font

Extract vector contours for these four isolated glyphs from the **bundled** Noto Naskh Arabic 400 font at authoring time. Check the extracted glyph against the actual Chromium-rendered catalogue character; account for font shaping and composite contours. Store closed body contours and, for Zal/Zai, the separate dot contour in the candidate model. Use arrays for multiple contours rather than weakening the existing continuous-stroke path rule.

Align each outline with its model using one uniform scale and translation in the existing 1000-unit frame. Reuse the recorded glyph-authoring transforms as the starting point; verify each alignment rather than stretching the outline to fit the old route. Include the outline bounds when fitting the stage so no tip or diamond dot is clipped.

Record the font file, SHA-256, glyph, weight and transform with the authored outline. The font used for this analysis is:

```text
node_modules/@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2
SHA-256: 9cc2d2e90f7b51904468558b4ed529de8a8206497c8edb5e33122bd077e0158c
```

Use the existing font licence and preserve its attribution. No font extraction, network request or rasterisation runs during tracing.

### 2. Keep the writing route separate from the illustration

Keep the existing one-stroke routes, checkpoints, direction, lift policy, dot centres/hit areas and valid sequence as the starting point. The font outline describes visible ink; it does not prescribe a writing order.

Render the stored body outline as the reference guide for these four revised models. Render the stored dot outline for Zal/Zai. Do not draw the old wide, rounded reference band on top of the outline. In guided/precision modes, retain direction/corridor assistance with sufficiently subtle styling that the actual letter remains recognisable.

Matching continues to use the authored centreline and existing input profiles. A finger can use the current generous hit tolerance even where the visible font stroke is thin. No tolerance, shortcut/reversal protection, endpoint rule, scoring or audio behaviour changes.

If alignment inspection identifies a route section that cannot reasonably cover its corresponding outline, correct only that section and document it in the candidate revision. Do not apply an automatic wholesale redraw or infer a new order from the font.

### 3. Colour the matching outline as progress is earned

Clip accepted Jejak Ceria progress to the body outline. Reveal the outline's full cross-section behind the accepted frontier using a route-based mask wide enough to reach both outline edges. Verify the mask does not colour a later part before it is traced, particularly around Dal/Zal's bend.

At body completion, colour the whole body outline. Keep Zal/Zai's dot unfilled until its existing dot action is accepted, then fill its diamond contour. Preserve the assisted dot button and circular logical hit area; their visible teaching dot becomes the catalogue shape.

Reuse the bounded piece renderer and direct SVG updates. Outline/clip definitions are static per board, uniquely identified across Duo lanes. Do not add per-frame React rendering, font conversion or whole-board reconstruction. Retry and letter navigation clear the reveal correctly.

### 4. Use the same authored appearance throughout tracing

Use a shared appearance helper for the revised four models in the reference, accepted fill, demonstration, forced-model adult illustration and authored completion result. Demonstrations reveal the same outline along the route; section demonstrations preserve earned progress and pause behaviour.

Keep reference placement stable through tracing, completion, menu open/close and examples. The catalogue font remains the requested reference. Keep actual freehand ink, copy results and stored raw input faithful to the learner's drawing.

For these four compact letters, place the large numbered start/middle/finish badges beside the silhouette with clear leaders when they obscure the body. Keep a small target cue at the real start/end and make the direction arrow legible. Fit and collision checks must consider both the silhouette and controls; do not change all other letters' badge layout without a demonstrated shared issue.

### 5. Preserve revisions and the review gate

The visible teaching shape changes, even if the centreline stays the same. Create new candidate content revisions and require fresh geometry review under [AGENTS.md](../AGENTS.md):

| Letter | Approved revision retained until review | Proposed revision |
| --- | ---: | ---: |
| Dal | 2 | 3 |
| Zal | 3 | 4 |
| Ra | 2 | 3 |
| Zai | 3 | 4 |

Reuse the isolated adult candidate/comparison flow already present in `reviewCandidates.js` and `VideoModelReview.jsx`. Keep these four proposals separate from the seven existing video proposals. Candidates have `pendingReview` geometry and no invented approval. Adult previews exercise the revised tracing implementation and show catalogue/current/proposed appearance for review.

Retain all 37 currently approved student models while the candidates await review. After the owner explicitly approves the identified four revisions, promote those revisions to `letters.json` and record the actual reviewer/date/scope. Implementation authorisation alone does not approve them. Preserve existing audio objects and approval histories, unrelated models, older saved attempts and revision checks. Jejak Ceria remains the preschool default.

## Expected files

| File/module | Planned change |
| --- | --- |
| `src/content/reviewCandidates.js` | Four isolated revisions with outlines and font provenance. |
| `src/content/validateContent.js` | Validate optional closed outline contours, movement associations and provenance; existing models remain valid. |
| New shared helper under `src/content/` or `src/tracing/` | Resolve stored appearance and validated bounds; fall back to existing rendering for other letters. |
| `src/components/TraceBoard.jsx`, `src/tracing/liveRenderer.js` | Outline guide, clipped accepted reveal, matching dot appearance and demonstrations. |
| `src/components/LetterModelGlyph.jsx`, `src/screens/ResultScreen.jsx` | Consistent authored illustration for the revised four. |
| `src/game/screenLayout.js`, `src/tracing/numberedGuides.js`, relevant styles | Outline clearance and readable nearby markers where necessary. |
| `src/components/VideoModelReview.jsx` | Catalogue/current/proposed comparison and entry to revised adult tracing. |
| Existing glyph-analysis scripts/helpers | Reuse comparison; add authoring-time outline extraction and a uniform-scale appearance check. |
| Relevant unit/browser tests | Outline validation, visual fidelity, progress/dots and tracing regressions. |
| Current task/state and review/verification documents | Record delivery, exact revisions, evidence and remaining review. |
| `src/content/letters.json`, `docs/CONTENT_APPROVALS.md` | Promotion only after explicit review approval. |

The implementation may consolidate helpers differently after inspecting the final outline data, but the visible outcome and approval boundary above remain fixed.

## Verification after implementation is authorised

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md). Reuse the running local server after checking its address/source; do not start a duplicate.

1. **Appearance:** compare catalogue glyph and clean authored outline at the same uniform scale after fonts load. Require ink overlap of at least 0.97 with only small antialiasing edge differences; verify tapered tips, terminals and diamond dots visually. Check all four separately, including their different body lengths. Do not treat the old approximate-route gate as proof of identical appearance.
2. **Progress:** inspect start, mid-curve, bend/tail, completed body and completed letter. Green ink stays within the reference outline, covers the completed body fully and leaves required dots pending. Inspect full and section demonstrations and the finished result. Markers and labels remain readable without hiding the identifying shape.
3. **Interaction:** trace all four with mouse, touch and pen profiles in Jejak Ceria and guided/precision modes; exercise wrong starts, shortcuts, reversal, lift/recovery, endpoint release, cancellation, retry and missing dots. Test direct dot and assisted button paths, menu, navigation and saved-revision behaviour. Include practice, Solo and independent Duo lanes.
4. **Layout:** inspect relevant phone (including 320 × 600), portrait/landscape tablet and desktop captures. The letter scales uniformly, dots/tips remain visible, no control overlap/overflow occurs, and no viewport jump occurs during completion. Recompute SVG screen coordinates after any resize/capture that moves the page.
5. **Performance/fallback:** check lightweight tracing and Duo reveal costs against the existing bounded renderer. Representative unchanged letters, including Kaf/Ga and complex loop models, retain their rendering and behaviour. Copy/raw ink stays unaltered.
6. **Checks and preservation:** run applicable unit tests and the checked build once, then targeted browser cases in supported Chromium/WebKit scopes. Compare the four candidates and all protected catalogue/audio inputs with the implementation baseline. Record commands, build/input identity, results and actual environment limitations. Physical-device appearance/touch review remains separate from automated browser evidence.

Deliver a side-by-side sheet for all four and links to their adult tracing previews, then obtain the explicit revision review before promotion. No APK, deployment, publication or messages to others are included in this request.

## Current handoff

Completed: screenshot/source inspection, current four-letter comparison and authorised implementation. Verification and the review sheet are linked above.

Next: review Dal 3, Zal 4, Ra 3 and Zai 4 before promoting them to student lessons. No clarification is needed to identify the four letters or the intended catalogue reference.
