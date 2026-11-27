# UniMovil

<p align="center">
  <img src="apps/mobile/assets/ucm-logo.jpg" alt="Universidad Complutense de Madrid" width="150" />
</p>

UniMovil ayuda a estudiantes y visitantes a orientarse y desplazarse por el Campus de Moncloa de la Universidad Complutense de Madrid. El mapa y la búsqueda de lugares públicos funcionan sin cuenta ni permiso de ubicación; consultar la posición del dispositivo es opcional y requiere una acción expresa.

## Plataformas objetivo

UniMovil está dirigido a Android, iOS y navegadores web. La misma aplicación Expo sirve los clientes móviles y una exportación web estática; la administración permanece como aplicación separada.

## Funcionalidades

- Mapa interactivo con navegación manual, marcadores y atribución cartográfica.
- Búsqueda local de lugares por nombre, categoría y términos asociados.
- Selección de un resultado para centrarlo en el mapa.
- Alternativa textual mediante una lista de resultados.
- Filtros por edificios, transporte, aparcamientos, bicicletas, servicios y accesos, con símbolos legibles y opción para restablecerlos.
- Consulta puntual de la ubicación aproximada en primer plano, con permiso del sistema y mapa manual disponible si se deniega.
- Cliente público web adaptable con mapa interactivo Leaflet, búsqueda, filtros y lista textual.
- Consulta de servicios cercanos y rutas peatonales sobre una red local de OpenStreetMap, con distancia, duración estimada e indicaciones.
- Líneas, sentidos, paradas y horarios estáticos de EMT Madrid; comparación con una ruta directa de autobús y tramos a pie cuando los datos lo permiten.
- Recursos de movilidad con indicación explícita de procedencia y datos desconocidos cuando la cartografía no los confirma; preferencia de sesión para evitar escaleras cartografiadas.
- Registro, recuperación y eliminación de cuenta, perfil mínimo, favoritos privados e historial de incidencias.
- Comunicación privada de incidencias con imágenes procesadas y protegidas; consulta pública de incidencias publicadas, con filtros por categoría, estado y zona aproximada.
- Estados accesibles de carga, error, reintento y búsqueda sin resultados.

Los horarios de autobús no son llegadas en tiempo real y la alternativa calculada no combina líneas. La ruta ciclista y la accesibilidad de los caminos no están verificadas. Los avisos operativos se consultan en la fuente oficial de EMT desde el enlace del panel de transporte.

La posición se mantiene solo en memoria durante la sesión de la pantalla. UniMovil no la guarda ni la envía directamente a una API o telemetría. Al centrar el mapa, el proveedor de teselas recibe peticiones para el área visible y puede inferir la zona consultada. La aplicación usa datos de lugares de OpenStreetMap bajo ODbL 1.0 y teselas raster estándar para visualización interactiva de bajo volumen. La integración identifica sus solicitudes y mantiene visible la atribución; consulta [fuentes de datos y atribuciones](docs/development/data-sources.md) antes de reutilizar estos recursos.

## Tecnología

- React Native, Expo y Expo Router para la aplicación móvil.
- TypeScript con comprobación estricta.
- MapLibre React Native para el mapa nativo.
- React Native Web y Leaflet/React Leaflet para la interfaz y el mapa en navegador.
- Dijkstra sobre la red peatonal local de OSM y datos GTFS oficiales para las alternativas directas de EMT.
- Expo Location para consultas puntuales de ubicación en primer plano.
- API REST NestJS/OpenAPI, PostgreSQL/PostGIS con Drizzle, Supabase Auth y Storage.
- npm workspaces para el monorepo.
- ESLint, Prettier, Jest y React Native Testing Library para calidad y pruebas.

MapLibre y Expo Location necesitan módulos nativos; Expo Go no permite validar estos flujos. Para compilar y ejecutar se requiere Android Studio y Android SDK en Android, o macOS y Xcode en iOS.

## Desarrollo local

Se requiere Node.js `26.13.1` y npm `11.20.0`, fijados en `.node-version` y `package.json`.

Para desarrollar cuentas e incidencias, inicia Supabase local y la API:

```bash
npm run supabase:start
npm run local:env
npm run db:setup-local
npm run db:seed-local
npm run api:dev
```

En otra terminal, usa `npm run web:start` o `npm run mobile:start`. Las cuentas, incidencias y evidencias de desarrollo son sintéticas y se guardan en el entorno local; no hay una instancia remota configurada.

```bash
npm ci
npm run mobile:start
```

Para iniciar el cliente web en modo desarrollo:

```bash
npm run web:start
```

Abre `http://localhost:8081` en el navegador mientras el servidor Expo esté activo.

Para exportar el sitio y ejecutar la comprobación de navegador (instala Chromium una vez):

```bash
npm run export:web
npx playwright install chromium
npm run test:web
npm run api:test
npm run admin:test
npm run admin:build
npm run test:local-supabase
```

Para generar un development build nativo:

```bash
npm run mobile:android
npm run mobile:ios
```

Ejecuta desde la raíz las comprobaciones de calidad y las exportaciones de JavaScript:

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

`test:web` requiere instalar Chromium una vez y ejecuta los flujos web de búsqueda, rutas y transporte en tamaños de escritorio y móvil. Las exportaciones validan el bundle JavaScript de cada plataforma; no sustituyen una compilación nativa ni una prueba en dispositivo.

## Estructura

```text
apps/mobile/          Aplicación Expo para Android, iOS y web
apps/admin/           Aplicación administrativa React/Vite (cola de incidencias y auditoría)
apps/api/             API REST NestJS
packages/contracts/   Contratos y esquemas compartidos
supabase/             Configuración del entorno local de Supabase
scripts/              Importación de datos y comprobaciones locales
docs/                 Requisitos, backlog, planes, ADR y guías
.github/              Workflows y configuración de automatización
```

Consulta la [guía para contribuir](CONTRIBUTING.md), la [guía de desarrollo](docs/development/README.md), el [índice de documentación](docs/README.md), las [historias de usuario](docs/requirements/user-stories/README.md) y las [decisiones de arquitectura](docs/adr/README.md).

## Licencias y recursos

El código del proyecto se distribuye bajo Apache-2.0; consulta [LICENSE](LICENSE). Los datos de OpenStreetMap se rigen por ODbL 1.0. La marca de UCM incluida en la aplicación conserva su fuente y atribución en [documentación de recursos](docs/assets/README.md); su uso no queda cubierto por la licencia del código.
