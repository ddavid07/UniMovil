# 4. Mapas, cartografía y rutas

## 4.1. Decisión adoptada

UniMovil utilizará:

- **MapLibre React Native** para renderizar los mapas en Android e iOS.
- **OpenStreetMap Standard raster tiles** como proveedor inicial de teselas, sin clave de API y sujeto a su política de uso.
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
- [Política oficial de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- [openrouteservice](https://openrouteservice.org/plans/)
- [Política de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- [Política de Nominatim](https://operations.osmfoundation.org/policies/nominatim/)

## 4.3. MapLibre

MapLibre es la capa de renderizado. No proporciona por sí sola todos los mapas, teselas, estilos ni rutas. La aplicación deberá recibir un estilo y una fuente de teselas válida.

La URL del estilo y la configuración del proveedor se manejarán mediante configuración, no mediante valores dispersos por el código.

## 4.4. Teselas raster de OpenStreetMap

El incremento actual solicita las teselas estándar en `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, sin clave. El uso está limitado a la visualización interactiva normal: la aplicación identifica sus solicitudes con `UniMovil/0.1`, mantiene visible la atribución a OpenStreetMap y respeta la caché HTTP del cliente. No ofrece descarga, precarga ni uso offline de teselas.

El servicio comunitario tiene capacidad limitada, disponibilidad best-effort y puede bloquear usos que incumplan la política. Esta integración sirve para el incremento académico de bajo volumen; no constituye un compromiso de disponibilidad ni una solución para un despliegue de alto tráfico. Antes de aumentar el uso se deberá contratar un proveedor apropiado o autoalojar las teselas.

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

La arquitectura podrá sustituir el proveedor de teselas por un servicio contratado o autoalojado y openrouteservice por otro motor, sin cambiar el modelo de dominio ni la interfaz móvil.

## Primer incremento móvil

La funcionalidad del campus se agrupa por dominio en `apps/mobile/src/features/campus/`: lógica pura, repositorio local, controles y adaptador MapLibre. La pantalla de Expo Router compone la funcionalidad. Los contratos y el validador están en `packages/contracts/`; ningún componente accede a una base de datos.

Búsqueda y categorías determinan un único conjunto para lista y marcadores. Se normalizan tildes, mayúsculas y espacios, se combinan términos y se descarta una selección que deja de coincidir. La cámara solo se centra por una acción explícita de selección o encuadre. Los marcadores usan una fuente GeoJSON nativa; la lista está virtualizada.

El catálogo inicial incluye 24 elementos, cuatro por categoría, consultados en OpenStreetMap el 20 de octubre de 2026. Los registros mantienen enlace al objeto original, coordenadas, licencia y datos desconocidos explícitos. Incluye recursos del entorno compartido de Ciudad Universitaria, no únicamente edificios propiedad de UCM. Los centros de polígonos no se interpretan como entradas.

Los datos derivados de OpenStreetMap se distribuyen bajo [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) y requieren atribución a [sus colaboradores](https://www.openstreetmap.org/copyright). La licencia Apache del código no sustituye la licencia de este catálogo. Los nombres descriptivos de aparcabicis sin nombre publicado no son nombres oficiales.

La lista del catálogo funciona sin conexión, pero el fondo cartográfico requiere conectividad. Las pruebas nativas usan un estilo local de fixture y no consumen teselas externas; la integración real con OpenStreetMap debe comprobarse manualmente en un dispositivo.
