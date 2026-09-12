# Mounty Guide — Canonical Reference v1

Reference name: **MOUNTY-GUIDE-V1**

Date consolidated: **2026-09-12**

This file preserves the current functional and technical state of Mounty Guide inside Mountain Family. Future work that references **MOUNTY-GUIDE-V1** must start from this baseline and must not regress to earlier incomplete browser flows.

## Purpose

Mounty Guide is the semi-autonomous AI assistant for Mountain Creativity School. Its role is to reduce teacher/admin friction during the school day by turning short factual context into ready-to-review communications and by guiding routine, evidence, and family communication workflows.

Core operating principle:

**facts/context → Mounty draft → human review/edit → send**

Mounty must never silently auto-send family communications without human review.

## Visible user experience

Mounty Guide is visible from the Mountain Family home experience for admin and teachers.

Primary actions:

- Register routine
- Draft message with Mounty
- Share evidence
- Review pending drafts

Mounty also provides a suggested next routine moment based on the time of day.

## Message drafting

The user provides only context/facts. Mounty prepares:

- title
- complete message body
- language-appropriate wording
- audience-aware wording

Supported message contexts include:

- general information
- breakfast
- lunch
- nap
- hygiene/diaper
- learning activity
- care/status
- reminders
- incidents
- evidence captions

The generated result remains editable before sending.

## Audience targeting

Mounty flows support communication/evidence targeting to:

- entire community
- one cycle
- one grade/classroom
- selected students
- individual student where the underlying flow is student-specific

Admin has institution-wide reach.

Teachers are restricted to their assigned classrooms/students through `mf_classroom_staff`.

## Routine integration

Routine registration supports classroom-level bulk entry while preserving individual student status.

Routine moments include:

- breakfast
- lunch
- nap
- hygiene
- learning
- care/status

For each selected student, the system stores factual events and can queue Mounty jobs that create personalized family drafts.

The goal is to avoid teachers manually rewriting the same routine update for every child.

## AI safety rules

Mounty must use only provided/stored facts.

It must not invent:

- diagnoses
- quantities not provided
- conduct not provided
- emotions not provided
- incidents not provided
- achievements not supported by context
- recommendations not requested/supported by facts
- extra requests to families that were not present in the context

Health/incident wording should remain factual and non-diagnostic.

All generated family messages require human review.

## Family language support

Mounty can use the student's/family's preferred language where available.

The agent and compose flows currently support language-aware output, including Spanish and English test scenarios.

## Evidence and files

Mounty Guide includes `Compartir evidencia`.

Evidence can be associated with:

- a student
- selected students
- a grade/classroom
- a cycle
- the whole community, according to role permissions

Allowed file families in the current implementation include:

- JPEG/JPG
- PNG
- WebP
- HEIC/HEIF
- MP4
- MOV/QuickTime
- WebM
- MP3/M4A/WAV
- PDF
- DOCX
- XLSX
- PPTX
- TXT
- CSV

Dangerous/executable/archive/macro-enabled legacy types remain blocked by the backend validator.

Media size limit is currently up to 100 MB for image/video/audio media and 50 MB for documents in `mountain-media`.

## Private media and expiry

Files are stored in private Supabase Storage buckets and accessed through signed URLs.

Daily media is transitory by default.

Current standard:

- approximately 24-hour expiry for routine multimedia
- expired media should no longer be readable
- cleanup flow removes expired storage objects and marks records expired/deleted

This design reduces long-term storage growth for daily family evidence.

## Core Edge Functions

Mounty Guide currently relies on these browser-facing functions:

1. `mounty-compose`
   - creates title/body from short context
   - admin/teacher only
   - requires authenticated session
   - always returns content for human review

2. `mounty-agent`
   - processes queued agent jobs generated from routines/events
   - creates personalized drafts
   - teacher scope restricted by assigned classrooms

3. `mounty-review`
   - approve
   - approve and send
   - reject
   - enforces teacher classroom scope
   - can create/use family conversation and send approved text

4. `mountain-media`
   - prepare signed upload
   - finalize/read signed files
   - media expiry
   - cleanup
   - role/audience checks

5. `mountain-thread`
   - creates/returns conversation for a student/channel
   - includes family, assigned teachers, and admins as appropriate
   - supports multiple teachers per classroom

## iPhone/Safari CORS issue found and fixed

A production testing issue was discovered on iPhone Safari:

`Failed to send a request to the Edge Function`

The AI/backend itself was functioning, but several Edge Functions lacked browser preflight (`OPTIONS`) support and CORS response headers.

The defect first appeared in:

- `mounty-compose`
- `mountain-media`

After recognizing the pattern, the rest of the Mounty browser functions were audited and the same issue was found in:

- `mounty-agent`
- `mounty-review`
- `mountain-thread`

All five functions were normalized to support browser/Safari invocation from:

`https://gadolfo49.github.io`

The standard browser contract now includes:

- `OPTIONS` response
- HTTP 204 preflight response
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- allowed headers including `authorization`, `apikey`, `content-type`, and `x-client-info`
- authenticated POST flow where applicable
- origin validation

## Current Edge Function versions after CORS normalization

At this reference point:

- `mounty-compose` — version 3
- `mountain-media` — version 6
- `mounty-agent` — version 5
- `mounty-review` — version 4
- `mountain-thread` — version 3

These version numbers document the current known-good browser-compatible backend state.

## QA history

Mounty received 5 real AI scenario tests as part of the prior 50-test QA battery.

Scenarios included:

- general communication
- breakfast
- incident
- reminder
- learning message in English

An earlier defect caused responses to be empty/truncated because the model used too much output budget for reasoning. This was corrected by reducing reasoning effort for this short-form use case and increasing output allowance.

After correction:

**5/5 Mounty AI scenarios passed.**

## Browser QA protection added

The live smoke test now includes CORS/preflight checks for every principal browser-facing Mounty Guide function:

- `mounty-compose`
- `mountain-media`
- `mounty-agent`
- `mounty-review`
- `mountain-thread`

The test requires the browser preflight to return:

- HTTP 204
- allowed origin for GitHub Pages
- POST/OPTIONS methods
- authorization header permission

This prevents a future deployment from silently reintroducing the same Safari/iPhone failure.

## Multi-teacher classroom model

Mounty Guide must use the multi-teacher assignment model:

`mf_classroom_staff`

No future Mounty code should revert to the old single `teacher_id` assumption.

A classroom may have multiple active teachers.

## Human review workflow

Agent-generated drafts are stored in `mf_agent_drafts` and remain in draft/review state until a human acts.

Review actions:

- approve
- approve and send
- reject

When approved and sent, the system can deliver the message through the student's authorized conversation thread.

## Conversations

Conversation channels include:

- teacher/family
- administration/family
- health/family
- billing/family where applicable

The current thread logic includes:

- linked guardians
- all active assigned teachers for the classroom
- active administrators

Access remains role- and student-scoped.

## Current reference relationship

Mountain Family release baseline:

**MF19-FINAL-QA115**

Mounty-specific baseline:

**MOUNTY-GUIDE-V1**

When future work says:

`Retoma MOUNTY-GUIDE-V1`

it means preserve all behavior and fixes in this document, including the browser CORS contract and human-review requirement.

## Non-regression rules

A future Mounty change is not considered an improvement if it removes or breaks any of the following without an explicit product decision:

- short-context AI drafting
- editable draft before sending
- human review requirement
- routine integration
- personalized student drafts
- audience segmentation
- evidence upload
- private signed media
- 24-hour transient media option
- multi-teacher classroom support
- role-scoped permissions
- family-language support
- browser/Safari CORS compatibility
- automatic QA preflight checks

This file is the canonical Mounty Guide reference after the September 12, 2026 browser compatibility fixes.