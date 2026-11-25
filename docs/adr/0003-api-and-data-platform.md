# ADR-0003: API y plataforma de datos

- **Estado:** Aceptada
- **Fecha:** 2026-11-23
- **Decisores:** Equipo UniMovil

## Contexto

El producto contiene lugares, coordenadas, accesos, rutas e incidencias. Esos datos se relacionan entre sí y algunas consultas requieren proximidad o geometría. No todos los datos necesitan persistencia compartida durante el primer Sprint.

## Decisión

- La base de datos objetivo será PostgreSQL con PostGIS para geometrías e índices espaciales.
- Cuando exista un caso de uso que requiera servidor, NestJS expondrá una API REST documentada con OpenAPI. La aplicación móvil no tendrá acceso directo a la base de datos.
- Se usará Drizzle para el esquema y las migraciones, con SQL explícito para las operaciones PostGIS que el ORM no represente con claridad.
- El Sprint 1 usará un pequeño catálogo local con procedencia por registro; no se introducirá una base de datos vacía como infraestructura sin uso.
- El proveedor de alojamiento de PostgreSQL no queda elegido. Supabase se conserva como candidato, sujeto a verificar plan, límites, privacidad, titularidad institucional de la cuenta, backups y coste antes de crear un entorno.
- Autenticación, almacenamiento de imágenes y proveedor de rutas se decidirán en ADR separados cuando entren en el backlog refinado.

## Alternativas consideradas

- **Base de datos documental como fuente principal:** descartada porque lugares, categorías, incidencias y relaciones requieren integridad y consultas espaciales.
- **Supabase como dependencia de producto y acceso directo desde móvil:** descartada; PostgreSQL puede alojarse en Supabase, pero la API del producto conserva la autorización y reduce el acoplamiento.
- **PostgreSQL local desde Sprint 1:** no aporta valor al mapa y a la búsqueda sobre catálogo estático; se incorporará en el primer Sprint que requiera persistencia compartida.

## Consecuencias

- La estructura de datos debe conservar identificador, nombre, categoría, coordenadas, fuente, licencia y fecha de revisión cuando correspondan.
- Las migraciones serán explícitas, revisables y reproducibles; no se sincronizará automáticamente el esquema en entornos compartidos.
- El equipo mantendrá la opción de alojar PostgreSQL en otro proveedor compatible.
- No se crearán cuentas, proyectos cloud ni gastos durante el Sprint 1.

## Referencias

- [Supabase: PostGIS y consultas geográficas](https://supabase.com/docs/guides/database/extensions/postgis)
- [Historias de usuario de administración y datos](../user-stories/07-administration-and-data.md)
