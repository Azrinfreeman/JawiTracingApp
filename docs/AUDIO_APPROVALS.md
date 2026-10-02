# Audio approval record

## Approval 2026-10-02

The project owner explicitly wrote **“approve all”** in this Codex conversation,
after being directed to review all 37 active recordings in
**Ruang guru → Semakan suara Jawi**.

This approval covers **all 37 current letter-name recordings**: the 27 supplied
MP3/WAV files and the 10 retained synthetic MP3s, including Kaf. Qaf keeps
`20_kof.mp3`, as explicitly confirmed by the user during replacement.

Reviewer: **Project owner (Codex user; name not supplied)**.
Date: **2 October 2026**, using Asia/Kuala_Lumpur.
Each `audio.name.review` records `kind: projectOwner`, this reference and a
`revision` matching that recording's current `version`. No named teacher
identity or professional assessment was supplied or inferred.

Only `audio.name.status` and `audio.name.review` changed. Audio files,
transcripts, source/permission provenance, recording revisions, handwriting
models, geometry approvals and content versions are preserved. Historical
permission/import notes describe the earlier authorisation; the review object
records this subsequent approval.

The 12 previously approved handwriting models now meet the application's
student readiness check. **Jom mula** opens those 12 lessons directly.
The other 25 letters have approved name audio but remain unavailable for tracing
because their handwriting models have not been authored. This audio approval
does not create or approve those missing models, word examples or instructions.

| Glyph | Display name | ID | Approved audio revision | Active recording |
| --- | --- | --- | --- | --- |
| ا | Alif | `alif` | 2 | [Recording](../public/audio/letters/alphabet/alif-name-v2.mp3) |
| ب | Ba | `ba` | 2 | [Recording](../public/audio/letters/alphabet/ba-name-v2.mp3) |
| ت | Ta | `ta` | 2 | [Recording](../public/audio/letters/alphabet/ta-name-v2.mp3) |
| ة | Ta marbutah | `ta-marbuta` | 1 | [Recording](../public/audio/letters/ta-marbuta-name.mp3) |
| ث | Sa | `sa` | 2 | [Recording](../public/audio/letters/alphabet/sa-name-v2.mp3) |
| ج | Jim | `jim` | 2 | [Recording](../public/audio/letters/alphabet/jim-name-v2.mp3) |
| چ | Ca | `ca` | 1 | [Recording](../public/audio/letters/ca-name.mp3) |
| ح | Ha (ح) | `ha-pedat` | 2 | [Recording](../public/audio/letters/alphabet/ha-pedat-name-v2.mp3) |
| خ | Kha | `kha` | 2 | [Recording](../public/audio/letters/alphabet/kha-name-v2.mp3) |
| د | Dal | `dal` | 2 | [Recording](../public/audio/letters/alphabet/dal-name-v2.mp3) |
| ذ | Zal | `zal` | 2 | [Recording](../public/audio/letters/alphabet/zal-name-v2.mp3) |
| ر | Ra | `ra` | 2 | [Recording](../public/audio/letters/alphabet/ra-name-v2.mp3) |
| ز | Zai | `zai` | 2 | [Recording](../public/audio/letters/alphabet/zai-name-v2.mp3) |
| س | Sin | `sin` | 2 | [Recording](../public/audio/letters/alphabet/sin-name-v2.mp3) |
| ش | Syin | `syin` | 2 | [Recording](../public/audio/letters/alphabet/syin-name-v2.mp3) |
| ص | Sad | `sad` | 2 | [Recording](../public/audio/letters/alphabet/sad-name-v2.mp3) |
| ض | Dad | `dad` | 2 | [Recording](../public/audio/letters/alphabet/dad-name-v2.mp3) |
| ط | Ta (ط) | `tho` | 2 | [Recording](../public/audio/letters/alphabet/tho-name-v2.mp3) |
| ظ | Za | `za` | 2 | [Recording](../public/audio/letters/alphabet/za-name-v2.mp3) |
| ع | Ain | `ain` | 2 | [Recording](../public/audio/letters/alphabet/ain-name-v2.mp3) |
| غ | Ghain | `ghain` | 2 | [Recording](../public/audio/letters/alphabet/ghain-name-v2.mp3) |
| ڠ | Nga | `nga` | 1 | [Recording](../public/audio/letters/nga-name.mp3) |
| ف | Fa | `fa` | 2 | [Recording](../public/audio/letters/alphabet/fa-name-v2.mp3) |
| ڤ | Pa | `pa` | 1 | [Recording](../public/audio/letters/pa-name.mp3) |
| ق | Qaf | `qaf` | 2 | [Recording](../public/audio/letters/alphabet/qaf-name-v2.mp3) |
| ک | Kaf | `kaf` | 1 | [Recording](../public/audio/letters/kaf-name.mp3) |
| ڬ | Ga | `ga` | 1 | [Recording](../public/audio/letters/ga-name.mp3) |
| ل | Lam | `lam` | 2 | [Recording](../public/audio/letters/alphabet/lam-name-v2.wav) |
| م | Mim | `mim` | 2 | [Recording](../public/audio/letters/alphabet/mim-name-v2.wav) |
| ن | Nun | `nun` | 2 | [Recording](../public/audio/letters/alphabet/nun-name-v2.wav) |
| و | Wau | `wau` | 2 | [Recording](../public/audio/letters/alphabet/wau-name-v2.wav) |
| ۏ | Va | `va` | 1 | [Recording](../public/audio/letters/va-name.mp3) |
| ه | Ha (ه) | `ha` | 1 | [Recording](../public/audio/letters/ha-name.mp3) |
| ء | Hamzah | `hamzah` | 2 | [Recording](../public/audio/letters/alphabet/hamzah-name-v2.wav) |
| ي | Ya | `ya` | 2 | [Recording](../public/audio/letters/alphabet/ya-name-v2.wav) |
| ى | Ye | `ye` | 1 | [Recording](../public/audio/letters/ye-name.mp3) |
| ڽ | Nya | `nya` | 1 | [Recording](../public/audio/letters/nya-name.mp3) |

A changed recording needs a new revision and fresh approval. Importing new
source bytes clears the relevant review; the readiness check then prevents
that lesson from opening in student mode until it is approved again.

The previous replacement inventory is in
[AUDIO_REPLACEMENT_REVIEW.md](AUDIO_REPLACEMENT_REVIEW.md); model approvals are in
[CONTENT_APPROVALS.md](CONTENT_APPROVALS.md). Snapshot and integrity evidence:
[approval metadata](../output/verification/audio-approval-metadata.json).
Physical tablet/pupil testing remains the next verification step.

## Engineering checks after approval

Content validation and the production build report 12 student-ready lessons.
All 59 unit checks pass. Across the focused browser runs, 45 Chromium/WebKit
cases pass and three Windows WebKit audio cases skip for its known codec
limitation. Native student Ba completion saves an approved student attempt in
both engines; 25 entries without models remain disabled. The 37 active files
remain byte-identical, including both MP3 and WAV sources. Production teacher
playback for Alif, Qaf and Lam and student Ba playback pass in Chromium.

See [verification summary](../output/verification/audio-approval-summary.json)
and [production checks](../output/verification/audio-approved-production.json).
