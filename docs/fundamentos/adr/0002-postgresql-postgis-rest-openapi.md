# ADR-0002 — Supabase, PostgreSQL, PostGIS, REST y OpenAPI

## Estado

Aceptada

## Contexto

UniMovil manejará usuarios, lugares, edificios, paradas, rutas, incidencias y datos geográficos. El backend debe poder ser consumido por la aplicación móvil y por futuras herramientas administrativas.

## Decisión

- Utilizar Supabase como plataforma gestionada de datos.
- Utilizar PostgreSQL como base de datos principal a través de Supabase.
- Activar PostGIS para operaciones geográficas.
- Exponer una API REST sobre HTTPS.
- Documentar la API mediante OpenAPI.
- Mantener la aplicación móvil separada de la base de datos.

## Alternativas consideradas

- MongoDB u otra base de datos documental.
- API GraphQL como contrato principal.
- Acceso directo de la aplicación móvil a la base de datos.

## Consecuencias

### Positivas

- PostgreSQL ofrece relaciones, transacciones y madurez.
- PostGIS permite trabajar con puntos, rutas, zonas y distancias.
- REST facilita integrar móvil, panel administrativo y servicios externos.
- OpenAPI permite documentar, probar y generar clientes.

### Negativas

- El equipo debe aprender conceptos geoespaciales y migraciones.
- La API necesita versionado y disciplina de contratos.
- Las consultas geográficas deben optimizarse y probarse.

## Fecha

2026-09-29
