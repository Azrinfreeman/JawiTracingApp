# Jawi Prasekolah - Implementation Plan and Codex Super Prompt

Prepared: 2 October 2026.

**Implementation authorised on 2 October 2026.** The user subsequently requested execution of the super prompt in section 14. This document remains the design specification; see README.md and docs/ACCEPTANCE.md for the actual implementation and verification status. Local implementation is authorised; no deployment has been requested.

**Strict tracing update, 2 October 2026:** the subsequently authorised [strict tracing specification](docs/STRICT_TRACING_IMPLEMENTATION.md) supersedes the original permissive re-entry rules. Visible tracing ink is validated raw movement, with per-gesture rollback and blocking until release. Current tap dots use explicitly assisted target stamps. Copying remains free writing; older local records remain readable.

**Preschool play update, 2 October 2026:** the subsequently authorised
[Jejak Ceria specification](docs/PRESCHOOL_PLAYFUL_TRACING_IMPLEMENTATION.md)
supersedes the default child flow with a separate `play-guided-v1` matcher.
Ordered raw movement reveals an explicitly assisted colour fill; an excursion
pauses without erasing the prefix, and return to the frontier arms a new anchor
without bridging or awarding acquisition coverage. Dots accept separate board
taps or equivalent large pad actions. `playComplete` and teacher diagnostics
identify the assistance; measured coverage precedes any terminal display fill.
The original `strict-v2` guided/precision rules below remain available through
teacher selection, and actual blank copying remains unrestricted. See
`docs/ACCEPTANCE.md` for the final checks and remaining teaching dependencies.

## 1. Product goal

Build a browser game that teaches preschool pupils to recognise Jawi letters, hear their names and relevant pronunciation examples, and practise writing them through accurate tracing.

The interface uses Bahasa Melayu. The implementation uses HTML, CSS, and JavaScript. It must work with a finger, stylus, or mouse, with tablets as the primary learning device.

The key quality requirement is that the pupil actually follows the correct letter model. A colourful drawing surface that awards success for any scribble is not acceptable.

Use the existing research document as the educational reference:

- [Kajian Jawi Prasekolah KPM 2026](output/pdf/Kajian_Jawi_Prasekolah_KPM_2026.pdf), especially pages 3, 5-11.
- KP2026 PI 1.5.1 covers letter recognition and naming. Letter tracing is a preparatory activity toward writing; it alone does not establish coverage of PI 1.5.2 reading or PI 1.5.3 copying words.
- Include the full 37-letter catalogue, including the additional Jawi letters and ta marbutah/ye. Do not present a chosen lesson order or a tracing score as an official KPM requirement or TP.

**Accuracy has two separate requirements:** a technically sound tracing validator, and correct teaching assets. Automated tests can establish the first. Teacher review of letter shapes, writing movements, and audio is needed for the second.

## 2. Recommended stack

| Layer | Choice | Role in this project |
| --- | --- | --- |
| UI framework | React, JavaScript with JSX | Screens, controls, lesson state and progress views. |
| Tooling | Vite | Local development and static production builds. |
| Styling | Plain CSS with variables | Responsive layout, large controls and consistent visual design. |
| Tracing surface | Native inline SVG | Authored vector letter models, guides and pupil ink. |
| Input | Browser Pointer Events | Mouse, touch and pen input through one pipeline. |
| Validation | Pure JavaScript geometry module | Stroke matching, order, continuity, direction and dots. |
| Audio | Local recordings via HTMLAudioElement | Reviewed Malay narration, letter names and pronunciation examples. |
| Storage | Versioned localStorage | Small local profiles and attempt summaries. |
| Verification | Vitest and Playwright | Geometry/state tests and browser interaction tests. |

This is a project-specific recommendation. React provides the application structure; SVG and the geometry engine provide the tracing capability. SVG paths can be sampled using browser geometry APIs. [React documentation](https://react.dev/learn), [Vite guide](https://vite.dev/guide/), [SVG geometry API](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength).

Start with this stack. A physics engine or a full game engine is unnecessary for the planned interactions. If later features require richer animation, evaluate adding a renderer without changing the validation rules.

Use compatible stable package versions available at implementation time and commit the lockfile. Check the current Node requirements instead of copying an old version requirement into the project. Keep the source in JavaScript; use JSDoc for important contracts rather than converting the project to TypeScript.

## 3. Learning experience and screens

### Screens

1. **Welcome:** game title, a large `Mula` button, sound control and local profile selection.
2. **Letter garden:** letter cards with clear Jawi glyphs, names and meaningful progress indicators.
3. **Lesson:** one large letter board, `Dengar`, `Lihat Cara`, `Cuba Lagi` and `Kembali` controls.
4. **Result:** specific feedback, replay audio and a deliberate `Huruf Seterusnya` action.
5. **Teacher view:** content review status, attempt summaries, tolerance settings and export/reset controls.

### Lesson sequence

`Hear -> Watch -> Trace -> Repeat with less help -> Try copying`

- `Dengar`: play the letter-name recording. Offer a separate, clearly labelled pronunciation example where pedagogically appropriate.
- `Lihat Cara`: animate the reviewed stroke sequence, including pen lifts and dots.
- Guided practice: start markers, arrows and a visible corridor.
- Precision practice: lighter guides and a narrower, calibrated corridor.
- Copy practice: put the model outside a blank board. Save the actual result for teacher observation; do not pretend the guided validator establishes free-writing correctness.
- Optional recognition task: choose the named letter from a small set before tracing it.

Start the tracing engine with a vertical stroke, a curve and a dotted letter. Then expand to the 12-letter pilot set from the research: alif, ba, ta, dal, ra, sin, kaf, lam, mim, nun, wau and ya. Expand the rest of the catalogue after the engine is verified. This development sequence is not an official teaching sequence.

Avoid a mandatory countdown, loss of lives or public ranking. Use brief feedback such as `Ikut laluan ini`, `Tambah titik di sini` and `Bagus, bentuk huruf semakin kemas`.

## 4. Teaching assets and review

### Letter models

Each teachable letter needs an authored vector model in one consistent handwriting style:

- Display silhouette or paths for the intended handwritten form.
- Ordered **centreline paths** for each pen movement.
- Explicit start/end positions, movement direction and pen-lift boundaries.
- Explicit dot/mark targets, their correct number and positions.
- A valid sequence, or a small set of explicitly reviewed alternative sequences.
- A local audio manifest and review records.

A font outline is a perimeter, not the route a pupil's pen should take. Do not obtain stroke order by tracing a glyph's outline, by following a Unicode character's contour, or by assigning the same direction to every stroke. Right-to-left text reading does not determine every writing movement.

Use a Jawi-supporting font for cards and labels, with its licence included. Keep the traceable handwriting model separately authored and visually consistent. Never mirror the SVG board to implement RTL.

### Review states

Use `draft`, `pendingReview` and `approved` for geometry and audio independently. Review records identify the asset revision, reviewer, review date and reference. Approval is supplied by a real review; Codex must not invent reviewer names or mark its own guessed paths approved.

Draft assets can support development and adult preview. Only assets with approved geometry and the required approved recordings appear as complete lessons in the student-ready catalogue. Show unavailable content clearly in the teacher view.

When reviewed assets are unavailable, continue implementing the engine, integration, fixtures and review tooling. Produce a usable development preview, a precise missing-asset list and instructions for supplying assets. Do not claim all 37 letters or the pronunciation curriculum are finished.

### Data contract

Use a manifest with these concepts. The example deliberately contains no teaching geometry or recording; it is a schema illustration, not a runnable lesson.

```json
{
  "id": "ba",
  "glyph": "ب",
  "labelMs": "Ba",
  "contentVersion": 1,
  "viewBox": [0, 0, 1000, 1000],
  "geometry": {
    "status": "pendingReview",
    "review": null,
    "displayPaths": [],
    "strokes": [],
    "dotTargets": [],
    "validSequences": []
  },
  "audio": {
    "name": {
      "src": null,
      "transcriptMs": "Ba",
      "status": "pendingReview",
      "review": null
    },
    "pronunciationExamples": []
  }
}
```

Each stroke records an ID, SVG path data, reference width, start/end gates, pen-lift policy and any authored checkpoints. Each dot records an ID, a centre, a visible shape, a hit region and an interaction policy such as a tap or a short stroke. Sequences reference those IDs in order.

Validate manifests before enabling lessons: valid geometry, finite coordinates, unique IDs, existing files, correct sequence references and review/version consistency. Reject empty approved geometry. If accepting external SVG, use a restricted path-data format and reject embedded scripts, external URLs and arbitrary markup.

## 5. Precise tracing engine

### 5.1 Coordinate system

- Give the board a stable logical `viewBox`, initially `0 0 1000 1000`.
- Convert every pointer's screen position into that same coordinate system with the inverse `getScreenCTM()` transform. This handles board position, scaling and SVG layout. [SVG transform documentation](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getScreenCTM).
- Keep geometry, validation and saved input in logical coordinates. Do not compare screen pixels against SVG coordinates or apply device pixel ratio twice.
- Keep the board's aspect ratio. During an active gesture, a layout/orientation change cancels the unfinished stroke without awarding success; already completed strokes remain.

### 5.2 Reference preparation

Flatten each authored curve into a polyline with an arc-length table. Sample adaptively enough to resolve curves; use the SVG path geometry API at preparation time and pass the resulting arrays into the pure validator.

Store coordinates, cumulative length and ordered checkpoints. Unit tests use independent line/curve fixtures, not browser-only geometry or samples produced by the matcher being tested.

### 5.3 Input collection

- Handle `pointerdown`, `pointermove`, `pointerup`, `pointercancel` and `lostpointercapture`.
- Track one active `pointerId`; ignore additional contacts during its gesture. Do not use pressure as a mandatory success condition.
- Capture the pointer at gesture start so leaving the board does not leave the input state stuck. Set `touch-action: none` only on the tracing surface. Preserve scrolling and normal browser access elsewhere. [Pointer capture documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).
- Process coalesced native samples when available. Feature-detect `getCoalescedEvents()` and fall back to ordinary move events; support and secure-context requirements vary. Do not count both a coalesced list and a duplicate parent event. [Coalesced-event documentation](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents).
- Keep chronological raw samples before cosmetic smoothing. Update drawing through `requestAnimationFrame` and refs; avoid triggering a React render for every sample.

### 5.4 Stroke matching

Implement a stateful, ordered matcher, not a nearest-point percentage over the whole letter.

1. A new stroke starts only inside its reviewed start gate. A later stroke or distant part of the current stroke cannot start progress.
2. Project each sample onto nearby segments in a **local arc-length window** around the last accepted progress. The window depends on observed movement and a capped forward allowance.
3. Check distance to the active centreline and forward progress. Allow small backward movement for normal hand jitter; large reversals do not advance the stroke.
4. Validate the movement between samples as well as their endpoints. Resampling a plausible short movement can detect a straight shortcut across a curve.
5. Do not fabricate a completed route between distant samples. Reject or pause suspicious large gaps before interpolation. A touch at the start followed by a touch at the end must never pass.
6. Credit only the contiguous validated prefix. Do not fill unvisited intervals because a later point is close to the end.
7. Near crossings or close branches, preserve the active branch and sequence. Never jump to a distant segment merely because it is spatially closer.
8. Validate a whole raw movement segment before rendering it. Deviation blocks the gesture until release, removes its provisional ink and restores its pre-gesture baseline. Returning with the same held pointer cannot recover validity. Wrong starts produce no ink and follow the same blocking rule.
9. In guided mode, a clean early lift can save a prefix and resume near that frontier. A rejected resume preserves only the earlier clean prefix. In precision mode, an early lift restarts an unfinished continuous stroke. Normal pen lifts between separate strokes are supported; cancellation/resize clears unfinished work while retaining completed parts.
10. Complete a stroke only when its required checkpoints and contiguous coverage are satisfied and the pupil reaches its end gate. Do not force success after a timeout.

Evaluate the pupil's actual movement. Render only accepted raw stroke segments without snapping or replacing them with the reference line. Keep rejected raw movements separately in bounded in-memory diagnostics. A demonstration animation may reveal ideal ink, but demonstration input must never reach the pupil matcher.

### 5.5 Dot and mark matching

- Check each required dot independently and once per attempt.
- Current tap-policy dots require a deliberate down/up gesture, live containment and a small cumulative travel limit. A failed dot gesture stays rejected until release and produces no freehand trail. A valid tap stamps one authored target; record `validatedTapStamp` assistance and actual tap coordinates separately.
- One broad gesture must not fill several dots. Overlapping target regions need an explicit disambiguation rule or a larger board, not automatic completion.
- Encode dot order only where the teacher-reviewed sequence requires it.
- Finish the letter only after all required strokes and marks are complete.

### 5.6 Initial calibration values

These are engineering starting points for a 1000-unit board. They are not KPM standards and must be tuned using real traces on the actual board size.

| Setting | Guided touch | Precision touch | Guided pen/mouse | Precision pen/mouse |
| --- | --- | --- | --- | --- |
| Centreline corridor radius | 34 | 24 | 22 | 16 |
| Start gate radius | 46 | 34 | 30 | 24 |
| End gate radius | 38 | 30 | 26 | 20 |
| Minimum contiguous stroke coverage | 98% | 99% | 98% | 99% |
| Backward jitter allowance | 10 | 6 | 10 | 6 |
| Dot hit radius, clamped to authored region | 34 | 28 | 24 | 20 |
| Dot cumulative travel limit | 20 | 14 | 14 | 10 |

These are the implemented v2 defaults. Teacher-selected guided support adds 8
units to body/start/end radii only. Raw-gap limit is 80, per-event advancement
cap 90 and local projection tie band 3. The guided visible corridor includes
the accepted centre radius plus half the 15-unit ink width.

Begin with reference samples no more than about 4 logical units apart and finer sampling around tight curves. Set raw-gap rejection, backward jitter and maximum advancement bounds explicitly in configuration and test them; do not leave them as hidden magic numbers.

Adjust per-letter settings if stroke branches or dots are close. A tiny phone board must not become easier through overlapping tolerance regions: enlarge the board, offer landscape layout, or explain that a larger display is needed. Log the profile used for every attempt. Do not silently change tolerances during a precision attempt.

### 5.7 Metrics and success

Keep separate metrics for coverage, cross-track error, backward movement, invalid input, dots, retries and assistance. Use arc-length-weighted measurements so a paused finger does not dominate an error average. Define how invalid segments contribute rather than ignoring every rejected point in an "accuracy" score.

Separate `guidedComplete` from `precisionComplete`. Guided feedback can preserve valid work while the pupil retries. A precision attempt must satisfy its stricter continuity and configured deviation budget; frequent incorrect movement must not earn the same outcome as a clean trace.

Numerical accuracy is for teacher diagnostics. A child sees specific encouragement and the next useful action. Neither tracing completion nor a geometric percentage should be labelled independent handwriting mastery or official TP.

## 6. Audio and pronunciation

- Bundle local recordings of a competent Malay-speaking educator, with permission to use them. Record and review all letter names before student-ready release.
- Distinguish **letter name**, **pronunciation example** and **instruction** in the manifest and interface.
- Where appropriate, illustrate a letter's sound through a reviewed syllable or word. Do not invent one universal sound for every Jawi character or use Arabic vowel-bar recitation as a substitute for Malay Jawi pronunciation.
- Use actual recordings for the teaching content. Browser speech synthesis may be an explicitly labelled development aid for general instructions, but is not evidence of correct Jawi pronunciation. Beeps are effects, not pronunciation assets.
- `Mula` and `Dengar` provide user gestures for audio. Handle playback rejection gracefully with a replay button; browsers can block autoplay. [Autoplay documentation](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- Stop previous narration when changing letters or replaying. Ensure late loads cannot play the previous lesson's audio. Avoid narration on every pointer movement.
- Include mute, volume and visible text equivalents. Missing or failed pronunciation assets must be reported honestly; never silently play another letter.
- Keep recording transcript, language, speaker permission/reference, review status and content revision in asset metadata. Verify file existence and actual playback, not just the presence of a path string.

## 7. Layout and accessibility

Use a calm, playful design with a cream background, teal accents, limited animation and clear contrast. Large, readable Jawi is the main visual focus; decorative art stays outside the tracing area.

- Large DOM controls, initially at least 48 CSS pixels in their main dimension, with spacing suitable for young fingers.
- A square tracing board using most of the available tablet area; sensible portrait and landscape layouts.
- Label Jawi text with appropriate language/direction and isolate it from Malay/Rumi text using `dir="rtl"` and `bdi` where needed. Screen layout and trace coordinates remain independent from text direction.
- Keyboard-operable menus, visible focus and text/status alternatives to sound or colour alone.
- Reduced-motion support and an instant/static alternative to stroke animation.
- Encourage correct position without humiliating language or flashing error effects.
- Keep review labels and technical settings in the teacher view or adult preview, not inside normal child lessons.
- Audio and navigation controls remain usable by either hand. Handedness must not mirror the letter or change the reviewed stroke model.

## 8. Application structure

Suggested structure when implementation is later authorised:

```text
index.html
package.json
src/
  main.jsx
  App.jsx
  styles/
    tokens.css
    app.css
  screens/
    WelcomeScreen.jsx
    LetterGarden.jsx
    LessonScreen.jsx
    ResultScreen.jsx
    TeacherScreen.jsx
  components/
    TraceBoard.jsx
    AudioControls.jsx
    LetterCard.jsx
  tracing/
    geometry.js
    prepareReference.js
    matcher.js
    dotMatcher.js
    traceReducer.js
    inputController.js
    profiles.js
  content/
    letters.json
    validateContent.js
  audio/
    audioManager.js
  storage/
    progressStore.js
public/
  audio/
  fonts/
  models/
tests/
  geometry/
  fixtures/
  browser/
docs/
  CONTENT_REVIEW.md
  AUDIO_RECORDING.md
  ACCEPTANCE.md
README.md
```

Keep geometry/matching independent of React, audio and storage. Use an explicit reducer/state machine for `idle`, `demo`, `awaitingStart`, `tracing`, `awaitingMark`, `retry`, `paused` and `complete`. Clear listeners, animation frames and audio on unmount or lesson changes, including React development remounts.

The input controller feeds chronological samples to the matcher. Only the matcher can award tracing completion. The UI renders its decisions; an animation or button cannot bypass them.

## 9. Progress storage

Start with local-only profiles identified by nicknames or icons. Store summaries rather than large raw traces in localStorage. Keep short diagnostic traces in memory; export them only through a deliberate teacher action.

An attempt summary includes letter/model/audio versions, timestamp, input type, mode, tolerance profile, coverage, error summaries, dots, assistance, retries and outcome. Strict attempts also include optional policy fields (`strict-v2`, `validatedSegments`, `validatedTapStamp`) and blocked/wrong-start/dot-rejection/rollback counts. Keep storage version 1 and numeric demonstration assistance; legacy records are not relabelled. Changing content versions should make older results distinguishable.

Handle unavailable storage, corrupt JSON and version migration without breaking lessons. Offer local JSON export and a deliberate reset action. Explain in the teacher view that this progress stays in that browser and does not automatically synchronise to another device.

Accounts, cloud services, leaderboards and voice recording are outside the initial scope. A future installable/offline version needs a separately verified caching policy; the initial static build must not claim offline support merely because assets are local.

## 10. Verification and acceptance criteria

The geometry engine is critical functionality, so behavioural tests are necessary. Tests must check valid and invalid input rather than merely mirror implementation functions. [Vitest documentation](https://vitest.dev/guide/).

### Automated geometry and state cases

1. A forward trace within tolerance completes every required stroke and dot.
2. A reversed stroke, wrong start or wrong stroke order cannot complete.
3. Start-to-end teleport, endpoint tapping and sparse checkpoint-only input cannot complete a long stroke.
4. A straight chord through a curved letter fails even when its endpoints are correct.
5. Missing or misplaced dots fail; one tap cannot satisfy several targets.
6. Scribbling across the board, repeated circles or dwelling at one point cannot manufacture coverage.
7. A crossing or nearby branch cannot jump progress to the wrong part of the path.
8. Pen lift/resume follows the selected mode and does not bridge missing travel.
9. Out-of-corridor input rolls back the gesture; held-pointer re-entry cannot earn progress or completion.
10. Small realistic jitter is tolerated; a large backtracking gesture does not advance.
11. Pointer cancellation, capture loss and a second contact leave the state recoverable without false completion.
12. Equivalent logical input produces equivalent decisions after board scaling and repositioning.
13. Rendering/smoothing cannot alter matcher results. Demo input cannot update progress.
14. Frequent invalid movement is reflected in diagnostics and precision outcomes.
15. Invalid or incomplete manifests cannot become approved lessons.

Use independent synthetic fixtures for these cases and, when supplied, anonymised teacher-reviewed trace fixtures. Cover threshold boundaries and long/short curves. Include deterministic timestamps and sample spacing so failures are reproducible.

### Browser checks

- Test supported Chromium, Firefox and WebKit paths. Playwright device emulation helps exercise layout and touch settings; it is not proof of real stylus or finger behaviour. [Playwright emulation documentation](https://playwright.dev/docs/emulation).
- Exercise the complete welcome-to-result flow with real input handlers, not only injected success state.
- Verify SVG transforms after scrolling and resizing, two-finger interference, orientation interruption and a drag outside the board.
- Verify audio replay, mute, denied autoplay, missing audio and rapid lesson switching.
- Verify progress reload, export, unavailable/corrupt storage, keyboard navigation and reduced motion.
- Inspect Jawi glyphs, alignment and dots on a real tablet, including iPad Safari and Android Chrome where available. Record real-device checks as pending when no hardware is available.

### Measurable acceptance

- All deterministic valid fixtures pass and all listed invalid fixtures fail without completion.
- No runtime/build errors or stuck gestures in tested flows.
- Student-ready lessons have approved, version-matched geometry and required audio.
- Only validated actual tracing segments are visible; scoring uses raw input and records assisted dot stamps. Free copying retains actual unrestricted ink.
- Coordinate checks pass across representative 320, 768 and 1280 CSS-pixel viewports and multiple display densities; very small boards still enforce target separation.
- On a named reference device, measure pointer processing and drawing responsiveness under sustained tracing. Aim for feedback within approximately 50 ms without unbounded memory growth. Report measurements instead of promising universal performance.
- A teacher checks handwritten shape, start points, direction, lifts, dots and recordings. Teacher/pupil calibration is recorded separately from technical test results.

## 11. Implementation phases

| Phase | Deliverable | Exit condition |
| --- | --- | --- |
| 1. Foundation | React/Vite shell, screens, catalogue schema, local storage and asset status handling. | Responsive navigation works; pending content is honestly represented. |
| 2. Tracing core | Geometry preparation, input pipeline, matcher, marks and deterministic tests. | Valid/invalid fixtures satisfy section 10. |
| 3. Vertical slice | A complete demo/trace/result flow for representative draft or reviewed letters. | Browser flow works; asset review state is accurate. |
| 4. Pilot content | The 12-letter set, pronunciation integration and teacher diagnostics. | Engine checks pass; asset gaps/review status are explicit. |
| 5. Full catalogue | Remaining letters and content-specific fixtures. | Each enabled lesson satisfies its review and geometry requirements. |
| 6. Calibration | Real-device and teacher/pupil checks; documented parameter adjustments. | Accuracy and usability evidence is recorded with device and content versions. |

Continue independent engineering work when content review is pending. Technical completion and teaching readiness must be reported separately. Reading/copying words can be a later expansion; do not silently include a large new curriculum module in the initial alphabet release.

## 12. Deliverables for the future build

- Runnable source code and lockfile.
- Responsive Malay UI and functioning tracing engine.
- Full letter catalogue with truthful asset states, plus an operational pilot/development preview.
- Audio loader, transcript metadata and integration for approved recordings.
- Geometry/state/browser tests and an acceptance report.
- Content review checklist and a recording guide explaining exactly what assets are missing.
- README covering setup, build, testing, progress storage and how to add/revise letter models.
- A final implementation report describing the actual supported letters, approved assets, tests performed, unverified devices and remaining dependencies.

Do not describe a prototype as a complete educational release if its stroke or audio assets remain unreviewed.

## 13. Technical references

Official technical documentation checked on 2 October 2026:

- [React - components, state and events](https://react.dev/learn).
- [Vite - development and build tooling](https://vite.dev/guide/).
- [MDN - Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events).
- [MDN - pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).
- [MDN - coalesced pointer events and support limitations](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents).
- [MDN - points along SVG geometry](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength).
- [MDN - SVG screen coordinate transform](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getScreenCTM).
- [MDN - browser audio autoplay policies](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- [Vitest - testing guide](https://vitest.dev/guide/).
- [Playwright - device and browser emulation](https://playwright.dev/docs/emulation).

The matcher, calibration values and lesson architecture are proposals for this project, not algorithms prescribed by these browser/library documents or by KPM.

## 14. Copy-ready Codex super prompt

Copy the entire block below into Codex **when you want implementation to start**, with this file and the research PDF available in the workspace. This future prompt authorises implementation; it has not been executed by preparing this document.

```text
Implement Jawi Prasekolah in this workspace as a browser-based educational game.

First read applicable AGENTS.md instructions, IMPLEMENTATION.md in full, and
output/pdf/Kajian_Jawi_Prasekolah_KPM_2026.pdf. Inspect the existing project and
preserve existing work. Use IMPLEMENTATION.md as the specification. This message
authorises implementing the game locally. Do not deploy or publish it.

Build with React + Vite, JavaScript/JSX, HTML, plain CSS, native SVG and browser
Pointer Events. Use a pure JavaScript geometry validator. Choose current compatible
stable packages, verify relevant APIs and commit a lockfile. Do not convert this
project to TypeScript or add cloud services without a concrete requirement.

The intended users are Malaysian preschool children. The child-facing interface
must be in Bahasa Melayu, playful, calm and easy to use with a finger or stylus.
Create Welcome, Letter Garden, Lesson, Result and Teacher screens. Use large DOM
controls, a spacious tracing board, readable Jawi, appropriate RTL text isolation,
keyboard-accessible menus, reduced motion, mute and audio replay. Keep technical
settings in the teacher view. Do not mirror the letter or board for RTL/handedness.

Teach recognition, letter names, pronunciation examples where appropriate, and
writing practice. The flow is Hear -> Watch -> Trace -> Retry with less help -> Copy.
Do not claim alphabet tracing alone covers all KP2026 Jawi outcomes or is a TP score.
Include the 37-letter catalogue. Build a vertical slice before expanding the
12-letter pilot: alif, ba, ta, dal, ra, sin, kaf, lam, mim, nun, wau, ya.

The most important requirement is tracing correctness. A decorative drawing demo
or a validator that accepts scribbles is not sufficient. Implement:
- A stable logical SVG coordinate space and inverse screen transforms.
- Reviewed or explicitly draft centreline paths, start/end gates, pen movements,
  required dots and allowed sequences. Font outlines are not writing strokes.
- Curve sampling with arc-length tables and independent geometry fixtures.
- Native pointer capture, chronological raw samples, one active pointer,
  coalesced-event feature detection, cancellation and listener cleanup.
- Start gating, local ordered path projection, direction checks, bounded advancement,
  continuous coverage, movement-segment validation and branch continuity.
- Rejection of teleports, straight shortcuts across curves, endpoint tapping,
  missing sections, reversed strokes, wrong sequence and repeated scribbling.
- Gesture rollback on deviation, blocked until release; never bridge an invalid
  interval. Resume rules must follow guided/precision mode and reviewed pen lifts.
- Independent dot/mark validation; one gesture must not fill multiple dots.
- Completion only after every required stroke/checkpoint/mark is satisfied.
- Actual pupil ink, no hidden snapping, no ideal-line replacement and no success
  forced by timeouts. Demonstrations cannot update pupil progress.
- Explicit configurable tolerances, separate guided/precision outcomes and honest
  metrics for error, invalid travel, coverage, retries and assistance.

Follow section 5 of IMPLEMENTATION.md for detailed behaviour and initial calibration.
Treat its numeric values as starting points to test, not universal teaching rules.
Ensure small viewports do not make neighbouring dots/branches indistinguishable.

Teaching assets are a separate accuracy dependency. Do not invent authoritative
stroke orders, recordings, teacher approvals or reviewer identities. If approved
assets exist, use them and retain their review/version metadata. If they do not,
implement the engine and an adult development preview with clearly marked draft
models, and create docs/CONTENT_REVIEW.md and docs/AUDIO_RECORDING.md listing the
exact remaining assets. Keep pending geometry/audio out of the student-ready
catalogue. Continue all independent engineering work instead of stopping the whole
build for missing content. Report the content dependency candidly.

Audio must distinguish names, pronunciation examples and instructions. Use locally
packaged, permissioned, reviewed Malay recordings for teaching. Do not substitute
beeps or unreviewed speech synthesis for Jawi pronunciation. Start audio through user
interaction, handle autoplay rejection, stop overlapping/obsolete narration, and
show a replay action. Missing audio cannot silently play another letter.

Keep rendering, matcher, input, audio, content validation and storage separate.
Use an explicit lesson/stroke state machine. Store versioned attempt summaries
locally with profile icons/nicknames; handle corrupted/unavailable storage and
provide teacher export/reset. Save actual copy attempts for teacher review without
claiming that the guided engine recognises independent handwriting.

Create the source, README, content/recording guides, automated tests and
docs/ACCEPTANCE.md. Follow the implementation phases in section 11. Install and run
the necessary development dependencies now that implementation is authorised.
Verify the production build, meaningful geometry/state tests and browser flows.
Inspect the rendered UI and test actual input handlers.

Cover all adversarial cases in section 10, particularly skipped coverage, sparse
samples, chord shortcuts, branch switching, missing dots, cancellation, re-entry,
second touches, resizing and false success from animation. Include realistic jitter
fixtures and coordinate scaling checks. Test audio failure/replay, persistence,
accessibility and lesson switching. Distinguish browser emulation from real-device
testing; do not claim tablet/stylus checks that were not performed.

Persist until the authorised engineering work is implemented and appropriately
verified. Do not stop after a scaffold or a plan. If teacher assets or physical
devices are unavailable, finish what can be verified, keep content honest and list
the exact remaining dependencies. Do not claim the education release is ready until
its geometry and required audio are actually reviewed.

Finish with a concise report: what works, how to run it, which letters/assets are
approved or draft, which checks passed, and what remains for teaching readiness.
```
