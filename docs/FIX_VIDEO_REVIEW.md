# Review of the videos in `fix`

Reviewed 6 October 2026, Asia/Kuala_Lumpur. This is an analysis report; no application code, letter geometry, writing order, recordings or approval records were changed.

## Coverage and limits

All **23 MP4 files** were inspected visually across their full duration: **11 minutes 31.56 seconds**, represented by **704 frames sampled at one-second intervals**, 23 overview sheets and 45 consecutive-frame sheets. Every overview and consecutive sheet was inspected, with selected original-size frames rechecked. This is a sampled visual review, not inspection of every encoded video frame. Brief contacts and pen lifts between samples may be missed. Spoken commentary and actual sound were **not verified**.

The recordings show a physical touch display being filmed with a phone. They contain both tracing attempts and gestures pointing out a route. The videos do not expose raw pointer events, touch pressure/contact, device performance logs or an exact app build. A pen moving across a blue guide therefore does not establish that the app received a valid drawing gesture. Current source was checked separately; a source reproduction does not establish that the same code ran on the filmed display.

The orange stroke is assisted route fill. It shows accepted progress along the app's model, rather than an exact recording of the user's handwriting. A completed orange letter cannot, on its own, establish that the teaching movement is ideal.

Evidence is retained in [the frame inventory](../output/verification/fix-video-review/manifest.json), the numbered folders beside it, [the model audit](../output/verification/fix-video-review/model-audit.json) and [the turn diagnostics](../output/verification/fix-video-review/turn-diagnostics.json). All source clips have the prefix `WhatsApp Video 2026-10-05 at` followed by the time listed below and `.mp4`. Timestamps within clips are approximate elapsed seconds.

## Confirmed defects and visible concerns

### 1. Sad and Dad can reject the correct route at the tight turn — confirmed current-code bug

The current second stroke rises into a narrow turn before descending into the bowl. Centerline input sampled every 32 logical units stalls there for both touch and pen. The matcher reports `advanceGap`: it interprets forward movement around the turn as too much progress. Accepted progress stops near arc 103.96; the first rejected input is at arc 160. These moves remain below the profile's maximum raw input gap.

The audit ran 37 letters × two input profiles × four arc intervals (2, 8, 16 and 32 logical units): **296 journeys, 292 complete, four incomplete**. The four failures are Sad and Dad at interval 32 in both profiles. Finer inputs pass. This suggests sensitivity to input spacing around the turn; it is not evidence that every Sad/Dad attempt fails or that a particular device drops events.

The Sad/Dad videos mainly show pointing at the initial shape while it remains blue. They do not reach the reproduced second-stroke failure visibly, so the code bug and those filmed blue states must be kept separate.

Recommended fix: accept legitimate forward traversal through this hairpin while retaining safeguards against shortcuts, backwards tracing and stationary wiggles. Add a focused regression case for these coarser inputs and verify on the display used in the videos. This requires a matcher fix before considering changes to approved geometry.

Source: [playMatcher.js](../src/tracing/playMatcher.js), [profiles.js](../src/tracing/profiles.js), [letters.json](../src/content/letters.json).

### 2. Ta marbutah's start and stop badges overlap — confirmed layout bug

In clip 22, `1 Mula` and `3 Henti` sit almost on top of each other at the upper join, with the moving arrow close by. The current model's two anchors are about **33.58 logical units** apart. Badge radii are at least 25, so their circles overlap. The component merges coincident start/end badges only when the anchor distance is less than two units; it misses this near-coincident case.

The loop eventually completes at approximately 23 seconds and both dots are accepted at 43–44 seconds. The overlap is therefore a guidance defect, not proof that the letter cannot finish.

Recommended fix: detect badge overlap at the rendered scale and show the active start/stop badge clearly, while keeping the true path anchors. Inspect the arrow, labels and dot states together. [Frame at 0 seconds](../output/verification/fix-video-review/22/frame-000.jpg).

Source: [NumberedTraceGuides.jsx](../src/components/NumberedTraceGuides.jsx), [numberedGuides.js](../src/tracing/numberedGuides.js).

### 3. Loop and branch directions are insufficiently explained — visible guidance problem

Numbers are generated at the beginning, halfway along the route and at the end. They are landmarks, not a complete sequence of writing movements. A complicated loop can need several turns between two numbers. The middle number becomes highlighted shortly after tracing begins, even when reaching it still requires a long route.

- **Wau:** from start 1, the model goes up around the head, down the left side, through the lower join and then into the tail. Moving directly toward nearby 2 skips the loop. Clip 18 remains at the same early orange frontier while the demonstrator points elsewhere. The moving arrow indicates the route, but the three numbers do not explain the intervening loop well. The current ideal-input audit completes Wau; no Wau matcher defect was reproduced. [Frame at 10 seconds](../output/verification/fix-video-review/18/frame-010.jpg).
- **Ha ه:** the model requires the inner route before the outer loop and final left tail. Clip 19 completes once at about 36 seconds. After retry, gestures toward the outer contour leave the accepted frontier near the start/inner branch. A single halfway landmark near the crossing does not clearly communicate which branch comes first. [Frame at 65 seconds](../output/verification/fix-video-review/19/frame-065.jpg).
- **Sin/Syin:** three numbers do not individually explain the turns through the teeth and into the bowl. The Syin clip nevertheless completes after its dots.
- **Ra/Zal/Nun:** the calligraphic starting hook and large start marker make the first short direction hard to read. Several clips show repeated pointing or small initial movements before progress, but recorded pointer input is needed to separate route mismatch from missed contact.

Recommended fix: add brief direction cues at actual turns and crossings and make the demonstration easy to replay at the stalled section. Do not turn sparse landmarks into shortcut targets. Keep the approved route unless a separately reviewed teaching revision changes it.

### 4. Several connected-looking letters require a lift and a return to an earlier join — confirmed model behavior, teaching review needed

**Ain, Ghain and Nga** finish the upper arc at its right terminal, then require a lift and a new stroke from an earlier junction. **Hamzah** follows the same broad pattern: upper curve, lift, return to the join, short left tail. **Jim** draws its head from left to right, then lifts and restarts at the central join to draw the bowl. Sad/Dad also require a fresh second gesture, even though it begins at the previous endpoint.

These are the actual approved sequences currently enforced. The gap between successive endpoints/start points is approximately 159 logical units for the Ain family, 137 for Hamzah and 142 for Jim. Nga and Hamzah visibly complete when the user follows the restart. Jim reaches the dot stage before its clip ends.

The app does have text telling the user to lift. The weakness is explaining where to return and why a visually connected shape is being written in separate gestures. A child can naturally continue from the first stroke's terminal and get no accepted progress.

Recommended fix: visibly animate the lift and next start, and use a direct instruction such as “Angkat pen. Mula semula di 4.” Review whether these divisions and directions match the intended classroom method before changing any geometry or writing order. The videos' spoken teaching corrections were not available to confirm a replacement method.

### 5. Mim's open head and Ta marbutah's head/join need content review

Mim's current route leaves a visible gap on the left of its head before continuing into the descender. The demonstrator repeatedly points at that gap at approximately 3–13 seconds in clip 16. The trace then completes at about 16 seconds. The gap is present in the authored shape; successful acceptance does not settle whether that shape is the desired teaching model. [Frame at 10 seconds](../output/verification/fix-video-review/16/frame-010.jpg).

Ta marbutah has a short head/join above its oval; the demonstrator revisits it after the body is accepted in clip 22. This is distinct from the confirmed badge overlap. The precise preferred outline and starting movement need teaching review.

These are **content-review candidates**, not a newly established teacher rejection. Existing approvals remain unchanged. Any revised path/order needs a content revision and fresh approval identifying the reviewer, date and scope.

### 6. Body completion, dot completion and audio recovery need clearer feedback

Several blue dots remain after the body becomes fully orange. That is a normal pending-dot state, visible for Syin, Za ظ, Nga, Nya and Jim. The `Siap` label can be attached to the last dot that still needs a tap; it does not mean the entire letter is already complete. This distinction is easy to miss when the body looks finished.

Recommended improvement: say that the body is done and how many dots remain, then clearly identify the next dot. Reserve an unqualified completion message for after the final release.

Completion screens for Sin and Ye visibly show “Tekan Dengar untuk mendengar nama huruf.” In the current screen code this notice is shown when automatic name playback returns an unsuccessful result. This supports an **automatic-playback recovery concern** on the filmed setup. It does not establish a missing recording, wrong pronunciation, muted device or absent background music. Actual sound and the underlying playback failure reason were not verified. Check that reason and the device's playback behavior before selecting an audio fix.

Source: [BookLessonScreen.jsx](../src/screens/BookLessonScreen.jsx), [audioManager.js](../src/audio/audioManager.js).

## Every video

| No. | Filename time / duration | Letter or state | Visible sequence and assessment |
| --- | --- | --- | --- |
| 01 | 17.51.17 / 27.75 s | Wau, Duo readiness | “Saya sedia!” remains present. Demonstrations at about 4–5 and 16–17 s show the loop and tail; other gestures point at its route. Readiness prevents live tracing until both players are ready. Lack of accepted fill here is expected. Wau's sparse loop guidance remains a concern. |
| 02 | 17.53.01 / 43.55 s | Ra, Duo | Repeated pointing/short movements at about 12–31 s; accepted tracing at 32–35 s; then “Siap! Tunggu teman.” Ra completes. Early non-progress alone does not prove a touch fault. |
| 03 | 17.54.59 / 31.50 s | Zal | Accepted body at about 9–11 s, required dot at 14 s, complete at 15 s. Retry around 19 s; small initial movements then remain near the start. Investigate initial-direction/re-entry clarity; this is not a demonstrated endpoint stall. |
| 04 | 17.55.25 / 4.16 s | Ra | Static idle guide; no meaningful drawing attempt. No independent failure established. |
| 05 | 17.56.36 / 49.70 s | Zai, menu, Sin | Zai is idle; menu/navigation around 11–29 s; Sin's teeth and bowl are pointed out around 30–46 s. No complete Zai/Sin attempt in this clip. The small blue ring should not be classified as a Sin dot: current Sin has no dot targets, and the filmed ring's origin is uncertain. |
| 06 | 17.57.38 / 35.42 s | Sin already complete | Completion is present from the start; the yellow playback-recovery notice remains visible. The demonstrator points at the reward and Dengar. No new tracing attempt; actual audio not verified. |
| 07 | 17.58.42 / 30.94 s | Syin | Body is already orange; dots remain. The demonstrator points at teeth/bowl before tapping dots around 27–29 s. Complete by about 29 s. Pending dots explain the earlier wait. |
| 08 | 17.59.55 / 31.10 s | Sad | The head, turn, return/join and tail are pointed out around 8–31 s while the guide stays blue. No complete accepted attempt is visible. Second-stroke guidance needs review; the separate current-code audit confirms a tight-turn bug. |
| 09 | 18.00.30 / 8.98 s | Dad | Blue guide throughout; start and head/turn are pointed at around 5–8 s. No complete attempt. Same authored turn and reproducible code issue as Sad, without proof that it caused this clip's blue state. |
| 10 | 18.02.20 / 37.40 s | Za ظ | Body and stem are orange from the start; dot 7 remains pending. Gestures discuss the stem/join around 12–28 s; no final-dot tap is visible. Does not establish the order in which the completed strokes were drawn. |
| 11 | 18.03.09 / 26.03 s | Ain | Upper curve, its terminal, the join and lower bowl are pointed out around 7–24 s. No accepted fill. Current model requires upper stroke, lift and return to the join for the lower stroke. Teaching division/direction needs review. |
| 12 | 18.03.29 / 8.47 s | Ghain | Static blue guide. Same upper/lower division as Ain, but no input-failure evidence in this short clip. |
| 13 | 18.03.54 / 5.50 s | Nga | Body is already orange; dot 7 is highlighted and other dots remain blue. No interaction. Normal pending-dot state. |
| 14 | 18.04.31 / 16.93 s | Nga | Upper stroke around 3–4 s; next start 4 appears at 5 s; lower stroke by 6 s; three dot actions around 7–9 s; then complete. Demonstrates that the current split route can finish. |
| 15 | 18.05.53 / 19.38 s | Ga | Start at about 2 s, connected slant/body at 3–4 s, dot at 5 s, completion by 6 s. No visible tracing failure. |
| 16 | 18.06.49 / 18.48 s | Mim | Points at the open left head/join around 3–13 s. Accepted head and tail at 14–16 s, then complete. Shape/open-head concern needs content review; input can complete. |
| 17 | 18.07.29 / 30.20 s | Nun | Start, bowl, left terminal and dot are repeatedly pointed at around 5–25 s; guide stays blue. No accepted stroke or dot. Initial-hook clarity is a concern; contact/input failure is unproven. |
| 18 | 18.08.24 / 25.09 s | Wau | Early upper/right portion is already orange; arrow remains near the top. Repeated gestures toward loop/join/tail around 5–23 s do not advance the frontier. Visible stalled/recovery state, cause uncertain; no endpoint reached. Current ideal-input simulation passes Wau. |
| 19 | 18.10.09 / 76.17 s | Ha ه | First accepted journey at about 22–36 s follows inner route, outer loop and tail and completes. Retry at 40 s; gestures toward the outer branch occur before the inner route has been accepted. Small progress around 59–69 s; more inner progress near 73–76 s, still incomplete at the end. Branch-order guidance is the main visible problem. |
| 20 | 18.11.00 / 32.13 s | Hamzah | Early partial upper curve around 3–4 s. Pointing toward the tail at 5–9 s does not advance that upper frontier. Returns to the upper route around 10–12 s, new start 4 at 13 s, tail at 14 s, complete at 15 s. Retry around 18 s; later gestures mostly point at the shape. Lift/return sequence needs clearer explanation and teaching review. |
| 21 | 18.12.25 / 50.62 s | Ye, then Nya | Ye body around 5–9 s, completion by 10 s with playback-recovery notice. Nya begins around 25 s, has early non-progress while pointing around 27–33 s, body accepted by 35 s. Waits for dots; dot actions around 47–49 s produce completion. Both finish. |
| 22 | 18.13.45 / 55.22 s | Ta marbutah | Start/stop badges overlap from the beginning. Loop is accepted around 21–23 s. The head/join is revisited while dots remain pending; dots around 43–44 s give completion. Confirmed badge-layout defect and separate teaching-shape review candidate. |
| 23 | 18.14.28 / 26.85 s | Jim | Head traced around 6–10 s; new start 4 at the middle join around 11 s; bowl begins at 13 s, pauses while pointing elsewhere, then continues around 22 s. Body accepted at 23 s; final dot remains pending when the clip ends. No evidence that body completion failed; head direction and return-to-join method need teaching review. |

## Verification record and next work

Commands were run from the project root, using the existing Playwright Chromium runtime through `PLAYWRIGHT_BROWSERS_PATH`.

| Check | Command / scope | Result |
| --- | --- | --- |
| Visual extraction | `node tmp/review-fix-videos.mjs`; all 23 files in `fix`, metadata and one-second full-portrait frames | 23 decoded clips, 704 frames; every clip's sampled count matches its duration. |
| Visual review sheets | Bundled Python running `tmp/contact-fix-videos.py`; all extracted frames | 23 overviews and 45 consecutive sheets inspected; selected full-size frames rechecked. |
| Current model/input-spacing audit | `node tmp/audit-fix-models.mjs`; current 37 letter models, touch/pen profiles, 2/8/16/32-unit arc intervals, fresh down/up for every stroke and dot | 296 journeys: 292 complete, four failures at Sad/Dad's second-stroke hairpin. |
| Focused failure diagnosis | `node tmp/diagnose-fix-turns.mjs`; Sad/Dad with 32-unit inputs, touch and pen | All four cases reproduce `advanceGap` at the same turn. |
| Source comparison | Current letter models, numbered guides, matcher/profiles, rendering, practice completion/audio recovery and Duo readiness | Confirms badge overlap, approved stroke divisions, assisted fill, pending-dot states and the meaning of the audio notice. |

No app build or full regression suite was run because this task changed only analysis documentation and generated review evidence. These diagnostics are limited current-source evidence, not physical-display acceptance testing.

Suggested implementation order: fix the Sad/Dad turn and Ta marbutah badge overlap; improve turn/branch and lift/restart cues; review the identified teaching shapes/orders; then verify touch contact and automatic speech on the filmed device. Geometry/order changes require a separately identified reviewed revision. The existing approval records were not amended by this review.
