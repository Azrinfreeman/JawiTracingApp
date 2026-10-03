# Endpoint finish detection — delivery and verification

**Date:** 4 October 2026, Asia/Kuala_Lumpur  
**Status:** Implemented after the user's “proceed”; signed APK 1.0.5 delivered.  
**Scope:** Jejak Ceria in practice, Solo and Duo, following the
[reviewed implementation document](ENDPOINT_FINISH_DETECTION_IMPLEMENTATION.md)
and the recorded [problems.mp4](../problems.mp4) interaction.

## Result

After the existing coverage and checkpoints have been earned, one fresh tap and
release on the final numbered point finishes the stroke. No wiggle or extra
tracing is required. An ordinary valid tracing release still finishes directly.
Small movement delivered only on the final release receives bounded assistance
when that same contact was immediately ready beforehand.

For Ghain, finishing **3 Henti** exposes **4 Siap**, its separate upper dot.
The upper dot is never filled automatically. Incomplete work still shows its
saved frontier and asks the pupil to continue drawing.

The video showed repeated finish/resume cues, but contained no pointer log or
installed-version metadata. The source reproduction established the failure:
earned 100% coverage survived a displaced release, while a stationary endpoint
tap failed the fresh gesture's positive-travel requirement. The new confirmation
path validates already earned work independently of that requirement.

## Implementation

- `playMatcher.js` tracks accepted travel per stroke and exposes
  `confirmationAvailable` separately from held `canFinish`. A confirmation needs
  fresh owned down/up events, existing coverage/checkpoints, endpoint containment
  for every delivered sample, and bounded contact travel. Cancellation never
  commits; a failed confirmation requires a fresh contact. Exhaustion remains
  blocked until the existing continue mechanism restores capacity.
- Confirmation uses the existing endpoint radius and `dotTravel`: 40 logical
  units for touch, 24 for pen/mouse. It adds no measured tracing travel or
  coverage. Commit and sequence selection use the existing release path once.
- Release assistance first processes the actual up sample. Its fallback requires
  immediate pre-up readiness, finite coordinates, endpoint slack and bounded
  displacement, with no reversal beyond existing jitter. Touch slack/travel are
  36/60 logical units; pen/mouse use 18/30. Prior pauses, cancellation, exhaustion
  and failed confirmation contacts cannot receive this fallback.
- The live renderer, numbered stop badge and shared instruction now distinguish
  incomplete drawing, available confirmation and held readiness. Available
  confirmation shows **Sentuh titik …, kemudian angkat jari** and hides the
  misleading missing-tail arrow. Paused contacts first ask the pupil to lift.
- New Play attempts use `play-guided-v2` and pointer-specific v2 profile IDs.
  Metrics record `endpointConfirmations` and `releaseAssistances`; raw diagnostic
  gestures and per-stroke `completionMethods` distinguish confirmation,
  assistance and ordinary traced release. Old v1 records remain unchanged.
- Frame painting, compact matcher responses, diagnostic throttling, bounded ink
  sections and the separate Duo clock remain in place. Strict/copy matching,
  authored geometry, landmarks, part order, audio, approvals, scoring and match
  deadlines are preserved.

## Completed checks

The confirmed external production server was **http://127.0.0.1:4173**.
No duplicate server was started. Application code stayed unchanged after the
checked build; later changes corrected browser fixtures and their time budgets.

| Check / command | Scope and result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/endpoint-finish/unit-results.json` | **129 passed, 15 files.** Includes 95%/100% stationary confirmation for touch/pen/mouse; missing work/checkpoints; endpoint/travel boundaries; cancellation/invalid samples/exhaustion; release slack/reversal/pause; separate dots; compact/full equivalence and immutable diagnostics; legacy/new storage; exact match deadlines. |
| `npm run build` | Passed, including content validation: **37 models / 35 student-ready**. Kaf revision 2 and Ga revision 3 retain their pending geometry review. |
| New `endpoint-finish.spec.js`, production Chromium/WebKit | **25 distinct passed, one expected WebKit CDP skip** after focused follow-ups. Ghain light/full at 320×740, 1024×768, 768×1024 and 1280×800; stationary down/up, duplicate up, bounded release assistance, actual upper-dot input, raw export and exact-once recording. Also native touch cancellation/retry, Solo/Duo independence and pause, and a confirmation held beyond the deadline. |
| Production tracing/play/strict/touch/numbering/performance/Android-platform/Solo-Duo/pilot selection | **170 distinct passed, four expected WebKit CDP skips** after affected follow-ups. Both browsers complete all 37 authored models with separate dots. Includes strict rejection, native concurrent Duo ownership, interruption/resize, storage/export, clock isolation, bounded copy ink and fitted controls. Terminal viewport cases cover phone/tablet and 1920×1080; 3840×2160 cases were excluded from this selection. |
| Sequential `node scripts/measure-tracing.js … play light` and `… duo light` | Eight practice and two Duo rows at 1024×768 / 768×1024, compared with the executed 1.0.4 baseline. Results below. |
| `scripts/build-android.ps1 -Offline -SkipWebBuild` and `scripts/verify-android-release.ps1` | Offline assembly/lint, signature, alignment, version/API metadata, checksum and **91 assets / 37 recordings** passed. Lint: zero errors, four existing warnings. |
| Before-input comparison | **250 protected inputs unchanged**, including teaching content/audio/assets, approval records, strict matcher, input controller, game/scoring modules, native activity and historical verification documents. Previous 1.0.4 APK hash also matches its delivered checksum. |
| `git diff --check` | Passed; Git emitted existing Windows line-ending conversion notices. |

**Combined final selection: 195 distinct passed, five expected skips, no
unresolved failures within that selection.** Counts use the latest result per
browser/file/title rather than adding repeated executions. Native CDP touch
results establish Chromium behavior only.

Initial fixture failures are retained in the evidence. The endpoint pause test
used an obsolete resume-button name. Older pilot navigation assumed one catalogue
page and sampled WebKit coordinates before paint settled; it now reuses the
existing paging/tracing helpers. Portrait Duo measurements now wait for fonts
and layout paint. Copy input also waits for the newly opened board; its
2,000-sample functional stress test has a 90-second budget. All 60 affected
pilot/layout/copy rechecks passed. The first WebKit catalogue sweep reached Ye
before its 240-second total limit; a fresh sweep with a 360-second budget passed
in 3.8 minutes. These changes do not relax matcher assertions or match deadlines.

The first Android assembly hit the recorded Windows Gradle temporary-cache
finalization failure. With no Gradle JVM remaining, the single exact workspace
cache directory was validated and finalized; the offline retry succeeded.

Evidence: [unit results](../output/verification/endpoint-finish/unit-results.json),
[deduplicated browser summary](../output/verification/endpoint-finish/browser-summary.json),
[affected rechecks](../output/verification/endpoint-finish/browser-layout-pilot-copy-followup-results.json),
[catalogue recheck](../output/verification/endpoint-finish/browser-catalogue-followup-results.json),
[protected hashes](../output/verification/endpoint-finish/protected-inputs.json),
[final source/build/runtime fingerprints](../output/verification/endpoint-finish/final-inputs.json),
[Android build](../output/verification/endpoint-finish/android-build-retry.log)
and [APK inspection](../output/verification/android-release-1.0.5/apk-verification.json).

## Visual inspection and performance

Ghain captures cover held readiness, available confirmation and the upper-dot
transition in both presentations at all four target viewports. Automated checks
verify zero scrolling and visible controls inside the viewport. Manually
inspected 1280×800 confirmation, 320×740 full confirmation, 768×1024 upper-dot
and 1024×768 held states show readable instructions and separate numbered cues.
SVG screen coordinates were recomputed after captures.

Representative captures:
[landscape confirmation](../output/verification/endpoint-finish/captures/chromium-light-1280-ghain-confirm.png),
[phone confirmation](../output/verification/endpoint-finish/captures/webkit-full-320-ghain-confirm.png)
and [portrait upper dot](../output/verification/endpoint-finish/captures/chromium-light-768-ghain-dot.png).

The measurement protocol remains frame-paced synthetic touch with four ordered
coalesced samples per move, 5-unit spacing, fixed jitter and DPR 1. Runs were
sequential against the checked production build on the same Windows Ryzen 7
5700X host and Chromium 153.0.8010.12. The harness change reads Duo's profile ID
from the board rather than labeling it with an obsolete constant.

| Letter / mode | Viewport | Batch p95, 1.0.4 → 1.0.5 |
| --- | --- | --- |
| Alif | 1024×768 / 768×1024 | 1.50 → 1.10 / 1.30 → 0.80 ms |
| Sin | 1024×768 / 768×1024 | 1.40 → 0.70 / 0.80 → 0.60 ms |
| Mim | 1024×768 / 768×1024 | 0.90 → 0.70 / 0.90 → 0.70 ms |
| Nya | 1024×768 / 768×1024 | 0.80 → 0.50 / 0.80 → 0.60 ms |
| Duo | 1024×768 / 768×1024 | 1.70 → 0.80 / 1.10 → 0.80 ms |

Current p95 frame intervals are **16.7–16.8 ms**, with no observed long tasks in
these rows. Practice control renders remain 8/14 according to stroke count;
practice SVG writes increase by one per run. Duo SVG writes remain 670, and
control renders are 14 landscape / 16 portrait, compared with 14 in both baseline
rows. This preserves bounded semantic updates rather than per-frame numeric
control rendering. Lower observed batch timings do not establish a causal
physical latency improvement; scheduling and warm-up can affect desktop runs.

See [matched comparison](../output/verification/endpoint-finish/performance-comparison.json),
[practice measurements](../output/verification/endpoint-finish/after-play-light.json)
and [Duo measurements](../output/verification/endpoint-finish/after-duo-light.json).
Both executed bundles were fingerprinted. Current JS is `index-CMp2Xdfz.js`;
CSS remains the unchanged `index-CCf4Eyi8.css`.

## APK and remaining device validation

[Taman-Jawi-1.0.5-release.apk](../output/releases/Taman-Jawi-1.0.5-release.apk)
is **6,319,962 bytes**, version code **6**, package
`com.hananaacademy.tamanjawi`, minimum API 26 / target API 36. Its preserved
certificate SHA-256 is
`864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365`.
APK SHA-256:
`e4c511dbf224f88fa8f4d34328d4c3367e7b066be17c426c567e2f0c347d0741`.
See the [checksum sidecar](../output/releases/Taman-Jawi-1.0.5-release.apk.sha256)
and [release history/install notes](ANDROID_RELEASE.md).

No Android device/emulator was connected during verification. Installation,
native WebView input latency, physical fullscreen/fit and on-device saved-data
retention remain unverified. The earlier Windows WebKit native-4K all-letter
limitation is retained; this release does not claim that environment passed.

On the user's tablet, keep **Paparan ringan**, trace Ghain to point 3 and lift
naturally. If confirmation is requested, tap point 3 and lift once; it should
advance to point 4 without repeated tapping or redrawing. Touch point 4 separately.
Repeat in Solo and Duo, including an interrupted trace. Record the APK version,
viewport/orientation and exported raw diagnostic if a remaining failure occurs.
