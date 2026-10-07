# Video fixes: delivery and verification

6 October 2026, Asia/Kuala_Lumpur. Implemented after the user's **“proceed”**, following [the implementation document](FIX_VIDEO_IMPLEMENTATION.md) and [the 23-clip visual analysis](FIX_VIDEO_REVIEW.md).

## Delivered behavior

- Sad and Dad accept correct coarse forward input at their second-stroke hairpin. Turn compensation remains bounded by the existing allowance and real movement. Corridors, checkpoints, raw-gap limits, reversal checks and release rules remain enforced.
- Ta marbutah and other nearby start/stop anchors show one relevant badge and label until the end approaches. The initial number stays readable; passed badges yield to the frontier arrow. Text placement avoids the stage instruction and corner controls.
- A short visible stage instruction explains the next movement, paused frontier, lift/restart and actual remaining dot count. Wau, Ha, Sin/Syin, starting hooks and Sad/Dad have revision-keyed section cues. A short highlighted route shows the immediate branch to follow, including lightweight presentation.
- **Tunjuk bahagian ini** demonstrates the remaining current part. Jejak Ceria keeps earned progress and demonstrations cannot earn completion. Full examples pause between sections, stroke changes and dot actions. Reduced motion uses discrete steps. Duo section examples keep both lanes and the clock paused, show the board, and restore the pause menu afterwards.
- Pending dots use **Titik / Titik akhir**, with fresh taps and releases still required. The body being filled does not declare the whole letter complete.
- Approved name audio is preloaded and silently prepared during real interaction. Playback success, blocked playback, missing/unsupported media, mute and late decode failures are distinguished. A successful replay clears the recovery notice; a late or cancelled preparation cannot interrupt a newer request. Completion still announces once per letter/round.
- Teacher diagnostics export board gesture coordinates, contact times, pointer type, cancellation reason, build/model revision, CSS viewport/DPR and presentation, plus bounded audio result history. These records help distinguish wrong starts, missing contact and cancellation on the filmed device.
- Seven separate proposed drawing revisions can be compared, demonstrated and traced in the adult area. Their review status remains pending. [Review details and animations](FIX_VIDEO_CONTENT_REVIEW.md) identify exact revisions and unresolved teaching decisions.

The source student catalogue is byte-identical to Git HEAD: all 37 models and all 37 name recordings retain their approvals. Student/preview attempt separation, saved progress, match scoring, readiness and Jejak Ceria's default remain supported. Geometry approval records, recordings, storage modules, dependencies and Android release assets were not edited.

## Findings covered across every video

Numbers correspond to the timestamped [video inventory](FIX_VIDEO_REVIEW.md#every-video). A visual wait is not automatically an input failure.

| Clip(s) | Observed issue or state | Implementation / remaining limit |
| --- | --- | --- |
| 01 | Wau demonstration while Duo waits for readiness | Clear loop/tail sections; readiness still requires both players. |
| 02, 04 | Ra starting gestures; successful trace; static idle guide | Starting-hook cue and immediate route; success/idle remain normal states. Missing contact in a recording is unproven. |
| 03 | Zal initial direction and later restart | Starting-hook, frontier and fresh-start cues; separate dot still required. |
| 05 | Zai idle/menu; Sin teeth and bowl discussed | Hook and teeth/bowl cues; reachable paged menu. The uncertain filmed blue ring is not turned into a Sin dot. |
| 06 | Sin already complete with audio recovery notice | Playback preparation, late failure reporting and deliberate replay recovery. Sound in the original clip remains unverified. |
| 07 | Syin body filled, dots pending | Visible remaining-dot count and separate dot taps; teeth/bowl guidance. |
| 08, 09 | Sad/Dad head and tight-turn movement questioned | Reproduced hairpin defect corrected; coarse touch/pen tests and shortcut/reversal checks pass. |
| 10 | Za stem/body filled, upper dot still pending | Explicit remaining-dot stage; the clip does not establish a faulty stroke order. |
| 11, 12 | Ain/Ghain head, join and bowl method | Clear existing lift/restart cues; continuous retracing proposals await teaching review. |
| 13, 14 | Nga pending dots and a successful split-stroke journey | Lift/restart and real dot-count cues; successful current method retained. Continuous proposal awaits review. |
| 15 | Ga completes normally | Preserved body/dot sequence and successful full-catalogue check. |
| 16 | Mim open head/join | Closed-head revision 3 available for adult review; approved revision 2 stays in lessons. |
| 17 | Nun starting hook discussed without an accepted attempt | Initial-hook and frontier guidance; actual received contact needs device evidence. |
| 18 | Wau partial head, gestures toward later branches | Immediate route, section text and progress-preserving section demonstration. Physical input cause remains unverified. |
| 19 | Ha inner/outer branch confusion after a successful attempt | Inner loop → outer loop → tail cues and paused demonstrations; no skip to a later branch. |
| 20 | Hamzah upper frontier, lift/return and successful tail | Current restart is explicit; continuous revision 4 awaits teaching review. |
| 21 | Ye audio notice; Nya hook and pending dots | Audio recovery, starting guidance and remaining-dot count; both current models complete. |
| 22 | Ta marbutah badge overlap and loop/join concern | Badge collision fixed across phone/tablet/desktop/4K states; closed-loop revision 4 awaits review. |
| 23 | Jim head direction, return to join, paused bowl, final dot pending | Restart/frontier/dot cues; right-to-left head alternative revision 4 awaits review. |

## Completed checks

Evidence root: `output/verification/fix-video-implementation/`. `inputs.json` records source, test, dependency, production bundle and approved recording SHA-256 hashes. The build identity is `fix-video-20261006`. Check reuse below is limited to unchanged relevant inputs; later edits to adult layout or audio did not change the traced catalogue/matcher.

| Check and command | Scope | Result / evidence |
| --- | --- | --- |
| `npm test -- --maxWorkers=1 --no-file-parallelism` | 19 unit files: content gates, tracing, dots, cancellation, storage/game behavior, section cues, candidate isolation and audio recovery. Includes actual Sad/Dad Beziers at 24/32/40-unit spacing with shifted contact origins and −4/0/+4-unit normal offsets, plus bowl shortcut/reversal rejection. | 175 passed; `unit-final.log`. |
| `npm run build`, with `VITE_BUILD_ID=fix-video-20261006` | Content validation and production bundle. | Passed; 37 models, 37 ready lessons; `build-final.log`. |
| `node scripts/verify-fix-video-models.mjs` | Actual SVG paths: 37 current + 7 proposed models, touch/pen profiles, 2/8/16/32-unit arc spacing, fresh stroke/dot contacts. | 352/352 complete: 296 current + 56 proposal journeys; `model-audit.json`. This positive audit is complemented by negative unit/browser cases. |
| Chromium browser selections | Full-catalogue student mouse/direct-dot journey and adult pen/dot-pad journey; strict/recovery/terminal input; guide layouts; full-screen Solo/Duo and audio; lightweight render/diagnostic/clock checks. | **73/73 passed**; `chromium-complete.log`. Both 37-letter journeys pass. |
| Chromium model follow-up | Wau/Ha/Ta marbutah/Kha: default-play completion and negative gestures after the final matcher correction. Earlier guided/precision checks also passed with unchanged strict input logic. | **8/8 passed**; `chromium-models-final.log`. The earlier all-mode selection passed 24 cases in `chromium-models.log`. Primary final Chromium selections total **81 distinct cases**. |
| Chromium guide follow-up | Full dot-area label clearance, Ta start/middle/near-end/dots in four viewports, Nga restart, initial 12-letter guides, Ba/Qaf transitions, stage fit and adult comparison controls. | **18/18 passed**; `chromium-guide-final.log`. These are affected rechecks of cases within the 81 above. |
| WebKit selection | Relevant phone/tablet guides, recovery, section examples, paused Duo example, adult review and simulated late audio recovery. | **11/11 passed**; `webkit-final.log`. This does not establish native device touch or codec support. |
| `node scripts/create-fix-video-review.mjs`; `node scripts/verify-fix-video-review.mjs` | Seven original/proposal comparisons with actual path animation, retracing, lifts and dots. Desktop 1366×1100 and 320-pixel phone width. | 14 animations finish, no page errors or horizontal overflow; `review-check.json`, seven comparison captures and `review-phone.png`. |
| `node scripts/record-fix-video-inputs.mjs` | Protected catalogue equality and current source/test/bundle/recording fingerprints. | 37 geometry + 37 audio approvals preserved; `inputs.json`. |

Browser runs use `PLAYWRIGHT_BROWSERS_PATH=C:\Users\azrin\AppData\Local\ms-playwright`, `JAWI_STATIC_TEST=1` and two workers. `JAWI_EVIDENCE_DIR` directs captures to the evidence root's `browser/` folder. The full selected commands are at the start of the corresponding logs. The static fixture fulfills local-origin requests from the checked `dist/` bundle, including packaged fonts and media byte ranges; the ordinary development-server workflow is unchanged when the switch is absent. Final bundle: `index-D-eTcK5P.js` / `index-WKYEc-4a.css`; hashes are recorded in `inputs.json`.

The final turn browser regressions each exercise 32-unit arc spacing at −4/0/+4 normal offsets, with zero pause episodes for valid contact. The final unit regression covers 72 Sad/Dad profile/spacing/origin/offset combinations. The local sharp-turn exception requires forward movement and evidence of approaching or passing an actual turn; it adds no progress itself, and the existing bounded acceptance walk still scores the motion.

## Visual inspection and corrected failures

Inspected stage captures include Ta marbutah start/middle/near-end/dots at 320×740, 768×1024, 1920×1080 and 3840×2160; Nga restart and dot counts; Wau/Ha partial and demonstration states; paused Duo demonstration; terminal/readiness/completion at representative viewports; and adult comparisons at 320×600, 320×740 and 1366×768. All seven standalone model comparisons were inspected. These are desktop-rendered captures.

Early checks found a JSX syntax error, a hidden status selector, menu-help pagination assumptions, and adult controls overlapping the footer/pager on phones. Further offset tests reproduced a false backward classification beside Sad/Dad's return branch; the direction/turn check corrected it while negative gestures still reject progress. Capture inspection also found an endpoint label clipping a Ta marbutah dot; placement now avoids the full dot bounds and the final screenshot checks reject overlap. These were corrected and affected checks rerun. The previous pause-cue assertion was updated to the intentionally clearer arrow instruction. The new late-audio test was corrected to use the real **Dengar** button. Early failed browser logs are retained as diagnostic history, not final passing evidence.

## Environment and remaining work

- This host denied localhost socket connections. Tests used the production-bundle route fixture rather than starting duplicate servers. The browser evidence covers the local game bundle; it does not verify deployment or network serving.
- Default Windows temporary-path transforms failed in Vitest. `TEMP` and `TMP` were set to the existing workspace `tmp/vitest-runtime` for successful unit/browser runs. No dependency installation or runtime replacement was needed.
- Prior Windows Firefox launch and native WebKit media limitations were not retried without changed conditions. Actual packaged media decoding/playback was checked in Chromium; WebKit failure recovery uses simulated media. No claim of spoken-content correctness is made from the silent visual video review.
- The filmed display's physical touch/pen hardware, CSS viewport/zoom, Android lifecycle and audible playback remain untested. On that device, reproduce Wau/Ha starts and Sad/Dad turns, lift/restart, dot taps, cancellation/background/resume and completion speech/replay; export tracing and audio diagnostics for failures. Desktop touch is Chromium emulation, and pen events are simulated.
- Seven drawing proposals require the explicit revision review described in [content review](FIX_VIDEO_CONTENT_REVIEW.md). The continuous Ain-family and Hamzah proposals deliberately retrace a join; a qualified review must decide whether that method is appropriate.

No new APK, installation, deployment, commit or push was requested or performed. The existing release does not contain this implementation.
