# Taman Jawi Android release

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
`versionCode`/`versionName` in `android/app/build.gradle` and the output filename
in the release/verification scripts when producing the next version.

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
