# Hamzah straight tail and Ye removal

Owner request and approval: 7 October 2026, Asia/Kuala_Lumpur.
The owner marked the lower dent in Hamzah 4 and confirmed the described
correction with “approve and pplease remove remove ye, it's should not exist”.
The approved scope is a straight diagonal lower section from 2 to 3, with the
upper shape retained, plus removal of Ye from the active game.

Hamzah content revision 5 keeps the first three upper cubic curves exactly,
the same start and tail tip, widths, continuous movement, checkpoints, zero dots
and audio revision 2. Its outward lower run and return are line segments; the
return runs directly from (621.8, 502.1) to (408.4, 560.4), removing the lower dent.
The owner approval identifies this requested correction; no subsequent owner
audition or teacher assessment is claimed.

Ye is removed from `src/content/letters.json`. There are now 36 active lessons,
30 supplied recordings and six synthetic recordings. Student/adult catalogues,
teacher audio choices and challenge pools derive from that same catalogue.
Ya now precedes Nya directly. All 35 other entries are exact. Existing Ye saves
and its recording are retained as history; Ye is not selectable or included in
current book completion. Hamzah 4 saves remain historical and do not complete 5.

Before-state and verification evidence: `output/verification/hamzah-ye/`.
The visual comparison is `hamzah-tail-comparison.png`; old Hamzah and Ye entries
are preserved in `tests/fixtures/hamzah-tail-original.json` and `removed-ye.json`.

Verification completed on the changed inputs:

- Complete unit/content suite: **238 checks in 35 files passed**. Task-local
  TEMP/TMP avoids the recorded Windows sandbox cache limitation.
- Checked build `hamzah-straight-tail-no-ye-20261007`: **36 valid models and
  36 student-ready lessons**. Existing bundle-size warning remains.
- **20 Chromium/WebKit browser cases passed**, with no skips/failures/flakiness:
  all three practice modes and saved revision 5, demonstrations, owner review,
  all catalogue pages and teacher audio choices, Ya → Nya → book end,
  historical Ye save preservation, scored Solo/Duo independent lanes.
- Phone 320×600, tablet 768×1024 and desktop 1024×768 states were exercised.
  Comparison, completed phone and tablet guide captures were visually inspected:
  the lower dent is gone and the final diagonal is straight.
- Existing server `http://127.0.0.1:5173/` responds with the exact updated
  catalogue; no duplicate server was started.
- Preservation check: **35 unrelated entries and 37 previous recordings exact**;
  all application modules except the catalogue and teacher inventory text remain
  exact against the preceding Va evidence. All seven review scopes are empty.

Commands, environments and fingerprints are recorded in `inputs.json` beside
`unit.json` and `browser.json`. Browser tests use the production static fixture
because sandbox sockets are restricted; the live server catalogue was checked
separately. Mouse automation does not establish physical-device input.
No new audio was created; no audible or teacher assessment is claimed.
