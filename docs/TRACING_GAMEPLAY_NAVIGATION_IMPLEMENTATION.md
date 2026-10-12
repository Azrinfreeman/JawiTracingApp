# Tracing gameplay buttons and navigation

Date: 7 October 2026  
Status: implementation authorised by the owner's “proceed” on 7 October 2026.
The following design is implemented and verified in the working source.
Optional ideas remain outside this change.

## Goal

Make the drawing screen easier for preschool players to understand, with visible
navigation, meaningful colours, familiar icons and short Malay labels. Players
should be able to return to Isi Kandungan without searching through the menu.
Apply the shared design to all letters, including guided tracing, strict tracing
and copying. Keep Jejak Ceria as the default.

## Findings from the current implementation

- The screenshot shows the full-screen stage with Menu at the upper left and
  the letter name and Dengar at the upper right.
- `BookLessonScreen.jsx` already has a route back to Isi Kandungan, but
  `fullscreen.css` hides the book topline containing its back button.
- `TracingMenu.jsx` mixes help, letter navigation and settings in pages of
  eight actions. Its page labels can be mistaken for previous/next letters.
- Narrow-screen styles hide the Menu text, leaving an icon alone.
- Catalogue filter and position already use the parent-owned view anchor.
  Reuse that state when returning; do not reset the catalogue to its first page.
- Completed progress is saved. An unfinished tracing attempt starts again when
  reopened. Copying already has a save/discard/cancel guard on leaving.
- The numbered-guide planner currently reserves a fixed top-left rectangle for
  Menu. Adding controls requires updating its obstacle bounds too.

## Recommended controls

Keep the controls at the top, outside the drawing area. Use rounded buttons,
clear borders, dark readable text and a small icon beside each label.

| Button | Colour meaning | Action |
| --- | --- | --- |
| Back arrow + **Kembali** | Soft blue: navigation | Return to Isi Kandungan. Accessible name: “Kembali ke Isi Kandungan”. |
| Menu icon + **Menu** | Soft purple: choices and help | Open the organised gameplay menu. Keep the word visible on phones. |
| Speaker + **Dengar** | Soft green: listen | Play the selected letter's existing audio. Keep it below the letter name. |
| Play icon + **Tunjuk cara** | Soft purple: learning help | Show the existing tracing demonstration. |
| Retry icon + **Cuba lagi** | Soft amber: restart | Restart the current exercise using the existing retry flow. |
| Check/play icon + **Sambung jejak** | Green: return to play | Close the menu and continue the current attempt. Use “Sambung menulis” for copying. |

Colour reinforces the icon and words; it is never the only explanation. Reserve
coral for discard/exit choices inside existing confirmation dialogs. The green,
amber and rust colours of tracing numbers 1, 2 and 3 keep their teaching meaning.
Final shades must meet contrast checks; these colour names are design intentions.

### Screen arrangement

```text
Wide screen:
[← Kembali] [☰ Menu] [▷ Tunjuk cara]        [7/36 · JEJAK]
                                         [Ca           ]
                                         [🔊 Dengar    ]

                  letter and tracing guides

                    short tracing hint
```

On phones, show Kembali and Menu at the upper left and the letter/audio card at
the upper right. Keep Tunjuk cara as the first help action inside Menu so the
board remains spacious. Promote it to the toolbar only where the measured space
permits. Cuba lagi stays in the menu to reduce accidental resets while drawing.

Aim for at least 48 × 48 CSS-pixel touch targets, preferably 56–64 pixels on
tablets. Scale labels and spacing sensibly on desktop/4K displays. Wrap or adapt
the header on small landscape screens instead of hiding labels or overlapping
the letter. Use actual layout measurements to reserve space for controls and
guides; resizing must not alter the letter proportions or pointer mapping.

## Organise the menu

Use three labelled sections instead of one long sequence of unrelated buttons:

1. **Bantuan**: Tunjuk cara / Lihat cara in strict mode, Tunjuk bahagian ini
   where supported, Panduan, and Bantuan titik where applicable.
2. **Pilih huruf**: Huruf sebelumnya, Huruf seterusnya and Isi Kandungan.
3. **Tetapan**: music, audio, full-screen display and the existing Ruang guru entry.

Use named tabs with a clear selected state. Keep the existing fitted-dialog
behaviour so each section fits short viewports. If a section needs pagination,
label it as menu pages, separately from letter navigation. Show a prominent
Sambung jejak/Sambung menulis button and an accessible close control. Preserve
focus trapping, keyboard activation, Escape handling and focus return.

Show toggle state explicitly, for example **Muzik: Hidup** / **Muzik: Mati** and
**Audio: Hidup** / **Audio: Senyap**, with `aria-pressed` matching the state.
Keep the current teacher-access protection.

## Back, restart and completion behaviour

- Normal lesson Back returns directly to Isi Kandungan through the existing
  navigation request. Stop audio and demonstrations, cancel an active pointer
  and pending completion presentation safely, then leave. It must not record a
  cancelled gesture as a completed letter or leave an old timer running.
- Back remains usable during demonstrations and feedback transitions. Adapt the
  current busy guard to support this explicit cancellation instead of silently
  ignoring the child's tap. Prevent duplicate navigation during a page turn.
- Retain the profile, catalogue filter/anchor and completed progress. Keep the
  existing save/discard/cancel dialog for unsaved copying.
- Explain unfinished tracing with a short help sentence:
  “Jika keluar sebelum siap, jejak huruf ini bermula semula.” Do not add a
  confirmation to every ordinary Back tap.
- Cuba lagi uses the existing retry behaviour. If there is work to lose, offer
  a small “Mula semula?” confirmation with “Sambung” and “Mula semula”. Empty
  boards and the completion panel's deliberate Main lagi action need no extra
  confirmation. Unsaved copying retains its existing save choice.
- Add **Pilih huruf lain** to the completion panel, returning to Isi Kandungan.
  Preserve Dengar, Main lagi, copying and next-letter choices. Keep the current
  1.5-second tracing completion delay so players can see their finished letter.
- Android Back and visible Back should use the same lesson leave guard. Closing
  the application remains a separate existing action on the welcome screen.
- For Solo/Duo challenges, use the shared button styling with **Keluar cabaran**.
  Reuse the existing pause/exit confirmation and return to challenge setup.
  Keep one global exit control; do not add individual lane exit buttons or
  change scoring, round timing or assistance rules.

## Implementation steps after authorisation

1. Add reusable button variants and the visible stage navigation group in
   `src/components/TracingMenu.jsx`; reuse `src/components/Icons.jsx`.
2. Wire lesson Back and completion-panel catalogue navigation in
   `src/screens/BookLessonScreen.jsx`. Route both through the existing navigation
   guard and explicitly handle pointer, audio, demonstration and timer cleanup.
3. Group menu actions into named sections while preserving their existing
   mode-specific availability. Apply the shared treatment to
   `src/screens/MatchScreen.jsx` without changing its exit rules.
4. Update `src/styles/fullscreen.css` and relevant `src/styles/book.css` rules
   for responsive layout, button variants, focus states and label visibility.
5. Pass measured control bounds from `src/components/TraceBoard.jsx` into
   `src/tracing/numberedGuides.js` where needed. Recalculate on layout changes,
   not every pointer movement. Ensure guides avoid the new header.
6. Add focused navigation/state regression coverage using existing browser
   helpers. Update affected current documentation with actual implementation
   and verification results.

Letter geometry, writing order, approved audio and approval revisions require
no changes for this implementation. APK generation, commit, push and publication
are separate actions and were not requested for this change.

## Verification required for implementation

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md). Run unit tests and the
checked build once after implementation, then affected browser cases using
`book-layout.spec.js`, `fullscreen-layout.spec.js`,
`fullscreen-tracing-audio.spec.js` and existing navigation helpers. Select
challenge cases if their shared controls change.

- Capture phone portrait/landscape, tablet portrait/landscape, desktop and the
  supplied 4K-style layout. Inspect Ca and complex loop/tall/multiple-dot letters
  for control/guide overlap, overflow, legibility and usable board size.
- Verify Back returns to the correct catalogue page and filter; completion
  records remain saved and incomplete attempts do not become completed.
- Verify Back during drawing, demonstration, audio and completion delay; no
  lingering sound, stale panel, double navigation or stuck pointer.
- Verify copy save/discard/cancel, conditional restart, section switching,
  next/previous letter labels, focus return and keyboard operation.
- Verify Dengar plays the currently selected letter and menu toggles report the
  actual state. Check contrast and touch sizes across supported layouts.
- Exercise Android Back through the existing event path. A browser simulation
  is not physical-device evidence; record native device limitations separately.

Record commands, scope, viewport/input, results and relevant build inputs.
The preceding plan-only stage was checked through document/path review. The
authorised implementation requires the application checks above.

## Other ideas for a later change

These are suggestions, separate from the recommended implementation above:

- **Highlight the last opened letter** briefly on returning to Isi Kandungan,
  making it easier to find the next lesson.
- **Previous/next letter arrows on larger tablets**, with letter names beside
  them. Keep them out of the active stroke area and off cramped phone layouts.
- **A first-visit introduction** pointing to Kembali, Dengar and Tunjuk cara;
  dismiss it once and allow replay from help.
- **Resume unfinished tracing** after leaving. This needs a separate design for
  saved stroke state, revisions and interrupted attempts before implementation.
- **A child-friendly progress strip** such as “Gerakan 1 daripada 2”, placed
  beside the hint only where it does not crowd the board.

Start with the visible Back button, clearer controls and organised menu. These
address the screenshot directly while keeping the letter as the main activity.

## Implementation and verification completed — 7 October 2026

Visible blue Kembali and purple Menu now appear for every lesson, including
copying. Wider stages also show Tunjuk cara. Dengar remains below the letter
name. The menu has Bantuan, Pilih huruf and Tetapan tabs, explicit audio/music
states and a green resume button. Restart uses amber and asks before clearing
unfinished work; copying can save before restarting or leaving. Completion
adds Pilih huruf lain and retains the 1.5-second unobscured tracing delay.
Solo/Duo have one global Keluar cabaran control using their existing pause and
exit flow. Measured header obstacles keep letters/guides clear; both Duo lanes
reserve equal space even in portrait layout.

Changes are in `TracingMenu`, `FitDialog`, `TraceBoard`, `NumberedTraceGuides`,
`BookLessonScreen`, `MatchScreen`, `ResultScreen`, `fullscreen.css`,
`screenLayout.js` and `numberedGuides.js`, with affected browser helpers/specs
and the new `gameplay-navigation.spec.js`. No content geometry, approval record,
recording, matching rule or scoring rule changed.

### Completed checks

- **Unit:** `npm test` passed **249 cases in 39 files**. On this host, setting
  TEMP/TMP to the workspace's `tmp/navigation-tests` resolved the sandbox's
  temporary Vite SSR-file ENOENT errors. Later component-only layout/focus
  corrections were verified by the browser checks below; the tested pure
  content, audio, matching, guide and layout modules stayed unchanged.
- **Final build:** `npm run build` passed; its validator reports **36 letters,
  36 models, 36 student-ready lessons**. Final JavaScript is
  `dist/assets/index-Bm989V6y.js`; CSS is `dist/assets/index-B1SN2YYA.css`.
  The existing bundle-size warning remains informational.
- **Navigation/layout selection:** the 50 selected Chromium/WebKit cases in
  `gameplay-navigation.spec.js`, `fullscreen-layout.spec.js` and
  `fullscreen-tracing-audio.spec.js` initially gave 46 passes, one known WebKit
  4K skip and three WebKit failures. The affected follow-up below resolved
  all three; no selected failure remains open.
- **Correction follow-up:** **16 passed** across Chromium and WebKit. Scope:
  every letter at 1024×768; completion/dots/copy coordinates/save guard/audio
  rejection/resize; equal Duo stages and small-space recovery at 1024×768 and
  768×1024; Solo/Duo exit/pause; long Ha name on 320/390-pixel phones.
- **Challenge/completion follow-up:** **11 passed, one expected skip**. Scope:
  Solo readiness/completion/replay; Duo shared voice, pause, retry and lane
  assistance; delayed completion/Back cancellation; short-viewport guidance;
  actual music and completion voice playback in Chromium. The WebKit instance
  of the Chromium-only native-media test is skipped by design.
- Earlier affected book/navigation/audio checks passed after menu helper and
  delayed-panel assertions were updated. The main selection covers all 36
  letter envelopes on phone and tablet, Back during held input/demonstration,
  catalogue anchor, restart cancellation, unsaved copy protection, simulated
  Android Back, tabs/focus return and current audio toggle states.
- Captures inspected: phone stage/settings/Solo header, tablet portrait Duo,
  desktop completion choices and Chromium 3840×2160 stage. Controls have at
  least 48×48 CSS-pixel targets in the selected layouts. Text contrast against
  the navigation/help/restart fills is approximately 7.45:1 / 7.41:1 / 7.15:1;
  selected-tab white text is approximately 9.06:1.
- `git -c core.safecrlf=false diff --check` passed. Content/audio paths have no
  diff. Evidence and final input fingerprints are under
  `output/verification/gameplay-navigation/`; relevant larger layout captures
  are under `output/verification/fullscreen-layout/`.

The correction follow-up command was:

```powershell
npx playwright test tests/browser/fullscreen-layout.spec.js tests/browser/gameplay-navigation.spec.js --grep 'all 36.*1024x768|completion, dots|Duo has.*(1024x768|768x1024)|global exit|Solo phone' --project=chromium --project=webkit --workers=2 --reporter=line
```

The final challenge/completion follow-up command was:

```powershell
npx playwright test tests/browser/fullscreen-tracing-audio.spec.js tests/browser/gameplay-navigation.spec.js tests/browser/fullscreen-layout.spec.js --grep 'Duo menu pauses|Duo: the first|Solo: readiness|completion stays|short viewport and zoom|actual Chromium playback' --project=chromium --project=webkit --workers=2 --reporter=line
```

Browser checks used the existing Vite source server at
`http://127.0.0.1:5173/`, Node 24.19 and Playwright 1.63 with the installed
Chromium/WebKit runtimes. The WebKit all-letter layout loop now uses the
existing controlled media fixture to avoid the recorded Windows native-media
limitation; audio rejection is injected deterministically instead of aborting
an already preloaded recording. These fixture checks prove UI/lifecycle
behaviour, not native WebKit audio playback. Chromium's actual playback check
passes. Native Android drawing/audio/Back remain untested on a physical device.
Firefox and Windows WebKit 4K limitations were not retried.

The source is ready for local testing. This change has not been packaged into
APK 1.0.8, committed, pushed or published. Repeat checks if their relevant
source/test/asset/runtime inputs change; optional ideas above remain deferred.
