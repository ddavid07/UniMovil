# Sprint 5 — accesibilidad y recursos de movilidad

> **Estado:** incremento implementado y comprobado localmente. ADR-0017 está aceptado. HU-024 conserva el comportamiento seguro de no disponibilidad, pero seguirá abierta mientras no exista una ruta real respaldada por atributos confirmados.

## Sprint Goal

La persona puede descubrir recursos de movilidad del campus, conocer qué información está confirmada y aplicar preferencias personales a una ruta solo cuando los datos permiten hacerlo sin presentar incertidumbre como accesibilidad.

## Historias seleccionadas para el plan

| ID     | Historia                                                                                                        | Resultado verificable                                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| HU-024 | [Consultar una ruta accesible](../../user-stories/03-routes-and-transit.md)                                     | Ruta accesible solo si todos los atributos críticos del recorrido están confirmados; en otro caso, explicación de no disponibilidad. |
| HU-040 | [Configurar preferencias de accesibilidad](../../user-stories/04-accessibility-and-mobility-resources.md)       | Preferencias de sesión que se pueden cambiar y borrar, aplicadas al filtro de rutas.                                                 |
| HU-041 | [Consultar accesos y servicios adaptados](../../user-stories/04-accessibility-and-mobility-resources.md)        | Accesos, rampas, ascensores y servicios mostrados con procedencia, fecha y certeza.                                                  |
| HU-042 | [Consultar aparcamientos](../../user-stories/04-accessibility-and-mobility-resources.md)                        | Aparcamientos y condiciones conocidas; disponibilidad desconocida salvo fuente confirmada.                                           |
| HU-043 | [Consultar recursos para bicicletas y patinetes](../../user-stories/04-accessibility-and-mobility-resources.md) | Recursos diferenciados y regulación presentada solo con fuente confirmada.                                                           |
| HU-044 | [Consultar puntos de carga y mantenimiento](../../user-stories/04-accessibility-and-mobility-resources.md)      | Puntos y condiciones verificables sin inferir disponibilidad ni operación.                                                           |
| HU-045 | [Consultar recursos cercanos por categoría](../../user-stories/04-accessibility-and-mobility-resources.md)      | Recursos ordenados por distancia desde una ubicación elegida y enlazados a ficha, mapa y ruta.                                       |

HU-095 se mantiene como criterio transversal; su validación completa continúa en Sprint 13.

## Decisiones y límites de producto

- Aplicar [ADR-0017](../../adr/0017-accessibility-data-confidence.md): cada afirmación incluye fuente, licencia, fecha, ámbito y responsable de validación. Estados permitidos: `confirmed`, `unknown`, `unavailable` y `affected`.
- Una etiqueta de OSM es una pista de investigación, no validación institucional. No se infieren accesos, horarios, superficies transitables ni disponibilidad desde puntos o geometrías.
- Las preferencias estarán en memoria durante la sesión. El alcance inicial incluye evitar escaleras y solicitar criterios de silla de ruedas solo si esos atributos existen en la red; no se almacenan ni se envían a terceros.
- La ubicación de referencia será una selección explícita entre un recurso del catálogo, un punto elegido en el mapa o la ubicación puntual existente de HU-011 si la persona ya concedió permiso. La opción manual siempre estará disponible.
- El orden de cercanía se basa en distancia geográfica aproximada desde el origen elegido; la interfaz no la presentará como distancia de recorrido. Si existe una ruta calculada, se mostrará separada con la estimación de ADR-0012.
- Los datos reportados por usuarios, si se admiten en incrementos futuros, quedan separados de los datos confirmados hasta revisión autorizada.
- Si no hay fuente confirmada o cobertura suficiente, la aplicación muestra “información no disponible” y no afirma que la ruta o recurso sea accesible. El trabajo local continúa con hechos desconocidos; la falta de validación externa se acepta como riesgo y no bloquea el Sprint. HU-024 no se cierra sin al menos un recorrido real respaldado por atributos confirmados.

## Trabajo y secuencia

| ID  | Actividad y entregable                                                                                                                                    | Dependencia                | Área funcional          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------- |
| T1  | Inventariar catálogo y grafo actuales; listar atributos necesarios por historia, carencias, licencia, origen, fecha y alcance.                            | Sprints 3–4, ADR-0012/0017 | Producto y datos        |
| T2  | Revisar fuentes disponibles y registrar solo la evidencia obtenida; cualquier dato sin confirmación permanece `unknown`.                                  | T1                         | Datos y validación      |
| T3  | Refinar HU-024 y HU-040–045 con escenarios de dato confirmado, desconocido, desactualizado, afectado y ruta imposible; mantener los límites del ADR-0017. | T1–T2                      | Producto y dominio      |
| T4  | Definir tipos y repositorio local de hechos de movilidad con metadatos de procedencia; conservar el catálogo actual como fuente independiente.            | T3                         | Dominio y datos         |
| T5  | Extender el cálculo peatonal para rechazar tramos incompatibles confirmados y cualquier ruta con atributos críticos desconocidos; explicar cada rechazo.  | T4                         | Rutas                   |
| T6  | Integrar filtros y fichas de recursos, origen para cercanía, selección en mapa y acción para iniciar ruta en Android y web.                               | T4–T5                      | Clientes                |
| T7  | Comprobar permisos, teclado, lector de pantalla, ampliación de texto, alternativa textual y estados de carga/error/vacío en web y Android.                | T5–T6                      | Accesibilidad y calidad |
| T8  | Actualizar datos, historias, backlog, fuentes, guía, ADR y casos de prueba junto con los cambios; revisar el incremento y registrar solo evidencia real.  | T1–T7                      | Calidad y documentación |

## Responsabilidades funcionales

| Responsabilidad               | Trabajo                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Product Owner                 | Aclarar el valor de cada recurso y confirmar qué fuentes pueden respaldar información pública. |
| Scrum Master                  | Hacer visibles dependencias de validación y facilitar adaptación del Sprint Backlog.           |
| Developers — datos y dominio  | Implementar el modelo de certeza y mantener trazabilidad, sin completar huecos por inferencia. |
| Developers — rutas y clientes | Integrar las preferencias y recursos en mapas y listas de Android/web con alternativa textual. |
| Developers — calidad          | Verificar cálculo, casos desconocidos y accesibilidad de interacción.                          |

## Archivos y documentación afectados

Código previsto en `apps/mobile/src/features/campus/` y sus adaptadores de mapa; pruebas en los dominios y componentes afectados. Los datos se mantienen versionados en el catálogo del campus con metadatos por hecho; no se requiere API ni base de datos para este Sprint.

Actualizar HU-024 y HU-040–045; el Product Backlog; `docs/development/data-sources.md` y `docs/development/README.md`; ADR-0017 solo si una nueva evidencia obliga a cambiar la decisión aceptada. Mantener `README.md` y las instrucciones de interfaz al día si cambian los flujos.

## Verificación y Definition of Done

- Pruebas unitarias: cada estado de certeza, filtros de preferencias, segmento incompatible, atributo crítico desconocido, fuente vencida según la vigencia que esta declare y ausencia de ruta.
- Pruebas de integración de datos: cada hecho mostrado tiene fuente, licencia, fecha y ámbito; un dato sin esos metadatos no puede publicarse como confirmado.
- Pruebas de interfaz en móvil/web: listado y mapa, filtros, detalle, selección como destino, distancia aproximada diferenciada de distancia de ruta, carga/error/vacío, preferencias editables y reinicio de sesión.
- E2E web: buscar un recurso, filtrar categoría, seleccionar ubicación, ver estado de certeza e intentar ruta accesible tanto con fixture confirmado como con cobertura desconocida.
- Checks del proyecto: formato, lint, TypeScript, pruebas, export web, navegador y build/ejecución Android. La exportación iOS no se presentará como validación nativa; iOS nativo continúa sin entorno disponible.
- Una ruta solo se presenta como accesible si cumple ADR-0017. Si no hay cobertura confirmada suficiente, documentar esa limitación técnica y dejar HU-024 abierta en backlog; no declarar completa la historia.

## Riesgos y respuesta

| Riesgo                                                  | Respuesta                                                                                                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| No hay una fuente autorizada de accesibilidad           | Riesgo aceptado: mantener los atributos como desconocidos y completar los flujos seguros. HU-024 queda abierta hasta que exista evidencia suficiente. |
| Una fuente comunitaria se interpreta como certificación | Mostrar su procedencia, separar dato comunitario de dato validado y no ofrecerlo como garantía.                                                       |
| Un estado temporal deja de ser válido                   | Aplicar vigencia que declare la fuente; sin evidencia actual, volver a `unknown`.                                                                     |
| Preferencias revelan información sensible               | Mantenerlas solo en memoria y no asociarlas a cuenta ni telemetría.                                                                                   |

## Ceremonias y resultado

El equipo realiza los eventos Scrum según metodología. El plan no constituye un acta. Al finalizar, registrar resultados y criterios con evidencia; crear actas únicamente si los eventos se celebran.

## Resultado de implementación local

- Se añadieron recursos de movilidad con estados de evidencia, fuente, licencia, fecha y ámbito; OSM no se presenta como certificación de accesibilidad u operación.
- El panel permite filtrar por categoría, seleccionar origen manual o ubicación ya autorizada, ordenar por distancia geográfica aproximada, abrir la fuente, centrar el recurso en el mapa e iniciar una ruta.
- La ruta evita tramos cartografiados como escaleras cuando se activa la preferencia de sesión. El panel de rutas comunica que no hay evidencia suficiente para ofrecer una ruta en silla de ruedas.
- No se ingresaron datos institucionales supuestos. La carencia de una fuente confirmada es un riesgo aceptado para el desarrollo; no se afirma disponibilidad o accesibilidad real.
- Evidencia técnica: `npm test` (19 suites y 64 pruebas), `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run check:expo`, exportaciones web/Android/iOS y prueba de navegador en 1280 × 800 y 390 × 844. El build nativo Android se instaló en Android 36 y mostró el mapa del campus; no se afirma validación nativa iOS.
