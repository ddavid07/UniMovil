# ADR-0013: horarios GTFS de EMT y alternativas de autobús

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0004, ADR-0007, ADR-0011 y ADR-0012

## Contexto

HU-022, HU-025, HU-026 y HU-027 requieren comparar modos y consultar líneas, paradas y horarios. El registro debe identificar el operador y la fuente, conservar la fecha del conjunto y separar horarios programados de avisos e información de llegada en tiempo real.

## Decisión

- Usar el conjunto oficial GTFS publicado por EMT Madrid bajo la licencia Open Data Commons Attribution License, con su calendario y excepciones de servicio, recorridos, paradas y geometrías.
- Generar un catálogo campus-only con `scripts/import-transit-gtfs.py`; el archivo incluye el hash SHA-256 del ZIP, fechas de consulta y actualización, zona `Europe/Madrid`, atribución, licencia EMT y fuente OSM usada para delimitar la cobertura.
- Mostrar recorridos por sentido, paradas ordenadas y salidas programadas calculadas desde `stop_times.txt` y `calendar*.txt`. La interfaz presenta fecha y origen del horario, e indica que no es una llegada en tiempo real.
- Ofrecer una alternativa de autobús solo cuando exista una conexión directa de una línea en el sentido correcto y tramos de acceso y salida calculables con el grafo peatonal aceptado en ADR-0012. La alternativa muestra parada de subida y bajada, hora programada, espera, duración, distancia y cero transbordos.
- No ofrecer bicicleta como ruta calculada hasta disponer de una red y criterios verificados; mostrar expresamente su falta de disponibilidad.
- No ingerir avisos operativos ni ETA en este cliente. La aplicación enlaza con la página oficial de incidencias de EMT; esa página es la fuente para verificar cambios y cierres vigentes.
- HU-028 (estimaciones en tiempo real) permanece fuera de este incremento. El recurso público de ETA de EMT requiere una API key; el feed de avisos requiere validar su acceso, licencia, actualización, formato y condiciones antes de integrarlo.

## Alternativas consideradas

- **Inventar horarios o inferirlos de líneas OSM:** descartada; se usa un GTFS oficial con calendario y trips.
- **Mostrar ETA en tiempo real desde el cliente:** aplazada porque la API de EMT requiere una credencial y su titularidad, límites, privacidad, proxy y condiciones operativas aún no están aprobados.
- **Combinar varias líneas:** aplazada; este incremento calcula exclusivamente un servicio directo sin transbordo y no afirma que sea el óptimo global.
- **Mostrar incidencias copiadas en el catálogo estático:** descartada porque quedarían desactualizadas.
- **Ruta ciclista con la red peatonal:** descartada porque sus condiciones no representan una red ciclista verificada.

## Consecuencias y límites

- Los horarios quedan obsoletos cuando cambia el recurso de EMT; la fecha y hash permiten identificar el snapshot y regenerarlo.
- El importador y el catálogo contienen datos derivados de EMT y geometría delimitada con OSM; la atribución y licencia de ambas fuentes se conservan juntas.
- Una alternativa sin ruta directa o con horarios no activos no se presenta como disponible. Una ubicación sin ruta peatonal cercana no genera un tramo ficticio.
- El enlace a incidencias abre el canal oficial; UniMovil no presenta una lista sincronizada ni afirma tener el estado actual de cada línea.

## Referencias

- [GTFS EMT Madrid](https://datos.emtmadrid.es/es/dataset/gtfs-de-emtmadrid)
- [Incidencias y alteraciones de servicio EMT](https://datos.emtmadrid.es/dataset/incidencias-o-alteraciones-del-servicio-de-emt)
- [Página oficial de incidencias EMT](https://www.emtmadrid.es/EMTBUS/Incidencias.aspx)
- [Open Data Commons Attribution License](https://opendatacommons.org/licenses/by/1-0/)
- [HU-022, HU-025, HU-026 y HU-027](../user-stories/03-routes-and-transit.md)
