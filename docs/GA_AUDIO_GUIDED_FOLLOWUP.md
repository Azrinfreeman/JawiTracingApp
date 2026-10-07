# Ga guided follow-up: recording fallback retained

6 October 2026, Asia/Kuala_Lumpur. The owner reaffirmed: **“continue if cannot
then use mine”**. One further guided attempt, **revision 9**, was prepared while
the authorised supplied recording, **audio revision 7**, remained active.

The follow-up uses ms-MY-OsmanNeural in “Ini huruf ga.” with rate **−45%**, pitch
**+0 Hz** and volume **−15%**, correcting the preceding attempt's short word and
low pitch setting. The complete final word is retained from **1.355–2.20 seconds**
of the source. Its consonant prevoicing, release, vowel and natural decay remain
intact. Added leading silence is 120 ms; a 5-ms fade affects the quiet onset
before consonant prevoicing. No time stretching, vowel truncation or voice cloning.

The approximate active word is **0.64 seconds**, closer to the reference's
**0.68 seconds**. The sampled pitch contour still differs: the synthetic frames
fall from about **123 Hz to 79 Hz**, whereas sampled reference frames rise to
about **135 Hz**, then fall to about **93 Hz**. Approximate median pitch is
**89 Hz** versus **116 Hz** in the reference frames. These autocorrelation
estimates are engineering comparisons, not a phonetic assessment or owner
rejection of revision 9. A faithful pronunciation/tone match could not be
established, so the already authorised **complete user recording stays in the game**.
The synthetic follow-up remains an unlinked, unapproved review candidate.

[Follow-up preview](../public/audio/letters/review/ga-name-v9-guided-malay-followup.wav).
[Active Ga recording](../public/audio/letters/alphabet/ga-name-v7.wav).
[Generation and comparison](../output/verification/ga-audio-review/guided-malay-followup-v9/generation.json).
[Verification and input hashes](../output/verification/ga-audio-review/guided-malay-followup-v9/verification.json).

Completed checks:

- `generate-ga-context.py --guided-followup`; `author-ga-context.mjs --guided-followup`;
  `extract-guided-ga.py --followup`: protected the catalogue and all 37 active
  recording hashes; complete-word preparation passed.
- `verify-ga-audio-review.mjs guided-malay-followup`: native Chromium decode and
  **two complete play/replay cycles** passed. The preview is **0.965 seconds**,
  **46,364 bytes**, RMS **0.04305**, with no clipped samples.
- Existing-server delivery: both preview and active recording return HTTP 200
  with audio/wav types and matching hashes. The active file remains **50,444
  bytes**, SHA-256 `bce006203bf9f9297679c4defcfd260777b4646682f1372744e6d37006bcc3c1`.
- Compared **293 relevant application, test, dependency, configuration, active
  recording and production-build files** against the preceding Ga verification:
  all unchanged. The earlier **198 unit passes**, **21 distinct browser passes**
  and known native WebKit audio skip remain applicable; no app build or suite
  repetition for this unlinked review asset. The preview is not added to the
  previously tested production bundle; the active fallback already is.

No further implementation or permission step remains for the requested fallback.
All 37 lessons remain ready. Physical-device audible listening and professional
phonetic review are not inferred. No APK, deployment or publication requested.
