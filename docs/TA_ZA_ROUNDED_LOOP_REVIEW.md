# Ta (ط) and Za (ظ): rounder upper-loop review

Date: **12 October 2026**, Asia/Kuala_Lumpur.

Historical revision-8 verification: the owner's later photo supersedes this
rounder-loop proposal. Revision 9 was subsequently approved and activated;
its review cards expire. See [activation verification](TA_ZA_REFERENCE_APPROVAL.md)
and [the photo-reference review](TA_ZA_PHOTO_REFERENCE_REVIEW.md). The checks,
hashes and captures below remain evidence of revision 8 only.

The owner requested a rounder, more circular upper loop at the arrow in
[the supplied picture](references/ta-za-rounded-loop-reference.png). Both
shared Ta/Za bodies now use that broader, smoother upper arch in **candidate
revision 8**. The straight downward pillar from revision 7 is retained exactly.

![Current revision-8 candidates](../output/verification/ta-za-rounded-loops/candidate-review.png)

## Geometry and review status

The first three cubic segments of `stroke-1` now form a raised, rounded arch
with aligned tangent directions at their joins and into the retained lower
curve. The previous tight peak is removed. The final two cubic segments—the
lower return and left tail—are byte-for-byte unchanged. The shared paths remain
identical between the two letters.

The pillar remains `M 387.6 194.4 L 387.6 609.29486`; its base junction still
meets the unchanged lower curve. Stroke widths, policies, checkpoints, lift,
numbering and writing order are retained. Za's upper dot and every audio object
are exact. Visible display paths, tracing and demonstrations consume the same
new loop path.

The [revision-bound candidate data](../src/content/taZaStraightPillars.json)
now proposes revision 8 against approved revision 6. Revision 7's data was
preserved in
[the preceding snapshot](../output/verification/ta-za-rounded-loops/preceding-revision-7.json),
and its [verification](TA_ZA_STRAIGHT_PILLAR_REVIEW.md), fingerprints and captures
remain historical. The new candidate has `pendingReview` geometry, no geometry
approval and independent unchanged audio approval.

Open [the running game](http://127.0.0.1:5173/) → **Ruang guru → Huruf →
Semakan video · bandingkan cadangan → Batang lurus Ta dan Za**. Both comparison
pages now show revision 8. Draw the rounded loop/tail first, lift, then trace
the straight pillar through 4/5/6. Za's separate dot remains step 7.

Approved revision 6 remains active in normal student lessons and scored
Solo/Duo. Preview saves cannot grant student credit. Under
[AGENTS.md](../AGENTS.md), “A geometry change needs a new content revision and
fresh review”. Activation therefore awaits explicit approval of these pictured
**Ta 8 / Za 8** shapes. No assessment or approval was invented.

## Verification

| Check | Scope and actual result |
| --- | --- |
| `npm test -- --reporter=json --outputFile=output/verification/ta-za-rounded-loops/unit-results.json` | **305 passed / 47 files**. New round-arch check plus preservation, smooth joins, pillar/base junction, guides, dot-last completion, shortcuts, cancellation/recovery, review expiration and saved-credit isolation. Mouse/touch/pen in play/guided/precision modes are covered. |
| `npm run build` | Passed, including validation of **36 letters / 36 models / 36 student-ready lessons**. The existing large-bundle warning remains. |
| Candidate browser spec, Chromium/WebKit | **24 passed / two expected skips** for Chromium-only CDP touch emulation. Exact loop/pillar paths, comparisons, all three modes, completion, separate dot, demonstrations, reversed starts, partial recovery, preview persistence and no student credit. |
| Visual/layout inspection | Captures at **320×740, 1024×768, 768×1024 and 1280×800**. Automated containment/overflow checks pass. Inspected side-by-side model render and phone/tablet stages showing the rounder arch, retained pillar and separate dot. |
| Source/audio preservation | **169 protected files unchanged**, including the full approved catalogue, all other 34 entries, both current approved entries and all **78 public/audio files**. Matcher, input and renderer modules are unchanged. |
| Existing server | HTTP 200 for the new candidate module at port 5173. No additional server was needed. |
| Whitespace check | `git -c core.safecrlf=false diff --check` passed. |

Browser command, using the existing production-file routing helper against the
checked build, with two workers:

```powershell
$env:JAWI_STATIC_TEST='1'
$env:PLAYWRIGHT_JSON_OUTPUT_NAME='output/verification/ta-za-rounded-loops/browser-results.json'
npx playwright test tests/browser/ta-za-straight-pillars.spec.js --project=chromium --project=webkit --workers=2 --reporter=json --output=output/verification/ta-za-rounded-loops/test-results
```

Current reports:
[unit](../output/verification/ta-za-rounded-loops/unit-results.json),
[browser](../output/verification/ta-za-rounded-loops/browser-results.json),
[preservation and build identity](../output/verification/ta-za-rounded-loops/preservation-and-build.json),
[input fingerprints](../output/verification/ta-za-rounded-loops/final-inputs.json).
The JavaScript bundle is `/assets/index-Ds8sQ-Lt.js`, SHA-256
`c82ec439e95c3dfe226e0b2883068805e7729668a0f5456555dbc64773f1bfd2`.
CSS remains `/assets/index-DbweFF8G.css`, SHA-256
`0764aa3bb4839f976f3639e0ed8e8839c748d1acd73a1fea5dae1715bbcc67d0`.
Historical revision-7 browser results are not claimed as verification of this
changed build. New results above cover the revised candidates.

No physical tablet/native APK check or performance benchmark was run. Chromium
CDP touch does not prove WebKit native touch. No new APK, commit, push or
deployment was requested. Student/Solo/Duo activation checks follow approval
of the pictured revision-8 shapes.
