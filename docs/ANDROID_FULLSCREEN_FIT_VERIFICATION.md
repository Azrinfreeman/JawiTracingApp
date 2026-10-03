# Android fullscreen and short-phone fit correction

Implemented on **3 October 2026**, Asia/Kuala_Lumpur, after the user reported
scrolling/unfitted content in the APK and authorised the correction with
“proceced”. This record covers the new 1.0.3 package; earlier verification retains
its original scope.

## Delivered behaviour

Android launches in immersive fullscreen. Native `isFullscreen`/`setFullscreen`
bridge methods control system bars from both the app header and match screen,
without requiring the browser Fullscreen API. Returning from a file picker or
backgrounding restores the chosen fullscreen setting. Android Back continues to
use the existing game navigation and exit protections.

The native host honours the viewport meta tag, avoids overview scaling and
rubber-band overscroll, and notifies the game when the WebView size changes.
On Android 11+, the root handles cutout and keyboard insets once. Transient
system bars overlay the fullscreen game rather than shrinking it. The web
viewport hook observes the document and handles native/orientation events; its
ResizeObserver fallback preserves window-based measurement. A fixed document
body prevents page panning, while existing measured stages, pagers and dialogs
fit the content. The splash uses the container height rather than requiring
dynamic viewport units.

Portrait phone support now starts at **320×600 CSS pixels** instead of requiring
700 pixels of height for narrow screens. Existing short-screen welcome styling
is reused. Short-phone teacher settings and audio controls have compact fitted
layouts, retaining accessible selectors and 48-pixel action targets. Adult
preview has a fitted banner and visible **Tamat** action, with the full accessible
name **Tamatkan pratonton**. Very small windows still offer space guidance;
writing needs a 230-pixel stage and Duo retains its 280-pixel minimum per player.

Teaching geometry, writing order, matching/scoring, approved recordings and
student readiness were not changed. There remain 35 approved student lessons;
Kaf/Ga stay in adult preview pending their existing geometry review.

## Verification inputs and results

Production preview: `http://127.0.0.1:4173`, Node 24.19.0, Playwright 1.63.0,
Chromium/WebKit, two workers, DPR 1. Final assets are `index-B-3mpeEM.js` and
`index-CuXt30Tu.css`. Android uses the installed JDK 17, Gradle 8.14.3,
SDK platform 36 and Build Tools 36.0.0, offline cached dependencies and the
preserved release signing identity.

| Check | Scope / result |
| --- | --- |
| `npm test -- --reporter=dot` | 107 passed across 12 files. Later edits affected presentation and browser fixtures; the pure unit-test inputs remained unchanged. |
| `npm run build` | Final checked production build passed: 37 valid models, 35 student-ready lessons. Rebuilt after each relevant presentation fix. |
| Selected production Playwright cases | 42 passed, zero test failures/skips/flaky results. Five viewport menu/teacher journeys, all 37 adult-preview envelopes at 320×600 and 360×640 in both browsers (148 inspections), native bridge/viewport/Back/export/background, completion/copy, tablet Duo and scrolling covered. A preview-server teardown timeout occurred after tests. |
| External-preview follow-up | Six passed with zero errors/skips/flaky results and clean completion: native fullscreen, native viewport events, wheel/keyboard/native Chromium touch panning in Chromium/WebKit. The exact running production asset was confirmed before reuse; the harness does not manage its server lifecycle. |
| Visual review | Inspected 320×600 teacher audio and adult-preview Nga, 360×640 welcome, and 1024×768 Duo. Controls and complete letter envelopes fit. |
| `scripts/build-android.ps1 -Offline -SkipWebBuild` | Final release assembly and lint passed, using the unchanged final checked production build. Zero lint errors, four existing warnings. |
| `scripts/verify-android-release.ps1 -SdkPath <installed SDK>` | Signature, alignment, identity/API metadata, checksum, all 91 bundled asset hashes and all 37 active recordings passed. No permissions, private signing/config files or native libraries packaged. |
| Previous/current APK comparison | Same application ID/signing certificate; version code increases from 3 to 4. Earlier APKs/checksums preserved. |
| `adb devices -l` | No connected Android device/emulator. Physical/native runtime and installation checks remain pending. |

The initial browser run exposed an outdated 37-student-lesson assertion; the
fixture now derives the student count from the validator and uses adult preview
for all 37 model envelopes. Follow-up checks exposed short-phone teacher
settings/audio overflow, which was corrected. Visual review exposed the old
wrapped preview banner hiding its exit action, which was also corrected and
added to overflow checks. Intermediate logs remain as evidence of those stages.
The scrolling test now uses Playwright's managed touch-capable page fixture
instead of an additional manually closed browser context.
The Windows preview-server plugin teardown timed out after all 42 cases passed;
the subsequent six focused checks completed cleanly against the confirmed
running preview with that lifecycle disabled. This harness error is retained in
the broad report and is not presented as a game-test failure.

The first undelivered 1.0.3 candidate preceded the final presentation fixes. Its
APK and inspection evidence are archived in the `initial-candidate/` evidence
directory. The release in `output/releases/` was rebuilt from the final assets.

Evidence directory: `output/verification/android-release-1.0.3/`.

- [Final checked web build](../output/verification/android-release-1.0.3/web-build-delivery.log)
- [Unit checks](../output/verification/android-release-1.0.3/unit.txt)
- [Final browser command/output](../output/verification/android-release-1.0.3/browser-verified.log)
- [Broad browser results](../output/verification/android-release-1.0.3/browser-verified-results.json)
- [Clean external-preview follow-up](../output/verification/android-release-1.0.3/browser-external-results.json)
- [Final Android build](../output/verification/android-release-1.0.3/gradle-delivery.log)
- [APK inspection](../output/verification/android-release-1.0.3/apk-verification.json)
- [Update identity](../output/verification/android-release-1.0.3/upgrade-compatibility.json)
- [Final protected inputs](../output/verification/android-release-1.0.3/verified-inputs.json)

The native fullscreen implementation follows Android's [system-bar guidance](https://developer.android.com/develop/ui/views/layout/immersive);
viewport settings follow the [WebSettings reference](https://developer.android.com/reference/android/webkit/WebSettings#setUseWideViewPort(boolean)).
Browser bridge simulations do not prove physical Android WebView/system-bar,
cutout, rotation, keyboard, audio or file-picker behaviour. The user's original
device/model/orientation was not supplied, so its exact scrolling failure could
not be reproduced on that hardware. No deployment, publication, commit or push
was performed.
