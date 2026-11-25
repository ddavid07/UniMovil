# Architecture Decision Records (ADR)

Esta carpeta contiene decisiones aceptadas para el desarrollo local. ADR-0014–0018 registran Supabase, identidad, evidencias privadas, certeza de accesibilidad y publicación controlada. Los documentos se redactan en español y los nombres de archivo siguen la convención inglesa `NNNN-short-title.md`.

## Decisiones y propuestas

1. [Plataformas y alcance de producto](0001-product-platform-and-scope.md): aplicaciones nativas Android/iOS y acceso público web; administración separada.
2. [Arquitectura y stack tecnológico](0002-application-architecture-and-stack.md): Expo, React Native, TypeScript, MapLibre, NestJS y cliente administrativo React/Vite.
3. [API y persistencia](0003-api-and-data-platform.md): API REST/OpenAPI, PostgreSQL/PostGIS y Drizzle; la selección de proveedor se resuelve en ADR-0014.
4. [Mapas y datos geográficos](0004-maps-and-geodata.md): MapLibre, datos con procedencia trazable y proveedor de teselas desacoplado.
5. [Toolchain y estándares de desarrollo](0005-toolchain-and-coding-standards.md): Node LTS, npm workspaces, TypeScript estricto y controles de calidad.
6. [Gobierno de GitHub y CI](0006-github-governance-and-ci.md): PR y CI requeridos, auto-merge sin aprobación obligatoria, seguridad y Dependabot.
7. [Proveedor de cartografía base para el incremento inicial](0007-development-basemap-provider.md): teselas raster de OpenStreetMap con identificación, atribución y uso interactivo limitado.
8. [Delimitación cartográfica del Campus de Moncloa](0008-campus-boundary-source.md): geometría comunitaria de OpenStreetMap, conservada localmente con versión y licencia trazables.
9. [Consulta puntual de ubicación en primer plano](0009-foreground-location-permissions.md): permiso bajo demanda, lectura puntual, tratamiento local y excepción de validación nativa iOS del Sprint 2.
10. [Cliente público web](0010-public-web-client.md): alcance de navegador para las funciones públicas y sus diferencias respecto al cliente administrativo.
11. [Cliente web público y renderizadores cartográficos](0011-public-web-client-and-map-renderer.md): Expo Web estático con Leaflet en navegador y MapLibre en móvil.
12. [Cálculo local de rutas peatonales](0012-campus-pedestrian-routing.md): grafo OSM del campus, cálculo local y límites de cobertura.
13. [Horarios GTFS EMT y rutas de autobús](0013-emt-gtfs-and-transit-routing.md): horarios programados trazables y alternativa directa multimodal.
14. [Supabase como plataforma gestionada de datos](0014-supabase-managed-platform.md): proveedor elegido para PostgreSQL/PostGIS, Auth y Storage en Frankfurt; los Sprints 5–7 usan Supabase local.
15. [Identidad Supabase y sesiones](0015-supabase-auth-and-sessions.md): Auth, autorización de API, almacenamiento seguro móvil y sesión web BFF.
16. [Evidencias privadas de incidencias](0016-private-incident-evidence-storage.md): bucket privado, validación, límites, normalización y acceso autenticado.
17. [Certeza de datos de accesibilidad](0017-accessibility-data-confidence.md): procedencia, estados de certeza y límites de las rutas accesibles.
18. [Visibilidad y moderación de incidencias](0018-incident-visibility-and-moderation.md): informes privados por defecto y publicación bajo revisión autorizada.

## Convención

- Registra en un ADR una decisión técnica o de producto que afecte a la estructura, despliegue, operación o mantenimiento.
- Una decisión aceptada no se sobrescribe: si cambia, crea un ADR nuevo que identifique el ADR sustituido.
- Distingue las decisiones adoptadas de los proveedores o detalles expresamente aplazados.
- Usa [0000-template.md](0000-template.md) para decisiones futuras.
