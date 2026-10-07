# Ga pronunciation: syllable from normal speech

6 October 2026, Asia/Kuala_Lumpur. The owner says revision 5 still sounds the
same. [Actual feedback](../output/verification/ga-audio-review/review-v5.json)
records changes requested. Prior samples, feedback, checks and
[the previous tone attempt](GA_AUDIO_REVIEW_CALM_ATTEMPT.md) are preserved.

Current **Ga audio revision-6 candidate** changes both the voice and production
method. en-GB-LibbyNeural speaks **“The garden looks lovely today.”** at normal
rate/pitch and −15% volume. The initial syllable of garden is extracted from
that sentence instead of synthesising an isolated “gah” interjection.
The final sample contains only the extracted syllable and short surrounding
silence; intended teaching transcript remains **Ga**. Normal tone and exact
pronunciation still need the owner's listening assessment.

[Listen to revision 6](../public/audio/letters/review/ga-name-v6-garden-context.wav).
[Source generation](../output/verification/ga-audio-review/garden-context-v6/source-generation.json),
[authored metadata](../output/verification/ga-audio-review/garden-context-v6/generation.json)
and [verification](../output/verification/ga-audio-review/garden-context-v6/verification.json).

The source audio/word timestamps are retained. Native Chromium decoded its MP3
to mono 24-kHz PCM. Envelope inspection identifies the initial garden release
near .30 seconds, its vowel at .32–.51 and the following low-energy closure at
.52–.55. The extraction uses **.290–.525 seconds**, a 3-ms leading/30-ms ending
fade, 80/200-ms surrounding silence and .30 peak cap. It does not repeat,
stretch or shift the vowel's pitch. This is an engineering selection, not an
invented teacher phonetic assessment. The final encode is 16-bit mono WAV.

Completed: native Chromium decode and two complete play/replay cycles pass;
**0.515 seconds**, RMS **0.06602**, zero clipping. Existing server: HTTP 200,
audio/wav, **24,764 bytes**. All active catalogue/audio hashes remain unchanged.
Commands: generate-ga-context.py; author-ga-context.mjs; extract-ga-context.py;
verify-ga-audio-review.mjs garden-context. No app build/unit suite is repeated
for the unlinked sample; native Windows WebKit's recorded codec limit was not
retried. Audio quality metrics do not establish pronunciation or emotion.

Remaining: owner review of revision 6, then Ga-only audio promotion, matching
revision/review metadata and affected packaging/playback/readiness checks.
Geometry/content versions stay intact. [The audio rules](AUDIO_RECORDING.md)
require a fresh review before replacement. No APK, deployment or publication
requested.
