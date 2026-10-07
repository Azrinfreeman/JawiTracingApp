# Va pronunciation: supplied recording fallback

7 October 2026, Asia/Kuala_Lumpur. The owner reported Va's synthetic voice was
wrong and instructed **“try to compare with mine if cannot then use mine”**.
They then attached **Recording (6).m4a**, confirming the reference file. This
authorises using the supplied pronunciation if a guided match cannot be achieved.

The recording contains two utterances. The complete first utterance is packaged
as **Va audio 2**, `/audio/letters/alphabet/va-name-v2.wav`, **1.10 seconds**, mono
24-kHz 16-bit PCM, **52,844 bytes**. Source interval **0.70–1.80 seconds** includes
silence before the consonant onset around 0.86 and after natural decay through
roughly 1.70. Every sample in that decoded interval is preserved byte-for-byte:
no fade, filtering, gain, pitch or pacing changes. The original M4A, full decoded
master and old released synthetic file are retained.

SHA-256: `fb20da4d695f0f1f6928a645f9d1278abe38fa06ed58b74642e9508a9cfc0446`.

## Guided comparison and selection

One isolated `Va.` attempt used `ms-MY-OsmanNeural`, rate -20%, pitch +0 Hz and
neutral volume, guided by the reference's lower estimated pitch and 0.62-second
active envelope. Reference audio stayed local; no voice cloning or upload.
The generated active envelope is about 0.58 seconds. Forty-millisecond normalized
autocorrelation estimates give reference median 112.68 Hz and generated median
235.29 Hz; harmonic/voicing ambiguity limits these approximate measurements.
Envelope/pitch agreement cannot establish pronunciation or natural tone. A
faithful synthetic match could not be confidently verified, so the authorised
supplied fallback is selected. No owner rejection of this new candidate, teacher
assessment or synthetic pronunciation approval is invented.

The first sandbox Python launch stalled before generation; it was interrupted.
The same isolated script succeeded with reviewed external execution. Active
recordings/catalogue stayed unchanged throughout staging. Candidate/source and
comparison evidence remain in `output/verification/va-audio/guided/` and
`comparison.json`; only the supplied fallback is linked in the game.

## Verification

- `npx vitest run --maxWorkers=2 --reporter=json`, task-local TEMP/TMP:
  **235 checks pass in 34 files**. Independent audio revision/review, preserved
  geometry and identity, source hash, exact full-utterance PCM and quiet edges,
  no clipping and historical recording preservation are checked.
- `VITE_BUILD_ID=va-user-audio-20261007 npm run build`: content/build pass,
  **37 ready lessons**. Existing bundle-size warning remains.
- Va production-static browser selection, Chromium/WebKit, two workers:
  **14 controlled cases pass**, plus **one Chromium native playback case**.
  Name/replay/current completion in play/guided/precision, retained drawing,
  mute, stop/change-letter, teacher identification/replay, Solo/Duo readiness
  and racing selection are checked. Native Chromium decodes the exact hash
  and plays the complete 1.10-second recording twice through `ended`.
  An initial reused test helper accidentally changed “Dengar” during letter-name
  substitution, so those selector checks timed out; the helper was corrected
  with word-boundary substitutions and the affected file was rechecked. No
  application change was needed for that test setup failure.
- Actual phone/tablet sound-button captures inspected. Existing server serves
  the exact catalogue and Va-2 file with HTTP 200 and `audio/wav`; delivered
  bytes/hash match the packaged recording.
- All 36 other entries, all geometry/content versions (including Ha 4), all 37
  prior recording files and application source modules are preserved. All seven
  geometry review scopes remain empty. Current inventory: **30 supplied and
  7 retained synthetic recordings**, all 37 lessons ready.

Commands, environment, source/bundle/asset hashes and results are recorded in
`output/verification/va-audio/inputs.json`. Windows WebKit uses controlled media
instrumentation because its known native codec limitation remains; no physical
device or independent audible phonetic assessment is claimed. No APK or deployment
requested. The owner record documents supplied-target/fallback authorisation,
rather than a later audition of the packaged WAV.
