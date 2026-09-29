# ADR-0003 — MapLibre, MapTiler, openrouteservice y OpenStreetMap

## Estado

Aceptada

## Contexto

UniMovil necesita mostrar el campus de Moncloa, representar puntos y rutas, y calcular desplazamientos. El presupuesto inicial es cero y el proyecto es académico y no comercial.

## Decisión

- Utilizar MapLibre React Native para renderizar mapas.
- Utilizar MapTiler Cloud Free como proveedor inicial de mapas base.
- Utilizar openrouteservice para calcular rutas.
- Utilizar OpenStreetMap como fuente geográfica cuando corresponda.
- Mantener edificios, servicios, paradas y puntos propios del campus en la base de datos de UniMovil.
- Aislar proveedores externos mediante adaptadores configurables.

## Alternativas consideradas

- Google Maps.
- Mapbox.
- Utilizar directamente los servidores públicos de teselas de OpenStreetMap.
- Autoalojar desde el principio el motor de mapas y rutas.

## Consecuencias

### Positivas

- No hay coste inicial para el uso académico previsto.
- Se reduce el bloqueo con un proveedor concreto.
- Se mantienen las funciones de rutas y accesibilidad.
- La información específica del campus queda bajo control del proyecto.

### Negativas

- Los planes gratuitos tienen cuotas y condiciones de uso.
- MapLibre no proporciona por sí solo teselas, estilos ni rutas.
- Será necesario mostrar atribuciones.
- Un despliegue público a gran escala podría requerir otro proveedor o infraestructura propia.

## Fecha

2026-09-29
