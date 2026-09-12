# Mountain Family — MF-R5-FORENSIC-FINAL

Fecha de consolidación: 2026-09-12
Aplicación: Mountain Family — Mountain Creativity School
Repositorio: `gadolfo49/mountain-school`
Producción: `https://gadolfo49.github.io/mountain-school/`
Base estable anterior preservada: `snapshot/mf-r4-forensic-base`

## Nombre canónico

**MF-R5-FORENSIC-FINAL**

Cuando se haga referencia a `MF-R5-FORENSIC-FINAL`, se debe partir de este estado o de uno posterior que conserve todos sus contratos. No se debe regresar a prototipos `/family/`, `auth-v5.js`, single-teacher classroom logic, archivos públicos ni flujos de Mounty que envíen sin revisión humana.

## Arquitectura frontend consolidada

- `index.html`
- `styles-v2.css`
- `runtime-v2.js`
- `network-guard-v1.js`
- `app-v3.js`
- `admin-gate.js`
- `access-v6.js`
- `admin-users-v1.js`
- `admin-data-v1.js`
- `admin-documents-v1.js`
- `family-documents-v1.js`
- `school-admin-v1.js`
- `academic-v2.js`
- `mounty-guide-v1.js`
- `teacher-experience-v1.js`
- `notifications-v1.js`
- `final-flow-v1.js`
- `manifest.webmanifest`
- `sw.js`

Marcador UI: `MF-R5-FORENSIC-20260912`
Service Worker cache: `mountain-family-shell-r5-forensic-20260912`

## Dependencias

Supabase JS queda fijado a:

`@supabase/supabase-js@2.116.0`

No volver a una dependencia flotante `@2` sin una actualización deliberada y nueva batería QA.

## Runtime compartido

`runtime-v2.js` es la autoridad compartida para:

- cliente Supabase único por página
- sesión
- caché de perfil
- rol vigente
- `currentProfile()`
- `hasRole()`
- normalización de errores de red
- inferencia MIME para Safari/iPhone
- eventos de cambio de autenticación

Los módulos pueden mantener fallback por compatibilidad, pero la autorización real nunca debe depender del texto visible de `#userChip`; backend/RLS sigue siendo autoridad final.

## Roles

- admin
- teacher
- family

Backend conserva compatibilidad con roles especializados ya modelados donde corresponda, pero la experiencia principal de Mountain Family usa los tres anteriores.

## Admin

PIN operativo: **7405**

Verificación final:
- hash privado corresponde a 7405
- perfil admin activo
- 0 intentos fallidos
- sin bloqueo

El PIN no se almacena en texto plano en frontend.

## Seis grados

1. Maternal
2. Infantes
3. Párvulos
4. Pre-Kínder
5. Kínder
6. Preprimario

Modelo multi-maestra obligatorio: `mf_classroom_staff`.

## Hallazgos forenses críticos corregidos

### Privilegios SQL destructivos
Se detectó que `anon` y `authenticated` podían heredar privilegios SQL excesivos sobre tablas `mf_*`, incluyendo `TRUNCATE`, `TRIGGER` y `REFERENCES`.

R5 revocó:
- todo acceso directo `anon` a tablas `mf_*`
- `TRUNCATE`, `TRIGGER` y `REFERENCES` para `authenticated`
- privilegios destructivos remanentes del view `mf_conversation_inbox`

Comprobación final: 0 grants `TRUNCATE/TRIGGER/REFERENCES` para `anon/authenticated` sobre objetos `public.mf_*`.

### Rol fantasma familia → maestra
`mf_can_access_student()` y `mf_can_access_guardian()` ahora exigen que una relación de tutor coincida además con un perfil activo `family`. Un usuario cambiado a `teacher` no conserva acceso familiar por una relación histórica.

### Notificaciones duplicadas
Se eliminó el trigger redundante de chat y la notificación duplicada de difusión. Cada responsabilidad queda con una única fuente de generación.

### Jobs duplicados de Mounty
La combinación `(source_table, source_id, event_type)` está protegida por índice único. `mf_enqueue_agent_job()` usa `ON CONFLICT DO NOTHING`.

### Borradores duplicados de Mounty
`mf_agent_drafts.job_id` está protegido por índice único.

### Doble envío de un borrador
`mf_chat_messages.agent_draft_id` está protegido por índice único. `mounty-review` es retry-safe e idempotente.

### Mutación directa de borradores
La política de actualización directa de `mf_agent_drafts` por personal fue retirada. La revisión/aprobación/rechazo/envío debe pasar por `mounty-review`.

### Broadcast de maestra mutable fuera de alcance
`mf_broadcasts_teacher_update` ahora obliga a:
- autor propio
- estado draft
- audiencia `classroom` o `selected_students`
- aula asignada cuando aplica

### Actividades de planificación fuera de grado
Se creó `mf_can_access_lesson_plan()` y las políticas de `mf_lesson_activities` heredan el alcance del plan padre.

## Mounty Guide

Principio operativo obligatorio:

**hechos/contexto → borrador → revisión humana → envío**

### Fidelidad estricta
Después de detectar que un contexto corto como `Viernes, día de colores rojo` podía provocar una solicitud inventada de llevar ropa/accesorios, se reforzó la política de grounding.

Mounty ahora tiene instrucción explícita de no inferir ni añadir:
- prendas
- accesorios
- materiales
- tareas
- preparativos
- obligaciones
- recomendaciones
- causas
- emociones
- diagnósticos
- logros
- acciones futuras no proporcionadas

Si el contexto es breve, el borrador debe permanecer breve.

### Edge Functions Mounty actuales
- `mounty-compose` v4
- `mounty-agent` v7
- `mounty-review` v5
- `mountain-media` v8
- `mountain-thread` v3

Todas las funciones browser-facing conservan CORS/preflight para `https://gadolfo49.github.io`.

### Concurrencia
`mounty-agent` realiza claim condicional `queued -> processing` antes de llamar a IA. Dos workers no procesan el mismo job simultáneamente.

### Envío
`mounty-review` usa transición condicional de estado y `agent_draft_id` único para impedir mensajes duplicados por doble toque, reintento o solicitudes concurrentes.

## Mounty Guide frontend

`mounty-guide-v1.js` ahora:
- consulta para maestra solo aulas asignadas
- consulta para maestra solo estudiantes de esas aulas
- valida selección no vacía
- valida grado/ciclo
- calcula destinatarios antes de crear broadcast
- rechaza audiencia con 0 familias activas
- deshabilita botones durante operaciones
- limpia borradores de broadcast si una fase falla
- mantiene revisión humana

## Multimedia y Storage

Buckets activos R5:
- `mountain-family-media`
- `mountain-family-documents`

Los buckets heredados `documents` y `student-media` se comprobaron vacíos y sus políticas antiguas fueron retiradas.

Lectura de archivos privados se realiza mediante URLs firmadas emitidas por `mountain-media`.

### Ciclo de un adjunto
1. `prepare_upload`
2. fila en `mf_attachments` con `security_status='quarantined'`
3. signed upload a Storage
4. `finalize_upload`
5. backend comprueba que el objeto realmente existe
6. estado cambia a `accepted`
7. solo `accepted` puede abrirse con `signed_read`

Si falla:
- `cancel_upload` elimina el objeto parcial y marca el registro rechazado/borrado

Verificación final de datos existentes:
- 2 adjuntos
- ambos `accepted`
- 0 adjuntos en cuarentena

## Documentos

Administración:
- archivo físico obligatorio
- MIME inferido si Safari no lo entrega
- upload firmado
- rollback del objeto si falla el insert de `mf_documents`
- apertura segura en Safari mediante pestaña creada sincrónicamente y URL firmada posterior

Familia:
- documentos del estudiante vinculados y visibles
- documentos generales visibles para familia
- etiqueta `Toda la familia` para documento general
- apertura firmada y temporal

`mf_notify_document()` notifica tanto documentos individuales como generales visibles, respetando preferencias.

## Storage directo

Las políticas de lectura directa sobre `mountain-family-media` y `mountain-family-documents` fueron retiradas. El frontend no debe saltar `mountain-media` para leer contenido privado.

## Registro familiar público

`mountain-register-cors` v5 incluye rate limiting invisible:
- fingerprint hash de IP + User-Agent
- no guarda IP en texto
- máximo aproximado: 10 intentos por ventana de una hora
- bloqueo temporal de abuso
- sin CAPTCHA ni pasos adicionales para una familia legítima

## Administración de usuarios

`mountain-admin-users` v6.

Asignación de aulas/grados usa una sola operación atómica:
- RPC `mf_admin_set_teacher_classrooms()`

Cambios de rol sincronizan estado:
- family: tutor activo, sin asignaciones docentes
- teacher: tutor desactivado
- teacher inactivo: asignaciones docentes desactivadas
- admin principal protegido

`link_student` solo acepta una cuenta family activa y estudiante activo.

## Teacher Experience

Se eliminó el observer global sobre `document.body` que podía auto-realimentarse.

Ahora:
- observa `#home` y `#sheet` únicamente
- usa guard de render
- utiliza `queueMicrotask`
- muestra estado sin grados asignados
- limpia contexto en signout
- trabaja solo con aulas asignadas

## Notificaciones

Se corrigió fuga de memoria/sesión:
- `clearInterval(timer)` al salir
- elimina `visibilitychange` listener
- limpia usuario y `lastSeen`
- elimina botón de notificación
- reinicia de forma segura ante nueva sesión

## Safari/iPhone

Correcciones consolidadas:
- CORS/preflight en Edge Functions críticas
- `network-guard-v1.js`
- MIME por extensión cuando `File.type` llega vacío
- apertura de documentos/adjuntos mediante `window.open('about:blank')` durante el gesto de usuario y sustitución de URL después de la llamada firmada
- evita bloqueo de popups asíncronos

## Datos administrativos endurecidos

Pagos:
- concepto requerido
- monto finito > 0
- estado explícito
- prevención de doble envío

Autorizados:
- nombre requerido
- ID opcional de exactamente 4 dígitos
- prevención de doble envío

Estudiantes:
- nombre requerido
- fecha de nacimiento no futura
- límites de longitud
- aula opcional

Planificación:
- maestra solo aulas asignadas
- sin aula asignada no puede crear planificación
- título/fecha requeridos

Observaciones:
- estudiante dentro de alcance RLS
- texto mínimo
- límites de longitud
- dominios ampliados y CRECE

## Rendimiento

Se añadieron índices de hot path:
- `mf_notifications(user_id, created_at desc)`
- `mf_attendance(student_id, occurred_at desc)`

Se detectó y eliminó un índice único duplicado en `mf_agent_jobs`.

No eliminar índices marcados `unused` únicamente por falta de uso en una base todavía pequeña; el contador estadístico no implica que sean innecesarios en producción futura.

## Seguridad advisors

Después de la auditoría quedan dos categorías conocidas:

1. Funciones `SECURITY DEFINER` ejecutables por `authenticated`.
   Son deliberadas para RLS/RPC y dependen de `auth.uid()`/rol. Deben seguir bajo revisión si cambia la arquitectura.
2. Supabase Auth `Leaked Password Protection` desactivado.
   Es una configuración externa recomendada antes de apertura pública amplia.

## QA

R5 reemplaza la antigua batería basada en números/versiones fijas por contratos forenses.

`tests/mountain-family.integration.test.mjs` valida:
- parseo de módulos
- dependencia Supabase fijada
- orden runtime antes de app
- ausencia de auth legacy
- runtime compartido
- seis grados
- rutinas
- login/admin/family contracts
- asignación docente atómica
- validación de pagos/autorizados
- fechas de estudiante
- dominios académicos
- documentos físicos y rollback
- Safari-safe open
- Mounty recipient preview
- selección no vacía
- finalización/cancelación de uploads
- rollback de broadcast
- revisión humana
- observer docente no global
- limpieza de timers
- signed file reads
- network guard
- PWA/Service Worker R5
- regresión de entidades HTML mal formadas

`tests/live-smoke.sh` comprueba en GitHub Pages:
- shell R5 real
- Supabase JS 2.116.0
- runtime R5
- módulos R5
- ausencia de auth-v5
- Mounty finalize/cancel/preview
- documentos
- teacher observer guard
- timer cleanup
- signed reads
- cache R5
- CORS `OPTIONS` de Mounty/media/thread/review/agent

Último workflow forense previo a este checkpoint: SUCCESS.
Último Pages build previo a este checkpoint: SUCCESS.
Este checkpoint genera una nueva corrida para validar el estado exacto final.

## Estado de datos QA

No se deben conservar usuarios/estudiantes/comunicaciones QA como consecuencia de esta auditoría. Las pruebas destructivas temporales deben limpiarse o ejecutarse en transacciones reversibles.

## Reglas de no regresión

No aceptar como mejora ningún cambio que rompa o elimine sin decisión explícita:
- PIN 7405
- seis grados
- multi-maestra por aula
- family self-registration
- aislamiento RLS
- privilegios destructivos revocados
- contexto estricto de Mounty
- revisión humana de IA
- idempotencia de jobs/drafts/sends
- audience preview
- uploads finalizados antes de publicación
- Storage privado firmado
- expiración multimedia cotidiana
- documentos físicos reales
- Safari-safe file opening
- rate limiting del registro
- timer cleanup
- PWA R5
- suite forense + live smoke antes de declarar una nueva release

## Restauración

Si una modificación futura degrada la app:
- R4 está preservada en `snapshot/mf-r4-forensic-base`
- R5 debe preservarse en un snapshot propio una vez que la corrida final de QA de este checkpoint quede verde.
