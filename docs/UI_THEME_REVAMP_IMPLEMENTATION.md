# Taman Jawi UI theme revamp — implementation proposal

**Prepared:** 2 October 2026, Asia/Kuala_Lumpur.  
**Status:** Authorised by the user's “proceed” on 2 October 2026; implemented and verified.  
**Request:** Revamp the entire game UI to feel friendly to children, professional,
fun and easy to play.

This document records the agreed design and implementation scope. It was first
delivered as a proposal without changing the game; the user then authorised implementation.

## 1. Recommended direction: Taman Ceria

Make Taman Jawi feel like a bright, welcoming learning garden: a light sky-blue
world, clean white learning surfaces, mint foliage, sunny accents and a friendly
leaf companion. Use rounded shapes and clear, tactile buttons. Keep the writing
area calm so the letter and its instructions remain the focus.

The result should feel like a carefully designed children's game throughout the
journey, including the teacher area. Professional quality comes from consistent
spacing, typography, colour roles, readable states and predictable controls.
Fun comes from the garden illustration, friendly shapes and short celebrations.

The current UI already has a garden identity, a leaf companion, local fonts and
SVG artwork. Its cream/sage palette, small supporting text and compact phone
catalogue provide the starting point for a substantial visual refresh.

| Design goal | Proposed expression |
| --- | --- |
| Friendly to children | Large letters, recognisable icons with labels, generous touch controls and short Malay instructions |
| Professional | A small, consistent palette; shared component styles; aligned layouts; restrained shadows; clear adult screens |
| Fun | Cheerful garden illustrations, colourful card accents, expressive leaf companion and brief completion feedback |
| Easy to play | One clear main action, an uncluttered writing board, predictable navigation and visible recovery instructions |

**Visual reference in words:** a colourful learning garden presented on polished
white cards, with a quiet sheet of paper at its centre for writing.

## 2. Scope and preserved behaviour

Restyle the complete interface: splash, welcome/profile selection, navigation,
letter catalogue, all tracing modes, blank copying, results, teacher panels,
audio controls, previews, notices and confirmation states.

The current catalogue contains **37 approved models and 37 approved letter-name
recordings**. All 37 lessons are available to students. Preserve:

- Every letter's glyph, paths, dots, movement order, content version and approval.
- Audio files, metadata, playback controls and recording approvals.
- Jejak Ceria as the preschool default; Berpandu and Kurang panduan remain adult-selected options.
- Tracing tolerances, matching, pause/resume, cancellation and diagnostic policies.
- Number anchors, loop start/stop handling, dot sequencing and release requirements.
- Saved profiles, attempts, copying, export and deliberate reset confirmation.
- Student/adult-preview separation and truthful assistance labels.
- The supplied Hanana Academy logo, its proportions and text fallback.
- The existing splash's 1.8-second continuation and manual Teruskan button.
- Bahasa Melayu interface copy and isolated Jawi rendering with appropriate RTL/language attributes.

This scope adds no points system, leaderboard, forced progression, new lessons,
accounts or cloud storage. It does not replace the current recordings, introduce
new narration or publish the game. Theme approval does not change teaching-content approvals.

## 3. Colour system

Replace scattered presentation colours with semantic CSS variables. Keep bright
accents in backgrounds and illustration; use dark text for reading.

| Role / proposed token | Colour | Use |
| --- | --- | --- |
| `--page-bg` | `#F4FAFF` | Light sky-blue application background |
| `--surface` | `#FFFFFF` | Cards, panels, paper and label backdrops |
| `--ink` | `#20354A` | Main text and catalogue Jawi glyphs |
| `--text-muted` | `#52687A` | Supporting instructions and metadata |
| `--primary` | `#2468C9` | Jom mula, next-letter action and selected controls |
| `--primary-hover` | `#1D56A7` | Hover/pressed primary state |
| `--sky-soft` | `#E5F2FF` | Blue accents and supporting surfaces |
| `--mint-soft` | `#DDF5EC` | Garden accents and positive supporting surfaces |
| `--sun` | `#FFD66B` | Illustration, profile accents and decorative highlights |
| `--coral` | `#FF916F` | Warm decorative card accents |
| `--lavender-soft` | `#ECE8FF` | Occasional fourth card accent |
| `--success` / `--guide-start` | `#13785A` | Start marker, successful state and positive text |
| `--guide-follow` | `#815B00` | Numbered follow labels and badges |
| `--guide-stop` | `#9D4328` | Numbered stop/finish labels and badges |
| `--trace-route` | `#607D99` | Essential uncompleted reference markings on white paper |
| `--trace-accepted` | `#BE4E23` | Warm, clearly visible accepted tracing colour |
| `--focus-ring` | `#193F7A` | Keyboard focus, paired with a white separation ring |
| `--control-border` | `#718AA2` | Boundaries needed to identify interactive controls |
| `--divider` | `#DBE7F0` | Decorative separators and nonessential panel outlines |

Candidate opaque pairs were calculated during proposal preparation: main text
on white is approximately **12.58:1**, muted text on the page background
**5.52:1**, white on the primary button **5.39:1**, and the control border on
white **3.58:1**. These are palette checks, not a completed accessibility audit.
Recheck actual backgrounds, opacity, hover, selected and focus states during implementation.

Sun/coral/mint/lavender surfaces use dark ink. Catalogue glyphs stay dark rather
than inheriting a pale accent. Colour is paired with text, shape or an icon for
selected, visited, paused and completed states.

## 4. Typography, spacing and shared controls

Keep the bundled fonts: **Outfit** for titles and friendly display labels,
**DM Sans** for controls/body text, and **Noto Naskh Arabic** for Jawi. Use existing
weights and local assets; no remote font dependency is needed.

| Element | Proposed target |
| --- | --- |
| Welcome heading | 36–40 px on phones; 48–56 px on larger screens; Outfit 600 |
| Screen heading | 28–32 px on phones; 36–40 px on larger screens |
| Child-facing body/instruction | 16–18 px, comfortable line height |
| Child-facing supporting labels | Normally 14 px or larger; reduce decorative text instead of shrinking instructions |
| Teacher body | 14–16 px; metadata at least 12 px |
| Catalogue Jawi glyph | Approximately 72–96 px; adequate line box for dots and marks |
| Buttons | Normally 16 px labels; 14 px for narrow secondary actions if needed |
| Spacing | Shared 4, 8, 12, 16, 24, 32 and 48 px steps |
| Corners | 16 px controls; 24 px cards; 28 px major panels |
| Shadows | One subtle panel shadow and a small button depth edge |

Primary play actions should be at least **56 px high**, secondary/navigation
controls at least **48 × 48 px**, and the dot pad at least its current **64 px
height**. Provide approximately 8–12 px between adjacent controls where possible.
These are project design targets, larger than the WCAG 2.2 minimum described
in [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Number badges are visual landmarks, not separate buttons. Preserve their existing
minimum 36 CSS-pixel display and current hit policy; do not enlarge or move authored
dot targets to satisfy a general button style. Retain the large equivalent dot pad.

Define default, hover, pressed, keyboard-focus, selected, disabled and busy states
for each control. Press feedback can move a button by 1–2 px, but must not shift
the writing board or its coordinate system. Keep labels visible alongside icons.

## 5. Screen-by-screen changes

### Splash and app shell

- Present the unchanged Hanana Academy artwork on a clean white panel within the new sky/garden background.
- Keep immediate manual continuation, the existing deadline, focus and image-failure fallback.
- Simplify the header height and decoration, with a clear brand/home control and mute control.
- On narrow screens, a compact visible Guru label can accompany the teacher icon while retaining the accessible name Ruang guru.
- Keep the selected profile recognisable without crowding the lesson header.
- Use a consistent footer credit; retain the original company artwork without recolouring or cropping.
- Keep the skip link, heading focus and preview-exit control available.

### Welcome and profiles

- Use a lively garden scene with a welcoming leaf character and a few clearly drawn Jawi references.
- Proposed main heading: **Jom bermain dengan huruf Jawi!**
- Make Jom mula the dominant button. Keep the short existing description and self-paced encouragement.
- Turn Bunga, Daun and Bintang into larger illustrated profile choices with name, selected border and check indicator.
- Retain their current stored values; this is a visual change, not a profile migration.
- Present Kenal huruf, Dengar & sebut and Jejak & cuba as three simple illustrated steps.
- On phones, stack copy, profiles and the start action before the decorative scene.

### Letter catalogue

- Present letters as large white learning cards with cheerful accent tabs/frames and dark, readable Jawi glyphs.
- Use two columns on narrow phones, four on typical portrait tablets and six on wide desktop layouts, subject to actual fit.
- Give each tile generous height, a clear Malay name and a reliable press/focus state.
- Keep all 37 lessons in the default Huruf tersedia view and the original 12 in Huruf permulaan.
- Restyle the existing filters as substantial labelled chips; wrap them instead of creating page overflow.
- Keep the visited indicator and Jom ulang lagi semantics. A visited letter does not mean mastery.
- Retain deliberate selection and existing letter order. Do not introduce fake locks, stars, scores or compulsory levels.
- Preserve disabled/draft styles for genuine future content states without inventing unavailable current letters.

### Jejak Ceria lesson

- Make the letter name and Dengar action clear above a large white writing surface.
- Use a simple frame and restrained dotted paper; remove background illustration from the actual writing area.
- Keep the active number, start marker and Mula → Ikut → Henti/Siap cues visually prominent.
- Put readable mode information outside the SVG instead of relying on tiny corner text.
- Give Tunjuk cara and Cuba lagi matching, clearly distinct secondary buttons below the board.
- Give the current dot step a prominent Tambah titik button with the existing single press/release behaviour.
- Reserve a stable encouragement area in normal flow outside the SVG for the leaf/reward. Decoration must never cover a route, number or control.
- Keep the canvas, instruction and action areas stable during gestures. Do not animate board size, position or transforms.
- Keep idle and recovery cues gentle. Preserve accepted work and the existing matcher responses.

### Berpandu, Kurang panduan and blank copying

- Apply the same paper, type and control system, while retaining distinct mode/assistance labels.
- Restyle existing progress information so adults can read it without confusing it with independent handwriting assessment.
- Keep demonstrations separate from scored input and preserve their disabled/busy controls.
- Keep blank copying free of trace routes and numbered guides; make Simpan untuk guru and its empty-work notice clear.
- Do not present strict ink as assisted route fill, or assisted play completion as independent copying.

### Results

- Show the completed letter as the central reward, with a brief friendly leaf celebration.
- Keep the actual assisted SVG drawing for Jejak Ceria results rather than replacing it with a different model or font form.
- Make Huruf seterusnya the primary action and Main lagi/Ulang huruf secondary.
- Keep Sekarang, cuba salin sendiri and return-to-garden actions visible and reachable.
- Preserve Dengan bantuan, strict completion and copied-work distinctions.
- Continue only when the player chooses. No countdown, automatic next letter or added reward audio.

### Teacher area, previews and notices

- Use the same palette with quieter decoration, clear headings and professional white panels.
- Group the existing statistics, practice choices, content review, audio review and progress functions with consistent spacing.
- Retain native selects, local-file audition, export, diagnostic views and existing callbacks.
- Keep approval identity, date, content revision and audio status visible in the content table.
- Contain wide tables within their scroll wrappers; provide labels and keyboard-reachable controls.
- Style the preview banner as an obvious adult state with a clear Tamatkan pratonton action.
- Restyle audio failure, empty copy, unavailable storage and reset confirmation consistently, preserving their actual meaning.
- Keep Padam rekod secondary and its explicit confirmation intact.
- Refresh the fallback preview-gate copy using current/derived inventory rather than the historical hardcoded 12-model wording in App.jsx.

## 6. Illustration and motion

Reuse and refresh the existing code-native SVG system in Icons.jsx and PlayFeedback.jsx.
Use rounded, consistent strokes and simple expressions. Keep the leaf character
recognisable; vary its welcoming/encouraging/celebrating pose sparingly.

Decorative garden art can sit around welcome/catalogue/result surfaces. Keep it
outside essential text and the writing surface. Mark decoration as hidden from
assistive technology and pointer-transparent. Do not use letter outlines as new
tracing routes or modify the approved content to fit an illustration.

Use approximately 120–180 ms for control feedback and 500–800 ms for a short
celebration. Avoid continuous bouncing, flashing, parallax and movement during
writing. Reduced-motion mode uses static state changes and a still reward.
Do not add background music, automatic narration or third-party art downloads.

## 7. Responsive and accessible behaviour

| Environment | Planned treatment |
| --- | --- |
| 320 × 740 phone | Two-column catalogue; compact header; wrapped filters; single-column lesson; large reachable controls |
| 390 × 844 phone | Same hierarchy with additional breathing room |
| 768 × 1024 tablet | Four-column catalogue; generous writing board; clear actions without excessive chrome |
| 1280 × 900 desktop | Six-column catalogue; bounded content width; balanced welcome scene and professional teacher panels |
| 844 × 390 landscape | Reduce decorative/header space; use available width; allow scrolling rather than making the board impractically small |

Breakpoints should respond to content fit rather than device names. The SVG
keeps its **1000 × 1000 logical viewBox and square aspect ratio**. Never apply
a CSS scale transform to simulate a smaller board. Actual screen-to-SVG mapping
continues through the existing matrix conversion. Recompute coordinates after
scrolling, resizing or screenshots that move the page.

Support keyboard focus, meaningful accessible names, selected/pressed states,
status notices and the current heading-focus flow. Keep logical reading/tab
order when layouts change. Allow text wrapping/zoom without truncating instructions
or covering controls. Do not create an icon-only preschool primary action.

Target at least 4.5:1 for normal essential text and 3:1 for qualifying large text;
see [Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Essential graphical boundaries, markers and state indicators target at least
3:1 against adjacent colours; see
[Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
Keep opaque white numbered-label backdrops. Contrast ratios alone do not establish
whole-application accessibility or usability with actual pupils.

## 8. File-level implementation plan

| File | Planned work |
| --- | --- |
| `src/styles/theme.css` — new | Semantic colours, type/spacing/radius/shadow/motion variables |
| `src/styles/app.css` | Replace old presentation literals with tokens; organise readable sections; implement shared states and responsive layouts |
| `src/main.jsx` | Import theme variables before application styles; keep local font imports |
| `src/App.jsx` | Presentational shell classes/data attributes, header/footer/banner/modal styling and accurate fallback copy; preserve navigation and storage logic |
| `src/screens/SplashScreen.jsx` | New themed wrapper/layout, preserving logo, timing and continuation |
| `src/screens/WelcomeScreen.jsx` | Updated welcome hierarchy, copy, scene and profile presentation |
| `src/screens/LetterGarden.jsx` | Card/filter layout and readable progress presentation; keep filtering rules |
| `src/components/LetterCard.jsx` | Larger readable tile and explicit visited/disabled/focus states |
| `src/screens/LessonScreen.jsx` | Board-first layout, stable instruction/action areas and readable mode distinctions |
| `src/components/TraceBoard.jsx` | Presentation wrappers, colours and decoration placement only; preserve engine setup, input handling and rendered content geometry |
| `src/components/NumberedTraceGuides.jsx` | Token-driven badge/label presentation; preserve number and anchor calculations |
| `src/components/DotTapPad.jsx` | Visual hierarchy and sizing; keep handlers, containment and release rules |
| `src/components/PlayFeedback.jsx` | Refreshed SVG expression and restrained motion, outside the writing SVG |
| `src/components/Icons.jsx` | Consistent icon presentation and refreshed GardenArt |
| `src/screens/ResultScreen.jsx` | Clear celebration, result distinctions and action hierarchy |
| `src/screens/TeacherScreen.jsx` | Consistent panels, fields, table wrappers and confirmation presentation |
| `src/components/AudioControls.jsx`, `AudioReviewPanel.jsx`, `DraftModelReview.jsx`, `CompanyBrand.jsx` | Shared surface/control styles and wrapping; retain playback, approval and supplied-brand behaviour |
| Relevant `tests/browser/*.spec.js` | Update intentionally changed welcome copy/layout expectations; add focused visual/state regressions |

Keep `src/content/letters.json`, its validator, audio assets and approval records
unchanged. Keep logic in `src/tracing/`, `src/audio/` and `src/storage/` unchanged.
In particular, do not change numbered-guide planning, model coordinates or
matchers to accommodate the new presentation.

Prefer the existing components and lightweight CSS/SVG. Add no UI framework,
animation dependency or new routing/storage layer. If a small decorative
component is extracted from GardenArt, it should remain purely presentational.

## 9. Implementation sequence after authorisation

1. **Capture the baseline.** Confirm catalogue readiness, content/audio/brand hashes and current build/server. Save representative existing UI states and source fingerprints.
2. **Create the shared theme.** Add semantic variables and consolidate existing CSS into readable sections. Define shared button, card, input, badge and focus states.
3. **Revamp the app shell and entry.** Apply the new background, splash, header/footer, welcome scene and profile selection. Preserve timings and accessible names.
4. **Revamp the catalogue.** Implement readable cards, responsive grids, filter wrapping and truthful visited states for all 37 letters.
5. **Revamp lessons and results.** Style play/strict/copy consistently, reserve feedback space outside the SVG and verify that presentation cannot move/obscure input cues during gestures.
6. **Revamp adult screens and exceptional states.** Apply the same system to teacher/audio review, preview banners, notices, empty states and reset confirmation.
7. **Verify the final implementation.** Run the affected checks below after dependent edits are complete. Fix failures and repeat only checks invalidated by changes or unresolved concerns.
8. **Document and deliver.** Record actual evidence and update current project/UI documentation. Preserve dated content/approval records and historical reports. Deliver the local preview and concise verification results.

## 10. Verification and acceptance

Follow [the verification guide](VERIFICATION_GUIDE.md). The implementation must
produce fresh evidence for the changed UI; previous approval checks describe
their own recorded builds.

**Content and functional preservation**

- Compare the final catalogue to the baseline: all 37 entries must be identical, including versions and approval metadata.
- Confirm all approved audio and supplied-brand hashes are unchanged.
- Run `npm test` once after relevant edits; run `npm run build`, which includes content validation.
- Confirm all 37 lessons remain enabled, the original 12 pilot filter remains intact, and student attempts retain correct revision/status/preview fields.
- Verify profile/progress persistence, copying, export, audio/replay/mute and reset confirmation.

**Browser and visual checks**

- Use Chromium and WebKit with at most two workers; reuse a confirmed running local server.
- Select existing cases from `branding.spec.js`, `game.spec.js`, `play-tracing.spec.js`, `numbered-guides.spec.js`, the three letter-batch suites and `audio-approval.spec.js` for changed layouts, navigation, input mapping and completion states.
- Select audio-review cases from `draft-audio.spec.js` where control/notice/layout presentation changes. Unchanged recordings do not require another decoding audit solely for the theme.
- Add focused UI assertions for final control dimensions, contrast/focus states, responsive wrapping and reward separation where existing tests do not cover them.
- Capture splash, welcome/profile, catalogue, active trace, pause/recovery, demonstration, each dot stage, blank copy, completion, teacher review and relevant notices.
- Inspect phone, tablet, desktop and short-landscape captures rather than relying only on screenshots existing.
- Include complex shapes and nearby guide positions: Sin/Syin, Mim, Sad/Dad, Nga, Fa/Pa/Qaf and Ga, plus simple Alif/Ba.
- Reuse the existing every-stage phone/tablet guide checks to cover all authored models. Recompute coordinates after layout movement before native pointer input.
- Verify no page-level horizontal overflow; table scrolling is contained. Check keyboard navigation, reduced motion and increased text size/zoom.
- Record page errors, external runtime requests, build/source fingerprints, browser/input type and actual pass/fail/skip totals.

Recorded Windows limits still apply: Firefox launch previously failed with
`spawn UNKNOWN`, and WebKit rejected the tested WAV fixture. Chromium CDP touch
does not establish native WebKit touch. Reconsider these only when the relevant
runtime/device conditions change. Real tablet, stylus and pupil testing remains
a separate validation activity.

**Acceptance criteria**

| Area | Required outcome |
| --- | --- |
| Complete theme | Every screen, mode and exceptional state uses the new visual system |
| Child-facing hierarchy | Clear main action, readable letter/name, labelled controls and short visible instructions |
| Writing comfort | Large square board; no decoration, labels or overlays obstruct routes, numbers, dots or controls |
| Control sizing | Primary actions ≥56 px high; secondary/navigation targets ≥48 × 48 px; dot pad ≥64 px high |
| Readability | Essential text/graphics meet the planned contrast targets; Jawi dots/marks and loop guides remain clear |
| Responsive behaviour | The five listed viewport types remain usable, with no page overflow or clipped essential controls |
| Motion | Brief purposeful feedback; reduced-motion mode stays still; no moving board during input |
| Functional preservation | Current tracing, audio, progress, copying, previews and confirmation rules still work |
| Content preservation | All 37 catalogue entries, audio files and the supplied logo match baseline values/hashes |
| Honest feedback | Assisted results, visited letters and teacher metrics retain their actual meaning |
| Handoff | Actual verification evidence and remaining device limitations are documented |

## 11. Implementation decision

The proposed implementation uses **Taman Ceria** with sky blue, white, mint and
sunny accents; the existing leaf companion; larger catalogue cards; a quiet
writing board; and a consistent, professional teacher area.

The user authorised this direction with “proceed” on 2 October 2026. The shared
theme is now applied to every screen and mode, including splash branding,
profiles, audio notices, preview banners and reset confirmation. The catalogue
uses two columns on phones, four on tablets and six on wide screens. Writing
instructions and celebrations occupy normal page flow outside the square SVG.

The implementation reuses the existing screen components through shared CSS;
only markup needing a structural or copy change was edited. No dependency,
content, recording or storage migration is introduced. Fresh verification is
recorded in [the UI theme verification record](UI_THEME_VERIFICATION.md).
