# Supplied alphabet recordings — review list

Updated: 2 October 2026. **27 recordings replaced; 10 recordings retained; all 37 approved by the project owner.**
See [the subsequent approval record](AUDIO_APPROVALS.md). The import engineering
checks below describe the replacement stage before that approval.

The user requested the files in `voices/alphabet` replace matching alphabet
recordings, leaving letters without a supplied file unchanged for later review.
The game now uses 21 supplied MP3s and 6 supplied WAVs alongside 10 existing
synthetic MP3 drafts. The supplied files were copied byte for byte, without
normalisation, trimming, conversion or regeneration.

## Listen in the game

1. Refresh [Taman Jawi](http://127.0.0.1:5173/), then open **Ruang guru → Semakan suara Jawi**.
2. Choose a letter and press **Dengar rakaman**. A replacement displays
   **Rakaman pilihan anda** beneath its name.
3. Use **Rakaman seterusnya** to select another letter, then press **Dengar**.
   Selection never starts playback automatically.
4. Check the displayed character, pronunciation, clarity, pace and volume.
   Tell Codex which letter needs a correction. Listening does not approve audio.
5. In an implemented pilot lesson, **Dengar** / **Dengar nama** plays that
   letter's same active recording.

All 37 names are now `approved`, with review revisions matching the recording
versions and the user's approval recorded as `projectOwner`. Existing model
approvals and lesson content versions are unchanged; 12 lessons are enabled.

## Replacements

These are the current active files. Their name-recording revision is 2.
The original supplied filenames remain intact under `voices/alphabet`.

| Glyph | Display name | Supplied filename | Active local recording |
| --- | --- | --- | --- |
| ا | Alif | `01_aliff.mp3` | [Listen](../public/audio/letters/alphabet/alif-name-v2.mp3) |
| ب | Ba | `02_ba.mp3` | [Listen](../public/audio/letters/alphabet/ba-name-v2.mp3) |
| ت | Ta | `03_ta.mp3` | [Listen](../public/audio/letters/alphabet/ta-name-v2.mp3) |
| ث | Sa | `04_sa.mp3` | [Listen](../public/audio/letters/alphabet/sa-name-v2.mp3) |
| ج | Jim | `05_jin.mp3` | [Listen](../public/audio/letters/alphabet/jim-name-v2.mp3) |
| ح | Ha (ح) | `06_ha.mp3` | [Listen](../public/audio/letters/alphabet/ha-pedat-name-v2.mp3) |
| خ | Kha | `07_hor.mp3` | [Listen](../public/audio/letters/alphabet/kha-name-v2.mp3) |
| د | Dal | `08_da.mp3` | [Listen](../public/audio/letters/alphabet/dal-name-v2.mp3) |
| ذ | Zal | `09_dzal.mp3` | [Listen](../public/audio/letters/alphabet/zal-name-v2.mp3) |
| ر | Ra | `10_raw.mp3` | [Listen](../public/audio/letters/alphabet/ra-name-v2.mp3) |
| ز | Zai | `11_zai.mp3` | [Listen](../public/audio/letters/alphabet/zai-name-v2.mp3) |
| س | Sin | `12_1sin.mp3` | [Listen](../public/audio/letters/alphabet/sin-name-v2.mp3) |
| ش | Syin | `12_2syin.mp3` | [Listen](../public/audio/letters/alphabet/syin-name-v2.mp3) |
| ص | Sad | `13_sod.mp3` | [Listen](../public/audio/letters/alphabet/sad-name-v2.mp3) |
| ض | Dad | `14_dod.mp3` | [Listen](../public/audio/letters/alphabet/dad-name-v2.mp3) |
| ط | Ta (ط) | `15_tor.mp3` | [Listen](../public/audio/letters/alphabet/tho-name-v2.mp3) |
| ظ | Za | `16_zor.mp3` | [Listen](../public/audio/letters/alphabet/za-name-v2.mp3) |
| ع | Ain | `17_ain.mp3` | [Listen](../public/audio/letters/alphabet/ain-name-v2.mp3) |
| غ | Ghain | `18_ghain.mp3` | [Listen](../public/audio/letters/alphabet/ghain-name-v2.mp3) |
| ف | Fa | `19_faa.mp3` | [Listen](../public/audio/letters/alphabet/fa-name-v2.mp3) |
| ق | Qaf | `20_kof.mp3` | [Listen](../public/audio/letters/alphabet/qaf-name-v2.mp3) |
| ل | Lam | `21_lam.wav` | [Listen](../public/audio/letters/alphabet/lam-name-v2.wav) |
| م | Mim | `22_mim.wav` | [Listen](../public/audio/letters/alphabet/mim-name-v2.wav) |
| ن | Nun | `23_nun.wav` | [Listen](../public/audio/letters/alphabet/nun-name-v2.wav) |
| و | Wau | `24_wau.wav` | [Listen](../public/audio/letters/alphabet/wau-name-v2.wav) |
| ء | Hamzah | `25_hamzah.wav` | [Listen](../public/audio/letters/alphabet/hamzah-name-v2.wav) |
| ي | Ya | `26_ya.wav` | [Listen](../public/audio/letters/alphabet/ya-name-v2.wav) |

The user explicitly confirmed **`20_kof.mp3` → Qaf (ق)** and requested that
**Kaf (ک) keep its current recording**. The source filename is retained in the
metadata so this decision can be reviewed later.

Numbered phonetic filenames are mapped to the existing character catalogue:
`06_ha.mp3` is ح, `07_hor.mp3` is خ, `15_tor.mp3` is ط and
`16_zor.mp3` is ظ. Ha (ه) has no replacement. Existing display names and intended
transcripts have been preserved; the mapping itself is not pronunciation approval.
In particular, compare both Ha forms and the Ta/ط distinction while listening.

## Retained recordings

These ten entries retain their previous file, revision and audio bytes. Their
status and review metadata now record the subsequent project-owner approval.

| Glyph | Display name | Active local recording |
| --- | --- | --- |
| ة | Ta marbutah | [Existing recording](../public/audio/letters/ta-marbuta-name.mp3) |
| چ | Ca | [Existing recording](../public/audio/letters/ca-name.mp3) |
| ڠ | Nga | [Existing recording](../public/audio/letters/nga-name.mp3) |
| ڤ | Pa | [Existing recording](../public/audio/letters/pa-name.mp3) |
| ک | Kaf | [Existing recording](../public/audio/letters/kaf-name.mp3) |
| ڬ | Ga | [Existing recording](../public/audio/letters/ga-name.mp3) |
| ۏ | Va | [Existing recording](../public/audio/letters/va-name.mp3) |
| ه | Ha (ه) | [Existing recording](../public/audio/letters/ha-name.mp3) |
| ى | Ye | [Existing recording](../public/audio/letters/ye-name.mp3) |
| ڽ | Nya | [Existing recording](../public/audio/letters/nya-name.mp3) |

## Implementation and verification

`src/content/letters.json` is the active source of truth. Each replacement
records its original filename, SHA-256, import time and `userProvided` origin.
That origin records who supplied the file to the project, without asserting
the speaker's identity or how the recording was produced. Replaced entries
no longer carry the previous synthetic-voice metadata.

Replacement URLs use `/audio/letters/alphabet/<id>-name-v2.mp3` or `.wav`,
so a browser cannot reuse the previous MP3 under the same URL. The original
generated assets remain available for the historical generation record;
the game selects only the current manifest URL.

- All 27 source files and all 37 original public files remain byte-identical.
- Ten unmatched letter entries remain completely identical to the initial snapshot.
- All non-name-audio content is preserved across the 37 catalogue entries.
- All 37 active files decode to non-silent audio in Chromium.
- Production source, build and HTTP SHA-256 checks match for all 37 files:
  1,761,779 bytes in the active set, with correct MP3/WAV types and HTTP 200.
- Actual teacher playback passed for Alif, Qaf and Lam (WAV), and lesson
  playback passed for Ba.
- The build and 59 unit checks passed; 9 focused Chromium/WebKit browser cases
  passed. Three audio cases skip on Windows WebKit because its runtime lacks
  AudioContext or rejects actual MP3 playback. Physical device playback and
  pronunciation review remain pending.
- Review layouts at 1280, 390 and 320 pixels have no horizontal overflow,
  page errors or external runtime requests.

Evidence: [import inventory](../output/verification/alphabet-audio-import.json),
[preservation checks](../output/verification/alphabet-audio-preservation.json),
[production checks](../output/verification/alphabet-audio-production.json) and
[phone review preview](../output/screenshots/alphabet-audio-review-390.png).

For another explicitly requested replacement batch, update
`scripts/alphabet-audio-map.json` and run `node scripts/import-alphabet-audio.js`.
Unchanged sources are skipped; changed sources receive a new audio revision and
return to pending review. The original batch synthesiser is separate from this
import process. No audio was generated during this replacement task.
