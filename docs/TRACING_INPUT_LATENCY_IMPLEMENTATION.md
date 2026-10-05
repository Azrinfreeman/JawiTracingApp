# Tracing input latency polish — implementation plan

Status: **applied 2026-10-05, partially.** Phase 0 baseline, the segmented fill, one matrix per contact and no mid-gesture
diagnostics were applied. The other Phase 1 items and Phase 2 (canvas) were not needed on the measurements, see
`TRACING_INPUT_LATENCY_VERIFICATION.md`. Target device: low-spec Android tablet (not available; simulated).
Prepared 2026-10-05.

## Request

While tracing, the coloured fill follows the finger with a visible delay. Reduce
input-to-screen latency as far as is safe, and remove graphics that cost time
without teaching value.

## What the code and a quick measurement show

| Area | Finding |
|---|---|
| Matcher cost | Measured in the in-app browser on all 37 letters (11,100 samples, desktop): p50 0 ms, p95 0.1 ms, p99 0.2 ms, max 0.9 ms. `engine.view()` is about 0.002 ms. The matcher is **not** the bottleneck, so geometry changes are out of scope. Android hardware will be slower, but this proves the logic is cheap. |
| Event path | `src/tracing/inputController.js` already validates every coalesced sample synchronously and batches painting into one `requestAnimationFrame`. There is no avoidable frame of queueing beyond the one rAF. |
| Fill rendering | In Jejak Ceria the visible fill is one wide SVG `<path>` per stroke, advanced by changing `stroke-dashoffset` with `stroke-dasharray = length` (`src/tracing/liveRenderer.js`, class `.play-fill`, width from `playFillWidth`). Every frame the browser re-dashes and re-rasterises the **whole** stroke (a very wide, round-capped curve, with a second wide reference path under it) and repaints its large bounding box. This is the most likely main-thread cost on weaker GPUs/WebViews, and it grows with stroke length. |
| Decoration while tracing | `.play-trail` adds 11 circles whose `cx/cy` are rewritten every frame, plus a pulsing halo, arrow and start dot at the frontier, plus numbered guides that re-render from React when `progress` changes. The numbered guides now carry the teaching cue, so the trail dots are redundant. |
| Layer/paint scope | Nothing isolates the board from the rest of the page: no `contain`, no dedicated compositor layer. A repaint inside the SVG can invalidate a larger area (board-wrap shadow, rounded border, stage background). |
| Pointer down/up hitch | `setTracingContact()` toggles `data-tracing` on `<html>` at touch down and up. Rules like `[data-tracing="true"] :is(.game-mascot *, …)` force a document-wide style recalculation at exactly the moments the player notices the first response. |
| What looks like lag by design | The fill is the *accepted* frontier, never raw ink (project rule). It can trail the finger by up to the matcher's advance limit on fast moves. That is intended behaviour and is not changed here. |

Unknown: whether the report comes from desktop/browser or the Android tablet
(`data-presentation` is `light` on Android, `full` elsewhere; the measurement
above ran in `full`). The plan below is ordered so each step is measured and
kept only if it helps.

## Plan

### Phase 0 — baseline (no code changes to the game)

- Add a Playwright perf spec (reuse `tests/browser/low-spec-performance.spec.js`
  helpers and `__JAWI_TRACE_PERF__`) that traces Jim, Sin and Kaf with real
  pointer events and records: Event Timing for `pointermove`
  (`processingStart → processingEnd` and presentation delay), frame interval
  p50/p95/max, long tasks over 50 ms, and paint time, in both `full` and `light`
  presentation, with 4x CPU throttling for a low-spec approximation.
- Record command, scope and numbers in
  `docs/TRACING_INPUT_LATENCY_VERIFICATION.md`. All later steps are compared
  against this baseline, and a step that does not improve it is reverted.

### Phase 1 — low-risk render trims (`liveRenderer.js`, `TraceBoard.jsx`, CSS)

1. **Segmented fill.** Replace the single dash-animated path with fixed
   pre-split segments per stroke (about 24 equal arc pieces, built once from
   the reference). Completed pieces are toggled with `display`; only the one
   partially filled piece uses `stroke-dashoffset`. Per frame the browser
   repaints one small region instead of the whole stroke, with no whole-path
   dash recomputation. Visual result is identical (same width, colour, round
   joins, same `data-measured-frontier` / `data-display-frontier` attributes
   that tests read).
2. **Remove the 11 trail dots** in play mode (`.play-trail`). Numbered guides,
   arrow and the cursor dot keep the cue.
3. **Quieter frontier cue while a finger is down.** Keep the dot and arrow, but
   skip the halo size/opacity updates and the `gentleCue` animation during
   contact (`data-tracing`), and set `shape-rendering: optimizeSpeed` on the
   fill and cue shapes.
4. **Isolate the board.** Add `contain: layout paint style` and a dedicated
   compositor layer (`will-change: transform` on the SVG wrapper only) so
   repaints do not touch the rest of the page. Check for blurry text on the
   Android WebView before keeping `will-change`.
5. **Scope `data-tracing`.** Set it on the active `.board-wrap`/stage element
   instead of `<html>`, and move the animation-pause selectors with it, so
   touch down/up no longer restyles the document. The shared contact counter
   for two boards (Duo) must still work independently per board.
6. **Make the lightweight look the tracing default.** While a contact is
   active, apply the existing `light` presentation rules (no shadows, filters,
   decorative animation) to the stage even in `full`, and restore afterwards.
7. **Skip no-op React work.** Memoise `NumberedTraceGuides` so it re-renders
   only when the guide step changes (`controlKey` already does this for state),
   not on every `progress` change; pass progress through the renderer instead.

### Phase 2 — only if Phase 0/1 numbers still show visible lag

- Draw the fill on a single `<canvas>` using a `desynchronized` 2D context
  (lowest-latency path in Chromium/Android WebView) with incremental drawing
  of only the new segment each frame, and keep SVG for the static reference.
  This is a larger change and touches screenshots and tests that read the SVG
  fill attributes, so it needs your approval before it starts.
- Optional: use `pointerrawupdate` where supported. Expected gain is under one
  frame; only kept if the baseline shows event-to-frame latency dominates.

### Out of scope

Matcher, tolerances, geometry, audio, content approvals, Jejak Ceria as
default, and "fill is the accepted frontier, never raw ink". No input samples
are dropped or throttled, and completion stays validated on actual pointer-up.

## Tests and verification (per `docs/VERIFICATION_GUIDE.md`)

- `npx vitest run` (renderer/segment maths: fill length equals the accepted
  frontier at every sample, completed pieces equal full stroke length).
- Existing browser specs that read fill state, in Chromium and also Firefox and
  WebKit this time because rendering changed: `play-tracing`, `touch`,
  `tracing-terminal`, `endpoint-finish`, `numbered-guides`, `fullscreen-layout`,
  `low-spec-performance`, `solo-duo` (two boards).
- Visual captures of Jim, Sin and Kaf mid-trace and complete at phone, tablet
  and fullscreen sizes, compared with the current look.
- `npm run build`.
- Before/after perf numbers from Phase 0. No improvement is claimed from
  reasoning alone.

## Risks

- Segment seams: adjacent pieces with round caps must overlap enough to show no
  gap or lighter seam; checked visually and by a geometry test.
- `will-change` can blur text or raise memory on old WebViews, so it is applied
  to the board wrapper only and verified on the Android build if available.
- Moving `data-tracing` off `<html>` can leave animations running in other
  panes; Solo/Duo specs cover this.
- Android WebView timing cannot be proven from desktop numbers. Final
  confirmation needs the tablet; the desktop run with CPU throttling is an
  approximation and will be labelled as such.

## Decisions needed before Phase 2 only

Whether a canvas fill is acceptable, and which device shows the lag (the Android
tablet build or desktop). Phase 0 and 1 do not need either answer.
