# 4. Mapas, cartografía y rutas

## 4.1. Decisión adoptada

UniMovil utilizará:

- **MapLibre React Native** para renderizar los mapas en Android e iOS.
- **MapTiler Cloud Free** como proveedor inicial de estilos y teselas.
- **openrouteservice** para calcular rutas.
- **OpenStreetMap** como fuente de datos geográficos cuando corresponda.
- **Base de datos propia** para edificios, facultades, servicios, paradas y puntos específicos de la UCM.

## 4.2. Motivos

- Evitar una dependencia obligatoria de Google Maps o Mapbox.
- Mantener la posibilidad de cambiar de proveedor.
- Disponer de una solución adecuada para un proyecto académico y no comercial.
- Aprovechar datos geográficos abiertos.
- Soportar rutas a pie, bicicleta, transporte y accesibilidad.
- Controlar la información específica del campus desde UniMovil.

Referencias principales:

- [MapLibre React Native](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/)
- [MapTiler Cloud](https://www.maptiler.com/cloud/pricing/)
- [openrouteservice](https://openrouteservice.org/plans/)
- [Política de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- [Política de Nominatim](https://operations.osmfoundation.org/policies/nominatim/)

## 4.3. MapLibre

MapLibre es la capa de renderizado. No proporciona por sí sola todos los mapas, teselas, estilos ni rutas. La aplicación deberá recibir un estilo y una fuente de teselas válida.

La URL del estilo y la configuración del proveedor se manejarán mediante configuración, no mediante valores dispersos por el código.

## 4.4. MapTiler Cloud Free

MapTiler será el proveedor inicial de mapas base para el desarrollo y uso académico.

La configuración deberá:

- Mantener la clave fuera del repositorio.
- Respetar las cuotas del plan gratuito.
- Mostrar la atribución requerida.
- Evitar generar tráfico innecesario.
- Permitir sustituir el proveedor sin reescribir la aplicación.
- Monitorizar el consumo para detectar que se aproxima al límite.

El plan gratuito no debe considerarse ilimitado ni apto automáticamente para un despliegue público de gran volumen.

## 4.5. OpenStreetMap

OpenStreetMap podrá utilizarse como fuente de datos geográficos, pero sus datos y sus servidores de teselas no son lo mismo.

UniMovil deberá:

- Mostrar la atribución de OpenStreetMap.
- Respetar las políticas de uso de los servicios utilizados.
- No realizar descargas masivas de teselas.
- No ocultar la atribución.
- No depender de los servidores públicos de teselas como solución ilimitada.
- Mantener un contacto identificable si se utiliza un servicio que lo requiera.

## 4.6. openrouteservice

openrouteservice será el proveedor inicial para cálculo de rutas y, cuando proceda, geocodificación.

La aplicación deberá:

- Ocultar la clave en el backend.
- No llamar directamente al proveedor desde el cliente móvil si la operación necesita proteger credenciales.
- Aplicar límites y caché razonables.
- Gestionar errores y cuotas agotadas.
- Mostrar que las duraciones son estimadas.
- Mantener una interfaz interna que permita cambiar de proveedor.

Para las búsquedas habituales del campus se priorizará la base de datos propia de UniMovil. No se utilizará el Nominatim público como autocompletado de búsquedas.

## 4.7. Datos propios del campus

UniMovil será la fuente de presentación de:

- Facultades y escuelas.
- Edificios y entradas.
- Servicios universitarios.
- Paradas y líneas registradas.
- Accesos adaptados.
- Aparcamientos y aparcabicis.
- Cierres y restricciones.

Cada dato tendrá fuente, estado y fecha de actualización.

## 4.8. Proveedores alternativos

La arquitectura podrá sustituir MapTiler por otro proveedor compatible y openrouteservice por un motor autoalojado u otro servicio, sin cambiar el modelo de dominio ni la interfaz móvil.

## Primer incremento móvil

La funcionalidad del campus se agrupa por dominio en `apps/mobile/src/features/campus/`: lógica pura, repositorio local, controles y adaptador MapLibre. La pantalla de Expo Router compone la funcionalidad. Los contratos y el validador están en `packages/contracts/`; ningún componente accede a una base de datos.

Búsqueda y categorías determinan un único conjunto para lista y marcadores. Se normalizan tildes, mayúsculas y espacios, se combinan términos y se descarta una selección que deja de coincidir. La cámara solo se centra por una acción explícita de selección o encuadre. Los marcadores usan una fuente GeoJSON nativa; la lista está virtualizada.

El catálogo inicial incluye 24 elementos, cuatro por categoría, consultados en OpenStreetMap el 20 de octubre de 2026. Los registros mantienen enlace al objeto original, coordenadas, licencia y datos desconocidos explícitos. Incluye recursos del entorno compartido de Ciudad Universitaria, no únicamente edificios propiedad de UCM. Los centros de polígonos no se interpretan como entradas.

Los datos derivados de OpenStreetMap se distribuyen bajo [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) y requieren atribución a [sus colaboradores](https://www.openstreetmap.org/copyright). La licencia Apache del código no sustituye la licencia de este catálogo. Los nombres descriptivos de aparcabicis sin nombre publicado no son nombres oficiales.

MapTiler continúa proporcionando la cartografía del build normal. La falta de configuración o red no impide consultar el catálogo. Las pruebas controladas ejercitan el renderizador nativo sin consumir teselas; su resultado no demuestra la integración real del proveedor. Consulta CONTRIBUTING para configuración y validación nativa.

En el plan gratuito de MapTiler se muestran su logotipo enlazado y los créditos visibles y enlazados de MapTiler/OpenStreetMap, manteniendo también el control de atribución nativo. El [SVG oficial de atribución](https://api.maptiler.com/resources/logo.svg) se conserva en `apps/mobile/assets/maptiler-logo.svg` y se exportó sin rediseño a PNG para React Native. Su SHA-256 original es `c2fef38a1e77e9ff774dc1b21a2e931c81eab12191395be726c594404e4bf332`. El logotipo y la marca pertenecen a MapTiler; se usan según sus [instrucciones de atribución](https://docs.maptiler.com/guides/map-design/attribution/add-attribution/).
