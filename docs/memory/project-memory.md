# Memoria del proyecto UniMovil

**Plataforma de orientación y movilidad para el Campus de Moncloa**

- **Asignatura:** Ingeniería del Software I.
- **Titulación:** Doble Grado en Ingeniería Informática y Matemáticas.
- **Centro:** Facultad de Informática, Universidad Complutense de Madrid (UCM).
- **Curso académico:** 2026/2027.
- **Fecha de corte documental:** 26 de noviembre de 2026.
- **Equipo y responsabilidades:** Equipo UniMovil. Las responsabilidades de Product Owner, Scrum Master y Developers se describen en la [metodología](../methodology/README.md).
- **Repositorio de código y documentación versionada:** [github.com/ddavid07/UniMovil](https://github.com/ddavid07/UniMovil).
- **Wiki del proyecto:** [Wiki de UniMovil](https://github.com/ddavid07/UniMovil/wiki).

---

## Índice de contenidos

1. [Introducción y motivación](#1-introducción-y-motivación)
   1. [Contexto y problema](#11-contexto-y-problema)
   2. [Objetivos](#12-objetivos)
   3. [Alcance](#13-alcance)
2. [Metodología de desarrollo y proceso software](#2-metodología-de-desarrollo-y-proceso-software)
   1. [Enfoque incremental y responsabilidades](#21-enfoque-incremental-y-responsabilidades)
   2. [Eventos y registros](#22-eventos-y-registros)
   3. [Artefactos y Definition of Done](#23-artefactos-y-definition-of-done)
3. [Gestión de riesgos](#3-gestión-de-riesgos)
   1. [Identificación y tratamiento](#31-identificación-y-tratamiento)
   2. [Riesgos de cartografía y datos](#32-riesgos-de-cartografía-y-datos)
   3. [Riesgos de accesibilidad, privacidad y operación](#33-riesgos-de-accesibilidad-privacidad-y-operación)
4. [Requisitos y Product Backlog](#4-requisitos-y-product-backlog)
   1. [Perfiles y actores](#41-perfiles-y-actores)
   2. [Organización y prioridades](#42-organización-y-prioridades)
   3. [Historias principales y criterios](#43-historias-principales-y-criterios)
   4. [Estimación](#44-estimación)
5. [Arquitectura y diseño del sistema](#5-arquitectura-y-diseño-del-sistema)
   1. [Estructura del monorepo](#51-estructura-del-monorepo)
   2. [Cliente móvil y web pública](#52-cliente-móvil-y-web-pública)
   3. [API, cuentas e incidencias](#53-api-cuentas-e-incidencias)
   4. [Datos y cartografía](#54-datos-y-cartografía)
   5. [Toolchain y automatización](#55-toolchain-y-automatización)
6. [Registro de Sprints e incrementos](#6-registro-de-sprints-e-incrementos)
7. [Validación, conclusiones y trabajo futuro](#7-validación-conclusiones-y-trabajo-futuro)
   1. [Evidencia de validación](#71-evidencia-de-validación)
   2. [Límites vigentes](#72-límites-vigentes)
   3. [Conclusiones y siguientes incrementos](#73-conclusiones-y-siguientes-incrementos)

---

## 1. Introducción y motivación

### 1.1. Contexto y problema

El Campus de Moncloa reúne edificios universitarios, servicios, accesos, recursos de movilidad y conexiones de transporte. Una persona que no conoce el campus puede necesitar localizar un lugar, comparar cómo llegar o interpretar si un dato está confirmado y actualizado. Las aplicaciones cartográficas generales no siempre ofrecen el detalle, la cobertura o el contexto que necesita esa consulta dentro del campus.

La información sobre caminos, accesos y servicios puede proceder de fuentes con distinto nivel de precisión. Una geometría o etiqueta cartográfica no demuestra por sí sola que una entrada esté abierta, que un camino sea accesible o que un recurso siga operativo. UniMovil debe comunicar esas limitaciones y evitar presentar datos inciertos como confirmados.

### 1.2. Objetivos

El proyecto busca:

- Facilitar la orientación por el Campus de Moncloa mediante un mapa y una lista de lugares consultable.
- Permitir la búsqueda de lugares y servicios sin exigir una cuenta ni un permiso de ubicación.
- Ofrecer rutas peatonales y comparar alternativas de transporte cuando las fuentes disponibles permitan hacerlo.
- Mostrar procedencia, fecha y grado de certeza de la información relevante.
- Proteger los datos de cuenta, favoritos e incidencias mediante autorización en servidor y almacenamiento privado.
- Mantener una experiencia pública accesible desde Android, iOS y navegadores web, separando de ella la administración.

### 1.3. Alcance

El producto público tiene como plataformas objetivo Android, iOS y navegador web. El incremento publicado de los Sprints 1–7 incluye mapa y búsqueda, consulta puntual de ubicación, filtros, cliente web, servicios cercanos, rutas peatonales, información estática de EMT, recursos de movilidad, cuentas, favoritos e incidencias.

La administración es una aplicación separada (`apps/admin/`). El corte de gestión de incidencias y auditoría del Sprint 8 está en curso en rama local (API, roles, transiciones, auditoría y `apps/admin`); la gestión de catálogo está propuesta para el Sprint 10.

Quedan fuera de las capacidades actuales la llegada de autobuses en tiempo real, una red ciclista verificada, una ruta que pueda afirmarse accesible sin atributos confirmados, la publicación de incidencias reales desde el entorno de desarrollo, un servicio Supabase de producción y la navegación en interiores. El Product Backlog y los planes de Sprint registran el trabajo futuro y sus dependencias.

---

## 2. Metodología de desarrollo y proceso software

### 2.1. Enfoque incremental y responsabilidades

El proyecto utiliza Scrum como marco de trabajo. Cada incremento se planifica en torno a un Sprint Goal y se concreta mediante historias, criterios de aceptación, dependencias, riesgos, verificación y Definition of Done. Los planes se adaptan a la evidencia y al trabajo que realmente se puede completar; la selección definitiva de una historia pertenece a la planificación del Sprint correspondiente.

| Responsabilidad | Función en el proyecto                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Product Owner   | Maximiza el valor del producto y ordena el Product Backlog.                                                              |
| Scrum Master    | Facilita la comprensión y aplicación de Scrum, ayuda a hacer visibles los impedimentos y promueve la mejora del proceso. |
| Developers      | Construyen el Incremento, deciden cómo organizar el trabajo y mantienen el Sprint Backlog.                               |

La descripción del proceso, el refinamiento y la trazabilidad se mantienen en [Metodología de trabajo](../methodology/README.md). El material de la asignatura está en [course-materials](../assets/course-materials/README.md).

### 2.2. Eventos y registros

Scrum contempla Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective. La metodología del proyecto describe su propósito y relación con los artefactos. Los planes de Sprint recogen alcance y resultados; las actas se conservan por separado en [docs/meetings/](../meetings/) cuando existen registros de reuniones.

A la fecha de corte, la carpeta de reuniones no contiene actas. Por ello, esta memoria y los planes de Sprint describen el trabajo y la evidencia disponible sin presentarlos como actas ni atribuir feedback o acuerdos a eventos no registrados.

### 2.3. Artefactos y Definition of Done

Los identificadores HU enlazan las necesidades con los criterios, el Product Backlog, los ADR, la implementación y la evidencia de cada Sprint. El [Product Backlog](../backlog/product-backlog.md) mantiene orden, prioridad, estado y evidencia; las fichas completas están en [user-stories](../requirements/user-stories/README.md).

La [Definición de Terminado](../methodology/definition-of-done.md) complementa los criterios de aceptación de cada historia. Para el proyecto, el trabajo terminado debe satisfacer esos criterios, disponer de pruebas adecuadas, conservar accesibilidad y privacidad, mantener actualizada la documentación relacionada y demostrar la verificación de las plataformas afectadas. Los planes distinguen la exportación de JavaScript de un build nativo y documentan las excepciones de validación.

---

## 3. Gestión de riesgos

### 3.1. Identificación y tratamiento

El [Plan de Reducción, Supervisión y Gestión del Riesgo](../risks/risk-management-plan.md) mantiene el registro transversal y su priorización. Cada plan de Sprint conserva los riesgos propios del incremento, sus señales y respuestas; los ADR documentan las consecuencias de decisiones arquitectónicas. El registro se revisa con la evidencia disponible y no convierte las propuestas de Sprints futuros en trabajo ya realizado.

### 3.2. Riesgos de cartografía y datos

| Riesgo o limitación                                                                           | Tratamiento vigente                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Las teselas estándar de OpenStreetMap tienen capacidad limitada y disponibilidad best-effort. | El uso se limita a navegación interactiva de bajo volumen, con identificación y atribución visibles, respeto a la caché y sin precarga ni descarga masiva. Antes de un piloto o publicación debe elegirse un proveedor adecuado. |
| La delimitación del campus procede de una geometría comunitaria de OpenStreetMap.             | Se conserva la versión, fecha y licencia; la aplicación la presenta como cobertura aproximada, no como linde oficial, catastral o de propiedad de la UCM.                                                                        |
| La red peatonal puede estar incompleta o desactualizada.                                      | El grafo local conserva fuente y fecha. La aplicación puede indicar que no hay ruta disponible y no sustituye los huecos por una línea recta presentada como camino.                                                             |
| El horario EMT es programado y no representa la operación en tiempo real.                     | El cliente muestra fuente y actualización; las incidencias operativas enlazan a EMT. La API de tiempos reales requiere una clave que no se incorpora al cliente.                                                                 |

Las fuentes, licencias, fechas y límites de cada conjunto están en [Fuentes de datos y atribuciones](../development/data-sources.md). Las decisiones sobre mapas, cobertura, rutas y transporte están en [ADR](../adr/README.md).

### 3.3. Riesgos de accesibilidad, privacidad y operación

- **Información de accesibilidad:** OpenStreetMap no acredita por sí solo que un acceso o camino sea accesible. Los atributos sin evidencia se muestran como desconocidos. HU-024 permanece abierta mientras no exista una ruta real respaldada por datos confirmados.
- **Validación nativa iOS:** los Sprints 1–7 registran la excepción de no realizar build ni prueba nativa iOS por falta de macOS/Xcode. Una exportación JavaScript iOS no cuenta como validación nativa.
- **Servicio gestionado y cuentas:** Supabase está elegido como plataforma objetivo y se usa localmente en los Sprints 6–7 con cuentas sintéticas. No hay un proyecto Supabase remoto configurado; SMTP gestionado, alojamiento, titularidad y políticas institucionales siguen sin resolverse para operación con datos reales.
- **Incidencias:** los informes reales empiezan privados y las evidencias se guardan en un bucket privado. La moderación institucional y el panel de gestión aún no están implementados; la consulta pública local se prueba con datos sintéticos.
- **Dependencias y mantenimiento:** cada Sprint conserva sus riesgos y comprobaciones en su plan. Los resultados históricos no se interpretan como una auditoría recién ejecutada.

---

## 4. Requisitos y Product Backlog

### 4.1. Perfiles y actores

El catálogo distingue cuatro roles de producto:

- **Público:** consulta información pública sin cuenta.
- **Usuario registrado:** accede a funciones privadas como favoritos e incidencias propias.
- **Gestor:** tramita incidencias y mantiene información cuando disponga de autorización.
- **Administrador:** gestiona roles, fuentes y configuración global dentro del alcance futuro.

La relación de una persona con la UCM es un dato opcional de perfil y no concede por sí sola permisos administrativos.

### 4.2. Organización y prioridades

El catálogo vigente contiene **69 historias de usuario y 354 criterios de aceptación**, organizados en nueve áreas: cuentas; mapa, búsqueda y lugares; rutas y transporte; accesibilidad y recursos; incidencias y avisos; personalización y notificaciones; administración y datos; seguridad, privacidad y calidad; y cliente público web.

Los Sprints 1–7 están registrados como incrementos publicados mediante [PR #50](https://github.com/ddavid07/UniMovil/pull/50). Las historias pendientes se ordenan por prioridad y por el orden del Product Owner. El Sprint 8 tiene refinamiento funcional del Product Owner registrado, pero sigue pendiente de Sprint Planning y selección. Los Sprints 9–13 continúan como propuestas sujetas a refinamiento y selección; su inclusión en un plan futuro no equivale a un compromiso de Sprint.

El backlog mantiene HU-024 abierta porque todavía no se puede demostrar una ruta accesible respaldada por atributos confirmados. HU-099 tiene prioridad por acordar. Los detalles y estados por historia figuran en el [Product Backlog](../backlog/product-backlog.md).

### 4.3. Historias principales y criterios

Las historias utilizan el formato «Como [rol], quiero [objetivo], para [beneficio]». Sus fichas incluyen criterios de aceptación, reglas y dependencias. El catálogo aplica las tres C —tarjeta, conversación y confirmación— y la revisión INVEST para mejorar su comprensión, refinamiento y comprobabilidad.

Las historias de mayor presencia en los incrementos publicados son:

- **Mapa y búsqueda:** HU-010 y HU-013; filtros y ubicación puntual en HU-012 y HU-011.
- **Cliente web y movilidad:** HU-099 y HU-015; selección de origen/destino y rutas en HU-020, HU-021 y HU-023.
- **Transporte:** HU-022, HU-025, HU-026 y HU-027, con límites explícitos para bicicleta y datos en tiempo real.
- **Accesibilidad y recursos:** HU-024 y HU-040–045, con procedencia y certeza de los atributos.
- **Cuentas e incidencias:** HU-001–006, HU-014, HU-060 y HU-050–053, respaldadas por autorización de API, almacenamiento privado y pruebas locales con datos sintéticos.

Los criterios completos y sus reglas son la fuente de verdad; esta lista resume el alcance sin duplicar las fichas.

### 4.4. Estimación

El Product Backlog utiliza un guion en la columna de puntos cuando no existe un valor vigente registrado. No se trasladan estimaciones de documentos anteriores. La prioridad indica importancia funcional relativa y no establece por sí sola un orden de ejecución ni una fecha.

---

## 5. Arquitectura y diseño del sistema

### 5.1. Estructura del monorepo

El repositorio utiliza npm Workspaces y mantiene estos componentes:

| Ruta                | Responsabilidad y estado                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| apps/mobile/        | Aplicación Expo para Android e iOS y cliente público exportable a web.                                            |
| apps/api/           | API NestJS para salud, identidad, cuentas e incidencias.                                                          |
| packages/contracts/ | Esquemas Zod, tipos compartidos y validación de cobertura aproximada del campus.                                  |
| supabase/           | Configuración reproducible del stack local de Supabase.                                                           |
| apps/admin/         | Aplicación administrativa React/Vite (cola de incidencias y auditoría en rama de Sprint 8; sin catálogo todavía). |

Las migraciones de PostgreSQL se mantienen con Drizzle en apps/api/drizzle/. El cliente y el API comparten los contratos disponibles desde packages/contracts/.

### 5.2. Cliente móvil y web pública

El cliente móvil utiliza Expo, React Native, Expo Router, TypeScript estricto y MapLibre React Native. El mapa nativo requiere código nativo y un development build; Expo Go no es una vía suficiente de validación.

La exportación web comparte el proyecto Expo y emplea React Native Web. En navegador, el mapa utiliza Leaflet/React Leaflet mediante componentes específicos de web; en móvil utiliza MapLibre. El cliente público permite consultar el mapa y buscar sin cuenta ni permiso de ubicación. La consulta puntual de posición es opcional, requiere una acción expresa y mantiene la coordenada en memoria.

Las rutas peatonales se calculan localmente con un grafo de OpenStreetMap y Dijkstra. El punto más cercano solo se conecta dentro del límite documentado; la interfaz identifica distancia y duración como estimaciones y comunica falta de cobertura o conectividad.

### 5.3. API, cuentas e incidencias

La API NestJS ofrece REST y documentación OpenAPI. En los incrementos implementados gestiona salud, Auth, perfil, favoritos y reportes de incidencias. La autorización se comprueba en el servidor a partir de la identidad validada; ocultar controles en la interfaz no concede permisos.

Supabase es la plataforma elegida para PostgreSQL/PostGIS, Auth y Storage. La implementación y las pruebas de los Sprints 6–7 utilizan la instancia local con datos ficticios, y Drizzle conserva esquema y migraciones. No existe una instancia remota configurada para el producto.

En móvil, las sesiones utilizan almacenamiento seguro del sistema a través de Expo SecureStore. En web, la sesión se media mediante un BFF NestJS con cookie segura, controles de origen/CSRF y tokens de renovación protegidos en servidor. Las evidencias de incidencias se validan, normalizan, privan de metadatos EXIF y guardan en un bucket privado; no se sirven como enlaces públicos persistentes.

### 5.4. Datos y cartografía

Los principales conjuntos locales son:

- **Lugares:** catálogo de 20 puntos de referencia derivados de OpenStreetMap, comprobados el 23 de noviembre de 2026 y conservados con fuente, licencia y fecha.
- **Cobertura del campus:** polígono del objeto OSM way 30648317, versión 110 y comprobación del 24 de noviembre de 2026. Es una referencia cartográfica aproximada, no una delimitación oficial.
- **Red peatonal:** extracto OSM con snapshot consultado el 25 de noviembre de 2026, limitado por el polígono de cobertura y publicado bajo ODbL 1.0.
- **Transporte EMT:** snapshot GTFS oficial consultado el 25 de noviembre de 2026, con 25 líneas y 65 paradas del campus, calendario y horarios programados. No incorpora llegadas en tiempo real.

El mapa base usa teselas raster estándar de OpenStreetMap para navegación interactiva de bajo volumen. Se conserva la atribución, no se precargan teselas y el mapa base no ofrece uso offline. El proveedor debe reevaluarse antes de un piloto o publicación.

### 5.5. Toolchain y automatización

La toolchain fijada usa Node.js 26.13.1, npm 11.20.0, TypeScript estricto, ESLint, Prettier y Jest. La integración continua versionada se activa para pull requests contra main y cambios en main; ejecuta formato, lint, typecheck, pruebas, pruebas de API e integración local con Supabase, compatibilidad Expo, exportaciones Android/iOS/web y una comprobación web con Chromium.

Los workflows de CodeQL y Dependency Review y la configuración de Dependabot también están versionados. En la inspección de solo lectura del 26 de noviembre de 2026 se comprobó que `main` tiene protección estricta, requiere pull request y tres checks de CI, no exige aprobaciones, bloquea force-push y borrado, y aplica las reglas a administradores. Auto-merge está habilitado con squash; merge commits y rebase merge están deshabilitados. No hay rulesets. También están habilitados Dependabot security updates, secret scanning y push protection; la detección de patrones no asociados a proveedores está deshabilitada. CodeQL se ejecuta mediante el workflow del repositorio y su check es requerido, aunque GitHub code scanning default setup figura como `not-configured`. El detalle se mantiene en [ADR-0006](../adr/0006-github-governance-and-ci.md); estos valores pueden cambiar y deben volver a verificarse cuando se modifique la configuración.

Las decisiones de arquitectura y configuración aceptadas se encuentran en los [18 ADR del proyecto](../adr/README.md).

---

## 6. Registro de Sprints e incrementos

| Sprint                                                                            | Incremento y estado                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [1 — mapa y búsqueda](../iterations/sprint-01/README.md)                          | Mapa del campus, delimitación, marcadores, atribución y búsqueda local. Se registró validación nativa Android; iOS nativo quedó como excepción aceptada.                                           |
| [2 — ubicación y filtros](../iterations/sprint-02/README.md)                      | Consulta puntual de ubicación en primer plano y filtros de categorías, manteniendo el mapa manual. Android se validó; iOS nativo quedó como excepción aceptada.                                    |
| [3 — web pública, cercanía y rutas peatonales](../iterations/sprint-03/README.md) | Cliente web adaptable, servicios cercanos y rutas sobre el grafo OSM. Se registraron pruebas de Chromium y Android; iOS nativo quedó como excepción aceptada.                                      |
| [4 — EMT y rutas multimodales](../iterations/sprint-04/README.md)                 | GTFS estático de EMT, paradas, horarios y comparación de alternativas directas. No ofrece llegadas en tiempo real ni una ruta ciclista verificada.                                                 |
| [5 — accesibilidad y recursos](../iterations/sprint-05/README.md)                 | Recursos con fuente y estado de certeza, preferencias de sesión y prevención de afirmaciones no verificadas. HU-024 continúa abierta.                                                              |
| [6 — cuentas y favoritos](../iterations/sprint-06/README.md)                      | API, Auth, perfil, favoritos privados y sesiones web seguras, comprobados con Supabase local y cuentas sintéticas. No se habilitó servicio alojado ni SMTP gestionado.                             |
| [7 — incidencias](../iterations/sprint-07/README.md)                              | Envío privado, evidencias protegidas e historial propio; la consulta pública se comprobó con datos sintéticos. No se implementaron el panel de moderación ni la publicación de incidencias reales. |
| [8 — gestión de incidencias y auditoría](../iterations/sprint-08/README.md)       | En curso en rama local: roles, máquina de estados, auditoría, protección de evidencias y `apps/admin`; pendiente UI móvil/web y verificación completa.                                             |
| [9 — avisos y restricciones](../iterations/sprint-09/README.md)                   | Plan propuesto; incluye vigencia, zonas afectadas y ciclo de publicación.                                                                                                                          |
| [10 — administración de catálogo](../iterations/sprint-10/README.md)              | Plan propuesto; incluye gestión de lugares, categorías, accesibilidad y permisos.                                                                                                                  |
| [11 — importación y salud de fuentes](../iterations/sprint-11/README.md)          | Plan propuesto; incluye importación validada, reconciliación y detección de datos caducados.                                                                                                       |
| [12 — preferencias y notificaciones](../iterations/sprint-12/README.md)           | Plan propuesto; requiere refinar historias y aceptar decisiones sobre notificaciones y proveedor.                                                                                                  |
| [13 — resiliencia y preparación de versión](../iterations/sprint-13/README.md)    | Plan propuesto; incluye accesibilidad, regresión, compatibilidad y preparación de versión.                                                                                                         |

Los Sprints 1–7 están incorporados a main mediante [PR #50](https://github.com/ddavid07/UniMovil/pull/50). Los planes 8–13 no son resultados de implementación ni compromisos ya seleccionados. El [índice de Iterations](../iterations/README.md) contiene la vista general y la plantilla compartida.

---

## 7. Validación, conclusiones y trabajo futuro

### 7.1. Evidencia de validación

Los informes de Sprint registran las comprobaciones realizadas en cada incremento. Entre ellas figuran pruebas de dominio, componentes, API e integración con Supabase local, validación de builds, exportaciones de plataformas y recorridos web. La evidencia se consulta en cada [plan y cierre de Sprint](../iterations/README.md); esta memoria no suma resultados de ejecuciones distintas en una cifra única.

La matriz de navegador automatizada cubre Chromium en escritorio (1280 × 800) y ventana estrecha (390 × 844). No equivale a una validación completa de Firefox, Safari, Edge o lectores de pantalla. La ejecución nativa Android se registró en un emulador Android API 36. No se realizaron builds ni pruebas nativas iOS en los Sprints 1–7; sus exportaciones JavaScript no se presentan como sustituto.

Las comprobaciones con autenticación, cuentas, favoritos e incidencias usan Supabase local e identidades sintéticas. Las pruebas no enviaron mensajes a cuentas reales y no existe un entorno de producción configurado.

### 7.2. Límites vigentes

- La validación nativa iOS sigue pendiente de disponer de macOS/Xcode.
- HU-024 sigue abierta hasta poder respaldar una ruta accesible con atributos confirmados.
- La red cartográfica es comunitaria y puede no reflejar aperturas, obras, accesos ni condiciones actuales.
- Los horarios EMT son programados; la aplicación no ofrece información ETA ni incidencias sincronizadas.
- No existe red ciclista verificada para calcular rutas en bicicleta.
- La instancia gestionada Supabase, SMTP, políticas institucionales de privacidad/retención y proceso de moderación no están configurados.
- La aplicación administrativa aún no está implementada. Los informes de prueba y el feed sintético no representan incidencias reales ni una operación institucional.

### 7.3. Conclusiones y siguientes incrementos

Los primeros siete incrementos establecen una base pública de mapa, búsqueda y movilidad y amplían después la experiencia con cuentas e incidencias. La documentación mantiene separados los hechos comprobados, las fuentes externas, las decisiones aceptadas y los planes futuros. El estado detallado de cada historia se conserva en el Product Backlog y no se deduce solo de que exista código.

El trabajo futuro está ordenado en los planes 8–13: moderación y auditoría, avisos del campus, administración de datos, importación y salud de fuentes, preferencias/notificaciones y resiliencia/preparación de versión. Cada plan deberá refinarse y seleccionarse antes de empezar. La memoria se actualizará junto con las historias, decisiones, verificaciones y cambios de alcance que produzcan esos incrementos.
