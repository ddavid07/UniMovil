# Sprint 2 — ubicación actual y filtros del mapa

- **Sprint Goal:** Una persona puede consultar su posición aproximada en el mapa cuando lo solicita y filtrar los lugares del Campus de Moncloa por categorías, manteniendo la búsqueda pública y el uso manual del mapa.
- **Estado:** Implementación y comprobaciones locales realizadas; resultados y límites registrados al final. Este documento no es un acta ni afirma que se hayan celebrado ceremonias.
- **ADR relacionado:** [ADR-0009 — ubicación en primer plano y permisos](../../adr/0009-foreground-location-permissions.md), aceptado el 24 de noviembre de 2026.

## Objetivo del Sprint

Ampliar el flujo de mapa y búsqueda del Sprint 1 con dos capacidades que operan sobre el catálogo local: consultar la ubicación del dispositivo mediante una acción explícita y reducir los lugares visibles por categoría. La aplicación seguirá permitiendo orientarse y buscar sin cuenta y sin conceder permiso de ubicación.

La solución no añade servidor, base de datos, autenticación, seguimiento en segundo plano ni fuentes cartográficas nuevas. ADR-0009 se aceptó antes de implementar HU-011 y define el alcance de la consulta puntual.

## Criterios de planificación del curso aplicados

- El Sprint Goal explica el valor que aporta el incremento y sirve de guía común para seleccionar y adaptar el trabajo.
- Las historias elegidas se acompañan de criterios verificables; el plan descompone el trabajo, hace visibles dependencias y orden de integración.
- Los Developers mantienen y adaptan el Sprint Backlog y deciden cómo realizarlo; las áreas de coordinación de este documento no crean subequipos ni asignan personas.
- Los riesgos tienen probabilidad, impacto, acciones de reducción, seguimiento y respuesta.
- La estrategia de pruebas enlaza criterios de aceptación con pruebas de dominio, componentes, integración y validación nativa.
- La configuración, los estándares de calidad y la documentación forman parte del Incremento.
- El plan conserva trazabilidad entre historias, ADR, implementación, pruebas, CI y evidencia de aceptación.

La planificación aplica el material docente sobre [Scrum](../../assets/course-materials/lecture-notes/topic-03-1-agile-and-scrum.pdf), [plan de proyecto](../../assets/course-materials/lecture-notes/topic-07-10-software-project-planning.pdf), [requisitos](../../assets/course-materials/lecture-notes/topic-07-3-requirements-engineering.pdf) y [IEEE 830](../../assets/course-materials/lecture-notes/ieee-830-1998-software-requirements-specification.pdf), [gestión de riesgos](../../assets/course-materials/lecture-notes/topic-05-risk-management.pdf) y [riesgos según el proceso de software](../../assets/course-materials/lecture-notes/topic-07-4-risk-management.pdf), [pruebas](../../assets/course-materials/lecture-notes/topic-06-software-testing.pdf), [garantía de calidad](../../assets/course-materials/lecture-notes/topic-07-5-software-quality-assurance.pdf) y [gestión de configuración](../../assets/course-materials/lecture-notes/topic-07-7-configuration-management.pdf).

## Punto de partida y condiciones de entrada

- El Sprint 1 consta como cerrado localmente con HU-010 y HU-013; su resultado y excepciones están en el [plan del Sprint 1](../sprint-01/README.md).
- La rama activa es `feat/sprint-foundations`. El punto de partida local del Sprint 2 quedó preservado en `6960a07` (`chore: preserve sprint 1 local increment`), sin publicarlo.
- El código y documentación del Sprint 2 se incorporan sobre ese punto de control; no se sustituyen ni descartan los archivos del Incremento del Sprint 1.
- Verificar el árbol de trabajo y la disponibilidad de los comandos de calidad descritos en la guía de desarrollo antes de iniciar las tareas técnicas.
- Aplicar ADR-0009 al añadir acceso a ubicación y verificar la configuración efectiva del permiso en Android.
- Para el Sprint 2 se acepta expresamente la excepción de no realizar build ni validación nativa iOS por falta de acceso a ese entorno. Se documentará como limitación del cierre; una exportación del bundle JavaScript iOS no contará como validación nativa. La excepción es exclusiva de este Sprint y no modifica la Definition of Done general.

## Historias seleccionadas

| ID     | Historia                                                                             | Resultado esperado                                                                                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HU-011 | [Mostrar la ubicación actual](../../user-stories/02-campus-map-search-and-places.md) | La persona puede solicitar una posición aproximada, verla en el mapa y centrar la cámara en ella. Si rechaza el permiso o la posición no está disponible, conserva el mapa manual y recibe una indicación comprensible. |
| HU-012 | [Filtrar categorías del mapa](../../user-stories/02-campus-map-search-and-places.md) | La persona puede activar y desactivar categorías del catálogo, ver los cambios en el mapa y la lista, consultar una leyenda accesible y restablecer todos los filtros.                                                  |

HU-011 y HU-012 tienen prioridad alta en sus historias. Su selección para este plan no cambia el estado de prioridad «Por acordar» que mantiene el Product Backlog.

## Alcance funcional

### HU-011 — ubicación actual

- Incorporar una acción visible y accesible para solicitar la ubicación; no pedir el permiso al abrir la aplicación.
- Antes del diálogo del sistema, explicar en español que la ubicación se usa para mostrar y centrar la posición en el mapa.
- Solicitar acceso solo mientras se usa la aplicación. Usar una consulta puntual con precisión equilibrada y no iniciar observación continua.
- Si se concede permiso y el dispositivo obtiene una posición, mostrarla con un indicador identificable y centrar el mapa. Permitir volver a centrarlo en esa posición mientras siga disponible en memoria.
- Mantener el indicador de ubicación independiente de los filtros de categorías.
- Si se deniega el permiso, el dispositivo no tiene habilitados los servicios de ubicación o no se obtiene una posición, mostrar el estado correspondiente, una acción de reintento cuando proceda y la alternativa de continuar con el mapa manual.
- Una denegación que ya no permita volver a preguntar puede ofrecer el acceso a Ajustes del sistema; no impedir el resto del flujo si la persona no concede el permiso.
- No conservar coordenadas en disco, cuenta, telemetría ni historial, ni enviar la coordenada como dato a una API o servicio externo. El mapa raster seguirá solicitando al proveedor las teselas del área que queda visible al centrarlo; ese proveedor puede inferir el área aproximada consultada a partir de las teselas, igual que durante la navegación manual. No calcular rutas ni solicitar ubicación en segundo plano.

### HU-012 — filtros de categorías

- Usar las seis categorías ya presentes en el catálogo: edificios, transporte, aparcamientos, bicicletas, servicios y accesos.
- Mostrar todas las categorías activas al abrir la pantalla, para preservar el comportamiento del Sprint 1.
- Permitir activar y desactivar cada categoría sin recargar ni desmontar el mapa; aplicar los filtros también a la lista textual.
- Mostrar en la leyenda el nombre y símbolo de cada categoría activa. El significado no depende solo del color y los controles anuncian nombre y estado seleccionado al lector de pantalla.
- Ofrecer una acción para restablecer todas las categorías. Si no queda ningún elemento visible, mostrar un estado vacío con una acción para restablecer.
- Los filtros viven en el estado de la pantalla; no se guardan entre sesiones.
- La búsqueda conserva su alcance sobre todo el catálogo. Si se selecciona un resultado cuya categoría estaba desactivada, se activa esa categoría antes de centrar el resultado y se comunica el cambio de forma accesible. Así se conservan los criterios de búsqueda y selección de HU-013.
- Cuando no haya categorías desactivadas, mapa, lista y selección mantienen el comportamiento del Sprint 1.

## Restricciones de producto y privacidad

- La información pública sigue disponible sin cuenta (HU-001).
- La aplicación solo accede a la ubicación tras una acción explícita y permiso del sistema; rechazarlo no reduce las funciones que no lo necesitan (HU-007 y HU-092).
- La explicación previa a la solicitud indica el uso de la ubicación y que el proveedor del mapa recibe peticiones para el área visible. La aplicación no envía directamente la coordenada a ese proveedor, una API ni telemetría.
- La gestión de denegación, servicios deshabilitados y errores se mantiene dentro del flujo de HU-094.
- Los controles, anuncios de estado, filtros y alternativa en lista deben respetar HU-095 y la guía de accesibilidad del proyecto.
- La fuente del catálogo sigue siendo local y trazable según [fuentes de datos](../../development/data-sources.md). No se añadirán registros sin validar su fuente, licencia y fecha de comprobación.

## Fuera de alcance

HU-014 ficha completa de lugar; HU-015 servicios cercanos; rutas y transporte; seguimiento de ubicación; ubicación en segundo plano; geocercas; historial o persistencia de coordenadas; autenticación y favoritos; búsqueda remota; administración de categorías; API, base de datos, telemetría, notificaciones y publicación en tiendas.

La excepción de validación nativa iOS está aceptada para el Sprint 2: no se realizará esa validación y se dejará constancia explícita al cerrar el Sprint. Esta excepción no se extiende a futuros Sprints ni cambia la Definition of Done general.

## Responsabilidades y coordinación

El plan distribuye áreas de coordinación, no nombres ni asignaciones individuales. Product Owner, Scrum Master y Developers mantienen las responsabilidades descritas en la [metodología](../../methodology/README.md). Los Developers se autoorganizan, comparten la responsabilidad del Incremento y pueden colaborar en cualquier tarea.

| Responsabilidad o área             | Trabajo del Sprint                                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner                      | Mantener orden y valor del backlog; validar el comportamiento esperado de HU-011/HU-012 y la aplicación de ADR-0009; aceptar los criterios del Incremento y acordar cualquier cambio de alcance.                                                |
| Scrum Master                       | Facilitar los eventos Scrum, hacer visible la limitación de validación nativa iOS y ayudar a que el equipo inspeccione y adapte su plan. No asigna trabajo a Developers.                                                                        |
| Developers — mapa y ubicación      | Integrar la consulta puntual de posición con MapLibre, controlar cámara e indicador y comprobar el ciclo de permiso, carga, error y reintento.                                                                                                  |
| Developers — catálogo y filtros    | Implementar el filtrado por categoría y su integración con mapa, lista, búsqueda, selección y estado vacío.                                                                                                                                     |
| Developers — calidad e integración | Mantener pruebas automatizadas, comprobar configuración Expo, ejecutar CI local y preparar evidencia de validación nativa Android, configuración iOS y accesibilidad.                                                                           |
| Developers — documentación         | Mantener historias, ADR, guía de desarrollo, backlog y documentación visible alineados con la implementación. Esta área forma parte del trabajo compartido.                                                                                     |
| Todo el equipo                     | Mantener el Sprint Backlog y la Definition of Done; completar las tareas con colaboración y revisión voluntaria. Ninguna aprobación humana adicional puede ser condición para fusionar si los checks requeridos están en verde, según ADR-0006. |

Las áreas son puntos de coordinación; no son subequipos ni asignaciones a integrantes concretos.

## Plan de trabajo y dependencias

| ID  | Actividad y entregables                                                                                                                                                                                                      | Dependencias                         | Responsabilidad funcional                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------- |
| T1  | Aplicar ADR-0009; concretar el texto de permiso, el flujo de consulta puntual, los estados de error y las limitaciones de privacidad antes de implementar ubicación.                                                         | HU-011, ADR-0001, ADR-0002, ADR-0005 | Product Owner + Developers                         |
| T2  | Preservar el incremento local del Sprint 1 en un punto de control; verificar instalación reproducible, árbol de trabajo y comandos disponibles sin alterar ni publicar el remoto.                                            | Punto de partida                     | Developers — calidad e integración                 |
| T3  | Añadir la dependencia de ubicación compatible con Expo mediante la herramienta indicada por el ADR; actualizar el manifiesto y lockfile, revisar permisos generados y configurar solo el mensaje de primer plano aprobado.   | T1, T2, ADR-0002, ADR-0005           | Developers — mapa y ubicación                      |
| T4  | Definir un proveedor de ubicación desacoplado de la pantalla y cubrir permiso concedido, denegado, solicitud no repetible, servicio desactivado, posición ausente y error recuperable.                                       | T1, T3                               | Developers — mapa y ubicación + calidad            |
| T5  | Implementar la acción accesible, la explicación previa, los estados de solicitud y error, el indicador de posición, el centrado y el uso manual sin permiso.                                                                 | T4                                   | Developers — mapa y ubicación                      |
| T6  | Implementar función de dominio para seleccionar categorías visibles y pruebas que cubran categorías activas, conjuntos vacíos y conservación del catálogo.                                                                   | T2                                   | Developers — catálogo y filtros                    |
| T7  | Crear los controles de filtros y leyenda con nombres, estados accesibles, opción de restablecimiento y alternativa vacía en la lista.                                                                                        | T6                                   | Developers — catálogo y filtros                    |
| T8  | Integrar filtros con marcadores, lista, búsqueda y selección; asegurar que al seleccionar un resultado oculto se active su categoría y el mapa lo centre.                                                                    | T5, T7                               | Developers — catálogo y filtros + mapa y ubicación |
| T9  | Ejecutar pruebas de dominio y componentes para los flujos normales, límites, errores, denegaciones y regresiones de HU-010/HU-013; revisar accesibilidad manual y automática donde las herramientas disponibles lo permitan. | T4–T8                                | Todos los Developers                               |
| T10 | Construir y validar un development build nativo Android; comprobar permisos y flujos en ese entorno. Generar la exportación JavaScript iOS disponible y dejar constancia de que no hubo build ni validación nativa iOS.      | T3–T9; entorno Android disponible    | Developers — calidad e integración                 |
| T11 | Ejecutar comprobaciones locales y CI mediante la configuración existente; ajustar workflows únicamente si se demuestra que un check necesario no está cubierto o falla por el cambio.                                        | T3–T9                                | Developers — calidad e integración                 |
| T12 | Actualizar documentación y backlog junto con los cambios; preparar evidencia del Incremento y revisar el resultado y las mejoras del proceso en los eventos de cierre cuando se celebren.                                    | T1–T11                               | Todos los Developers; Scrum Team para eventos      |

## Orden de ejecución y adaptación

1. Confirmar alcance, criterios y ADR-0009; preservar el punto de partida local del Sprint 1.
2. Integrar primero el modelo y los tests de filtros, y preparar el proveedor de ubicación y su configuración nativa en paralelo.
3. Desarrollar cada flujo con estados de permiso, error, vacío y recuperación; mantener el mapa manual disponible en todos ellos.
4. Integrar la búsqueda y selección existentes con los filtros; comprobar explícitamente que una selección de categoría desactivada sigue siendo visible.
5. Ejecutar pruebas unitarias y de componentes, comprobaciones de calidad y builds nativos; resolver incompatibilidades antes de aceptar las historias.
6. Actualizar documentos conforme se integran cambios, presentar el Incremento en Sprint Review y revisar el proceso en Sprint Retrospective. Sus conclusiones se registrarán después de que los eventos se celebren.

El Sprint Backlog lo mantienen los Developers durante el trabajo. La excepción de iOS está aceptada para este Sprint; los builds nativos y permisos se comprobarán en Android, y el bundle JavaScript iOS se registrará por separado sin presentarlo como validación nativa.

## GitHub, CI y automatización incluidos en el Sprint

- La CI local ya definida comprueba formato, ESLint, TypeScript, pruebas, compatibilidad de Expo y exportaciones JavaScript Android/iOS. Los cambios de filtros y los proveedores desacoplados deben quedar cubiertos por esa suite.
- La dependencia añadida debe quedar en el lockfile y pasar la comprobación de compatibilidad Expo y las revisiones configuradas de Dependabot y Dependency Review.
- No se prevé crear un workflow nuevo: se revisará `.github/workflows/ci.yml` y solo se modificará si la implementación introduce una comprobación necesaria que actualmente no se ejecuta.
- Los workflows existentes de CodeQL, Dependency Review y CI siguen las reglas de seguridad descritas en [ADR-0006](../../adr/0006-github-governance-and-ci.md). No se deben ampliar permisos de workflow sin una necesidad justificada.
- La validación de permisos y comportamiento nativo se realiza con development builds; las exportaciones del bundle no la reemplazan. No se programa un build nativo obligatorio en cada PR.
- Las reglas de rama, Actions, auto-merge y demás Settings remotos no se consideran verificadas por este documento. Cualquier comprobación o cambio remoto requiere autorización y evidencia separadas.
- El flujo esperado para integrar el código sigue siendo PR y checks verdes, sin aprobación humana obligatoria, con squash y auto-merge según ADR-0006. Este plan no ejecuta push, PR, merge ni cambios remotos.

## Archivos previstos

| Área                       | Archivos o rutas                                                                                        | Propósito                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Aplicación                 | `apps/mobile/package.json`, `package-lock.json`, `apps/mobile/app.json`                                 | Dependencia compatible, resolución reproducible y permisos/mensaje nativo de primer plano. |
| Dominio                    | `apps/mobile/src/features/campus/domain/places.ts` y `*.test.ts` relacionados                           | Selección inmutable de categorías visibles y reglas de dominio.                            |
| Ubicación                  | `apps/mobile/src/features/campus/domain/location.ts`, `data/expo-location-gateway.ts`                   | Puerto de consulta puntual y adaptador de Expo Location separados de la presentación.      |
| Interfaz                   | `apps/mobile/src/features/campus/CampusScreen.tsx`, `map/CampusMap.tsx`, `components/`                  | Controles de ubicación, filtros, leyenda, marcador y estados accesibles.                   |
| Pruebas                    | Tests junto a módulos de dominio, ubicación, mapa y pantalla                                            | Casos positivos, límites, permisos, errores, integración con búsqueda y regresiones.       |
| CI                         | `.github/workflows/ci.yml` solo si la comprobación actual resulta insuficiente                          | Integración de checks nuevos únicamente con motivo técnico demostrable.                    |
| Guía del proyecto          | `README.md`, `apps/mobile/README.md`, `docs/development/README.md`                                      | Funciones disponibles, permisos requeridos, preparación del build y comprobaciones.        |
| Requisitos y planificación | `docs/user-stories/02-campus-map-search-and-places.md`, backlog y `docs/iterations/sprint-02/README.md` | Alinear criterios, estado y evidencia con el alcance completado.                           |
| Arquitectura               | `docs/adr/0009-foreground-location-permissions.md`, índice ADR                                          | Mantener la decisión aceptada y su configuración alineadas con el código.                  |

Las rutas concretas pueden ajustarse por los Developers al mantener la separación entre presentación, dominio y acceso a capacidades del dispositivo. No se añadirán ficheros o abstracciones sin necesidad funcional.

## Documentación sincronizada con el código

La documentación se actualiza en el mismo cambio que afecte al requisito, la arquitectura, la configuración o el comportamiento.

- ADR-0009 se aceptó antes de integrar el acceso a la capacidad nativa; cualquier cambio posterior en la política requiere actualizar o sustituir la decisión antes de implementar ese cambio.
- Si se precisa un criterio de HU-011 o HU-012, actualizar la historia, este plan y el Product Backlog juntos; no incorporar requisitos no trazables.
- Si cambia el texto de permiso, plataforma, configuración Expo, instalación o comandos, actualizar `apps/mobile/README.md` y la guía de desarrollo.
- Si cambia el comportamiento de producto, actualizar `README.md` y los textos de la interfaz en español.
- Si cambia CI o la configuración de GitHub, actualizar ADR-0006 y distinguir los archivos versionados de Settings remotos.
- No se añadirán datos geográficos nuevos por el trabajo de filtros o ubicación. Si el alcance requiere actualizar el catálogo, conservar fuente, licencia y fecha en el registro y la guía de datos.
- Registrar las conclusiones de Sprint Review y Retrospective en actas reales de `docs/meetings/` una vez celebradas; el plan no sustituye esas actas.

## Definition of Done

Se mantiene la Definition of Done del proyecto y del Sprint 1:

1. HU-011 y HU-012 satisfacen sus criterios y las restricciones de este plan; denegación, error y estado vacío están cubiertos.
2. La instalación y los pasos de ejecución son reproducibles con las versiones fijadas y el lockfile actualizado.
3. El código está en inglés, cumple TypeScript estricto, ESLint y Prettier, y tiene pruebas adecuadas para la lógica y los estados modificados.
4. Los cambios se ejecutan en un development build nativo Android. Para iOS no se realiza build ni validación nativa: la excepción está aceptada para el Sprint 2 y queda documentada; una exportación JS no la sustituye ni demuestra comportamiento nativo.
5. CI pasa en la PR que integra el trabajo. La fusión sigue ADR-0006 y no exige aprobación humana.
6. La documentación relacionada está actualizada junto con los cambios.
7. La posición no se persiste ni se envía a servicios externos; no se añaden permisos en segundo plano.
8. El mapa, la lista, la búsqueda, los filtros y sus estados tienen controles y anuncios accesibles; la información no depende solo del color.
9. El Product Owner valida los criterios del Incremento.

La excepción iOS del Sprint 1 fue puntual y no se extiende automáticamente. Para el Sprint 2 se ha aceptado expresamente la misma limitación; esta excepción se limita al cierre de este Sprint y no altera la Definition of Done general ni los criterios de futuros Sprints.

## Ceremonias y registros

El Sprint comprende Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective conforme a la metodología del proyecto. Los Developers mantienen el Sprint Backlog y adaptan cómo organizarse para alcanzar el Sprint Goal. Las actas se incorporan a `docs/meetings/` después de celebrarse las reuniones; este plan no afirma que hayan ocurrido.

Como mejora de proceso a comprobar durante el Sprint, mantener una lista de evidencia por plataforma desde que se prepara el trabajo nativo: dispositivo o emulador, build, permisos concedidos/denegados y pasos de reproducción. Esta mejora se propone para hacer visible la validación de plataforma y no se atribuye a una retrospectiva no documentada.

## Riesgos y respuestas

| Riesgo                                                                                                                                       | Probabilidad / impacto | Reducción, supervisión y respuesta                                                                                                                                                                                                                                                                                        | Responsable funcional                             |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| No hay acceso a macOS/Xcode o a un dispositivo iOS para validar permisos y mapa nativo.                                                      | Alta / Alta            | La falta de validación nativa iOS se acepta como excepción exclusiva del Sprint 2. Registrar que no se hizo build ni prueba nativa; generar el bundle JavaScript si CI lo permite y mantenerlo diferenciado de la evidencia Android nativa. No extender esta excepción a otros Sprints.                                   | Scrum Master + Developers — calidad e integración |
| ADR-0009 o la integración de ubicación requiere permisos más amplios que los necesarios.                                                     | Media / Alta           | Mantener el flujo de un solo uso, primer plano, gesto explícito y precisión equilibrada; comprobar los permisos efectivos Android y revisar la configuración Expo declarada para iOS, sin presentarla como validación nativa. Si la dependencia añade permiso en segundo plano, bloquear su integración hasta eliminarlo. | Product Owner + Developers — mapa y ubicación     |
| La lectura no obtiene posición en interiores o tarda más de lo esperado.                                                                     | Media / Media          | Mostrar progreso y error recuperable; limitar a 15 segundos la espera de una lectura que no responde, ofrecer reintento y conservar el mapa manual. No presentar una posición inexistente como válida. Comprobar la precisión en el campus y revisar la configuración de consulta.                                        | Developers — mapa y ubicación                     |
| La dependencia de ubicación no es compatible con Expo SDK o los proyectos nativos generados.                                                 | Media / Alta           | Validar la versión compatible, `expo install --check` y un development build nativo antes de integrar las pantallas; fijar el lockfile. Si falla, no actualizar Expo de forma lateral: revisar una alternativa y ADR-0009.                                                                                                | Developers — calidad e integración                |
| Filtros, lista y búsqueda divergen o una selección queda oculta por una categoría apagada.                                                   | Media / Media          | Mantener una función de dominio única y pruebas de filtros, búsqueda, selección, restablecimiento y estados vacíos; verificar manualmente mapa y lista.                                                                                                                                                                   | Developers — catálogo y filtros                   |
| El permiso de ubicación se interpreta como seguimiento o provoca abandono; el proveedor de teselas puede inferir el área visible consultada. | Media / Alta           | Explicar antes de solicitar el permiso el uso puntual y las peticiones de teselas del área visible; no pedirlo al inicio, conservar todas las funciones manuales, no persistir ni enviar directamente la coordenada a APIs o telemetría. Inspeccionar textos, manifiestos y estado persistido antes del build.            | Product Owner + Developers — mapa y ubicación     |
| La vulnerabilidad npm audit aceptada al cerrar Sprint 1 continúa o aparece otra al agregar la dependencia.                                   | Media / Media          | `npm audit --omit=optional` informa cuatro vulnerabilidades moderadas en `minimatch`, transitivas por `@expo/fingerprint` y Expo. La corrección automática disponible fuerza Expo 52 y rompe la compatibilidad del SDK actual; no se aplicó. Mantener seguimiento para una actualización compatible.                      | Developers — calidad e integración                |
| El punto de partida no está separado de los cambios nuevos del Sprint 2.                                                                     | Media / Alta           | Crear el checkpoint local previsto en las condiciones de entrada y comprobar el diff antes de modificar código; no descartar ni reescribir trabajo existente.                                                                                                                                                             | Developers — calidad e integración                |
| Cambios de alcance llevan a rutas, ficha completa, backend u otras historias no seleccionadas.                                               | Media / Media          | Mantener HU-011 y HU-012 como Sprint Goal; Product Owner ordena cualquier trabajo nuevo y Developers actualizan el Sprint Backlog para conservar el objetivo y calidad.                                                                                                                                                   | Product Owner + Developers                        |

## Criterios de éxito

- HU-011 funciona con permiso concedido, denegado, no disponible y recuperable; la persona puede seguir usando el mapa manual en todos los casos.
- HU-012 filtra las seis categorías, actualiza mapa y lista, explica los símbolos y permite restablecer; la búsqueda y selección de HU-013 siguen funcionando.
- Los casos de permisos no producen acceso al iniciar, actividad en segundo plano, persistencia de coordenadas ni transmisión directa de la coordenada a APIs o telemetría. Se informa de que el proveedor cartográfico recibe las peticiones de teselas correspondientes al área visible.
- Las pruebas, comprobaciones de calidad y CI están verdes; la evidencia nativa cubre Android. La ausencia de validación nativa iOS se registra como excepción aceptada para este Sprint, y cualquier exportación JS iOS se identifica por separado.
- El Product Backlog y la documentación reflejan el resultado observado, no solo el plan.
- Cualquier criterio que no se pueda demostrar se mantiene abierto y se documenta en el resultado y backlog en vez de declararse completado.

## Resultado de implementación local

- La implementación se realizó en `feat/sprint-foundations`, sobre el checkpoint local `6960a07` (`chore: preserve sprint 1 local increment`). Los cambios de este Sprint permanecen sin commit y sin publicar.
- **HU-011:** el permiso solo se solicita tras la explicación y la acción expresa; el adaptador usa permiso en primer plano, una lectura puntual de precisión equilibrada y guarda la posición solo en memoria. Si la API falla o no devuelve resultado en 15 segundos, la interfaz muestra un estado recuperable con reintento y mantiene el mapa manual. La lectura válida centra el mapa y añade el marcador de ubicación, independiente de los filtros.
- **HU-012:** las seis categorías pueden activarse y desactivarse; los cambios se aplican al mapa y la lista. La leyenda identifica cada categoría por letra y nombre, hay restablecimiento y estado vacío, y una sugerencia buscada fuera de los filtros los reactiva al seleccionarse.
- **Pruebas automatizadas:** `npm run format:check`, `npm run lint`, `npm run typecheck` y `npm run test:ci` completados correctamente; 11 suites y 40 pruebas pasan. Las pruebas de dominio y pantalla cubren concesión/denegación, servicios apagados, lectura vacía o fallida, timeout recuperable, filtros, lista y búsqueda.
- **Expo y bundles:** `npm run check:expo` y `npx expo install --check` completados correctamente. `npm run export:android` y `npm run export:ios` generaron sus bundles JavaScript. El bundle iOS no es una prueba nativa.
- **Android nativo:** `./gradlew assembleDebug -PreactNativeArchitectures=x86_64` terminó con `BUILD SUCCESSFUL`; se ejecutó el development build en `UniMovil_API_36` (Android API 36, pantalla 320 × 640). Se verificaron la explicación previa, la sesión con ubicación aproximada concedida (`ACCESS_COARSE_LOCATION` concedido; `ACCESS_FINE_LOCATION` denegado), el estado de error/reintento cuando no llega una lectura y la lectura simulada de `40.445, -3.726`, que centró el mapa y mostró el marcador. Los permisos de ubicación del manifiesto efectivo son `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION`; no se incluyen permisos de ubicación en segundo plano ni de servicio de ubicación en primer plano.
- **iOS nativo:** no se realizó build ni validación en dispositivo o simulador; se mantiene la excepción aceptada para este Sprint.
- **Dependencias:** `npm audit --omit=optional` termina con cuatro vulnerabilidades moderadas transitivas en `minimatch`. La solución automática propuesta fuerza un cambio incompatible a Expo 52; no se modificaron las dependencias para ocultar o sortear el aviso.
- **Integración remota:** no se creó PR, no se ejecutó CI en GitHub y no se modificó el remoto, de acuerdo con la restricción local de este trabajo. Este registro no afirma una revisión, aceptación de producto ni ceremonia Scrum que no se haya realizado.
