# MCS Transporte - receptor privado de prueba

Actualizacion: 6 de septiembre de 2026. Este componente YA fue desplegado en el nuevo proyecto MCS Transporte. No es la aplicacion completa de familias.

## Alcance

Recibe una posicion autorizada del telefono mediante HTTP compatible con OsmAnd o el formato JSON de Traccar Client. El identificador es una credencial de escritura de 256 bits generada aleatoriamente, no el numero de telefono ni el identificador corto anterior. Solo se almacena su hash SHA-256. La credencial real se entrega por separado, nunca en este repositorio.

El receptor no tiene endpoint de lectura de posiciones, no devuelve coordenadas y no habilita usuarios familiares. No esta conectado con el mapa del piloto web. Todavia NO implementa rutas por calles, avisos push, abordajes, cuentas familiares ni autorizacion horaria 06:00-08:30. Las familias no tienen acceso en ningun horario durante esta prueba.

`verify_jwt=false` permite que el protocolo del rastreador llegue al manejador; NO elimina la autenticacion propia. El manejador valida la credencial y la RPC restringida a `service_role` aplica vencimiento, estado del dispositivo, cupo, frescura, precision y limites de frecuencia. Las claves Supabase solo se leen de variables de entorno del servidor.

## Protecciones configuradas

- Tablas con RLS y sin permisos para `anon` o `authenticated`.
- RPC `SECURITY INVOKER`, no invocable por usuarios anonimos ni familiares.
- Una posicion aceptada por el cupo configurado para la prueba del telefono; no crear un historial personal.
- Hasta 100 m de precision, antiguedad maxima 3 minutos y tolerancia futura 5 segundos, ajustables despues de prueba de campo.
- Rechazo de duplicados o posiciones fuera de orden; bloqueo de fila para consumo atomico del cupo.
- Cuerpo maximo 64 KiB; respuestas sin posicion ni secretos; sin registro propio de payloads.
- Borrado programado de la ultima posicion a los 30 minutos, en un ciclo de 5 minutos. No es una garantia de purga de registros o copias del proveedor. Los protocolos que usan parametros de URL pueden dejar esos parametros en registros de infraestructura; usar solo credenciales temporales para esta prueba.
- Limite de 60 contactos por minuto por dispositivo registrado. No sustituye proteccion perimetral ni pruebas de carga frente a trafico no autenticado.

## Verificacion realizada

34 pruebas locales de JavaScript aprobadas con Node.js 22.16.0. Ejecutar `node --test tests/receiver.test.mjs`.

16 aserciones sobre PostgreSQL remoto aprobaron controles de acceso, clave desconocida, coordenadas, precision, frescura, futuro, cupo, orden, frecuencia, vencimiento y desactivacion.

6 solicitudes HTTPS reales al receptor desde PostgreSQL: salud 200; identificador invalido 401; JSON sintetico 200 aceptado; dos envios OsmAnd concurrentes consumieron solo un cupo; credencial desconocida 401. Se utilizaron coordenadas sinteticas (0,0), no el GPS del usuario. Se eliminaron el dispositivo y posiciones de prueba al finalizar.

El asesor de seguridad quedo sin WARN/ERROR en la consulta final. Permanecen dos avisos INFO `rls_enabled_no_policy`: son intencionales, pues no hay acceso familiar. Documentacion: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Se corrigieron permisos del activador RLS creado por la plataforma y se verifico que sigue activando RLS. Se retiro la extension pg_net utilizada solo para pruebas HTTP. El trabajo programado de borrado ya ejecuto correctamente (sin posiciones caducadas en esa ejecucion).

## Estado de pendientes

No se ha verificado una ubicacion procedente del iPhone ni el seguimiento con pantalla bloqueada. La prueba del usuario debe mantenerse con seguimiento continuo apagado y pulsar Enviar ubicacion una vez tras configurar el destino y la credencial. El resultado de la app no sustituye comprobar la recepcion en la base.

`schema.sql` documenta el esquema instalado; NO ejecutarlo otra vez en el proyecto configurado. Las migraciones efectivas se registraron en Supabase con los nombres `mcs_private_single_fix_gps_receiver`, `mcs_enable_http_verification` y `mcs_close_setup_advisor_findings`.

No se modifico el proyecto antiguo pausado, no se importo su respaldo, no se contrato un plan y no se fusiono la rama de GitHub con main.

## Fuentes oficiales

https://www.traccar.org/osmand/
https://www.traccar.org/traccar-client-sdk/
https://supabase.com/docs/guides/functions/function-configuration
https://supabase.com/docs/guides/functions/secrets
https://supabase.com/docs/guides/api/securing-your-api

La licencia de este codigo nuevo es MIT bajo el archivo LICENSE.new-code.txt; no cambia los derechos del original de Claude ni de dependencias externas.
