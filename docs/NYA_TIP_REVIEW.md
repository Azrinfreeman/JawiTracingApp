# Nya upper tip review

Prepared 7 October 2026, Asia/Kuala_Lumpur, following the owner's marked photo
and request to remove the upper-right tip above the green line.

Candidate **Nya 4** shortens the right starting tip. The guide's rounded visible
top is approximately at the marked line (logical y=393). Its centre begins at
(608.34011, 417). The first original curve is removed and the next curve is
split at t=0.10670411186939024 using de Casteljau subdivision. The retained
remainder matches the original curve within 0.00002 logical units after rounding.
The final bowl curve, left tail, widths, checkpoints, continuous movement,
three dot targets and dot-last sequence remain exact. Audio remains revision 1.

The proposal is available under **Ruang guru → Huruf → Semakan video → Hujung
Nya**. Original and candidate have separate preview buttons. The candidate is
pending review; it has no geometry approval. The active catalogue and all 36
approved student lessons remain unchanged. Preview saves are revision 4 and
cannot complete the normal revision-3 student lesson. Candidate Solo/Duo checks
use a separate unscored test harness, never a student challenge pool.

The request authorises preparing the correction. Project AGENTS.md requires
“A geometry change needs a new content revision and fresh review”; fresh owner
approval of the pictured Nya 4 is still required before student promotion.

Evidence: `output/verification/nya-tip/`, including the before catalogue,
authoring calculation, comparison image, unit/browser reports and inputs.
Verification on the changed inputs:

- **241 unit/content checks in 36 files passed**, including exact retained-curve
  comparison, unchanged bowl/dots/audio and independent approval gating.
- Build `nya-shorter-tip-review-20261007` passed: 36 current valid models and
  36 ready lessons; original catalogue unchanged. Existing bundle-size warning
  remains.
- **18 distinct Chromium/WebKit browser cases passed**: three practice modes,
  all three dots after the bowl, isolated revision-4 preview saves and reload,
  teacher comparisons, demonstration preserving progress, unchanged normal Nya 3,
  and independent unscored Solo/Duo candidate lanes. 320×600, 768×1024 and
  1280×800 lesson states plus 1024×768 race states exercised.
- The first run passed 14 cases but failed four race expectations: the test
  incorrectly expected unscored previews to write student attempts. The app
  deliberately omits those saves. The assertion was corrected; only those four
  cases were rerun and passed. The other 14 definitions stayed byte-identical.
  Initial report/test source and the four-case rerun are preserved separately.
- Comparison, completed phone and tablet guide captures were visually inspected;
  the tip is shortened to the marked level, with all dots and the bowl visible.
- Existing live server responds with the exact unchanged student catalogue and
  new correction data. No duplicate server started. All 36 entries and all 37
  preceding recording files remain exact; seven earlier proposal scopes empty,
  with only Nya 4 now awaiting review.

Commands/environments/fingerprints: `inputs.json`; full suite: `unit.json`;
browser evidence: `browser-initial.json` (14 successful cases plus four incorrect
test expectations) and `browser-matches.json` (four successful corrected cases).
Browser checks use the production static fixture because of sandbox socket
limits; live source checked separately. Mouse automation is not physical-device
verification. No teacher assessment or Nya-4 owner approval is claimed.

Remaining: owner approval of the pictured Nya 4, exact candidate promotion,
matching geometry approval record, and affected student completion/save checks.
