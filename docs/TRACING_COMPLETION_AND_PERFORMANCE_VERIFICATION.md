# Tracing completion and performance delivery

Implemented on **3 October 2026**, Asia/Kuala_Lumpur, following the user's explicit
implementation authorisation. Scope: the Alif finish/recovery issue shown in
`problem2.mp4` and tracing processing cost. The [implementation plan](TRACING_COMPLETION_AND_PERFORMANCE_IMPLEMENTATION.md),
[Kaf/Ga correction](KAF_GA_SHAPE_CORRECTION_IMPLEMENTATION.md) and supplied
[picture](references/kaf-ga-user-reference.png) informed the work.

## Delivered behaviour

- A shared finish summary exposes the measured frontier, remaining arc,
  checkpoint/coverage satisfaction and current release readiness. The same
  predicate controls validation and the held finish cue.
- The final destination keeps an outlined dashed badge until ready. A valid
  held trace then says **Angkat jari untuk siap**, or asks for release before
  the next body/dot. An unfinished near-end lift says **Sambung dari anak panah
  hingga 3** for Alif, using the actual final number for other parts.
- The offset green arrow and leader expose the real saved frontier. A thin
  remaining route stays below the number overlay, keeping the number readable.
  Endpoint taps add no coverage and cannot arm a contact clipped beyond the
  existing acquisition interval. Resume at the frontier and trace forward.
- The 95% minimum, authored checkpoints, endpoint radius, separate dots,
  strict profiles, turn allowance and sampling/subdivision remain intact.
  Stationary taps cannot finish a body. Real movement delivered on up is still
  validated; a cancelled gesture never commits.
- Arc searches now find the relevant segments by binary search. The direction
  search projects directly onto those segments. Boundary segments and earliest
  ties are preserved, with independent full-scan comparisons for straight,
  curved, loop, crossing and hairpin references.
- Input reads/inverts a fresh SVG matrix once per dispatched batch, processes
  every ordered coalesced sample and supports empty/absent API fallback.
  Normal up relinquishes pointer ownership before callbacks/capture loss,
  records final timing and flushes presentation once, cancelling the pending
  duplicate paint. Missing/non-invertible matrices safely cancel input.

The existing React/SVG renderer, diagnostic capture, free-copy paths and theme
remain in use. Optional snapshot interfaces, diagnostic throttling, path chunks
and blur changes were not needed to achieve the measured CPU reduction. No
dependency, storage schema, scoring formula, geometry, recording or approval
change was made. Jejak Ceria remains the preschool default. Kaf revision 2 and
Ga revision 3 still await geometry review; the other 35 lessons remain ready.

## Verification inputs and results

Final web build: `index-E1jWQ9Ri.js` and `index-B_G2-FFu.css`. Node **24.19.0**,
Windows **10.0.26200**, AMD Ryzen 7 5700X. Chromium **153.0.8010.12**; WebKit
uses the workspace Playwright runtime. Browsers are under
`node_modules/.cache/ms-playwright`, selected with `PLAYWRIGHT_BROWSERS_PATH`.

- `npm test -- --reporter=dot`: **107 passed**, 12 files. Includes finish
  boundaries at 94/95/96%, endpoint distance/checkpoints, stationary taps,
  cancellation/exhaustion, release-only movement, geometry equivalence and
  event conversion/order/flush lifecycle; existing content/storage/audio/match
  tests also pass.
- `npm run build`: **passed**, including content validation: 37 letters/models,
  35 student-ready lessons. Production preview serves the above compiled assets.
- Production Chromium/WebKit: **127 unique cases passed, seven expected skips,
  no unresolved selected failures**. The main selection passed 123; isolated
  follow-ups resolved the portrait Duo fixture and native-DPR 4K capture,
  and added two non-final-body visual cases. See the
  [combined latest results](../output/verification/tracing-completion/browser-summary.json),
  [main selection](../output/verification/tracing-completion/browser-results.json),
  [4K follow-up](../output/verification/tracing-completion/browser-followup.json)
  and [final focused checks](../output/verification/tracing-completion/browser-final.json).
  Their `config.argv` records the exact selection commands. Main: two workers;
  isolated native-DPR follow-ups: one worker. Skips are Chromium-CDP-only checks
  in WebKit, not substitute physical-device passes.
- Protected comparison: [baseline hashes](../output/verification/tracing-completion/before-inputs.json)
  and [comparison](../output/verification/tracing-completion/protected-inputs.json).
  All **75 protected files** match the pre-implementation working tree: content,
  validator, audio, storage, Kaf/Ga documents and approval records. The reference
  image files also match in the broader working-tree comparison.
  Unrelated prior source edits remain intact; final changed-file totals are in
  the comparison: 224 existing inputs checked, 205 unchanged and 19 authorised
  source/doc/fixture edits, with no missing or unexpected changes. Final input
  fingerprints are in [after-inputs.json](../output/verification/tracing-completion/after-inputs.json).
  Nothing was committed, pushed, published or packaged as an APK.

The selected browser checks exercise all 37 valid authored sequences in adult
preview, corrected Kaf/Ga in play/guided/precision, shortcuts/reversal, body/dot
ordering, pad/keyboard actions, demonstrations, copying/export, page turns,
resize/capture loss, and native emulated touch/pen. Solo/Duo cases cover immediate
acceptance, concurrent touches, lane ownership and shared pause/deadline behaviour.
Changed Alif states are captured at 320×740, 390×844, both tablet orientations,
1920×1080 and 3840×2160. Coordinates are recomputed after captures/resizes.
Chromium uses DPR 1; ordinary WebKit cases use its Desktop Safari DPR 2. The
isolated 4K follow-up explicitly uses DPR 1 and one worker: default WebKit DPR 2
would rasterise a 3840×2160 viewport at 7680×4320. Extra captures inspect Ba's
dot transition, Mim's loop and Ga's dot after the non-final-body release cue.

Some historical browser fixtures had stale assumptions from before the existing
fullscreen/Kaf/Ga edits: 37 student lessons, square book boards, unpaged teacher
rows, old teacher navigation and inaccessible short-screen entry. Relevant
navigation/export/readiness fixtures were updated. A portrait Duo dot pad and
retry can be beside each other in the fitted dock; its test now checks
containment and non-overlap rather than a vertical ordering. The older square-board
layout cases are excluded from this tracing selection; current terminal/model
fit cases exercise the fitted stages. Historical reports are retained. The
first production launch lost its reused preview server; the final run uses a
separately verified preview. Preliminary interrupted runs are not final evidence.
The portrait history fixture now uses the current Cabaran tab/cards. Exact
near-end touch fixtures avoid native mouse coordinate rounding across 95%;
native Alif touch recovery is verified separately. These fixture corrections
do not change application acceptance thresholds.

## Matched local performance

`node scripts/compare-tracing-matcher.js` alternates the retained original
working-tree engine with the new engine: three warmups, ten measured repetitions
each, five-unit movement, fixed two-unit sine jitter, all bodies and required
dots. See [CPU comparison](../output/verification/tracing-completion/matcher-comparison.json).

| Letter | Original median CPU total | New median CPU total |
| --- | ---: | ---: |
| Alif | 7.6 ms | 1.8 ms |
| Sin | 31.4 ms | 3.7 ms |
| Mim | 8.8 ms | 2.4 ms |
| Nya | 16.3 ms | 2.6 ms |
| Kaf | 18.4 ms | 2.6 ms |
| Ga | 18.6 ms | 2.7 ms |

All six new matcher runs have **0.1 ms p95 sample time**, at the browser timer's
resolution. This is engine CPU time, not finger-to-screen latency.

`node scripts/measure-tracing.js <report> play` measures frame-paced synthetic
touch: four ordered real fixture samples per event, one event per animation
frame, five-unit spacing and fixed jitter. It observes actual frontier/ink DOM
mutations, event-batch time, frame intervals and long tasks. It uses current
adult-preview navigation and teacher diagnostic export. The observer preserves
event-listener cleanup, including React development lifecycle.
Its existing default command still measures guided Sin; the explicit `play`
argument selects the four-letter comparison. A default-command smoke passed
guided Sin in all three viewports; see [tool compatibility](../output/verification/tracing-completion/guided-tool-smoke.json).
The final default/letter-selection compatibility adjustment does not alter the
explicit-play measurement path recorded in the matched reports.

Matched inputs: Alif/Sin/Mim/Nya at 1024×768, 768×1024 and 3840×2160, DPR 1,
foreground headless Chromium; two runs each with recorded source fingerprints:
[before 3](../output/verification/tracing-completion/before-performance-3.json),
[before 4](../output/verification/tracing-completion/before-performance-4.json),
[after 1](../output/verification/tracing-completion/after-performance-1.json),
[after 2](../output/verification/tracing-completion/after-performance-2.json).
Earlier before files 1/2 are superseded because their instrumentation did not
remove wrapped listeners correctly; they are excluded from the comparison.

Across the matched runs, p95 event-batch work is **0.6–1.4 ms before** and
**0.5–1.0 ms after**, within the 8 ms target. CPU improvements do not imply that
every rendered frame meets the initial 25 ms target: Sin at native DPR 1 4K has
**33.3 ms p95 frame intervals** in both before/after runs. The other measured
views stay within 25 ms. No long tasks over 50 ms were observed in either final
after replay. The software timing evidence and remaining
presentation/device limits are reported as measured, without changing targets.

## Remaining limits

No physical recording-device/tablet/smartboard or native Android WebView test was
available. Physical-device smoothness and pupil/teacher assessment remain pending.
The matched frame benchmark uses one practice board; concurrent Duo and copying
are functionally covered, without a matched before/after frame-performance claim.
CDP touch and synthetic coalesced fixtures establish their stated software input
coverage. WebKit is not native iPad touch. The recorded Windows Firefox launch
limitation was not retried under unchanged conditions. This work does not approve
Kaf/Ga geometry or regenerate the earlier Android APK.
