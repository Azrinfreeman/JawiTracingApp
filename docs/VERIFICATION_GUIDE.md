# Selecting and reusing verification

Use checks that cover the requested change and its dependencies. Applicable
required checks and unresolved concerns take precedence over avoiding repetition.
This guide selects work; it does not provide automatic caching or permission to
treat historical success as proof for changed behaviour.

## Choose the affected checks

| Change | Verification to select |
| --- | --- |
| Documentation/instructions only | Review paths, links, scope, size and contradictions; confirm unrelated files unchanged. No app build/browser suite. |
| Approval metadata only | Unit/content checks, checked build once, pre-change comparison; affected student access, saved revision/status and letter completions. |
| New/revised geometry | Unit/content checks and build; affected models in supported modes, every movement/dot, numbering, navigation and phone/tablet stages. Keep content review gate. |
| Matcher, input or tolerances | Unit tests and build; affected play/strict, shortcuts, reversal, dots, interruption/recovery and touch cases. Broaden for shared behaviour. |
| Guides, layout or decoration | Build and relevant guide/layout cases; representative phone/tablet/desktop states, overlap/overflow checks and affected complex models. |
| Recordings or playback | Manifest, transcript/revision, affected hashes and build; supported playback/replay/failure checks, plus readiness when statuses change. |
| Storage, export or navigation | Unit tests/build as applicable; relevant persistence, corruption/quota/reset, export or route cases; student/preview separation. |
| Dependencies, build configuration or broad refactor | Checked build and broader relevant regressions; reconsider runtime limitations. |

Use existing tests and [browser helpers](../tests/browser/helpers/). Add tests
for meaningful new behaviour or a regression, not assertions that only mirror
an implementation. The inexpensive unit suite can run once for an app/content
change; an unrelated documentation edit does not invalidate it.

## Avoid duplicated execution

`npm run build` includes content validation. Do not immediately precede it with
`npm run check:content` for unchanged inputs. Use content validation alone when
early feedback is useful or a build is unnecessary. Available commands are in
[README.md](../README.md#commands).

Select browser cases by file and test name, normally with at most two workers
on this host. Use Chromium CDP for native emulated touch; its cases cannot prove
WebKit touch. Successful playback needs a supported codec/runtime. An unsupported
codec message proves error handling only. Check [recorded limits](PROJECT_STATE.md)
before retrying a failed runtime without changed conditions.

Reuse a running server only after checking its address and tested build. Finish
dependent edits before testing their result. Recompute SVG screen coordinates
after scroll, resize or a capture that moves the page. Capture again when it
resolves a visual question or records changed behaviour, not for duplicate evidence.

## Reuse evidence only while its inputs match

Relevant inputs include application and test code, shared dependencies, content,
assets, settings, lockfile/runtime, build identity, browser, viewport and input
type. Record only those applicable to the check. A command name, screenshot,
or date alone cannot establish freshness.

Reuse a passed check when the current session establishes unchanged relevant
inputs, or a trustworthy recorded fingerprint matches them, and no concern remains.
A shared-module change can invalidate checks beyond the edited file. If freshness
is uncertain, rerun the affected checks. After a failure or fix, rerun what verifies
the correction; broaden when the failure exposes a wider issue.

Keep output bounded: totals on success, relevant details on failure. Summarise
verification in the task or final report. Use an optional `CURRENT_TASK.md` only
when work needs a checkpoint, not as a growing log for every edit:

```text
Check: command or named selection
Scope: behaviour, browser, viewport/input and dev/production build
Result: passed/failed/skipped, totals and evidence path
Inputs: relevant files/build/runtime; fingerprint when available
Repeat trigger: affected inputs changed or unresolved concern
```

## Historical scripts and reports

Batch/snapshot scripts verify their recorded catalogue stage. For example,
`scripts/verify-letter-batch-2-approval.js` compares the second batch against a
pre-approval snapshot; it can become stale after another batch. Inspect a script's
preconditions before running it. Do not restore old content or rewrite historical
evidence to make it pass. Use current behavioural tests and targeted new evidence
for changed stages. Read only the relevant dated section of
[the acceptance record](ACCEPTANCE.md).
