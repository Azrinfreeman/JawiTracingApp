# Ga pronunciation: opening sound of garbage

6 October 2026, Asia/Kuala_Lumpur. The owner rejected both earlier samples and
clarifies the target as **“almost the same as the front of ga-rbage”**. Revision
3's rejection is [recorded](../output/verification/ga-audio-review/review-v3.json),
with the original sample/verification preserved.

Current **Ga audio revision-4 candidate** uses the English phonetic spelling
**“gah.”**, en-GB-SoniaNeural, normal rate and +0Hz pitch. This changes the voice
and synthesis language instead of trying another repeated vowel spelling with
the Malay voice. Intended teaching transcript remains **Ga**. The spelling is
an attempt to match the owner's example; pronunciation is not yet approved.

[Listen to revision 4](../public/audio/letters/review/ga-name-v4-gah.mp3).
[Generation metadata](../output/verification/ga-audio-review/gah-v4/generation.json)
and [verification](../output/verification/ga-audio-review/gah-v4/verification.json).

Completed: native Chromium decode and two complete play/replay cycles;
**1.872 seconds**, RMS **0.05759**, zero clipped samples. The existing server
returns HTTP 200, audio/mpeg, **11,232 bytes**. The catalogue and all 37 active
recordings remain byte-identical. Generation: generate-ga-review.py --variant gah;
verification: verify-ga-audio-review.mjs gah. No app build/unit run was repeated
for the unlinked sample; the known native WebKit codec limitation was not retried.

Remaining: the owner listens and approves this exact revision-4 sample before
Ga-only audio promotion and affected packaging/playback/readiness checks.
Content/geometry revisions must stay unchanged; approval must identify these
recording bytes, not the rejected drafts. The [audio rules](AUDIO_RECORDING.md)
require a fresh review. No human pronunciation assessment is invented.
No APK, deployment or publication requested.

---

# Second sample stage (rejected)

6 October 2026, Asia/Kuala_Lumpur. The owner rejected the first revision-2
“gaa.” sample: **“it sounds ga-aaa”**, and specifies **“gaar” or “gaaa”**.
That recording and its original verification are preserved, with
[the actual rejection](../output/verification/ga-audio-review/review-v2.json).

The new **Ga audio revision-3 candidate** uses the requested spelling **“gaar.”**,
with ms-MY-YasminNeural, rate −15%, pitch +0Hz. Intended transcript remains Ga.
It is separate from the rejected sample and the active revision-1 recording.
It is unlinked, pendingReview, with no invented pronunciation approval.

Listen: [Ga revision 3](../public/audio/letters/review/ga-name-v3-gaar.mp3).
Local URL: http://127.0.0.1:5173/audio/letters/review/ga-name-v3-gaar.mp3.
[Generation metadata](../output/verification/ga-audio-review/gaar-v3/generation.json)
and [verification](../output/verification/ga-audio-review/gaar-v3/verification.json).

Checks: native Chromium decode and two complete play/replay cycles pass;
**2.184 seconds**, RMS **0.07306**, no clipped samples. The local server returns
HTTP 200, audio/mpeg, **13,104 bytes**. The catalogue and all 37 active recordings
remain byte-identical; no app build/unit suite is repeated for this unlinked
sample. Generation command: generate-ga-review.py --variant gaar; verification:
verify-ga-audio-review.mjs gaar. A generation metadata src collision was fixed
before presentation; the audio bytes and their generated hash are preserved.
The corrected verifier checks the explicit candidate path as well as its hash.

Remaining: the owner must listen and approve this exact revision-3 sample before
Ga-only manifest promotion, matching audio review/version records and affected
packaging/playback/readiness checks. Actual pronunciation is not established
by playback metrics. The existing [audio review rules](AUDIO_RECORDING.md) apply.
No APK or deployment requested; native WebKit's known audio limitation was not
retried.

---

# First sample stage (rejected)

6 October 2026, Asia/Kuala_Lumpur. The owner reports that Ga sounds like “ger”
or “girl” and requests “ga”. The current recording is the original synthetic
Ga revision 1, using ms-MY-YasminNeural with spoken text “Ga.”. No supplied Ga
replacement exists in voices/alphabet.

An isolated **Ga audio revision-2 candidate** uses spoken text **“gaa.”** with
the same Malay–Malaysia voice, rate −15% and pitch +0Hz. Intended transcript:
**Ga**. The alternate synthesis spelling steers the vowel; it does not establish
that the actual pronunciation is correct. No human pronunciation review has
been recorded, and the sample remains pendingReview with review null.

Sample: [Ga revision 2](../public/audio/letters/review/ga-name-v2-gaa.mp3).
Local review URL: http://127.0.0.1:5173/audio/letters/review/ga-name-v2-gaa.mp3.
SHA-256 and provider metadata: [generation record](../output/verification/ga-audio-review/generation.json).

## Completed checks

- scripts/generate-ga-review.py creates the Ga-only candidate, preserving the
  catalogue bytes and all 37 active recordings. It refuses to overwrite an
  existing candidate. Generation used the existing edge-tts 7.2.8 dependencies
  and Microsoft Edge online speech synthesis. The service received only “gaa.”.
- scripts/verify-ga-audio-review.mjs checks the candidate hash, catalogue and all
  active recording hashes, native Chromium decode/play/replay and signal level.
  Result: **2.088 seconds**, RMS **0.07346**, **zero clipped samples**, two complete
  plays, all 37 active recordings preserved. Playback verification is not a
  pronunciation assessment. [Verification](../output/verification/ga-audio-review/verification.json).
- The existing local server returned **HTTP 200**, audio/mpeg, **12,528 bytes**
  for the candidate. No duplicate server was started.
- No application/content manifest or dependency change has been made. The
  existing approved Ga remains linked and all 37 lessons remain ready while
  the replacement is reviewed. An app build/unit suite was not repeated for
  this isolated, unlinked audio sample. The recorded native Windows WebKit
  audio codec limitation was not retried.

## Remaining step at the first sample stage (superseded)

The owner must listen and identify approval of this exact revision-2 sample.
[The audio rules](AUDIO_RECORDING.md) require review of changed audio before
approval; the earlier revision-1 approval cannot cover newly generated bytes.
After approval, link this versioned URL, update only Ga's audio version,
provenance and matching owner approval, preserve its content/geometry revision,
then verify packaging, Ga playback/replay/mute/selection and readiness. Never
invent a teacher review. If pronunciation is still wrong, create a distinct
candidate rather than modifying these reviewed bytes.

No APK, deployment or publication was requested. Physical-device listening
remains unverified.
