# ADR-0008 — Acceso a PostgreSQL y PostGIS

## Estado

Aceptada

## Contexto

El dominio relacional y geográfico requiere integridad, migraciones revisables, tipos útiles en TypeScript y acceso a capacidades específicas de PostGIS.

## Decisión

- Utilizar Drizzle ORM para consultas relacionales habituales y tipos derivados del esquema.
- Mantener migraciones SQL versionadas y revisadas; ninguna sincronización destructiva automática en entornos compartidos.
- Utilizar SQL parametrizado explícito para funciones espaciales, índices, operadores o planes de consulta que no deban ocultarse tras la abstracción.
- PostgreSQL/PostGIS es la fuente de verdad; ningún ORM genera ni sustituye los contratos públicos de la API.
- Toda entrada externa se valida en ejecución y toda modificación de esquema se prueba desde una base vacía y desde la versión anterior.

## Alternativas consideradas

- Prisma, por su cliente tipado generado y ergonomía.
- TypeORM, por su integración madura con NestJS.
- SQL directo con `pg`, sin ORM.

## Consecuencias

Drizzle ofrece una capa TypeScript ligera y mantiene cercanía con SQL; el equipo debe dominar SQL y revisar el SQL generado. La estrategia híbrida evita forzar al ORM a representar funcionalidades PostGIS y hace explícitas las migraciones. No se permite `synchronize`/push automático en integración o publicación.

## Fecha

2026-10-01
