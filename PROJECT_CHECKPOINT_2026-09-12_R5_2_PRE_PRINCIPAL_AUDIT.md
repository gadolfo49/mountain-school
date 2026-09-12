# Mountain Family — Complete Pre-Principal-Audit Checkpoint

Date: 2026-09-12
Checkpoint name: **MF-R5.2-PRE-PRINCIPAL-AUDIT**
Production URL: https://gadolfo49.github.io/mountain-school/
Repository: `gadolfo49/mountain-school`

This document freezes the accumulated state of Mountain Family immediately before executing the next Autonomous Principal Systems Architect / Senior QA Lead protocol. It is intended as the canonical recovery reference if a future refactor introduces regressions.

## 1. Product identity and separation

Mountain Family is the academic/family monitoring and communication application for Mountain Creativity School.

It is **not** the transportation application. The transportation system remains a separate project and must not be merged into Mountain Family accidentally.

## 2. Roles and access

Supported roles:

- Administrator
- Teacher / Maestra
- Family

Backend support roles may exist where already modeled, but the primary product UX remains organized around the three roles above.

### Administrator

- Admin access remains based on the official `mountain-admin-pin` flow.
- Operational PIN: **7405**.
- The PIN is not stored in frontend plaintext.
- Admin session is established through Supabase Auth.
- Main administrator account is protected against accidental deactivation/removal through UI rules.

### Family

- Password login supported.
- Family self-registration remains available through `mountain-register-cors`.
- Family access is limited to linked students.

### Teacher

- Password login supported.
- Active teacher profile required.
- Teacher access is limited by `mf_classroom_staff` to assigned classrooms/students.
- The architecture supports multiple teachers per classroom.

## 3. Six Mountain early-childhood levels

The application must preserve exactly these six operational levels unless there is an explicit future migration:

1. Maternal
2. Infantes
3. Párvulos
4. Pre-Kínder
5. Kínder
6. Preprimario

## 4. Daily routine model

Mountain Family currently models the institutional daily routine including:

- Preparación
- Recepción
- Desayuno
- Inicio formal
- Círculo
- Actividad pedagógica
- Higiene
- Recreo
- Grupos
- Rotación
- Evaluación
- Almuerzo
- Descanso/Siesta
- Merienda
- Talleres
- Juego y salida

Bulk routine operations are intended to support classroom-level registration while allowing deselection of absent/not-yet-arrived students and preserving individualized student records/messages.

## 5. Communication audience model — protected R5.2 rule

A regression was discovered where a legacy `mountyCompose` path exposed only a single-student selector while the modern Mounty flow already supported broader audiences.

That regression was identified and corrected by unifying all communication entry points around the same audience model.

### Administrator audience options

Every institutional communication/Mounty/evidence flow must support:

1. **Toda la comunidad** (`all_families`)
2. **Un ciclo** (`cycle`)
3. **Un grado** (`classroom`)
4. **Un estudiante** (`single_student` in UI, normalized internally to `selected_students` with one id)
5. **Estudiantes seleccionados** (`selected_students`)

### Teacher audience options

Teachers may use:

- Un grado
- Un estudiante
- Estudiantes seleccionados

but only within their assigned classrooms/students.

Community-wide and cycle-wide communication remain admin-level institutional capabilities unless explicitly changed later.

### Unified entry points

The following dashboard/product entry points must route through the same modern audience flow:

- Crear con Mounty
- Difusión
- Archivo / foto / evidencia
- Mounty Guide → Redactar mensaje
- Mounty Guide → Compartir evidencia

The legacy student-only `mountyCompose` UI must not be reachable from production navigation.

## 6. Mounty Guide — current protected architecture

Mounty is the AI-assisted operational guide for Mountain Family.

Core principle:

**facts/context → Mounty draft → human review/edit → send**

AI-generated content must never silently auto-send without human review.

### Current Mounty Edge Function versions

- `mounty-compose` — version 5
- `mounty-agent` — version 8
- `mounty-review` — version 6
- `mountain-thread` — version 4
- `mountain-media` — version 8

### Mounty reliability rules

Mounty currently includes:

- strict context-only grounding
- no invented diagnoses
- no invented quantities
- no invented behavior
- no invented emotions
- no invented achievements
- no invented recommendations or family obligations
- no invented clothing/material requests
- short context should produce short grounded output
- human review always required

The explicit regression example that must remain prevented:

Context: `Viernes, día de colores rojo`

Allowed: a concise rewrite explaining that Friday is the red color day.

Not allowed: inventing a request to send red clothing, accessories or materials unless the user supplied that instruction.

### Reliability and retry layer

`mounty-compose` and `mounty-agent` were hardened after real iPhone failures.

The system now includes:

- controlled retry for transient provider failures such as 429/500/502/503/504
- bounded timeouts
- structured error bodies
- `request_id` references for traceability
- no storage of message content in technical telemetry
- frontend parsing of Edge Function error bodies
- one session refresh attempt for expired/401 sessions where appropriate
- user-friendly errors instead of raw `Edge Function returned a non-2xx status code`

### Safari/CORS protection

Browser preflight/CORS support was standardized for:

- `mounty-compose`
- `mountain-media`
- `mounty-agent`
- `mounty-review`
- `mountain-thread`

The live smoke test verifies preflight behavior.

## 7. Shared frontend runtime

`runtime-v2.js` is the shared Mountain runtime.

It centralizes:

- one Supabase client/session runtime
- profile cache
- auth-change coordination
- role helpers
- MIME inference
- user-friendly error conversion
- parsing of Edge Function response bodies
- function invocation and retry behavior

Supabase JS is pinned to an exact known version rather than a floating major dependency.

## 8. Authentication legacy removal

Production must not load/use:

- `auth-v5.js`
- `mountain-admin-simple`
- old `mountain-register`
- temporary QA endpoints

Retired Edge Functions already respond `410 Gone` where kept for safety/history:

- `mountain-admin-simple`
- `mountain-register`
- `mounty-qa-temp`
- `final-role-qa-temp`

Official current flows are:

- admin: `mountain-admin-pin`
- family registration: `mountain-register-cors`
- family/staff login: `access-v6.js`

## 9. Messaging and conversations

Mountain Family supports:

- institutional broadcasts
- family ↔ teacher/admin conversations
- role-scoped conversation membership
- notifications for incoming conversation messages
- broadcast recipient tracking
- delivered/read semantics where modeled

`mountain-thread` supports multiple teachers assigned to the same classroom.

## 10. Notifications

The notification system includes:

- notification center
- read/unread state
- preferences
- cleanup of polling/listeners on logout/session change
- notifications from broadcast/message events

The current implementation is strong for in-app/browser-active notifications.

True background Web Push for a completely closed iPhone PWA should not be claimed unless separately implemented and tested with PushManager/service-worker push handling.

## 11. Multimedia and evidence

Private file handling uses `mountain-media` and signed URLs.

Important file lifecycle:

**prepare → quarantined → upload → verify/finalize → accepted**

This prevents records from being considered valid before Storage confirms the object exists.

Supported file families include image, video, audio, PDF, DOCX, XLSX, PPTX, TXT and CSV types allowed by the backend validator.

Unsafe executable/archive/macro-enabled types remain blocked.

Routine multimedia may be transient with approximately 24-hour expiry.

Upload failure paths include cleanup/cancel behavior to avoid orphaned objects/records.

## 12. Documents

A prior defect was discovered where Documents created only metadata and offered no physical file upload.

This was corrected.

Current document requirements:

- physical file selector
- private upload to `mountain-family-documents`
- `mf_documents.storage_path` linkage
- signed temporary opening
- family access only when visible/authorized
- rollback/cancel if document flow fails
- Safari-safe opening behavior

## 13. Safari/iPhone resilience

Known Safari issues found and corrected include:

- raw `TypeError: Load failed`
- blocked `window.open` after async waits
- raw Supabase Edge Function non-2xx messages
- CORS/preflight failures
- stale PWA code after service-worker cache changes

The product now includes:

- network guard
- user-friendly connectivity messages
- pre-opened tab strategy for signed-file flows
- versioned service-worker cache
- no-store/network-first navigation behavior

## 14. Security hardening already completed

Important forensic corrections include:

- removal of destructive SQL privileges such as TRUNCATE from normal app roles
- RLS recursion corrections
- security-definer access helpers to avoid recursive policies
- family→teacher residual-access issue corrected by role-aware student access helper
- lesson activity scope inherited from parent lesson plan/classroom
- teacher direct draft mutation paths restricted
- broadcast mutation policies tightened
- old Storage policies on unused legacy buckets removed
- public registration rate-limited without adding CAPTCHA friction
- private buckets accessed through signed URLs
- attachment quarantining/finalization
- idempotent Mounty review/send path
- duplicate agent job/draft prevention
- duplicate chat/broadcast notification mechanisms removed where discovered

## 15. Data integrity and concurrency

Forensic R5 hardening addressed:

- duplicate Mounty jobs
- duplicate drafts
- double approval/send
- partial classroom assignment updates
- upload records accepted before object existence
- duplicate indexes
- timer/listener leaks
- MutationObserver feedback loop risk

Classroom assignment was moved toward an atomic operation rather than multiple independent writes.

## 16. Academic/CRECE modules

Mountain Family includes planning, observation and developmental/academic domains such as:

- Lenguaje
- Cognición
- Socioemocional
- Psicomotricidad fina
- Psicomotricidad gruesa
- Matemáticas
- Lectoescritura
- Inglés
- Creatividad
- Autonomía

CRECE pillars remain:

- Creatividad
- Ritmo
- Exploración
- Conexión
- Equilibrio

## 17. Administration modules

Visible admin functions include or are intended to include fully operational flows for:

- users and access
- students
- classroom assignments
- attendance/check-in-out
- routines
- communications
- Mounty
- incidents
- evidence/files
- search
- authorized pickups
- documents
- payments
- safety
- planning/academic records
- notifications

Visible modules must not be left as decorative placeholders.

## 18. Current release regression guard

`RELEASE_GUARD.json` defines protected product invariants, including:

- transportation app separation
- six grades
- auth entrypoints
- Mounty function versions
- human review requirement
- strict grounding
- retry behavior
- structured error references
- unified communication audiences
- forbidden legacy frontend dependencies
- retired endpoints

Future changes should update the guard only deliberately and with corresponding regression tests.

## 19. QA/regression strategy accumulated so far

The project has evolved from early 50-test Mounty/data QA through 115, 128 and later forensic contract suites.

The current approach prioritizes contract tests over artificial test-count targets.

Protected contracts include:

- JavaScript parsing
- exact dependency pinning
- runtime order
- no legacy auth
- six grades
- routine moments
- role-scoped classroom access
- document physical upload
- signed document read
- Mounty centralized function invocation
- transient AI retry behavior
- request reference display
- recipient preview before publication
- zero-recipient guard
- media prepare/finalize/cancel
- draft rollback
- human review
- all communication audience options
- legacy `mountyCompose` path interception
- notification timer cleanup
- Safari signed-file opening
- PWA/service-worker contracts
- CORS live checks against Mounty-related Edge Functions

## 20. Protected product rule after the R5.2 regression

No future improvement is valid if it silently removes a previously available recipient scope.

All communication/evidence features must use the unified audience model where relevant.

Any new communication entry point must either:

1. reuse the existing Mounty audience selector, or
2. explicitly document why its scope is intentionally narrower.

A hidden legacy form must never override the modern selector.

## 21. Known external hardening item

Supabase Auth previously reported Leaked Password Protection disabled. This is an external project setting and should be enabled before broad public registration if it remains disabled.

## 22. Store-readiness caveat before the next protocol

Mountain Family is currently a web/PWA application deployed through GitHub Pages and Supabase.

The next requested protocol references App Store Review Guidelines and Google Play policies. Those standards may require distinctions between:

- PWA readiness
- installable wrapper/native shell readiness
- actual App Store / Play Store binary submission readiness

The next audit must not claim native-store certification unless native packaging, entitlements, permission manifests, privacy declarations and actual store-specific requirements are present and tested.

## 23. Do-not-regress list

Before any strong refactor, preserve at minimum:

- PIN 7405 admin access
- working Supabase session auth
- family registration
- six grades
- multi-teacher classroom support
- teacher classroom scope
- family student-link scope
- unified five-level admin communication audiences
- teacher scoped audience model
- Mounty human review
- Mounty strict grounding
- Mounty retries and request references
- private multimedia/documents
- signed reads
- upload finalize/cancel lifecycle
- document physical upload
- notifications/preferences
- Safari resilience
- service-worker versioning
- transportation separation
- regression guard
- automated QA before release

## 24. Recovery instruction

If a future audit/refactor causes regressions, this checkpoint should be used with the associated snapshot branch created immediately after this file was committed.

Reference phrase:

**Restore MF-R5.2-PRE-PRINCIPAL-AUDIT**

The next Autonomous Principal Systems Architect / Senior QA Lead protocol must begin only after this checkpoint is committed and snapshot from that exact commit.