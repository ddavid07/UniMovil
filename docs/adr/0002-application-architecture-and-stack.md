# ADR-0002: arquitectura de aplicación y stack tecnológico

- **Estado:** Aceptada
- **Fecha:** 2026-11-23
- **Decisores:** Equipo UniMovil

## Contexto

El producto requiere aplicaciones móviles nativas, un cliente público de navegador incorporado posteriormente al alcance por ADR-0010, varias áreas funcionales y una interfaz administrativa separada. Mantener TypeScript como lenguaje común reduce la carga de aprendizaje; separar clientes y servidor evita que una aplicación dependa directamente de la base de datos.

## Decisión

Se adopta un monorepo TypeScript con npm workspaces y estas aplicaciones, incorporadas cuando las historias las necesiten:

| Componente              | Tecnología elegida                                                            | Momento                                             |
| ----------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| Aplicación móvil        | React Native 0.88.1, Expo SDK 58.0.26, Expo Router 58.0.32 y TypeScript 6.0.3 | Sprint 1                                            |
| Motor de mapas móvil    | `@maplibre/maplibre-react-native` 11.5.1                                      | Sprint 1                                            |
| Cliente público web     | Expo Web, React Native Web y Leaflet/React Leaflet en navegador               | Decisión técnica aceptada en ADR-0011; Sprint 3     |
| API                     | NestJS sobre Node.js, API REST documentada con OpenAPI                        | Cuando haya datos o casos de uso de servidor        |
| Cliente administrativo  | React, Vite y TypeScript                                                      | Cuando se refine el primer flujo administrativo     |
| Persistencia geográfica | PostgreSQL con PostGIS                                                        | Cuando el producto necesite persistencia compartida |

La aplicación se organizará por funcionalidades y separará presentación, dominio y acceso a datos. El Sprint 1 podrá usar un catálogo local versionado; no creará una API o una base de datos sin un caso de uso que las requiera.

MapLibre requiere una compilación nativa. La aplicación se probará con un development build; no se usará Expo Go como entorno de aceptación del mapa. Las versiones de Expo, React Native, MapLibre y sus módulos nativos se fijan en los manifiestos y el lockfile. La compatibilidad con React Native y la arquitectura nativa se comprueba antes de integrar el mapa.

## Alternativas consideradas

- **Una aplicación web como producto principal:** descartada porque no cubre el objetivo móvil Android/iOS.
- **Un backend y base de datos desde el primer commit:** descartado para el primer flujo, que puede servirse desde datos locales comprobables.
- **Cliente móvil conectado directamente a la base de datos:** descartado para conservar una frontera de seguridad y evitar acoplar la aplicación al proveedor de datos.
- **Tecnologías diferentes para cada cliente:** descartadas mientras TypeScript cubra móvil, API y administración.

## Consecuencias

- El equipo necesita conocer TypeScript y la compilación nativa de Android/iOS.
- La implementación web pública y el renderizador cartográfico se concretan en [ADR-0011](0011-public-web-client-and-map-renderer.md): Expo Web y React Native Web, con Leaflet en navegador y MapLibre en móvil. La matriz inicial se limita a Chromium de escritorio y ventana estrecha.
- El coste de los módulos nativos se debe medir en el spike del Sprint 1.
- NestJS, la aplicación administrativa y PostgreSQL/PostGIS quedan definidos como stack objetivo, pero no se implementan hasta que una historia los necesite.
- Las versiones exactas de Expo, Expo Router, React Native y MapLibre se conservan en el workspace móvil y en el lockfile.
- Si MapLibre no supera la prueba de compilación en ambas plataformas, se deberá registrar una decisión nueva antes de reemplazarlo.

## Referencias

- [Referencia oficial de versiones Expo](https://docs.expo.dev/versions/latest/)
- [MapLibre React Native: requisitos](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/)
- [Configuración de MapLibre con Expo](https://maplibre.org/maplibre-react-native/docs/setup/expo/)
- [NestJS: primeros pasos y requisitos](https://docs.nestjs.com/first-steps)
