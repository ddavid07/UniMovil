# Sprint 3 — cliente público web, servicios cercanos y rutas peatonales

> **Estado:** incremento implementado localmente. Este documento conserva el plan inicial y registra abajo el resultado técnico comprobable; no crea actas ni afirma ceremonias que no constan.

## Sprint Goal

Una persona puede consultar UniMovil desde un navegador además del móvil, localizar servicios cercanos y solicitar una ruta peatonal con trazado, distancia, duración estimada e indicaciones comprensibles.

## Historias incluidas y valor

| ID     | Historia                                                                                | Incremento esperado                                                                                                 |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| HU-099 | [Consultar UniMovil desde un navegador web](../../user-stories/09-public-web-client.md) | Primer cliente web adaptable con mapa, búsqueda, filtros y alternativa textual, sin cuenta ni permiso de ubicación. |
| HU-015 | [Consultar servicios cercanos](../../user-stories/02-campus-map-search-and-places.md)   | Resultados por referencia elegida, categoría y distancia estimada, con acceso a mapa y ruta.                        |
| HU-020 | [Introducir origen y destino](../../user-stories/03-routes-and-transit.md)              | Selección por búsqueda, mapa o ubicación concedida; validación de origen/destino dentro del alcance definido.       |
| HU-021 | [Consultar una ruta a pie](../../user-stories/03-routes-and-transit.md)                 | Trazado peatonal, estimación identificada como tal, instrucciones y estado comprensible si no hay ruta válida.      |
| HU-023 | [Consultar indicaciones paso a paso](../../user-stories/03-routes-and-transit.md)       | Lista ordenada de pasos vinculada al tramo resaltado en el mapa.                                                    |

Estas historias forman el alcance del incremento local. Las prioridades globales del Product Backlog no cambian. El resultado y las comprobaciones se resumen al final del documento.

## Entrada, alcance y límites

- Conservar el incremento local de los Sprints 1 y 2 y verificar el árbol de trabajo antes de integrar tareas nuevas.
- La red peatonal, el límite de ajuste y los casos sin conectividad se resuelven en [ADR-0012](../../adr/0012-campus-pedestrian-routing.md); no se amplía el polígono como sustituto de una red transitable.
- La red local conserva fuente, licencia, fechas y límites. El cálculo ocurre en el cliente y no envía origen/destino a un servicio externo.
- La consulta pública continúa sin cuenta y la ubicación se usa solo mediante el permiso ya aceptado en ADR-0009. La ubicación no se almacena ni se transmite directamente a un proveedor de rutas sin decisión y explicación aprobadas.
- La web pública es un cliente de primer nivel, separado de `apps/admin`. La estrategia y la matriz inicial se concretan en [ADR-0011](../../adr/0011-public-web-client-and-map-renderer.md).
- El primer corte web incluye diseño adaptable, mapa, búsqueda, filtros, lista alternativa y selección; HU-015 y HU-020/021/023 se implementan en navegador además de móvil dentro de los criterios de esta iteración.
- La comparación de cliente/renderizador está resuelta para este incremento en ADR-0011. La compatibilidad automatizada comprobada es Chromium en escritorio y ventana estrecha; una prueba aislada no certifica otros navegadores ni lectores de pantalla.

**Fuera de alcance:** ficha completa HU-014 y favoritos, autobús, bicicleta, ruta accesible, rutas fuera del campus, navegación giro a giro en tiempo real, ubicación continua, administración de datos y teselas cartográficas offline. La web administrativa sigue su propio alcance.

## Decisiones y dependencias

La decisión del cálculo local y la red se documenta en [ADR-0012](../../adr/0012-campus-pedestrian-routing.md). No se reutiliza ni se llama el servicio histórico de OpenRouteService.

También se comprobará una vía de build nativo iOS y Android para el incremento. La exportación JavaScript no satisface esa comprobación y la excepción de Sprints anteriores no se extiende.

La estrategia de navegador, renderizado web y exportación CI se documenta en [ADR-0011](../../adr/0011-public-web-client-and-map-renderer.md). La decisión no habilita un despliegue ni modifica Settings remotos.

## Responsabilidades funcionales

| Área                                  | Responsabilidad                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner                         | Aclarar el valor de la ruta, los límites del campus, los datos que pueden mostrarse y la aceptación de cada HU.                                   |
| Scrum Master                          | Facilitar eventos Scrum y hacer visibles bloqueos de datos, acceso nativo o condiciones de proveedor.                                             |
| Developers — móvil y experiencia      | Integrar búsqueda, selección de origen/destino, mapa, instrucciones y estados accesibles.                                                         |
| Developers — dominio y rutas          | Modelar solicitudes, alternativas, instrucciones, validación y errores; mantener el motor desacoplado de la interfaz.                             |
| Developers — datos, API e integración | Validar la fuente de red, documentar atribución y conectar el servicio elegido con contratos tipados.                                             |
| Developers — cliente web              | Evaluar y construir la experiencia pública de navegador, mantenerla separada de la administración y comprobar compatibilidad y accesibilidad web. |
| Developers — calidad y documentación  | Preparar pruebas, validar Android/iOS, mantener contratos, historias, ADR, guía y fuentes de datos alineados.                                     |

Las responsabilidades identifican áreas de colaboración; los Developers se autoorganizan y el Sprint Backlog se mantiene durante el Sprint.

## Plan de trabajo

| ID  | Actividad y entregable                                                                                                                                                                                                                                                            | Dependencias                     | Área funcional                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------- |
| T0  | Inspeccionar en modo lectura los workflows locales/remotos y Settings de GitHub disponibles; contrastar ramas protegidas, checks, aprobaciones y auto-merge con ADR-0006. Registrar qué se pudo verificar y qué requiere a la persona mantenedora; este plan no cambia el remoto. | Estado inicial                   | Integración + mantenedor del repositorio |
| T1  | Establecer una vía reproducible de build/ejecución nativa para Android e iOS; adaptar la referencia remota a la toolchain local mediante runner macOS/simulador si no hay Xcode disponible.                                                                                       | T0, ADR-0005/0006                | Integración y calidad                    |
| T2  | Refinar HU-099/015/020/021/023 con matriz de ventanas/navegadores, interacciones de mapa, ejemplos, geometrías límite, criterios de no-ruta y datos transferidos.                                                                                                                 | Historias candidatas             | Product Owner + Developers               |
| T3  | Comparar alternativas de cliente web y renderizador cartográfico; aceptar ADR técnico con compatibilidad, atribución, accesibilidad, mantenimiento, pruebas, build/CI y diferencias de plataforma.                                                                                | T2; ADR-0001/0002/0004/0007/0010 | Arquitectura + web + accesibilidad       |
| T4  | Comparar las estrategias de red y cálculo; verificar licencia, política, cobertura, privacidad, coste y operación; redactar y aceptar ADR antes de elegir.                                                                                                                        | T2; ADR-0002/0003/0004/0007      | Datos, API e integración                 |
| T5  | Construir o validar fixtures y catálogo de la red con fuente, licencia, fecha, precisión y casos conocidos de desconexión.                                                                                                                                                        | T4                               | Datos y rutas                            |
| T6  | Definir contratos de rutas, distancia/duración estimadas, pasos, errores y metadatos de procedencia; documentar OpenAPI si el cálculo queda en API.                                                                                                                               | T4, T5                           | Dominio y API                            |
| T7  | Preparar la base del cliente público web y el flujo adaptable de mapa, búsqueda, filtros, lista textual y selección; mantener la web administrativa separada.                                                                                                                     | T1, T3                           | Web y experiencia                        |
| T8  | Integrar servicios cercanos y origen/destino, cálculo peatonal, ruta e indicaciones en móvil y web, con ubicación opcional y manejo de estados.                                                                                                                                   | T5–T7                            | Dominio, móvil y web                     |
| T9  | Probar motor, contratos y componentes en móvil y matriz web: red válida/no válida, ruta inexistente, coordenadas inválidas, teclado, foco, tamaños y carga/error/vacío.                                                                                                           | T5–T8                            | Calidad y accesibilidad                  |
| T10 | Actualizar criterios, guía web/móvil, atribuciones y decisiones; incorporar workflow CI de web con comprobaciones y build reproducible, y validar build web y builds nativos Android/iOS.                                                                                         | T1, T9                           | Calidad y documentación                  |
| T11 | Inspeccionar el Increment, adaptar backlog y registrar solo resultados y ceremonias realmente producidos.                                                                                                                                                                         | T10                              | Todo el Scrum Team                       |

## Áreas y archivos previstos

- `apps/mobile/src/features/campus/`: selección de lugares, servicios cercanos, rutas y estados de pantalla.
- `apps/mobile/src/features/campus/domain/routing.ts` y `data/campus-routing-network.json`: grafo peatonal, cálculo local y procedencia.
- `apps/mobile/src/features/campus/map/CampusMap.web.tsx`, `LeafletCampusMap.web.tsx` y `styles/web.css`: carga web client-only, mapa Leaflet y estilos adaptables.
- `apps/mobile` y `apps/mobile/src/features/campus`: pruebas de dominio, componentes y pantalla.
- `.github/workflows/ci.yml`: exportación web añadida a los checks automatizados existentes.
- No se añade API ni `packages/contracts`: el cálculo local no requiere servicio externo en este Sprint.
- `docs/user-stories/`, `docs/backlog/`, `docs/development/data-sources.md`, `docs/development/README.md`, `docs/adr/` y este plan: criterios, fuente, decisiones y evidencia real.

## Referencia del remoto consultada para planificar

### Punto de partida local

Al preparar esta secuencia, la copia local estaba en la rama `feat/sprint-foundations`, sobre `6960a0728ad917189046cd956e712c570450bd58`. El Sprint 1 constaba como cerrado localmente y el incremento del Sprint 2 —ubicación puntual y filtros— permanecía en el árbol de trabajo sin publicar. Este plan conserva ese trabajo como base; no representa cambios del remoto ni convierte la planificación en una ejecución.

Consulta de solo lectura realizada el 24 de noviembre de 2026: `main` apuntaba al commit [`7bbf8009b35add3cebea9bbf59863cd26325a671`](https://github.com/ddavid07/UniMovil/commit/7bbf8009b35add3cebea9bbf59863cd26325a671), que incluye la PR [#49](https://github.com/ddavid07/UniMovil/pull/49). Esta fotografía puede haber cambiado y no implica usar el código remoto como implementación aceptada.

| Área revisada             | Evidencia de la fotografía                                                                                                                                                                                                           | Consecuencia para esta secuencia                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mapa y catálogo           | `main` contiene mapa móvil, búsqueda, categorías, selección, ficha visual y datos cartográficos.                                                                                                                                     | Mantener estas capacidades al reconstruir el producto y verificar procedencia, licencia y cobertura del catálogo local.                                                                |
| Favoritos e incidencias   | La PR #49 añade favoritos; el `FavoritesStore` revisado usa memoria. El flujo de incidencias móvil también contiene un store en memoria y no se observó un módulo de incidencias en `apps/api`.                                      | El Sprint 6 debe comprobar persistencia y aislamiento real; el Sprint 7 planifica API, permisos y almacenamiento antes de afirmar que el flujo se conserva.                            |
| Rutas                     | `apps/api` contiene `routes.service.ts` y `campus-graph.ts` con cálculo sobre un grafo de campus.                                                                                                                                    | En el Sprint 3 validar procedencia, licencia, precisión y cobertura antes de reutilizar el grafo o exponer una ruta.                                                                   |
| Administración            | `apps/admin` contiene pantallas y datos iniciales/servicio local; en los archivos de API revisados no se observó conexión equivalente de administración.                                                                             | Los Sprints 8–11 conectan las vistas a API y permisos de servidor; no tomar `initial-data.ts` como fuente operativa.                                                                   |
| Transporte en tiempo real | Hay contratos y módulos móviles de transporte, pero la inspección no acreditó por sí sola una fuente operativa autorizada ni su vigencia.                                                                                            | HU-028 permanece fuera del horizonte hasta verificar fuente, derecho de uso y mantenimiento.                                                                                           |
| CI y toolchain            | La copia local tiene `ci.yml`, `codeql.yml` y `dependency-review.yml`; su CI exporta bundles JS. `main` contiene `mobile.yml` con flujo nativo. La copia local fija Node 26.13.1/npm 11.20.0 y `main` consultado usa Node 24/npm 12. | El Sprint 3 debe adaptar controles nativos/web compatibles con ADR-0005; no copiar versiones o políticas sin evaluación. Una exportación JS no prueba build nativo ni web desplegable. |
| Configuración GitHub      | `main` aparecía protegida, `allow_auto_merge` era `false` y la consulta de rulesets no devolvió reglasets. No se confirmó el detalle de requisitos de protección clásica ni todos los checks.                                        | T0 mantiene auditoría de solo lectura y registra exactamente lo comprobable; cambios de Settings requieren solicitud y permisos apropiados.                                            |
| Cliente web histórico     | La [PR #45](https://github.com/ddavid07/UniMovil/pull/45) seguía abierta, GitHub la mostraba no mergeable y no estaba en el SHA de `main` indicado. Incluye variantes web de mapa/pantallas y usa Leaflet.                           | Puede orientar la comparación del Sprint 3; revisar arquitectura, datos, accesibilidad y licencia antes de decidir cualquier reutilización. No es implementación aprobada.             |

La presencia de archivos o pruebas en `main` no demuestra por sí sola uso real, autorización de datos ni satisfacción de todos los criterios de una historia. Ningún estado remoto se considera configurado localmente sin comprobarlo.

## Orden de ejecución

1. Inspeccionar en modo lectura CI/Settings y evidencia local/remota; preparar la ruta de build nativo iOS/Android.
2. Refinar historias y compatibilidad web; aceptar primero el ADR de cliente/renderizador y el ADR de cálculo de rutas, validando sus fuentes y políticas.
3. Estabilizar contratos y catálogo; implementar de forma vertical mapa/búsqueda web, servicios cercanos, origen/destino, ruta e indicaciones en las superficies acordadas.
4. Ejecutar pruebas unitarias, de contrato, integración y navegador; validar accesibilidad, CI/builds, documentación y trazabilidad antes de inspeccionar el Incremento.

## Riesgos y respuestas

| Riesgo                                                                 | Probabilidad / impacto | Mitigación, señal y respuesta                                                                                                                                          | Seguimiento                |
| ---------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Red incompleta o sin derecho de reutilización                          | Media / Alta           | No integrar hasta validar fuente/licencia; mostrar únicamente cobertura demostrable. Si no hay fuente, mantener fixtures sintéticos y devolver el elemento al backlog. | Product Owner + datos      |
| Ruta calcula trayectos sobre accesos cerrados o tramos no transitables | Media / Alta           | Validar contra una red peatonal revisada y casos manuales; no inferir conectividad desde proximidad geométrica. Corregir o retirar el tramo afectado.                  | Datos y rutas              |
| Proveedor recibe origen/destino sensibles                              | Media / Alta           | Analizar datos enviados y retención antes de seleccionar; minimizar precisión y documentar el consentimiento/aviso. No activar la integración sin ADR.                 | Arquitectura + privacidad  |
| Fallo de build nativo en una plataforma                                | Media / Alta           | Habilitar y comprobar runner macOS/simulador al inicio si Xcode no está localmente disponible; no cerrar con export JS.                                                | Calidad e integración      |
| El cliente web no comparte correctamente políticas o datos del móvil   | Media / Alta           | Decidir contratos, fuentes, atribución, permisos y límites antes de implementación; probar el flujo en la matriz web y mantener diferencia de plataforma explícita.    | Web + dominio + privacidad |

## Pruebas, documentación y Definition of Done

La cobertura relaciona criterios con pruebas de dominio (validación, distancia, duración y conectividad), de contrato/API, de integración entre selección y resultado, y de interfaz (carga, ausencia de ruta, error, reintento, texto alternativo). Se comprueba lector de pantalla y que la lista de pasos transmite el recorrido sin depender solo del mapa o del color.

La documentación se actualiza junto al código: historias y backlog; ADRs aceptados para cliente web y rutas; fuente y licencia de la red; contrato API; pasos de ejecución y configuración; riesgos y evidencia. El DoD compartido de [metodología](../../methodology/README.md) exige criterios satisfechos, CI y pruebas apropiadas en cliente web, Android e iOS, documentación alineada y aceptación de producto. No se declarará HU completa si la procedencia de una ruta o un criterio no puede demostrarse.

## Referencias del temario aplicadas

- [Scrum](../../assets/course-materials/lecture-notes/topic-03-1-agile-and-scrum.pdf), [planificación ágil](../../assets/course-materials/lecture-notes/topic-03-2-agile-estimation-and-planning.pdf) y [planificación de proyectos de software](../../assets/course-materials/lecture-notes/topic-07-10-software-project-planning.pdf): objetivo, alcance, tareas, dependencias y adaptación del Sprint Backlog.
- [Ingeniería de requisitos](../../assets/course-materials/lecture-notes/topic-07-3-requirements-engineering.pdf) y [IEEE 830](../../assets/course-materials/lecture-notes/ieee-830-1998-software-requirements-specification.pdf): trazabilidad de HU-099, criterios comprobables y límites explícitos.
- [Gestión de riesgos](../../assets/course-materials/lecture-notes/topic-05-risk-management.pdf), [ISO/IEC 16085 e IEEE 1540](../../assets/course-materials/lecture-notes/topic-07-4-1-iso-16085-ieee-1540-risk-management.pdf): riesgos de cartografía, cliente web, privacidad y build.
- [Pruebas](../../assets/course-materials/lecture-notes/topic-06-software-testing.pdf), [garantía de calidad](../../assets/course-materials/lecture-notes/topic-07-5-software-quality-assurance.pdf) e [IEEE 730](../../assets/course-materials/lecture-notes/topic-07-5-1-ieee-730-software-quality-assurance.pdf): niveles de pruebas, accesibilidad y criterios de salida.
- [Gestión de configuración](../../assets/course-materials/lecture-notes/topic-07-7-configuration-management.pdf) e [IEEE 828](../../assets/course-materials/lecture-notes/topic-07-7-1-ieee-828-configuration-management.pdf): trazabilidad entre ADR, fuentes, dependencias, workflows y cambios del incremento.
- [Proceso iterativo](../../assets/course-materials/lecture-notes/topic-07-2-software-process.pdf), [equipos](../../assets/course-materials/lecture-notes/topic-07-1-teams-and-leadership.pdf), [proceso unificado/UML](../../assets/course-materials/lecture-notes/topic-07-6-unified-process-and-uml.pdf), [planificación RUP/IEEE 1058](../../assets/course-materials/lecture-notes/topic-07-9-project-planning-rup-ieee-1058.pdf) y [métricas](../../assets/course-materials/lecture-notes/topic-07-8-1-software-metrics.pdf): dependencias, riesgos, áreas funcionales y evidencia del incremento.

## Ceremonias y cierre

Se planifican Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective conforme a la metodología. Las actas solo se crearán si esas reuniones se celebran; al terminar el Sprint se añadirá un resultado basado en la evidencia observada, sin convertir este plan en acta.

## Resultado de implementación local

- HU-099: el cliente Expo se exporta a web con búsqueda, filtros, lista textual y mapa Leaflet; la administración sigue separada.
- HU-015: se selecciona ubicación de referencia o ubicación puntual autorizada, se filtra por categoría y se ordenan lugares por distancia estimada; cada resultado permite abrir mapa o planificador.
- HU-020/021/023: se seleccionan origen y destino por búsqueda/mapa, se calcula el camino sobre el grafo OSM local, se muestran distancia/duración estimadas, instrucciones y estados de falta de cobertura/conectividad. Al seleccionar un paso se resalta el segmento correspondiente.
- [ADR-0011](../../adr/0011-public-web-client-and-map-renderer.md) y [ADR-0012](../../adr/0012-campus-pedestrian-routing.md) registran las decisiones adoptadas y sus límites. La guía y las fuentes de datos se actualizaron junto con el código.
- El workflow de CI versionado exporta web y ejecuta una comprobación repetible en Chromium; la prueba cubre búsqueda, rutas peatonales, selección de una parada compartida, avisos y tamaños de escritorio/móvil, y bloquea solicitudes a teselas OSM.
- Verificación técnica local: formato, lint, TypeScript, 17 suites/58 pruebas Jest, compatibilidad de dependencias Expo, exportaciones JavaScript Android/iOS/web y prueba de navegador Chromium (1280 × 800 y 390 × 844). Los resultados corresponden al árbol local y no a una ejecución de GitHub Actions.
- `npm run mobile:android` compiló e instaló el APK de desarrollo y abrió la aplicación en un Pixel 6 emulado con Android 16/API 36. La captura local confirmó el renderizado MapLibre, la delimitación del campus y los marcadores; el logcat no mostró excepciones fatales.
- La validación nativa iOS no se ejecuta por falta de macOS/Xcode; se mantiene como excepción aceptada y no se confunde la exportación JavaScript iOS con un build nativo.
- No se publicó ni se modificó configuración remota. No se añaden actas de eventos Scrum.
