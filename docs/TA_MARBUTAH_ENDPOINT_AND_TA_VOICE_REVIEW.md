# Ta marbutah endpoint correction and “Ta” voice review

**Subsequent status:** the owner explicitly approved audio revision 2 on
11 October 2026. It is now active; see [the approval and current checks](TA_MARBUTAH_TA_VOICE_APPROVAL.md).
The implementation/review-stage record below is preserved as historical evidence.

Date: **11 October 2026**, Asia/Kuala_Lumpur.  
Status: **Tracing correction implemented. Audio revision 2 is a draft awaiting explicit approval.**

The owner authorised implementation with “proceed” after
[the implementation document](TA_MARBUTAH_ENDPOINT_AND_TA_VOICE_IMPLEMENTATION.md).
This is implementation authorisation, not a pronunciation assessment or approval
of the new recording revision. No teacher review is claimed.

## Tracing result

Ta marbutah can now resume from the displayed arrow and finish its remaining
loop instead of becoming permanently stuck near the top. The loop still needs
the required forward tracing and checkpoints. Lifting advances to dot 4, then
dot 5; completing the loop alone does not finish the letter. Solo/Duo retain
one result per player and independent lane progress.

The reproduced defect was in [playMatcher.js](../src/tracing/playMatcher.js).
An off-centre trace could project farther along the path than its accepted
coverage. Re-entry kept that old projection position, even after the child
returned to the displayed unfinished frontier. If projection had reached the
endpoint, tracing the remaining tail again could earn no more coverage.

The fix resets projection to accepted progress only when contact projects at
or behind that frontier and is distinctly closer to it than the old projection
position. Contact itself earns no coverage. Ambiguous contacts and contacts
ahead retain their previous projection history, protecting against shortcuts
and repeated wiggles at a loop centre. Existing tolerances and the strict
matcher are unchanged.

The supplied still image did not establish its event history or installed
build. The correction addresses a reproducible current-source failure, rather
than claiming to recover that exact device session. Clean traces already
finished; 12 previously unrecoverable cases in the off-centre exploration now
recover by following the displayed tail. All 131 incomplete exploration cases
can recover; they are not automatically accepted without tracing the tail.

**Content is preserved:** all 36 active catalogue entries remain exact,
including Ta marbutah geometry/content revision 4, its label, path, checkpoints,
stroke order, both dots and existing independent approvals. No new geometry
review or migration of saved geometry credit is needed.

## Exact voice candidate for approval

Listen to [Ta marbutah audio revision 2 — “Ta”](../public/audio/letters/alphabet/ta-marbuta-name-v2.mp3).

| Field | Proposed value |
| --- | --- |
| Letter identity / displayed label | `ta-marbuta` / Ta marbutah (unchanged) |
| Spoken transcript | **Ta** |
| Audio revision | **2** |
| Candidate file | `public/audio/letters/alphabet/ta-marbuta-name-v2.mp3` |
| SHA-256 | `68b6f576c362607bb1f50ceb4a1876f54796b77888b4242ae3f5604cf2d1a12d` |
| Source | Exact bytes of the approved Ta audio 2, supplied as `voices/alphabet/03_ta.mp3` |
| Processing | Copy only; no cutting, synthesis, gain, pitch or timing changes |
| Current candidate status | Draft; no new reviewer/date/approval recorded |

The source Ta recording's owner approval is recorded in
[the 2 October approval](AUDIO_APPROVALS.md#approval-2026-10-02). This is source
provenance, not a new approval for Ta marbutah. The candidate manifest is
[taMarbutaVoice.json](../src/content/taMarbutaVoice.json).

To compare in the app: **Ruang guru → Suara → Ta marbutah**. The existing
**Dengar rakaman Ta marbutah** button plays the active approved recording.
**Dengar cadangan: Ta** plays only the proposed replacement. It is labelled
unapproved and does not save an attempt or change student playback. Selecting
another letter stops playback. No other letter has a candidate from this change.

The existing Ta-marbutah voice remains active until this exact revision is
approved, as required by [AGENTS.md](../AGENTS.md): “Proceed authorises
implementation; explicit approval authorises the identified reviewed content.”
After approval, replace only Ta marbutah's name-audio manifest with revision 2,
record the actual owner/date/scope/reference, and verify affected playback,
readiness and saved progress. Its old MP3 and original Ta MP3 remain preserved.
The candidate button expires automatically when the active audio revision changes.

## Completed verification

Production build: `dist/assets/index-cxYrxyRh.js` with
`dist/assets/index-DbweFF8G.css`. Tests use this build through the existing static
browser fixture. No duplicate local server was started.

| Check | Scope and result |
| --- | --- |
| Baseline reproduction | New terminal regression: 3 failing cases before correction, including both off-centre recovery cases; preserved before log |
| `npm test -- --pool=threads --maxWorkers=2 --reporter=dot` | **275 passed / 44 files**, including strict, shortcut, reversal, wiggle, cancellation, compact-input and audio-isolation checks |
| `npm run build` | Passed, including content validation: **36 student-ready lessons** |
| New Ta-marbutah browser selection | **19 distinct Chromium/WebKit passes / 3 platform skips**, combining initial successful tracing cases and corrected score/audio test selection |
| Shared tracing regression selection | **14 distinct Chromium/WebKit passes / 2 CDP-only skips**: all 36 play models, Ba/Qaf/Ga transitions, 94% recovery, coalesced/final-up movement, native touch and Solo deadline |
| Exploration after correction | **12 → 0 unrecoverable cases**; all 131 incomplete off-centre cases recover through real remaining-tail movement |
| Actual Chromium media | Exact candidate hash; decoded duration **0.9404 s**, RMS **0.0674**; **2 starts / 2 natural endings** |
| Integrity | **36 active entries exact; 77 pre-existing public/audio files exact**; only the versioned draft MP3 is added |

Browser coverage includes ordinary student saves at 320×740, 768×1024 and
1920×1080, guided/precision completion, native emulated touch, actual scored
Solo/Duo, out-of-order dots, no completion before both dots, adult audition,
replay/navigation and blocked playback. Inspected captures show the remaining
arrow, the first pending dot, completion, two scored Duo results and the phone
audio-review panel. The three skips are WebKit's Chromium-only native touch/Duo
checks and the recorded Windows native codec limitation.

Together the browser selections have **33 distinct passes / 5 platform skips**.
The endpoint regression file now uses the existing static browser fixture;
its initial missing-server failures are resolved. Shared-matcher regression
results, exact selections and final input fingerprints are recorded in
[verification.json](../output/verification/ta-marbuta-endpoint/verification.json).
Evidence, commands and development failure/retry logs are preserved in
[`output/verification/ta-marbuta-endpoint/`](../output/verification/ta-marbuta-endpoint/).
Initial test-only selector/schema/fixture failures were corrected; source fixes
also retain the existing loop-centre anti-wiggle regression.

Physical smartboard/tablet and Android runtime are **not verified**. No APK was
rebuilt, deployed or published; the existing APK predates this source correction.
Playback checks establish decoding and playback of the exact previously approved
Ta bytes; the owner still needs to review this proposed Ta-marbutah mapping.
