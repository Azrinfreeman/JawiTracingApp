# Recording and pronunciation guide

37 letter-name recordings are connected: 27 supplied files from voices/alphabet
(21 MP3 and 6 WAV) and 10 retained synthetic MP3s. All 37 were approved by the
project owner on 2 October 2026; see [the approval record](AUDIO_APPROVALS.md).
They play in student lessons, adult preview and Ruang guru → Semakan suara Jawi.
See [the current audio review list](AUDIO_REPLACEMENT_REVIEW.md) for
mapping, files and review priorities. Pronunciation examples are not yet included.
The supplied WAV recordings are teaching assets; silent WAV fixtures used by
engineering tests remain separate.

## Record distinct assets

- **Letter name:** the educator's reviewed Malay name for the displayed character.
- **Pronunciation example:** a reviewed syllable or word where appropriate.
  A Jawi character does not always have one universal sound in every context.
- **Instruction:** optional short prompts such as “Mula pada bulatan hijau”,
  “Ikut laluan ini” and “Sekarang, tambah titik”.

Use a competent Malay-speaking educator. Confirm naming distinctions for ح/ه,
ت/ط/ة, ى/ي and the additional letters with that educator. Rumi labels in the
catalogue are reference labels; parenthetical glyph distinctions are not a script
to read aloud. The user authorised synthetic drafts for later review; generation
is not pronunciation approval. Do not mark these drafts approved before the
actual review, or substitute an unrelated recording when a file is unavailable.

## Initial name-recording list

Place files under `public/audio/letters/`. Suggested name file IDs are:

```text
alif-name.mp3       ba-name.mp3         ta-name.mp3
ta-marbuta-name.mp3 sa-name.mp3         jim-name.mp3
ca-name.mp3         ha-pedat-name.mp3   kha-name.mp3
dal-name.mp3        zal-name.mp3        ra-name.mp3
zai-name.mp3        sin-name.mp3        syin-name.mp3
sad-name.mp3        dad-name.mp3        tho-name.mp3
za-name.mp3         ain-name.mp3        ghain-name.mp3
nga-name.mp3        fa-name.mp3         pa-name.mp3
qaf-name.mp3        kaf-name.mp3        ga-name.mp3
lam-name.mp3        mim-name.mp3        nun-name.mp3
wau-name.mp3        va-name.mp3         ha-name.mp3
hamzah-name.mp3     ya-name.mp3         ye-name.mp3
nya-name.mp3
```

The 37 names above are the original synthetic filenames. For the active mixed
MP3/WAV set, read the current manifest `src` values and AUDIO_REPLACEMENT_REVIEW.md.
Supplied recordings use versioned URLs under public/audio/letters/alphabet/;
unmatched entries keep their original MP3s. Keep replacement file URLs tied to
the correct letter and review any replacement again.

## Capture and permission

Use a quiet room, consistent microphone distance, natural child-friendly pace
and short pauses. Keep an uncompressed original master; package broadly supported
MP3 recordings for the game and test the actual encodes on target browsers.
Avoid background music in pronunciation assets, clipped peaks and inconsistent
volume. Obtain permission to use the speaker's voice in this project and keep
the permission/reference with the recording metadata.

For each recording keep transcript, language, speaker/permission reference,
revision and actual reviewer/date/reference. `review.revision` must match that
recording's `version`. Review changed audio again rather than retaining stale
approval. Never invent a reviewer or mark generated audio approved.

The `audio.name` manifest object includes `src`, `transcriptMs`, `version`,
`status`, `permission` and `review`. `pronunciationExamples` can contain similarly
reviewed objects with a `labelMs` and an appropriate transcript. An empty example
list means the examples have not been selected; it does not prove phonics coverage.

## Playback checks

1. Select an actual local file in Ruang guru and press **Mainkan rakaman dipilih**.
   Auditioning does not save or approve it. Replay requires an explicit click.
2. After placing the file and editing the manifest, run `npm run check:content`.
3. Check each letter's name actually matches the shown character, including
   replay, mute, volume, missing files and quick lesson changes.
4. Confirm a browser that denies autoplay offers a clear replay action. Start
   narration from a user interaction rather than relying on page-load autoplay.
5. Check pronunciation examples separately from letter names. Confirm the
   transcript communicates what the recording is intended to teach.
6. Confirm real playback on iPad Safari, Android Chrome and the target stylus/
   finger devices. Successful decoding in one desktop browser is insufficient.

The Windows Playwright WebKit runtime rejects the test WAV with
`NotSupportedError`. Its unsupported-file feedback is checked. This is separate
from pronunciation review and from verification on real Safari hardware.
