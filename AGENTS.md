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
