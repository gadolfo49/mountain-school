# Mountain Transporte iOS — Native Tracker

Tracker iOS nativo que reemplaza a Traccar Client como fuente GPS principal.

## Diseño
- Core Location `kCLLocationAccuracyBestForNavigation`.
- `activityType = automotiveNavigation`.
- background location habilitado.
- `pausesLocationUpdatesAutomatically = false` durante seguimiento.
- filtro 5 m.
- credencial aleatoria de 256 bits almacenada en Keychain.
- cola offline persistente de hasta 5,000 posiciones.
- retransmisión automática cuando vuelve Internet.
- envío directo a `mcs-gps`.
- inicio de viaje mediante `mcs-native` solo después de posición GPS aceptada.
- indicadores GPS / permiso / Internet / servidor / cola / último envío.

## Seguridad
La app NO contiene service-role ni token administrativo. El token nativo se genera localmente y debe emparejarse una sola vez con el registro del dispositivo autorizado en backend. Nunca versionar el token real.

## Construcción
El proyecto usa `project.yml` (XcodeGen) para generar el `.xcodeproj`. También puede crearse un proyecto iOS en Xcode y añadir `MountainTransporte/MountainTransporteApp.swift`, habilitando Background Modes > Location updates y Automatic Signing.

## Emparejamiento
Antes del primer uso, la credencial nativa del iPhone debe asociarse de forma segura al `mcs_gps_devices` autorizado. La versión de producción deberá incluir flujo de emparejamiento mediante código de un solo uso; no se deben copiar tokens a código fuente.

## Criterio de aceptación de campo
No retirar Traccar como respaldo hasta completar al menos un recorrido físico completo y verificar: posiciones continuas, cola offline/recuperación, geocercas, todas las paradas, llegada al colegio y ausencia de huecos críticos con pantalla bloqueada.
