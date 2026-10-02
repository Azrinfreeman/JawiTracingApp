# Efficient agent workflow — implementation proposal

Date: 2 October 2026 · Asia/Kuala_Lumpur

**Status: proposal only.** This document is the only deliverable created for this
request. The proposed agent instructions, supporting files and optional changes
below have not been implemented. Application code, content, approvals, recordings
and testing configuration are unchanged by this planning task.

## Intended result

Make future Codex tasks quicker to understand and complete by keeping permanent
instructions short, reading only relevant material, reusing valid evidence and
testing the behaviour affected by a change. Required checks and teaching-content
approval rules still apply. Efficiency means avoiding redundant work while
finishing the authorised task.

This improves the inputs and workflow available to the agent. It cannot enforce
an exact token budget or guarantee a percentage reduction in account usage.
Use measured results, when available, rather than claiming estimated savings as
actual savings.

## Findings from this project

- No project `AGENTS.md` or `SKILL.md` was found. Existing implementation documents
  explain individual features but do not provide a short working guide.
- Current content has 37 letters, 22 authored and approved models, 22 student-ready
  lessons, 15 unauthored models and 37 approved name recordings.
- Historical reports correctly retain older counts. Reading them as current
  state can cause repeated investigation or incorrect verification choices.
- Several scripts compare a specific batch against its saved snapshot. They
  cannot be treated as general regression checks after later catalogue changes.
- `npm run build` already executes content validation. Running `check:content`
  immediately before it without an intervening change duplicates that check.
- Browser tests repeat catalogue counts and some navigation helpers. This creates
  maintenance work when another letter batch becomes available.
- Existing browser helpers already provide splash dismissal, practice selection,
  SVG-to-screen coordinates and actual drawing input. Reuse them when applicable.
- Recorded environment limitations include Firefox failing to launch on Windows
  with `spawn UNKNOWN`, and Windows WebKit rejecting the tested WAV fixture.
  These observations are environment-specific; they are not permanent product rules.

Sources for current project facts: `src/content/letters.json`, `package.json`,
`README.md`, `docs/CONTENT_APPROVALS.md`, `docs/ACCEPTANCE.md` and the latest
`output/verification/letter-batch-2-approval.json`.

## Proposed files and scope

| File | Purpose | Size target |
| --- | --- | --- |
| `AGENTS.md` | Stable project rules and routes to relevant references | About 450–600 words |
| `docs/PROJECT_STATE.md` | Current inventory, pending work, latest evidence and environment caveats | At most 250 words |
| `docs/VERIFICATION_GUIDE.md` | Change-to-check mapping, evidence reuse and historical script warnings | About 500–700 words |
| `README.md` | Add one short contributor link to the guidance | A few lines |
| `docs/CURRENT_TASK.md` | Optional checkpoint for a long or interrupted task | At most 180 words |

Implement the first four files after authorisation. Create a task checkpoint only
when a task will benefit from one, such as work that spans sessions or compaction.
Do not create an expanding log for every small edit.

Keep current facts in `PROJECT_STATE.md`, not in multiple instruction files.
The catalogue and revision-matching validation remain authoritative; the state
note is a dated summary. Preserve dated approval records and historical evidence.

Do not install a plugin, alter personal Codex configuration, change models,
introduce automated caching, or add a new test framework for this work.

## Proposed `AGENTS.md` content

The following is proposed text, not an active instruction file:

```markdown
# Working in Taman Jawi

## Scope and completion

Follow the current user request and prior authorisation. If the user asks for an
implementation document first, create that document and stop before applying
its changes. Once implementation is authorised, finish the change, resolve
relevant failures and deliver the verified result without repeated confirmation.
Do not deploy, publish or message others unless the request authorises it.

## Find the relevant context

Read only files needed for the task. Use docs/PROJECT_STATE.md when current
content status, pending work or previous verification matters; confirm important
facts against their source files. Use targeted searches and bounded reads.
Exclude dependencies, builds, reports and screenshots from routine source
searches unless the task concerns them. Do not reread unchanged files already
available in the conversation or load the full acceptance history by default.

Routes: src/content/ and CONTENT_REVIEW.md for letter models and readiness;
src/tracing/ and the relevant tracing specification for input behaviour;
NUMBERED_TRACING_GUIDES.md for writing cues; src/audio/ and AUDIO_RECORDING.md
for recordings; src/storage/ for saved progress; src/screens/, src/components/
and src/styles/ for presentation. Documentation names here are under docs/.

## Preserve teaching content

Treat src/content/letters.json and its validator as the content source of truth.
Geometry and audio have independent approval records matching their revisions.
Proceed authorises implementation; explicit approval authorises the identified
reviewed content. Record the actual reviewer, date, scope and revision. Never
invent a teacher assessment. A geometry change needs a new content revision and
fresh review; an approval-only change preserves paths, dots, order and versions.
Preserve unrelated approved entries and recordings. Keep Jejak Ceria as the
preschool default unless the user requests a change.

## Work and verify once

Reuse existing modules and browser helpers. Batch independent searches and
read-only checks; keep dependent edits and checks in order. Keep tool output
small: relevant lines, failure details and final totals. Reuse a running local
server after confirming its address and build; do not start duplicate servers.

Use docs/VERIFICATION_GUIDE.md to select checks affected by the change. Build
includes content validation. Record command, scope, result and relevant inputs
for completed checks. After success, repeat only when affected code, data, assets,
tests, configuration or environment changes, or an unresolved failure requires
investigation. Related dependency changes invalidate evidence too. Historical
reports are evidence of their recorded stage, not proof for a changed build.
Required checks and new concerns always take precedence over avoiding repetition.

For visual changes, inspect relevant viewport/state captures. Recompute SVG
screen coordinates after scrolling, resizing or a capture that moves the page.
Check the recorded environment limitations before retrying the same failed
runtime. Fix failures caused by the task; describe unrelated limits accurately.

## Finish and hand off

Update only current documentation affected by the task. Preserve historical
records. Use docs/CURRENT_TASK.md only for work needing a handoff: objective,
scope, files changed, completed checks, remaining steps and unresolved questions.
Give concise updates and a final result with actual verification and material
limitations. No speculative token-saving claims or repeated completed-work lists.
```

The root file should remain a small routing guide. Do not paste this entire
implementation proposal into `AGENTS.md`, duplicate higher-level instructions,
or make every linked document mandatory reading on every task.

## Supporting current-state note

Initial `docs/PROJECT_STATE.md` should contain:

- Last confirmed date and authoritative sources.
- Inventory: 37 entries; 22 approved/student-ready models; 15 unauthored models;
  37 approved recordings, including 27 supplied and 10 retained synthetic files.
- Original pilot group: 12. The latest approved batch is Zal, Zai, Syin, Sad and
  Dad at content revision 2. Student default is **Jom mula → Huruf tersedia**.
- Remaining models: ta-marbuta, tho, za, ain, ghain, nga, fa, pa, qaf, ga, va,
  ha, hamzah, ye and nya. Do not start them without an applicable user request.
- Most recent approval evidence: `output/verification/letter-batch-2-approval.json`;
  build, 59 unit checks and 18 focused Chromium/WebKit cases passed at that stage.
- Environment notes: development address 5173, production preview address 4173;
  verify reachability rather than assuming either server remains running.
  Firefox launch and WebKit WAV caveats remain tied to the tested Windows runtime.
- Next authorised task, if any; otherwise say none. Do not infer authorisation
  from a pending-work list.

Refresh this note when those facts change. Link approval and acceptance records
for detail. Avoid copies of full tables, logs, screenshot lists or entire plans.

## Verification guide and reuse rules

Propose the following change-to-check table. These are minimum selection cues,
not a reason to skip checks required by another applicable instruction.

| Change | Relevant verification |
| --- | --- |
| Documentation/instructions only | Review scope, links, paths and contradictions; no application build or browser run |
| Approval metadata only | Content/unit checks and checked build once; compare changed entries to a pre-change snapshot; focused student access, saved revision/status and affected-letter completion checks |
| New or revised letter geometry | Unit/content checks and build; affected models in supported modes; every movement/dot, numbering, navigation and relevant phone/tablet stages; retain content review gate |
| Tracing matcher, input or tolerances | Unit tests plus affected play/strict, cancellation/recovery, shortcut/reverse/dot and touch cases; broaden when shared behaviour changes |
| Number guides, layout or decoration | Relevant guide/layout cases, representative phone/tablet/desktop captures, overlap and overflow checks; include complex models affected by the layout |
| Recording files or playback | Manifest/transcript/revision and affected-file hashes; supported playback/replay/failure checks; readiness if statuses change |
| Storage, export or navigation | Relevant persistence, corruption/quota/reset, export or route cases; student/preview separation where affected |
| Dependencies, build configuration or broad refactor | Build and broader relevant regression suite; reconsider recorded runtime limitations |

Avoid running a separate `npm run check:content` immediately before a build that
will validate the same unchanged inputs. Run it alone when early validation is
useful or no build is needed. The inexpensive unit suite may be run once for an
application/content change; avoid rerunning it after an unrelated documentation edit.

Select existing browser cases by file and test name, normally with at most two
workers on this host. Keep native CDP-touch checks Chromium-specific. Use a
supported runtime to prove successful codec playback; an unsupported-codec message
proves error handling only.

Existing batch/snapshot verification scripts are stage-specific. The current
second-batch approval script is appropriate for the matching catalogue stage,
but can become stale after another batch. Inspect its preconditions before use.
Do not edit history or restore old catalogue states merely to make an old script
pass. Use current behavioural tests and create targeted new evidence when needed.

Evidence reuse requires the same tested implementation and relevant inputs.
A command name, green screenshot or elapsed date alone is not enough. Include
application and test code, content/assets, build settings, lockfile/runtime and
viewport/input configuration as applicable. Use the current session's known
unchanged state, or a trustworthy recorded fingerprint, to support reuse.
When freshness cannot be established, rerun the relevant checks. Changes in
shared modules can invalidate apparently unrelated tests.

Record compactly in the current task or final report:

```text
Check: command or named browser selection
Scope: behaviour, browsers, viewport/input and dev/production build
Result: passed/failed/skipped, totals and evidence path if needed
Inputs: relevant files/build/runtime; fingerprint when available
Repeat trigger: affected inputs changed or unresolved concern
```

This is a lightweight record, not a new cache service. Existing passed runs should
not be repeated merely to collect additional screenshots or a second summary.
Take another capture when it resolves a real visual question or documents a change.

## Optional later improvements

These are outside the first implementation and need a separate applicable request:

1. Add a shared browser catalogue helper to derive available/unavailable counts
   from `validateCatalogue`. Keep independent tests for expected review gates,
   original pilot membership and newly approved batch scope so the helper cannot
   turn an incorrect approval into a passing test. Do not remove meaningful assertions.
2. Consolidate duplicated batch-opening helpers where their behaviours really match.
   Preserve explicit distinctions between student play and adult practice.
3. If batch authoring remains frequent, introduce one narrowly scoped skill at
   `.agents/skills/jawi-letter-batch/SKILL.md`, with `name` and a short description
   limited to adding or approving tracing batches. Point it to the existing content
   and verification guides; do not reproduce `AGENTS.md` or trigger it for general
   UI, audio or documentation tasks. Verify host discovery before relying on it.

A generic root `SKILLS.md` is not the documented skill package format. The first
implementation can satisfy this request with `AGENTS.md` and supporting notes
without adding any skill metadata or global configuration.

## Implementation sequence after authorisation

1. Confirm the latest request and whether proposed target files now exist. Merge
   useful existing guidance; do not overwrite newer instructions blindly.
2. Create the concise root `AGENTS.md` using the proposed contract.
3. Create `PROJECT_STATE.md` from the current catalogue, validation and latest
   approval evidence; replace stale planning-time counts if the app has changed.
4. Create `VERIFICATION_GUIDE.md` with the check-selection table, historical-script
   caveat and evidence-freshness rules. Keep source-specific detail in existing docs.
5. Add a small contributor-guidance link in `README.md`. Create a task checkpoint
   only when required by ongoing work; do not add scripts or optional refactors.
6. Review the new guidance for consistency, size, correct paths and duplicate rules.
   Confirm content, recordings, application source and configuration are unchanged.
7. Report the created files and how future tasks should use them. A fresh session
   may be used to check instruction discovery; if this host needs it, explicitly
   read the project file until discovery is confirmed. Do not claim activation
   solely because the Markdown file exists.

## Acceptance criteria

- Only the four planned guidance/documentation files are added or updated in the
  first implementation; optional checkpoint creation has a stated reason.
- `AGENTS.md` is concise and routes readers to relevant documents on demand.
- Current inventory appears once in the state note and matches authoritative data.
- The workflow respects plan-only requests, existing authorisation and real approval
  scope. It adds no blanket confirmation gate.
- Successful checks have a clear reuse rule and invalidation rule. Historical
  reports never substitute for required verification of changed behaviour.
- Known environment failures are revisited when the environment changes or the
  request requires them, rather than retried repeatedly without a reason.
- App behaviour, letter models, versions, approvals, audio and build/test setup
  remain unchanged. Review-only verification is sufficient for this documentation work.
- No guaranteed token saving is claimed. Available before/after measurements may
  compare redundant reads, duplicate commands and unnecessary output for similar tasks.

## Super prompt for the later implementation

```text
Implement docs/AGENT_EFFICIENCY_IMPLEMENTATION.md in this workspace.

Create a concise project AGENTS.md, docs/PROJECT_STATE.md and
docs/VERIFICATION_GUIDE.md, and add a short contributor link in README.md.
Confirm current source facts before writing the state note. Merge existing target
files if they were added after the proposal. Treat current user/system instructions
as authoritative and do not add redundant approval gates.

Keep permanent instructions small, read supporting documents only when relevant,
reuse existing helpers and valid verification evidence, and stop repeating checks
when their relevant inputs are unchanged and no unresolved concern remains.
Preserve required testing, meaningful regression coverage and revision-matching
teaching-content approvals. Record environment limitations accurately.

Do not implement the optional refactors or skill, add caching tools, change global
Codex settings, alter the app/content/audio, or deploy anything. Create a short
CURRENT_TASK.md only if a long-running or interrupted task needs a checkpoint.

Verify this documentation change through targeted review of paths, links, scope,
size and consistency. Do not run application builds or browser suites for an
instructions-only change. Finish with the actual files and concise validation.
```

## Official guidance consulted

Project instructions belong in `AGENTS.md`; official guidance describes instruction
discovery and verification. See
[Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

Skills have scoped metadata and load their full instructions when selected. This
supports keeping optional specialised workflows separate from permanent project
rules. See [Build skills](https://learn.chatgpt.com/docs/build-skills).

The recommendation to read relevant references on demand and remove redundant
instruction detail follows
[Rethinking skills and prompts](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).
The file structure, size targets and verification matrix above are project-specific
proposals, not OpenAI-enforced limits.
