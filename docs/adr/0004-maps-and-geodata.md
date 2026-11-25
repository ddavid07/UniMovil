# ADR-0004: mapas y datos geográficos

- **Estado:** Aceptada
- **Fecha:** 2026-11-23
- **Decisores:** Equipo UniMovil

> La selección de teselas para el incremento inicial queda actualizada por [ADR-0007](0007-development-basemap-provider.md). El resto de esta decisión sigue vigente.

## Contexto

El mapa es el núcleo del primer incremento. El motor de renderizado, el estilo, las teselas y los datos de lugares son decisiones relacionadas, pero tienen licencias, disponibilidad y costes distintos. Los datos disponibles en OpenStreetMap no implican que sus servidores públicos de teselas sean un servicio de producción.

## Decisión

- Se usará MapLibre React Native como motor de renderizado móvil.
- El motor se mantendrá independiente del proveedor de estilos y teselas.
- Para el proveedor de cartografía base del incremento inicial se aplicará ADR-0007. Las teselas de demostración de MapLibre tampoco se considerarán una dependencia apta para producción.
- Antes de cualquier piloto público se elegirá un proveedor de mapas mediante un ADR o una actualización de esta decisión, después de comparar cobertura de Moncloa, condiciones de uso, atribución, identificación de la aplicación, privacidad, límites y coste. La alternativa deberá ofrecer un servicio compatible con MapLibre o un despliegue propio.
- Los datos de lugares del primer catálogo podrán proceder de OpenStreetMap si cada registro conserva URL de origen, licencia y fecha de comprobación. La interfaz mostrará la atribución requerida. No se descargarán teselas en bloque ni se incorporará un mapa oficial de UCM como imagen hasta verificar permiso de reutilización.
- No se inferirá accesibilidad, apertura, acceso peatonal ni vigencia actual a partir de la mera existencia de un punto cartográfico.

## Alternativas consideradas

- **Usar `tile.openstreetmap.org` como servicio de producción:** descartado por disponibilidad best-effort, ausencia de SLA y requisitos de atribución, User-Agent identificable y caché.
- **Acoplar la aplicación a un proveedor comercial desde el inicio:** descartado hasta comparar términos y costes con las necesidades reales.
- **Usar solo un mapa raster estático:** descartado porque impediría la interacción y selección de lugares requerida por HU-010 y HU-013.

## Consecuencias

- El Sprint 1 debe demostrar un development build nativo en Android e iOS.
- El mapa del Sprint 1 es una integración de desarrollo, no una autorización para publicar la aplicación.
- Un proveedor de teselas y la licencia de los datos son dependencias de liberación, no detalles que puedan ignorarse al publicar.
- El equipo debe incluir atribución visible y conservar un registro de procedencia de cada dato reutilizado.

## Referencias

- [MapLibre React Native: proveedor para desarrollo y producción](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/)
- [MapLibre React Native: configuración Expo](https://maplibre.org/maplibre-react-native/docs/setup/expo/)
- [Política oficial de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- [Catálogo previo del proyecto, usado solo como fuente a revisar](https://github.com/ddavid07/UniMovil/tree/main/apps/mobile/src/features/campus/data)
