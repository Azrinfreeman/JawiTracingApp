# Solo and Duo 1v1 verification

Date: 2 October 2026, Asia/Kuala_Lumpur.

The user's “continue” authorised the implementation described in
[the plan](SOLO_DUO_IMPLEMENTATION.md). Local Solo challenges and simultaneous
Duo 1v1 are implemented and verified against the final production preview.

## Delivered behaviour

- Welcome defaults to Solo / Latihan santai. Cabaran trofi and Duo 1v1 lead to
  setup with separate local profiles, eligible letter pools and adult settings.
- Defaults: five distinct shared letters, 90 seconds each. Options: 3/5/10
  rounds and 60/90/120 seconds. Rematches preserve settings and letter order
  while generating a new ID; Huruf baharu selects a fresh sequence.
- Duo requires an observed two-contact touch check. Mouse-only adult layout
  preview has no saved attempts, match scores or trophy. Device capability
  reports alone do not unlock scored Duo.
- Both lanes use the same locked Jejak Ceria touch tolerance, square dimensions,
  shared countdown and active-time deadline. Each owns its matcher, pointer
  capture, accepted progress, retry count and dot pad. SVG pattern IDs are unique.
- Landscape uses equal side-by-side lanes; portrait tablets use equal stacked
  lanes with support controls beside the boards. A minimum 280 CSS-pixel Duo
  board and measured control fit determine eligibility. Inadequate space pauses
  both lanes while retaining their accepted work. Solo remains available on phones.
- Global pause, resize/orientation, fullscreen changes and page visibility loss
  cancel held contacts and stop active time for both players. Resume counts down
  again and requires a fresh contact. Live tracing cannot invoke demo/audio.
- Matcher acceptance supplies the completion timestamp directly, before painting.
  Duplicate, stale, paused and late completion callbacks cannot score. A captured
  timestamp exactly at the deadline qualifies; unfinished work receives zero.
- Scores follow speed-v1: 100 for valid completion plus up to 100 for speed,
  with durations rounded upward to 100 ms. Duo totals decide the winner, then
  summed durations break point ties; differences up to 100 ms share the trophy.
  Both-zero matches receive none. Solo must finish every round to earn bronze,
  silver or gold at 100/140/170 points per round.
- Successful competitive traces enter existing progress once under the correct
  profile and match/round/player ID. Timeouts are match outcomes rather than
  fabricated successful attempts. Separate match history retains 50 summaries,
  including revisions, settings, outcomes, observed input, retries and pauses.
- Teacher history tags competitive attempts and displays match summaries. Export
  version 2 contains both stores; reset explicitly clears both. Storage failures
  retain in-memory results for export. Reload never restores an active race.
- Released tracing contacts consume their ensuing compatibility click before it
  can reach a newly rendered action. A new pointer/key action immediately removes
  that guard; separate player contacts remain independent.

## Completed checks

| Check | Scope | Result |
| --- | --- | --- |
| `npm test` | Scoring, ties, injected clock, lifecycle, corrupt/quota storage, idempotent saves, legacy progress, click handoff; existing geometry/content/audio units | 78 passed |
| `npm run build` | Current content validation and production compilation | Passed; 37 models and 37 student-ready lessons |
| Native mobile handoff follow-up | Chromium CDP, 320 × 740, Ca and Nga with separate dot-pad taps, five repeats each, two workers | 10 passed |
| Broad regression | Chromium/WebKit, existing lessons, all authored models in play/guided, additional models in precision, touch/pen, interruptions, copying, export, branding, guides, layout/zoom and competitive modes; two workers | 349 passed, 10 expected CDP skips; one WebKit context teardown timeout, resolved by the production repeat below |
| Final production follow-up | Chromium/WebKit at `127.0.0.1:4173`; all match cases, added portrait simultaneous dot controls/history, Solo 320 × 740 and 844 × 390, plus the demo case from the broader run | 35 passed, 3 expected WebKit CDP skips, zero failures |

The initial wider run exposed mobile Ca/Nga completion handoffs and was stopped
for the contact-click fix. Its incomplete run is not final verification evidence.
Before-fix traces are retained in `output/verification/solo-duo-*-handoff-before.zip`.

Broad regression command:

```text
npx playwright test solo-duo.spec.js game.spec.js ui-theme.spec.js ui-zoom.spec.js branding.spec.js numbered-guides.spec.js strict-tracing.spec.js play-tracing.spec.js touch.spec.js pilot.spec.js letter-batch-1.spec.js letter-batch-2.spec.js letter-batch-3.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json
```

Final production command:

```text
npx playwright test solo-duo.spec.js game.spec.js --config=output/verification/solo-duo-production.config.js --workers=2 --reporter=line,json -g 'Solo|Duo|shared pause|touch gate|captured contact|storage failure|held dot pad|fullscreen rejection|demo never updates'
```

The wider run's sole remaining failure was closing a WebKit context after its
demo assertions, not a failed game assertion. That case passes in both browsers
on the final production build. After the broader run, match-only follow-ups
gave Solo a usable board on short screens, moved ready audio into the toolbar,
checked vertical control overflow and made the pilot pool label data-derived.
All affected match cases were then repeated in both browsers on production.

Reports: [broad regression](../output/verification/solo-duo-regression.json),
[production](../output/verification/solo-duo-production.json).
Inputs: [broader stage](../output/verification/solo-duo-regression-inputs.json),
[final stage](../output/verification/solo-duo-inputs.json).
Final production bundles: `index-BRjy5ctv.js`, `index-HgAzX1tz.css`.
Their hashes, source/test inputs and Node runtime are recorded in the final manifest.
Unit-test dependencies and protected teaching data did not change after their
passed checks. Final source/test fingerprints matched after production verification.

## Evidence and preservation

The pre-change baseline is
[solo-duo-before.json](../output/verification/solo-duo-before.json): 75 protected
files covering all letter content, public assets/recordings and core matcher,
tolerance and writing-guide modules. Comparison after implementation found zero
changes. No geometry, audio revision or approval was changed.

There are 25 captures under `output/verification/solo-duo/`. Inspected states include
landscape/portrait preparation and racing, individual round results, shared
trophy, setup, two-contact check, countdown, portrait dot pads, teacher history,
Solo phone trophy, paused recovery and inadequate-space guidance. The
portrait control overlap found during review was corrected before final checks.
Captures disable entrance animations so transient opacity is not mistaken for
the final design.

## Limits

Native simultaneous input is tested through Chromium CDP emulation, not a
physical smartboard or tablet. Physical two-child use, touch hardware and
classroom ergonomics still need an on-device check. Firefox's previously recorded
`spawn UNKNOWN` failure was not retried without a changed runtime. WebKit's
previous audio-codec limitation remains unrelated to these approved recordings.
No teacher or pupil assessment is invented by these engineering checks.

Repeat checks when their relevant source, dependencies, content, build, runtime
or device changes. Historical theme and approval reports retain their original
scope; they do not verify this changed application.
