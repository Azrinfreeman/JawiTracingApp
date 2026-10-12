# Ta marbutah “Ta”-only voice approved

Date: **11 October 2026**, Asia/Kuala_Lumpur.  
Reviewer: **Project owner (Codex user; name not supplied)**.

The owner replied **“approve”** to the identified Ta-marbutah name audio
revision **2**, transcript **Ta**, after receiving the exact recording and
[review document](TA_MARBUTAH_ENDPOINT_AND_TA_VOICE_REVIEW.md). This authorises
that name-audio mapping. No named teacher assessment is inferred.

The active [catalogue](../src/content/letters.json) now uses
[`ta-marbuta-name-v2.mp3`](../public/audio/letters/alphabet/ta-marbuta-name-v2.mp3),
SHA-256 `68b6f576c362607bb1f50ceb4a1876f54796b77888b4242ae3f5604cf2d1a12d`.
It is the exact previously reviewed copy of the supplied Ta recording, about
0.9404 seconds long. No recording bytes, pronunciation, pitch or timing changed
during approval. Its transcript is **Ta**; the displayed label remains
**Ta marbutah**, glyph ة and identity `ta-marbuta`.

Only `ta-marbuta.audio.name` changes: the reviewed source, transcript, audio
revision and provenance replace the previous synthetic voice; status and review
record the actual approval. All 35 other entries are exact. Ta-marbutah geometry
revision 4, paths, dots, checkpoints and writing order are exact. All 78 existing
public/audio files, including both old Ta-marbutah and original Ta recordings,
are preserved byte-for-byte. All 36 lessons remain student-ready. The historical
draft manifest is retained; its adult candidate button automatically expires
because the active audio revision is now 2.

Student lessons, adult preview, teacher playback, Solo/Duo and round/completion
playback use the same approved name-audio manifest. This audio-only revision
does not reset or invalidate saved geometry-revision-4 completions. The endpoint
recovery implemented in the preceding stage is retained without further changes.

## Verification

| Check | Result |
| --- | --- |
| Full unit suite | **276 passed / 44 files** |
| Checked production build | Passed; **36 student-ready lessons**; `index-BszDVeP_.js` / `index-DbweFF8G.css` |
| Chromium/WebKit browser selection | **21 distinct passes / 3 platform skips**, including corrected saved-credit/mute menu test reruns |
| Actual Chromium MP3 | Exact approved hash; **2 starts / 2 natural endings**; 0.9404 seconds |
| Preservation | Other **35 entries**, target geometry revision **4**, unrelated app source and all **78 audio files** exact |
| Review state | Audio 2 independently approved; **zero pending audio candidates** |

The browser checks cover phone/tablet/desktop student playback and completion,
guided/precision tracing, native emulated touch, scored Solo/Duo and round
playback, teacher replay/navigation, adult-preview mute/replay, blocked playback,
and retained saved revision-4 credit after reload. Captures of the approved
phone voice panel and lesson/Duo states were inspected. The three skips are
WebKit's Chromium-CDP-only touch/Duo cases and the recorded native codec limit.
Initial saved-credit/mute test timeouts came from leaving its settings menu
open, disabling the sound button; the test now resumes tracing before playback,
and both affected cases pass without application changes.

Approval-stage commands, scoped results and final input hashes are recorded in
[`output/verification/ta-marbuta-voice-approval/`](../output/verification/ta-marbuta-voice-approval/).
The reviewed recording hash is checked before promotion by
[the promotion script](../scripts/promote-ta-marbuta-voice.mjs); exact reviewed
content, independent approval, unchanged entries/geometry/assets and readiness
are checked by [the integrity verifier](../scripts/verify-ta-marbuta-voice-approval.mjs).
The prior stage's reports remain historical evidence, not proof for this build.
See [the final verification manifest](../output/verification/ta-marbuta-voice-approval/verification.json).

No APK was rebuilt or deployed. Physical smartboard/tablet and Android runtime
remain unverified. Project-owner approval is recorded independently of any
future educator pronunciation assessment.
