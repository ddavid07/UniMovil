# ADR-0014: Supabase como plataforma gestionada de datos

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0002 y ADR-0003

## Contexto

Los Sprints 6 y 7 necesitan identidad, persistencia compartida y almacenamiento de evidencias. ADR-0003 fija PostgreSQL/PostGIS, NestJS y Drizzle, pero dejaba pendiente el proveedor gestionado. Supabase se ha seleccionado como plataforma para cubrir esa necesidad.

## Decisión

- Supabase será la plataforma gestionada para alojar PostgreSQL con PostGIS y los servicios Supabase Auth y Supabase Storage que necesite el producto.
- NestJS seguirá siendo la única API de negocio para leer o modificar datos de UniMovil. Los clientes no consultarán directamente las tablas de la aplicación ni utilizarán la clave secreta de Supabase.
- Drizzle seguirá definiendo el esquema de la aplicación y sus migraciones, conforme a ADR-0003. Supabase CLI se usará para ejecutar servicios locales compatibles y gestionar la configuración reproducible de Auth y Storage; no se mantendrán dos fuentes distintas de migraciones de la base de datos.
- Frankfurt (`eu-central-1`) será la región del proyecto gestionado. Crear o usar un proyecto con datos reales sigue sujeto a aprobación de titularidad, tratamiento, condiciones, costes y requisitos institucionales.
- El desarrollo local utilizará el stack local de Supabase con datos ficticios. Los secretos se mantendrán fuera del repositorio y de las aplicaciones cliente.
- El desarrollo y sus comprobaciones locales usan datos ficticios. El trabajo de los Sprints 5–7 continúa sin proyecto gestionado y sin depender de validaciones externas; desplegar el servicio o cargar datos reales queda fuera de este incremento.

## Alternativas consideradas

- **PostgreSQL autogestionado:** descartada como opción preferida por la carga operativa adicional de mantener base de datos, autenticación y almacenamiento.
- **Firebase u otra base de datos no relacional como plataforma principal:** descartada porque no coincide con la decisión vigente de PostgreSQL/PostGIS ni con los datos relacionales y espaciales del producto.
- **Acceso directo desde las aplicaciones a tablas de negocio:** descartado; se conserva la API NestJS como frontera de autorización y dominio.

## Consecuencias

- La falta de una organización, un proyecto gestionado, un SMTP de producción y validaciones institucionales se acepta como riesgo para el desarrollo local de los Sprints 5–7. No bloquea la implementación ni las pruebas con identidades sintéticas.
- El entorno local debe reproducir Auth, PostgreSQL/PostGIS y Storage mediante configuración versionada y datos sintéticos.
- Los roles de ejecución de NestJS tendrán permisos mínimos y separados de los usados para migraciones. Los secretos de servicio solo residirán en el servidor.
- La autenticación, las sesiones de navegador, las reglas de autorización y el ciclo de vida de las evidencias se especifican en ADR separados.
- El proveedor se acopla a adaptadores del backend; el modelo de dominio no dependerá de tipos generados por APIs de Supabase.
- Esta decisión resuelve la selección de proveedor que ADR-0003 había dejado pendiente; sus decisiones de PostgreSQL/PostGIS, NestJS y Drizzle se mantienen.

## Referencias

- [ADR-0003: API y plataforma de datos](0003-api-and-data-platform.md)
- [Supabase: regiones disponibles](https://supabase.com/regions)
- [Supabase: desarrollo local y CLI](https://supabase.com/docs/guides/local-development)
- [Supabase: PostGIS](https://supabase.com/docs/guides/database/extensions/postgis)
