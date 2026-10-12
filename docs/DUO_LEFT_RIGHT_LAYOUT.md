# Duo left-and-right layout

Completed 7 October 2026. The owner requested left/right Duo play for tablets
and smartboards, replacing the automatic top/bottom layout on portrait screens.

Player 1 now stays on the left and Player 2 on the right at every viewport.
The two lanes remain equal in size and scale. Narrow screens retain the existing
minimum 280-pixel stage rule, pause safely and show guidance to rotate to
landscape or enter fullscreen. They do not switch to top/bottom lanes. Solo,
scoring, approved models and audio are unchanged.

Removed the orientation-dependent class in `src/screens/MatchScreen.jsx` and
obsolete stacked-layout rules in `src/styles/match.css` and
`src/styles/fullscreen.css`. Updated the `TraceBoard` header-space comment and
affected existing layout/touch/fallback assertions. No new geometry revision or
content approval was required.

## Verification

- `npm run build`: passed, including 36 valid models and 36 student-ready lessons.
  Build assets: `index-BJNqiUhF.js` and `index-DbweFF8G.css`. The existing bundle
  size warning remains informational.
- Selected browser checks: **18 passed, one expected Chromium-CDP-only skip**
  after the affected follow-up. Chromium and WebKit cover 1024×768, 768×1024,
  800×1280 and 1920×1080 equal boards, actual left/right positions, fitted
  controls, small-space recovery, preserved trails, menu pause/retry and exit.
  Chromium additionally covers 3840×2160 and simultaneous two-player touch on
  a 768×1024 tablet, three rounds with direct dots, six completed touch records
  and teacher history.
- The native-touch case initially assumed a shared trophy. Both players completed
  all three rounds, but separate CDP event delivery legitimately triggered the
  existing time tie-break. Its assertion now accepts either valid trophy result
  and explicitly checks three completed touch attempts per player. Scoring code
  and thresholds were not changed; the follow-up passed.
- Inspected fresh tablet portrait and landscape, WebKit tablet, 1920×1080 and
  4K captures in `output/verification/duo-left-right/`. Both players appear next
  to each other with equal fitted letters.
- `git -c core.safecrlf=false diff --check` passed. Content/audio paths have no
  diff. Existing unit evidence is retained for unchanged pure modules; this
  component/style change was checked with the build and affected browser tests.

Commands (Node 24.19, Playwright 1.63, source Vite server at
`http://127.0.0.1:5173/`, installed Chromium/WebKit, mouse and emulated native
touch; `JAWI_EVIDENCE_DIR=output/verification/duo-left-right`):

```powershell
npx playwright test tests/browser/fullscreen-layout.spec.js tests/browser/solo-duo.spec.js tests/browser/fullscreen-tracing-audio.spec.js tests/browser/gameplay-navigation.spec.js --grep 'Duo has.*(1024x768|768x1024|1920x1080|800x1280)|small and short Duo|native portrait Duo|Duo survives|Duo menu pauses|duo has one global' --project=chromium --project=webkit --workers=2 --reporter=line
npx playwright test tests/browser/fullscreen-layout.spec.js tests/browser/solo-duo.spec.js --grep 'Duo has.*3840x2160|native portrait tablet Duo' --project=chromium --workers=2 --reporter=line
```

The first command recorded 16 passes, one skip and the trophy-assumption failure;
the second resolved that failure and added the 4K check (two passes).
Final relevant input hashes are in
`output/verification/duo-left-right/inputs.json`. Repeat affected checks when
source, tests, assets or runtime change.

No physical tablet/smartboard was connected, so touch evidence is browser
emulation. Known Windows WebKit 4K and Firefox runtime limitations were not
retried. This source change has not been packaged into a new APK or published.
Earlier verification records describe their previous top/bottom layout stage;
this record supersedes that layout choice.
