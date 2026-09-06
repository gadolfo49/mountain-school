# Diseño propuesto y criterios de aceptación

**Propuesta, no implementación desplegada.** Este documento amplía la auditoría con recomendaciones y documentación oficial consultada el 6 de septiembre de 2026.

## Componentes

| Componente | Recomendación |
|---|---|
| Interfaz de familias | PWA móvil, accesible y con inicio de sesión. Una familia solo ve sus hijos y la ruta autorizada; no una lista de todos los estudiantes. GitHub puede alojar código e interfaz estática, no el servidor privado. [1] |
| GPS del autobús | Teléfono institucional con rastreador nativo de fondo o equipo GPS dedicado. Traccar es una opción abierta; configurar un servidor propio/autorizado, nunca usar el servidor de demostración para datos de menores. [2] |
| Servidor | Autenticación, permisos por familia/ruta, viajes, paradas, posiciones, eventos y cola de avisos. Supabase/PostgreSQL con RLS puede cubrir parte de esta infraestructura; no está configurado en esta entrega. [3] |
| Mapa y distancias | Leaflet con datos de OpenStreetMap y teselas de un servicio apropiado. OSRM o Valhalla para carretera, geometría, distancias y duraciones. No equivalen por sí solos a tráfico en vivo. [4][5] |
| Alertas | Web Push desde servidor y registro persistente de suscripciones, eventos e intentos. En iPhone se debe validar instalación en pantalla de inicio, compatibilidad, permiso solicitado por acción del usuario y configuración del dispositivo. [6] |

No hace falta un modelo generativo para decidir que el autobús se acerca. Primero convienen reglas comprobables, GPS validado y estimación de llegada. El aprendizaje de duraciones históricas podría añadirse después de reunir datos fiables.

## Horario privado: 06:00 inclusive a 08:30 exclusive

Usar hora del servidor y zona `America/Santo_Domingo`. La propuesta conserva lunes a viernes, como el original; confirmar calendario escolar, feriados y servicios extraordinarios antes de operar. La vista de un padre requiere simultáneamente usuario autenticado, vinculación vigente, ruta asignada, viaje del día y ventana abierta.

El servidor debe denegar cada lectura fuera de horario. También debe impedir una suscripción directa que siga recibiendo GPS después del corte: ocultar el mapa no basta. Las autorizaciones de canales Realtime pueden permanecer en caché durante la conexión; no asumir que una condición horaria de ingreso expulsa al cliente a las 08:30. [3]

Para una primera versión, un endpoint privado consultado aproximadamente cada 5-10 segundos simplifica la comprobación de permisos y horario. Es un intervalo de diseño a medir, no una latencia garantizada. Otra opción es un flujo privado publicado exclusivamente por el servidor, que detenga las coordenadas para familias al terminar la ventana. No exponer el flujo bruto del rastreador al navegador del padre.

Las respuestas no deben contener datos de otras familias ni guardar coordenadas en caché. Revalidar el horario después de operaciones lentas, limpiar el marcador al expirar y no conservar historial local. No es posible retirar capturas de pantalla o información que alguien ya observó durante el acceso autorizado.

El colegio puede conservar un seguimiento interno separado durante una demora, con permisos propios. Un aviso textual de llegada posterior a las 08:30 puede enviarse sin reabrir acceso a la ubicación. La hora límite no debe provocar un mensaje falso de llegada ni cortar la supervisión interna.

## Motor de eventos proactivos

| Evento | Evidencia requerida | Mensaje orientativo |
|---|---|---|
| Inicio de ruta | Viaje autorizado iniciado y salida real confirmada del colegio. La hora programada por sí sola no prueba movimiento. | El autobús inició la ruta de recogida. |
| Preparación | Tiempo estimado hasta la parada, incluyendo calles, orden de visitas y esperas. Umbral inicial a calibrar: 6-10 minutos. | Por favor, ten al niño listo. Nos estamos acercando. |
| Proximidad | Tiempo estimado más corto, por ejemplo 2-3 minutos, para la parada pendiente correcta. | Estamos próximos a tu punto de recogida. |
| Autobús en la parada | Varias lecturas GPS fiables dentro de una geocerca y permanencia suficiente. Un radio inicial de 50-100 m requiere validación de campo. | El autobús ha llegado al punto de recogida. |
| Abordaje | Confirmación de personal autorizado, no inferencia a partir del GPS. | Se registró el abordaje de tu hijo. |
| Autobús en colegio | Entrada y permanencia en geocerca escolar comprobada. | El autobús llegó al colegio. |
| Niño recibido | Registro individual de entrega/recepción por personal. | La recepción de tu hijo en el colegio fue confirmada. |

Los umbrales son propuestas, no medidas validadas de esta ruta. Utilizar histéresis para no alternar eventos por saltos GPS. No avisar llegada a una casa solo por pasar cerca si no es la parada pendiente. Detener alertas de recogida para ausentes o ya abordados.

Una clave persistente por viaje, destinatario, parada y tipo de evento evita duplicados. Guardar cola, reintentos y caducidad para descartar avisos que ya no tienen sentido. Distinguir aceptación por el servicio push, entrega al dispositivo y lectura por el padre; no afirmarlas sin evidencia. Mantener un canal humano de contingencia.

## Uso móvil y código abierto

La PWA reduce la necesidad de instalar una aplicación distinta para cada plataforma. Sin embargo, un capturador GPS en navegador no demuestra continuidad con pantalla bloqueada. El complemento estándar de geolocalización de Capacitor tampoco ofrece directamente geolocalización de fondo. Empaquetar el HTML no resuelve por sí solo ese requisito. [7]

Separar la aplicación de las familias del dispositivo de seguimiento del conductor. Validar permisos, batería, pérdida de conexión, cola de posiciones, reanudación y sello temporal. La aplicación nunca debe obligar al conductor a operar controles mientras conduce.

Código abierto no significa coste de operación cero: servidor, datos móviles, teselas, copias, mantenimiento y servicios opcionales deben presupuestarse. Las notificaciones web utilizan servicios de plataforma; no todo el trayecto de entrega es infraestructura autogestionada. WhatsApp y SMS no están incluidos.

## Lista de aceptación antes de incorporar familias

1. **Permisos:** dos familias de prueba y un conductor; comprobar que ninguna familia lee o altera la ruta ajena ni accede a funciones administrativas. Probar API directa e identificadores alterados.
2. **Corte horario:** mantener una sesión abierta de 08:29 a 08:31. Verificar REST, suscripciones y caché. Cambiar el reloj/zona del teléfono no debe reabrir el acceso.
3. **Ruta real de adultos:** comprobar distancia por calles frente a la conducción, pasos de una vía, paradas, esperas, desvíos y precisión de llegada.
4. **Dispositivos físicos:** Android/iPhone, bloqueo de pantalla, modo ahorro, llamada entrante, cierre/reapertura, batería baja y permiso de ubicación denegado. No sustituir estos ensayos por tamaños de ventana de un navegador de escritorio.
5. **Alertas:** permisos aceptados/rechazados, padre sin la web abierta, suscripción caducada, red intermitente, duplicados, ausencia, niño ya recogido y aviso que llega tarde.
6. **Calidad y contingencia:** GPS viejo/futuro/impreciso, desconexión, retraso después de las 08:30 y verificación humana de recepción. No afirmar que un niño llegó solo porque llegó el autobús.
7. **Operación:** calendario confirmado, ubicación real del colegio, puntos autorizados, consentimiento y acceso, retención limitada, auditoría, copias y restauración probada. Claves secretas nunca en GitHub público.

## Documentación oficial consultada

[1] GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

[2] Traccar Client: https://www.traccar.org/client/

[3] Supabase Realtime Authorization: https://supabase.com/docs/guides/realtime/authorization

[4] OSRM HTTP API: https://project-osrm.org/docs/v5.24.0/api/

[5] OpenStreetMap Tile Usage Policy: https://operations.osmfoundation.org/policies/tiles/

[6] WebKit Web Push for Web Apps on iOS and iPadOS: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/

[7] Capacitor Geolocation: https://capacitorjs.com/docs/apis/geolocation
