# Ha (ه): photo tracing order review

Prepared 7 October 2026, Asia/Kuala_Lumpur, following the owner's annotated photo
`codex-clipboard-de52d44a-92ff-48de-8732-b53f28fdfc47.png`.

**Ha 4 is an adult review candidate.** Ha 3 stays approved in normal lessons.
Open Ruang guru → Huruf → Semakan video → **Arah Ha (ه)** →
**Semak Ha (ه) cadangan**. Tunjuk cara demonstrates the revised sequence.

One continuous movement, no dots or pen lifts:

1. Descend from the top tip.
2. Follow the outer right loop down, then left to the lower crossing.
3. Rise around the left loop to the upper crossing.
4. Descend through the inner stroke.
5. Finish along the tail to the left.

Original cubics are reordered and two are split with de Casteljau's method.
Short crossing connectors remain inside the existing stroke. Raster comparison
at twice model resolution, width 50 and round caps/joins has **99.9667% outline
intersection over union** (25 added and 45 removed pixels). Start, finish,
stroke count, continuous policy, checkpoints, styling, zero dots, audio and all
approved catalogue entries are preserved. Five version-specific Malay cues and
demonstration pauses follow the new route; Ha 3 retains its prior cues. Standard
start/follow/finish badges remain landmarks, not five separate movements.

![Original and revised Ha order](../output/verification/ha-direction/ha-order-comparison.png)

## Verification

- `npx vitest run --maxWorkers=2 --reporter=json`: **230 distinct passing checks
  in 32 files**, combining 218 unchanged cases with 12 rechecked cases in the
  two updated historical files. Ha cases cover fine/coarse mouse, touch and pen
  paths through both crossings, incorrect order/reversal rejection, candidate
  gating and cues/demonstration order. Initial sandbox temporary-directory cache
  failures were resolved by putting TEMP/TMP inside this task's evidence folder;
  the successful run then exposed two stale historical assertions, repaired and
  rechecked without changing application behaviour.
- `VITE_BUILD_ID=ha-direction-review-20261007 npm run build`: content validation
  and build pass; **37 ready lessons**. Existing bundle-size warning remains.
- Ha browser selection, production static fixture, Chromium/WebKit, at most two
  workers: **16 distinct passing cases**, plus two expected WebKit skips for
  Chromium-only native emulation. All three practice modes, phone/tablet/desktop
  fit, incorrect old order, release/recovery, save/reload, every demonstration
  phase and progress preservation pass. Solo/Duo complete independent preview
  lanes, remain unscored and do not save student attempts. Chromium native
  emulated touch and pen complete both joins. The initial match test harness
  was missing from its intended folder; after preparing it there, its assertions
  were corrected to the existing unscored-preview behaviour and rechecked.
- Actual phone partial outer-loop, tablet guided completion and desktop start
  captures inspected. No clipped guides, control collisions or horizontal overflow.
- Existing server returns HTTP 200 and the exact Ha-4 preview path. All 37
  catalogue entries, audio metadata and active recordings remain byte-identical
  to the Nun-approval baseline. Evidence and input fingerprints are in
  `output/verification/ha-direction/inputs.json`.

Physical-device input was not tested. Audio is unchanged; no new pronunciation
assessment or teacher approval is inferred. No APK or deployment requested.

## Remaining decision

Owner review and explicit approval of this pictured Ha 4 are needed before
promotion into `letters.json`. Approval must preserve this exact path and cues.
