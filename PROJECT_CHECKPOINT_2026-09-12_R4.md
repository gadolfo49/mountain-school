# Mountain Family — Project Checkpoint

Date: 2026-09-12
Repository: gadolfo49/mountain-school
Production: https://gadolfo49.github.io/mountain-school/
Current shell: MF-FINAL-20260912-R4

## Purpose
Mountain Family is the academic/family monitoring and communication application for Mountain Creativity School. It is separate from the transportation application. Its purpose is to centralize daily child routine, family-school communication, academic development, documents, payments, authorized pickups, attendance, incidents, safety and Mounty-assisted workflows.

## Non-negotiable project rules
- Do not mix Mountain Family with the separate transportation app.
- Administrator access must continue working with PIN 7405.
- Family self-registration remains available.
- Roles: admin, teacher, family, plus backend support roles health and office where already modeled.
- Administrator must be able to manage users, data, students, classrooms, documents, payments, authorized pickups, safety and communications.
- Teacher experience must be scoped to assigned classrooms/students.
- Visible features must be functional rather than decorative placeholders.
- iPhone/Safari usability is a first-class requirement.
- Daily family communication should support school-wide, cycle, grade/classroom and selected-student targeting.
- Multimedia/evidence must support real mobile file selection and secure storage.

## Six grades currently defined
The production app and database use six active Mountain Family classroom levels:
1. Maternal
2. Infantes
3. Párvulos
4. Pre-Kínder
5. Kínder
6. Preprimario

Database table `mf_classrooms` currently has 6 rows. App core `app-v3.js` defines the same six-grade array.

## Institutional routine already modeled
- 6:20–6:30 Preparación
- 6:30–8:00 Recepción
- 8:00–8:20 Desayuno
- 8:30–8:50 Inicio formal
- 8:50–9:20 Círculo
- 9:20–9:55 Actividad pedagógica
- 9:55–10:00 Higiene
- 10:00–10:15 Recreo
- 10:15–10:50 Grupos
- 10:50–11:30 Rotación
- 11:30–11:50 Evaluación
- 11:50–12:00 Higiene
- 12:00–12:30 Almuerzo
- 12:30–2:30 Descanso
- 2:30–3:00 Higiene
- 3:00–3:30 Merienda
- 3:30–5:00 Talleres
- 5:00–6:00 Juego y salida

## Current production architecture
Important frontend files:
- index.html
- app-v3.js
- styles-v2.css
- admin-gate.js
- access-v6.js
- admin-users-v1.js
- admin-data-v1.js
- admin-documents-v1.js
- family-documents-v1.js
- network-guard-v1.js
- school-admin-v1.js
- academic-v2.js
- mounty-guide-v1.js
- teacher-experience-v1.js
- notifications-v1.js
- final-flow-v1.js
- manifest.webmanifest
- sw.js

## Authentication state
Administrator login is working in production.

Admin profile:
- Full name: Dr. Gustavo Adolfo Montaño Medina
- Role: admin
- Active: true

Administrator PIN: 7405

Admin login flow uses `admin-gate.js` and Supabase Edge Function `mountain-admin-pin`, which returns a magic-link token hash that is verified through Supabase Auth. Do not regress this flow.

Family/teacher production auth is handled by `access-v6.js`, including password sign-in and family registration endpoint integration. Legacy `auth-v5.js` has been removed from the production shell and service-worker cache.

## Supabase project
Project id: kbtjkjdjvkorekzzhxcx
Project URL: https://kbtjkjdjvkorekzzhxcx.supabase.co

Important Mountain Family tables include:
- mf_profiles
- mf_classrooms
- mf_students
- mf_guardians
- mf_student_guardians
- mf_authorized_pickups
- mf_attendance
- mf_daily_events
- mf_messages
- mf_incidents
- mf_care_plans
- mf_payments
- mf_observations
- mf_documents
- mf_document_signatures
- mf_curriculum_competencies
- mf_lesson_plans
- mf_lesson_activities
- mf_notifications
- mf_notification_preferences
- mf_conversations
- mf_conversation_members
- mf_chat_messages
- mf_message_reads
- mf_announcements
- mf_announcement_ack
- mf_agent_rules
- mf_agent_jobs
- mf_agent_drafts
- mf_agent_activity_log
- mf_agent_settings
- mf_attachments
- mf_broadcasts
- mf_broadcast_students
- mf_broadcast_recipients
- mf_classroom_staff
- mf_safety_events
- mf_safety_student_status

## Broadcast and communication model
`mf_broadcasts` supports:
- all_families
- cycle
- classroom
- selected_students

`mf_broadcast_students` stores selected-student targeting.
`mf_broadcast_recipients` stores per-recipient delivery/read tracking.

Mounty Guide production UI already exposes:
- Toda la comunidad
- Un ciclo
- Un grado
- Estudiantes seleccionados

Mounty can prepare human-reviewed communication drafts before publishing. Human review remains required by design for outbound AI-generated communication.

## Multimedia and evidence
`mountain-media` Edge Function is active. At this checkpoint it is version 7.

Supported media/document types include:
- JPEG, PNG, WebP, HEIC/HEIF
- MP4, MOV, WebM
- supported audio formats
- PDF
- DOCX
- XLSX
- PPTX
- TXT
- CSV

Unsafe/executable extensions are rejected.

Daily multimedia can be transient with approximately 24-hour expiration. Attachments use signed upload/read URLs and access checks based on role/student/broadcast scope.

## Documents — R4 correction
User correctly detected that the previous Documents screen only created metadata and did not upload the physical file.

R4 fixes implemented:
- `admin-documents-v1.js` now includes real `<input type="file">` selection.
- Document file is uploaded through `mountain-media` using action `prepare_document_upload`.
- File is stored privately in bucket `mountain-family-documents`.
- `mf_documents.storage_path` stores the actual object path.
- Saving a document now requires selecting the physical file.
- Admin document list shows `Abrir archivo` when a storage path exists.
- Opening uses `signed_document_read`, producing a short-lived signed URL.
- Family-side document access is implemented in `family-documents-v1.js`.
- A family can only open a document when it is visible to family and authorization/student linkage permits it.
- Teacher document access is scoped through classroom assignment.

Relevant backend action names:
- prepare_document_upload
- signed_document_read
- prepare_upload
- finalize_upload
- signed_read
- cleanup_expired

## Safari/iPhone network error correction
User observed raw Safari error `TypeError: Load failed` while using the dashboard.

R4 response:
- `network-guard-v1.js` was added.
- Raw network errors such as `Load failed`, `Failed to fetch`, `NetworkError` and similar are translated into a user-facing message such as: `La conexión se interrumpió por un momento. Intenta nuevamente.`
- Global `error` and `unhandledrejection` handling prevents raw Safari network failures from being surfaced directly to the user where possible.
- `admin-documents-v1.js` also translates network failures locally.
- The service-worker cache was bumped to `mountain-family-shell-final-20260912-r4` so iPhone/Safari will not remain on the previous code.

## Admin dashboard / modules already present
Admin home includes operational access to:
- Rutina por aula
- Entrada / salida
- Difusión
- Crear con Mounty
- Revisar Mounty
- Incidente
- Archivo / foto
- Buscar
- Autorizados
- Documentos
- Pagos
- Seguridad

Bottom navigation:
- Inicio
- Jornada
- CRECE
- Comunicación
- Más

## CRECE / academic model
CRECE pillars:
- Creatividad
- Ritmo
- Exploración
- Conexión
- Equilibrio

Current academic-development domains include or are being represented through the academic module:
- Lenguaje
- Cognición
- Socioemocional
- Psicomotricidad fina
- Psicomotricidad gruesa
- Matemáticas
- Lectoescritura
- Inglés
- Creatividad

Academic tools include planning, observation and progress history. Database tables already support competencies, lesson plans, lesson activities and observations.

## Teacher experience
`teacher-experience-v1.js` exists and is loaded in production.
Teacher views/actions are intended to be limited to assigned classrooms using `mf_classroom_staff`.
Teacher operational functions include attendance/daily work and Mounty/evidence workflows while payment/admin-only functions are restricted.

## Notifications
`notifications-v1.js` exists and is loaded.
Notification center and preferences are modeled through:
- mf_notifications
- mf_notification_preferences

Preferences include messages, check-in/out, meals, naps, diapers/hygiene, photos/videos, learning, incidents/health, billing and announcements.

## Family experience
Family home is designed around the selected child and includes:
- daily updates
- communications
- grade
- documents
- payments
- authorized pickups
- attendance history
- academic progress
- family-to-Mountain communication

Multiple linked children are supported through child tabs.

## User/admin management
`admin-users-v1.js` provides the administrative user/access layer.
Expected administrative capabilities include:
- invite/create users
- assign roles
- activate/deactivate users
- link family accounts to students
- assign/unassign classrooms for staff

The main administrator account is protected from accidental removal/deactivation by the admin UI contract.

## Current R4 frontend commits immediately related to the latest fixes
- `b68fd319f293c0d000ebeb06a26d7d4739ed9da0` — real document upload and secure open flow
- `5ccbef5f9837e19a528bf2dfa72b2181d6d97d3e` — family document opening module
- `6d50793f956bf097ed073265092e24bbd8aff0c3` — Safari/network guard module
- `93a05019224552da99ee9afc771e3436750eb2f2` — R4 shell/index update
- `d4d602a86d65966be11bbc461aa1fd280e60001e` — R4 service-worker cache
- `7c008c4f4877f86d85ab54e92ac4ddaa6d2c7e2c` — live smoke test expanded for R4 documents/network
- `f28b652460e8e8369a45eb3e2b7e2806ae5cdcb9` — integration QA expanded to 128 checks
- `fdc965bb92c0ec63353e28d0c8f5b0d3b15dbf82` — workflow label updated to 128 checks

Earlier critical admin-login commits:
- `c5d6bdd0517bb00e3ac205dcf4d4b9773531f58d` — admin-gate.js
- `139a400094400d3b2697ef484e38807b7a943bec` — index integration of working admin gate

## QA state at checkpoint
The integration/security contract suite was expanded from 115 to 128 tests.
At the last verified run in this session:
- 128/128 static/integration checks passed.
- The workflow had reached the Pages propagation wait step before running the live public smoke test.
- An earlier red test was only because test #96 still expected cache R3 after shell had correctly moved to R4; that expectation was fixed.

The 128 tests now explicitly cover, among other things:
- script parsing
- admin gate
- family auth/registration contracts
- protected admin account
- six-grade dashboard
- routine moments
- broadcast audiences
- Mounty Guide
- evidence file input
- image/video/HEIC/PDF/DOCX/XLSX/PPTX support
- transient 24h media
- attendance/incidents/safety
- academic domains and CRECE
- payment and pickup creation
- document creation and family visibility
- R4 service worker
- teacher experience
- notification center/preferences
- final flow routing
- real document upload selector
- storage_path usage
- prepare_document_upload
- signed_document_read
- family document viewer
- network guard
- friendly Safari error handling
- R4 cache/module loading

## Security observations already identified
Supabase advisors currently report warnings including:
- Several SECURITY DEFINER RPCs executable by authenticated users; these need deliberate review to confirm intended exposure and/or hardening.
- Leaked-password protection is disabled in Supabase Auth.
- Some performance warnings exist for RLS initialization plans, multiple permissive policies and unused/missing indexes.

These warnings should be addressed as hardening work, but they were not the direct cause of the user's latest two reported UI problems.

## Current important database facts
- `mf_classrooms`: 6 rows.
- `mf_students`: 0 rows at the time of the last table inspection.
- `mf_guardians`: 15 rows.
- `mf_profiles`: 1 row (administrator) at the time of the last inspection.
- `mf_attachments`: 2 rows.
- `mf_broadcasts`: 2 rows.

These counts are a snapshot, not permanent assumptions.

## Latest user-reported defects already addressed
1. Raw `TypeError: Load failed` appeared while scrolling/using dashboard.
   - R4 network guard added; raw network errors should no longer be shown directly.
2. Documents dashboard had metadata but no place to upload the actual document.
   - R4 now includes real private file upload and secure open flow for admin and family.

## Features/user expectations that remain important for the next phase
The user wants the application evaluated and improved comprehensively while preserving all working functionality. Prior expressed expectations include:
- every visible dashboard option must be functional
- full six-grade targeting throughout the app
- communication to entire community, cycle, grade, selected group and individual students
- personalized bulk routine updates (e.g. breakfast sent to all selected present students, individualized by child name/status)
- ability to deselect absent/not-yet-arrived children before bulk updates
- real photo/video camera/gallery flow on iPhone
- robust family-child communication threads
- comprehensive admin CRUD rather than placeholders
- app quality at or above the Brightwheel reference level for Mountain's use case
- preserve and improve the existing design instead of replacing working portions casually

## Do-not-regress checklist for future strong changes
Before any major refactor, preserve:
- admin PIN 7405 login
- Supabase session-based admin role
- six grade names and six active classroom model
- family registration
- grade/cycle/community/selected-student broadcast targeting
- Mounty human-review requirement
- private storage + signed media/document access
- R4 document upload/open flow
- family document access
- teacher classroom scoping
- notification center/preferences
- service-worker versioning when frontend changes
- iPhone/Safari error handling
- existing GitHub Pages production URL
- transportation app separation

## Recommended next engineering checkpoint procedure
After every large change:
1. Update this checkpoint or create a dated successor.
2. Bump frontend/service-worker cache version when relevant.
3. Run integration/security suite.
4. Wait for GitHub Pages propagation.
5. Run live public smoke tests including Edge Function CORS.
6. Verify admin login remains functional before declaring completion.

This file intentionally serves as the persistent handoff/state record for the Mountain Family project at R4 so subsequent work can continue without losing the accumulated architecture, decisions and fixes.