# Interactive alphabet book verification

Date: 2 October 2026, Asia/Kuala_Lumpur.
Authorisation: the user approved the [implementation plan](INTERACTIVE_BOOK_LAYOUT_IMPLEMENTATION.md)
with “proceeed”. This is implementation verification, not a teacher assessment.

## Delivered behaviour

- Untimed practice opens **Buku Jawi Saya** from its letter contents. Wide screens
  show an open spread; compact screens use one writing page with a reference header.
- Large labelled previous/next/contents controls turn pages. The selected eligible
  catalogue filter determines the sequence, and its final letter leads to a closing
  page. Reopening unfinished work starts a fresh attempt.
- The book and completed writing remain mounted at practice completion. Saved
  stickers require a validated practice outcome for the current profile, revision
  and mode. Preview, free-copy and competitive records cannot create book stickers.
- A decorative 360 ms blank paper fold supplies the turn effect. Reduced motion
  changes pages immediately. Duplicate activation, held writing/dot contact and
  demonstrations cannot turn pages. Resize and the 420 ms fallback recover pending
  turns. PageUp/PageDown work within the labelled navigation rail.
- Unsaved free copies offer Save/Discard/Return before book, home, teacher or
  preview exits. Successful tracing and saved copies are recorded once.
- Solo challenges and both Duo books use a shared between-round turn. Existing
  ready/countdown, independent input, shared pause/deadline, scoring and trophies
  remain controlled by the original match modules.

## Checked build and environment

`npm run build` passed, including content validation: **37 letters, 37 models,
37 student-ready lessons**. The local production preview at
`http://127.0.0.1:4173/` serves JavaScript `index-Cvp3q2w3.js` and CSS
`index-BgvUgsC8.css`. Node is 24.19.0; Playwright is 1.63.0. The visual report
records Chromium's actual version; the installed browser manifest identifies
Chromium 153.0.8010.12 and WebKit 26.6.

`npm test` passed **81 checks across seven files**, including selected-sequence
boundaries and completion filtering. The later changes concerned presentation,
browser readiness and a ResizeObserver cleanup; unit-tested rule inputs remained
unchanged. Build and browser checks cover those integration changes.

## Browser checks

The final production selection uses Chromium and WebKit with two workers:

```powershell
$env:JAWI_EVIDENCE_DIR='output/verification/interactive-book/matches'
npx playwright test book-layout.spec.js ui-theme.spec.js ui-zoom.spec.js game.spec.js play-tracing.spec.js strict-tracing.spec.js touch.spec.js numbered-guides.spec.js letter-batch-3.spec.js solo-duo.spec.js --grep-invert 'completes every approved movement and dot' --config output/verification/interactive-book/playwright.config.mjs --project chromium --project webkit --workers 2
```

Final covered result: **157 unique passed cases, nine expected CDP skips,
zero unresolved failures**. The [combined result](../output/verification/interactive-book/final-results.json)
links each case to its latest run. The broad
[production selection](../output/verification/interactive-book/browser-results.json)
passed 154 cases with one keyboard-scroll failure and nine skips. After correcting
the test's scroll/paint timing, a focused follow-up passed four cases: the keyboard
case in both browsers and two new synchronized Duo-turn/clock cases.

```powershell
$env:JAWI_EVIDENCE_DIR='output/verification/interactive-book/matches'
npx playwright test play-tracing.spec.js solo-duo.spec.js --grep 'Ta dot drag keeps body|shared book turn keeps both' --config output/verification/interactive-book/followup.config.mjs --project chromium --project webkit --workers 2
```

See [follow-up results](../output/verification/interactive-book/browser-followup.json).
The application build stayed unchanged between these runs. The keyboard check now
waits for focus scrolling to paint before pressing/holding the keys; both accepted
pad actions remain real key releases. The Duo check suppresses animation-end,
proves both frames use the same bounded turn, and verifies the next round's clock
waits for both players' readiness.

This selection covers deliberate/duplicate turns, end/replay/revisit, filtered
books, keyboard focus, missing animation events, active-contact/demo guards,
unsaved-copy Save/Discard/Return, preview separation, current storage recovery and
export/reset, strict/play input, guides and complex routes. It checks all 15 final
models' stroke/dot stages at phone and portrait-tablet sizes. The unchanged
geometry does not require repeating all 45 per-model/per-mode geometry cases;
representative guided/precision regressions cover the changed lesson integration.

Native Chromium CDP checks cover touch at DPR 2/3, pen, held final-dot navigation,
separate dots and simultaneous Duo touch in both tablet orientations. WebKit's
CDP cases remain explicit skips, not evidence of native WebKit touch.

An earlier production layout selection passed **38 cases with two CDP skips**.
Its [record](../output/verification/interactive-book/browser-production-layout.json)
belongs to the preceding build. The final selection refreshes that coverage for
the current build, including the 56 px free-copy save control.

## Visual evidence

`node scripts/verify-interactive-book.js` passed against the production preview:
**45 captures, seven viewport journeys, zero page errors**. The
[visual report](../output/verification/interactive-book/visual-results.json)
records the build, viewport dimensions, saved completion identifiers and captures.

| Viewport | Writing SVG width |
| --- | --- |
| 320 × 740 | 280 px |
| 390 × 844 | 350 px |
| 1024 × 768 | 416 px |
| 768 × 1024 | 618 px |
| 1280 × 720 | 368 px |
| 1920 × 1080 | 598 px |
| 844 × 390 | 280 px |

Each journey captures contents, Nga's starting guide, separate dots, completion
and the next letter. Additional captures cover Alif, the book closing page, a
normal-motion turn, 200% document zoom, copying confirmation, and Qaf's closed
head, bowl, separate dots and completion. SVG coordinates are recalculated after
scroll/capture/layout changes. Writing remains square, with no horizontal overflow.
Taller pages scroll to retain readable guides and generous paper.

Representative captures were visually inspected for paper/guide containment,
reference placement, labelled controls, completion and copy confirmation. Match
26 captures under [matches](../output/verification/interactive-book/matches/) cover
Solo/Duo readiness, racing, dots, pauses, teacher history and trophies.

## Inputs and resolved failures

All **93 protected files** match the pre-change SHA-256 snapshot. This includes
teaching data/validation, tracing rules, recordings/assets, saved-progress modules,
match configuration/reducer/clock/scoring, dot controls, numbered guides and package
inputs. The board integration exposes busy state and guards its ResizeObserver
cleanup; teaching shapes, tolerances and input policies remain unchanged.

The [baseline](../output/verification/interactive-book/protected-before.json)
and **156** [final input fingerprints](../output/verification/interactive-book/final-inputs.json)
identify the relevant sources, tests, configuration and dependencies.
Repeat affected checks if these inputs, assets, runtime or build change.

Development checks exposed narrow-paper sizing and next-button placement, which
were corrected. A visual run found a stale ResizeObserver callback after page
unmount; its callback now holds the observed SVG and checks connection/cleanup.
An initial completion-position assertion compared viewport coordinates after
Playwright scrolled a control into view; it now compares document coordinates.
The copy test now waits for the new page to settle before drawing, matching the
book's intentional input-ready boundary. The focused keyboard repeat also waits
for focus scrolling to paint. Earlier reports retain these failures;
they are not final acceptance evidence.

## Limits

Firefox remains unavailable on the recorded Windows runtime (`spawn UNKNOWN`).
The tested local WAV fixture is unsupported by WebKit; successful playback is
covered by Chromium, and unavailable-playback handling remains covered separately.
Native CDP touch/pen is emulation, not a physical device assessment. Classroom,
pupil, physical smartboard and tablet review remain pending. No deployment was made.
