# Mountain Family — Protected Baseline R5.1

Fecha de consolidación: 2026-09-12

## Baseline oficial

- Release: `MF-R5.1-MOUNTY-RELIABILITY-20260912`
- Producción: `https://gadolfo49.github.io/mountain-school/`
- Proyecto Supabase: `kbtjkjdjvkorekzzhxcx`
- Transporte escolar: aplicación separada; nunca debe mezclarse con Mountain Family.

## Regla de avance

Toda mejora futura debe ser aditiva o deliberadamente migrada. Ningún cambio se considera terminado si rompe los contratos automáticos de esta baseline o el smoke test público. Si una mejora exige cambiar un invariante protegido, el cambio debe actualizar explícitamente `RELEASE_GUARD.json`, sus pruebas y la documentación en el mismo release.

## Funcionalidad protegida

### Acceso

- Administrador: `mountain-admin-pin`.
- Familias y maestras: autenticación moderna a través de `access-v6.js`.
- Registro familiar: `mountain-register-cors`.
- `auth-v5.js` no forma parte del shell de producción.
- Los endpoints antiguos `mountain-admin-simple` y `mountain-register` están retirados y responden 410.

### Roles y alcance

- Administrador: alcance institucional.
- Maestra: únicamente aulas asignadas mediante `mf_classroom_staff`.
- Familia: únicamente estudiantes vinculados.
- Pagos y funciones administrativas no deben exponerse a maestras.

### Grados protegidos

1. Maternal
2. Infantes
3. Párvulos
4. Pre-Kínder
5. Kínder
6. Preprimario

### Mounty

Mounty es un agente de apoyo, no un remitente autónomo.

- `mounty-compose` v5
- `mounty-agent` v8
- `mounty-review` v6
- `mountain-thread` v4
- `mountain-media` v8

Contratos obligatorios:

- Todo texto generado requiere revisión humana antes del envío.
- Mounty trabaja exclusivamente con los hechos y metadatos suministrados; no inventa obligaciones, materiales, diagnósticos, causas ni acciones futuras.
- Los fallos temporales del proveedor de IA tienen reintentos controlados.
- Las llamadas de frontend utilizan el invocador centralizado de `runtime-v2.js`.
- Un error HTTP de Edge Function debe intentar leer el cuerpo estructurado y nunca presentar al usuario el mensaje crudo `Edge Function returned a non-2xx status code`.
- Los fallos de Mounty incluyen `request_id` cuando el backend puede generarlo.
- La telemetría técnica no guarda el contenido sensible del mensaje.
- Evidencias y multimedia mantienen validación de tipo, subida firmada, cuarentena/finalización y control por rol.

### Comunicación

- Difusión a comunidad, ciclo, grado y estudiantes seleccionados.
- Maestras solo pueden dirigirse a sus aulas/estudiantes asignados.
- La cantidad de destinatarios se valida antes de publicar.
- La comunicación generada por Mounty conserva revisión humana.

### PWA y caché

- `runtime-v2.js` es el runtime compartido de producción.
- El Service Worker no almacena llamadas a Supabase, Storage ni Edge Functions.
- Los cambios de release deben cambiar el cache marker cuando sea necesario para impedir JavaScript obsoleto en iPhone/PWA.

## Controles anti-regresión

Los siguientes archivos forman la barrera de regresión:

- `RELEASE_GUARD.json`
- `tests/mountain-family.integration.test.mjs`
- `tests/live-smoke.sh`
- `.github/workflows/mountain-family-qa.yml`
- `MOUNTY_RELIABILITY_R5_1.md`
- `PROTECTED_BASELINE_R5_1.md`

El pipeline debe pasar antes de considerar estable el HEAD de `main`:

1. Parseo de JavaScript.
2. Contratos funcionales y de seguridad.
3. Invariantes de release.
4. Espera de despliegue GitHub Pages.
5. Smoke test contra producción.
6. Validación CORS de los endpoints críticos de Mounty.

## Rutas retiradas

Estas rutas no se reutilizan para nuevas funciones:

- `mountain-admin-simple`
- `mountain-register`
- `mounty-qa-temp`
- `final-role-qa-temp`

Si en el futuro se necesita una función similar, debe crearse o evolucionarse el endpoint oficial; no se reactiva código temporal/obsoleto.

## Política de cambios futuros

Antes de cerrar cualquier nueva etapa:

1. Cambiar lo mínimo necesario.
2. Mantener compatibilidad con esta baseline salvo migración deliberada.
3. Añadir una prueba de regresión para cada bug corregido.
4. Ejecutar CI sobre el commit final, no sobre un commit anterior.
5. Verificar Pages y smoke público después del último cambio.
6. No afirmar que una función está operativa en un iPhone físico sin prueba real del usuario o evidencia equivalente.
7. Conservar trazabilidad de los cambios importantes y versiones de Edge Functions.

Esta baseline existe para que Mountain Family avance por capas sin volver a resolver fallos ya cerrados.
