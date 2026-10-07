# Nga pronunciation correction

7 October 2026, Asia/Kuala_Lumpur. The owner supplied Recording (5).m4a and
requested Nga sound like that recording, rather than “n-g”. The catalogue label
and transcript already read **Nga**; the old revision-1 recording was synthetic.

The game now uses the complete first supplied utterance as **Nga audio 2**:
[listen](../public/audio/letters/alphabet/nga-name-v2.wav). The source contains
two separate takes; the first is kept from **0.70–1.70 seconds**, covering the
consonant onset, vowel and decay with quiet margins. Native Chromium decodes the
original stereo AAC into mono 24-kHz PCM. Pitch, rate, gain and speech samples
are unchanged. Five-millisecond fades affect near-silent edges only. The result
is a 1.00-second, 48,044-byte WAV, SHA-256
`12207db99c7d5bd306c0b1e3ac5f6b5c6e9d8ab8958dca1d20a95a82106a3f22`.
The versioned URL prevents reuse of the superseded synthetic file.

The matching owner selection records the supplied target and correction request,
rather than inventing a separate audition of the packaged WAV. See
[the record](AUDIO_APPROVALS.md#selection-of-supplied-nga-recording-2026-10-07).
Only Nga's name-audio metadata changed. Its geometry/content revision 4, geometry
approval and label are preserved. All 36 other catalogue entries and all 37
previous recording files remain exact. Current inventory is 29 supplied and 8
synthetic recordings, with all 37 lessons ready and all six review scopes empty.

## Verification

- `npm test -- --reporter=json --outputFile=output/verification/nga-audio/unit.json`:
  initial 216 passes and 2 failures in older historical geometry checks that
  expected Nga audio 1. Those two files now use the preserved pre-correction
  recording fixture for their historical comparison; current audio has its own
  independent preservation and readiness checks. Affected recheck:
  `npx vitest run tests/geometry/ainFamilyOutlines.test.js tests/game/glyphMatched.test.js --reporter=json --outputFile=output/verification/nga-audio/unit-recheck.json`:
  all 14 cases pass. Combined current evidence: **218 distinct unit passes in 29
  files**, including 204 unchanged initial cases; initial evidence is retained.
- `VITE_BUILD_ID=nga-user-audio-20261007 npm run build`: passes, including content
  validation of 37 models and 37 student-ready lessons.
- `npx playwright test tests/browser/nga-audio.spec.js --project=chromium --project=webkit --workers=2 --grep-invert 'native Chromium' --reporter=line,json`:
  **14 passes**. All three practice modes select the new recording, replay works,
  completions save audio 2, partial drawing survives replay, mute/navigation stop
  playback, teacher review identifies the supplied recording, and Solo/Duo select
  it during readiness and racing. Phone play: 320×600; other modes: 768×1024.
- The same file with `--project=chromium --workers=1 --grep 'native Chromium'`:
  **1 pass**. Actual packaged audio fetches/decodes to 1.00 seconds with no clipped
  samples and plays twice through `ended`. **15 distinct browser checks** total.
  No unsupported native WebKit decode was retried; its lifecycle checks use
  controlled instrumentation under the previously recorded Windows codec limit.
- Existing local server serves the exact catalogue and new WAV with HTTP 200,
  audio/wav type, matching 48,044-byte size and SHA-256; no duplicate server.
- `node scripts/verify-nga-audio.mjs`: checks the exact source, unchanged speech
  bytes, independent metadata, preserved geometry/other entries/application code,
  all old and packaged recordings, build identity and current evidence.

Evidence and fingerprints: `output/verification/nga-audio/inputs.json` and the
same folder's source, generation, unit/browser reports and captures. Node
24.19.0, Playwright 1.63.0, current production bundle through the static test
fixture. Repeat only after affected inputs change or a new concern appears.

No independent phonetic assessment or physical-device listening is claimed;
the owner provided the requested target pronunciation. No APK, deployment or
publication requested.
