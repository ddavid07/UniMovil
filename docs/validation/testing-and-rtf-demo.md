# Resumen de pruebas y guía de demo para Revisión Técnica Formal (RTF)

Este documento resume cómo comprobar de forma reproducible el incremento actual de UniMovil (Sprints 1–8) y qué recorrido seguir durante una Revisión Técnica Formal o defensa académica, manteniendo separados los resultados verificados de los límites y excepciones aceptadas.

## 1. Requisitos de entorno

- **Toolchain fijada:** Node.js `26.13.1` (`.node-version`) y npm `11.20.0` (`package.json`).
- **Opcional según lo que se demuestre:**
  - Android Studio / Android SDK para el development build nativo (MapLibre requiere build nativo; Expo Go no sirve como validación).
  - Stack local de Supabase (Docker, Podman o runtime local) para cuentas, favoritos, incidencias privadas/públicas e integración completa.
  - Chromium de Playwright (`npx playwright install chromium`) para la comprobación web automatizada.

---

## 2. Batería de verificación del repositorio

Cada capa se ejecuta y registra por separado sin combinar resultados heterogéneos en un único contador:

| Comprobación                | Comando                                              | Alcance y resultado esperado                                                                                                                                                           | Referencia en el repo                |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Formato**                 | `npm run format:check`                               | Comprueba Prettier sobre código y documentación (`All matched files use Prettier code style!`).                                                                                        | `.prettierrc.json`                   |
| **Linter**                  | `npm run lint`                                       | Comprueba ESLint en todo el monorepo.                                                                                                                                                  | `eslint.config.mjs`                  |
| **Tipos**                   | `npm run typecheck`                                  | Ejecuta `tsc --noEmit` en `@unimovil/admin`, `@unimovil/api`, `@unimovil/mobile` y `@unimovil/contracts`.                                                                              | `tsconfig.base.json`                 |
| **Pruebas cliente/dominio** | `npm run test:ci`                                    | 20 suites (69 pruebas) en Jest: dominio campus, búsqueda, filtros, ubicación, rutas, GTFS, mapa, movilidad, radio e historial/confirmaciones de incidencias.                           | `apps/mobile/src/**/*.test.{ts,tsx}` |
| **Pruebas unitarias API**   | `npm run api:test`                                   | 5 archivos / 10 suites (26 pruebas con `tsx --test`): `AuthGuard`, `RolesGuard`, contratos compartidos Zod, evidencias, privacidad de detalle propio y gestión/transiciones/auditoría. | `apps/api/test/*.spec.ts`            |
| **Pruebas y build Admin**   | `npm run admin:test` · `npm run admin:build`         | 2 suites (5 pruebas con `tsx --test`) de dominio de gestión, transiciones y cliente BFF, más compilación Vite de `apps/admin`.                                                         | `apps/admin/test/*.spec.ts`          |
| **Compatibilidad Expo**     | `npm run check:expo`                                 | Verifica compatibilidad de paquetes Expo (`expo install --check`).                                                                                                                     | `apps/mobile/package.json`           |
| **Exportaciones**           | `npm run export:android`, `export:ios`, `export:web` | Comprueban el empaquetado JavaScript para Android, iOS y exportación estática web en `apps/mobile/dist/`. No sustituyen un build nativo.                                               | `scripts/run-expo-local.mjs`         |
| **Smoke Web Chromium**      | `npm run test:web`                                   | Recorre `apps/mobile/dist/` en `1280 × 800` y `390 × 844` (búsqueda, ruta a pie, línea 44/parada compartida y `/incidents` con filtros).                                               | `scripts/test-web.mjs`               |
| **Integración Supabase**    | `npm run test:local-supabase`                        | Ejecuta 12 comprobaciones de extremo a extremo (+ limpieza) contra API + Postgres/PostGIS + Auth + Storage privado + BFF/CSRF + roles/gestión/privacidad/auditoría.                    | `scripts/test-local-supabase.mjs`    |

---

## 3. Arranque en local para una demostración

### Modo A — Solo consulta pública (sin backend ni base de datos)

Suficiente para demostrar mapa, búsqueda, filtros, servicios cercanos, rutas peatonales, líneas/paradas GTFS y certeza de accesibilidad (Sprints 1–5):

```bash
npm ci
npm run web:start        # Cliente público web en http://localhost:8081
# o bien en emulador/dispositivo Android con development build:
npm run mobile:android
```

### Modo B — Flujo completo con cuentas, favoritos, incidencias y administración (Sprints 6–8)

Requiere levantar previamente Supabase local, migraciones Drizzle, fixture sintético del feed y API NestJS:

```bash
npm ci
npm run supabase:start
npm run local:env
npm run db:setup-local
npm run db:seed-local
npm run api:dev          # API REST en http://127.0.0.1:3001/api (OpenAPI en /api/docs)
```

En una segunda terminal, iniciar `npm run web:start` o `npm run mobile:start`, y opcionalmente `npm run admin:dev` para el panel administrativo en local (`npm run supabase:stop` detiene el stack al finalizar).

---

## 4. Recorrido reproducible para la demo RTF

Antes de comenzar, anotar el commit mostrado (`git rev-parse --short HEAD`), si el modo ejecutado es web o emulador Android API 36 y si Supabase local + API están activos.

|                          Paso                           | Acción del revisor                                                                                                                                                                                                                | Resultado esperado                                                                                                                                                                                                                                                                                | Historias acreditadas y límites                                                                                                            |
| :-----------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
|             **1 · Mapa y búsqueda pública**             | Sin iniciar sesión, abrir `UniMovil`, usar «Buscar lugares del campus» escribiendo `biblioteca`, elegir un resultado y probar filtros de categoría (desactivando todas para ver el estado vacío y restableciendo).                | Muestra el polígono y catálogo del campus con atribución OSM, filtra sincronizadamente mapa y lista por letra/nombre y reactiva una categoría oculta al seleccionar una sugerencia.                                                                                                               | `HU-001`, `HU-010`, `HU-012`, `HU-013`, `HU-099`. Delimitación aproximada OSM, no linde oficial.                                           |
|             **2 · Rutas y transporte GTFS**             | Pulsar **Planificar ruta**, fijar origen `Facultad de Farmacia` y destino `Facultad de Medicina`; después abrir **Autobuses y paradas**, buscar la línea `44` y elegir una parada compartida.                                     | Calcula la ruta peatonal estimada sobre grafo OSM con indicaciones ordenadas, muestra alternativa de autobús cuando aplica y presenta salidas programadas EMT con fecha de snapshot y enlace oficial de avisos.                                                                                   | `HU-015`, `HU-020`–`HU-023`, `HU-025`–`HU-027`. Horarios estáticos (sin tiempo real `HU-028`) y sin rutas en bicicleta.                    |
|             **3 · Accesibilidad y certeza**             | Consultar recursos de movilidad y probar una ruta activando preferencias de accesibilidad (`HU-040`).                                                                                                                             | Evita escaleras conocidas sin etiquetar falsamente la ruta como accesible si faltan atributos confirmados; indica fuente y fecha de los recursos.                                                                                                                                                 | `HU-040`–`HU-045`, `HU-024`. `HU-024` permanece abierta hasta contar con atributos de campo confirmados.                                   |
|    **4 · Cuentas, favoritos e incidencias (Modo B)**    | Registrar o iniciar sesión con una cuenta sintética de prueba, guardar un favorito, enviar una incidencia privada con ubicación manual en `/incidents` y revisar su detalle propio, confirmaciones y el feed público con filtros. | La sesión persiste (SecureStore en móvil / BFF con cookie y CSRF en web), los favoritos quedan aislados por cuenta, la incidencia nueva nace `received`/`private`, el detalle propio omite notas internas y el feed público solo muestra datos publicados/fixture sin autor ni adjuntos privados. | `HU-002`–`HU-006`, `HU-014`, `HU-050`–`HU-056`, `HU-060`, `HU-090`–`HU-093`. Sin servicio alojado ni SMTP real.                            |
| **5 · Moderación y auditoría en `apps/admin` (Modo B)** | Iniciar sesión con una cuenta con rol `manager` o `admin` en `apps/admin`, revisar la cola de incidencias, ejecutar una transición/publicación con `expectedRevision` y consultar el registro de auditoría (`admin`).             | `RolesGuard` aplica denegación por defecto según rol de servidor, la publicación exige resumen y zona aproximada sin exponer datos del informante ni adjuntos sin auditoría, y el historial solo muestra eventos autorizados al rol `admin`.                                                      | `HU-054`, `HU-055`, `HU-056`, `HU-077`, `HU-091`, `HU-097` (corte incidencias). Validación manual en entorno local con cuentas sintéticas. |

---

## 5. Límites que deben explicitarse en cualquier defensa

- **Validación nativa iOS:** no se dispone de comprobación nativa iOS sin macOS y Xcode; `npm run export:ios` solo valida el bundle JavaScript.
- **Navegadores:** la prueba automatizada (`test:web`) cubre Chromium en escritorio (`1280 × 800`) y móvil estrecho (`390 × 844`), no Firefox ni Safari completos.
- **Datos sintéticos y alcance futuro:** la gestión y auditoría implementadas en `apps/admin` cubren incidencias sobre entorno y cuentas sintéticas locales; no existe servicio alojado ni política institucional aprobada, y el resto de dominios administrativos corresponde a los Sprints 10–11.
