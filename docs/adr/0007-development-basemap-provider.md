# ADR-0007: proveedor de cartografía base para el incremento inicial

- **Estado:** Aceptada
- **Fecha:** 2026-11-24
- **Decisores:** Equipo UniMovil

## Contexto

El estilo de demostración de MapLibre carga países, pero no muestra suficiente detalle urbano para orientar a una persona por Moncloa. La rama `main` de UniMovil ya resuelve la vista inicial con teselas raster estándar de OpenStreetMap y configura una cabecera `User-Agent` identificable mediante `TransformRequestManager`.

La política de OpenStreetMap permite la visualización interactiva normal si la aplicación identifica sus solicitudes, mantiene la atribución visible y respeta la caché del cliente. El servicio es de capacidad limitada, no ofrece SLA y prohíbe la descarga masiva y el uso offline.

## Decisión

- Para la integración inicial de desarrollo y demostración académica se usará `https://tile.openstreetmap.org/{z}/{x}/{y}.png` mediante una fuente raster de MapLibre.
- Las aplicaciones nativas enviarán `User-Agent: UniMovil/0.1` únicamente al host de teselas de OpenStreetMap. En navegador se conserva el agente de usuario normal; no se suplanta una cabecera que la plataforma no permite definir.
- Se mantendrá visible la atribución `© OpenStreetMap contributors`, enlazada a la página de derechos de OpenStreetMap, en las aplicaciones nativas y en web.
- El uso se limitará a la navegación interactiva de una persona. No habrá precarga, descarga de áreas, archivos de teselas ni modo offline para el mapa base. El cliente conservará su caché HTTP y no enviará directivas que la evadan.
- Esta decisión no autoriza un despliegue de alto volumen ni establece una garantía de disponibilidad. Antes de un piloto público se volverán a evaluar las condiciones de uso y la necesidad de un proveedor contratado o de autoalojamiento.
- Los datos OSM del catálogo y el servicio de teselas siguen siendo recursos distintos; cada registro del catálogo conservará su fuente, licencia y fecha de comprobación.

Esta decisión sustituye únicamente la restricción de usar MapLibre Demo Tiles durante la integración inicial establecida en [ADR-0004](0004-maps-and-geodata.md). El motor MapLibre, la trazabilidad de datos, la atribución y la selección de un proveedor apropiado para un piloto o publicación permanecen vigentes.

## Alternativas consideradas

- **MapLibre Demo Tiles:** descartadas para la vista inicial porque el estilo disponible no aporta calles y edificios de Moncloa.
- **Proveedor comercial con teselas vectoriales:** aplazado hasta comparar cobertura, precios, privacidad y condiciones del proyecto.
- **Autoalojar teselas:** aplazado porque requiere infraestructura y operación que el primer flujo no necesita.
- **Usar el mapa institucional de UCM como imagen o capa:** aplazado hasta conocer sus condiciones de reutilización.

## Consecuencias

- El estilo raster proporciona contexto urbano sin clave de API y conserva el motor de mapa independiente del proveedor.
- Cada solicitud al servicio público se identifica con un nombre de aplicación estable; ese nombre se actualizará al publicar otra versión.
- La aplicación necesita conexión para el fondo cartográfico. La lista local de lugares sigue disponible si las teselas no cargan.
- OpenStreetMap puede limitar o bloquear el servicio si aumenta el volumen o no se respeta la política. La disponibilidad no forma parte de la aceptación del producto.
- El fondo raster no define el límite del campus; la geometría delimitadora y sus condiciones de uso se documentan en [ADR-0008](0008-campus-boundary-source.md).

## Referencias

- [Política oficial de uso de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- [MapLibre React Native: configuración de peticiones HTTP](https://maplibre.org/maplibre-react-native/docs/modules/transform-request-manager/)
- [MapLibre React Native: estilos y teselas](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/)
- Implementación de referencia en `main`: `apps/mobile/src/features/campus/map/map-style.ts` y `useMapController.ts`.
