# MCS Transporte | Revisión técnica

**Mountain Creativity School · 6 de septiembre de 2026**

## Estado de la entrega

**Piloto de evaluación, NO sistema de transporte operativo.** No transmite GPS real, no autentica familias y no envía notificaciones al teléfono. No introducir nombres de menores, domicilios privados ni credenciales. La revisión conserva y analiza el material de Claude, sin confundir las propuestas con funciones ya implementadas.

Se distinguen tres piezas:

| Pieza | Alcance |
|---|---|
| `original/` (en el ZIP) | Los dos archivos originales, sin modificar. |
| `corregida/index.html` (en el ZIP) | El prototipo original con 29 cambios controlados: mejoras visuales, horario, estado de llegada, interpolación y tratamiento seguro de etiquetas. Se desactiva expresamente la conexión GPS pública. Sigue siendo una demostración. |
| `web/` | Nuevo piloto modular y adaptable a móviles. Incluye planificador de ensayo, mapa, avisos locales y prueba visual del corte a las 8:30. No sustituye todas las funciones del original. |

`server/parent-snapshot.cjs` es una **política de servidor de referencia**, con adaptadores inyectables y pruebas unitarias. No es una API desplegada ni está conectada a la interfaz. Faltan los adaptadores reales de autenticación, permisos y posiciones.

## Probar la interfaz

Desde esta carpeta, con Python instalado:

```sh
python3 -m http.server 8000 --directory web
```

Abrir `http://localhost:8000`. Para un sitio publicado se necesita HTTPS. Leaflet está fijado a la versión 1.9.4 con verificación de integridad; su descarga y las teselas del mapa necesitan Internet. En el ensayo, pulsar **Iniciar demostración** y **Probar 8:30**. Los nombres son alias ficticios y el reloj del ensayo está separado de la operación real.

Los valores iniciales del mapa proceden del prototipo; no acreditan la ubicación exacta del colegio ni de hogares. El cálculo sigue siendo una aproximación, NO una ruta por calles. No se envían puntos a un servidor público de enrutamiento. Las teselas OSM se usan solo para visualizar este piloto; antes de operar se debe contratar o alojar un servicio apropiado.

Se incluye manifiesto y un service worker para la estructura pública. No se almacenan respuestas de API, coordenadas ni teselas en ese caché. Esto no certifica la instalación ni el funcionamiento en segundo plano en iPhone o Android. El icono es provisional.

## Ejecutar las pruebas de referencia

Con Node.js 22 o compatible con `node:test`:

```sh
node --test tests/policy.test.cjs
```

Resultado obtenido: **24 pruebas aprobadas**. Comprueban horario, datos GPS y contrato de respuesta usando adaptadores simulados. NO comprueban un despliegue de Supabase.

En el ZIP se incluyen además los guiones de auditoría del original y del navegador, junto con resultados y capturas. El piloto pasó 7 comprobaciones funcionales y 10 combinaciones de vista/tamaño, sin desbordamiento horizontal ni errores JavaScript observados. Las pruebas se hicieron en Chromium automatizado, con reloj/GPS/conexiones simulados y sin teselas externas. No se ensayó una ruta real ni notificaciones en teléfonos físicos.

## GitHub y producción

El destino es una carpeta separada `transporte/` del repositorio existente `gadolfo49/mountain-school`, en una rama de revisión. No se sustituye su página principal. Una rama y una solicitud de revisión no equivalen a una aplicación desplegada en GitHub Pages. La interfaz pública de un futuro despliegue sería `transporte/web/`; el servidor privado debe ejecutarse en otra infraestructura.

La conexión de Supabase mostró un proyecto inactivo. No se reactivó, no se crearon tablas ni funciones y no se modificaron usuarios, claves, costes o permisos. No hay un backend de transporte operativo verificado.

Consultar [AUDITORIA.md](AUDITORIA.md) para los hallazgos y [ARQUITECTURA.md](ARQUITECTURA.md) para el diseño propuesto y la lista de aceptación. La licencia MIT adjunta se limita al código nuevo de este piloto; no reemplaza las licencias ni los derechos del material original o de terceros.
