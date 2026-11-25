# ADR-0012: cálculo local de rutas peatonales del campus

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0002, ADR-0004, ADR-0007, ADR-0008 y ADR-0011

## Contexto

HU-020, HU-021 y HU-023 requieren elegir extremos, calcular un camino, mostrar una estimación y ofrecer instrucciones. La red debe tener fuente, licencia y cobertura trazables, y el origen/destino no deben enviarse a un servicio de rutas externo en el flujo inicial.

## Decisión

- Mantener una red peatonal local en `campus-routing-network.json`, extraída de datos OSM, limitada por la geometría del Campus de Moncloa y distribuida bajo las condiciones ODbL 1.0. El archivo conserva la fecha de comprobación, la consulta de fuente y la fuente de la delimitación.
- Regenerar el extracto con `scripts/import-campus-routing.py`. El script solicita el área en mosaicos pequeños a la API de mapa OSM, elimina nodos fuera del polígono y conserva metadatos de vías; así evita el límite de 50 000 nodos por consulta.
- Calcular rutas localmente sobre el grafo mediante Dijkstra, ponderando la longitud cartográfica. Excluir los tramos etiquetados con `access=no/private/permit` o `foot=no/private/use_sidepath`.
- Asociar un extremo al nodo de red más cercano solo si está a 100 m o menos. Si falta cobertura o conectividad, no dibujar una línea recta como si fuera una ruta.
- Identificar distancias y tiempos como estimaciones. La duración peatonal parte de 1,2 m/s; la cartografía no confirma apertura, entradas, accesibilidad, estado de obras ni condiciones del camino.
- Compartir el dominio de rutas en móvil y web. El navegador renderiza el resultado con Leaflet y las aplicaciones nativas con MapLibre.

## Alternativas consideradas

- **Servicio externo de rutas:** aplazado porque enviaría coordenadas a un proveedor y requiere analizar privacidad, cobertura, condiciones y coste.
- **Ruta recta entre puntos:** descartada porque no representa un camino transitable.
- **Servidor/API para el primer cálculo:** aplazado; el grafo local permite implementar el flujo sin añadir infraestructura o almacenar ubicaciones.
- **Interpretar OSM como inventario oficial de accesos:** descartado; la fuente no confirma accesibilidad, apertura ni condición institucional.

## Consecuencias y límites

- El grafo y su procedencia se incluyen en el cliente y aumentan el tamaño descargado de la aplicación.
- La conexión de vías se trata como bidireccional para el desplazamiento peatonal; se excluyen los valores de acceso explícitamente restrictivos indicados arriba. No se afirma navegación accesible ni cobertura exhaustiva.
- El límite de ajuste de 100 m y la estimación de 1,2 m/s son reglas iniciales revisables ante evidencia de producto o datos mejores.
- Las rutas peatonales con un extremo fuera de cobertura se identifican como no disponibles.

## Referencias

- [HU-020, HU-021 y HU-023](../user-stories/03-routes-and-transit.md)
- [Fuentes de datos y atribuciones](../development/data-sources.md)
- [OpenStreetMap API 0.6](https://wiki.openstreetmap.org/wiki/API_v0.6)
- [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)
