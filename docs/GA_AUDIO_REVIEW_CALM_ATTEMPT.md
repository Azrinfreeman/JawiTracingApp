# Ga pronunciation: normal tone sample

6 October 2026, Asia/Kuala_Lumpur. The owner says revision 4 is **“almost”**
correct, but sounds angry/screaming and requests **“just normal tone”**.
[Actual feedback](../output/verification/ga-audio-review/review-v4.json) records
changes requested, not approval of the previous recording.

Current **Ga audio revision-5 candidate** keeps en-GB-SoniaNeural but uses the
neutral cue **“gar.”** instead of the interjection “gah.”, with rate −5%, pitch
+0Hz and volume −20%. Intended transcript remains **Ga**, aiming at the opening
sound of garbage with normal delivery. This attempt changes the wording and
prosody, rather than just changing playback volume. Owner listening still needs
to establish whether the pronunciation and tone are right.

[Listen to revision 5](../public/audio/letters/review/ga-name-v5-gar-calm.mp3).
[Generation](../output/verification/ga-audio-review/gar-calm-v5/generation.json)
and [verification](../output/verification/ga-audio-review/gar-calm-v5/verification.json).
Earlier samples, actual feedback and verification remain preserved; see
[the preceding review stages](GA_AUDIO_REVIEW_BEFORE_CALM.md).

Completed: native Chromium decode and two complete play/replay cycles pass;
**1.872 seconds**, RMS **0.04856**, zero clipped samples. Measured RMS is about
16% lower than revision 4; this signal metric does not prove emotion or correct
pronunciation. Existing-server delivery: HTTP 200, audio/mpeg, **11,232 bytes**.
The catalogue and all 37 active recordings remain unchanged. Commands:
generate-ga-review.py --variant gar-calm; verify-ga-audio-review.mjs gar-calm.
No app build/unit suite was repeated for the unlinked sample. The known native
WebKit codec limitation was not retried.

Remaining: owner review of this exact revision-5 sample's pronunciation and
normal tone before Ga-only audio promotion, matching approval metadata and
packaging/playback/readiness checks. Geometry/content revisions stay unchanged.
[Audio review rules](AUDIO_RECORDING.md) require fresh review before linking a
replacement. No APK, deployment or publication requested.
