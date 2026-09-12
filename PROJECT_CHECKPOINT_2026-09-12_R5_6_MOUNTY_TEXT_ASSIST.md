# Mountain Family — R5.6 Mounty Text Assist checkpoint

Release: **MF-R5.6-MOUNTY-TEXT-ASSIST-20260912**
Validated production commit: `41f21caa9439157f8413348496b68d177f0a6b30`
Production URL: https://gadolfo49.github.io/mountain-school/

## Why this checkpoint exists

A real iPhone test of **Compartir evidencia** showed the message `No hay familias activas vinculadas a esos destinatarios.` after the administrator supplied short context for Mounty. The AI request itself was not necessarily failing. The defect was architectural: the evidence flow tied text drafting and recipient validation/publishing into one operation. With zero linked family recipients, the flow aborted before exposing Mounty's useful draft, making it look as though the agent did nothing.

R5.6 separates **drafting** from **delivery** and generalizes Mounty assistance across narrative staff forms.

## Mounty backend

`mounty-compose` is now version **6**.

Supported purpose modes:
- `family_message`
- `observation`
- `planning`
- `incident`
- `internal_note`

Each purpose uses its own instruction while retaining strict grounding: Mounty can improve wording, organization, clarity and tone, but cannot invent facts, causes, diagnoses, achievements, materials, obligations, recommendations or actions not supplied in context.

Transient provider errors continue to use controlled retry behavior and request references.

## Mounty Text Assist

New production module: `mounty-assist-v1.js`.

For Administrator and Teacher accounts it adds **✨ Ayudar con Mounty** inside supported narrative forms instead of requiring users to leave the form and open a separate AI module.

Explicit integrations include:
- CRECE objective observation (`oaNote`)
- next-goal text (`oaGoal`)
- academic planning narrative/theme (`lpTheme`)
- incident narrative fields detected by their incident context
- family-facing message/comment/reminder text detected in operational forms

The integration intentionally excludes structured or sensitive fields such as:
- passwords
- email/name identity fields
- payment amounts/references
- authorized-pickup identification
- allergies and food restrictions
- other non-narrative structured data

Planning title (`lpTitle`) is intentionally not AI-expanded as a narrative body.

## Evidence flow: two independent phases

Evidence now follows:

1. Choose audience if desired.
2. Choose/prepare the file.
3. Enter facts or keywords.
4. Select **✨ Preparar texto con Mounty**.
5. Mounty generates an editable title and message even if there are currently **0 linked family recipients**.
6. Recipient preview runs separately.
7. If recipient count is zero, the interface explains that drafting is still available but **Compartir ahora** remains disabled.
8. Once at least one valid recipient exists, **Compartir ahora** becomes available.
9. Human review remains mandatory before sending.

This directly fixes the iPhone case that exposed the defect.

## Audience model preserved

Administrator:
- whole community
- cycle
- grade/classroom
- one student
- selected students

Teacher:
- assigned grade/classroom
- one assigned student
- selected assigned students

One-student delivery continues to normalize safely to the existing `selected_students` backend model.

## Unified evidence routing

All evidence entry points now resolve to the R5.6 two-step flow:
- dashboard `Archivo / foto`
- Mounty Guide `Compartir evidencia`
- final-flow media interception

`final-flow-v1.js` prefers `window.MountyAssist.evidence` and only falls back to the older Guide handler if the assist layer is unavailable.

## PWA/versioning

Shell marker:
`MF-R5.6-MOUNTY-TEXT-ASSIST-20260912`

Service worker cache:
`mountain-family-shell-r5-6-mounty-text-assist-20260912`

`mounty-assist-v1.js` is part of the CORE PWA cache.

## Release guard

`RELEASE_GUARD.json` now protects:
- `mounty-compose` version 6
- narrative-form text assistance
- evidence drafting independent of recipient availability
- supported Mounty purpose modes
- zero recipients block **sharing**, not **drafting**
- no Mounty assistance on structured sensitive fields
- human review requirement
- five audience levels
- managed family/teacher account model
- prior security, privacy, accessibility and PWA invariants

## QA added

Regression contracts now explicitly assert:
- R5.6 release marker
- Mounty Assist load order
- Assist parses correctly
- observation/planning/incident/family-message purpose support
- planning title is not treated as narrative body
- sensitive field exclusions
- evidence has separate `Preparar texto con Mounty` and `Compartir ahora` stages
- evidence can draft before recipient validation
- zero recipients disable share only
- both evidence entry paths are intercepted
- Service Worker caches the Assist module
- live CORS still succeeds for all critical Edge Functions

## Final validation

GitHub Actions run `34702542262`, job `103576741405`:
- integration/security/accessibility/audience/Mounty text-assist contracts: **SUCCESS**
- GitHub Pages wait/deployment: **SUCCESS**
- R5.6 live browser smoke: **SUCCESS**
- complete job: **SUCCESS**

This snapshot is the non-regression recovery point for all Mounty text-assistance behavior established through R5.6.