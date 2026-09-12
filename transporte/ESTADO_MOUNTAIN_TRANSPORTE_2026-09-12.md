# Mountain Transporte — Estado maestro

Fecha de corte: 2026-09-12
Nombre oficial de trabajo: **Mountain Transporte**
Organización: Mountain Creativity School
Repositorio: `gadolfo49/mountain-school`
Ruta del proyecto: `transporte/`

## Propósito
Aplicación de transporte escolar para seguimiento del autobús de Mountain Creativity School, con GPS real, mapa en tiempo real, ruta/paradas, acceso familiar, avisos de proximidad/llegada/retraso y operación administrativa.

## Horario operativo
Ruta regular: lunes a viernes, 06:00–08:30, zona `America/Santo_Domingo`.

## Arquitectura actual
- Frontend/PWA en GitHub Pages dentro de `transporte/`.
- Backend Supabase proyecto MCS Transporte.
- Traccar Client en iPhone institucional como fuente GPS.
- Edge Functions `mcs-gps`, `mcs-transport`, `mcs-push-worker`.
- PostgreSQL/Supabase para rutas, paradas, familias, viajes, estado por parada, GPS, eventos y Push.
- Acceso interno bloqueado para `anon`/`authenticated`; operaciones privilegiadas por backend/service role.

## Ruta de producción
Ruta activa: `Ruta AM Principal`.
Tiene 11 paradas/familias activas. El orden actual permanece sin optimización vial automática hasta validación con carreteras/tráfico real.

## GPS real — VALIDADO
El 2026-09-12 se aisló el problema de transmisión GPS en iPhone y se corrigió la configuración física de Traccar.

Configuración validada:
- Seguimiento continuo: ACTIVADO.
- Precisión Traccar: MÁXIMA.
- Distancia: 5 m.
- Intervalo de prueba: 10 s.
- Localización iOS: SIEMPRE.
- Ubicación precisa: ACTIVADA.
- URL del receptor Mountain: Edge Function `mcs-gps`.

Prueba física confirmada:
- Nueva posición capturada: 2026-09-12 17:49:13 UTC (13:49:13 RD).
- Recibida: 17:49:16 UTC.
- Latitud: 18.4613724346253.
- Longitud: -69.3020717302494.
- Precisión: ~5.34 m.
- `total_accepted` avanzó de 11,305 a 11,306.

Conclusión: cadena iPhone → GPS → Traccar Client → 5G → mcs-gps → Supabase validada con coordenada física real.

## Historial GPS
El historial previo no es recuperable desde Mountain porque `mcs_gps_history` no conservó puntos históricos de los recorridos anteriores. La lógica actual conserva historial durante la ventana escolar o cuando existe un viaje activo. El siguiente recorrido real debe validar acumulación continua de puntos.

## Readiness y watchdog GPS
Implementado readiness de servidor con estados operativos: activo, conectado estacionario, seguimiento apagado, sin fix, fix obsoleto, mala precisión y desconectado.

Implementado watchdog de GPS cada minuto para viajes activos:
- detecta ausencia de nueva posición >3 min;
- registra pérdida GPS;
- contabiliza pérdidas;
- registra restauración cuando vuelve la señal.

## Estado por parada
Implementada tabla `mcs_trip_stops` para congelar y gestionar las paradas de cada viaje independientemente de cambios posteriores en la ruta.
Estados: `pending`, `picked`, `skipped`.

La recogida es explícita: una geocerca NO marca automáticamente al niño como recogido. El conductor/admin debe confirmar `Recogido` o `No viaja hoy`. La resolución es secuencial y evita saltos accidentales.

## Geocercas y eventos
`mcs_process_trip_position`:
- procesa la próxima parada pendiente;
- genera `near` al aproximarse;
- genera `stop_arrived` dentro del radio;
- deduplica eventos;
- al resolver todas las paradas y regresar al radio del colegio completa el viaje y genera `school_arrived`.

## Viajes abandonados
Corregido el problema de viajes antiguos que permanecían `active`. Los viajes del 6, 7, 10 y 11 de septiembre fueron cerrados como `cancelled`, sin inventar recogidas ni llegadas. Existe función/cron `mcs_close_stale_trips` para cerrar automáticamente viajes activos de fechas anteriores.

## Push
Infraestructura Web Push/VAPID, suscripciones, cola `mcs_push_jobs`, worker y cron existentes. Pendiente certificación física de entrega porque todavía debe existir al menos un iPhone familiar realmente suscrito. No se considerará Push certificado mediante eventos simulados solamente.

## Panel administrativo
Funciones previstas/implementadas durante el desarrollo:
- iniciar ruta sujeto a readiness GPS;
- estado GPS detallado;
- Prepárate;
- Estamos cerca;
- Retraso;
- Llegamos;
- Recogido;
- No viaja hoy;
- aviso global de retraso solo a pendientes;
- historial de ruta.

## Aplicación familiar
PWA instalable en iPhone. Debe mostrar posición/autobús, estado del viaje y eventos familiares. Acceso normal 06:00–08:30; se diseñó extensión de seguridad para viaje activo retrasado.

## Seguridad
- RLS habilitado en tablas de transporte.
- Grants directos `anon`/`authenticated` revocados.
- RPC internas `mcs_*` revocadas para público/anon/authenticated y permitidas a service role según arquitectura servidor-only.
- Tokens familiares/admin se manejan por hash; no documentar secretos en el repositorio.
- No exponer service role ni VAPID private key al cliente.

## QA realizado
- GPS físico real: PASA.
- Recepción Edge/Supabase: PASA.
- Precisión física observada ~5.34 m: PASA.
- Dedupe near/arrival: probado previamente.
- Estado trip_stops: probado con rollback.
- Pickup/skip secuencial: probado con rollback.
- Cierre de viajes antiguos: PASA.
- Watchdog GPS: instalado.
- Seguridad grants/RPC: auditada.

## QA de 20 recorridos
El usuario solicitó ejecutar el recorrido en modo prueba 20 veces. El primer harness detectó correctamente una barrera `gps_not_ready`: el sistema no permite presentar un dispositivo QA sin GPS fresco como GPS real. Esta protección NO debe desactivarse para maquillar pruebas. Debe crearse un harness aislado que inyecte posiciones simuladas explícitamente etiquetadas como QA y nunca las confunda con certificación GPS física.

Estado: prueba 20x todavía pendiente de completar correctamente en sandbox/QA aislado.

## Pendientes prioritarios antes de declarar producción 100%
1. Ejecutar recorrido QA completo 20x en entorno aislado sin debilitar `gps_not_ready`.
2. Validar un recorrido físico real con historial continuo de principio a fin.
3. Suscribir un iPhone familiar y verificar Push real: prepare/near/arrival/delay/picked/completion según política.
4. Restaurar/auditar completamente las acciones de edición de paradas en Edge Function si la versión actual las regresionó.
5. Verificar que family snapshot use ventana dinámica de settings y devuelva ETA/distancia.
6. Corregir/validar bounded route_history por viaje/fecha.
7. Validar immediate push worker kick o depender explícitamente del cron documentado.
8. Añadir cierre manual/emergencia con semántica segura si se requiere.
9. Mostrar en admin diferencia visual entre picked y skipped.
10. Verificar comportamiento iOS con pantalla bloqueada, pérdida/recuperación 5G y movimiento prolongado.
11. ETA vial/tráfico real sigue pendiente; el cálculo geográfico no equivale a navegación por carretera.
12. Confirmar físicamente coordenada/radio exactos del colegio.
13. Validar permisos, disclosures de ubicación/background y Push antes de cualquier distribución App Store/Play Store.

## Regla de certificación
No declarar `100% production ready` únicamente por simulación. La certificación final exige evidencia de GPS físico real, recorrido físico completo, historial persistente, Push recibido en dispositivo real y ausencia de regresiones en frontend/backend.

## Separación de proyectos
**Mountain Transporte** es la aplicación de transporte. No confundir con **Mountain Family**, que es la aplicación integral tipo Brightwheel para comunicación/gestión familiar y tiene propósito distinto.
