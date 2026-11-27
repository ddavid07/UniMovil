# Matriz de trazabilidad (HU ↔ Criterios ↔ Pruebas)

Esta matriz relaciona las **69 historias de usuario** y sus **354 criterios de aceptación (`HU-XXX.n`)** con los ADR aplicables, el Sprint correspondiente y las pruebas existentes en el repositorio. No agrupa resultados de distintos corredores en una sola cifra: cada capa de verificación se identifica con su script o suite real.

## 1. Capas de verificación del repositorio

| Capa / Script                 | Ubicación real                        | Alcance cubierto                                                                                                |
| ----------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Jest (`npm run test:ci`)**  | `apps/mobile/src/**/*.test.{ts,tsx}`  | 19 suites (64 pruebas) de dominio, catálogo, filtrado, rutas, GTFS, mapa, accesibilidad y pantalla principal.   |
| **API (`npm run api:test`)**     | `apps/api/test/*.spec.ts`             | 5 archivos (`auth.guard`, `roles.guard`, `contracts`, `incidents.service`, `incident-management`) — las nuevas suites requieren ejecución con Node `26.13.1`. |
| **Admin (`npm run admin:test`)** | `apps/admin/test/*.spec.ts`           | Pruebas unitarias de dominio y cliente BFF de `apps/admin` — pendientes de actualización de lockfile y ejecución con Node `26.13.1`.                             |
| **Supabase local**               | `scripts/test-local-supabase.mjs`     | Comprobaciones e2e contra API + Auth + Postgres/PostGIS + Storage privado + BFF/CSRF + roles/gestión/auditoría — pendientes de ejecución con Docker y Node `26.13.1`. |
| **Smoke Web Chromium**        | `scripts/test-web.mjs`                | Recorrido automatizado sobre `apps/mobile/dist` en `1280 × 800` y `390 × 844` (mapa, búsqueda, ruta y bus 44).  |
| **Validación nativa Android** | Emulador Android API 36 (Sprints 1–7) | Comprobación manual documentada en `docs/iterations/sprint-01..07/README.md` (sin validación nativa iOS local). |

## 2. Resumen de cobertura del catálogo

| Estado en el repositorio                   | N.º de historias | Historias incluidas                                                                                                                          |
| ------------------------------------------ | :--------------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Implementada y publicada (Sprints 1–7)** |        34        | `HU-001`–`006`, `HU-010`–`015`, `HU-020`–`023`, `HU-025`–`027`, `HU-040`–`045`, `HU-050`–`053`, `HU-060`, `HU-090`–`091`, `HU-093`, `HU-099` |
| **Corte implementado, historia abierta**   |        2         | `HU-024` (corte seguro sin ruta accesible confirmada), `HU-092` (aviso y permisos sin preferencias persistentes)                             |
| **Propuesta para Sprints 8–13**            |        30        | Sprint 8 refinado por Product Owner, pendiente de selección; Sprints 9–13 pendientes de refinamiento y selección                             |
| **Fuera del horizonte actual**             |        3         | `HU-028`, `HU-078`, `HU-079`                                                                                                                 |
| **Total del Product Backlog**              |      **69**      | **354 criterios `HU-XXX.n`**                                                                                                                 |

---

## 3. Trazabilidad por área funcional

### Área 01 · Acceso y cuentas (`HU-001`–`HU-007`) y Área 09 · Cliente público web (`HU-099`)

| HU     | Criterios     | Sprint | ADR                | Pruebas y evidencias vinculadas                                                                                                               | Estado real                             |
| ------ | ------------- | :----: | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| HU-001 | `HU-001.1..4` |  1, 6  | ADR-0001, ADR-0015 | `CampusScreen.test.tsx`; `scripts/test-local-supabase.mjs` (`public incident projection and anonymous access`); `scripts/test-web.mjs`        | Implementada (Sprints 1 y 6)            |
| HU-002 | `HU-002.1..5` |   6    | ADR-0014, ADR-0015 | `scripts/test-local-supabase.mjs` (`registration requires email confirmation before account access`); validación Android 36                   | Implementada localmente (Supabase)      |
| HU-003 | `HU-003.1..5` |   6    | ADR-0015           | `apps/api/test/auth.guard.spec.ts` (3 pruebas); `scripts/test-local-supabase.mjs` (BFF/CSRF); validación Android 36 y Chromium                | Implementada localmente (Supabase)      |
| HU-004 | `HU-004.1..5` |   6    | ADR-0014, ADR-0015 | `scripts/test-local-supabase.mjs` (`password recovery response does not reveal account existence`, `password recovery through Supabase Auth`) | Implementada localmente (sin SMTP real) |
| HU-005 | `HU-005.1..5` |   6    | ADR-0015           | `apps/api/test/contracts.spec.ts` (`profile updates`); `scripts/test-local-supabase.mjs` (`account profile and ownership`)                    | Implementada localmente (Supabase)      |
| HU-006 | `HU-006.1..5` |   6    | ADR-0015, ADR-0016 | `scripts/test-local-supabase.mjs` (`account deletion cascades private records and evidence`)                                                  | Implementada localmente (Supabase)      |
| HU-007 | `HU-007.1..5` |   12   | ADR-0009           | Pendiente de unificación para ubicación y notificaciones (Sprint 12); ubicación base cubierta en `location.test.ts`                           | Propuesta Sprint 12                     |
| HU-099 | `HU-099.1..7` |   3    | ADR-0010, ADR-0011 | `scripts/test-web.mjs` (`1280 × 800` y `390 × 844`); `npm run export:web`                                                                     | Implementada localmente (Chromium)      |

### Área 02 · Mapa, búsqueda y lugares (`HU-010`–`HU-017`)

| HU     | Criterios     | Sprint | ADR                  | Pruebas y evidencias vinculadas                                                                                                           | Estado real                         |
| ------ | ------------- | :----: | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| HU-010 | `HU-010.1..5` |   1    | ADR-0004, 0007, 0008 | `campus-boundary.test.ts` (2), `map-style.test.ts` (1), `MapAttribution.test.tsx` (2), `CampusMap.test.tsx` (4), `repository.test.ts` (1) | Implementada (Android + Web)        |
| HU-011 | `HU-011.1..7` |   2    | ADR-0009             | `domain/location.test.ts` (6 pruebas); `CampusScreen.test.tsx` (4 pruebas de permiso previo, denegación, reintento y Ajustes)             | Implementada (excepción nativa iOS) |
| HU-012 | `HU-012.1..7` |   2    | ADR-0004             | `domain/places-filter.test.ts` (4), `CampusMap.test.tsx`, `CampusScreen.test.tsx` (3 pruebas de filtros, vacío y reactivación)            | Implementada (Android + Web)        |
| HU-013 | `HU-013.1..5` |   1    | ADR-0004             | `domain/places.test.ts` (6), `PlaceSearch.test.tsx` (3), `PlaceResults.test.tsx` (2), `CampusScreen.test.tsx`, `scripts/test-web.mjs`     | Implementada (Android + Web)        |
| HU-014 | `HU-014.1..6` |   6    | ADR-0002, ADR-0015   | `apps/api/test/contracts.spec.ts` (`catalog resource types`), `scripts/test-local-supabase.mjs`, `CampusScreen.test.tsx`                  | Implementada localmente             |
| HU-015 | `HU-015.1..5` |   3    | ADR-0012             | `domain/nearby.test.ts` (2 pruebas), `components/NearbyPlaces.test.tsx` (1 prueba)                                                        | Implementada (distancias estimadas) |
| HU-016 | `HU-016.1..5` |   9    | ADR-0004             | Pendiente (Sprint 9)                                                                                                                      | Propuesta Sprint 9                  |
| HU-017 | `HU-017.1..4` |   12   | ADR-0001, ADR-0010   | Pendiente (Sprint 12)                                                                                                                     | Propuesta Sprint 12                 |

### Área 03 · Rutas y transporte (`HU-020`–`HU-029`)

| HU     | Criterios     | Sprint | ADR                | Pruebas y evidencias vinculadas                                                                                                 | Estado real                          |
| ------ | ------------- | :----: | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| HU-020 | `HU-020.1..5` |   3    | ADR-0012           | `domain/routing.test.ts` (`rejects coordinates too far from the mapped network`), `scripts/test-web.mjs`                        | Implementada                         |
| HU-021 | `HU-021.1..5` |   3    | ADR-0012           | `domain/routing.test.ts` (5 pruebas), `scripts/test-web.mjs` (`Ruta a pie estimada`)                                            | Implementada                         |
| HU-022 | `HU-022.1..5` |   4    | ADR-0012, ADR-0013 | `domain/transit.test.ts` (`direct scheduled bus route`), `components/RoutePlanner.test.tsx` (1 prueba); bicicleta no ofrecida   | Implementada (sin cálculo bicicleta) |
| HU-023 | `HU-023.1..5` |   3    | ADR-0012           | `domain/routing.test.ts` (`creates ordered instructions`), `components/RoutePlanner.test.tsx`                                   | Implementada                         |
| HU-024 | `HU-024.1..6` |   5    | ADR-0017           | `domain/mobility.test.ts` (`does not offer an accessible route when any critical evidence is unknown or affected`)              | **Corte seguro (historia abierta)**  |
| HU-025 | `HU-025.1..5` |   4    | ADR-0012, ADR-0013 | `domain/transit.test.ts`, `components/RoutePlanner.test.tsx`                                                                    | Implementada con datos disponibles   |
| HU-026 | `HU-026.1..5` |   4    | ADR-0013           | `domain/transit.test.ts` (7 pruebas GTFS), `components/TransitPanel.test.tsx` (1), `scripts/test-web.mjs` (`Línea 44:`)         | Implementada (GTFS estático EMT)     |
| HU-027 | `HU-027.1..5` |   4    | ADR-0013           | `domain/transit.test.ts` (`lines serving a stop`, `next scheduled departures`), `CampusScreen.test.tsx`, `scripts/test-web.mjs` | Implementada (enlace avisos EMT)     |
| HU-028 | `HU-028.1..4` |   —    | ADR-0013           | Sin implementación (requiere fuente autorizada en tiempo real)                                                                  | Fuera del horizonte actual           |
| HU-029 | `HU-029.1..5` |   12   | ADR-0015           | Pendiente (Sprint 12)                                                                                                           | Propuesta Sprint 12                  |

### Área 04 · Accesibilidad y recursos de movilidad (`HU-040`–`HU-045`)

| HU     | Criterios     | Sprint | ADR      | Pruebas y evidencias vinculadas                                                                                    | Estado real                                    |
| ------ | ------------- | :----: | -------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| HU-040 | `HU-040.1..5` |   5    | ADR-0017 | `domain/mobility.test.ts` (`does not offer an accessible route when any critical evidence is unknown or affected`) | Implementada (preferencias en sesión)          |
| HU-041 | `HU-041.1..5` |   5    | ADR-0017 | `domain/mobility.test.ts` (`keeps mapped resources unknown and preserves their source metadata`)                   | Implementada (datos sin revisar = desconocido) |
| HU-042 | `HU-042.1..5` |   5    | ADR-0017 | `domain/mobility.test.ts`, `domain/places-filter.test.ts`                                                          | Implementada (disponibilidad desconocida)      |
| HU-043 | `HU-043.1..5` |   5    | ADR-0017 | `domain/mobility.test.ts`, `domain/places-filter.test.ts`                                                          | Implementada (sin afirmar autorización)        |
| HU-044 | `HU-044.1..5` |   5    | ADR-0017 | `domain/mobility.test.ts`                                                                                          | Implementada (sin estado tiempo real)          |
| HU-045 | `HU-045.1..4` |   5    | ADR-0017 | `domain/mobility.test.ts` (`sorts resources by approximate distance from an explicitly chosen origin`)             | Implementada                                   |

### Área 05 · Incidencias y comunicaciones (`HU-050`–`HU-059`)

| HU     | Criterios     | Sprint | ADR                                    | Pruebas y evidencias vinculadas                                                                                                                          | Estado real                               |
| ------ | ------------- | :----: | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| HU-050 | `HU-050.1..5` |   7    | ADR-0016, ADR-0018                     | `apps/api/test/contracts.spec.ts`, `apps/api/test/incidents.service.spec.ts`, `scripts/test-local-supabase.mjs`                                          | Implementada localmente (privada)         |
| HU-051 | `HU-051.1..5` |   7    | ADR-0016                               | `apps/api/test/incidents.service.spec.ts` (5 pruebas MIME/WebP/EXIF/tamaño), `scripts/test-local-supabase.mjs` (`bucket is private`)                     | Implementada localmente (Storage privado) |
| HU-052 | `HU-052.1..5` |   7    | ADR-0015, ADR-0018                     | `apps/api/test/auth.guard.spec.ts`, `scripts/test-local-supabase.mjs` (aislamiento entre cuentas), recorrido Chromium y Android 36                       | Implementada localmente                   |
| HU-053 | `HU-053.1..5` |   7    | ADR-0018                               | `apps/mobile/src/features/incidents/domain/incident-zone.test.ts` (3 pruebas de radio), `scripts/test-local-supabase.mjs` (`public incident projection`) | Implementada con fixture sintético        |
| HU-054 | `HU-054.1..8` |   8    | ADR-0002, ADR-0015, ADR-0016, ADR-0018 | `apps/api/test/incident-management.spec.ts`, `apps/admin/test/incident-admin.spec.ts`, `scripts/test-local-supabase.mjs` (pendientes de ejecución local) | Corte API + `apps/admin` en rama; verificación pendiente |
| HU-055 | `HU-055.1..7` |   8    | ADR-0015, ADR-0018                     | `apps/api/test/incident-management.spec.ts`, `apps/admin/test/incident-admin.spec.ts`, `scripts/test-local-supabase.mjs` (pendiente UI cliente público)  | Corte API + `apps/admin` en rama; pendiente móvil/web    |
| HU-056 | `HU-056.1..6` |   8    | ADR-0015, ADR-0018                     | Persistencia API (`incidents.service.ts`), agregado en `incident-management.service.ts`, `scripts/test-local-supabase.mjs` (pendiente UI cliente público) | Corte servidor + agregado admin; pendiente móvil/web     |
| HU-057 | `HU-057.1..5` |   9    | ADR-0002, ADR-0010                     | Pendiente (Sprint 9)                                                                                                                                     | Propuesta Sprint 9                        |
| HU-058 | `HU-058.1..5` |   9    | ADR-0010                               | Pendiente (Sprint 9)                                                                                                                                     | Propuesta Sprint 9                        |
| HU-059 | `HU-059.1..5` |   9    | ADR-0002                               | Pendiente (Sprint 9)                                                                                                                                     | Propuesta Sprint 9                        |

### Área 06 · Personalización y notificaciones (`HU-060`–`HU-066`)

| HU     | Criterios     | Sprint | ADR                | Pruebas y evidencias vinculadas                                                                                                                    | Estado real             |
| ------ | ------------- | :----: | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| HU-060 | `HU-060.1..5` |   6    | ADR-0015           | `apps/api/test/contracts.spec.ts` (`favorite identifiers`), `scripts/test-local-supabase.mjs` (`favorite persistence and cross-account isolation`) | Implementada localmente |
| HU-061 | `HU-061.1..5` |   12   | ADR-0015           | Pendiente (Sprint 12)                                                                                                                              | Propuesta Sprint 12     |
| HU-062 | `HU-062.1..5` |   12   | ADR-0015           | Pendiente (Sprint 12)                                                                                                                              | Propuesta Sprint 12     |
| HU-063 | `HU-063.1..5` |   12   | ADR-0009, ADR-0014 | Pendiente (Sprint 12)                                                                                                                              | Propuesta Sprint 12     |
| HU-064 | `HU-064.1..5` |   12   | ADR-0010, ADR-0014 | Pendiente (Sprint 12)                                                                                                                              | Propuesta Sprint 12     |
| HU-065 | `HU-065.1..4` |   12   | ADR-0005           | Pendiente (Sprint 12)                                                                                                                              | Propuesta Sprint 12     |
| HU-066 | `HU-066.1..4` |   12   | ADR-0010, ADR-0012 | Pendiente (Sprint 12)                                                                                                                              | Propuesta Sprint 12     |

### Área 07 · Administración y datos (`HU-070`–`HU-080`)

| HU     | Criterios     | Sprint | ADR                          | Pruebas y evidencias vinculadas                                                              | Estado real                             |
| ------ | ------------- | :----: | ---------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| HU-070 | `HU-070.1..5` |   10   | ADR-0002, ADR-0003           | Pendiente (`apps/admin` no implementada aún; Sprint 10)                                      | Propuesta Sprint 10                     |
| HU-071 | `HU-071.1..5` |   10   | ADR-0002, ADR-0003           | Pendiente (Sprint 10)                                                                        | Propuesta Sprint 10                     |
| HU-072 | `HU-072.1..5` |   11   | ADR-0013                     | Pendiente (Sprint 11)                                                                        | Propuesta Sprint 11                     |
| HU-073 | `HU-073.1..5` |   10   | ADR-0017                     | Pendiente (Sprint 10)                                                                        | Propuesta Sprint 10                     |
| HU-074 | `HU-074.1..5` |   11   | ADR-0004, ADR-0013           | Pendiente (Sprint 11; scripts manuales de importación en `scripts/`)                         | Propuesta Sprint 11                     |
| HU-075 | `HU-075.1..5` | 10, 11 | ADR-0004, ADR-0013           | Pendiente (Sprints 10–11; metadatos base documentados en `docs/development/data-sources.md`) | Propuesta Sprints 10–11                 |
| HU-076 | `HU-076.1..5` |   10   | ADR-0015                     | Pendiente (Sprint 10)                                                                        | Propuesta Sprint 10                     |
| HU-077 | `HU-077.1..7` |   8    | ADR-0002, ADR-0015, ADR-0018 | `apps/api/test/incident-management.spec.ts`, `apps/api/test/roles.guard.spec.ts`, `apps/admin/test/incident-admin.spec.ts`, `scripts/test-local-supabase.mjs` | Corte API + `apps/admin` en rama; verificación pendiente |
| HU-078 | `HU-078.1..5` |   —    | ADR-0014                     | Sin implementación (finalidad y privacidad pendientes)                                       | Fuera del horizonte actual              |
| HU-079 | `HU-079.1..5` |   —    | ADR-0002                     | Sin implementación (formatos y privacidad pendientes)                                        | Fuera del horizonte actual              |
| HU-080 | `HU-080.1..5` |   11   | ADR-0004, ADR-0013           | Pendiente (Sprint 11)                                                                        | Propuesta Sprint 11                     |

### Área 08 · Seguridad, privacidad y calidad (`HU-090`–`HU-098`)

| HU     | Criterios     |  Sprint  | ADR                          | Pruebas y evidencias vinculadas                                                                                                                   | Estado real                               |
| ------ | ------------- | :------: | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| HU-090 | `HU-090.1..5` |    6     | ADR-0014, 0015, 0016         | `apps/api/test/auth.guard.spec.ts`, `scripts/test-local-supabase.mjs` (sesión BFF, CSRF, aislamiento y borrado); `.github/workflows/codeql.yml`   | Implementada localmente                   |
| HU-091 | `HU-091.1..5` | 6, 8, 10 | ADR-0015, ADR-0018           | `apps/api/test/auth.guard.spec.ts`, `apps/api/test/roles.guard.spec.ts`, `scripts/test-local-supabase.mjs` (ampliación roles gestor/admin en rama Sprint 8) | Implementada usuario; roles gestión en rama |
| HU-092 | `HU-092.1..5` |  6, 12   | ADR-0009, ADR-0015           | `CampusScreen.test.tsx` (flujo previo de permiso), `domain/location.test.ts` (6), `scripts/test-local-supabase.mjs`                               | **Corte implementado (historia abierta)** |
| HU-093 | `HU-093.1..4` |    6     | ADR-0015                     | `scripts/test-local-supabase.mjs` (`account profile and ownership`), validación Android 36                                                        | Implementada localmente                   |
| HU-094 | `HU-094.1..5` |    13    | ADR-0005                     | Estados parciales cubiertos en `CampusScreen.test.tsx` y `domain/location.test.ts`; cierre transversal en Sprint 13                               | Propuesta Sprint 13                       |
| HU-095 | `HU-095.1..5` |    13    | ADR-0011                     | Controles base en `PlaceResults.test.tsx`, `MapAttribution.test.tsx`, `CampusMap.test.tsx` y `scripts/test-web.mjs`; auditoría integral Sprint 13 | Propuesta Sprint 13                       |
| HU-096 | `HU-096.1..5` |    13    | ADR-0001                     | Pendiente (Sprint 13)                                                                                                                             | Propuesta Sprint 13                       |
| HU-097 | `HU-097.1..6` |    8     | ADR-0015, ADR-0016, ADR-0018 | `apps/api/test/incident-management.spec.ts`, `apps/api/test/roles.guard.spec.ts`, `scripts/test-local-supabase.mjs` (solo dominio incidencias) | Corte incidencias en rama; verificación pendiente |
| HU-098 | `HU-098.1..4` |    13    | ADR-0001                     | Pendiente (Sprint 13)                                                                                                                             | Propuesta Sprint 13                       |

---

## 4. Criterios de mantenimiento

- Al incorporar o modificar un incremento (desde Sprint 8 en adelante), actualizar en la misma PR los archivos de test añadidos y el estado de la fila `HU-XXX` correspondiente.
- No sumar contadores de suites distintas (`test:ci`, `api:test`, `test:local-supabase`, `test:web`) como una métrica única agregada.
- Mantener explícitas las excepciones aceptadas (validación nativa iOS sin macOS/Xcode, `HU-024` sin ruta accesible certificada, ausencia de servicio gestionado/SMTP en entorno local).
