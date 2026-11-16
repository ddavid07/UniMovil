# ADR-0003 — MapLibre, OpenStreetMap y openrouteservice

## Estado

Aceptada

## Contexto

UniMovil necesita mostrar el campus de Moncloa, representar puntos y rutas, y calcular desplazamientos. El presupuesto inicial es cero y el proyecto es académico y no comercial.

## Decisión

- Utilizar MapLibre React Native para renderizar mapas.
- Utilizar las teselas raster estándar de OpenStreetMap sin clave para el incremento académico actual, respetando su política de uso y atribución.
- Utilizar openrouteservice para calcular rutas.
- Utilizar OpenStreetMap como fuente geográfica cuando corresponda.
- Mantener edificios, servicios, paradas y puntos propios del campus en la base de datos de UniMovil.
- Aislar proveedores externos mediante adaptadores configurables.

## Alternativas consideradas

- Google Maps.
- Mapbox.
- Contratar un proveedor de teselas con SLA o autoalojar la cartografía desde el principio.
- Autoalojar desde el principio el motor de mapas y rutas.

## Consecuencias

### Positivas

- No se necesita una clave de API para el uso académico de bajo volumen.
- Se reduce el bloqueo con un proveedor concreto.
- Se mantienen las funciones de rutas y accesibilidad.
- La información específica del campus queda bajo control del proyecto.

### Negativas

- El servicio de teselas de OSM tiene capacidad limitada, disponibilidad best-effort y no es apropiado para alto tráfico ni descarga offline.
- MapLibre no proporciona por sí solo teselas, estilos ni rutas.
- Será necesario mostrar atribuciones.
- Un despliegue público a gran escala podría requerir otro proveedor o infraestructura propia.

## Fecha

2026-09-29
