# Familiar Malay pause wording

Completed: 2 October 2026, at the user's request.

- Solo/Duo pause button: **Berhenti**.
- Teacher match-history heading: **Henti / peraturan**.
- Teacher counts: **kali berhenti** and **kali sambung**.
- The current Solo/Duo implementation document uses the new button name. Previous screenshots and verification records retain their original wording as historical evidence.

No occurrences of the old pause word remain in application sources, public assets, active tests or scripts. Existing writing cues such as “Henti”, “Angkat jari” and “Sambung bermain” remain in place.

## Verification

- `npm run build`: passed, including validation of all 37 student-ready letters. Production JS: `index-COeQAKoD.js`; CSS: `index-DZoA18vo.css`.
- `npm test`: 78 checks passed in six files.
- `node output/verification/pause-copy/check.mjs`: three production Chromium journeys passed: Solo at 320 × 740, Duo at 1024 × 768 and Duo at 768 × 1024. The longer label fits, the button freezes the clock, resume works, and saved teacher records use the new wording. No page exceptions. [Results](../output/verification/pause-copy/results.json).
- Relevant live captures were recorded; the [narrow Solo capture](../output/verification/pause-copy/solo-320x740-playing.png) was visually inspected for the longer control label and writing-space layout.
- Compared the previous theme's 141 recorded inputs: only `MatchScreen.jsx` and `TeacherScreen.jsx` changed. Teaching content, recordings, styling, input modules, match rules and storage remain unchanged. [Changed-source fingerprints](../output/verification/pause-copy/inputs.json).

The checked preview at `http://127.0.0.1:4173/` serves the new production build. This is a wording change; real-device/classroom review remains outside this verification scope.
