# Portfolio documentation review

Review date: **6 October 2026**, Asia/Kuala_Lumpur.
Source baseline: `190d0988e6b04c1cb1fc65f3af0d22bd515355e2`.

## What changed

- Added a concise README overview of the learning workflow and engineering.
- Corrected the APK link from 1.0.5 to the tracked 1.0.7 package, added its checksum, and explained that the newer RTL catalogue is not packaged in that APK.
- Replaced outdated batch-revision and Ga-pending claims with the current owner-approval status.
- Aligned the preschool stroke-end description with the current matcher and existing verification record.
- Added a repeatable clone/install flow using the existing lockfile.

## Verification scope

The project's verification guide selects paths, links, scope, and contradiction checks for documentation-only changes, without an app build or browser suite. README claims were checked against catalogue metadata and its readiness validator, `playMatcher.js`, `android/app/build.gradle`, tracked release paths, and current approval/release records. The APK checksum was compared with the tracked sidecar. Local Markdown links and the final changed-file list were checked.

Completed checks against the baseline above:

- `node scripts/check-content.js`: passed, 37 valid letters/models and 37 student-ready lessons; verifies catalogue metadata and recording-file presence.
- Markdown path review: all 36 relative links in the changed documents resolve locally.
- SHA-256 of the tracked 1.0.7 APK: matches its sidecar (`3a84b28893f06d4271197ee31105a94e9923031a96906de9a8d97d2bba9c0ec3`).
- `git diff --check` and changed-file review: passed; two Markdown files only. Repeat these checks if their source inputs or release artifact change.

No application code, teaching geometry, recordings, approval metadata, package configuration, Android settings, or APK bytes changed. No new owner/teacher approval was recorded.

## Existing limits

The project state reports 162 passing unit tests for the latest tracing stage and known browser failures with stale expectations. Those reports were not rerun for this documentation PR. Throttled desktop tracing measurements do not establish performance on a physical tablet. The recorded 1.0.7 package verification does not prove installation, native WebView behavior, audio playback, or data retention on a device.

The current owner-approval gate enables all 37 lessons; it does not establish independent handwriting mastery or an external curriculum assessment. Web source and the APK have different catalogue presentation: RTL source changes were made after packaging. Existing historical verification and approval records remain intact.
