# Taman Jawi

A local React + Vite game for recognising Jawi letters and practising writing with
mouse, touch or pen. The interface is in Bahasa Melayu. It uses native SVG,
Pointer Events and a separate JavaScript tracing validator.

Contributor guidance: [AGENTS.md](AGENTS.md), with a compact
[current project state](docs/PROJECT_STATE.md) and
[verification guide](docs/VERIFICATION_GUIDE.md) for avoiding redundant work.

Source repository: [Azrinfreeman/JawiPrasekolah](https://github.com/Azrinfreeman/JawiPrasekolah) (private).

## Try it locally

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The Hanana Academy splash automatically continues
after 1.8 seconds; press **Teruskan** to continue immediately. Select a local
profile and press **Jom mula** to open the 35 currently approved lessons. For adult preview,
open **Ruang guru → Buka pratonton dewasa**.

**Cara bermain → Solo → Latihan santai** is selected by default. Choose
**Cabaran trofi** for a timed Solo challenge, or **Duo 1v1** for two players on
one tablet or smartboard. Duo first checks two simultaneous touches, then uses
equal upright boards and the same letters. Faster valid completions earn more
marks. Both players share countdowns, pauses and round deadlines. Setup offers
3/5/10 rounds and 60/90/120 seconds, with 5 rounds and 90 seconds selected first.
Choose separate local profiles; competitive results appear in **Ruang guru**.
See [the implementation](docs/SOLO_DUO_IMPLEMENTATION.md) and
[verification](docs/SOLO_DUO_VERIFICATION.md).

The game fits its viewport without scrolling. Letter tracing uses one large,
centred book page with a translucent bottom dock, deliberate page turns and
saved-copy protection. Use **Paparan penuh** to request browser fullscreen.
When the viewport cannot safely fit the controls, rotate the device or reduce
zoom as the fitted guidance suggests. Letter and teacher lists use pages; exports
still include all retained records. See the [layout plan](docs/FULLSCREEN_GAME_LAYOUT_IMPLEMENTATION.md)
and [verification](docs/FULLSCREEN_GAME_LAYOUT_VERIFICATION.md).

**Jejak Ceria** is the default preschool activity. Follow the dotted route to
fill the letter with colour. If a finger wanders, the colour pauses and keeps
the accepted progress; return to the green marker or lift and touch there again.
Required dots can be touched on the board or added with a large **Tambah titik**
button. Each dot still needs its own press and release.

Numbered circles show **Mula → Ikut → Henti/Siap** for the current part, then
advance to the next stroke or dot. Follow the route through the numbers; lift
at the end of a stroke or after each dot. See
[the numbered guide notes](docs/NUMBERED_TRACING_GUIDES.md).

Near the end, a lifted incomplete trace shows an arrow to the saved frontier and
asks the child to continue to the final number. Once the required tracing is
accepted, **Sentuh titik …, kemudian angkat jari** asks for one endpoint tap and
release if the stroke did not finish on the original lift. Ghain still needs its
separate upper dot afterward. The held cue says **Angkat jari untuk siap** only
when release can complete the stroke. See [endpoint verification](docs/ENDPOINT_FINISH_DETECTION_VERIFICATION.md).
Local path searches and
event-batch coordinate conversion reduce tracing work; see the
[completion and performance verification](docs/TRACING_COMPLETION_AND_PERFORMANCE_VERIFICATION.md).

For later practice, select **Ruang guru → Jenis latihan → Berpandu** or
**Kurang panduan**, then open a new lesson. Difficulty choices stay in the
teacher area. The coloured play result is labelled as assisted practice.

**Teaching readiness:** 37 catalogue entries and tracing models, with 35
student-ready lessons. Kaf revision 2 and Ga revision 3 now share the connected
body from the supplied reference, with one upper dot for Ga. These corrected
models await fresh geometry review and are available in adult preview. The
other 11 original models retain approved revision 1; the other 24 additional
models retain approved revision 2. See [the correction and review sheet](docs/KAF_GA_SHAPE_CORRECTION_VERIFICATION.md)
and [historical approvals](docs/CONTENT_APPROVALS.md). 27 supplied alphabet recordings
and 10 retained synthetic name recordings were all approved by the project owner
on 2 October 2026. See [the audio approval record](docs/AUDIO_APPROVALS.md).
Open **Ruang guru → Suara → Semakan suara Jawi** to listen to all 37
recordings, or press **Dengar** in a pilot lesson. See
[the current recording review list](docs/AUDIO_REPLACEMENT_REVIEW.md).
The application never substitutes beeps or speech synthesis for pronunciation.

The pilot models are Alif, Ba, Ta, Dal, Ra, Sin, Kaf, Lam, Mim, Nun, Wau and Ya.
Ten further models—Sa, Jim, Ca, Ha (ح), Kha, Zal, Zai, Syin, Sad and Dad—are
approved at revision 2.
The final 15 models—Ta marbutah, Ta (ط), Za, Ain, Ghain, Nga, Fa, Pa, Qaf, Ga,
Va, Ha (ه), Hamzah, Ye and Nya—were approved at revision 2. Ga's corrected
revision 3 now awaits fresh review.
**Jom mula → Huruf tersedia** shows the 35 approved lessons. **Huruf permulaan**
retains the original 12, and **Model tersedia** in adult preview shows all authored
models. Adult preview includes all 37 models. **Ruang guru → Kandungan & semakan**
records approvals and provides **Buka** buttons for individual models.
See [the first batch's implementation and review notes](docs/LETTER_BATCH_1_REVIEW.md).
See [the second batch's implementation and review notes](docs/LETTER_BATCH_2_REVIEW.md).
See [the final batch's implementation and review notes](docs/LETTER_BATCH_3_REVIEW.md).

## What works

- Welcome, letter garden, lesson, result and teacher screens.
- Taman Ceria theme: sky blue, white learning surfaces, a cheerful leaf companion,
  large labelled controls and responsive two/four/six-column letter cards. Writing
  cues and celebration stay outside the square paper. See the
  [theme implementation and verification](docs/UI_THEME_VERIFICATION.md).
- Hanana Academy launch splash, welcome credit and footer logo, using the supplied
  artwork unchanged. The splash appears on opening/reload and stays dismissed
  during navigation; failed logo loading has a readable text fallback.
- Strict tracing: validate actual movement before showing ink. A wrong start,
  sideways excursion, shortcut or reversal blocks that gesture until release,
  removes its provisional ink and restores its previous clean progress.
- Preschool tracing: a separate assisted matcher checks ordered forward movement,
  pauses without erasing accepted progress, supports same-finger recovery, and
  prevents distant re-entry, shortcuts, dwelling or tiny wiggles from filling a
  letter. Only accepted progress reveals the authored route; it is not raw ink.
- Guided clean prefixes can resume; continuous precision strokes restart after an
  early lift. Both modes use separate, fixed v2 tolerance profiles.
- Dots require separate contained taps with a small movement limit. Valid taps
  fill authored targets as assisted stamps; dot scribbles leave no freehand trails.
- Preschool dots also offer a 64-pixel-high equivalent button, with containment,
  drag and held-key checks. Teacher diagnostics identify this assistance.
- A compact board-first preschool screen, gentle idle cue, original smiling leaf
  reward and deliberate **Main lagi** / **Huruf seterusnya** actions.
- A demonstration that cannot score pupil input; retry and cancellation recovery.
- A blank copying board with actual ink saved for teacher observation, without a
  handwriting-recognition score.
- Local recording integration, replay, mute, volume, failure handling and an
  explicit teacher audition button for a selected local file.
- Versioned local progress, per-profile summaries, export and deliberate reset.
- Responsive layout, isolated RTL Jawi, large controls, keyboard menus and reduced motion.

The game does not establish independent handwriting mastery, an official KPM TP,
or coverage of all reading and word-copying outcomes.

## Commands

```sh
npm test                         # deterministic geometry/state/content/audio tests
npm run check:content            # manifest and recording-file checks
npm run build                    # checked production build in dist/
npm run preview                  # preview that production build on port 4173
npm run android:release          # checked, signed Android APK (requires Android SDK/JDK/Gradle)
npx playwright install chromium firefox webkit
npm run test:browser             # all three browser projects
npm run test:browser -- --project=chromium --project=webkit
node scripts/capture-preview.js  # screenshots; requires the dev server
node scripts/capture-strict-tracing.js # accepted/rejected ink and dot screenshots
node scripts/capture-play-tracing.js # colour fill, pauses, dot pads and rewards
node scripts/measure-tracing.js output/verification/strict-tracing-performance.json
node scripts/measure-tracing.js output/verification/play-tracing-performance.json play
node scripts/verify-branding-preview.js # branding + strict/play smoke; preview on 4173
node scripts/verify-draft-audio.js # check 37 active recordings, playback and review layouts on 4173
node scripts/verify-letter-batch-2-approval.js # five approved student lessons, preserved content and responsive captures on 4173
```

Development used Node 24.19.0. Vite currently requires Node 20.19+ or 22.12+;
check the installed package's engine requirements when upgrading. Commit/use
`package-lock.json` for repeatable installs. Git tracks source, teaching assets,
the signed APK and lightweight verification records. Build caches, temporary files,
screenshots and Android signing keys stay local.

On this Windows machine the downloaded Firefox executable fails to launch with
`spawn UNKNOWN`, including outside the process sandbox. The Firefox project is
retained for a functioning runtime. Windows Playwright WebKit rejects the PCM WAV
fixture with `NotSupportedError`; its failure message is tested, while successful
codec playback needs verification on a supported device. See
[the acceptance record](docs/ACCEPTANCE.md) for actual checks and limitations.

## Add reviewed teaching content

Edit `src/content/letters.json` and follow [CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md)
and [AUDIO_RECORDING.md](docs/AUDIO_RECORDING.md). Keep geometry and audio review
states separate. Do not mark guessed or generated content approved.

- Models use a 1000 × 1000 logical board with single, continuous SVG centreline
  paths per movement. Font outlines are not stroke routes.
- Each dot has its own target ID, location and tap/travel policy.
- `validSequences` can declare reviewed alternatives; every sequence must include
  every required movement/mark once.
- Add permissioned recordings under `public/audio/`, provide transcript/revision
  metadata, and run content validation/build before enabling the lesson.
- Only lessons with both approved geometry and all required approved recordings
  are enabled in the normal student catalogue. Review records must match revisions.
- `scripts/generate-draft-content.py` was used for initial scaffolding and refuses
  to overwrite an existing catalogue.

Reference documents: [implementation specification](IMPLEMENTATION.md) and
[KPM/DBP research PDF](output/pdf/Kajian_Jawi_Prasekolah_KPM_2026.pdf).
Company branding: [splash and logo implementation plan](docs/BRANDING_SPLASH_IMPLEMENTATION.md).
Strict tracing: [rules and implementation record](docs/STRICT_TRACING_IMPLEMENTATION.md).
Preschool play: [Jejak Ceria specification and super prompt](docs/PRESCHOOL_PLAYFUL_TRACING_IMPLEMENTATION.md).

## Storage and privacy

Profiles use Bunga, Daun or Bintang nicknames/icons. Data stays in this browser,
under `taman-jawi.progress.v1`. Up to 300 attempt summaries and 12 bounded copy
drawings are retained. Tracing diagnostics remain in memory until a teacher
deliberately exports them. No accounts, network analytics, pupil voice recording
or cloud synchronisation are included. The teacher screen is a convenience view,
not an authenticated security boundary; reset has its own confirmation.

UI and Jawi fonts are packaged locally, with their licences in `public/fonts/`.
The screenshot check found no external runtime requests. The web version does
not include PWA offline caching. The separate signed Android APK bundles the
game, recordings and artwork for offline use; see [Android release and installation](docs/ANDROID_RELEASE.md).
Android progress stays in the app's own storage, and teacher exports use its
native save-file picker. The latest APK is [Taman Jawi 1.0.5](output/releases/Taman-Jawi-1.0.5-release.apk),
with native fullscreen, fitted controls and a lightweight Android presentation
that reduces tracing redraw work, plus reliable endpoint confirmation after
accepted tracing; see [verification and measured limits](docs/ENDPOINT_FINISH_DETECTION_VERIFICATION.md).

## Source layout

`src/tracing/` owns geometry, matching, tolerances, raw input and lesson actions.
`src/components/TraceBoard.jsx` separates raw diagnostics, accepted tracing ink,
assisted dot stamps, free copying and demonstrations.
The play matcher exposes assisted route fill separately from raw movement and
measured coverage. Its diagnostic buffer can be deliberately continued without
losing accepted play progress. Legacy, strict and play summaries remain readable
under storage version 1.
`src/content/` owns the catalogue and readiness gate. `src/audio/` owns playback
lifecycle. `src/storage/` owns bounded persistence. Screens do not award tracing
success; the matcher commits completion only on a validated pointer-up.

Primary technical references: [React](https://react.dev/learn),
[Vite](https://vite.dev/guide/), [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events),
[SVG geometry](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength),
[Vitest](https://vitest.dev/guide/) and [Playwright](https://playwright.dev/docs/emulation).

## Publishing

No website deployment or app-store publication has been performed. `dist/` is a static build;
deployment configuration and any future offline policy should be verified for
the chosen hosting environment before publication.
