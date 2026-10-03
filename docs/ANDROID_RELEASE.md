# Taman Jawi Android release

## Latest release — 1.0.5

Built and verified on **4 October 2026**, Asia/Kuala_Lumpur, after authorisation
of the endpoint finish implementation.

| Item | Value |
| --- | --- |
| File | [Taman-Jawi-1.0.5-release.apk](../output/releases/Taman-Jawi-1.0.5-release.apk) |
| Version | 1.0.5, version code 6 |
| Application ID | `com.hananaacademy.tamanjawi` |
| Size | 6,319,962 bytes, approximately 6.3 MB |
| Android compatibility | Android 8.0+; minimum API 26, target API 36 |
| Signing | Preserved RSA 3072 release identity; verified APK v2 signature |
| Certificate SHA-256 | `864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365` |
| APK SHA-256 | `e4c511dbf224f88fa8f4d34328d4c3367e7b066be17c426c567e2f0c347d0741` |
| Checksum file | [SHA-256 sidecar](../output/releases/Taman-Jawi-1.0.5-release.apk.sha256) |

Jejak Ceria now accepts one fresh endpoint tap and release after the required
tracing is earned. Small release-only displacement from a valid finish receives
bounded assistance; incomplete tracing still requires drawing. Ghain's upper dot
remains separate. New Play attempts use `play-guided-v2` with explicit diagnostic
provenance. Lightweight Android presentation, native fullscreen/fit, content,
audio, strict/copy modes, scoring and older progress records remain preserved.

Offline assembly/lint passed after resolving the single Windows Gradle cache
finalization failure. Lint has zero errors and four existing warnings. Signature,
ZIP alignment, version/API metadata, checksum and all **91 packaged assets / 37
recordings** passed inspection. Version code increases from 5 to 6 with the same
application ID and certificate; earlier APKs and checksums are preserved.

See [behavior, browser checks, measurements and device limits](ENDPOINT_FINISH_DETECTION_VERIFICATION.md),
[APK inspection](../output/verification/android-release-1.0.5/apk-verification.json)
and [successful Android build](../output/verification/endpoint-finish/android-build-retry.log).
No Android device/emulator is connected; installation, native WebView performance
and the recorded interaction on the physical tablet remain pending.

## Historical release — 1.0.4

Built and verified on **3 October 2026**, Asia/Kuala_Lumpur, after the user
approved the low-spec tablet performance implementation.

| Item | Value |
| --- | --- |
| File | [Taman-Jawi-1.0.4-release.apk](../output/releases/Taman-Jawi-1.0.4-release.apk) |
| Version | 1.0.4, version code 5 |
| Application ID | `com.hananaacademy.tamanjawi` |
| Size | 6,319,398 bytes, approximately 6.3 MB |
| Android compatibility | Android 8.0+; minimum API 26, target API 36 |
| Signing | Preserved RSA 3072 release identity; verified APK v2 signature |
| Certificate SHA-256 | `864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365` |
| APK SHA-256 | `9026e4b66f4759e6d5ed8ba2c9b5c9f990f4ef28a9388434022e06b8fa4bd7fa` |
| Checksum file | [SHA-256 sidecar](../output/releases/Taman-Jawi-1.0.4-release.apk.sha256) |

Android now defaults to **Paparan ringan**; **Ruang guru → Tetapan → Paparan
permainan** restores the full presentation. Lightweight visuals reduce SVG
updates and decorative effects. Live tracing cues avoid per-frame React control
renders, diagnostics are throttled, long ink paths use bounded sections, and
the Duo clock updates separately. Native fullscreen/fit, content, recordings,
matching rules, scoring and pupil records remain preserved.

Checked build and 115 unit checks passed. Production Chromium/WebKit covered
223 unique passed cases and six expected CDP skips after affected follow-ups.
One Windows WebKit native-4K all-letter case remains unresolved after a timeout;
Chromium 4K and WebKit phone/tablet checks passed. Final small-screen settings
checks passed in both browsers. Desktop measurements show reduced drawing work
and improved light-preset 4K frame pacing, with mixed input-batch CPU timings.
Physical tablet smoothness remains unverified.

Offline assembly and lint passed after resolving the recorded Windows Gradle
cache rename failure. Lint has zero errors and four existing warnings. Signature,
ZIP alignment, identity/version/API metadata, release flags, checksum and all
91 packaged assets/37 recordings passed inspection. Version code increases
from 4 to 5 with the same application ID and certificate. Prior releases and
checksums remain preserved. No device/emulator is connected; installation,
native WebView performance and saved-data retention require device validation.

See [implementation, measurements and verification limits](LOW_SPEC_TABLET_TRACING_PERFORMANCE_VERIFICATION.md),
[APK inspection](../output/verification/android-release-1.0.4/apk-verification.json)
and [successful Android build](../output/verification/low-spec-tablet/android-build-retry.log).

## Historical release — 1.0.3

Built and verified on **3 October 2026**, Asia/Kuala_Lumpur, after the user's
authorisation to correct Android fullscreen and content fit.

| Item | Value |
| --- | --- |
| File | [Taman-Jawi-1.0.3-release.apk](../output/releases/Taman-Jawi-1.0.3-release.apk) |
| Version | 1.0.3, version code 4 |
| Application ID | `com.hananaacademy.tamanjawi` |
| Size | 6,317,554 bytes, approximately 6.3 MB |
| Android compatibility | Android 8.0+; minimum API 26, target API 36 |
| Signing | Preserved RSA 3072 release identity; verified APK v2 signature |
| Certificate SHA-256 | `864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365` |
| APK SHA-256 | `f20b2cdc1d58b252cb2a920da069a70b15b7e8c06fdd9b4a13adc522fb1acffa` |
| Checksum file | [SHA-256 sidecar](../output/releases/Taman-Jawi-1.0.3-release.apk.sha256) |

The app now starts in native immersive fullscreen and uses a native bridge for
the fullscreen buttons. It handles WebView resize/cutout events, fixes document
panning, and fits short portrait phones from 320×600 CSS pixels. Teacher controls
and adult-preview banners retain their actions at that size. All teaching
geometry, recordings and student readiness are preserved. See the
[changes, test scope and limitations](ANDROID_FULLSCREEN_FIT_VERIFICATION.md).

Checked production build, 107 unit checks, Android assembly/lint and APK
signature/alignment/identity/asset checks passed. All 91 assets and 37 active
recordings are packaged. The application ID and certificate match 1.0.2, and
version code increases from 3 to 4; prior APKs and checksums are preserved.
All 42 production browser cases passed; the Windows preview-server teardown
timed out afterward. Six final fullscreen/resize/scrolling checks then passed
with clean completion against the confirmed external preview.
No Android device/emulator is connected, so actual installation, fullscreen,
cutout handling, rotation and native runtime remain unverified.

## Historical release — 1.0.2

Built and verified on **3 October 2026**, Asia/Kuala_Lumpur, following the user's
request for a newly generated release APK.

| Item | Value |
| --- | --- |
| File | [Taman-Jawi-1.0.2-release.apk](../output/releases/Taman-Jawi-1.0.2-release.apk) |
| Version | 1.0.2, version code 3 |
| Application ID | `com.hananaacademy.tamanjawi` |
| Size | 6,315,854 bytes, approximately 6.3 MB |
| Android compatibility | Android 8.0+; minimum API 26, target API 36 |
| Signing | Preserved RSA 3072 release identity; verified APK v2 signature |
| Certificate SHA-256 | `864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365` |
| APK SHA-256 | `9f1f1ea36e758d22e8da54079b0798082fad705e5b399693fa301b7932f83c9d` |
| Checksum file | [SHA-256 sidecar](../output/releases/Taman-Jawi-1.0.2-release.apk.sha256) |

This is a fresh signed package of the current application. All 91 production
assets and 214 application/native source, dependency, test and configuration
inputs match the verified 1.0.1 release. Teaching content remains unchanged:
35 student-ready lessons, Kaf/Ga pending geometry review in adult preview,
37 approved recordings and Jejak Ceria as the preschool default. Versions 1.0.0
and 1.0.1 and their checksums are preserved.

| Check / command | Scope and result |
| --- | --- |
| `npm test -- --reporter=dot` | Fresh run: 107 passed across 12 files. |
| `scripts/build-android.ps1 -Offline` | Checked web build passed: 37 valid models, 35 student-ready lessons; 91 assets synchronized. Android configuration encountered the recorded Windows cache-rename issue. |
| `scripts/build-android.ps1 -Offline -SkipWebBuild` | Final release assembly and lint passed after two completed project-local cache moves were finalized with the failed build processes stopped. Lint: zero errors, four existing warnings. The successful web build was reused. |
| `scripts/verify-android-release.ps1 -SdkPath <installed SDK>` | Signature, ZIP alignment, application/version/API metadata, release flag, checksum and all 91 packaged asset hashes passed; all 37 recordings present. No permissions, private signing/config files or native libraries packaged. |
| Previous/current APK inspection | 1.0.1 signature reverified; application ID and certificate match, version code increases from 2 to 3. |
| Application/build comparison | 214 protected inputs unchanged; all 91 rebuilt assets match 1.0.1. No new browser run for this packaging-only change; earlier browser results retain their recorded scope. |
| `adb devices -l` | No connected Android device/emulator. Installation and native runtime review remain pending. |

Evidence: [initial build log](../output/verification/android-release-1.0.2/gradle-build.log),
[intermediate retry](../output/verification/android-release-1.0.2/gradle-retry.log),
[successful Android build](../output/verification/android-release-1.0.2/gradle-final.log),
[unit checks](../output/verification/android-release-1.0.2/unit.txt),
[APK inspection](../output/verification/android-release-1.0.2/apk-verification.json),
[application comparison](../output/verification/android-release-1.0.2/application-inputs.json),
[update compatibility](../output/verification/android-release-1.0.2/upgrade-compatibility.json)
and [final protected inputs](../output/verification/android-release-1.0.2/verified-inputs.json).

The same application ID/signing identity and increased version code support an
update over previous releases; actual installation and saved-data retention need
a device check. Native WebView audio, file pickers, system bars, rotation, Back
gestures and physical touch remain unverified. No publication or version-control
operation was performed.

## Historical release — 1.0.1

Built and verified on **3 October 2026**, Asia/Kuala_Lumpur, following the user's
request to generate a new APK from the current working tree.

| Item | Value |
| --- | --- |
| File | [Taman-Jawi-1.0.1-release.apk](../output/releases/Taman-Jawi-1.0.1-release.apk) |
| Version | 1.0.1, version code 2 |
| Application ID | `com.hananaacademy.tamanjawi` |
| Size | 6,315,854 bytes, approximately 6.3 MB |
| Android compatibility | Android 8.0+; minimum API 26, target API 36 |
| Signing | Existing RSA 3072 release identity; verified APK v2 signature |
| Certificate SHA-256 | `864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365` |
| APK SHA-256 | `ffba9527206f6e8c49779c28f09970d8708c5b010c7a73b174d38a5fbb60c38a` |
| Checksum file | [SHA-256 sidecar](../output/releases/Taman-Jawi-1.0.1-release.apk.sha256) |

This APK packages the current fullscreen layout, Kaf/Ga correction and tracing
finish/recovery and performance fixes. The [Kaf/Ga implementation document](KAF_GA_SHAPE_CORRECTION_IMPLEMENTATION.md)
and supplied reference image were reviewed, along with current production
captures. Kaf revision 2 and Ga revision 3 remain pending geometry review and
available through adult preview. The other **35 approved lessons** and all
**37 approved recordings** retain their existing readiness and revisions.
Jejak Ceria remains the preschool default.

The application ID and signing certificate match 1.0.0, and version code increases
from 1 to 2. Install this APK over the existing app to update it while retaining
local app data; native installation and data retention still need a device check.
The original APK and checksum are preserved. Release/verification scripts now
derive filenames and evidence directories from `android/app/build.gradle`; the
release command refuses to overwrite an existing version.

| Check / command | Scope and result |
| --- | --- |
| `npm test -- --reporter=dot` | 107 passed across 12 files. |
| `scripts/build-android.ps1 -Offline` | Content validation, production web build, asset sync, `:app:assembleRelease`, `:app:lintRelease` and signing passed. Content: 37 valid models, 35 student-ready lessons. Lint: zero errors, four previously documented warnings. |
| Selected production Playwright checks | 34 passed, two expected WebKit skips for Chromium CDP touch; zero failures or flaky results. Android export/Back/background, tracing recovery and release events, corrected Kaf/Ga, readiness gates, Solo trophies and tablet Duo/pause covered. |
| `scripts/verify-android-release.ps1 -SdkPath <installed SDK>` | Signature, ZIP alignment, application/version/API metadata, release debugging flag, absence of permissions/private files/native libraries, checksum and all 91 packaged asset hashes passed. All 37 active recordings are present. |
| Old/new APK comparison | Same application ID and certificate, increased version code; both signatures valid. |
| Input comparison | All 168 application/asset/test/config inputs recorded by the tracing delivery remain identical. Packaging changes only Android version metadata, three release scripts and current release documentation; existing edits and the old APK/checksum are preserved. |
| Visual review | Inspected production phone Alif recovery/release cues, portrait tablet Duo stages and Kaf/Ga help previews against the supplied reference. |

Production assets: `index-E1jWQ9Ri.js` and `index-B_G2-FFu.css`. Node 24.19.0,
Playwright 1.63.0, workspace Chromium/WebKit, JDK 17 and Gradle 8.14.3 were used.
Browser checks use `playwright.tracing.config.js`, two workers, DPR 1 and production
preview at port 4173. The exact selected command is recorded in
[browser results](../output/verification/android-release-1.0.1/browser-results.json).
Fresh captures are under `output/verification/android-release-1.0.1/captures/`.

Evidence: [build log](../output/verification/android-release-1.0.1/gradle-build.log),
[unit checks](../output/verification/android-release-1.0.1/unit.txt),
[APK inspection](../output/verification/android-release-1.0.1/apk-verification.json),
[bundled assets](../output/verification/android-release-1.0.1/bundled-assets.json),
[upgrade compatibility](../output/verification/android-release-1.0.1/upgrade-compatibility.json)
and [protected-input comparison](../output/verification/android-release-1.0.1/protected-inputs.json).

No Android device/emulator is connected (`adb devices` returned an empty list).
Installation/update, native WebView audio, file pickers, system bars, rotation,
Back gestures and physical touch/smoothness remain unverified. Browser checks
simulate the native bridge; the earlier Sin 4K frame-timing limit remains recorded
in [the tracing verification](TRACING_COMPLETION_AND_PERFORMANCE_VERIFICATION.md).
Read-only SDK metadata warnings did not prevent the offline build. No publication
or version-control operation was performed.

## Historical first release — 1.0.0

Built and verified on **2 October 2026**, Asia/Kuala_Lumpur, after the user
requested an Android APK of the current game. This is the first Android package
in this workspace; no earlier Android release or signing identity was present.

## Delivered package

| Item | Value |
| --- | --- |
| File | [Taman-Jawi-1.0.0-release.apk](../output/releases/Taman-Jawi-1.0.0-release.apk) |
| Version | 1.0.0, version code 1 |
| Application ID | `com.hananaacademy.tamanjawi` |
| Size | 6,309,010 bytes, approximately 6.3 MB |
| Android compatibility | Android 8.0+; minimum API 26, target API 36 |
| Signing | Local release certificate, RSA 3072, verified APK v2 signature |
| Certificate SHA-256 | `864f4e05661fae5e6ea3865d007c8b93d18db959396fe617d589d9aed55f3365` |
| APK SHA-256 | `703702842695224e97a76980e85fd7d8a960797728c9a99ed64ee974032ec577` |

The package includes the current Taman Kawan Ceria theme, interactive alphabet
book, all 37 approved letters and their active recordings, Jejak Ceria default,
Solo challenges, Duo 1v1 and teacher records. It is a universal APK with no native
ABI libraries. Keep Android System WebView updated on the target device.

## Install and use

1. Copy the APK to the Android phone or tablet and open it from its file manager.
2. If Android asks, allow that file manager to install this APK, then select Install.
3. Open **Taman Jawi**. Lessons, recordings and game artwork are bundled for
   offline use; no local preview server is required.

The Android app stores its own local profiles and progress. Existing desktop
browser records do not transfer automatically. Teacher exports open Android's
save-file picker; local audio audition opens its audio-file picker. Installing a
future release over this one requires the same application ID and signing key,
with an increased version code. Uninstalling or clearing app data removes local
records; export records before doing either.

Android Back returns through the game's navigation, preserves the existing
unsaved-copy prompt and asks before closing from the welcome screen. In matches,
Back opens the existing exit prompt. Backgrounding cancels active writing and
demonstrations, settles a pending book turn and pauses the shared match clock.
The activity keeps its WebView during ordinary orientation changes.

## Packaging and rebuilding

The native Java activity hosts the production Vite files through
[WebViewAssetLoader](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content)
at the secure, local `https://appassets.androidplatform.net/index.html` origin.
External requests and navigation are blocked. The merged manifest requests no
Android permissions; release debugging and automatic backup/device transfer
are disabled. No accounts or analytics were added.

Build prerequisites are Node compatible with this project, JDK 17, Android SDK
platform 36, Build Tools 36.0.0 and Gradle 8.14.3. The build uses Android Gradle
Plugin 8.13.0 and AndroidX WebKit 1.14.0. On this machine it reused the installed
Microsoft JDK and Unity editor's Android SDK. The two missing transitive build
dependencies were retrieved from the configured Google Maven/Maven Central
repositories into the project's ignored cache.
The generated Gradle wrapper is also included for rebuilding on another machine;
its JAR matches the [official Gradle checksum](https://gradle.org/release-checksums/)
and its distribution is pinned to the official SHA-256 value. The final APK was
built with the installed Gradle 8.14.3 distribution.

```powershell
npm run android:release
# Explicit tool locations, if automatic detection is unavailable:
powershell -NoProfile -File scripts/build-android.ps1 -SdkPath 'C:/path/to/Android/Sdk' -GradlePath 'C:/path/to/gradle.bat'
# Verify an existing release:
powershell -NoProfile -File scripts/verify-android-release.ps1 -SdkPath 'C:/path/to/Android/Sdk'
```

The release command validates/builds the web game, copies `dist/` into generated
Android assets, assembles and lints the release, verifies its signature and writes
the APK/checksum under `output/releases/`. `-Offline` is available once the build
dependencies are cached; `-SkipWebBuild` is for an already checked, unchanged
production build. Source files and local signing material are excluded from the
APK. Gradle and Android user settings stay under the ignored `.tools/` directory.

**Preserve `android/keys/taman-jawi-release.jks` and `android/signing.properties`
in a private backup.** They are ignored local files and were not included in the
APK or verification output. Do not regenerate this identity for an update. Change
`versionCode`/`versionName` in `android/app/build.gradle` when producing the next
version; the updated release/verification scripts derive version-specific paths.

## Verification of this release

| Check | Scope and result |
| --- | --- |
| `npm run build` | Passed; 37 authored models and 37 student-ready lessons. Production JS `index-C85St1hp.js`, CSS `index-BgvUgsC8.css`. |
| `npm test` | Passed, 81 checks across seven files. |
| Selected production Playwright cases | Passed, 26 Chromium/WebKit cases with zero failures, skips or flaky results. Includes native-event bridge tests, unsaved-copy exits, backgrounded writing/demo/turns, shared Duo pause/Back, export, storage failures and touch regression. |
| `scripts/build-android.ps1 -Offline -SkipWebBuild` | Final release assembly and Android lint passed. Lint: zero errors, four reviewed warnings. |
| `scripts/verify-android-release.ps1` | Passed signature, ZIP alignment, application/version/API metadata, release debugging flag, absence of permissions/private files/native libraries, checksum and all 91 packaged asset hashes. All 37 active letter recordings are present. |
| Protected-input comparison | 92 earlier protected files unchanged, including teaching content, recordings, tracing and lockfile. The only expected change among the 93 earlier protected inputs is `package.json`, adding the Android build commands. |
| Visual evidence | Inspected the current production Duo synchronized page-turn capture. Web presentation assets are unchanged apart from the Android lifecycle/export/navigation integrations. |

The selected browser command was:

```powershell
npx playwright test android-platform.spec.js book-layout.spec.js game.spec.js solo-duo.spec.js --grep 'Android|copy exit|discarding an unsaved copy|freezes completed|shared book turn|shared pause|native pointer flow|quota errors|corrupt or unavailable' --config output/verification/android-release/playwright.config.mjs --project chromium --project webkit --workers 2
```

Evidence: [APK inspection](../output/verification/android-release/apk-verification.json),
[browser results](../output/verification/android-release/browser-results.json),
[bundled asset hashes](../output/verification/android-release/bundled-assets.json),
[source inputs](../output/verification/android-release/verified-inputs.json),
[final Android build log](../output/verification/android-release/gradle-build.log)
and [Duo capture](../output/verification/android-release/captures/duo-shared-book-turn.png).

Reviewed lint warnings concern an API-33 manifest flag ignored on earlier Android,
required JavaScript in the local game, a redundant API-26 icon qualifier and the
older adaptive icon's lack of a monochrome layer. A separate API-33 icon supplies
that monochrome layer. The legacy Back-method lint suppression is limited to that
method: API 33+ uses the registered platform callback and API 26–32 uses the legacy
entry. Both flow into the same guarded game navigation.

This Windows host temporarily refused two completed Gradle cache-directory
renames. Finalizing each project-local cache move after its build process exited
resolved them. The SDK also reports read-only package-metadata warnings, and lint
reports an unavailable analytics settings path; neither prevented the final
checked build. SDK files were not changed.

**Device installation and native runtime checks remain unverified:** no Android
device or emulator is connected. Browser tests simulate the Android bridge/events;
they do not establish real WebView audio, native file-picker behavior, system-bar
layout, rotation, Android Back gestures or physical two-finger play. The next
device check should install this APK, open it without network access, complete a
lesson with audio, turn pages, exercise Back/background/rotation, save an export,
and play a Duo round with two simultaneous contacts. No store publication occurred.
