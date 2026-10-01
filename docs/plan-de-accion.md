# Plan de acción completo de UniMovil

## Propósito

Este documento define el plan de trabajo para transformar UniMovil desde documentación funcional y técnica hasta una aplicación terminada, probada, desplegada y preparada para su publicación. Las fases 1 y 2 establecen el repositorio, el toolchain, los workflows y controles descritos más abajo; las fases siguientes cubren la implementación funcional.

El plan cubre todas las funcionalidades documentadas, las historias de usuario, la aplicación móvil, la API, la base de datos, el panel de administración, las integraciones externas, la seguridad, la calidad, la operación y la publicación. No se plantea un MVP ni una versión reducida: una capacidad solo se considerará terminada cuando esté diseñada, implementada, probada, documentada y validada.

## Índice

1. [Estado de partida y definición de terminado](#1-estado-de-partida-y-definición-de-terminado)
2. [Decisiones que deben cerrarse](#2-decisiones-que-deben-cerrarse)
3. [Orden general de dependencias](#3-orden-general-de-dependencias)
4. [Fase 1: preparar el repositorio](#4-fase-1-preparar-el-repositorio)
5. [Fase 2: calidad y cadena de suministro](#5-fase-2-calidad-y-cadena-de-suministro)
6. [Fase 3: requisitos y trazabilidad](#6-fase-3-requisitos-y-trazabilidad)
7. [Fase 4: dominio y datos](#7-fase-4-dominio-y-datos)
8. [Fase 5: entornos e infraestructura](#8-fase-5-entornos-e-infraestructura)
9. [Fase 6: base de la API](#9-fase-6-base-de-la-api)
10. [Fase 7: identidad y autorización](#10-fase-7-identidad-y-autorización)
11. [Fase 8: administración](#11-fase-8-administración)
12. [Fase 9: lugares, mapa y búsqueda](#12-fase-9-lugares-mapa-y-búsqueda)
13. [Fase 10: accesibilidad y recursos](#13-fase-10-accesibilidad-y-recursos)
14. [Fase 11: mapas, rutas y transporte](#14-fase-11-mapas-rutas-y-transporte)
15. [Fase 12: incidencias y avisos](#15-fase-12-incidencias-y-avisos)
16. [Fase 13: personalización y notificaciones](#16-fase-13-personalización-y-notificaciones)
17. [Fase 14: aplicación móvil](#17-fase-14-aplicación-móvil)
18. [Fase 15: fuentes, auditoría y analíticas](#18-fase-15-fuentes-auditoría-y-analíticas)
19. [Fase 16: seguridad, accesibilidad y resiliencia](#19-fase-16-seguridad-accesibilidad-y-resiliencia)
20. [Fase 17: pruebas completas](#20-fase-17-pruebas-completas)
21. [Fase 18: despliegue y publicación](#21-fase-18-despliegue-y-publicación)
22. [Fase 19: validación final y cierre](#22-fase-19-validación-final-y-cierre)
23. [Criterios de terminado](#23-criterios-de-terminado)

## 1. Estado de partida y definición de terminado

El repositorio ya contiene la base monorepo (`apps/mobile`, `apps/api`, `apps/admin` y `packages/`), documentación, toolchain y workflows iniciales de calidad/seguridad. Todavía no implementa las funcionalidades de producto ni tiene suites de pruebas funcionales; estas se desarrollarán con los requisitos trazables y módulos posteriores.

UniMovil se considerará terminada cuando:

- Todas las funcionalidades del catálogo y todas las historias estén implementadas.
- Todos los criterios de aceptación estén cubiertos por pruebas.
- Android e iOS funcionen en los dispositivos contemplados.
- API, base de datos y panel administrativo estén desplegados y protegidos.
- Las fuentes externas tengan adaptadores, control de errores y trazabilidad.
- Autenticación, autorización, privacidad y auditoría estén operativas.
- La aplicación sea usable con lector de pantalla y texto ampliado.
- CI, seguridad, observabilidad, backups y recuperación estén configurados.
- La documentación describa fielmente la implementación final.
- La aplicación esté preparada para distribución, soporte y mantenimiento.

## 2. Decisiones que deben cerrarse

Estas decisiones deben aprobarse y registrarse mediante ADR antes de implementar las partes que dependan de ellas.

Las decisiones para iniciar la implementación están aprobadas y registradas en ADR-0007 a ADR-0013. Hosting comercial, feeds reales de transporte, retenciones sujetas a aprobación institucional y titularidad de tiendas tienen reglas de tratamiento explícitas; no se inventarán permisos, credenciales ni datos.

## 3. Orden general de dependencias

```text
Decisiones pendientes
        ↓
Repositorio y toolchain
        ↓
CI, seguridad y estándares
        ↓
Requisitos trazables
        ↓
Modelo de dominio y base de datos
        ↓
Entornos e infraestructura
        ↓
API base
        ↓
Identidad y autorización
        ↓
Administración de usuarios y contenidos
        ↓
Lugares, categorías y fuentes
        ↓
Mapa y búsqueda
        ↓
Accesibilidad y recursos
        ↓
Transporte y rutas
        ↓
Incidencias y avisos
        ↓
Favoritos, preferencias e historial
        ↓
Notificaciones
        ↓
Aplicación móvil completa
        ↓
Auditoría, analíticas y operación
        ↓
Pruebas completas
        ↓
Seguridad final y revisión legal
        ↓
Despliegue y publicación
        ↓
Validación final
```

Los contratos, datos, API y administración deben preceder a las pantallas que dependan de ellos. Los módulos móviles pueden desarrollarse en paralelo solo después de estabilizar sus contratos.

## 4. Fase 1: preparar el repositorio

Crear:

```text
apps/
  mobile/
  api/
  admin/
packages/
  contracts/
  config/
  testing/
  ui/             # incorporarlo cuando exista reutilización real entre interfaces
docs/
scripts/
```

Tareas:

- Inicializar `package.json` raíz y npm Workspaces.
- Fijar Node.js mediante `.node-version`.
- Versionar `package-lock.json`.
- Configurar TypeScript compartido con `strict: true`.
- Configurar ESLint y Prettier.
- Definir módulos por dominio y convenciones de código.
- Crear `.env.example` sin secretos.
- Separar configuración local, integración y publicación.
- Crear scripts `format`, `format:check`, `lint`, `typecheck`, `test`, `build` y `ci`.
- Preparar Jest con `jest-expo` y React Native Testing Library para móvil, y Vitest para API, administración y paquetes.
- Documentar la puesta en marcha local.
- Crear plantillas de issues y pull requests.
- Crear `CODEOWNERS`.
- Verificar exclusión de secretos, datos reales, logs y artefactos generados.

Resultado: monorepo reproducible y preparado para desarrollar.

## 5. Fase 2: calidad y cadena de suministro

Configurar GitHub Actions con permisos mínimos, acciones externas fijadas por SHA, límites de ejecución, `concurrency`, `persist-credentials: false` y sin imprimir secretos. CI instalará con `npm ci` y ejecutará formato, lint, tipos, tests, build y auditoría de dependencias. La cobertura se incorporará al exigir suites con cobertura útil; no se inventará un porcentaje sin una línea base de pruebas.

Controles automatizados: Dependabot para npm y Actions; `npm audit` con umbral bloqueante alto/crítico; verificación de firmas del registro npm; inventario bloqueante de licencias nuevas/no revisadas; OSV-Scanner; Gitleaks; reglas de seguridad ESLint; e informes de seguridad como artefactos cuando aplique. El lockfile actual conserva dos alertas OSV heredadas ([decode-uri-component](https://osv.dev/GHSA-vcc3-ghjq-m6fr) y [uuid](https://osv.dev/GHSA-w5hq-g745-h8pq), esta última CVSS 7.5); no se silencian y deben revisarse en una actualización compatible del SDK.

Dependency Review, CodeQL hospedado, secret scanning/push protection nativos y protección de `main` son controles deseados, pero el repo actual es privado en GitHub Free y ese plan no permite activarlos aquí. No se cambiará visibilidad ni se asumirá gasto sin autorización. La limitación y alternativa están registradas en ADR-0013. Si se habilita un plan compatible o se hace público tras revisar exposición, se activarán y se exigirán los checks.

La política de pull requests, revisión, squash merge y prohibición de force push/borrado sigue siendo la norma del equipo; su enforcement remoto depende de que GitHub lo permita en el plan elegido.

## 6. Fase 3: requisitos y trazabilidad

Crear una matriz que relacione:

```text
Funcionalidad → Historia de usuario → Caso de uso → Contrato/API
             → Modelo de datos → Pantalla → Pruebas → Documentación
```

La matriz debe cubrir HU-001 a HU-098 y todas las secciones de `fundamentos/funcionalidades.md`.

Para cada historia registrar casos positivos, negativos y límite; roles; permisos; estados de carga, error y ausencia de datos; accesibilidad; dependencias externas; datos necesarios y evidencia de validación. No se cerrará una historia si solo funciona su camino principal.

## 7. Fase 4: dominio y datos

Diseñar el modelo para:

- Usuarios, perfiles, roles, permisos y sesiones.
- Lugares, edificios, entradas, categorías y puntos de interés.
- Coordenadas, geometrías, zonas y restricciones.
- Rampas, ascensores, accesos, obstáculos y revisiones.
- Operadores, líneas, paradas, recorridos, horarios y días de servicio.
- Aparcamientos, aparcabicis, puntos de carga y mantenimiento.
- Incidencias, evidencias, estados, comentarios e historial.
- Avisos, vigencia, prioridades y zonas afectadas.
- Favoritos, rutas guardadas, búsquedas y preferencias.
- Notificaciones y dispositivos.
- Fuentes, importaciones y errores.
- Auditoría, versiones y estadísticas agregadas.

Definir claves, relaciones, unicidad, estados y transiciones, desactivación lógica, versionado, fechas de publicación y caducidad, procedencia, nivel de confianza, datos oficiales o provisionales, sistema de referencia espacial, índices PostGIS y política de anonimización.

Crear migraciones versionadas y fixtures ficticios reproducibles.

## 8. Fase 5: entornos e infraestructura

Preparar los entornos local, integración y publicación. Para cada uno definir proyecto de Supabase, PostgreSQL/PostGIS, migraciones, variables de entorno, claves de proveedores, Storage, URLs, autenticación, notificaciones, CORS, logs, cuotas, backups, datos de prueba y restauración.

No se compartirán secretos entre entornos. Crear scripts para inicializar, reconstruir y limpiar entornos sin datos reales.

## 9. Fase 6: base de la API

Crear módulos NestJS para:

```text
identity, users, roles, places, categories, geometries, routes,
transport, accessibility, incidents, notices, favorites, preferences,
notifications, administration, sources, imports, audit, analytics, health
```

Implementar primero configuración validada, logger estructurado, errores uniformes, DTOs, validación, serialización, guards, permisos, paginación, filtros, ordenación, respuestas consistentes, correlation IDs, health checks, OpenAPI, versionado, transacciones, límites y adaptadores externos.

Crear contratos compartidos en `packages/contracts` y generar clientes desde OpenAPI cuando resulte práctico.

## 10. Fase 7: identidad y autorización

Cubrir HU-001 a HU-007 y HU-090 a HU-093:

- Consulta pública sin autenticación.
- Registro, inicio y cierre de sesión.
- Recuperación, cambio de contraseña, caducidad y revocación.
- Edición, consulta, desactivación y eliminación de cuenta.
- Gestión de permisos de ubicación y notificaciones.
- Roles público, usuario registrado, gestor y administrador.

La autorización se valida siempre en backend. El tipo de relación con la UCM no concede privilegios. Los errores no deben revelar si un correo existe. Las respuestas no pueden filtrar datos privados y las contraseñas nunca se almacenan en texto plano.

## 11. Fase 8: administración

### Usuarios y roles

Implementar búsqueda, activación, bloqueo, desactivación, asignación y retirada de roles, protección del último administrador y auditoría de cada acción.

### Panel administrativo

Crear `apps/admin` con inicio de sesión, control por rol, dashboard, gestión de lugares, categorías, entradas, accesibilidad, líneas, paradas, horarios, aparcamientos, recursos, incidencias, avisos, fuentes, importaciones, auditoría, estadísticas, exportaciones, fotografías e historial.

Cada operación debe validar datos, mostrar procedencia y fecha, conservar historial, soportar publicación o desactivación y evitar eliminaciones accidentales.

## 12. Fase 9: lugares, mapa y búsqueda

Implementar facultades, escuelas, edificios, centros, entradas, servicios, puntos de interés, categorías, zonas, horarios, contactos, enlaces, fotografías, estado de publicación, fuente y actualización.

Implementar mapa interactivo con zoom, desplazamiento, capas, filtros, leyenda, marcadores, selección, fichas, ubicación actual con consentimiento, centrado, cierres y restricciones.

Implementar búsqueda por nombre, categoría, alias y texto; sugerencias; orden por relevancia o distancia; servicios cercanos; recursos cercanos; estados vacíos; errores; datos desactualizados y enlaces compartibles.

Usar MapLibre como renderizador, configuración externa para MapTiler y las atribuciones requeridas.

## 13. Fase 10: accesibilidad y recursos

Crear modelo y administración para rampas, ascensores, entradas adaptadas, aseos, pendientes, superficies, obstáculos, accesos fuera de servicio, paradas y vehículos accesibles, plazas reservadas, aparcabicis, puntos de carga, reparación, zonas autorizadas y fechas de revisión.

Reglas:

- Lo desconocido no se presenta como accesible.
- Los datos oficiales se distinguen de los no confirmados.
- Las restricciones temporales afectan a consultas y rutas.
- Las preferencias de accesibilidad son privadas.
- La información debe poder consultarse sin depender exclusivamente del mapa.

## 14. Fase 11: mapas, rutas y transporte

Crear adaptadores aislados para MapTiler, openrouteservice, OpenStreetMap y futuros proveedores. El backend ocultará claves, controlará cuotas, aplicará caché, normalizará errores, validará respuestas y conservará fuente y fecha.

Implementar rutas a pie, bicicleta, autobús, combinadas, accesibles, rápidas, con menos transbordos y alternativas, con distancia, duración, indicaciones paso a paso, cambios de medio y restricciones activas.

Implementar operadores, líneas, paradas, recorridos, secuencia de paradas, horarios, días lectivos, fines de semana, festivos, accesibilidad, retrasos, cancelaciones, tiempo real autorizado, último estado conocido y estado desactualizado.

La aplicación no inventará datos cuando el operador no proporcione información fiable.

## 15. Fase 12: incidencias y avisos

### Incidencias

Implementar creación, categorías, ubicación, descripción, prioridad percibida, fotografías, validación, confirmación, revisión, clasificación, asignación, solicitud de información, duplicados, descarte razonado y estados recibida, en revisión, en proceso, resuelta y cerrada.

Permitir respuestas visibles, comentarios internos, historial, confirmaciones de usuarios y reapertura. Las imágenes se validarán, limpiarán de metadatos innecesarios, almacenarán de forma privada, moderarán y servirán mediante acceso controlado.

### Avisos

Implementar avisos generales, cierres, obras, desvíos, cambios de horario, interrupciones, restricciones y alertas de movilidad. Cada aviso tendrá título, descripción, categoría, prioridad, recurso o zona, vigencia, autor, fuente, estado e historial.

Permitir borradores, programación, publicación, retirada, caducidad, guardado, compartición, asociación al mapa y relación con rutas afectadas.

## 16. Fase 13: personalización y notificaciones

Implementar favoritos de lugares, líneas, paradas, aparcamientos y recursos; rutas y búsquedas recientes; rutas guardadas; preferencias de transporte, accesibilidad, rapidez y transbordos; idioma, unidades, privacidad y sincronización entre dispositivos.

Crear registro de dispositivos, tokens protegidos, categorías, horarios de silencio, avisos de favoritos, cambios de incidencias, líneas, paradas y rutas, historial interno, deep links, deduplicación, reintentos y gestión de permisos revocados.

Los avisos deben permanecer dentro de la aplicación aunque el dispositivo no permita notificaciones.

## 17. Fase 14: aplicación móvil

Crear módulos para inicio, mapa, búsqueda, fichas, rutas, transporte, accesibilidad, incidencias, avisos, favoritos, historial, notificaciones, perfil, configuración, ayuda, privacidad y soporte.

Cada pantalla debe contemplar carga, éxito, error, ausencia de resultados, falta de conexión, datos desactualizados, permisos denegados, sesión caducada, estado vacío, reintento y navegación coherente.

La aplicación no almacenará secretos ni decidirá permisos por sí sola. Las operaciones protegidas pasarán por la API.

## 18. Fase 15: fuentes, auditoría y analíticas

Crear un sistema de fuentes con identificador, tipo, formato, acceso, frecuencia, fechas de consulta y actualización, estado, validación, errores, registros procesados y rechazados e historial de importaciones.

Las importaciones validarán antes de aplicar, no borrarán datos válidos por errores parciales, conservarán procedencia, marcarán obsolescencia y permitirán reintentos.

Implementar estadísticas agregadas de usuarios, búsquedas, lugares, rutas, medios, transporte, incidencias, avisos y errores. No deben identificar personas.

Registrar auditoría con autor, fecha, acción, entidad, valores relevantes y versión publicada, sin secretos, contraseñas ni tokens.

## 19. Fase 16: seguridad, accesibilidad y resiliencia

### Seguridad

Revisar autenticación, autorización, validación, rate limiting, subida de imágenes, URLs privadas, CORS, cabeceras, sesiones, logs, secretos, permisos de Supabase y acceso cruzado entre usuarios.

### Accesibilidad

Validar etiquetas, orden de lectura, TalkBack, VoiceOver, texto ampliado, contraste, uso del color, controles táctiles, mensajes, mapas con alternativa textual y rutas con instrucciones comprensibles.

### Resiliencia y operación

Probar conexión inestable, API lenta, proveedores caídos, datos desactualizados, importaciones parciales y cuotas agotadas. Crear logs estructurados, métricas, health checks, alertas y monitorización de API, fuentes, importaciones, notificaciones y errores de cliente.

Definir rollback, restauración, rotación de secretos, respuesta a incidentes y enmascarado de datos sensibles en logs.

## 20. Fase 17: pruebas completas

### Unitarias

Reglas de negocio, estados, validadores, permisos, distancias, preferencias, importaciones y deduplicación.

### Integración

API, base de datos, PostGIS, migraciones, autenticación, Storage, adaptadores, importaciones, auditoría y notificaciones.

### Contratos

OpenAPI, DTOs, respuestas, errores y compatibilidad entre API, móvil y administración.

### Componentes

Formularios, mapa, filtros, fichas, rutas, incidencias, avisos, favoritos y configuración.

### End-to-end

Consulta pública, registro, inicio de sesión, recuperación, incidencias, avisos, rutas, accesibilidad, transporte, favoritos, notificaciones, administración, importaciones y eliminación de cuenta.

### No funcionales

Accesibilidad, rendimiento, seguridad, privacidad, conectividad inestable, fuentes caídas, datos desactualizados, migraciones, restauración, Android, iOS, tamaños de pantalla y cuotas externas.

## 21. Fase 18: despliegue y publicación

### Backend

Configurar build, migraciones controladas, variables de entorno, health checks, rollback, backups, HTTPS, CORS, límites, cuotas y monitorización.

### Panel web

Configurar build reproducible, variables por entorno, control de acceso y despliegue seguro.

### Aplicación móvil

Configurar identificadores, firma Android/iOS, iconos, splash screen, permisos, mapas, notificaciones, deep links, política de privacidad, fichas de tiendas, capturas, notas de versión, dispositivos reales y canales de prueba.

## 22. Fase 19: validación final y cierre

Revisar contra toda la documentación el catálogo funcional, historias, criterios, roles, errores, estados vacíos, privacidad, accesibilidad, integraciones, pantallas, endpoints, migraciones, pruebas y documentación.

La matriz de trazabilidad debe marcar cada elemento como:

```text
Diseñado → Implementado → Probado → Documentado → Validado
```

Actualizar ADR, README, instalación, configuración, despliegue, operación, privacidad, soporte y notas de publicación.

## 23. Criterios de terminado

El proyecto solo podrá declararse terminado cuando:

- No queden historias ni criterios de aceptación sin validar.
- No existan secretos ni datos reales en el repositorio.
- CI sea reproducible y obligatoria.
- Las migraciones funcionen desde una base vacía.
- Los roles estén verificados en servidor.
- Las fuentes externas tengan control de errores.
- Los datos indiquen procedencia y actualización.
- Las fotografías estén protegidas.
- La ubicación no se almacene continuamente por defecto.
- Mapas y rutas tengan alternativa textual.
- Android e iOS hayan sido probados.
- El panel cubra el mantenimiento completo del producto.
- Existan backups y restauración.
- Existan logs, métricas y alertas suficientes.
- Privacidad, condiciones, licencia y atribuciones estén revisadas.
- La aplicación esté preparada para distribución y soporte.
- La documentación describa fielmente el estado final.
