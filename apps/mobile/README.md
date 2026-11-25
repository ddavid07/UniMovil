# Aplicación móvil y cliente web

Cliente Expo con React Native y Expo Router para Android/iOS, además de exportación estática con React Native Web. La ruta inicial está en `src/app/`; la pantalla de campus y los flujos de búsqueda, cercanía, rutas y transporte están en `src/features/campus/`. El mapa nativo usa MapLibre; la variante web usa Leaflet.

## Organización

- `domain/`: catálogo, búsqueda, filtros, ubicación, rutas y consulta de horarios de transporte.
- `data/`: catálogos con fuentes y licencias, acceso al catálogo local y adaptadores de capacidades del dispositivo.
- `components/` y `map/`: controles accesibles, lista alternativa y presentación del mapa.

Los datos estáticos de EMT se regeneran con `scripts/import-transit-gtfs.py`; la red peatonal OSM con `scripts/import-campus-routing.py`. Ambos archivos conservan fuente, licencia y fechas en sus metadatos y se describen en `docs/development/data-sources.md`.

## Cliente web

Desde la raíz del repositorio:

```bash
npm run web:start
```

Para exportar el sitio y ejecutar la comprobación con Chromium:

```bash
npm run export:web
npx playwright install chromium
npm run test:web
```

La exportación estática se genera en `dist/`. `test:web` abre la exportación con Chromium, bloquea solicitudes de teselas OSM y verifica búsqueda, rutas peatonales, autobuses y avisos en una ventana de escritorio y otra estrecha. CI exporta web y los bundles JavaScript Android/iOS y ejecuta la misma prueba de navegador. Una exportación de plataforma no reemplaza el build nativo ni las pruebas en dispositivo.

## Ubicación

La pantalla no consulta ubicación al iniciarse. La persona debe pulsar el control de ubicación, leer la explicación y continuar antes de que se consulte el permiso del sistema. La posición se conserva únicamente en memoria, se obtiene una sola vez con precisión equilibrada y se usa para centrar el mapa. Si la lectura no responde en 15 segundos o falla, se muestra un estado recuperable y el mapa manual sigue disponible. No se solicitan permisos de segundo plano ni se inicia seguimiento.

La configuración nativa se declara en `app.json`. Al cambiar permisos o plugins, hay que regenerar y compilar el development build nativo; una exportación JavaScript no valida los permisos ni sustituye la prueba del dispositivo. Consulta la [guía de desarrollo local](../../docs/development/README.md) para comandos y comprobaciones.
