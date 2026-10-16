# Agente Journals

Plataforma para administrar producción científica, académica y literaria del Dr. Gustavo A. Montaño Medina.

## Alcance
Repositorio maestro de referencias y metadatos de manuscritos, artículos, libros y otras obras; asistencia multiagente para revisión editorial, búsqueda de revistas, gestión bibliográfica, preparación de envíos y seguimiento.

## Arquitectura prevista
- Frontend: Next.js + TypeScript
- Backend: API segura; orquestador de agentes con autorizaciones por tarea
- Datos: PostgreSQL (Neon), con segregación de usuarios y auditoría
- Documentos: Google Drive privado; nunca almacenar manuscritos inéditos en GitHub
- IA: OpenAI con revisión humana de resultados y trazabilidad
- Publicación: Vercel
- Integraciones opcionales: Gmail, ORCID, Crossref y catálogos de revistas

## Protección
Este proyecto está en una rama de desarrollo, separada de main y del sistema escolar de transporte. El repositorio padre es PÚBLICO: esta carpeta incluye solamente especificaciones y código sin secretos ni datos sensibles. Se requiere un repositorio PRIVADO independiente antes de incorporar obras reales, credenciales y flujos con datos personales.

## Fases
1. Base documental y esquema.
2. Interfaz de biblioteca y autenticación.
3. Conectores y permisos.
4. Agentes de apoyo editorial.
5. Evaluación de resultados, pruebas y despliegue.

**Estado:** fundación técnica; no hay aplicación desplegada aún.
