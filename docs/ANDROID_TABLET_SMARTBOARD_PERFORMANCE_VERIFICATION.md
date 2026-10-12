# Tablet and smartboard performance optimisation

7 October 2026, Asia/Kuala_Lumpur. The owner authorised the
[implementation plan](ANDROID_TABLET_SMARTBOARD_PERFORMANCE_IMPLEMENTATION.md)
with “perform the optimisations”, then “continue”. This delivery changes runtime
work and presentation defaults, without changing approved teaching content.

## Implemented

- Live stroke serialization searches only the requested arc interval. Completed
  48-unit pieces are reused; unchanged fill frontiers do not rebuild path strings.
- Outline reveals update partitions at the moving boundary rather than visiting
  every partition. Unchanged/completed reveals return immediately. Rollback,
  restart, exact contours, whole-body clipping and overlap remain supported.
- Demonstrations publish each part's latest arc once per frame. Past sections
  no longer repeatedly rewind and repaint the same part. Authored durations,
  pauses, pen lifts, five-phase Ha cues and reduced-motion timing are retained.
- Browser SVG reference sampling is cached by document, letter ID, revision and
  exact stroke IDs/paths. References are immutable. The LRU has limits of 48
  entries and 120,000 vertices; oversized entries are not retained. Tight-turn
  preparation follows reference identity through a weak cache. Duo shares only
  immutable preparation; every matcher and progress/history transaction is separate.
- Repeated header resize notifications are measured once per animation frame;
  unchanged rectangles retain their state. Input coordinate matrices still
  refresh per contact and after scroll/layout changes.
- Static catalogue eligibility/counts are memoised in App, including across
  first-player save rerenders. Persistence and deadline handling remain immediate.
- New browser installations now default to light presentation, matching Android.
  Saved full/light choices still win. No presentation switch occurs mid-gesture.

Initial profiles still provide the pre-contact view; selecting the first touch
profile creates separate engine state while reusing the expensive route/turn
preparation. No sample dropping, tolerance relaxation, resolution reduction,
matcher projection rewrite, canvas replacement or forced Android GPU layer was
introduced. Existing CSS already removes the main light-mode decorative effects;
the colour and legibility of navigation/numbered cues are preserved.

## Reproducible measurements

Evidence: `output/verification/tablet-smartboard-performance/`. Production preview
at `http://127.0.0.1:4173`, Windows 11 build 26200, Ryzen 7 5700X,
Node 24.19.0, Chromium 153.0.8010.12, DPR 1. Each comparison case has five runs,
fixed sine jitter, 5-unit spacing and four ordered coalesced touch samples per
frame. These are headless desktop screening measurements.

Baseline JS: `index-DCLuFVFI.js`, SHA256
`e5f394181a4002f3f7fd70154b543f89e52fe4913bb5e871afc8e4364d2fa792`.
Optimised JS: `index-RZB2b9dH.js`, SHA256
`4b9cf1a496564fe6d07dadf167b9613fbb33be13af96a708ef880cd07c8f67af`.
CSS is identical (`index-DbweFF8G.css`). Each measurement JSON records executed
asset hashes. Its local-source hashes describe files at measurement completion;
the served bundle hashes identify the code actually executed.

Values below are **medians of each run's p95**, in milliseconds:

| Case | Input batch before → after | rAF callback work before → after | Frame interval before → after |
| --- | --- | --- | --- |
| Sin, 1024×768 light | 0.40 → 0.40 | 0.20 → 0.30 | 16.7 → 16.7 |
| Sad, 1024×768 light | 0.80 → 0.70 | 0.20 → 0.30 | 16.8 → 16.8 |
| Nun, 1024×768 light | 0.80 → 0.80 | 0.20 → 0.20 | 16.8 → 16.8 |
| Wau, 1024×768 light | 0.80 → 0.70 | 0.20 → 0.20 | 16.7 → 16.8 |
| Sin, 3840×2160 light | 0.40 → 0.40 | 0.30 → 0.30 | 16.8 → 16.7 |
| Sin, 3840×2160 full | 0.60 → 0.50 | 0.40 → 0.30 | 33.4 → 50.1 |
| Concurrent Duo, 1024×768 light | 0.80 → 0.60 | 0.20 → 0.20 | 16.7 → 16.8 |

Light-mode frame performance was retained; small sub-millisecond changes overlap
run-to-run variation and are not a demonstrated drawing-latency improvement.
Full-effects 4K did **not** improve: before-run p95 values ranged 33.4–49.9 ms;
after-run values ranged 33.4–66.7 ms. This remains a performance limitation.
The full override remains available; the default light presentation avoids this
cost in the measured desktop workload.

SVG writes fell from 987 to 959 for Sad and 446 to 433 for Nun. More directly,
same-page restarts of Sin, Sad and Ha avoided all detached SVG sampling calls:
726, 721 and 590 calls became zero. Their single baseline restart probes spent
121.0, 65.0 and 105.8 ms inside those APIs; the optimised probes spent zero.
These are avoided API costs, not whole-screen launch timings. Cold preparation
still occurs once per uncached geometry. Preparation probes are single samples.

The separate, instrumented 4K investigation recorded p95 intervals of 50.1 ms
full and 16.7 ms light. Inclusive timeline totals included 947 ms raster work
full versus 678 ms light across the corresponding traces. These overlapping,
multi-thread totals are not additive CPU percentages or physical GPU attribution.
They support retaining the inexpensive presentation; they do not prove an
Android-specific bottleneck or justify a rendering-engine replacement.

A separate 6× CPU-throttled Sad probe at 1024×768 recorded p95 input batch 6.1 ms,
rAF callback work 1.8 ms and frame interval 16.8 ms, with long tasks of 219 and
52 ms. It exceeds the provisional 4 ms batch target and is **not a low-end-device
pass**. No allocation/GC or causal input-to-visible latency claim is made.
Synthetic dispatch timestamps cannot establish trusted event queueing latency.

Commands: `node scripts/measure-tracing.js <report> play|duo light|full`, with
`JAWI_BASE_URL`, `JAWI_MEASURE_VIEWPORTS`, `JAWI_MEASURE_LABELS` and
`JAWI_MEASURE_REPEATS=5`; `node scripts/measure-tracing-preparation.js <report>`;
`node scripts/compare-tracing-performance.js`. Optional investigation uses
`JAWI_MEASURE_TRACE_DIR` and `JAWI_CPU_RATE=6`. Raw timelines and JSON summaries
are retained separately from the five-run comparisons.

## Verification

- `npm test`: **260 passed, 41 files**, including exact route serialization,
  outline boundary jumps/rollback/completion, immutable-cache invalidation and
  eviction, demonstration pauses, compact/full decisions, hairpin/wiggle,
  interruption, dot and scoring/deadline regressions.
- `npm run build`: **passed**, all 36 letters/models student-ready. The existing
  large-bundle warning remains; startup code splitting is not claimed here.
- `scripts/compare-tracing-performance.js`: **passed**. All compared Solo runs
  retain identical sample counts, profiles, raw logical ink hashes, progress,
  completed parts and metrics. Both concurrent Duo boards complete in every run.
- Production browser verification: **108 distinct cases passed, two expected
  WebKit CDP skips, zero unresolved failures**, aggregated in `verification.json`.
  Chromium completed all 36 letters in play/guided/precision; WebKit completed
  all 36 in play. Checks include tablet/phone/1080p/4K fits, DPR 2/3 touch and pen,
  cancellation/recovery, coalesced sample export, long-copy save, Duo clocks,
  simultaneous contacts, independent retry, pause/fullscreen and persistence.
  Ha/Wau/Va and Ain-family section/full demonstrations passed in both browsers.
  The initial selection had 87 passes and two fixture failures: the animated
  page-turn case now explicitly opts into full presentation, and the quota/exit
  case scopes its button to the result dialog. No application workaround was added.

Commands used `npx playwright test --config=playwright.performance.config.js`,
at most two active workers, with report/capture paths redirected to this task.
The first selection covered `performance-regressions`, `low-spec-performance`,
`strict-tracing`, `solo-duo`, `touch`, `gameplay-navigation` and `fullscreen-layout`
in Chromium. The follow-up selected all-36 play, complex demonstrations, explicit
full page-turn, quota/exit and presentation-preference cases in Chromium/WebKit.
The final two near-limit-history cases passed separately after replacing an
unreliable CDP single-finger release in that new test with frame-paced board
events. Separate native concurrent/capture checks passed; the history probe is
not evidence of trusted input latency.

At about 1.60 million stored characters (300 attempts and 12 copies), both music
settings preserved every copy and saved player one while player two remained
active, then saved player two. Four localStorage writes took 4.6–5.7 ms inside
`setItem`; this excludes serialization/parsing and is not the whole completion
cost. Media lifecycle was stubbed in this history test. Native decoding and
physical-device audio/mixing performance are not established by it.

Visual review includes portrait tablet Alif and 4K Nga: complete shapes and guides
fit, bright navigation/sound controls remain clear, and light mode omits the
decorative moving trail. Partial Sad/Nun/Ain fills were captured and inspected;
the authored silhouettes remain intact without visible partition seams. Ha's
demonstration and portrait Duo captures were inspected too. In the portrait Duo
capture the lower stop badge is partly covered by the instruction pill; this
separate layout interaction was observed but not changed by the optimisation.

Content SHA256 before/after:
`68fde9a839a8f8a01179cb39f857b69799cac8ba045ff1bca19945c599f0319d`.
`node scripts/verify-tablet-performance.js` passed, comparing all 77 files beneath `public/audio`, including
retained recordings/metadata/music. No approval/revision or storage schema changes
are part of this optimisation. Final fingerprints cover 219 source, test,
configuration, measurement and served build files. `git diff --check` passed.

## Device boundary

The configured Unity Android SDK's `adb devices -l` returned an empty list.
Physical Android WebView, smartboard GPU/touch/refresh behaviour, input-to-display
latency, memory/thermal behaviour and a ten-minute physical-device soak remain
unverified. High-DPR and concurrent native input checks are desktop emulation.
Historical Windows WebKit 4K limitations are not relabelled as Android failures.

No release APK, installation, publication, commit or push is included in this task.
