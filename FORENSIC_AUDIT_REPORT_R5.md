# Mountain Family — Informe Forense R5

Versión auditada: **MF-R5-FORENSIC-FINAL**
Fecha: 2026-09-12

| Archivo / componente | Causa raíz | Impacto | Corrección aplicada |
|---|---|---|---|
| SQL grants `mf_*` | Grants heredados incluían TRUNCATE/TRIGGER/REFERENCES para roles de cliente | Posibilidad estructural de operaciones que RLS no debe controlar | Revocados todos los grants destructivos; `anon` sin acceso directo a tablas `mf_*` |
| `mf_conversation_inbox` | View conservaba grants destructivos después del primer barrido | Superficie residual de privilegios excesivos | Revocados; `authenticated` conserva solo SELECT |
| `mf_can_access_student` / `mf_can_access_guardian` | Relación de tutor podía sobrevivir a un cambio de rol | Acceso fantasma familia→maestra | Helper exige perfil activo con rol correcto además de la relación |
| Chat notifications | Dos mecanismos generaban alertas para un mismo mensaje | Notificaciones duplicadas | Eliminado trigger redundante |
| Broadcast notifications | Publicación y trigger podían notificar dos veces | Alertas duplicadas | Una única fuente de notificación por recipient trigger |
| `mf_agent_jobs` | Trigger + llamadas manuales podían intentar duplicar trabajo | Dos borradores o errores de concurrencia | Índice único por fuente/evento + `ON CONFLICT DO NOTHING` |
| `mounty-agent` | Workers podían leer el mismo job `queued` a la vez | Doble procesamiento IA | Claim condicional `queued -> processing`; v7 mantiene idempotencia |
| `mf_agent_drafts` | No había garantía DB de un borrador por job | Duplicación de borradores | Índice único por `job_id` |
| `mounty-review` | Reintento/doble toque podía intentar enviar dos veces | Mensajes familiares duplicados | `agent_draft_id` único en chat + transición condicional + retry-safe |
| `mf_agent_drafts` RLS | Maestra podía mutar estado de draft directamente | Posible bypass de revisión formal | Retirada política UPDATE directa; cambios pasan por Edge Function |
| Mounty grounding | Modelo podía completar contexto con solicitudes plausibles no dadas | Mensaje incorrecto aunque gramaticalmente bueno | Política `strict-context-only` reforzada en compose v4 y agent v7 |
| `mounty-guide-v1.js` | UI cargaba universo amplio y filtraba después | Riesgo de scope/UI inconsistente | Teacher consulta solo aulas y estudiantes asignados desde origen |
| `mounty-guide-v1.js` | Selección vacía podía llegar a creación de broadcast | Registros sin destinatarios | Validación + `mf_broadcast_preview_count` antes de crear |
| `mounty-guide-v1.js` | Flujo de evidencia podía publicar antes de confirmar Storage | Adjuntos huérfanos o falsamente disponibles | prepare → upload → finalize → publish; rollback en falla |
| `mountain-media` | Attachment nacía `accepted` antes de existir objeto | Registro válido apuntando a objeto inexistente | `quarantined` hasta verificación física; v8 |
| Storage policies | Lectura directa podía competir con signed-read | Posible ruta paralela de acceso | Eliminadas SELECT policies directas en buckets R5 |
| Buckets legacy | `documents` / `student-media` mantenían políticas antiguas | Superficie histórica innecesaria | Se comprobó 0 objetos y se retiraron políticas legacy |
| Documentos | Archivo físico podía fallar después de preparar Storage | Objeto huérfano | `cancel_document_upload` y rollback si DB insert falla |
| Documentos Safari | `window.open` después de await puede ser bloqueado | Documento no abre en iPhone | Pestaña se crea durante gesto de usuario y URL se reemplaza luego |
| Adjuntos Safari | Igual patrón de popup asíncrono | Evidencia no abre en iPhone | `final-flow-v1.js` usa signed read + blank tab sincrónico |
| `teacher-experience-v1.js` | MutationObserver global mutaba el mismo árbol observado | Bucle/re-render/churn | Observer limitado, render guard y microtask scheduling |
| `notifications-v1.js` | Interval/listener sobrevivían a cambio de sesión | Polling duplicado y estado cruzado | Limpieza explícita al signout y reinicio seguro |
| `mountain-admin-users` | Asignar aulas con varias llamadas independientes | Estado parcial si una llamada falla | RPC transaccional `mf_admin_set_teacher_classrooms()` |
| Roles usuario | Cambio family/teacher no sincronizaba guardian/staff | Permisos residuales | Edge v6 sincroniza relaciones activas por rol |
| `mf_lesson_activities` | Policies comprobaban rol pero no plan/aula padre | Maestra podía tocar actividades ajenas | Helper `mf_can_access_lesson_plan()` + RLS heredado |
| Registro público | Endpoint sin rate limit | Creación automatizada de cuentas | Hash de cliente + ventana/límite privado; register v5 |
| Dependencia Supabase | CDN `@2` flotante | Actualización imprevista podía romper frontend | Fijada a `@supabase/supabase-js@2.116.0` |
| Clientes Supabase | Cada módulo creaba cliente separado | Sesión/listeners redundantes | `runtime-v2.js` comparte un único cliente |
| Pagos | UI aceptaba valores débiles | Registros inconsistentes | Concepto requerido, monto finito >0, doble-submit guard |
| Autorizados | ID sin validación suficiente | Datos operativos inconsistentes | 4 dígitos exactos o vacío; validación y límites |
| Estudiantes | Fecha futura y entradas débiles | Perfil imposible | Fecha no futura + límites de longitud |
| Observaciones | Validación mínima y doble toque | Datos vacíos/duplicados | Longitudes, sesión y submit guard |
| Rendimiento | Queries calientes sin índice compuesto | Degradación al crecer volumen | Índices user/date en notificaciones y student/time en asistencia |
| Índices agent | Dos índices únicos idénticos | Costo duplicado de escritura | Eliminado índice redundante |
| QA histórico | Tests anclados a strings R3/R4 | Falsos rojos/verdes | Suite R5 basada en contratos funcionales |

## Verificación final

- GitHub Actions forensic R5: **SUCCESS**
- GitHub Pages deployment: **SUCCESS**
- R5 live browser smoke: **SUCCESS**
- PIN 7405 hash: **válido**
- Admin: **activo**, 0 intentos fallidos, sin bloqueo
- Grants destructivos `TRUNCATE/TRIGGER/REFERENCES` para `anon/authenticated` en `mf_*`: **0**
- Adjuntos en cuarentena: **0**
- Jobs Mounty duplicados por fuente: **0**
- Drafts Mounty duplicados por job: **0**
- Buckets legacy: **0 objetos**

## Pendiente externo de publicación

Supabase Auth mantiene `Leaked Password Protection` desactivado. Es una configuración del proveedor recomendada antes de una apertura pública amplia y no se implementa desde el código de Mountain Family.
