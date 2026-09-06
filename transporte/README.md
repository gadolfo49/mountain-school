# MCS Transporte — MVP operativo

Actualizado: 6 de septiembre de 2026.

## Estado actual

El proyecto ya cuenta con un MVP operativo conectado al proyecto Supabase `MCS Transporte` y al iPhone institucional mediante Traccar Client. Se verificó un envío GPS real desde el iPhone hasta el receptor privado.

La interfaz familiar vive en `transporte/app/` y el panel administrativo en `transporte/admin/`. GitHub Pages sirve la interfaz estática; Supabase ejecuta la lógica privada, la recepción GPS y la cola de avisos.

## Funciones implementadas

- Recepción GPS privada desde Traccar Client con credencial específica del dispositivo.
- Seguimiento continuo habilitable para la unidad asignada a `Ruta AM Principal`.
- Rutas, paradas, familias y viajes persistentes en PostgreSQL.
- Enlaces privados por familia; los tokens se guardan solamente como SHA-256 en la base.
- Vista familiar que muestra únicamente su parada, el autobús y el estado de su viaje.
- Corte de ubicación del lado servidor de lunes a viernes entre 06:00 inclusive y 08:30 exclusive, zona `America/Santo_Domingo`.
- ETA y distancia restante aproximadas a partir de la posición GPS y el orden de paradas.
- Eventos automáticos: inicio de ruta, preparar al niño, autobús próximo, llegada a parada y llegada al colegio.
- Web Push con VAPID almacenado en Supabase Vault, cola de trabajos y worker privado. El worker fue verificado por HTTPS; la entrega a un teléfono familiar requiere registrar una suscripción real.
- Panel administrativo para agregar/quitar paradas, ver GPS, revisar distancias aproximadas y generar el enlace privado de cada familia.

## Seguridad

Las tablas operativas tienen RLS habilitado y no conceden acceso directo a `anon` ni `authenticated`. Las interfaces hablan con Edge Functions que validan tokens privados. La ubicación familiar se filtra en el servidor por horario y asignación, no solamente en el navegador. Las claves secretas de Supabase y la clave privada VAPID no están en GitHub.

Los avisos INFO `rls_enabled_no_policy` del asesor de Supabase son intencionales en este diseño: las tablas no se consumen directamente desde el navegador; el backend usa acceso de servicio.

## Uso

1. Abrir el panel administrativo con el enlace privado entregado fuera del repositorio.
2. Confirmar el punto del colegio y agregar las paradas reales usando alias operativos.
3. Entregar a cada familia únicamente su enlace privado.
4. En iPhone, la familia puede añadir la PWA a la pantalla de inicio y activar notificaciones.
5. Al iniciar una ruta real, activar `Seguimiento continuo` en Traccar Client. El servidor detecta la salida y procesa posiciones/eventos.
6. Realizar una ruta de campo antes de incorporar familias de forma general.

## Límites pendientes de validar en campo

- El punto del colegio actual procede del prototipo original y debe confirmarse físicamente.
- Las paradas reales todavía no se han cargado.
- El ETA actual es una aproximación: Haversine × 1,30 y velocidad operativa de referencia; no usa todavía un motor de calles/ tráfico en vivo.
- La entrega Web Push todavía no se ha probado en el iPhone de una familia porque aún no existe una suscripción familiar real.
- Falta probar seguimiento continuo con pantalla bloqueada, pérdida de 5G, ahorro de batería y un recorrido completo.
- Los enlaces privados constituyen el acceso del MVP; para una fase de mayor escala conviene migrar a cuentas familiares con Supabase Auth.
- Feriados/calendario escolar extraordinario y confirmación individual de abordaje/recepción del menor quedan para la siguiente iteración.

## Privacidad operativa

No subir nombres completos de menores, domicilios, tokens o claves a GitHub. En el panel usar alias. Los puntos reales de recogida viven en la base privada. Fuera de 06:00–08:30 la API familiar no devuelve coordenadas, aunque la administración interna pueda mantener supervisión separada.

## Componentes open source

- Leaflet para el mapa.
- OpenStreetMap como datos/cartografía base del MVP.
- PostgreSQL/Supabase para datos, funciones y seguridad.
- Traccar Client para emitir ubicación desde iPhone.

Open source no implica operación sin costo ni SLA. Antes de crecer, revisar límites de hosting, mapas, datos móviles y notificaciones.
