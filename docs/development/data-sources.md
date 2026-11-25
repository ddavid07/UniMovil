# Fuentes de datos, cartografía y marca

## Catálogo de lugares

El archivo `apps/mobile/src/features/campus/data/campus-places.json` contiene 20 puntos de referencia del Campus de Moncloa. Se comprobaron los objetos enlazados en OpenStreetMap el **23 de noviembre de 2026**. Cada registro conserva su nombre, coordenadas, referencia de búsqueda cuando está publicada, URL del objeto, licencia y fecha de comprobación.

Los puntos corresponden a edificios universitarios, bibliotecas, paradas, aparcamientos, estacionamiento de bicicletas y accesos cartografiados. Los puntos de vías se representan en su coordenada de nodo; los edificios y áreas se representan mediante un punto interior calculado a partir de la geometría del objeto. Ese punto sirve para señalar el elemento en el mapa y no identifica una entrada.

Los términos alternativos de las paradas proceden del campo `ref` del objeto de OpenStreetMap. Las categorías se asignaron a partir de la clase de objeto cartográfica. El catálogo no incorpora afirmaciones de accesibilidad, disponibilidad, horario o apertura.

Los datos de OpenStreetMap están disponibles bajo la [licencia ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). La interfaz mantiene visible la atribución a [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), y cada elemento permite volver a consultar su objeto fuente. La información institucional sobre el [Campus de Moncloa](https://www.ucm.es/cultura/moncloa) se utiliza para confirmar el ámbito y la denominación del campus.

## Red peatonal y rutas

`apps/mobile/src/features/campus/data/campus-routing-network.json` guarda la red extraída de la API de mapa de OpenStreetMap y limitada al polígono comunitario del campus. El snapshot local consultado el **25 de noviembre de 2026** contiene nodos y vías con versión y marca de actualización OSM; el fichero conserva su URL exacta de consulta, licencia ODbL 1.0 y vínculo con la fuente del límite.

La red puede regenerarse con `python3 scripts/import-campus-routing.py --checked-at AAAA-MM-DD`. El script consulta el área por mosaicos para respetar el límite de tamaño de la API, conserva únicamente tramos con nodos dentro del polígono y elimina vías con etiquetas peatonales de acceso explícitamente restrictivas al cargarlas. La ruta se calcula localmente; no se envían origen ni destino a un proveedor de rutas. El motor conecta extremos solo si el nodo más próximo está a 100 m o menos, y estima el tiempo a partir de 1,2 m/s.

La red es cartografía comunitaria, no un plano certificado de circulación. No prueba que un camino esté abierto, sea accesible, tenga una entrada, esté libre de obras o conecte con todos los edificios. Una ruta sin cobertura o sin conexión se muestra como no disponible.

## Horarios y transporte EMT

`apps/mobile/src/features/campus/data/campus-transit.json` se generó el **25 de noviembre de 2026** desde el conjunto oficial [GTFS de EMT Madrid](https://datos.emtmadrid.es/es/dataset/gtfs-de-emtmadrid). La ficha identifica la licencia Open Data Commons Attribution License, el recurso descargado, SHA-256 del ZIP, zona horaria `Europe/Madrid`, última actualización indicada por el proveedor (**2026-11-25T04:01:25Z**) y la fecha de consulta. El snapshot incluye 25 líneas, 65 paradas del campus, sentidos, viajes, horarios y calendario de servicios; las geometrías se recortan con el polígono OSM y conservan esa segunda fuente/licencia en los metadatos.

El importador `scripts/import-transit-gtfs.py` recibe un ZIP descargado del recurso oficial y las fechas de consulta/actualización. Para regenerar el fichero:

```bash
python3 scripts/import-transit-gtfs.py /ruta/al/gtfs_emt.zip \
  --checked-at AAAA-MM-DD \
  --updated-at AAAA-MM-DDThh:mm:ssZ
```

La interfaz calcula próximas salidas a partir de calendarios, excepciones y `stop_times.txt`. Son horarios programados; no incluyen posicionamiento de autobuses, retrasos ni llegadas en tiempo real. Las alternativas de trayecto usan una línea directa y estiman los tramos a pie con la red OSM; no combinan transbordos ni ofrecen ruta ciclista verificada.

La aplicación no copia ni sincroniza las incidencias operativas de EMT. La ficha enlaza a la [página oficial de incidencias](https://www.emtmadrid.es/EMTBUS/Incidencias.aspx). La [ficha de datos de incidencias](https://datos.emtmadrid.es/dataset/incidencias-o-alteraciones-del-servicio-de-emt) publica recursos RSS/Service Alerts; su integración queda pendiente de verificar formato, autorización, licencia y comportamiento de acceso. El endpoint de tiempos ETA de EMT requiere una clave API, por lo que no se integra ni se expone ninguna credencial en el cliente.

## Delimitación del campus

`packages/contracts/data/campus-boundary.json` contiene el polígono del objeto [OpenStreetMap way 30648317](https://www.openstreetmap.org/way/30648317), denominado «Ciudad Universitaria» y etiquetado con `campus=Campus de Moncloa`. Se conservan su fuente, licencia ODbL 1.0, versión 110 y fecha de comprobación **24 de noviembre de 2026**; el objeto fuente indica que su última edición fue el **28 de octubre de 2026**. El código deriva de su anillo exterior la envolvente rectangular usada para encuadrar y limitar la cámara; el polígono se dibuja como relleno y contorno sobre el mapa base.

La geometría es una representación cartográfica comunitaria de OpenStreetMap. No certifica lindes catastrales, titularidad, límites administrativos ni el perímetro oficial de propiedades de la UCM. El mapa mantiene la atribución visible a OpenStreetMap y enlaza a sus [derechos y licencia](https://www.openstreetmap.org/copyright); la decisión y sus límites están descritos en el [ADR-0008](../adr/0008-campus-boundary-source.md).

## Teselas del mapa

El mapa base usa las teselas raster estándar de OpenStreetMap en `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. La aplicación envía `User-Agent: UniMovil/0.1` solo a ese host, conserva la caché del cliente y muestra un enlace visible a los créditos de OpenStreetMap. El uso se limita a navegación interactiva: no hay precarga, descarga masiva ni modo offline para las teselas. El servicio es de capacidad limitada y disponibilidad best-effort; consulta su [política de uso](https://operations.osmfoundation.org/policies/tiles/) y el [ADR-0007](../adr/0007-development-basemap-provider.md). Antes de un piloto o publicación se evaluará un proveedor apropiado para ese uso.

El catálogo de lugares, el polígono del campus y las teselas son recursos relacionados pero distintos: la procedencia y las condiciones de reutilización de los datos se conservan por separado del servicio de teselas. No se usa el plano institucional de UCM como imagen porque no consta una autorización de reutilización.

## Accesibilidad y recursos de movilidad

El panel de recursos deriva categorías de los puntos del catálogo OSM y conserva enlace, licencia y fecha de consulta por recurso. El catálogo no certifica accesibilidad, operación, horarios, plazas disponibles, mantenimiento ni permiso de uso. Esos atributos se presentan como `unknown`; la opción de evitar tramos cartografiados como escaleras no demuestra que una ruta sea accesible. No se incorporaron ubicaciones de recarga eléctrica ni talleres sin una fuente verificable.

La implementación permite completar la experiencia con estados de incertidumbre y datos locales. La ausencia de una fuente institucional confirmada se acepta como riesgo del Sprint 5; no se rellenan huecos mediante inferencias.

## Incidencias locales

La fixture añadida por `scripts/seed-local-incidents.mjs` es un registro sintético, no derivado de una fuente geográfica ni de un reporte real. Se inserta solo en Supabase local para comprobar la proyección pública y los filtros. Los reportes creados desde la aplicación se guardan en Supabase local, comienzan privados y no aparecen en el feed.

## Identidad visual

La aplicación muestra la marca oficial de la Universidad Complutense de Madrid sin modificarla. El recurso y su procedencia se detallan en [assets](../assets/README.md). La interfaz utiliza el rojo Pantone 200 (`#B71234`) indicado en el [manual de uso de la marca UCM](https://www.ucm.es/data/cont/docs/1355-2017-06-01-Manual%20de%20uso%20de%20la%20Marca%20UCM.pdf).
