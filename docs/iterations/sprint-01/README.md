# Sprint 1 — fundamentos y primer flujo de mapa/búsqueda

- **Estado:** Cerrado. El incremento se integró en [PR #50](https://github.com/ddavid07/UniMovil/pull/50); este documento conserva la evidencia y las limitaciones del Sprint.

## Sprint Goal y valor

### Sprint Goal

Una persona puede abrir una versión de prueba de UniMovil, orientarse en un mapa interactivo del Campus de Moncloa y encontrar un lugar del catálogo por texto; los cambios del repositorio se integran mediante PR y CI reproducible.

### Objetivo del Sprint

Entregar una primera experiencia funcional de mapa y búsqueda, junto con la base de desarrollo y las protecciones automáticas del repositorio necesarias para integrar el trabajo. La planificación cubre código, workflows, configuración de GitHub, calidad, pruebas y documentación asociada.

### Criterios de planificación del curso aplicados

- El Product Owner plantea el valor y orden del backlog; los Developers seleccionan el trabajo, acuerdan cómo realizarlo y mantienen el Sprint Backlog.
- El Sprint Goal expresa un resultado común y se comprueba mediante criterios observables y un Increment usable.
- Las actividades identifican entregables, dependencias, criterios de aceptación y responsabilidades.
- Los riesgos se priorizan por probabilidad e impacto y cuentan con mitigación, seguimiento y respuesta.
- Pruebas, calidad, configuración y documentación forman parte del trabajo que produce cada incremento.

## Sprint Backlog

### Historias seleccionadas

| ID     | Historia                                                                                           | Resultado esperado                                                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| HU-010 | [Consultar el mapa del campus](../../requirements/user-stories/02-campus-map-search-and-places.md) | Mapa de Moncloa con navegación manual, límites y elementos principales, marcadores legibles y estados de carga/error en builds de desarrollo. |
| HU-013 | [Buscar lugares](../../requirements/user-stories/02-campus-map-search-and-places.md)               | Sugerencias por nombre, categoría o alias; selección que centra el mapa; estado sin resultados.                                               |

## Alcance, decisiones y dependencias

### ADR de entrada

- **ADR de entrada:** [ADR-0001](../../adr/0001-product-platform-and-scope.md), [ADR-0002](../../adr/0002-application-architecture-and-stack.md), [ADR-0003](../../adr/0003-api-and-data-platform.md), [ADR-0004](../../adr/0004-maps-and-geodata.md), [ADR-0005](../../adr/0005-toolchain-and-coding-standards.md), [ADR-0006](../../adr/0006-github-governance-and-ci.md), [ADR-0007](../../adr/0007-development-basemap-provider.md), [ADR-0008](../../adr/0008-campus-boundary-source.md)

### Alcance funcional

- Mostrar el mapa del Campus de Moncloa con una delimitación procedente de una fuente verificada.
- Permitir desplazar, acercar y alejar el mapa, conservando una vista legible en distintos tamaños de pantalla.
- Mostrar los lugares principales con marcador, nombre y categoría.
- Preparar un catálogo local de hasta 20 lugares verificados. Cada entrada tendrá nombre, categoría, coordenadas, fuente, licencia y fecha de comprobación. Solo se incluirán los registros que superen la revisión de procedencia y exactitud.
- Permitir buscar por nombre, categoría y alias. La búsqueda ignorará mayúsculas, espacios periféricos y diferencias de acentos, y ofrecerá sugerencias a partir de dos caracteres.
- Al seleccionar un resultado, centrar y resaltar su marcador en el mapa.
- Mostrar un estado claro cuando no haya coincidencias y permitir corregir la consulta.
- Mostrar carga, error y acción de reintento cuando no se pueda cargar el estilo o el mapa.
- Mantener visible la atribución que exijan el proveedor y la fuente cartográfica.
- No pedir ubicación ni calcular distancias en este flujo.

El mapa base usa teselas raster estándar de OpenStreetMap para navegación interactiva de bajo volumen, con `User-Agent` identificable, atribución visible y caché del cliente. No se precargan ni descargan teselas y el mapa base no ofrece uso offline. El incremento no habilita por sí solo un piloto público ni una publicación.

### Fuera de alcance

HU-011 ubicación actual; HU-012 filtros visibles del mapa; ficha completa HU-014; rutas y transporte; autenticación, favoritos, notificaciones, administración web, incidencias, persistencia compartida y despliegue. HU-013 no incluye distancia personalizada ni búsqueda remota.

## Responsabilidades por rol

### Responsabilidades por rol

| Rol           | Responsabilidades en el Sprint                                                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner | Ordena HU-010 y HU-013, confirma criterios de aceptación, valida la selección de lugares y decide cambios de alcance.                                                                                                      |
| Scrum Master  | Facilita Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective; ayuda a quitar impedimentos y hace visible el progreso. No asigna tareas a los Developers.                                                    |
| Developers    | Preparan la app, integran MapLibre, validan la fuente cartográfica y entregan mapa, marcadores y estados de carga/error.                                                                                                   |
| Developers    | Modelan lugar/categoría/alias, preparan el catálogo, implementan búsqueda y selección, y verifican el comportamiento.                                                                                                      |
| Developers    | Preparan npm workspaces, workflows, Dependabot y CI; integran los cambios y coordinan la comprobación multiplataforma.                                                                                                     |
| Developers    | Mantienen el Sprint Backlog, se autoorganizan, comparten la responsabilidad del Increment y pueden solicitar revisión voluntaria. Ninguna aprobación o respuesta de otra persona bloquea un merge cuando CI está en verde. |

Las PR pueden recibir comentarios de compañeros, pero no requieren aprobación humana para fusionarse.

## Plan inicial y seguimiento

### Plan de trabajo y dependencias

| ID  | Actividad y entregables                                                                                                                                                                                                                                                  | Dependencias                              | Responsable funcional                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------- |
| T1  | Preparar el workspace con npm, versión de Node fijada, lockfile, `.editorconfig`, TypeScript estricto, ESLint, Prettier y estructura inicial de la aplicación y sus pruebas.                                                                                             | ADR-0002, ADR-0005                        | Toolchain e integración                  |
| T2  | Crear workflows de CI para instalación reproducible, formato, lint, typecheck, pruebas disponibles y comprobación/export de Expo; crear workflows de CodeQL y Dependency Review; configurar Dependabot para npm y GitHub Actions; añadir plantillas de PR e incidencias. | T1, ADR-0006                              | Toolchain e integración                  |
| T3  | Configurar y comprobar en GitHub las reglas de `main`: PR obligatoria, checks de CI requeridos, cero aprobaciones obligatorias, auto-merge con squash, sin force-push ni borrado. Registrar el resultado de la comprobación.                                             | T2, persona con permisos de mantenimiento | Mantenedor del repositorio               |
| T4  | Crear development builds y verificar MapLibre en Android e iOS; registrar versiones, configuración nativa, pasos de ejecución y bloqueos.                                                                                                                                | T1, ADR-0002, ADR-0004                    | Aplicación y mapa                        |
| T5  | Revisar la procedencia del catálogo y de la delimitación del campus; preparar los datos locales con fuente, licencia, versión y fecha de comprobación.                                                                                                                   | ADR-0003, ADR-0004, ADR-0008              | Dominio y búsqueda                       |
| T6  | Implementar pantalla de mapa centrada en Moncloa, gestos, límites, marcadores, atribución y estados de carga, error y reintento.                                                                                                                                         | T4, T5                                    | Aplicación y mapa                        |
| T7  | Implementar búsqueda local por nombre, categoría y alias, con normalización, índice y sugerencias.                                                                                                                                                                       | T5                                        | Dominio y búsqueda                       |
| T8  | Integrar buscador y mapa: al seleccionar un resultado centrar y resaltar el marcador y mostrar el estado sin resultados.                                                                                                                                                 | T6, T7                                    | Dominio y búsqueda + aplicación y mapa   |
| T9  | Añadir pruebas de dominio y componentes, comprobar accesibilidad básica y ejecutar los criterios de aceptación en Android e iOS.                                                                                                                                         | T1–T8                                     | Todos los Developers                     |
| T10 | Presentar el incremento en Sprint Review, revisar los criterios de aceptación, adaptar el backlog y acordar mejoras del proceso en Sprint Retrospective.                                                                                                                 | T9                                        | Product Owner, Scrum Master y Developers |

### Orden de ejecución

1. Preparar el workspace y los workflows que permitan instalar, validar e integrar cambios.
2. Configurar las reglas de GitHub acordadas y verificar que una PR puede fusionarse tras pasar CI sin aprobación humana.
3. En paralelo, comprobar el build nativo de MapLibre y validar la procedencia de los datos geográficos.
4. Implementar el mapa y la búsqueda sobre el catálogo validado. Las dos áreas pueden avanzar en paralelo una vez disponibles la app base y el catálogo.
5. Integrar el flujo, comprobar criterios de aceptación en ambas plataformas y presentar el incremento.

Si MapLibre no compila en alguna plataforma o la fuente de datos no supera la revisión, se detiene el trabajo que dependa de ese resultado y se registra la decisión o el cambio de alcance correspondiente.

### GitHub, CI y automatización incluidos en el Sprint

Estos entregables forman parte del trabajo del Sprint:

- `npm ci`, formato, ESLint, TypeScript, pruebas disponibles y comprobación/export de Expo en PR y en `main`.
- Workflows separados para CI, CodeQL y Dependency Review, con permisos mínimos, cancelación de ejecuciones anteriores y acciones de terceros fijadas a SHA completo.
- Dependabot para npm desde la raíz del monorepo y para GitHub Actions, con frecuencia semanal, grupos de actualizaciones patch/minor y PRs separadas para major; habilitar actualizaciones de seguridad.
- Protección de `main` con PR y checks requeridos, sin aprobación obligatoria, auto-merge con squash y restricciones contra force-push/borrado.
- Comprobar secret scanning y push protection en Settings y habilitarlos si están disponibles para el repositorio.
- Plantillas de PR e incidencias para registrar alcance, historia asociada, evidencia y checks ejecutados.
- Los builds nativos completos no forman parte de cada PR; la compatibilidad se comprueba mediante los development builds de HU-010.

Los workflows y la configuración de Dependabot viven en archivos versionados. La protección de rama, auto-merge y otros controles de Settings se configuran en GitHub por una persona con permisos; deben comprobarse y no darse por activos solo porque exista documentación.

### Archivos previstos

| Área       | Archivos o rutas                                                                                                                                                                                             | Propósito                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Raíz       | `package.json`, `package-lock.json`, `.node-version`, `.editorconfig`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`                                                      | Workspace, versiones y estándares compartidos.                              |
| GitHub     | `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, `.github/workflows/dependency-review.yml`, `.github/dependabot.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/bug_report.yml` | CI, seguridad de dependencias y automatización.                             |
| Aplicación | `apps/mobile/package.json`, `apps/mobile/app.json`, `apps/mobile/src/app/`, `apps/mobile/src/features/campus/`                                                                                               | Cliente Expo, rutas y flujo de mapa/búsqueda organizado por funcionalidad.  |
| Catálogo   | `apps/mobile/src/features/campus/data/campus-places.json`, `apps/mobile/src/features/campus/data/campus-boundary.json`, `apps/mobile/src/features/campus/data/campus-boundary.ts`                            | Lugares y polígono del campus con procedencia, licencia y fecha/versionado. |
| Pruebas    | Archivos `*.test.ts(x)` junto a los módulos de campus y búsqueda                                                                                                                                             | Comportamiento de búsqueda, estados de interfaz y selección de lugar.       |

## Riesgos y respuestas

| Riesgo                                                                                                             | Probabilidad / impacto | Mitigación y respuesta                                                                                                                                                                                                                                                                                                    | Responsable                       |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| MapLibre no compila con la versión Expo o el entorno iOS disponible.                                               | Media / Alta           | Comprobar ambos builds antes de construir pantallas dependientes. Mantener versiones estables compatibles. Si falla, detener la integración y registrar una decisión de alternativa; no aceptar HU-010 solo en Android.                                                                                                   | Aplicación y mapa                 |
| No hay Mac/Xcode disponible para comprobar iOS.                                                                    | Media / Alta           | Para la Definition of Done general se requiere evidencia iOS nativa. La excepción local aceptada para Sprint 1 y su alcance constan en «Resultado y cierre local»; no se extiende a otros Sprints.                                                                                                                        | Scrum Master                      |
| El servicio público de teselas puede limitar o bloquear el tráfico si cambia el volumen o se incumple su política. | Media / Alta           | Mantener la navegación interactiva de bajo volumen, identificar las solicitudes, respetar la caché y no añadir precarga/offline; evaluar otro proveedor antes de un piloto público.                                                                                                                                       | Product Owner + aplicación y mapa |
| Nombres, geometrías o licencias del catálogo no superan la validación.                                             | Media / Alta           | Conservar solo registros verificables y su procedencia. No inferir atributos; ajustar la cobertura del catálogo al conjunto de datos que sí se pueda validar.                                                                                                                                                             | Dominio y búsqueda                |
| Las reglas remotas de `main` no coinciden con el ADR.                                                              | Media / Alta           | Comprobar Settings con la persona mantenedora y verificar una PR: checks requeridos, cero aprobaciones obligatorias y auto-merge con squash.                                                                                                                                                                              | Mantenedor del repositorio        |
| `npm audit` encuentra vulnerabilidades moderadas transitivas en la toolchain Expo.                                 | Media / Media          | `npm audit --omit=optional` reporta cuatro alertas moderadas de `minimatch` (`GHSA-g3hv-75wg-m249`) vía `@expo/fingerprint`. Se acepta para el cierre local; `npm audit fix --force` propone degradar Expo a `52.0.49`. Mantener el stack y esperar una actualización upstream compatible; repetir la auditoría entonces. | Toolchain e integración           |
| Cambios de alcance interrumpen la integración del flujo.                                                           | Media / Media          | Mantener HU-010/HU-013 como objetivo común. El Product Owner ordena el backlog y acuerda cualquier cambio; los Developers actualizan dependencias y trabajo restante en el Sprint Backlog.                                                                                                                                | Product Owner + Developers        |

## Verificación, documentación y Definition of Done

### Documentación sincronizada con el código

La documentación se actualiza junto con el cambio que la afecta, en la misma PR; no se deja como una actividad separada al final del Sprint.

- Si cambia el comportamiento o la interpretación de una historia, actualizar sus criterios y el Product Backlog junto con el código.
- Si el cambio adopta o modifica una decisión arquitectónica, actualizar o crear el ADR correspondiente antes de integrar la decisión en el producto.
- Si cambia instalación, comandos, versiones, variables de entorno o configuración, actualizar las instrucciones de desarrollo afectadas en el mismo cambio.
- Si cambia CI, Dependabot o las reglas de GitHub, actualizar el ADR-0006 y los documentos operativos afectados junto con los workflows o configuración.
- Si cambia el catálogo, conservar junto a los registros su fuente, licencia y fecha; actualizar atribuciones y notas de datos.
- Cada PR funcional indica qué documentación relacionada se actualizó o confirma que el cambio no afecta documentación existente.

### Definition of Done

Un elemento se considera terminado solo si:

1. Cumple sus criterios de aceptación y el alcance definido para el Sprint.
2. La app y las instrucciones de desarrollo se pueden reproducir desde un clon limpio usando las versiones fijadas.
3. El código respeta inglés, TypeScript estricto, ESLint, Prettier y las convenciones del paquete; incluye pruebas adecuadas al comportamiento modificado.
4. El mapa y la búsqueda funcionan en development builds Android e iOS; Expo Go no es evidencia suficiente.
5. La PR está fusionada tras pasar los checks requeridos de CI. No necesita aprobación ni revisión de otra persona.
6. La documentación afectada está actualizada en la misma PR que el cambio correspondiente.
7. Los datos reutilizados tienen procedencia y licencia verificables; la atribución cartográfica está visible y no se incluyen secretos ni datos personales innecesarios.
8. Los controles principales y los estados de error/sin resultados tienen textos y etiquetas accesibles.
9. El Product Owner confirma los criterios de aceptación del incremento.

### Criterios de éxito

- HU-010 y HU-013 cumplen sus criterios de aceptación o queda registrado en el backlog qué criterio no se satisfizo y qué decisión se tomó.
- La app demuestra mapa y búsqueda en Android e iOS, con evidencia reproducible.
- CI se ejecuta en PR y `main`; las reglas remotas permiten fusionar cuando los checks pasan, sin aprobación obligatoria.
- Los lugares incluidos son trazables; cualquier dato que no supere validación queda fuera del catálogo.
- La documentación relacionada permanece alineada con el comportamiento, las dependencias y la configuración implementados.

## Incremento y cierre

### Resultado y cierre local

- **Estado:** Sprint 1 cerrado el **24 de noviembre de 2026**. El incremento se integró posteriormente mediante [PR #50](https://github.com/ddavid07/UniMovil/pull/50); este cierre no modifica la Definition of Done general del proyecto.
- **HU-010:** la app muestra el polígono del campus, los lugares, la atribución y los controles. Se comprobó visualmente el encuadre, el zoom, el desplazamiento manual y el retorno al campus en un development build Android.
- **HU-013:** la búsqueda local muestra sugerencias, permite seleccionar un lugar y centra/resalta su marcador; la vista de lista ofrece la alternativa textual. Se comprobó en Android.
- **Android:** `npm run mobile:android` construyó e instaló la app en el emulador `UniMovil_API_36` (API 36). La pantalla muestra la delimitación y la atribución de OpenStreetMap.
- **Calidad local:** `npm run format:check`, `npm run check:expo`, `npm run typecheck`, `npm run lint`, `npm run test:ci`, `npm run export:android` y `npm run export:ios` finalizaron correctamente. Las pruebas ejecutaron 9 suites y 21 tests.
- **Excepción iOS aceptada para este cierre:** no se realizó build ni validación nativa iOS al no haber un Mac/Xcode disponible. El export JavaScript iOS pasó, pero no sustituye la comprobación nativa. La app queda cerrada localmente con esta limitación expresamente aceptada.
- **Integración remota:** en el cierre original no se abrió PR ni se ejecutó CI remoto. El incremento se integró posteriormente mediante [PR #50](https://github.com/ddavid07/UniMovil/pull/50); esa publicación no altera la evidencia de validación registrada para este Sprint.
- **Riesgo npm audit:** aceptado para el cierre local según la respuesta registrada en la tabla de riesgos.
- **Registro Scrum:** este apartado deja constancia del resultado y de las decisiones de cierre; no es un acta de Sprint Review o Sprint Retrospective ni afirma que esas reuniones se celebraran. Las actas se incorporan a `docs/meetings/` cuando existan reuniones reales que registrar.

### Evidencia de cierre

- Build y versiones Android/iOS probadas, dispositivos/emuladores y pasos de reproducción.
- Enlaces a PRs, workflows y resultados de CI.
- Resultado de HU-010/HU-013, cobertura del catálogo y bloqueos relevantes.
- Cambios de alcance, decisiones nuevas y elementos que pasan al backlog.
- Conclusiones de Sprint Review y Sprint Retrospective, con enlaces a sus actas si se celebraron.
