# Let players see the completed letter

6 October 2026, Asia/Kuala_Lumpur. All alphabet lessons now leave the finished
tracing visible for **1.5 seconds** after the final release before displaying the
completion panel. The same delay applies to Jejak Ceria, guided and precision
practice and adult tracing previews through their shared BookLessonScreen.

Completion is still recorded and the letter sound plays immediately. The board
retains the completed letter in place and accepts no further tracing until
retry. Retrying or leaving cancels the pending panel, so it cannot appear over a
new attempt or another letter. Manual copying retains its previous immediate
saved-result panel and 700 ms button settling time. Challenge round panels have
their own flow and are unchanged by this lesson-panel request.

The implementation changes only `src/screens/BookLessonScreen.jsx`: the existing
cleanup-aware timer waits 1500 ms for tracing, and the completion overlay waits
for that timer. No matcher, content, layout, recording or approval data changed.
All 37 approved catalogue entries and recording files match the preceding
Sin/Syin approval fingerprints.

## Verification

- Unit suite: `npm test -- --reporter=json --outputFile=output/verification/completion-delay/unit.json`;
  203 checks in 24 files pass.
- Checked build: `VITE_BUILD_ID=completion-delay-20261006 npm run build`;
  content validation confirms 37 student-ready lessons. Existing bundle-size
  advisory remains.
- Browser selection: `npx playwright test tests/browser/completion-delay.spec.js tests/browser/book-layout.spec.js --grep "finished letter stays|leaving and retrying|freezes completed writing|copy exit offers|native touch completion|stage, tools and completion fit" --project=chromium --project=webkit --workers=2 --reporter=line,json`.
  Production static fixtures cover visible finished letters before the panel,
  measured timing, immediate single saves, all three practice modes, reset and
  navigation cancellation, copy saves, student revisit state, phone/tablet/desktop
  layouts and Chromium emulated touch releases at DPR 2 and 3.
- The older layout cases were moved onto the existing local static test helper.
  An initial interrupted run encountered blocked localhost access; the new
  guided/precision retry assertion was also corrected to its existing label
  “Ulang huruf”. A subsequent run found a stale navigation expectation (Sin after
  Sa). The current approved catalogue correctly navigates Sa → Jim. Only that
  assertion was corrected, with a scoped two-engine recheck; reports preserve
  the preceding results. These fixes changed tests, not application behaviour.
- Existing localhost server returns HTTP 200 for the changed lesson component
  and serves the 1500 ms gated panel. No duplicate server started.
- Visual inspection: Chromium 320×600 Alif before/after panel and 768×1024 Mim
  guided completion. The complete letter is unobscured during the pause; the
  panel still fits when it appears.

Final case totals, scoped report history and relevant hashes are recorded in
[inputs.json](../output/verification/completion-delay/inputs.json). Chromium CDP
touch cases are skipped on WebKit; physical-device input is not claimed. No APK,
deployment or publication requested. Refresh the running game to load the change.
