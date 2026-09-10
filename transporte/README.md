# MCS Transporte — MVP operativo

Actualizado: 10 de septiembre de 2026.

## Estado actual

El proyecto cuenta con un MVP operativo conectado al proyecto Supabase `MCS Transporte` y al iPhone institucional mediante Traccar Client. El GPS real llega correctamente al receptor privado y se conserva la posición más reciente. A partir de esta revisión se está endureciendo la lógica de viaje para conservar historial, avanzar paradas y generar eventos operativos de forma verificable.

La interfaz familiar vive en `transporte/app/` y el panel administrativo en `transporte/admin/`. GitHub Pages sirve la interfaz estática; Supabase ejecuta la lógica privada, la recepción GPS y la cola de avisos.

## Funciones implementadas

- Recepción GPS privada desde Traccar Client con credencial específica del dispositivo.
- Seguimiento continuo habilitable para la unidad asignada a `Ruta AM Principal`.
- Rutas, paradas, familias y viajes persistentes en PostgreSQL.
- Enlaces privados por familia; los tokens se guardan solamente como SHA-256 en la base.
- Vista familiar que muestra únicamente su parada, el autobús y el estado de su viaje.
- Corte de ubicación del lado servidor de lunes a viernes entre 06:00 inclusive y 08:30 exclusive, zona `America/Santo_Domingo`, con posibilidad de extenderse automáticamente mientras exista un viaje activo dentro del límite operacional configurado.
- ETA y distancia restante aproximadas a partir de la posición GPS y el orden de paradas.
- Eventos operativos y manuales: inicio de ruta, preparar al niño, autobús próximo, llegada a parada, recogido y llegada al colegio.
- Web Push con VAPID almacenado en Supabase Vault, cola de trabajos y worker privado.
- Panel administrativo para agregar/quitar paradas, ver GPS, revisar distancias aproximadas, confirmar recogidos y generar el enlace privado de cada familia.
- Historial GPS persistente durante viajes activos y durante la ventana operativa de aprendizaje.

## Seguridad

Las tablas operativas tienen RLS habilitado y no conceden acceso directo a `anon` ni `authenticated`. Las interfaces hablan con Edge Functions que validan tokens privados. La ubicación familiar se filtra en el servidor por horario, viaje activo y asignación, no solamente en el navegador. Las claves secretas de Supabase y la clave privada VAPID no están en GitHub.

## Uso

1. Abrir el panel administrativo con el enlace privado entregado fuera del repositorio.
2. Confirmar el punto del colegio y las paradas reales.
3. Entregar a cada familia únicamente su enlace privado.
4. En iPhone, la familia puede añadir la PWA a la pantalla de inicio y activar notificaciones.
5. Al iniciar una ruta real, activar `Seguimiento continuo` en Traccar Client y pulsar `Iniciar ruta` en el panel.
6. Confirmar cada recogida desde el panel; el GPS complementa la automatización de proximidad y llegada.
7. Revisar el historial de ruta después del recorrido.

## Límites pendientes de validar en campo

- El punto del colegio debe confirmarse físicamente.
- El ETA sigue siendo una aproximación por distancia geográfica ajustada y velocidad operativa de referencia; todavía no usa tráfico en vivo.
- La entrega Web Push debe probarse en un iPhone familiar real con una suscripción registrada.
- Debe validarse seguimiento continuo con pantalla bloqueada, pérdida de 5G y ahorro de batería en un recorrido completo.
- Los enlaces privados constituyen el acceso del MVP; para una fase de mayor escala conviene migrar a cuentas familiares con Supabase Auth.
- Feriados/calendario escolar extraordinario quedan para una siguiente iteración.

## Privacidad operativa

No subir nombres completos de menores, domicilios, tokens o claves a GitHub. En el panel usar alias. Los puntos reales de recogida viven en la base privada. La API familiar no devuelve coordenadas fuera de la ventana operativa, salvo cuando exista un viaje activo que aún no haya terminado y no se haya alcanzado el límite extraordinario de seguridad.

## Componentes open source

- Leaflet para el mapa.
- OpenStreetMap como datos/cartografía base del MVP.
- PostgreSQL/Supabase para datos, funciones y seguridad.
- Traccar Client para emitir ubicación desde iPhone.
