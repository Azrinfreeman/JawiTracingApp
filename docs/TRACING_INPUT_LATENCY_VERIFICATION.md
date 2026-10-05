# Tracing input latency — verification (2026-10-05)

Target: low-spec Android tablet (owner reports lag there, desktop is smooth). No tablet was available, so the
device is **simulated**: Chromium, 1280x800 at DPR 1.5, `TamanJawiAndroid` set (lightweight presentation),
`Emulation.setCPUThrottlingRate` 6, three 3-sample touch batches per frame. Numbers are a desktop approximation and
are not proof for the physical tablet. Software raster in headless Chromium makes RasterTask a CPU-bound proxy for a
weak GPU. Spec: `tests/browser/tracing-latency.spec.js` (`JAWI_PERF_TAG`, `JAWI_CPU_RATE`); raw output in
`output/verification/tracing-latency/`.

## Changes
- `src/tracing/liveRenderer.js`: accepted fill is drawn as fixed 48-unit pieces (one `<g class="play-fill">` per stroke
  keeps the data attributes tests read). A frame rewrites only the pieces between the previous and current frontier,
  instead of re-dashing and re-rasterising the whole wide stroke.
- `src/tracing/inputController.js`: one screen matrix per contact (invalidated on scroll or resize) so the move handler
  no longer forces style/layout.
- `src/components/TraceBoard.jsx`: no periodic diagnostic snapshot while a finger is down. Release, completion and
  cancel still emit.

Not applied, because the measurements did not call for them: trail-dot removal (already absent in lightweight mode),
`contain`/`will-change`, scoping `data-tracing`, memoising the number guides, canvas fill. Matcher cost was already
about 0.2 ms p99 per sample.

## Results (throttled 6x, same scenario, workers=1, ms)

| Letter | Metric | Baseline | After |
|---|---|---|---|
| Jim | handler p50 / p95 | 5.7 / 9.5 | 2.2 / 3.2 |
| Jim | frame p95 / max | 50 / 66.7 | 33.4 / 66.7 (16.8 / 33.4 in an earlier identical run) |
| Jim | RasterTask total | 697 | 172 |
| Sin | handler p50 / p95 | 4.9 / 8.3 | 2.2 / 3.4 |
| Sin | frame p95 / max | 33.3 / 50 | 16.8 / 50 |
| Sin | RasterTask total | 2015 | 197 |
| Kaf | handler p50 / p95 | 5.0 / 8.4 | 2.3 / 4.9 |
| Kaf | frame p95 / max | 33.4 / 66.7 | 33.4 / 83.3 |
| Kaf | RasterTask total | 1495 | 187 |

Raster work fell about 4x to 10x and input-handler time more than halved. Frame p95 is at or near one 60 Hz frame for
Sin and mostly for Jim and Kaf; occasional 33 ms frames remain. Remaining long tasks (2 to 4 per run) are single
events (stroke completion and page work), not per-move cost. Single runs are noisy; treat differences under about
one frame as noise.

## Correctness and regression
| Check | Result |
|---|---|
| `npx vitest run` | 161 passed (`inputController` tests updated to once-per-contact plus scroll refresh) |
| `npm run build` | passed |
| New browser test: segmented fill length follows the accepted frontier (half) and equals the stroke length (full), all pieces shown | passed |
| Chromium: tracing-latency, play-tracing, touch, endpoint-finish, tracing-terminal | 44 passed |
| Chromium: solo-duo, glyph-matched, low-spec-performance, android-platform, numbered-guides, fullscreen-tracing-audio, book-layout, strict-tracing | 275 passed, 2 failed |
| Failure 1: `solo-duo.spec.js:272` (Duo completion) | failed once under heavy parallel load, passed on its own re-run |
| Failure 2: `book-layout.spec.js:42` | fails identically with these changes stashed: it expects "Sin" after "Sa" but the catalogue now gives "Jim" after "Sa". Existing test/catalogue mismatch, not caused by this work, not fixed here |
| Visual capture of Jim mid-lesson (`fill-segmented.png`) | no visible seams or colour change in the segmented fill |

Not run: Firefox/WebKit, a real Android WebView, the physical tablet.
