# Plan de Reducción, Supervisión y Gestión del Riesgo

- **Proyecto:** UniMovil, plataforma de orientación y movilidad para el Campus de Moncloa de la UCM.
- **Equipo:** Equipo UniMovil.
- **Última revisión documental:** 27 de noviembre de 2026 (ampliado con riesgos de equipo, ritmo, integración de monorepo y uso de IA; mantiene las comprobaciones técnicas del 26 de noviembre de 2026).
- **Ámbito:** estado documentado de los Sprints 1–7 y riesgos relevantes para los siguientes incrementos y para una futura operación del producto.
- **Método:** estrategia proactiva, análisis de probabilidad y consecuencia, priorización SQAS-SEI y acciones de reducción, supervisión y gestión (RSGR), según los [materiales de gestión de riesgos](../assets/course-materials/lecture-notes/topic-05-risk-management.pdf) y el [material de RSGR](../assets/course-materials/lecture-notes/topic-07-4-risk-management.pdf).

Los incrementos de los Sprints 1–7 constan como publicados mediante [PR #50](https://github.com/ddavid07/UniMovil/pull/50). Los Sprints 8–13 son propuestas sujetas a refinamiento. La valoración incorpora la evidencia de los Sprints, la auditoría actual del lockfile y la inspección de solo lectura de GitHub realizada el 26 de noviembre de 2026. No implica que se hayan repetido las pruebas funcionales descritas en los cierres.

## 1. Proceso y escalas

La gestión sigue cuatro actividades: identificar el riesgo y su causa; analizar probabilidad y consecuencia; priorizarlo; y planificar acciones para evitarlo, detectar su evolución y responder si ocurre. Cada ficha distingue:

- **Reducción:** acciones preventivas o alternativas que disminuyen la posibilidad o el efecto.
- **Supervisión:** señales observables y documentos que permiten detectar cambios.
- **Gestión:** respuesta cuando el riesgo ocurre o deja de ser aceptable.

### 1.1. Probabilidad

| Nivel      | Valor | Interpretación en el registro                                      |
| ---------- | :---: | ------------------------------------------------------------------ |
| Frecuente  |   5   | La condición ya está presente o se repite bajo el estado actual.   |
| Probable   |   4   | Es esperable si no cambia la situación o dependencia identificada. |
| Ocasional  |   3   | Puede producirse ante cambios o circunstancias concretas.          |
| Remota     |   2   | Es poco probable con los controles actuales, aunque posible.       |
| Improbable |   1   | La posibilidad es muy baja dentro del alcance evaluado.            |

### 1.2. Consecuencia

| Nivel          | Valor | Consecuencia para el proyecto                                                             |
| -------------- | :---: | ----------------------------------------------------------------------------------------- |
| Catastrófica   |   5   | Impide entregar o mantener el producto o compromete gravemente a sus usuarios.            |
| Crítica        |   4   | Invalida una capacidad central, compromete datos sensibles o impide una operación segura. |
| Seria          |   3   | Reduce de forma notable la funcionalidad, la calidad o la confianza y requiere retrabajo. |
| Menor          |   2   | Afecta de forma localizada y dispone de una alternativa sencilla.                         |
| Insignificante |   1   | Tiene un efecto despreciable sobre el resultado.                                          |

### 1.3. Matriz SQAS-SEI y exposición

El nivel se obtiene cruzando consecuencia y probabilidad. La exposición, calculada como probabilidad × consecuencia, sirve para ordenar riesgos del mismo nivel; no sustituye la matriz.

| Consecuencia \ Probabilidad | Frecuente (5) | Probable (4) | Ocasional (3) | Remota (2) | Improbable (1) |
| --------------------------- | :-----------: | :----------: | :-----------: | :--------: | :------------: |
| Catastrófica (5)            |      IN       |      IN      |      IN       |     H      |       M        |
| Crítica (4)                 |      IN       |      IN      |       H       |     M      |       L        |
| Seria (3)                   |       H       |      H       |       M       |     L      |       T        |
| Menor (2)                   |       M       |      M       |       L       |     T      |       T        |
| Insignificante (1)          |       M       |      L       |       T       |     T      |       T        |

**IN** significa intolerable; **H**, alto; **M**, medio; **L**, bajo; **T**, tolerable. Los niveles IN y H requieren acciones explícitas de reducción, supervisión y respuesta. Los riesgos M se mantienen bajo seguimiento y se revaloran si cambia su contexto. Los riesgos L y T pueden aceptarse mientras no cambien las condiciones que sostienen esa valoración.

## 2. Registro priorizado

Las puntuaciones son una valoración cualitativa del estado documentado, no mediciones estadísticas. «Abierto» indica que la exposición o el límite sigue existiendo; no significa que ya haya ocurrido un incidente. Las aceptaciones descritas se limitan al alcance local que indican los Sprints y ADR.

| ID    | Riesgo                                                                                                                                        | Tipo                        |     Prob.     | Consecuencia | Nivel  | Exp. | Estado documentado                                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | :-----------: | :----------: | :----: | :--: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RG-02 | No disponer de una ruta accesible respaldada por datos confirmados o inferir accesibilidad sin evidencia suficiente.                          | Técnico / datos             | Probable (4)  | Crítica (4)  | **IN** |  16  | HU-024 permanece abierta; el cliente aplica una respuesta segura y no afirma accesibilidad no verificada.                                                    |
| RG-06 | Usar cuentas o reportes con datos reales antes de resolver operación, privacidad, retención, correo y moderación institucional.               | Operación / privacidad      | Probable (4)  | Crítica (4)  | **IN** |  16  | Los Sprints 6–7 se probaron con Supabase local y datos sintéticos; el riesgo aceptado es para ese desarrollo local.                                          |
| RG-10 | Incorporar código, tests o documentación generados con asistencia de IA sin revisión, pruebas comprendidas ni dominio del equipo.             | Proceso / equipo            | Probable (4)  | Crítica (4)  | **IN** |  16  | El monorepo combina Expo, MapLibre, NestJS, Drizzle y Supabase; requiere PRs acotadas y comprensión verificable antes de cada RTF.                           |
| RG-05 | No detectar defectos específicos de iOS nativo por falta de builds y validación con macOS/Xcode en los Sprints 1–7.                           | Técnico / verificación      | Frecuente (5) |  Seria (3)   | **H**  |  15  | Excepción documentada en esos Sprints; una exportación JavaScript no equivale a validación nativa.                                                           |
| RG-01 | Que la cobertura, el grafo peatonal o los lugares derivados de OpenStreetMap estén incompletos, cambien o no representen la situación actual. | Técnico / datos             | Probable (4)  |  Seria (3)   | **H**  |  12  | Las fuentes y fechas están trazadas; son datos comunitarios y no certifican apertura, conexión ni condiciones del campus.                                    |
| RG-11 | Acumular trabajo entre iteraciones y perder ritmo semanal durante los Sprints 8–13 por carga académica o falta de reparto claro.              | Proyecto / planificación    | Probable (4)  |  Seria (3)   | **H**  |  12  | Sprints 8–13 siguen propuestos e incluyen `apps/admin`, avisos, catálogo y accesibilidad transversal; se mitiga dividiendo en cortes semanales.              |
| RG-03 | Que las teselas raster estándar de OpenStreetMap no estén disponibles o no sean apropiadas para un piloto o uso público sostenido.            | Técnico / proveedor externo | Ocasional (3) |  Seria (3)   | **M**  |  9   | El uso actual se limita a navegación interactiva de bajo volumen; el proveedor futuro no está elegido.                                                       |
| RG-04 | Que los horarios estáticos de EMT dejen de reflejar el servicio vigente.                                                                      | Técnico / datos externos    | Ocasional (3) |  Seria (3)   | **M**  |  9   | El snapshot tiene fecha y procedencia; no ofrece llegadas en tiempo real.                                                                                    |
| RG-07 | Que una alerta de dependencia conocida siga sin corrección compatible o reaparezca tras cambios de paquetes.                                  | Técnico / mantenimiento     | Ocasional (3) |  Seria (3)   | **M**  |  9   | `npm audit --omit=optional` detectó 8 vulnerabilidades moderadas y ninguna alta o crítica el 26/11/2026; las correcciones sugeridas requieren cambios major. |
| RG-12 | Desalineación entre código, contratos, documentación y Wiki tras refactorizaciones o cambios rápidos sin actualizar trazabilidad.             | Proceso / configuración     | Ocasional (3) |  Seria (3)   | **M**  |  9   | Reconciliado en PR #58–#63 (`HU-XXX.n`, matriz de trazabilidad y Wiki); exige mantener `docs/` como fuente única en cada PR.                                 |
| RG-13 | Romper contratos compartidos, reglas ESLint/TypeScript o el pipeline CI al incorporar `apps/admin` en los Sprints 8–10.                       | Técnico / integración       | Ocasional (3) |  Seria (3)   | **M**  |  9   | El monorepo solo incluye `api`, `mobile` y `contracts`; `apps/admin` (React/Vite) deberá integrarse en cortes pequeños validados en local y CI.              |
| RG-08 | Que la configuración efectiva de GitHub no coincida con los workflows y la política de CI versionados.                                        | Proyecto / configuración    |  Remota (2)   |  Seria (3)   | **L**  |  6   | Protección de `main`, tres checks requeridos, cero aprobaciones, auto-merge y opciones de fusión verificados el 26/11/2026; persiste riesgo de deriva.       |
| RG-09 | Exponer credenciales, tokens o datos personales en el repositorio, cliente, artefactos o registros.                                           | Seguridad / privacidad      |  Remota (2)   | Crítica (4)  | **M**  |  8   | Secret scanning, push protection y Dependabot security updates están habilitados; los patrones no asociados a proveedores están deshabilitados.              |

### 2.1. Criterio de intervención

Las fichas de nivel **IN** y **H** reciben tratamiento prioritario porque afectan a la cobertura segura de rutas, a la futura operación con datos reales, al dominio real del código asistido por IA, a la planificación semanal de Sprints 8–13, a la validación de iOS y a la fiabilidad de la cartografía. Los riesgos de nivel **M** también tienen medidas de reducción y respuesta en este plan; se revaloran cuando se actualiza una dependencia o fuente, se introduce un workspace nuevo como `apps/admin`, se cambia la configuración remota o se prepara un piloto o una versión pública. La priorización no asigna fechas ni supone que una propuesta de Sprint esté seleccionada.

## 3. Fichas RSGR

### RG-02 — Incertidumbre de accesibilidad en rutas y recursos

- **Valoración:** Probable (4) × Crítica (4) = **IN (16)**.
- **Evidencia:** los datos OSM no certifican rampas, ascensores, anchuras, entradas ni continuidad accesible. La historia [HU-024](../requirements/user-stories/03-routes-and-transit.md) sigue abierta y el [ADR-0017](../adr/0017-accessibility-data-confidence.md) define estados de certeza.
- **Reducción:** conservar como desconocido todo atributo sin fuente confirmada; evitar presentar una ruta como accesible por el mero hecho de filtrar escaleras conocidas; mantener alternativa textual y explicar la falta de cobertura.
- **Supervisión:** revisar procedencia y estado de certeza de cada atributo; comprobar que el motor y la interfaz mantienen el comportamiento seguro descrito en HU-024 y ADR-0017.
- **Gestión:** deshabilitar la afirmación o ruta accesible afectada, mostrar que no hay información suficiente y mantener HU-024 abierta hasta disponer de evidencia verificable.

### RG-06 — Operación de cuentas e incidencias con datos reales

- **Valoración:** Probable (4) × Crítica (4) = **IN (16)**.
- **Evidencia:** la implementación de Sprints 6–7 usa Supabase local e identidades o reportes sintéticos. La documentación no declara una instancia remota configurada, SMTP gestionado ni proceso institucional de moderación y retención. Los ADR-0014, ADR-0015, ADR-0016 y ADR-0018 describen los límites.
- **Reducción:** mantener las pruebas con datos sintéticos y la infraestructura local; antes de operar con datos reales, definir y verificar titularidad, configuración gestionada, correo, autorización, retención, eliminación, copias de seguridad, respuesta ante incidentes y moderación.
- **Supervisión:** comprobar la configuración de cada entorno y las políticas de acceso/retención antes de habilitar su uso; revisar que las evidencias continúan en almacenamiento privado y que la autorización se aplica en servidor.
- **Gestión:** no habilitar el flujo para reportes reales ni presentar el servicio como producción mientras falten esos controles; limitar el incremento al entorno local y a datos sintéticos.

### RG-01 — Calidad, cobertura y vigencia de los datos cartográficos

- **Valoración:** Probable (4) × Seria (3) = **H (12)**.
- **Evidencia:** el catálogo de lugares, la delimitación, el grafo peatonal y sus fechas se describen en [Fuentes de datos](../development/data-sources.md). El polígono OSM es cobertura aproximada, no lindero oficial; los datos comunitarios pueden estar incompletos o cambiar.
- **Reducción:** preservar fuente, licencia, fecha y referencia de cada conjunto; usar importadores reproducibles; no inferir entradas, disponibilidad, horarios, apertura ni conectividad a partir de coordenadas o etiquetas.
- **Supervisión:** al actualizar los conjuntos, comparar versión y fecha con la fuente y revisar registros, cobertura y tramos que afectan rutas; inspeccionar avisos de fuente en cada Sprint que modifique datos.
- **Gestión:** retirar o marcar como desconocido el elemento afectado, comunicar la falta de cobertura y regenerar el conjunto desde una fuente revisada antes de volver a presentarlo como vigente.

### RG-05 — Ausencia de validación nativa iOS

- **Valoración:** Frecuente (5) × Seria (3) = **H (15)**.
- **Evidencia:** los planes de Sprints 1–7 registran que no se realizaron builds ni pruebas nativas iOS por no disponer de macOS/Xcode. Las exportaciones JavaScript iOS solo acreditan la exportación web/JS correspondiente.
- **Reducción:** preparar acceso a un entorno macOS/Xcode o runner compatible antes de declarar validada una entrega nativa; incluir build, instalación y recorrido de los flujos afectados en la verificación del Sprint.
- **Supervisión:** distinguir en cada resultado la exportación JS de la compilación y prueba nativas; revisar qué plataformas cubrió realmente la evidencia.
- **Gestión:** declarar la limitación de compatibilidad iOS y mantener sin validar los criterios dependientes de ejecución nativa hasta completar el build y la prueba; no extender la excepción aceptada en Sprints 1–7 a otros incrementos automáticamente.

### RG-03 — Disponibilidad y condiciones del proveedor de teselas

- **Valoración:** Ocasional (3) × Seria (3) = **M (9)**.
- **Evidencia:** [ADR-0007](../adr/0007-development-basemap-provider.md) limita el uso actual de las teselas estándar OSM a navegación interactiva de bajo volumen, con atribución, identificación y respeto a la caché. No se descargan ni precargan teselas; no hay modo offline. La elección para piloto/publicación sigue pendiente.
- **Reducción:** mantener bajo el volumen de consulta, conservar la atribución y no añadir precarga, descarga masiva ni almacenamiento offline con este proveedor.
- **Supervisión:** observar errores de carga y comprobar condiciones y capacidad del proveedor antes de ampliar tráfico o habilitar un piloto.
- **Gestión:** conservar la lista textual de lugares y comunicar el fallo del mapa; antes de ampliar el uso, seleccionar y documentar un proveedor apropiado mediante la decisión de arquitectura correspondiente.

### RG-04 — Vigencia de horarios estáticos de EMT

- **Valoración:** Ocasional (3) × Seria (3) = **M (9)**.
- **Evidencia:** el cliente usa un snapshot GTFS oficial con fecha registrada en [Fuentes de datos](../development/data-sources.md). Los horarios son programados, no indican posición, retrasos ni llegadas en tiempo real.
- **Reducción:** mostrar la fecha de actualización y la fuente; no describir las salidas programadas como tiempo real; enlazar la fuente oficial para incidencias del servicio.
- **Supervisión:** comparar la fecha y el calendario del snapshot con los recursos publicados por EMT al renovar los datos y revisar cambios de líneas/paradas relevantes.
- **Gestión:** marcar o retirar horarios cuya vigencia no pueda confirmarse, informar de la fecha disponible y mantener el enlace a la fuente oficial.

### RG-07 — Vulnerabilidades o avisos en dependencias

- **Valoración:** Ocasional (3) × Seria (3) = **M (9)**.
- **Evidencia:** `npm audit --omit=optional` ejecutado el 26 de noviembre de 2026 informó 8 vulnerabilidades moderadas y ninguna alta o crítica. Afectan a `expo`, `@expo/fingerprint`, `@maplibre/maplibre-react-native`, `drizzle-kit`, `@esbuild-kit/core-utils`, `@esbuild-kit/esm-loader`, `esbuild` y `minimatch`. Las correcciones sugeridas por npm incluyen cambios major (entre ellos Expo 52 y Drizzle Kit 0.18); no se aplicaron. El resultado histórico de Sprint 4 había identificado cuatro avisos moderados.
- **Reducción:** mantener lockfile reproducible, revisar avisos y compatibilidad del SDK antes de actualizar y evitar ocultar alertas mediante cambios incompatibles.
- **Supervisión:** revisar los resultados de auditoría al tratar dependencias y antes de preparar una versión; registrar el resultado y la versión evaluada, distinguiendo hallazgos nuevos de los históricos. La auditoría actual no demuestra por sí sola compatibilidad de una actualización mayor ni ejecución de código vulnerable en producción.
- **Gestión:** actualizar o sustituir la dependencia mediante cambios compatibles y pruebas de regresión; si no existe actualización compatible, mantener explícito el alcance afectado y revalorar la aceptación antes de publicar una nueva versión. La vigencia actual del hallazgo requiere una auditoría posterior.

### RG-08 — Diferencia entre workflows locales y Settings de GitHub

- **Valoración:** Remota (2) × Seria (3) = **L (6)**.
- **Evidencia:** la inspección de solo lectura del 26 de noviembre de 2026 confirmó protección clásica estricta de `main`, requisito de pull request, checks `Quality, platform bundles and web smoke test`, `Analyze TypeScript` y `Review dependency changes`, cero aprobaciones obligatorias, aplicación a administradores y bloqueo de force-push y borrado. Auto-merge está habilitado; squash está permitido y merge commits/rebase están deshabilitados. No hay rulesets. La inspección histórica de Sprint 3 reflejaba el estado anterior.
- **Reducción:** mantener la política en ADR-0006 y no introducir aprobaciones humanas obligatorias.
- **Supervisión:** contrastar la configuración efectiva de GitHub con ADR-0006 y los workflows cuando cambien las reglas o antes de depender de un nuevo check.
- **Gestión:** documentar y corregir cualquier discrepancia comprobada con la persona que tenga permisos de mantenimiento; no declarar activo un control basándose solo en un archivo YAML.

### RG-09 — Exposición de secretos o datos personales

- **Valoración:** Remota (2) × Crítica (4) = **M (8)**.
- **Evidencia:** el repositorio es público; `.gitignore` excluye variables locales, claves y certificados, con una plantilla `.env.example` permitida. En GitHub están habilitados secret scanning, push protection y Dependabot security updates; la detección de patrones de secretos no asociados a proveedores está deshabilitada. ADR-0014/0015 restringen claves administrativas y tokens al servidor.
- **Reducción:** mantener secretos fuera de Git, paquetes cliente, workflows, fixtures y logs; usar configuración local ignorada y secretos del entorno de ejecución cuando se configuren servicios.
- **Supervisión:** revisar diffs y artefactos antes de integrarlos, comprobar el contenido de las plantillas de entorno y verificar los controles de GitHub cuando cambien.
- **Gestión:** revocar y rotar de inmediato cualquier credencial expuesta, retirar el secreto del servicio y del historial conforme al procedimiento aplicable, evaluar el acceso a datos y registrar la respuesta sin volver a copiar el valor comprometido.

### RG-10 — Dependencia de código o textos generados con IA sin comprensión del equipo

- **Valoración:** Probable (4) × Crítica (4) = **IN (16)**.
- **Evidencia:** [AGENTS.md](../../AGENTS.md) regula explícitamente la asistencia de agentes de código sobre un monorepo amplio (Expo, MapLibre, NestJS, Drizzle y Supabase). Si un cambio generado con IA se integra sin entender sus invariantes o sin verificar qué comprueban sus pruebas, el equipo pierde capacidad de mantenimiento y defensa técnica.
- **Reducción:** trabajar en cortes y Pull Requests pequeños por historia o bloque documental, exigir lectura del diff antes de hacer commit, validar en local `format:check`, `lint`, `typecheck`, `test:ci` y `api:test`, y acompañar cada cambio funcional con pruebas comprensibles por su autor.
- **Supervisión:** revisar en cada PR que los contratos, casos negativos y documentos afectados coinciden con la arquitectura real; comprobar antes de cada Revisión Técnica Formal que cada miembro explica la lógica de los módulos que firma.
- **Gestión:** si se detecta código opaco o documentación no contrastada con la ejecución real, detener nuevas ampliaciones sobre ese bloque, simplificarlo o rehacerlo en cortes revisados y corregir cualquier afirmación no comprobada.

### RG-11 — Pérdida de ritmo semanal y acumulación de trabajo en Sprints 8–13

- **Valoración:** Probable (4) × Seria (3) = **H (12)**.
- **Evidencia:** tras los Sprints 1–7 permanecen propuestos los Sprints 8–13 (panel administrativo, avisos, gestión del catálogo, importadores y accesibilidad/resiliencia transversal) dentro de un calendario académico con exámenes y entregas paralelas entre cinco integrantes.
- **Reducción:** dividir cada Sprint en cortes verticales independientes (contratos y esquema, API con pruebas, interfaz, cierre documental), asignar responsables por historia al planificar cada iteración y priorizar funcionalidades mínimas demostrables antes que abarcar un Sprint completo en bloque.
- **Supervisión:** revisar semanalmente el avance real en GitHub (ramas activas, PRs abiertas, estado de CI y tablero de backlog) y hacer visibles los bloqueos en coordinación con el Scrum Master.
- **Gestión:** si baja la capacidad del equipo por exámenes o bloqueos técnicos, recortar el Sprint Backlog al objetivo esencial acordado con el Product Owner y documentar honestamente el trabajo aplazado en el plan del Sprint y en el backlog.

### RG-12 — Desfase entre código, contratos, documentación y Wiki

- **Valoración:** Ocasional (3) × Seria (3) = **M (9)**.
- **Evidencia:** tras la reconstrucción del baseline (`PR #50`) fueron necesarias varias iteraciones documentales (`PR #58`–`#63`) para alinear la Wiki, numerar criterios `HU-XXX.n`, añadir evaluación INVEST y construir la matriz real de trazabilidad. El repositorio distingue la documentación principal en `docs/` de la Wiki como capa de navegación.
- **Reducción:** mantener `docs/` como única fuente de verdad (sin duplicar tablas completas en la Wiki), usar el checklist de [CONTRIBUTING.md](../../CONTRIBUTING.md) para actualizar historias, backlog, trazabilidad y planes en la misma PR de código y separar claramente planes futuros de incrementos cerrados.
- **Supervisión:** comprobar en cada cierre de Sprint que `product-backlog.md`, `docs/validation/traceability.md`, `docs/iterations/` y la Wiki reflejan exactamente los archivos, scripts y pruebas presentes en `main`.
- **Gestión:** cuando se detecte una discrepancia o enlace desactualizado, abrir una PR documental acotada antes de continuar añadiendo nuevas historias encima.

### RG-13 — Integración del monorepo y CI al incorporar `apps/admin`

- **Valoración:** Ocasional (3) × Seria (3) = **M (9)**.
- **Evidencia:** actualmente `workspaces` en `package.json` cubre `apps/api`, `apps/mobile` y `packages/contracts`, mientras que `apps/admin` (React/Vite según [ADR-0002](../adr/0002-application-architecture-and-stack.md)) aún no existe. El workflow [ci.yml](../../.github/workflows/ci.yml) ejecuta formato, ESLint, `typecheck` de todas las workspaces, pruebas y exportaciones en cada PR.
- **Reducción:** diseñar la entrada de `apps/admin` en un corte dedicado de Sprint 8 reutilizando `packages/contracts`, `eslint.config.mjs` y `tsconfig.base.json`, sin duplicar tipos DTO ni alterar los scripts requeridos por `apps/mobile` y `apps/api`.
- **Supervisión:** ejecutar en local la cadena completa (`format:check`, `lint`, `typecheck`, `test:ci`, `api:test` y exportaciones) cada vez que cambie la configuración raíz o un contrato compartido.
- **Gestión:** si un cambio transversal rompe el pipeline CI (como ocurre también ante actualizaciones externas detectadas por `check:expo`), aislar la corrección en una rama `build/` o `fix/` específica antes de reanudar nuevas funcionalidades.

## 4. Seguimiento y revisión

- Los **Developers** mantienen las señales y acciones técnicas junto al código, los datos y el Sprint afectado.
- El **Product Owner** considera el efecto del riesgo al ordenar y refinar el Product Backlog.
- El **Scrum Master** facilita que riesgos e impedimentos sean visibles y que el equipo revise su tratamiento; no se le atribuye la ejecución de controles técnicos.
- La valoración se revisa al preparar o cerrar un Sprint y cuando cambie una fuente, dependencia, decisión, plataforma o condición de operación.
- Un riesgo ocurrido se registra con evidencia, fecha, efecto y respuesta en el documento del incremento que lo produjo. Este plan resume el estado transversal y no sustituye esa evidencia.
- La aceptación de un riesgo queda limitada al alcance y entorno que la documentación identifica. Una aceptación para pruebas locales con datos sintéticos no autoriza uso de producción o datos reales.

## 5. Referencias

- [Product Backlog](../backlog/product-backlog.md)
- [Matriz de trazabilidad](../validation/traceability.md)
- [Planes y resultados de Sprints](../iterations/README.md)
- [Metodología de trabajo](../methodology/README.md)
- [ADRs](../adr/README.md)
- [Fuentes de datos y atribuciones](../development/data-sources.md)
- [Fundamentos del producto](../requirements/product-foundations.md)
- [Tema 5 — Análisis y Gestión del Riesgo](../assets/course-materials/lecture-notes/topic-05-risk-management.pdf)
- [Tema 7 — Gestión del riesgo y plan RSGR](../assets/course-materials/lecture-notes/topic-07-4-risk-management.pdf)
