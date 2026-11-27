# Resumen de pruebas y guía de demo para Revisión Técnica Formal (RTF)

Este documento resume cómo comprobar de forma reproducible el incremento actual de UniMovil (Sprints 1–7) y qué recorrido seguir durante una Revisión Técnica Formal o defensa académica, manteniendo separados los resultados verificados de los límites y excepciones aceptadas.

## 1. Requisitos de entorno

- **Toolchain fijada:** Node.js `26.13.1` (`.node-version`) y npm `11.20.0` (`package.json`).
- **Opcional según lo que se demuestre:**
  - Android Studio / Android SDK para el development build nativo (MapLibre requiere build nativo; Expo Go no sirve como validación).
  - Stack local de Supabase (Docker, Podman o runtime local) para cuentas, favoritos, incidencias privadas/públicas e integración completa.
  - Chromium de Playwright (`npx playwright install chromium`) para la comprobación web automatizada.

---

## 2. Batería de verificación del repositorio

Cada capa se ejecuta y registra por separado sin combinar resultados heterogéneos en un único contador:

| Comprobación                | Comando                                              | Alcance y resultado esperado                                                                                                             | Referencia en el repo                |
| --------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Formato**                 | `npm run format:check`                               | Comprueba Prettier sobre código y documentación (`All matched files use Prettier code style!`).                                          | `.prettierrc.json`                   |
| **Linter**                  | `npm run lint`                                       | Comprueba ESLint en todo el monorepo.                                                                                                    | `eslint.config.mjs`                  |
| **Tipos**                   | `npm run typecheck`                                  | Ejecuta `tsc --noEmit` en `@unimovil/api`, `@unimovil/mobile` y `@unimovil/contracts`.                                                   | `tsconfig.base.json`                 |
| **Pruebas cliente/dominio** | `npm run test:ci`                                    | 19 suites (64 pruebas) en Jest: dominio campus, búsqueda, filtros, ubicación, rutas, GTFS, mapa, movilidad y radio de incidencias.       | `apps/mobile/src/**/*.test.{ts,tsx}` |
| **Pruebas unitarias API**   | `npm run api:test`                                   | 3 archivos / 4 suites (11 pruebas con `tsx --test`): `AuthGuard`, contratos compartidos Zod y validación/EXIF de evidencias.             | `apps/api/test/*.spec.ts`            |
| **Compatibilidad Expo**     | `npm run check:expo`                                 | Verifica compatibilidad de paquetes Expo (`expo install --check`).                                                                       | `apps/mobile/package.json`           |
| **Exportaciones**           | `npm run export:android`, `export:ios`, `export:web` | Comprueban el empaquetado JavaScript para Android, iOS y exportación estática web en `apps/mobile/dist/`. No sustituyen un build nativo. | `scripts/run-expo-local.mjs`         |
| **Smoke Web Chromium**      | `npm run test:web`                                   | Recorre `apps/mobile/dist/` en `1280 × 800` y `390 × 844` (búsqueda, ruta a pie y línea 44/parada compartida).                           | `scripts/test-web.mjs`               |
| **Integración Supabase**    | `npm run test:local-supabase`                        | Ejecuta 11 comprobaciones de extremo a extremo contra API + Postgres/PostGIS + Auth + Storage privado con cuentas sintéticas.            | `scripts/test-local-supabase.mjs`    |

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

### Modo B — Flujo completo con cuentas, favoritos e incidencias (Sprints 6–7)

Requiere levantar previamente Supabase local, migraciones Drizzle, fixture sintético del feed y API NestJS:

```bash
npm ci
npm run supabase:start
npm run local:env
npm run db:setup-local
npm run db:seed-local
npm run api:dev          # API REST en http://127.0.0.1:3001/api (OpenAPI en /api/docs)
```

En una segunda terminal, iniciar `npm run web:start` o `npm run mobile:start` (`npm run supabase:stop` detiene el stack al finalizar).

---

## 4. Recorrido reproducible para la demo RTF

Antes de comenzar, anotar el commit mostrado (`git rev-parse --short HEAD`), si el modo ejecutado es web o emulador Android API 36 y si Supabase local + API están activos.

|                       Paso                        | Acción del revisor                                                                                                                                                                                                 | Resultado esperado                                                                                                                                                                                                                                    | Historias acreditadas y límites                                                                                                                                        |
| :-----------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|          **1 · Mapa y búsqueda pública**          | Sin iniciar sesión, abrir `UniMovil`, usar «Buscar lugares del campus» escribiendo `biblioteca`, elegir un resultado y probar filtros de categoría (desactivando todas para ver el estado vacío y restableciendo). | Muestra el polígono y catálogo del campus con atribución OSM, filtra sincronizadamente mapa y lista por letra/nombre y reactiva una categoría oculta al seleccionar una sugerencia.                                                                   | `HU-001`, `HU-010`, `HU-012`, `HU-013`, `HU-099`. Delimitación aproximada OSM, no linde oficial.                                                                       |
|          **2 · Rutas y transporte GTFS**          | Pulsar **Planificar ruta**, fijar origen `Facultad de Farmacia` y destino `Facultad de Medicina`; después abrir **Autobuses y paradas**, buscar la línea `44` y elegir una parada compartida.                      | Calcula la ruta peatonal estimada sobre grafo OSM con indicaciones ordenadas, muestra alternativa de autobús cuando aplica y presenta salidas programadas EMT con fecha de snapshot y enlace oficial de avisos.                                       | `HU-015`, `HU-020`–`HU-023`, `HU-025`–`HU-027`. Horarios estáticos (sin tiempo real `HU-028`) y sin rutas en bicicleta.                                                |
|          **3 · Accesibilidad y certeza**          | Consultar recursos de movilidad y probar una ruta activando preferencias de accesibilidad (`HU-040`).                                                                                                              | Evita escaleras conocidas sin etiquetar falsamente la ruta como accesible si faltan atributos confirmados; indica fuente y fecha de los recursos.                                                                                                     | `HU-040`–`HU-045`, `HU-024`. `HU-024` permanece abierta hasta contar con atributos de campo confirmados.                                                               |
| **4 · Cuentas, favoritos e incidencias (Modo B)** | Registrar o iniciar sesión con una cuenta sintética de prueba, guardar un favorito, enviar una incidencia privada con ubicación manual en `/incidents` y revisar el feed público con filtros.                      | La sesión persiste (SecureStore en móvil / BFF con cookie y CSRF en web), los favoritos quedan aislados por cuenta, la incidencia nueva nace `received`/`private` y el feed público solo muestra la fixture sintética sin autor ni adjuntos privados. | `HU-002`–`HU-006`, `HU-014`, `HU-050`–`HU-053`, `HU-060`, `HU-090`–`HU-093`. Sin servicio alojado, SMTP real ni panel admin (`apps/admin` corresponde a Sprints 8–10). |

---

## 5. Límites que deben explicitarse en cualquier defensa

- **Validación nativa iOS:** no se dispone de comprobación nativa iOS sin macOS y Xcode; `npm run export:ios` solo valida el bundle JavaScript.
- **Navegadores:** la prueba automatizada (`test:web`) cubre Chromium en escritorio (`1280 × 800`) y móvil estrecho (`390 × 844`), no Firefox ni Safari completos.
- **Datos sintéticos y alcance futuro:** no existe moderación institucional ni aplicación administrativa (`apps/admin`) implementada hasta abordar los Sprints 8–10.
