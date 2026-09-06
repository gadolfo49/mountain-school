# Auditoría de MCS Transporte

**Fecha:** 6 de septiembre de 2026. **Material recibido:** `index.html` y `README.md`, creados en Claude. **Conclusión:** existe una base de planificación y simulación, con un mecanismo experimental de intercambio de GPS. No es todavía una aplicación operativa de seguimiento escolar privado y notificaciones móviles.

## Alcance y trazabilidad

Se inspeccionaron ambos archivos, la lógica de aplicación, dependencias integradas y puntos de comunicación. Se ejecutaron pruebas dirigidas del original en navegador y de la lógica nueva. No se auditó línea por línea la totalidad del código interno de React y Leaflet, ni existe certificación de seguridad o garantía de ausencia de errores. Una revisión amplia no equivale a cobertura del 100% ni a pruebas de producción.

Original HTML: 1.662.269 bytes. SHA-256:

`ee4894192a49066dd222a7cf010447d7ba397ebf7eadffb8ea8e928232a9abaa`

Las referencias siguientes corresponden a funciones y líneas de ese original, no a una versión futura. Los riesgos de acceso remoto describen lo que permite el cliente y lo que habría que verificar en el servidor; **no prueban una filtración real**.

## Hallazgos sobre los archivos recibidos

| Prioridad | Hallazgo y evidencia | Consecuencia / cambio necesario |
|---|---|---|
| Crítica | No hay inicio de sesión ni roles reales. `SimulationView` permite elegir cualquier estudiante y abrir controles del conductor. | Separar administración, conductor y familia. Autorizar cada lectura y acción en el servidor. |
| Crítica | `BUS_CHANNEL_NAME` es compartido; los hooks GPS usan `client.channel(...)` sin un canal privado ni identidad de conductor comprobada (35116, 35168-35250). | Si el proyecto admite canales públicos, conocer su configuración permite intentar leer o publicar. Se requiere autenticación, permisos por ruta y emisor autorizado. No se ensayó contra un backend real. |
| Crítica | `SERVICE_START_MIN` es 6:30 y el final es 18:00, inclusivo; usa el reloj local del dispositivo (35331-35340). | No cumple 06:00-08:30. Debe aplicarse hora del servidor en America/Santo_Domingo, con fin exclusivo a las 08:30. |
| Crítica | El mapa se renderiza antes del aviso fuera de horario; el marcador se muestra con `routeActive || realPositionFresh`. | Un mensaje de bloqueo no impide recibir coordenadas. Hace falta detener la entrega de datos, incluso en sesiones ya abiertas. |
| Alta | `pushNotification` solo actualiza arrays/contadores de React (35759-35762). | No existe envío al teléfono con la app cerrada. Faltan suscripciones push, worker, cola, permisos y entrega. |
| Alta | Las alertas y `remainingSeconds` dependen de `elapsed`, un reloj simulado, aunque el marcador use GPS real. | La proximidad puede no corresponder al autobús. El tiempo restante debe calcularse desde GPS validado, ruta y paradas pendientes. |
| Alta | `busShownPosition` usa GPS reciente o, si falta, `busLatLng` simulado (35929 y siguientes). | La pérdida de señal puede parecer movimiento normal. Nunca sustituir una posición real perdida por una animación ficticia. |
| Alta | `realPositionFresh` se calcula al renderizar, acepta fechas futuras y no valida rango ni precisión. | Datos obsoletos o malformados pueden parecer actuales. Mostrar antigüedad y validar precisión, orden y tiempo de captura. |
| Alta | `finalizeManual` no desactiva `gpsTransmitOn` (35893 y siguientes). | El texto dice que apagó el rastreo, pero la observación GPS puede continuar. |
| Alta | `MapCanvas` pasa texto editable directamente a `bindTooltip` (aprox. 35387). | Se reprodujo ejecución local de HTML con un marcador inofensivo. Usar nodos con `textContent` o saneamiento apropiado. No hubo exfiltración. |
| Alta | Rutas/estudiantes se guardan en `localStorage`; abordajes, ausencias, incidentes y avisos son estado local de React. | El teléfono del padre no comparte automáticamente esos datos con el del conductor. Hace falta una fuente central persistente. |
| Alta | Llegada al colegio cambia `leg` a `pm` y reinicia `elapsed`, pero su comprobación exige `leg === am`. | Se registra el evento pero puede no mostrarse la confirmación correcta al padre. |
| Media | `computeEstimatedRoute` aplica Haversine x 1,3 y velocidad fija de 22 km/h (35272-35286). | No calcula calles, giros, sentidos únicos ni tráfico. Los sectores no sustituyen los puntos particulares de recogida. |
| Media | Se mezclan metros incrementados un 30% con geometría sin incrementar. | A mitad del tiempo el marcador alcanza el 65% del tramo, no el 50%. |
| Media | La vista del teléfono tiene ancho fijo de 360 px más espacios externos. | Desbordamiento observado en ventanas de 320 y 360 px. |
| Media | La acción de simular calcula el plan actual pero puede recargar una copia guardada anterior. | Cambios recientes pueden no reflejarse al comenzar. |
| Media | Sin punto de partida, el recorrido matutino comienza en el primer sector. El texto de salida del colegio corresponde a la tarde. | No representa necesariamente la salida matutina desde el colegio solicitada por el usuario. |
| Media | GPS usa `watchPosition` del navegador sin servicio nativo de fondo, confirmación de envío o cola sin conexión. | No se acredita continuidad con pantalla bloqueada, suspensión de pestaña o pérdida de datos móviles. |
| Media | React de desarrollo y dependencias empaquetadas; Supabase externo se carga con versión mayor `@2`, no exacta. | Dificulta mantenimiento, actualizaciones controladas y pruebas. Conviene fuentes modulares y dependencias fijadas. |
| Media | El mapa base usa teselas de Esri. Algunos textos de incidentes afirman notificación a administración sin envío real. Hay controles y valores de ejemplo. | Leaflet abierto no convierte todos los servicios en abiertos. Etiquetar funciones no operativas y no confirmar acciones inexistentes. |

### Aclaración sobre el README original

El README explica cómo publicar el HTML y compartir la misma configuración Supabase en cada teléfono. Eso no crea autenticación ni sincroniza el plan local. La clave publicable no es una contraseña familiar. Su seguridad depende de permisos reales y políticas adecuadas; el control de Broadcast requiere su propia configuración. No debe asumirse que una mención genérica a RLS resuelve el acceso.

## Resultados reproducidos localmente

| Comprobación | Original | Demostración corregida |
|---|---|---|
| Regla horaria a las 06:00 | Deniega | Permite |
| Regla horaria a las 08:30 | Permite | Deniega |
| Regla horaria a las 12:00 | Permite | Deniega |
| Fracción geométrica a mitad del tiempo | 65% | 50% |
| Script inofensivo en etiqueta editable | Se ejecuta | No se ejecuta |
| Ancho de documento en ventana de 320 px | 376 px | 320 px |
| Ancho de documento en ventana de 360 px | 376 px | 360 px |
| GPS tras finalizar | Sigue activo | Conexión real deshabilitada en toda la demo |
| Confirmación visible de llegada con alumno marcado a bordo | No | Sí |

El cambio del GPS es una desactivación preventiva, no la implementación de seguimiento privado. La demo corregida conserva controles de simulación accesibles y NO incorpora autenticación. El contador `visibleBus` del guion de auditoría cuenta marcadores del mapa; no debe interpretarse como número de autobuses.

**Piloto modular:** 7 comprobaciones funcionales aprobadas; vistas familiar y de planificación probadas a 320, 360, 390, 768 y 1280 px, sin desbordamiento. Cero errores JavaScript observados en esos ensayos.

**Política de referencia:** 24 pruebas unitarias aprobadas. Incluyen límites horarios, zona horaria, posición obsoleta/futura/imprecisa, falta de autenticación, ruta incorrecta, permiso inactivo, día incorrecto, corte durante una lectura en curso y respuestas sin datos ante fallos. Son pruebas con adaptadores simulados, no con la base de datos real.

## Lo que esta entrega no certifica

No hubo recorrido físico, GPS real, envío push a iPhone/Android, llamadas a OSRM, lectura autorizada entre cuentas reales, pruebas de carga, recuperación de copias, despliegue Supabase ni prueba de instalación de PWA en dispositivos reales. La red externa estuvo bloqueada en las pruebas de navegador: se probó el renderizador de mapa, no la disponibilidad de las teselas. No se revisaron políticas de una base de transporte activa porque no se encontró tal despliegue.

## Recomendación

Conservar la identidad y las funciones de planificación, separar ensayo y operación y construir primero la autorización del servidor. Después integrar GPS continuo, rutas por calles y una cola de alertas. No incorporar familias reales hasta superar la lista de aceptación de ARQUITECTURA.md.

Las propuestas técnicas y fuentes externas se encuentran en ARQUITECTURA.md; no se presentan como capacidades existentes en los archivos recibidos.
