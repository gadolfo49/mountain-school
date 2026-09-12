# Mountain Family v19 — Final QA115

Nombre corto de referencia: **MF19-FINAL-QA115**

Fecha de consolidación: **12 de septiembre de 2026**

Esta versión representa el estado consolidado de Mountain Family posterior a **MF18-Mounty-QA50**. Integra la revisión final de arquitectura, autenticación, permisos, experiencia de maestra, experiencia de familia, administración, comunicaciones, notificaciones, multimedia, PWA, Mounty y seguridad de Supabase.

## Regla de referencia

Cuando se diga **MF19-FINAL-QA115**, se debe entender esta versión completa como el nuevo punto base mínimo de Mountain Family. Ninguna mejora futura debe regresar a prototipos antiguos, al flujo `/family/` simplificado ni a la autenticación legacy de `auth-v5.js`.

La v18 queda conservada como referencia histórica inmediatamente anterior: **MF18-Mounty-QA50**.

## Aplicación y repositorio

- Aplicación pública: https://gadolfo49.github.io/mountain-school/
- Repositorio: `gadolfo49/mountain-school`
- Rama de desarrollo principal: `main`
- Marcador de versión web: `MF-FINAL-20260912`
- Service Worker final: `mountain-family-shell-final-20260912-r3`
- Aplicación instalable como PWA, incluyendo soporte iPhone / Apple Web App.
- GitHub Pages validado mediante despliegue y smoke test público.

## Perfiles y acceso

Perfiles activos soportados:

- Administrador
- Maestra
- Familia

### Administrador

- Acceso administrativo mediante PIN de 4 dígitos.
- PIN operativo validado: **7405**.
- El PIN no queda almacenado en texto plano en frontend.
- La validación se realiza contra configuración privada de Supabase.
- Bloqueo temporal después de múltiples intentos incorrectos.
- Estado al cierre de QA: 0 intentos fallidos y sin bloqueo.
- Sesión administrativa real mediante Supabase Auth y OTP/magic token interno.
- Perfil administrador principal protegido contra operaciones administrativas accidentales.

### Familias

- Registro real de cuenta familiar.
- Inicio de sesión por correo y contraseña.
- Registro restringido al flujo oficial de la aplicación.
- Perfil familiar activo obligatorio para entrar.
- Una familia solo puede consultar la información de los estudiantes vinculados a su cuenta.

### Maestras

- Inicio de sesión por correo y contraseña.
- Rol `teacher` validado en perfil activo.
- Una maestra solo puede acceder a los grados que tenga asignados en `mf_classroom_staff`.
- Se soportan varias maestras por grado.
- La experiencia docente oculta funciones administrativas/financieras que no corresponden a su rol.

## Grados y estructura académica

Se mantienen seis grados de Nivel Inicial:

1. Maternal
2. Infantes
3. Párvulos
4. Pre-Kínder
5. Kínder
6. Preprimario

También se conserva la organización por:

- Primer Ciclo
- Segundo Ciclo

La relación de personal docente con aulas se gestiona mediante `mf_classroom_staff`, permitiendo múltiples maestras por grado.

## Administración de usuarios y estudiantes

La administración puede:

- Crear/invitar usuarios.
- Activar o desactivar accesos.
- Administrar roles.
- Vincular familias con estudiantes.
- Asignar maestras a grados.
- Desasignar maestras de grados.
- Crear estudiantes.
- Asignar estudiante a grado.
- Mantener la cuenta administrativa principal protegida.

## Rutina diaria por aula

La aplicación permite registro colectivo y personalizado por grado para:

- Desayuno
- Almuerzo
- Siesta
- Higiene
- Actividad pedagógica
- Cuidado / estado general

Características:

- Selección por grado.
- Selección de todos los estudiantes presentes.
- Exclusión manual de estudiantes no presentes.
- Personalización automática por nombre.
- Estados individualizados por estudiante.
- Integración con Mounty para generar mensajes claros y naturales.

## Asistencia

- Registro de entrada y salida.
- Consulta por rol.
- La maestra trabaja dentro de sus grados asignados.
- Las familias solo reciben la información correspondiente a sus hijos.
- Administración mantiene alcance global.

## Comunicación institucional y familiar

Alcances disponibles:

- Toda la comunidad
- Un ciclo
- Un grado
- Estudiantes seleccionados
- Estudiante individual

Las difusiones incluyen:

- Destinatarios reales calculados en backend.
- Registro de entrega/lectura.
- Notificación interna por destinatario.
- Respeto a las preferencias de notificación del usuario.
- Restricción de alcance por rol.

Administración puede publicar a cualquier alcance.

Las maestras pueden comunicarse únicamente con sus propios grados/estudiantes.

## Mensajería bidireccional

- Conversaciones familia–maestra–administración.
- Los miembros del hilo se gestionan por el backend autorizado.
- Una familia solo puede entrar en hilos relacionados con sus estudiantes.
- Una maestra solo puede participar en hilos de grados que tenga asignados.
- Administración conserva visibilidad global.
- Los mensajes generan notificación a los demás miembros del hilo.
- Se eliminó la posibilidad histórica de que maestras manipularan libremente miembros de conversaciones.

## Notificaciones

Módulo de notificaciones real, no decorativo:

- Centro de notificaciones.
- Estado leído/no leído.
- Notificaciones por difusiones.
- Notificaciones por mensajes de conversación.
- Preferencias configurables.
- Las preferencias se respetan al generar alertas.

## Multimedia y evidencias

Tipos soportados en la experiencia final:

- Imágenes JPEG/PNG/HEIC según flujo permitido.
- Video MP4.
- PDF.
- DOCX.
- XLSX.
- PPTX.
- Otros tipos permitidos según validación vigente del módulo.

Seguridad y funcionamiento:

- Bucket privado / acceso controlado.
- Descarga mediante URLs firmadas temporales.
- Validación de tipo y tamaño.
- Restricción por rol y alcance.
- Una maestra puede adjuntar evidencia para estudiantes o grados que tenga asignados.
- Comunidad y ciclo permanecen como alcance administrativo cuando corresponde.
- Multimedia cotidiana puede configurarse con caducidad aproximada de 24 horas.
- Existe acción de limpieza de archivos expirados.

Se corrigió un defecto real por el cual una maestra podía seleccionar evidencia pero el backend rechazaba el archivo al final del proceso.

## Mounty Guide / IA

Mounty permanece como asistente operativo central.

Flujo recomendado:

**contexto/hechos → borrador de Mounty → revisión humana → envío**

Capacidades consolidadas:

- Redacción de mensajes individuales.
- Redacción de comunicaciones colectivas.
- Sugerencias para rutinas.
- Apoyo en incidentes.
- Recordatorios.
- Mensajes generales.
- Evidencias.
- Selección por comunidad, ciclo, grado o estudiantes.
- Contexto específico introducido por personal.
- Aviso permanente de revisión humana antes del envío.

Reglas:

- Mounty no debe inventar diagnósticos.
- No debe inventar conductas, cantidades, emociones ni logros no presentes en el contexto.
- Las respuestas requieren revisión humana.

La batería previa de Mounty se conserva en verde: **5/5** después de corregir el problema histórico de respuestas vacías/truncadas.

## Método CRECE y seguimiento académico

La versión conserva:

- Seguimiento de observaciones.
- Dominios académicos.
- Matemáticas.
- Lectoescritura.
- Inglés.
- Creatividad.
- Nivel de apoyo.
- Método CRECE.
- Planificaciones académicas.
- Creación de planificación por personal autorizado.

## Incidentes, seguridad y cuidado

Módulos presentes:

- Incidentes.
- Seguridad.
- Observaciones.
- Planes/cuidado según estructura vigente.
- Personas autorizadas para recogida.
- Documentos.
- Pagos visibles/gestionables únicamente por roles correspondientes.

## RLS y aislamiento de datos

Durante la auditoría final se descubrieron y corrigieron problemas reales de Row Level Security.

Correcciones principales:

1. Recursión infinita en políticas familia–estudiante.
2. Recursión derivada en pagos.
3. Políticas antiguas que recorrían directamente `mf_student_guardians` y podían volver a crear ciclos.
4. Políticas antiguas de difusión que podían bloquear al administrador.
5. Falta de lectura administrativa explícita en ciertas comunicaciones.
6. Escritura demasiado amplia de miembros de conversaciones por parte de maestras.
7. Excepciones antiguas basadas en correo sustituidas por helpers de rol.

Se consolidaron helpers de acceso para:

- Administración.
- Estudiantes.
- Tutores.
- Aulas/grados.

Resultado de prueba reversible de roles en PostgreSQL:

**12/12 escenarios de permisos aprobados.**

Incluye comprobaciones de que:

- Una maestra no accede a estudiantes ajenos.
- Una familia no accede a estudiantes ajenos.
- Una familia no modifica expedientes administrativos.
- Una maestra no administra pagos.
- Administración mantiene alcance completo.

## Registro familiar y validaciones

- Registro de familia conectado al backend real.
- Validación de nombre/correo/contraseña.
- Longitudes y datos básicos controlados.
- Errores internos no se exponen innecesariamente al usuario.
- Contraseña mínima de 6 caracteres en la interfaz vigente.

## PWA y experiencia móvil

- `manifest.webmanifest` enlazado.
- `display: standalone`.
- Compatibilidad Apple PWA.
- `viewport-fit=cover`.
- Service Worker final `r3`.
- Cache de módulos fundamentales.
- Supabase, Storage y Edge Functions excluidos del cache estático para evitar sesiones/datos obsoletos.
- Navegación con estrategia de red y fallback local.
- Auth legacy eliminada del shell final.

Módulos cacheados incluyen, entre otros:

- app principal
- acceso
- admin gate
- usuarios
- datos administrativos
- documentos
- administración escolar
- académico
- Mounty Guide
- experiencia de maestra
- notificaciones
- flujo final

## QA consolidado

### QA previo

**MF18-Mounty-QA50**:

- 45/45 pruebas de datos, estructura y lógica.
- 5/5 pruebas reales de Mounty.
- Total: 50/50.

### QA final de v19

La batería final se amplió a **115 controles de integración y contrato**, cubriendo:

- parsing de módulos JS
- autenticación
- PIN administrativo
- registro familiar
- roles
- usuarios
- vínculos familia-estudiante
- asignaciones docentes
- grados
- rutinas
- Mounty
- multimedia
- asistencia
- incidentes
- seguridad
- observaciones
- CRECE
- pagos
- autorizados
- documentos
- PWA
- experiencia de maestra
- notificaciones
- flujo final
- service worker
- despliegue público

Resultado de GitHub Actions:

- Pruebas de integración: **SUCCESS**
- Espera/confirmación GitHub Pages: **SUCCESS**
- Smoke test sobre el despliegue público: **SUCCESS**
- Workflow final: **SUCCESS**

Run final de referencia: `34692335687`.

Commit de referencia previo al snapshot documental: `a321cb59a2a8705a3f726fcf8417355ef3ce113f`.

## Estado limpio de datos al cierre

Se verificó después de QA:

- estudiantes QA: 0
- tutores/familias QA: 0
- comunicaciones QA: 0
- eventos QA: 0
- maestras activas reales en base en este momento: 0
- familias activas reales en base en este momento: 0

Esto confirma que la batería no dejó datos ficticios residuales.

## Seguridad Supabase

Estado final auditado:

- PIN administrativo privado y funcional.
- Sin intentos fallidos pendientes.
- Sin bloqueo.
- RLS validado por roles.
- Helpers internos utilizados para evitar ciclos de políticas.
- Multimedia con acceso controlado.
- Edge Functions separan operaciones privilegiadas del frontend.

Recomendación pendiente de configuración externa de Auth antes de apertura amplia al público:

- Activar **Leaked Password Protection** en Supabase Auth.

El linter también señala helpers `SECURITY DEFINER` accesibles a usuarios autenticados. En esta arquitectura son helpers/RPC controlados por identidad y rol utilizados deliberadamente para evitar recursión RLS; deben mantenerse bajo revisión si la arquitectura cambia.

## Defectos importantes encontrados y corregidos después de v18

1. Recursión RLS familia–estudiante.
2. Recursión RLS en pagos.
3. Escritura antigua demasiado amplia sobre miembros de conversaciones.
4. Rechazo backend de evidencia enviada por maestras.
5. Difusiones administrativas bloqueadas por políticas antiguas.
6. Falta de notificación real al publicar ciertas comunicaciones.
7. Preferencias de notificación que antes no se aplicaban al generar alertas.
8. Conversaciones que necesitaban notificar a los demás miembros.
9. Test del service worker desactualizado (`r2` frente a `r3`).
10. Flujo legacy de autenticación/prototipo `/family/` retirado del shell de producción.
11. Autenticación administrativa endurecida sin hacer más complejo el acceso del usuario.

## Archivos principales de esta versión

- `index.html`
- `app-v3.js`
- `access-v6.js`
- `admin-gate.js`
- `admin-users-v1.js`
- `admin-data-v1.js`
- `admin-documents-v1.js`
- `school-admin-v1.js`
- `academic-v2.js`
- `mounty-guide-v1.js`
- `teacher-experience-v1.js`
- `notifications-v1.js`
- `final-flow-v1.js`
- `styles-v2.css`
- `manifest.webmanifest`
- `sw.js`
- `tests/mountain-family.integration.test.mjs`
- `tests/live-smoke.sh`

## Estado de la versión

**MF19-FINAL-QA115 queda establecida como snapshot oficial posterior a MF18-Mounty-QA50.**

Las mejoras futuras deben partir de MF19 y conservar como mínimo:

- acceso administrativo por PIN
- aislamiento RLS validado
- seis grados
- múltiples maestras por grado
- administración de usuarios/estudiantes
- rutinas masivas personalizadas
- Mounty con revisión humana
- comunicaciones segmentadas
- mensajería bidireccional
- notificaciones reales
- multimedia privada y temporal
- PWA móvil
- experiencia específica de maestra
- flujo de familia limitado a sus hijos
- QA automatizado antes de publicar

No debe considerarse una mejora válida cualquier cambio futuro que elimine o degrade una de estas capacidades sin decisión explícita del propietario de Mountain Creativity School.
