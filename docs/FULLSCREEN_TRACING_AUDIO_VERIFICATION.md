# Fullscreen tracing, completion voice and music — delivery

**Recorded:** 4 October 2026, Asia/Kuala_Lumpur.  
**Status:** implemented and verified locally after the user's “proceed” and “continue”.
The [implementation document](FULLSCREEN_TRACING_AUDIO_IMPLEMENTATION.md) was prepared first.

## Delivered behaviour

- Practice and Solo/Duo tracing use the whole available writing stage. The permanent bottom
  panel, instruction/encouragement strip, buttons and their reserved space are removed.
- One corner **Menu** opens navigation, demonstration, retry, help, optional dot assistance,
  sound and fullscreen controls. Numbered writing guides and required dots remain on the letter.
  Match readiness appears temporarily before the countdown; the Duo menu pauses both lanes.
- Game entry requests fullscreen from the child's entry gesture. Unsupported fullscreen has
  a usable browser fallback; ordinary page turns do not request it again.
- A validated complete letter, including every stroke and required dot, plays its approved
  name recording once. **Dengar** replays it; a new attempt can announce again. Demonstrations
  and saving a copy do not announce completion. Duo uses one shared announcement per round,
  and the second finisher does not restart or cut off the first announcement.
- Completion choices wait 700 ms after the final release. Copy coordinates, explicit saving,
  unsaved-copy protection, progress records, scoring and independent Duo input remain intact.
- One original local instrumental loop plays quietly during the game. Music fades lower under
  letter speech and during readiness/countdown; pause, background, hiding the page and leaving
  the game stop playback. Master mute covers voice and music. Music has separate on/off and
  volume preferences in the teacher area, saved under `taman-jawi.music.v1`.

The [music record](BACKGROUND_MUSIC_ASSETS.md) documents the asset, source and mix defaults.

## Changed implementation areas

| Area | Files |
| --- | --- |
| Audio lifecycle, independent loop and preferences | `src/audio/audioManager.js`, `musicManager.js`, `musicPreferences.js`, `src/App.jsx` |
| Fullscreen entry | `src/platform/fullscreen.js` |
| Stage, menu and completion presentation | `src/components/TracingMenu.jsx`, `TraceBoard.jsx`, `RaceTracePane.jsx`, `FitDialog.jsx`; `src/screens/BookLessonScreen.jsx`, `MatchScreen.jsx`, `ResultScreen.jsx`, `TeacherScreen.jsx`; affected book/match/presentation/fullscreen styles |
| Retry from the paused menu | `src/game/matchReducer.js` |
| Original music | `public/audio/music/taman-kawan-v1.mp3`, `scripts/generate-background-music.py` |
| Verification | `tests/game/music.test.js`, `tests/browser/fullscreen-tracing-audio.spec.js`, affected existing browser specs and navigation/tracing helpers |

This checkout also contains the separate glyph-model work. That work is preserved and is
documented in [its own record](GLYPH_MATCHED_TRACING_MODELS_VERIFICATION.md).

## Completed checks

All browser checks used the production preview at `http://127.0.0.1:4173`, at most two workers,
and `playwright.tracing.config.js`. The existing preview server was reused. Node 24.19.0,
Playwright 1.63.0, Chromium 153.0.8010.12 (revision 1243) and Windows WebKit 26.6 (revision 2359)
were the recorded runtimes.

| Check / command scope | Result | Evidence |
| --- | --- | --- |
| `npm test` | **156 passed**, 17 files | [Unit log](../output/verification/fullscreen-tracing-audio/unit.log) |
| `npm run build` (includes content validation) | Passed: 37 letters/models, 8 student-ready lessons | [Build log](../output/verification/fullscreen-tracing-audio/build.log) |
| `npx playwright test tests/browser/fullscreen-tracing-audio.spec.js --config=playwright.tracing.config.js --workers=2 --global-timeout=240000` | **39 passed, 3 skipped**, no failures | [Focused report](../output/verification/fullscreen-tracing-audio/final-focused.json) |
| Selected `fullscreen-layout.spec.js` journeys and affected follow-ups | **34 unique cases passed**: 20 Chromium, 14 WebKit | [Chromium selection](../output/verification/fullscreen-tracing-audio/layout-chromium.json), [phone settings correction](../output/verification/fullscreen-tracing-audio/layout-followup.json), [Duo correction](../output/verification/fullscreen-tracing-audio/duo-layout-final.json), [WebKit selection](../output/verification/fullscreen-tracing-audio/layout-webkit.json) |
| Selected `book-layout`, `android-platform`, `solo-duo` and `endpoint-finish` regressions | **51 passed, 5 skipped**, no failures | [Regression report](../output/verification/fullscreen-tracing-audio/regressions.json) |
| `git diff --check` | Passed | Checked after the final source/document edits |

The exact selections, environment paths and commands are retained in the corresponding JSON
reports and logs. [The combined summary](../output/verification/fullscreen-tracing-audio/browser-summary.json)
uses the latest result for each browser/file/test title: **124 passed, 8 skipped, zero unresolved
failures** (69 Chromium passes; 55 WebKit passes). Superseded failures and diagnostic runs
remain in their original reports; they are excluded from the final totals.

Layout checks cover 320×600, 390×844, both tablet orientations, 1280×800, 1920×1080 and
Chromium 3840×2160. All 37 authored letters, dots and numbered guides fit and avoid corner
controls in seven Chromium and four WebKit viewport journeys (407 letter/viewport inspections).
Adult preview provides access to models still awaiting review; student readiness is not bypassed.

The broader checks found a 10-pixel overflow in the new settings on a short phone. Compact
panel spacing fixes it while preserving touch targets; both browsers passed the affected
320×600 settings/tab journey. Older Duo/endpoint setup journeys assumed five eligible pilot
letters; they now select three rounds from the actual four-letter pilot pool. A follow-up
corrected an ambiguous test label before both tablet orientations passed in both browsers.

Visual inspection includes phone tracing, menus/help, completion/copying, short-phone music
settings, portrait/landscape Duo, 768×1024, 1280×800 and native Chromium 4K. Representative
captures: [phone menu](../output/verification/fullscreen-tracing-audio/layout/final-phone-menu.png),
[phone help](../output/verification/fullscreen-tracing-audio/layout/final-phone-help.png),
[music settings](../output/verification/fullscreen-tracing-audio/layout/final-short-phone-music-settings.png),
[completion](../output/verification/fullscreen-tracing-audio/layout/chromium-390-completed.png).

## Audio and protected inputs

Chromium decoded the packaged music MP3, an approved letter MP3 and an existing letter WAV
into non-silent samples. A separate native-media check verified that the real music player
advances and real completion speech plays. Lifecycle instrumentation checks exact once-only
announcements, replay, ducking/restoration, mute, separate suspension reasons, hidden/native
background cancellation, disposal, storage failures and blocked playback without blocking
completion. Actual audio measurements are attached to the focused report.

[The protected comparison](../output/verification/fullscreen-tracing-audio/protected-final.json)
confirms **all 68 files unchanged since this continuation resumed**: 64 existing recording files,
the catalogue, its validator and both approval records. Compared with the original interrupted
task's snapshot, 66 match; `letters.json` and `validateContent.js` had already changed in the
separate glyph-model work before this continuation. This task does not add content approval,
alter those models, replace any name recording or invent a teacher assessment. The current
8 ready / 29 awaiting-review gate remains enforced.

Final production files are `index-D7myZH7Q.js` and `index-K995a-pt.css`.
[182 input fingerprints](../output/verification/fullscreen-tracing-audio/final-inputs.json)
record source, runtime assets, dependencies/configuration, selected browser checks, unit inputs
and production bundles. The focused audio run preceded the final teacher-only CSS spacing fix
(`index-tCU8euwZ.js` / `index-DXtz_BZD.css`); its relevant audio and tracing inputs did not change.
The checked rebuild, affected settings follow-up, WebKit layout selection and regressions use
the final build. Repeat a check when its affected inputs change or a new concern appears.

## Practical limits

- The three focused skips are Windows WebKit native 4K, unavailable `AudioContext`, and its
  unsupported actual media playback. Chromium verifies those supported paths. Five regression
  skips require Chromium CDP for native emulated multi-touch; they pass in Chromium.
- The browser helper neutralises the native fullscreen request for resize-based automation;
  explicit request/fallback and Android bridge tests use their own stubs. No physical Android
  device or emulator was used for these checks. Physical native fullscreen and background audio need device review.
- Music playback and mix controls are technically verified. Nobody has auditioned the loop
  or assessed its tone, perceived level or MP3 loop boundary with teachers/pupils on devices.
- No new Android APK, asset sync, deployment, publication, commit or push was performed.
  The existing Android package retains its previously recorded contents.
