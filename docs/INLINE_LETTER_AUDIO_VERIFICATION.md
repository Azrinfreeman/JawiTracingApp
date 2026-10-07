# Direct selected-letter sound

6 October 2026, Asia/Kuala_Lumpur. Implemented the owner's request to put the
sound button beneath the selected alphabet in the corner heading, for all letters.

## Behaviour and scope

**Dengar**, with a sound icon and a minimum 48-pixel touch height, now sits
immediately beneath the current letter name. All 37 practice lessons share it,
including Jejak Ceria, guided/precision practice and freehand copying. Solo and
Duo have one shared button beneath the current round's letter. Its accessible
name identifies the selected letter; keyboard activation and repeated playback
use the existing approved name recording and audio manager.

Practice and readiness/pause menus no longer contain this replay action. Mute,
music and the remaining tools stay in Menu. Completion/result replay remains
available. During page transitions, demonstrations and blocking overlays the
stage button is disabled; Solo/Duo enable it during readiness and racing.
Practice playback cancels an active contact while preserving accepted progress
and stored copying ink. Listening does not award completion or pause a race.
Playback failure uses the existing recovery notice/dialog.

Guide labels reserve the taller heading area. When a letter's complete fitted
bounds approach that corner, its display gains top clearance. This resolves
Lam's phone start-number collision while retaining a uniform scale and a camera
independent of tracing progress. Authored paths, numbers, input targets, catalogue
revisions/approvals and all recordings are unchanged.

Application changes: `AudioControls.jsx`, `BookLessonScreen.jsx`, `MatchScreen.jsx`,
`fullscreen.css`, `screenLayout.js` and `numberedGuides.js`. Browser media
instrumentation is shared through the existing helpers directory. Current unit
layout expectations allow the deliberate corner clearance.

## Verification

Production build: `inline-letter-audio-20261006`; final bundle
`dist/assets/index-jQapjW2v.js` and `dist/assets/index-BPslPq-M.css`.
Browser checks route local requests to this exact saved production bundle through
`JAWI_STATIC_TEST=1`, with two workers, Chromium and Windows WebKit.

- `npm test`: **188 passes**, 21 files. Uniform fitting, full bounds and
  progress-independent display remain checked.
- `npm run build` with `VITE_BUILD_ID=inline-letter-audio-20261006`: passes;
  included content validation confirms **37 ready lessons**.
- `npx playwright test tests/browser/inline-letter-audio.spec.js
  --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **25 passes, one native-WebKit skip**, no failures or flaky cases; recorded in
  `output/verification/inline-letter-audio/browser-final.json`.
- Selected existing guide/completion/audio regressions in
  `fullscreen-tracing-audio.spec.js`, `fa-pa-directions.spec.js` and
  `four-letter-outlines.spec.js`, both projects and two workers: **30 passes**, no
  failures, flaky cases or skips; recorded in
  `output/verification/inline-letter-audio/browser-regression.json`.
  The selection covers practice at 320×600, 768×1024 and 1920×1080; menu actions,
  final-dot announcement and music; Solo/Duo completion and pause; Fa/Pa Jejak
  Ceria completions at 320/768 widths; and the four approved outlines at
  320×600 and 1920×1080.
- `node scripts/verify-inline-letter-audio.mjs`: checks the catalogue against
  the pre-task byte snapshot, each of the 37 recording hashes against the prior
  approval stage, current readiness and both final browser reports. Source,
  test, dependency, recording and production bundle hashes are stored in
  `output/verification/inline-letter-audio/inputs.json`.

The direct suite visits **every letter** at 320×600 and 768×1024 in each browser,
checks the selected recording, heading/button/guide clearance, touch dimensions,
overflow and absence of completion credits. Further cases cover keyboard replay,
partial progress, page selection, mute, all practice modes, copying ink, playback
failure, desktop names at 1920×1080, and Solo/Duo readiness/racing at 390×844 and
1280×800. A Chromium check confirms native playback of Ha (ح)'s packaged recording
starts and advances after clicking this button.

Inspected final captures: Chromium Ha (ح) and Lam at 320×600, Duo at 390×844,
Ha (ح) at 1920×1080, and WebKit Ha (ح) at 768×1024. Fa's partial head at 320×600
was also inspected in `browser-regression/`. Direct button captures are in
`output/verification/inline-letter-audio/browser-final/`.
The first run exposed Lam's phone collision and a test assumption that muted
requests would not reach the media recorder. The layout was corrected and the
test now verifies the recording remains muted. That earlier report is preserved
as `browser-direct.json`; the final report supersedes it.

The existing local server responds HTTP 200 at `http://127.0.0.1:5173/` and serves
the updated selected-letter control. No duplicate server was started.

## Limits

Windows WebKit native playback is skipped because of its previously recorded
codec limitation; controlled lifecycle checks cover its interface. Browser events
do not establish physical audible output. Physical device touch/listening and a
new Android package were not part of this verification. Historical content
approval and browser records remain dated evidence for their original stages.
