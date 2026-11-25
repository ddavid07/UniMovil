# Desarrollo local

## Requisitos

- Node.js `26.13.1` y npm `11.20.0`, fijados en la raíz del repositorio.
- Android Studio y Android SDK para compilar y ejecutar en Android.
- macOS con Xcode para compilar y ejecutar en iOS.
- Un dispositivo o emulador para comprobar la aplicación nativa.

## Instalación y ejecución

Desde la raíz del repositorio:

```bash
npm ci
npm run mobile:start
```

## Supabase, cuentas e incidencias

El API NestJS, Supabase Auth, PostgreSQL/PostGIS y Storage son necesarios para cuentas, favoritos e incidencias. El mapa y la búsqueda pública siguen disponibles sin iniciar sesión ni arrancar el API. El entorno local no usa datos reales.

```bash
npm ci
npm run supabase:start
npm run local:env
npm run db:setup-local
npm run db:seed-local
npm run api:dev
```

En otra terminal, inicia la app con `npm run web:start` o `npm run mobile:start`. El script `supabase:start` usa el CLI fijado en el lockfile y elige automáticamente Docker, Podman o el runtime nativo disponible. Si se utiliza el runtime nativo experimental, la falta de Docker se considera un riesgo aceptado del entorno local; `npm run supabase:stop` detiene el stack.

`npm run local:env` consulta las URLs y claves locales del CLI y crea `.env.local` ignorado por Git con permisos `0600`. No pegues sus valores en la documentación ni en el cliente. `.env.example` enumera las variables sin valores secretos. `WEB_APP_URL` fija el origen de los enlaces de confirmación y recuperación. La app Expo carga las variables públicas del archivo local al iniciarse.

Las migraciones de la aplicación se mantienen en Drizzle bajo `apps/api/drizzle/`; el CLI de Supabase no las duplica. `npm run db:setup-local` aplica las migraciones y configura el rol `unimovil_runtime` con privilegios limitados. `npm run db:seed-local` inserta una incidencia sintética, marcada explícitamente como ejemplo, para comprobar el feed. No uses este seed como dato del campus.

La verificación integrada requiere el stack local activo, migraciones aplicadas y `.env.local` generado:

```bash
npm run test:local-supabase
```

El comando crea y elimina cuentas de prueba, ejecuta el API temporalmente y comprueba registro/confirmación, sesión web, recuperación, favoritos, aislamiento, incidencias, bucket privado y borrado. El API local está en `http://127.0.0.1:3001/api`, la documentación OpenAPI en `/api/docs`, y Supabase Studio y Mailpit se exponen en los puertos que informa el CLI. No se configura un proyecto Supabase remoto.

## Cliente público web

El cliente público usa Expo Web/React Native Web con Leaflet en navegador y MapLibre en móvil, conforme a [ADR-0011](../adr/0011-public-web-client-and-map-renderer.md). La web ofrece mapa, búsqueda, filtros, servicios cercanos, rutas peatonales y consulta de transporte, y mantiene lista textual y atribución. La aplicación administrativa es independiente.

```bash
npm run web:start
```

El cliente web local se sirve por defecto en `http://localhost:8081` mientras Expo siga ejecutándose.

Para exportar la web y ejecutar su comprobación de navegador (instala Chromium una vez):

```bash
npm run export:web
npx playwright install chromium
npm run test:web
```

`export:web` genera el sitio estático en `apps/mobile/dist/`. `test:web` sirve esa exportación y comprueba con Chromium la búsqueda de lugares, una ruta peatonal con indicaciones, una línea y parada compartida de autobús, los horarios o su estado vacío, el enlace de avisos y las ventanas de escritorio (1280 × 800) y estrecha (390 × 844). Bloquea las peticiones a teselas OSM para que la prueba no genere tráfico contra el servicio público. Instala Chromium una vez con `npx playwright install chromium`. CI ejecuta la misma prueba de navegador tras exportar la web. No se declara verificada la matriz completa Firefox/Safari/Edge ni la compatibilidad con cada lector de pantalla.

La ubicación del navegador es opcional y solo se solicita tras una acción explícita. Si se deniega, la consulta manual sigue disponible. En web se usa el agente normal del navegador para solicitar teselas OSM.

MapLibre React Native requiere código nativo y no funciona en Expo Go. Para generar y ejecutar un development build:

```bash
npm run mobile:android
npm run mobile:ios
```

El comando de iOS debe ejecutarse en macOS con Xcode instalado. Los directorios nativos se generan mediante Expo y no se versionan; la configuración se conserva en `apps/mobile/app.json`.

## Comprobaciones locales

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run check:expo
npm run export:android
npm run export:ios
npm run export:web
npm run test:web
```

Las exportaciones comprueban los bundles JavaScript de ambas plataformas. No sustituyen la compilación nativa ni la ejecución en dispositivos.

## Aplicación móvil

- Las rutas de Expo Router están en `apps/mobile/src/app/`.
- La pantalla inicial vive en `apps/mobile/src/features/campus/`.
- El catálogo y la búsqueda local están en `apps/mobile/src/features/campus/`.
- El proyecto no necesita una cuenta, acceso a la ubicación, API ni base de datos para consultar el mapa y buscar lugares.
- Para conectar el dispositivo Android con servicios locales, el lanzador Expo cambia el host `localhost` por `10.0.2.2`; no cambies las URLs del API a una dirección pública.
- El mapa base usa teselas raster estándar de OpenStreetMap con identificación de aplicación y atribución visibles. Su uso se limita a navegación interactiva de bajo volumen; no se descargan ni precargan teselas. Consulta el [ADR-0007](../adr/0007-development-basemap-provider.md) y la política del servicio antes de reutilizarlo.
- El catálogo, las redes peatonales, el horario EMT y sus atribuciones se describen en [fuentes de datos](data-sources.md).
- El cálculo peatonal local, sus límites y la generación del grafo están en [ADR-0012](../adr/0012-campus-pedestrian-routing.md).
- El horario programado EMT y la ruta directa con tramos a pie están en [ADR-0013](../adr/0013-emt-gtfs-and-transit-routing.md); no son datos de llegada en tiempo real.

## Ubicación en primer plano

`expo-location` se instala en `apps/mobile/` con la versión compatible con el SDK Expo del proyecto. El config plugin de `app.json` declara el texto de uso de iOS y desactiva permisos y servicios de ubicación en segundo plano. Los permisos de ubicación del manifiesto Android generado deben limitarse a `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION`; no debe incluir `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE` ni `FOREGROUND_SERVICE_LOCATION` para este flujo.

La persona inicia la consulta desde el control del mapa. La pantalla explica el uso y el posible conocimiento del área visible por el proveedor de teselas antes de solicitar el permiso del sistema. La consulta es puntual, solicita precisión equilibrada y mantiene las coordenadas en memoria; si falla o no responde en 15 segundos, se ofrece un estado recuperable y reintento. No añade una petición directa de ubicación a APIs ni telemetría.

Después de cambiar `app.json` o una dependencia nativa, regenera el proyecto Android y reconstruye el development build:

```bash
cd apps/mobile
npx expo prebuild --platform android
npx expo run:android
```

Comprueba el manifiesto de `apps/mobile/android/app/src/main/AndroidManifest.xml` y prueba en el dispositivo la concesión y denegación del permiso, la ubicación desactivada y la consulta disponible. El proyecto Android se genera y se ignora en Git; conserva su configuración en `app.json`.

La validación nativa iOS no se sustituye por `npx expo export --platform ios`. Para este Sprint 2 se aceptó expresamente la excepción de no hacer build ni prueba nativa iOS; el export, si se ejecuta, solo comprueba el bundle JavaScript y se registra por separado.
