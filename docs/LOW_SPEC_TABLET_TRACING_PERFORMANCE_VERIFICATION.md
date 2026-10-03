# Low-spec tablet tracing delivery

Implemented on **3 October 2026**, Asia/Kuala_Lumpur, after the owner approved
the [implementation plan](LOW_SPEC_TABLET_TRACING_PERFORMANCE_IMPLEMENTATION.md).
The reported device is a custom low/medium-spec Android tablet; dragging lag
affects every letter in Solo and Duo. Its hardware and Android/WebView version
remain unknown. No physical device is connected to this workspace.

## Delivered changes

- Native Android defaults to **Paparan ringan**. The adult **Paparan permainan**
  setting can restore **Paparan penuh**; its preference uses a separate storage
  key and does not alter pupil progress. Browser installations default to full.
- Lightweight presentation removes dock blur, decorative shadows, filters,
  trail circles, flower effects and page-turn animation. Numbering, reference
  paths, dots, moving direction cues, finish/recovery cues and audio remain.
  Decorative motion pauses while either Duo contact is tracing.
- Matchers have an optional compact input response and a live presentation view.
  Their existing full snapshot API remains available. The board paints dynamic
  SVG groups directly once per frame; React updates the controls only when their
  meaning changes. Static reference geometry is memoized.
- Diagnostic assembly is limited to once per 250 ms during movement, with a
  complete final snapshot on release/cancel/completion and on-demand export.
  Duo does not assemble unused diagnostics. All delivered input samples remain
  ordered; no sample dropping or input debounce was introduced.
- Guided/copy ink uses sections of at most **128 vertices**, sharing the seam
  endpoint. Finished sections remain immutable; only the active section is
  rewritten. Original sample coordinates and the existing save limits remain.
- The displayed Duo countdown updates in its own component at second boundaries.
  Deadline enforcement still checks every 50 ms; scoring still uses the exact
  validated release timestamp. Idle hints avoid redundant state updates.
- Teacher settings fit four controls in two columns on small phones, with
  wrapping captions and native select paint contained within the control.

Teaching geometry, tolerances, readiness, recordings, approvals, scoring and
progress formats are preserved. Jejak Ceria remains the preschool default.
Kaf revision 2 and Ga revision 3 still need geometry review; 35 lessons remain
student-ready. No worker, canvas replacement, forced WebView layer or persistent
SVG matrix cache was introduced. Those conditional changes need device evidence.

## Verification scope

`npm test -- --reporter=json --outputFile=output/verification/low-spec-tablet/unit-results.json`
passed **115 tests across 15 files**. New checks replay full and compact matcher
responses, preserve exact raw ink and seams across 5,000 points, exercise bounded
path rewrites, and cover native defaults, persistence/storage failures and shared
contact tracking. Existing matcher, scoring, storage and content checks passed.

`npm run build` passed with **37 valid models and 35 student-ready lessons**.
The final production build is served at `http://127.0.0.1:4173`. The existing
preview was reused; no duplicate server was started.

Production Chromium/WebKit checks covered play/strict tracing, all 37 movement
and dot sequences, coalesced/native touch, terminal recovery, demonstrations,
copy persistence/export, numbering, Solo/Duo deadlines and pauses, Android bridge
events, fullscreen fit and no-scroll behavior. The selected 230-case set has
**223 unique passed cases, six expected WebKit CDP skips and one unresolved
native-4K WebKit case**, combining the broad run and affected follow-ups.

The broad run passed 220, skipped six and failed four. A 36-case follow-up passed
34, verifying the Duo portrait layout and the 4K menu journey; it still found
the select-paint overflow and stalled in WebKit's native-4K all-letter journey.
After the select correction, all **10 affected final settings checks passed**
in both browsers. Their small-screen captures were inspected. The final CSS
correction is restricted to teacher controls at widths up to 600 px; matcher,
input, rendering, clock and teaching inputs are unchanged from the broad run.

The native-4K WebKit all-letter test timed out at 300 seconds, including with
4K PNG capture disabled. Its root cause remains unresolved on this Windows host;
it is not counted as a pass. Chromium's native-4K letter/guide and interaction
checks passed; WebKit phone, tablet and 1920-pixel checks passed. This limitation
does not establish Android WebView performance or failure.

Browser commands use `playwright.performance.config.js`, one worker and the
confirmed external production preview. The broad selection is:

```powershell
npx playwright test --config playwright.performance.config.js tests/browser/low-spec-performance.spec.js tests/browser/play-tracing.spec.js tests/browser/strict-tracing.spec.js tests/browser/tracing-terminal.spec.js tests/browser/touch.spec.js tests/browser/numbered-guides.spec.js tests/browser/solo-duo.spec.js tests/browser/android-platform.spec.js tests/browser/book-layout.spec.js tests/browser/fullscreen-layout.spec.js --workers=1
```

The focused selections, exact results and input/build fingerprints are retained
under [low-spec-tablet evidence](../output/verification/low-spec-tablet/).
Earlier failed reports are preserved and are not presented as current success.

## Desktop measurements

`scripts/measure-tracing.js` ran sequentially against release 1.0.3 and the final
production build. Chromium 153.0.8010.12 ran headless on Windows 10.0.26200,
AMD Ryzen 7 5700X, DPR 1, with no CPU throttle. Input used the same frame-paced
synthetic touch paths, four ordered coalesced samples per move, 5-unit spacing
and fixed sine jitter. Each case is one trace, so small timing differences are
screening evidence rather than a repeatability study.

Solo input samples, completion outcomes and final coverage match **exactly**
between baseline and final light runs. The table shows baseline → final light;
times are milliseconds. Attribute writes count actual SVG mutations.

| Viewport / Play letter | p95 input batch | SVG writes | p95 frame interval |
| --- | --- | --- | --- |
| 1024×768 Alif | 1.2 → 1.5 | 661 → 335 | 16.7 → 16.8 |
| 1024×768 Sin | 0.6 → 1.4 | 1826 → 731 | 16.8 → 16.7 |
| 1024×768 Mim | 0.8 → 0.9 | 834 → 512 | 16.8 → 16.7 |
| 1024×768 Nya | 0.7 → 0.8 | 1146 → 504 | 16.8 → 16.8 |
| 768×1024 Alif | 0.8 → 1.3 | 661 → 335 | 16.8 → 16.7 |
| 768×1024 Sin | 0.6 → 0.8 | 1826 → 731 | 16.8 → 16.7 |
| 768×1024 Mim | 0.7 → 0.9 | 834 → 512 | 16.8 → 16.7 |
| 768×1024 Nya | 0.6 → 0.8 | 1146 → 504 | 16.8 → 16.7 |
| 3840×2160 Alif | 1.1 → 1.5 | 661 → 335 | 50.0 → 16.8 |
| 3840×2160 Sin | 0.7 → 1.1 | 1826 → 731 | 66.7 → 33.4 |
| 3840×2160 Mim | 1.0 → 1.1 | 834 → 512 | 66.6 → 16.7 |
| 3840×2160 Nya | 0.7 → 0.8 | 1146 → 504 | 33.4 → 16.8 |

The light preset reduces Play SVG writes by **39–60%** and improves the measured
4K frame intervals. Tablet-size frame intervals were already around one 60 Hz
period. Input-batch CPU timing increased in several cases; this delivery does
**not establish lower input latency**. Final light p95 rAF callback work was
0.2–0.4 ms. The full preset remains more expensive: p95 batches 0.9–2.1 ms,
4K frame intervals 50–66.6 ms, and slightly more SVG writes than the old renderer.
The measurements support using light as the Android default.

Guided Sin retained exactly 285 samples and identical coverage/outcome at all
three viewports. Serialized ink vertices fell **10,295 → 4,455 (57%)**; the
largest rewritten path fell **284 → 128 vertices**. Total SVG writes rose
424 → 572 as cursor cues/chunk boundaries were maintained. p95 input batches
were 0.8 ms, against 0.5–0.7 ms before; p95 rAF work was 0.3 ms. The 4K p95
frame interval fell 33.4 → 16.8 ms.

Concurrent Duo replay retained 254 samples and two independently validated
completions. For 1024×768 / 768×1024, release-1.0.3 → final light input-batch p95
was **0.8 → 1.7 / 0.8 → 1.1 ms**, frame p95 **16.8 → 16.7 ms**, and SVG writes
**1322 → 670 (49%)**. Final full produced 1528 writes with batch p95 1.1 / 1.0 ms.
Separate browser assertions confirm clock ticks cause zero board renders after
the independent idle hint settles. Play traces required 7–14 board renders and
5–11 diagnostic publications; guided Sin required seven of each. The old bundle
has no render/diagnostic hook, so a numerical before/after count is unavailable.

Three isolated 58–61 ms long tasks occurred in the final Play runs (Sin at
1024×768 full/light and 4K light); no repeated stalls appeared within those short
traces. Their attribution and sustained tablet behavior remain unresolved. rAF
callback timing also excludes asynchronous React work, so its old/new values
are not total rendering CPU comparisons. The recorded DOM mutation age uses
the most recent dispatch, without pairing the mutation to a specific input
sample; it can observe an earlier batch after a newer dispatch. It must not be
interpreted as measured input-to-visible latency. Synthetic events provide no
trusted event-queue latency; allocation/GC and physical display latency are
unavailable. No on-device acceptance target is marked achieved.

Executed bundles are identified by their SHA-256 in each measurement report.
Solo baseline JS `index-B-3mpeEM.js` matches the preserved 1.0.3 APK. The corrected
Duo baseline was served temporarily from all 91 hash-verified 1.0.3 APK assets,
then its local server was closed. Earlier `baseline-duo.json` executed an
intermediate bundle (`index-mmK14_lL.js`) and is excluded from release comparisons.
Local source hashes recorded while the old build was running include edits;
use the executed bundle hashes and `before-inputs.json` for baseline identity.
Final JS is `index-D2FnzuJ9.js`, CSS `index-CCf4Eyi8.css`.

Evidence: [Solo baseline](../output/verification/low-spec-tablet/baseline-play-instrumented.json),
[guided baseline](../output/verification/low-spec-tablet/baseline-guided-instrumented.json),
[release Duo baseline](../output/verification/low-spec-tablet/baseline-duo-release-1.0.3.json),
[Play full](../output/verification/low-spec-tablet/after-play-full.json),
[Play light](../output/verification/low-spec-tablet/after-play-light.json),
[guided light](../output/verification/low-spec-tablet/after-guided-light.json),
[Duo full](../output/verification/low-spec-tablet/after-duo-full.json) and
[Duo light](../output/verification/low-spec-tablet/after-duo-light.json).

## Signed Android package

[Taman Jawi 1.0.4](../output/releases/Taman-Jawi-1.0.4-release.apk), version code
**5**, contains the final tested build. Size **6,319,398 bytes**. Application ID
`com.hananaacademy.tamanjawi`, minimum API 26, target API 36 and signing identity
are preserved. APK SHA-256:
`9026e4b66f4759e6d5ed8ba2c9b5c9f990f4ef28a9388434022e06b8fa4bd7fa`.

`scripts/build-android.ps1 -Offline -SkipWebBuild` completed assembly/lint after
the known Windows Gradle cache rename failure was resolved by finalizing its
completed project-local temporary cache directory with the failed daemon stopped.
The successful build reused the checked final web assets. Lint: zero errors,
four existing warnings. Signature, alignment, checksum, application/version/API
metadata, release flags and all **91 packaged asset hashes / 37 recordings**
passed `scripts/verify-android-release.ps1`. No permissions or private signing
files/native libraries are packaged. Certificate SHA-256 matches 1.0.3:
`864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365`.

All **89 protected teaching/audio/storage/scoring/geometry/approval inputs**
match the before snapshot. Existing workspace edits, historical reports and
APKs/checksums remain preserved. See [APK inspection](../output/verification/android-release-1.0.4/apk-verification.json),
[initial build failure](../output/verification/low-spec-tablet/android-build.log)
and [successful build](../output/verification/low-spec-tablet/android-build-retry.log).

## Remaining device validation

Physical input-to-display latency, allocation/GC behavior, thermal degradation,
refresh rate and Android GPU/WebView frame pacing are unmeasured. Desktop
software timing cannot certify the tablet's smoothness or the plan's on-device
acceptance targets. Install the new APK and check continuous Solo writing and
simultaneous Duo contacts in both usable orientations, including sustained
long-copy gestures and several rounds. Keep Paparan ringan selected first.
