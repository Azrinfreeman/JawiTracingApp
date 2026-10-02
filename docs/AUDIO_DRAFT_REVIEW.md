# Jawi synthetic audio drafts for review

**Historical generation record.** A later user-requested replacement imported
27 files from voices/alphabet and retained 10 synthetic drafts. Use
[AUDIO_REPLACEMENT_REVIEW.md](AUDIO_REPLACEMENT_REVIEW.md) for the active recordings.
The table and verification below describe the original 37-file generated batch.
All 37 current recordings were subsequently approved by the project owner;
see [AUDIO_APPROVALS.md](AUDIO_APPROVALS.md) for that later record.

Generated: 2026-10-02T10:10:48.970706+08:00. **37 local letter-name MP3s; zero audio approvals.**

The user explicitly authorised audio generation and use in the game preview in
Codex on 2 October 2026, and deferred pronunciation review until later.
The files are synthetic speech, not human teacher recordings or a cloned voice.

Voice: `ms-MY-YasminNeural` (Malay–Malaysia), -15% speaking rate and
+0Hz pitch. Generation used edge-tts 7.2.8. The chosen Malaysian
Malay voice is documented in [Microsoft's voice list](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts).
The [edge-tts project](https://github.com/rany2/edge-tts) documents the generation
client. The provider returned MP3 files; no silent fixtures or beeps are used.

All files are stored under `public/audio/letters/` and served locally by the
game. Playing a recording does not contact the speech service. Total MP3 size:
441,936 bytes. A generation log records each file's SHA-256,
voice, spoken text and version in `output/verification/draft-audio-generation.json`.
The authorisation record covers generation and preview use; it does not assert
that pronunciation was checked or that a human speaker supplied voice permission.

## Listen in the game

1. Open **Ruang guru → Semakan suara Jawi**.
2. Choose a letter and press **Dengar rakaman**. Use **Rakaman seterusnya** to
   select another letter; audio never starts merely because the selection changes.
3. Check the displayed glyph against the name you hear. Replay, mute and volume
   controls are available. Tell Codex which letter needs an adjustment.
4. The 12 implemented tracing lessons also play their own name through
   **Dengar** in Jejak Ceria or **Dengar nama** in stricter practice.

All 37 names can be auditioned in Ruang guru, including the 25 letters whose
tracing models have not been authored. Selecting, playing, or generating a file
does not approve it. `audio.name.status` remains `pendingReview` and `review`
remains null. Zero lessons are enabled as approved student content.

## What to review

- The intended Malaysian Jawi letter name and actual pronunciation.
- Comfortable speed, clarity, naturalness, volume, and clean beginnings/endings.
- Distinctions involving ح/ه, ت/ط/ة and ي/ى, and the additional Jawi letters.
  The current label bank gives both Ha forms the spoken name **Ha** and both
  ت/ط the spoken name **Ta**. Their draft speech is not proof of a phonetic
  distinction; confirm the intended naming and pronunciation before approval.
- Parenthetical glyph labels are visual distinctions. They were removed from
  speech transcripts so the synthesiser does not read parentheses or a glyph.
- These files teach names only. Syllables, word examples and instruction prompts
  have not been generated, and the name of a letter is not its sound in every word.

Record corrections and real approval separately. Re-generating a linked draft
increments its audio version and clears review metadata. The generator refuses
an approved recording. Model approvals and content versions are unchanged.

## Generation and engineering checks

The supplied MP3s require no generation tool at runtime. To regenerate pending
drafts manually, install `scripts/audio-requirements.txt` into `.tools/audio-deps`
using Python's `pip --target`, then run `scripts/generate-draft-audio.py`.
Generation contacts the speech service and sends only the letter-name text.
`--sample` writes an isolated Alif sample under `output/audio-samples` without
changing linked audio. Full batches are staged before integration; regeneration
does not give pronunciation approval.

All 59 unit tests and 27 Chrome/WebKit browser checks passed after integration.
Three Windows WebKit audio tests were skipped because that runtime lacks
AudioContext and rejects actual MP3 playback with NotSupportedError. Its review
interface and unsupported-audio feedback were checked. Successful audio decoding,
playback, replay, mute, volume and navigation stop were verified in Chromium.

All 37 MP3s decoded as non-silent audio in Chromium, with duration, signal level
and clipping bounds checked. This establishes file integrity, not the correctness
of the pronunciation. Production packaging and HTTP delivery matched every
generation SHA-256; all 37 files returned HTTP 200 with an audio/mpeg content type.
Desktop, 390-pixel and 320-pixel review layouts had no page overflow or page errors,
and production playback made no external requests. See
`output/verification/draft-audio-production.json` for the packaging/playback record
and `output/screenshots/draft-audio-review-390.png` for the review interface.
Physical Safari/Android and human pronunciation review remain pending.

## Review list

| Glyph | Display name | Spoken text | Local MP3 | Review |
| --- | --- | --- | --- | --- |
| ا | Alif | Alif | [alif](../public/audio/letters/alif-name.mp3) | Pending |
| ب | Ba | Ba | [ba](../public/audio/letters/ba-name.mp3) | Pending |
| ت | Ta | Ta | [ta](../public/audio/letters/ta-name.mp3) | Pending |
| ة | Ta marbutah | Ta marbutah | [ta-marbuta](../public/audio/letters/ta-marbuta-name.mp3) | Pending |
| ث | Sa | Sa | [sa](../public/audio/letters/sa-name.mp3) | Pending |
| ج | Jim | Jim | [jim](../public/audio/letters/jim-name.mp3) | Pending |
| چ | Ca | Ca | [ca](../public/audio/letters/ca-name.mp3) | Pending |
| ح | Ha (ح) | Ha | [ha-pedat](../public/audio/letters/ha-pedat-name.mp3) | Pending |
| خ | Kha | Kha | [kha](../public/audio/letters/kha-name.mp3) | Pending |
| د | Dal | Dal | [dal](../public/audio/letters/dal-name.mp3) | Pending |
| ذ | Zal | Zal | [zal](../public/audio/letters/zal-name.mp3) | Pending |
| ر | Ra | Ra | [ra](../public/audio/letters/ra-name.mp3) | Pending |
| ز | Zai | Zai | [zai](../public/audio/letters/zai-name.mp3) | Pending |
| س | Sin | Sin | [sin](../public/audio/letters/sin-name.mp3) | Pending |
| ش | Syin | Syin | [syin](../public/audio/letters/syin-name.mp3) | Pending |
| ص | Sad | Sad | [sad](../public/audio/letters/sad-name.mp3) | Pending |
| ض | Dad | Dad | [dad](../public/audio/letters/dad-name.mp3) | Pending |
| ط | Ta (ط) | Ta | [tho](../public/audio/letters/tho-name.mp3) | Pending |
| ظ | Za | Za | [za](../public/audio/letters/za-name.mp3) | Pending |
| ع | Ain | Ain | [ain](../public/audio/letters/ain-name.mp3) | Pending |
| غ | Ghain | Ghain | [ghain](../public/audio/letters/ghain-name.mp3) | Pending |
| ڠ | Nga | Nga | [nga](../public/audio/letters/nga-name.mp3) | Pending |
| ف | Fa | Fa | [fa](../public/audio/letters/fa-name.mp3) | Pending |
| ڤ | Pa | Pa | [pa](../public/audio/letters/pa-name.mp3) | Pending |
| ق | Qaf | Qaf | [qaf](../public/audio/letters/qaf-name.mp3) | Pending |
| ک | Kaf | Kaf | [kaf](../public/audio/letters/kaf-name.mp3) | Pending |
| ڬ | Ga | Ga | [ga](../public/audio/letters/ga-name.mp3) | Pending |
| ل | Lam | Lam | [lam](../public/audio/letters/lam-name.mp3) | Pending |
| م | Mim | Mim | [mim](../public/audio/letters/mim-name.mp3) | Pending |
| ن | Nun | Nun | [nun](../public/audio/letters/nun-name.mp3) | Pending |
| و | Wau | Wau | [wau](../public/audio/letters/wau-name.mp3) | Pending |
| ۏ | Va | Va | [va](../public/audio/letters/va-name.mp3) | Pending |
| ه | Ha (ه) | Ha | [ha](../public/audio/letters/ha-name.mp3) | Pending |
| ء | Hamzah | Hamzah | [hamzah](../public/audio/letters/hamzah-name.mp3) | Pending |
| ي | Ya | Ya | [ya](../public/audio/letters/ya-name.mp3) | Pending |
| ى | Ye | Ye | [ye](../public/audio/letters/ye-name.mp3) | Pending |
| ڽ | Nya | Nya | [nya](../public/audio/letters/nya-name.mp3) | Pending |
