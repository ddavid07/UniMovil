# ADR-0008: fuente de la delimitación cartográfica del Campus de Moncloa

- **Estado:** Aceptada
- **Fecha:** 2026-11-24
- **Decisores:** Equipo UniMovil

## Contexto

HU-010 requiere mostrar los límites del campus. Las teselas raster del mapa base aportan contexto visual, pero no son una geometría independiente que UniMovil pueda validar, trazar y mantener. Un rectángulo de coordenadas encuadra una vista, pero no describe el perímetro visible del campus.

La cartografía institucional consultada de la UCM sirve para orientación y consulta; no se identificó en ella una licencia explícita que autorizase reutilizar su plano como imagen o extraer su geometría. OpenStreetMap contiene un objeto poligonal cerrado denominado «Ciudad Universitaria», etiquetado `campus=Campus de Moncloa`, con procedencia y licencia publicadas.

## Decisión

- Utilizar como delimitación visual el polígono del [objeto OpenStreetMap way 30648317](https://www.openstreetmap.org/way/30648317), guardado en `apps/mobile/src/features/campus/data/campus-boundary.json`.
- Conservar en el GeoJSON el identificador de fuente, licencia ODbL 1.0, versión del objeto y fechas de última edición y comprobación. Derivar del anillo exterior la envolvente para la cámara; dibujar el polígono con relleno y contorno UCM.
- Mantener visible la atribución a OpenStreetMap y el enlace a sus derechos y licencia, además de registrar fuente y alcance en la documentación del proyecto.
- Tratar esta geometría como representación cartográfica comunitaria; no presentarla como linde catastral, titularidad, límite administrativo ni perímetro oficial de propiedades UCM.

## Alternativas consideradas

- **Plano o datos de SIGcampus UCM:** no reutilizar su imagen ni extraer sus datos mientras no se confirme una licencia o autorización aplicable.
- **Rectángulo envolvente:** insuficiente como representación visual del perímetro, aunque se utiliza para encuadrar y limitar la cámara.
- **Trazado manual de un plano institucional:** descartado porque no hay autorización de reutilización ni fuente geométrica verificable para ese derivado.

## Consecuencias

- La delimitación se puede renderizar y probar sin depender de que la imagen del mapa base contenga nombres o trazos de campus.
- La exactitud y vigencia dependen de OpenStreetMap; futuras actualizaciones deben volver a comprobar el objeto y actualizar versión, fecha y pruebas.
- La ODbL y la atribución visible deben mantenerse al reutilizar o distribuir los datos. Un cambio de fuente o de alcance geográfico requiere revisar este ADR y la documentación de fuentes.
- La delimitación no permite inferir accesibilidad, entradas, horarios, propiedad o validez jurídica.

## Referencias

- [HU-010: Consultar el mapa del campus](../user-stories/02-campus-map-search-and-places.md)
- [Objeto OpenStreetMap way 30648317](https://www.openstreetmap.org/way/30648317)
- [Derechos de autor y licencia de OpenStreetMap](https://www.openstreetmap.org/copyright)
- [Licencia ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)
- [SIGcampus UCM](https://www.ucm.es/sostenibilidad/sig-campus)
- [Fuentes de datos, cartografía y marca](../development/data-sources.md)
