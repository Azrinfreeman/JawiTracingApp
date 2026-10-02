# Hanana Academy branding and splash screen — implementation plan

Prepared: 2 October 2026.

**Implementation authorised on 2 October 2026.** The user subsequently requested execution with “proceed”. This document retains the approved design; see [the acceptance record](ACCEPTANCE.md) for actual implementation and verification results. No deployment has been requested.

This is an addendum to [the original implementation specification](../IMPLEMENTATION.md) for the existing Taman Jawi React application.

## 1. Intended result

Credit **Hanana Academy** as the company that built Taman Jawi, using the supplied `hanana-academy-logo.png`. Add a short branded splash when the game first opens, followed by the existing welcome screen.

Recommended placements:

| Placement | Appearance | Purpose |
| --- | --- | --- |
| Launch splash | Prominent company logo, Taman Jawi title, short Malay introduction and `Teruskan` button | Introduce the company before the game opens. |
| Welcome screen | Small logo with `Dibangunkan oleh` beneath the existing welcome note | Identify the developer next to the introduction. |
| Shared footer | Compact logo with `Dibangunkan oleh`, visible on desktop and mobile | Keep the company credit available throughout the game. |

The existing Taman Jawi header remains the game identity and home button. Do not turn the company logo into a link because no company website URL has been supplied.

## 2. Supplied asset

- Source: workspace-root `hanana-academy-logo.png`.
- Verified file properties: **375 × 181 pixels**, PNG with an alpha channel, **13,655 bytes**.
- Planned runtime location: `public/branding/hanana-academy-logo.png`.
- Copy the original bytes into that location during implementation and retain the source file.
- Use the complete supplied logo; preserve its aspect ratio, colours and transparent areas. No cropping, recolouring, stretching, filters or redrawing.
- Use a normal image element with intrinsic `width="375"` and `height="181"`, responsive CSS width and `height: auto`.
- Keep the maximum splash display width at **320 CSS pixels**, below the original width. Do not enlarge it to fill the screen.
- Use `import.meta.env.BASE_URL` when constructing the public asset URL so a future deployment under a path can resolve the image.
- Load it locally. No remote logo, new image dependency or generated replacement is needed.

A light background and clear space around the logo should keep the original artwork readable. Visually check the complete wordmark at each proposed size.

## 3. Splash screen design

Render a dedicated initial screen, rather than placing an interactive game beneath an overlay.

Suggested layout, from top to bottom:

1. A white or near-white logo panel with generous padding and softly rounded corners.
2. The supplied Hanana Academy logo centred inside the panel.
3. `Taman Jawi` as the page heading.
4. `Mari kenal dan jejak huruf Jawi.` as the introduction.
5. A large `Teruskan` button.

Use the game's existing cream background, green text/button palette and local fonts. Keep the screen calm and simple for preschool pupils. The company artwork supplies the branding; extra mascots or illustrations are unnecessary for this change.

### Display behaviour

- Show the splash once per application mount: opening or reloading the page shows it again.
- Automatically continue after **1,800 ms** from splash mount.
- `Teruskan` immediately dismisses it, even before the logo finishes loading.
- Returning home, opening the teacher view, switching letters or retrying a lesson must not replay it.
- Use in-memory React state. No splash preference or new local/session storage key is needed.
- Treat it as a branding introduction, not a progress indicator. Do not display a loading percentage or imply teaching assets are loading.
- Do not wait for image decoding, font loading, recordings, network promises or an animation event before allowing continuation.
- A failed logo request shows a readable `Hanana Academy` text fallback. The same automatic deadline and button still work.
- The splash has no audio. Existing teaching playback continues to require the appropriate game interaction.

### Motion and accessibility

- An optional short opacity fade may introduce the logo. Do not bounce, rotate or animate the layout.
- Respect `prefers-reduced-motion: reduce` by showing the content statically and removing transition effects. The continue button remains available immediately.
- Use a semantic `main`, one `h1`, and a native button. This is a page, not a modal dialog.
- Give the image the accessible name `Hanana Academy`; decorative elements have no extra announcements.
- Focus `Teruskan` after mount so keyboard users can dismiss with Enter or Space. Avoid a live region or repeated countdown announcements.
- On dismissal, focus the existing welcome heading after it renders. No hidden splash controls may remain in the tab order.
- Keep the action at least **48 × 48 CSS pixels**, with the existing visible keyboard focus style.
- Use content-driven vertical sizing with a viewport-height minimum. Allow scrolling on short landscape displays and at zoom; do not trap content in a fixed-height panel.

## 4. Welcome and footer branding

### Welcome credit

Add a discreet company credit directly below `Ikut rentak sendiri. Setiap cubaan bermakna.` in `WelcomeScreen.jsx`.

- Label: `Dibangunkan oleh`.
- Suggested logo width: **160 px desktop**, **140 px mobile**.
- Align with the welcome copy on desktop and centre with the welcome copy on mobile.
- Keep sufficient space below the main start button; the credit is secondary to `Jom mula`.

### Shared footer credit

Add the same company credit to the footer in `App.jsx`, alongside the existing friendly footer content.

- Suggested logo width: **120 px**, height determined by aspect ratio.
- Use a dedicated credit wrapper rather than relying on the current positional span selectors.
- The existing mobile rule hides `.site-footer > span:last-child`. Update those rules explicitly so the company credit stays visible on phones.
- On narrow displays, let footer items wrap or stack with comfortable spacing. Do not create horizontal overflow.
- The credit appears on welcome, catalogue, lesson, result and teacher screens, including adult preview.
- Retain the existing adult-preview banner and readiness wording.

Use a small shared `CompanyBrand` component for the image, label and failure fallback. A presentation variant can provide welcome/footer sizing. The splash can reuse its asset/fallback handling while retaining its own layout.

## 5. Integration with the current application

The current `App.jsx` starts on `welcome`, renders a shared header/footer and focuses `main h1` when the active screen changes. `main.jsx` wraps it in React Strict Mode.

Recommended integration:

1. Add independent `showSplash` state, initially `true`, without adding splash to the existing learning/navigation screen values.
2. Keep all hooks called unconditionally. Render the splash instead of the normal application shell while `showSplash` is true.
3. Mount normal screen content only after dismissal. The existing header, navigation, preview modal and lesson board must not be interactive behind the splash.
4. Update the existing navigation/focus effect to account for `showSplash`. Suppress its heading focus while the splash owns focus, then run the welcome focus/scroll behaviour when dismissal changes `showSplash` to false, even if `screen` is still `welcome`.
5. Use a stable, idempotent dismissal callback. Timer expiry and a simultaneous button click should produce the same single transition.
6. Clear the timeout on dismissal and component unmount. Handle Strict Mode effect setup/cleanup safely, with no stale timers or repeated transitions.
7. Preserve the ordinary welcome → `Jom mula` → adult-preview gate → catalogue flow after dismissal.
8. Keep logo loading and error handling outside the tracing, audio and progress systems.

The splash should introduce no changes to letter geometry, matching tolerances, dot order, audio approvals, saved progress formats or lesson eligibility.

## 6. Planned file changes

Paths are relative to the workspace root. This table describes the intended implementation scope; the acceptance record reports completion.

| File | Planned change |
| --- | --- |
| `public/branding/hanana-academy-logo.png` | Add an unchanged copy of the supplied PNG. |
| `src/components/CompanyBrand.jsx` | Add reusable company credit, accessible image and error fallback. |
| `src/screens/SplashScreen.jsx` | Add splash layout, immediate continue action and bounded automatic dismissal. |
| `src/App.jsx` | Add initial splash state, conditional rendering, focus integration and shared footer credit. |
| `src/screens/WelcomeScreen.jsx` | Add company credit below the welcome note. |
| `src/styles/app.css` | Add scoped splash/credit styling and responsive footer rules. Preserve board dimensions and coordinates. |
| `tests/browser/branding.spec.js` | Add focused integration checks for launch behaviour, logo display, navigation and fallback. |
| `tests/browser/helpers/navigation.js` | Add a small helper for existing tests to dismiss the splash through its visible button. |
| `tests/browser/game.spec.js`, `pilot.spec.js`, `touch.spec.js` | Use the helper after navigation/reload where welcome or game controls are expected. |
| `scripts/capture-preview.js` | Capture the splash before dismissing it, then retain existing screen captures. |
| `scripts/measure-tracing.js` | Dismiss the splash before beginning the existing tracing measurement. |
| `scripts/verify-branding-preview.js` | Check the built logo, continuation, focus, fallback and native Alif tracing on production preview port 4173. |
| `README.md` | Document the splash/continue step and supplied company branding. |
| `docs/ACCEPTANCE.md` | Record actual validation results for the branding change after implementation. |

No new framework, package installation, deployment or change to teaching content is required.

## 7. Verification after implementation

These are the required checks. Actual outcomes are recorded separately in `docs/ACCEPTANCE.md`.

### Focused browser checks

1. A fresh page shows the Hanana Academy logo, Taman Jawi title and accessible `Teruskan` button; game navigation is absent until dismissal.
2. The logo successfully decodes with the expected intrinsic dimensions. The public copy matches the original file bytes.
3. Automatic dismissal reaches the welcome screen within a bounded test timeout. Use the browser clock where supported so the check does not depend on arbitrary sleeps.
4. Clicking `Teruskan` dismisses immediately, clears the timer and transfers focus to the welcome heading. Advancing the clock afterwards must not disturb a newly opened game screen.
5. Keyboard dismissal works. Reduced-motion mode presents static content and retains both continuation paths.
6. Block the logo request in a test: the text fallback is readable, there is no broken-image placeholder, and both manual and automatic continuation still work. Include a delayed-response case to verify loading never blocks the action/deadline.
7. Home navigation, teacher navigation and lesson retry do not replay the splash. A reload does replay it without resetting saved profiles/progress.
8. Welcome and footer company credits are visible. Verify the footer on a lesson as well as the welcome screen, including a narrow phone viewport.
9. Existing adult-preview gating still works; verify an ordinary Alif completion through native pointer input after dismissing the splash.

Existing browser tests should dismiss the splash explicitly rather than assuming `Jom mula` is immediately available. Do not bypass this feature using hidden test-only storage flags or change their existing validation assertions.

### Build, layout and regression checks

- Run the existing unit suite and production build.
- Run the focused branding checks and relevant existing navigation, pointer and persistence checks in Chromium and WebKit.
- Run Firefox if its runtime can launch. The existing Windows Firefox launch limitation must be reported accurately if it persists.
- Check the production preview as well as the development server: the logo request must resolve locally without a 404.
- Inspect splash and welcome screenshots at **320 px**, **390 px**, **768 px** and **1280 px** widths, plus a short landscape viewport.
- Check aspect ratio, complete logo visibility, focus rings, text wrapping, footer visibility, zoom and horizontal overflow.
- Check that the footer change does not resize or move the active tracing board unexpectedly.
- Report browser errors and unexpected external requests. Include real results in the acceptance record; do not mark proposed checks passed in advance.

## 8. Acceptance criteria

- The exact supplied company logo is used on the launch splash, welcome credit and shared footer.
- A readable splash appears on fresh load, supports immediate continuation and automatically ends after a brief, bounded duration.
- Logo failure or slow loading cannot block access to the game.
- Normal navigation does not replay the splash.
- Branding remains readable and visible across supported phone, tablet and desktop layouts.
- Keyboard focus and reduced-motion behaviour work through the transition.
- Current teaching readiness, adult-preview gating, tracing precision, audio behaviour and stored progress remain intact.
- The implementation has actual build/browser evidence and honest reporting of any environment limitation.

## 9. Codex super prompt for later execution

The following prompt is preserved for reuse. The user separately authorised this local implementation on 2 October 2026.

```text
Implement the Hanana Academy branding and splash-screen feature in this existing
Taman Jawi project, following docs/BRANDING_SPLASH_IMPLEMENTATION.md.

Use the supplied workspace-root hanana-academy-logo.png. Copy it unchanged to
public/branding/hanana-academy-logo.png, retain the source, and use the complete
image with its original aspect ratio and colours. Resolve its local URL using
the Vite base path. Do not redraw, recolour, crop or enlarge the logo beyond the
specified display sizes.

Add a simple launch splash with the company logo, Taman Jawi heading, Malay
introduction and a large Teruskan button. Show it once per application mount,
including reload, and automatically dismiss after 1,800 ms. The visible button
must dismiss immediately. Do not replay it during navigation. Do not add storage
flags, autoplay audio, fake loading progress or waits for assets. Image failure
must show Hanana Academy text and never block continuation.

Add a reusable CompanyBrand component, a discreet welcome credit below the
existing welcome note, and a persistent footer credit labelled Dibangunkan oleh.
Keep the game header identity. No external company link is available, so do not
invent one. Keep the footer credit visible on mobile despite existing positional
span rules. Match the current cream/green visual design and local fonts.

Integrate the splash safely with App.jsx, React Strict Mode and the existing
focus effect. Keep hooks unconditional, clean up timers, make dismissal
idempotent, keep normal navigation unmounted during the splash, and move focus
to the welcome heading on continuation. Respect reduced motion, keyboard use,
short landscape screens and zoom. Avoid layout movement on the tracing board.

Preserve all current teaching readiness, draft/approved status, adult-preview
gating, local progress, audio lifecycle, letter models and tracing validation.
Use existing React, JavaScript and plain CSS; no new package or framework is
needed. Read applicable repository instructions before editing.

Add focused browser coverage for auto/manual/keyboard dismissal, timer cleanup,
image failure/slow loading, reduced motion, focus, no replay during navigation,
reload with saved progress, logo display and mobile footer visibility. Update
existing navigation helpers/tests and screenshot/performance scripts to dismiss
the splash through its visible button. Keep their existing assertions intact.

Run the current unit suite and production build, focused branding checks, and
relevant existing navigation, pointer and persistence checks. Verify Chromium
and WebKit, and Firefox when its runtime works. Inspect responsive screenshots
and the production preview, including actual local logo loading and fallback.
Record actual outcomes and any existing browser limitations in docs/ACCEPTANCE.md
and update README.md. Do not fabricate successful checks or content approval.

Complete and verify the local change. Do not deploy. Report the placements,
splash behaviour, checks performed and any remaining limitation concisely.
```
