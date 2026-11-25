# ADR-0017: certeza y procedencia de datos de accesibilidad

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0004, ADR-0008, ADR-0012 y ADR-0014

## Contexto

HU-024 y HU-040–045 requieren preferencias de movilidad, información de accesos y rutas. El catálogo y la red actuales proceden de OpenStreetMap y no acreditan por sí mismos que un acceso esté abierto, que un camino sea accesible ni que un recurso esté operativo.

## Decisión

- Toda afirmación de accesibilidad o disponibilidad debe vincularse a una fuente identificable, licencia, fecha de comprobación, ámbito espacial y responsable de validación. Etiquetas cartográficas comunitarias pueden orientar una revisión, pero no se mostrarán como confirmación institucional sin revisión autorizada.
- Cada atributo se representará como `confirmed`, `unknown`, `unavailable` o `affected`. Un valor desconocido no se interpretará como compatible, accesible ni disponible. Las contribuciones de usuarios se almacenarán separadas y no alterarán el dato confirmado.
- No se afirmará que una ruta es accesible salvo que cada tramo y acceso relevantes tenga atributos confirmados que satisfagan la preferencia seleccionada. Si falta un atributo crítico, la ruta se declarará indeterminable o no disponible, con explicación y acceso a la alternativa peatonal sin etiqueta de accesibilidad.
- Los estados temporales `affected` deberán incluir fuente y vigencia. Sin una fecha de fin o actualización verificable, no se inferirá que el estado sigue vigente ni que se ha resuelto.
- Las preferencias de accesibilidad se mantendrán solo en memoria durante la sesión hasta aprobar una política de persistencia y privacidad. No se enviarán a terceros ni se asociarán a una cuenta por defecto.
- Si no se localiza y valida una fuente suficiente para el campus, se implementarán los estados de certeza y la experiencia de no disponibilidad, pero HU-024 y cualquier dato que no alcance sus criterios permanecerán abiertos en el Product Backlog.

## Alternativas consideradas

- **Tratar ausencia de etiquetas como acceso compatible:** descartada porque convierte la falta de información en una afirmación de seguridad.
- **Usar cualquier etiqueta OSM como validación institucional:** descartada porque OSM es una fuente comunitaria y no confirma vigencia, titularidad ni condiciones reales de uso.
- **Aceptar automáticamente informes de usuarios como datos públicos:** descartada; requieren revisión antes de modificar información usada por rutas o comunicada como confirmada.
- **Persistir preferencias en la cuenta desde el primer incremento:** aplazada hasta definir finalidad, consentimiento, retención y borrado.

## Consecuencias

- Los modelos de recursos y aristas necesitarán metadatos de procedencia y certeza, y las interfaces deberán explicar estados desconocidos sin ocultarlos tras un color o icono.
- Se requiere obtener una fuente institucional o revisión autorizada para publicar accesos adaptados y para cerrar una ruta accesible real.
- Habrá escenarios válidos donde la aplicación no pueda calcular una ruta accesible; esa respuesta constituye el comportamiento seguro previsto, no una ruta alternativa garantizada.

## Referencias

- [HU-024](../user-stories/03-routes-and-transit.md)
- [HU-040–045](../user-stories/04-accessibility-and-mobility-resources.md)
- [Fuentes de datos y atribuciones](../development/data-sources.md)
- [ADR-0012: cálculo local de rutas peatonales](0012-campus-pedestrian-routing.md)
