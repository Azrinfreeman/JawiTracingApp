# Ga audio: authorised recording fallback

Completed **6 October 2026**, Asia/Kuala_Lumpur. The owner instructed:
**“make it as a guide, if the guide still failed then use mine”**. This authorises
a guided synthetic attempt first and use of the supplied recording as fallback.
The game now uses **Ga audio revision 7**, the exact prepared complete utterance
from Recording (4).m4a. [Active recording](../public/audio/letters/alphabet/ga-name-v7.wav).

The owner's later **“continue if cannot then use mine”** prompted one more
guided attempt, revision 9. Its word length is closer, but sampled pitch still
differs materially; the authorised revision-7 recording remains active.
[Follow-up method and preserved verification](GA_AUDIO_GUIDED_FOLLOWUP.md).
The revision-8 selection and promotion checks below record the preceding stage.

The guided revision-8 attempt used a lower Malay voice, ms-MY-OsmanNeural,
in “Ini huruf ga.” with rate −10%, pitch −20 Hz and volume −15%.
The complete final word retains consonant prevoicing, release and vowel decay.
It decodes and plays twice successfully, but the engineering comparison remains
materially different: approximate median voiced-frame pitch **88 Hz** versus
**116 Hz** in the sampled reference frames; approximate active-word length
**0.40 seconds** versus **0.68 seconds**. These estimates do not assess phonetic
accuracy or constitute an owner rejection of revision 8. A faithful synthetic
match could not be established, so the explicitly authorised recording fallback
was selected. No voice cloning is performed.

Revision 7 keeps **1.00–2.05 seconds** of the supplied source, including the
entire first speech region and its ending. Native Chromium decoded the original
stereo AAC to mono 24-kHz PCM. Five-millisecond fades affect near-silent edges
only. Speech samples, pitch, rate and gain are unchanged. The production WAV is
byte-identical to the prepared candidate: **1.05 seconds**, **50,444 bytes**, SHA-256
`bce006203bf9f9297679c4defcfd260777b4646682f1372744e6d37006bcc3c1`.
A new versioned URL prevents reuse of the superseded Ga MP3.

Only Ga's name-audio metadata changed. Its geometry, content revision 3 and
geometry approval remain exact; all 36 unrelated entries, all 37 original active
recording files and the four independent video proposals are preserved. The
audio review records the actual project owner and conditional fallback
authorisation, matching revision 7. No named teacher or professional assessment
is inferred. Current inventory: **28 supplied recordings and 9 synthetic ones**,
with **37 student-ready lessons**.

Verification for production build **ga-user-audio-20261006**:

- `npm test -- --reporter=json --outputFile=output/verification/ga-audio-approval/unit.json`:
  **198 checks pass in 23 files**. Tests include independent audio revision,
  rejection of stale audio approval and preservation of complete speech samples.
- `VITE_BUILD_ID=ga-user-audio-20261006 npm run build`: passes; validation reports
  37 ready lessons. The existing large-bundle advisory remains.
- `npx playwright test tests/browser/ga-audio.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json`:
  **21 distinct cases pass**, one known native WebKit codec skip. Three practice
  modes on phone/tablet complete using audio revision 7; direct replay, partial
  trace preservation, mute, letter change, teacher review and real Solo/Duo
  selection are checked. Native Chromium fetch/decode and two complete
  play-to-ended cycles pass; no clipped samples.
- Initial browser run: 20 passes, one failure, one skip. A simulated 900-ms voice
  ended before the slower WebKit menu navigation. Only that cancellation case
  was changed to keep its simulated voice active for 60 seconds, then rerun in
  both engines with `--grep "partial tracing"`: **2 passes**. Combined evidence
  keeps 19 unaffected passes plus these two current passes; the initial failure
  report remains preserved. No application fix or full-suite repetition needed.
- Existing local server: manifest and packaged recording return HTTP 200;
  correct audio/wav type, byte count and SHA-256. No duplicate server started.
- `node scripts/verify-ga-audio-approval.mjs`: exact fallback bytes, build,
  manifest readiness, preserved source/assets and current evidence hashes pass.

[Approval](AUDIO_APPROVALS.md#approval-of-ga-recording-fallback-2026-10-06),
[authorisation and selection](../output/verification/ga-audio-approval/authorisation.json),
[current verification inputs](../output/verification/ga-audio-approval/inputs.json).
The [prepared-reference stage](GA_AUDIO_REVIEW_USER_RECORDING.md), earlier failed
attempts and original generation metadata retain their historical pending states.
The [guided attempt](../output/verification/ga-audio-review/guided-malay-v8/generation.json)
remains unlinked and unapproved. No APK, deployment or publication requested.
Audible listening on a physical device and professional phonetic review are not
claimed by browser or signal checks.
