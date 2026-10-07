# Ga audio: prepared user recording

6 October 2026, Asia/Kuala_Lumpur. The owner attaches **Recording (4).m4a**
after being asked for a spoken reference. The reference is now available;
[the preceding reference request](GA_AUDIO_REVIEW_REFERENCE_REQUEST.md) and
all earlier failed samples/feedback remain preserved.

The original attachment is copied byte-for-byte into the review evidence.
Native Chromium decodes it as **6.912 seconds**, stereo AAC, to mono 24-kHz PCM.
Envelope inspection identifies three separated speech regions. The prepared
**revision-7 candidate** keeps the entire first region, using **1.00–2.05 seconds**
from the source. Approximate active region: 1.12–1.80 seconds. A 5-ms fade at
both near-silent edges prevents clicks. Samples inside speech, pitch, rate and
gain are unchanged; no voice cloning or synthesis is performed.

[Prepared Ga recording](../public/audio/letters/review/ga-name-v7-user-recording.wav).
[Metadata](../output/verification/ga-audio-review/user-recording-v7/generation.json)
and [verification](../output/verification/ga-audio-review/user-recording-v7/verification.json).

Completed: native Chromium decode and two complete play/replay cycles pass;
**1.05 seconds**, RMS **0.07037**, no clipped samples. Existing-server delivery:
HTTP 200, audio/wav, **50,444 bytes**. Original source and all active catalogue/
37 recording hashes remain unchanged. Commands: prepare-user-ga.mjs;
extract-user-ga.py; verify-ga-audio-review.mjs user-recording. No app build/unit
suite is repeated for this unlinked sample; known native WebKit codec limits
are not retried.

Needed decision: whether to use this prepared recording directly as Ga's game
voice or keep it only as a pronunciation reference for a synthetic replacement.
The file was supplied as a requested reference; no direct-game reuse permission
or exact-candidate approval is invented. After owner confirmation of direct
use, promote this exact sample with matching audio review/version/provenance,
preserve Ga geometry/content revision and all unrelated audio, then verify
packaging, playback/replay/mute/selection and readiness. The existing approved
Ga remains linked while this choice is pending. No APK/deployment requested.
