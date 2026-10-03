# Taman Jawi — fullscreen, no-scroll game layout

**Prepared:** 3 October 2026, Asia/Kuala_Lumpur.  
**Status:** Implemented after the user's “proceed” on 3 October 2026.
See [delivery and verification](FULLSCREEN_GAME_LAYOUT_VERIFICATION.md).

## Delivery decisions

The lesson now uses one measured stage and a reserved translucent dock. The
full letter envelope is uniformly fitted without changing teaching geometry.
Tools remain directly visible in the dock; fitted help and error dialogs carry
longer information. On the narrowest supported screens, book arrows and compact
labels retain their full accessible names.

Catalogue and teacher collections use measured pages. Teacher tabs separate
settings, audio review, local recording audition, content, attempts, matches,
copies and diagnostics. Match setup uses two short steps before the existing
Duo contact check. Small viewports show space guidance; Duo additionally checks
the actual stage available to each player and recovers after resizing.

The requirements below record the approved direction. Exact design targets are
not device guarantees; see the measured production evidence for delivered sizes.

## Recommended direction

Turn the game into a screen-sized play space. During tracing, the child sees one
large, upright letter in the centre of a calm writing page. A compact translucent
panel at the bottom holds the letter name, pronunciation button, current writing
cue and tools. Keep the happy Taman Kawan Ceria theme and interactive book, using
a slim cover edge, bookmark, page counter and page-turn animation.

The supplied screenshot shows the main problem: a reference page, multiple
instruction rows, navigation and outer headers surround the writing square.
The new tracing layout gives that space back to the letter. Other game screens
also fit the viewport, with explicit pages or steps for longer content.

**No app screen, table, drawer or dialog will require horizontal or vertical
scrolling.** Content must fit or be divided into reachable pages; hiding overflow
alone does not satisfy this requirement. Android system file pickers and browser
chrome are controlled by the platform, outside the game's layout.

This proposal supersedes the earlier book plan's two-page reference spread and
short-screen scrolling fallback. It keeps its navigation, teaching and saving rules.

## Tracing screen

### Landscape tablet and smartboard

```text
┌──────────────────────────────────────────────────────────────────────┐
│ [Isi kandungan]                          [Bunyi] [Paparan penuh]      │
│                                                                      │
│                 ONE LARGE, CENTRED TRACING LETTER                     │
│                                                                      │
│              numbered markers and required dots                       │
│              stay visible around the actual route                     │
│                                                                      │
│ ┌────────────── translucent bottom panel ───────────────────────────┐ │
│ │ Sa · 5/37       Mula di 1, ikut 2, berhenti di 3.                  │ │
│ │ [Sebelumnya] [Dengar] [Tunjuk cara] [Cuba lagi] [Seterusnya]        │ │
│ │                [Tambah titik — when required]                    │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

The diagram describes placement, not mandatory row counts. At a wide width,
the dot action joins the control row. At narrower widths, nonessential tools move
into **Alat**, with a short, fitted panel containing **Tunjuk cara** and **Cuba lagi**.
The dot action remains directly reachable when required.

Use the whole viewport width rather than the current 1160-pixel lesson cap and
600-pixel writing cap. The letter is horizontally centred in the screen and
vertically centred in the unobstructed tracing area. No permanent side reference
page competes with it. A separate large reference glyph is unnecessary when the
actual tracing model is already large; **Kenal huruf** in the tools panel can show
the reference glyph on demand, outside the writing interaction.

### Portrait tablet

Keep the same full-page canvas and centre the letter above a compact bottom dock.
Use two deliberately sized dock rows, with **Dengar**, previous/next navigation
and the required dot action available. Secondary tools use **Alat**. Do not stack
the old reference section, writing square, encouragement and book rail vertically.

The book counter, letter name and current cue appear once. Move long explanation
into a fitted help page rather than repeating it around the board. Page controls
retain clear Malay labels; compact visible labels may use **Sebelumnya** and
**Seterusnya**, with their existing full accessible names.

### Bottom panel appearance and behaviour

- Use a cream/white panel at roughly 88–94% opacity, dark green text, rounded
  corners and a subtle shadow. Background blur is optional; an opaque fallback
  must remain readable.
- Reserve its space before sizing the letter. It may visually float over scenery
  or blank paper, but must never cover a stroke, dot, numbered cue or copying area.
- Keep its height stable within an activity, including when a dot action, audio
  error or completion appears. Status updates must not move the letter mid-stroke.
- Show one short current instruction. Longer instructions remain accessible in
  a fitted help panel; essential writing cues and errors are never ellipsised away.
- Opening tools/help cancels a held contact and suspends demonstrations. In a
  competitive match, an overlay that interrupts play pauses both players through
  the existing shared pause flow.
- Use solid, generously sized buttons over the translucent background. The panel
  itself does not accept drawing input. Decorative layers ignore pointer events.

## Making the letter logically larger

Increasing the outer card is insufficient when the route occupies a small part
of its 1000 × 1000 logical board. Apply a **stable, uniform presentation fit** to
the complete letter, including all strokes and dots, with room for guides.

1. Measure the available stage after the top controls, bottom dock, preview label
   and safe areas have settled.
2. Compute a complete teaching envelope from the authored paths, stroke widths,
   all required dots, start indicators and numbered-guide clearance. Include the
   full letter, not only the currently active stroke.
3. Fit that envelope uniformly into the available rectangle with comfortable
   margins. Centre it without stretching either axis. Use an SVG viewport/viewBox
   presentation rather than changing the authored geometry.
4. Keep that presentation fixed through tracing, demonstrations, dot entry and
   completion. Progress must not make the letter grow, pan or change position.
5. Recompute only at a safe transition, such as changing letters or responding
   to a real viewport resize. Cancel the active gesture first; a match pauses.

Aim for the complete letter and its marks to use approximately 70–85% of the
available stage along the limiting dimension, with guide clearance taking
priority. Alif stays tall and narrow; Sa stays broad with three distinct dots.
Do not widen Alif artificially or crop marks to make a shape appear bigger.

The existing pointer mapping in `screenToLogical()` inverts the SVG screen matrix,
which supports a presentation viewport while keeping original logical coordinates.
Its accuracy still needs verification after the change. Replace `width / 1000`
guide scaling with the actual SVG matrix scale if a fitted viewBox is introduced.
The guide-placement bounds currently assume a 1000-square viewport; adapt their
screen clearance to the presentation bounds while retaining numbered anchors.
Iterate the fit and guide placement to a bounded, stable result before input starts.

**Copying uses the original full 1000 × 1000 writing area**, displayed as the
largest centred square that fits. It must not crop saved handwriting or rescale
its stored coordinates to the preceding letter's tight envelope. Changing into
copying is an explicit activity transition, not a camera movement during writing.

## Screen fitting and device adaptation

Use one shared viewport/layout mechanism across practice, Solo and Duo. Base it
on the actual content container, available height and width, browser viewport
changes and Android system insets. Device names, resolution alone and user-agent
strings must not decide the layout.

| Situation | Planned response |
| --- | --- |
| Landscape tablet | Large central stage, thin top controls and a low bottom dock. |
| Portrait tablet | Taller stage, two dock rows and fitted secondary-tools panel. |
| Smartboard | Remove content-width caps; grow the letter and use larger labels and controls. Keep decoration at the edges. |
| Browser bars appear/disappear | Re-measure the available viewport; preserve progress and cancel an interrupted held contact. |
| Rotation or split-window resize | Pause a match, cancel live input and settle pending decoration before refitting. Resume deliberately. |
| Android APK | Size from the inset-adjusted WebView; count system-bar/cutout space once. Reuse its Back and background events. |
| Browser fullscreen is unavailable | Fit the usable browser viewport and retain normal navigation. |
| Viewport cannot hold safe controls and a usable board | Show a fitted, friendly **Besarkan ruang bermain** page with rotation/fullscreen and return choices. Do not offer a clipped or unusably tiny board. |

CSS owns the fixed shell and shrinkable grid/flex regions; measurement owns the
available stage and layout choice. Use dynamic viewport sizing with a fallback,
`minmax(0, 1fr)`/`min-height: 0`, and safe-area handling. Remove page-height margins,
duplicated headers/footers and minimum-content sizes that create overflow.
Avoid enlarging the entire interface with CSS transforms or disabling browser zoom.

**Paparan penuh** is a labelled, deliberate action where supported. Fitting the
app inside its current viewport is mandatory even before that action. Exiting
browser fullscreen, Escape and Android Back must leave a usable fitted screen.

Proposed sizing budgets, to validate during implementation:

| Viewport | Practice tracing-space target |
| --- | --- |
| 1024 × 768 landscape tablet | About 540–580 CSS pixels of clear stage height. |
| 768 × 1024 portrait tablet | About 720–800 CSS pixels of clear stage height, limited by width when necessary. |
| 1280 × 800 tablet | About 560–620 CSS pixels of clear stage height. |
| 1920 × 1080 smartboard | About 800–880 CSS pixels of clear stage height, without the old 600-pixel cap. |

These are design targets, not measured results. A fit must accommodate the actual
controls, letter and guides. Keep normal child controls at least 56 CSS pixels
high, dot actions at least 64, and smartboard controls around 64–80 where space
allows. Essential smaller-screen controls must still have at least 48-pixel targets.

## Retaining the interactive book

The book becomes a full-screen single writing page. Keep a slim green cover edge,
paper corners, flower bookmark, page counter and the existing deliberate next/back
controls. The book identity remains visible without a large gutter or reference page.

Reuse the bounded decorative fold and reduced-motion behaviour. The writing SVG
does not rotate or animate while a child traces. Only the decorative sheet moves
between pages, after input is cancelled. Keep the selected catalogue sequence,
first/last-page boundaries, closing page and accurate completion stickers.

Completion changes the dock to a brief celebration and the next-page action while
leaving the completed letter in place. Put **Main lagi** and **Cuba salin sendiri**
in a fitted completion/tools panel if they cannot all fit the persistent dock.
Require a fresh contact after the final stroke/dot; never advance automatically.
Preserve **Simpan / Buang / Kembali** for unsaved copying.

## Solo and Duo

**Solo challenge** uses the same large central stage. Keep score, round and clock
in a compact top strip; its bottom controls follow the current competitive rules.
Free alphabet browsing is unavailable during live competition.

**Duo 1v1** divides the available play space equally. Landscape normally places
the two players side by side. Portrait can stack them when that offers a better
usable fit. Compare the measured layouts, choose one stable arrangement and keep
player identity clear. Do not switch arrangement because the next letter has a
different shape.

Each player receives an equally sized tracing stage, coloured identity strip and
small local instruction/dot dock. Use the same complete-letter envelope and
uniform fit for both players. Neither player's controls or celebration may cover
the other lane. Keep the shared clock and **Berhenti** control visible.

Maintain the existing readiness, simultaneous-touch check, scoring, deadlines,
pause recovery and trophies. A finished player's board stays frozen with
**Siap! Tunggu teman.** Both decorative books turn together between rounds with
the clock stopped. If two safe boards cannot fit, retain the fitted space-guidance
screen and the option to return to Solo. Do not enable a scored match through a
layout-preview shortcut.

## Every other screen without scrolling

| Screen | Planned presentation |
| --- | --- |
| Splash / welcome | One fitted garden scene with branding, profiles, Solo/Duo and **Jom mula**. Optional explanation opens a separate help page. |
| Book contents / letter garden | A measured grid with labelled previous/next pages. Choose rows/columns from usable space and minimum card size. All 37 eligible letters remain reachable. |
| Match setup | Short steps for players, challenge settings and Duo touch readiness; preserve selections when moving back. Teacher options get their own fitted step. |
| Practice completion / book end | Stable completed canvas or fitted closing page; optional progress detail uses explicit pages. |
| Match trophy results | Fitted trophy and scores with replay/home controls. Round-by-round details have page controls. |
| Teacher area | Tabs for settings, audio review, content, attempts, matches, copies and diagnostics. Render one section at a time. |
| Teacher tables / drawings | Paginated rows/cards; narrow layouts use summary cards and a fitted detail view. No horizontal table scroller and no silently dropped columns. |
| Audio/content review | Page through letters or review cards; keep the current recording, revision and approval information accessible. |
| Help / warnings / confirmations | Short fitted dialog, or explicitly paged content for longer detail. Focus and actions remain visible without an inner scroll area. |

Pagination is a view of existing data, not a new storage limit. Teacher exports
still contain the complete stored payload. Returning from a lesson restores the
contents filter and relevant grid page. On resize, keep the selected letter/record
visible and clamp the page index when the page capacity changes.

## Implementation map after authorisation

| Area | Planned work |
| --- | --- |
| `src/App.jsx` | Shared screen-sized shell, compact chrome, fullscreen entry and navigation integration. |
| New `src/components/useViewportLayout.js` | Actual available-space measurement and safe resize handling shared by game screens. |
| New `src/game/screenLayout.js` if useful | Pure fit, equal-lane and pagination calculations. |
| `BookLessonScreen.jsx`, `BookFrame.jsx`, `ResultScreen.jsx` | Full-page canvas, bottom support dock, fitted tools/completion and retained book transitions. |
| `TraceBoard.jsx`, `NumberedTraceGuides.jsx`, `src/tracing/numberedGuides.js` | Presentation fit, matrix-based display scale, guide clearance and support-content slots. Preserve tracing rules and original coordinates. |
| `MatchScreen.jsx`, `RaceTracePane.jsx` | Replace fixed height deductions with measured equal-stage layouts; fit competitive overlays. |
| Welcome, contents, setup and result screens | Fitted scenes, explicit steps and page controls. |
| `TeacherScreen.jsx`, `AudioReviewPanel.jsx`, `DraftModelReview.jsx` | Tabbed/paginated review and record access, with full exports. |
| `src/styles/app.css`, `book.css`, `match.css`, `playground.css` | Replace scrolling stacks and fixed caps; isolate the new viewport, dock and compact-layout rules. |
| Android `MainActivity.java`, if necessary | Only measured WebView/inset/fullscreen integration required by the fitted layout. |
| Existing tests/helpers and current docs | New behaviour, layout evidence and implementation results. |

Reuse the current art, icons, fonts, audio manager, book controller and input
helpers. No page-flip library or additional artwork is necessary for this layout.
Leave catalogue geometry, dot positions, order, revisions, approval records,
recordings, matcher tolerances and scoring unchanged. Jejak Ceria remains the
preschool default; Malay **Berhenti / Henti** wording stays consistent.

## Implementation sequence

1. Establish the viewport shell and measured layout contract; confirm the target
   tablet/smartboard sizes before applying scroll containment globally.
2. Build the full-page practice stage and stable bottom dock; fit complete letters,
   guides, dots, demonstrations and original-coordinate copying.
3. Integrate book turns, completion, tools/help and unsaved-copy protection.
4. Apply the measured stage to Solo/Duo and all competitive overlays.
5. Convert welcome, catalogue, setup, results and teacher content to fitted pages
   or steps. Then enforce the no-scroll contract across all app routes.
6. Verify the resulting build and protected teaching inputs, resolve relevant
   failures and document the actual result. Any subsequent Android release uses
   the existing signing identity and a higher version code.

## Verification and acceptance

Follow [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md). The following acceptance
scope was prepared before implementation. See the dated
[delivery verification](FULLSCREEN_GAME_LAYOUT_VERIFICATION.md) for completed
checks and device limitations; earlier book/APK results remain historical.

- Run the checked build and applicable unit checks after the final affected edits.
  Add meaningful cases for fit decisions, pagination boundaries and preserved
  resize/navigation/recording/clock state.
- Capture practice, copying, completion, page turns, dialogs, letter contents,
  teacher tabs and Solo/Duo ready/live/paused/result states at 1024 × 768,
  768 × 1024, 1280 × 800, 800 × 1280, 1280 × 720, 1920 × 1080 and 3840 × 2160.
  Also cover 390 × 844, a short landscape phone and browser zoom/text enlargement.
  A small viewport may show the defined fitted space-guidance state.
- Assert no document or inner-panel scrolling on every app route/state. Check
  wheel, touch panning and keyboard navigation, not only missing scrollbars.
  Essential controls, focused elements, full guides and dots must be within their
  intended safe rectangles. Opening a dialog must not move the background.
- Check representative narrow, wide, multi-stroke and dotted letters, including
  Alif, Sa, Sin and Nga. Audit all 37 complete envelopes and guide placements at
  the target layouts so late strokes/dots cannot appear outside the visible stage.
- Complete real pointer journeys at the new scale, including simultaneous Duo
  touch, dot-pad equivalence, accidental cross-lane contact, shortcuts/reversals,
  retry, copying/export and interruption recovery. Recompute SVG screen
  coordinates after every resize, orientation or viewport-changing operation.
- Verify that letter positions remain unchanged during a held gesture, changing
  feedback, dot entry and completion. Page turns must remain bounded and disabled
  during live contacts, with reduced motion and no accidental double navigation.
- Verify every catalogue entry and stored teacher record is reachable through
  pages; resizing, filtering and returning preserve sensible selection. Exports
  include all stored records regardless of the visible page.
- Check full-screen entry/exit, browser bars, safe areas, Android Back/background
  integration, focus, audio errors and 200% zoom without hidden essential actions.
- Keep protected teaching data and recordings byte-identical. Record actual
  build inputs, viewport/input types, results and current environment limitations.
  Firefox's recorded Windows launch failure and WebKit's tested WAV limitation
  should not be reported as newly verified device behaviour.

Acceptance requires a visibly larger centred tracing letter, reachable and readable
controls, equal Duo lanes, all content accessible without app scrolling, preserved
teaching/game rules and completed checks on the resulting build. Real Android
and smartboard touch/inset behaviour needs device evidence when hardware is available.

**Planning handoff:** This document is the only proposed change in this request.
Implementation starts after the user says to proceed.
