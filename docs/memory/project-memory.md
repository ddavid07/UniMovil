# Memoria del proyecto UniMovil

## Contexto

UniMovil ayuda a estudiantes y visitantes a orientarse por el Campus de Moncloa de la Universidad Complutense de Madrid. El catálogo inicial prioriza lugares públicos y mantiene la procedencia de cada dato cartográfico.

## Alcance del producto

El producto público se ofrece en aplicaciones Android/iOS y navegador web; la administración web es una aplicación separada. Los incrementos de los Sprints 1–7 están implementados en la copia local: mapa, búsqueda, rutas, transporte, recursos de movilidad, cuenta, favoritos e incidencias. Android y web se validan con las herramientas disponibles; iOS nativo no se valida en este entorno por falta de macOS/Xcode. La base local de Sprints 6–7 usa Supabase, API NestJS y datos sintéticos. No se ha desplegado ni enlazado un proyecto Supabase remoto.

## Personas interesadas

- Estudiantes y visitantes que necesitan encontrar lugares del campus.
- El equipo que mantiene el producto, sus datos y su documentación.
- La Universidad Complutense de Madrid como institución a la que pertenece el campus representado.

## Forma de trabajo

Scrum es el marco de trabajo del proyecto. La metodología está en [methodology/](../methodology/README.md), los planes e incrementos en [iterations/](../iterations/README.md), y las actas se conservan en [meetings/](../meetings/) cuando las reuniones han ocurrido. Las historias y el backlog se mantienen en sus directorios específicos.

## Base técnica

El cliente móvil usa Expo, React Native, Expo Router, TypeScript y MapLibre; el cliente web usa React Native Web y Leaflet mediante una exportación de Expo. El catálogo, el grafo peatonal y GTFS se conservan localmente con procedencia. NestJS ofrece REST/OpenAPI; Supabase local ejecuta Auth, PostgreSQL/PostGIS y Storage; Drizzle conserva el esquema y las migraciones. La web usa un BFF NestJS con cookie segura, mientras los clientes nativos usan SecureStore. Las decisiones técnicas vigentes y sus alternativas están registradas en [ADR](../adr/README.md).

Los datos de lugares pueden proceder de OpenStreetMap si cada elemento conserva su fuente, licencia y fecha de comprobación. El mapa base usa teselas raster estándar de OpenStreetMap para visualización interactiva de bajo volumen, con atribución visible y sin precarga ni uso offline. Las condiciones para un piloto o publicación están sujetas al [ADR-0007](../adr/0007-development-basemap-provider.md).

## Referencias principales

- [Historias de usuario](../user-stories/README.md)
- [Product Backlog](../backlog/product-backlog.md)
- [Sprint 1](../iterations/sprint-01/README.md)
- [Sprint 2](../iterations/sprint-02/README.md)
- [Sprint 3](../iterations/sprint-03/README.md)
- [Sprint 4](../iterations/sprint-04/README.md)
- [Sprint 5](../iterations/sprint-05/README.md)
- [Sprint 6](../iterations/sprint-06/README.md)
- [Sprint 7](../iterations/sprint-07/README.md)
- [Decisiones arquitectónicas](../adr/README.md)
- [Fuentes de datos y atribuciones](../development/data-sources.md)
