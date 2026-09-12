# Mountain Family v18 — Mounty QA50

Nombre corto de referencia: **MF18-Mounty-QA50**

Esta es la versión consolidada de Mountain Family alcanzada el 12 de septiembre de 2026 después de recuperar la app principal v3, corregir el acceso administrativo y reinstalar la capa operativa de Mounty.

## Estado funcional consolidado

- Aplicación principal en GitHub Pages: https://gadolfo49.github.io/mountain-school/
- Repositorio: gadolfo49/mountain-school
- Acceso administrador por PIN configurado y funcional.
- Perfiles: administrador, maestras y familias.
- Seis grados de Nivel Inicial: Maternal, Infantes, Párvulos, Pre-Kínder, Kínder y Preprimario.
- Primer Ciclo y Segundo Ciclo.
- Varias maestras por grado mediante `mf_classroom_staff`.
- Administración de estudiantes, usuarios, vínculos familia-estudiante y asignaciones de maestras.
- Rutina diaria por aula con estados individualizados para desayuno, almuerzo, siesta, higiene, aprendizaje y cuidado.
- Entrada/salida, incidentes, autorizados, pagos, documentos, seguridad, planificación y seguimiento CRECE.
- Comunicación masiva por toda la comunidad, ciclo, grado o estudiantes seleccionados.
- Seguimiento de entregado/leído en comunicaciones.
- Carga de imágenes, videos, audio y documentos aprobados desde dispositivo móvil.
- Evidencias para estudiante, selección, grado, ciclo o comunidad.
- Multimedia cotidiana marcada como transitoria con caducidad aproximada de 24 horas y limpieza de archivos expirados.

## Mounty Guide / agente IA

- Mounty Guide visible para administración y maestras.
- El personal aporta contexto/hechos; Mounty redacta el mensaje listo para revisión.
- Generación asistida para mensajes individuales y colectivos.
- Rutinas generan trabajos de agente y borradores personalizados por estudiante.
- Casos contemplados: desayuno, almuerzo, siesta, higiene, aprendizaje, cuidado, incidentes, recordatorios y mensajes generales.
- Soporte de idioma familiar.
- Toda salida requiere revisión humana antes del envío.
- Mounty no debe inventar diagnósticos, conductas, cantidades, emociones o logros no presentes en el contexto.
- Ajuste realizado al modelo para reducir razonamiento innecesario y evitar respuestas cortadas/vacías.

## QA de esta versión

Se ejecutó una batería de **50 pruebas**:

- 45 pruebas de datos, estructura y lógica: 45/45 aprobadas.
- 5 pruebas reales de Mounty: 5/5 aprobadas tras corregir un problema de respuestas truncadas.

La batería incluyó estudiantes ficticios, familias ficticias, seis grados, vínculos familia-estudiante, rutinas, CRECE, mensajes por distintos alcances, trabajos/borradores de agente, multimedia transitoria y caducidad.

Durante QA se encontraron y corrigieron dos defectos reales:

1. Mounty podía devolver respuestas vacías/cortadas por configuración de salida del modelo.
2. `mf_enqueue_agent_job()` podía intentar leer campos incorrectos según el tipo de registro.

Después de corregirlos, las 50 pruebas quedaron en verde.

Al terminar el QA se verificó limpieza: 0 estudiantes QA, 0 familias QA, 0 comunicaciones QA y 0 eventos QA residuales.

## Regla de referencia

Cuando se diga **MF18-Mounty-QA50**, se debe entender esta versión como el punto base mínimo. Las mejoras futuras deben partir de aquí y no regresar a interfaces antiguas o prototipos `/family/` simplificados.
