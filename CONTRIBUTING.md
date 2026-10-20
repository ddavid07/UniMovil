# Contribuir a UniMovil

## Requisitos locales

- Node.js `24.21.0` (versión fijada en `.node-version`).
- npm `12.2.0` (versión fijada en `package.json`).
- Git.
- Para Android: JDK 21, Android SDK y un emulador o dispositivo conectado.
- Para iOS: macOS, Xcode y CocoaPods; CI fija Xcode 26.6.

Comprueba las versiones antes de instalar:

```sh
node --version
npm --version
```

## Preparar el repositorio

Desde la raíz del repositorio:

```sh
npm ci
cp .env.example .env.local
```

El archivo `.env.local` es local y no debe contener información que después se copie a documentación, issues o logs. La API lo carga al arrancar desde la raíz del repositorio. Las claves reales de proveedores se configurarán únicamente cuando se habiliten esas integraciones.

La configuración de integración y publicación se inyectará desde las variables del entorno de CI y del proveedor de despliegue. No se crearán archivos de secretos de esos entornos dentro del repositorio.

## Ejecutar las aplicaciones

Cada proceso se ejecuta en una terminal independiente:

```sh
npm run dev:mobile
npm run dev:api
npm run dev:admin
```

La API utiliza el puerto `3000` y el panel local de Vite utiliza el puerto `5173`, salvo que su configuración indique otro valor.

## Comprobaciones locales

```sh
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
npm run ci
```

La CI verifica firmas npm, licencias y alineación con Expo. Los escáneres de seguridad se conservan: CodeQL, Dependency Review, Gitleaks, auditoría npm y OSV. OSV ya no es informativo: los hallazgos bloquean su workflow. La auditoría npm bloquea altos/críticos. No se deben omitir estos controles para integrar una entrega.

La revisión del 20 de octubre de 2026 detectó avisos altos transitivos de `node-forge` y `braces`, sin versión corregida publicada en sus advisories. La actualización compatible de Expo no los elimina. No se considera aprobada una entrega mientras sus checks obligatorios fallen; no usar `npm audit fix --force` ni ocultar estos avisos.

## Ejecutar el mapa móvil

MapLibre requiere una compilación nativa; Expo Go no contiene este módulo. Desde la raíz:

```sh
cp apps/mobile/.env.example apps/mobile/.env.local
npm run build:packages
npm run android --workspace=@unimovil/mobile
# En macOS con Xcode:
npm run ios --workspace=@unimovil/mobile
```

Configura `EXPO_PUBLIC_MAPTILER_KEY` en el archivo local con una clave pública de cliente dedicada. Restringe su User-Agent a `UniMovil/0.1` en MapTiler, revisa cuotas y no uses tokens de servicio. La clave estará presente en el bundle; no es un secreto de backend. La API no es necesaria para este catálogo local. Después de instalar el build de desarrollo, `npm run dev:mobile` arranca Metro para iterar. Las modificaciones de plugins o dependencias nativas requieren reconstruir la aplicación.

Los lugares proceden de OpenStreetMap y conservan ODbL, fuente y fecha de consulta por registro. No son una inspección de campo ni una garantía de apertura o accesibilidad. Los puntos centrales de edificios no representan entradas. El catálogo no contiene datos personales y se valida con `npm run catalog:check` después de construir los contratos.

## Pruebas del primer incremento

`npm test` ejecuta suites reales de dominio y componentes: exige 90 % de líneas, sentencias y funciones y 85 % de ramas; 100 % de ramas en validador y lógica de exploración, y por archivo al menos 80 % de líneas y 70 % de ramas. `npm run test:performance` mide búsqueda y filtrado de 1.000 registros sintéticos en Node y guarda las muestras en `test-results/`; no demuestra rendimiento nativo.

La CI `Native mobile` compila APK Android y aplicación de simulador iOS con JavaScript integrado, y ejecuta Maestro 2.11.0 verificado mediante SHA-256. Las fixtures usan MapLibre nativo y un fondo local sin teselas externas; se identifican claramente en pantalla. El modo `fixture-error` comprueba un fallo real de carga y su recuperación. No se deben usar estos builds como evidencia de MapTiler real.

El workflow ejecuta tres repeticiones sobre el mismo commit. Si existe `MAPTILER_PUBLIC_CLIENT_KEY` como secreto de configuración de Actions, añade automáticamente flujos `live` con el proveedor real a las pruebas de fixtures, también antes de integrar la PR. El check `Native acceptance` falla si no se han completado los builds/flujos o falta esa configuración. Tras añadirla se pueden volver a ejecutar todos los jobs de la PR. El modo manual `live` exige la misma configuración. Sus artefactos son públicos; esa clave debe ser exclusivamente de cliente y estar restringida. Los tests de fixture requieren `APP_VARIANT=e2e`; el build normal rechaza su activación accidental. Los APK de CI se compilan para el emulador x86_64; iOS se compila para la arquitectura del runner. No son artefactos de publicación en tiendas. Android usa API 36; iOS fija Xcode 26.6 y runtime 26.5. Las ejecuciones normales usan Pixel 6/iPhone 16 y las de recuperación un tamaño Android compacto/iPhone SE de tercera generación; los logs conservan las versiones efectivas.

La aceptación requiere además revisar atribución y posiciones con MapTiler real, tamaños compactos, texto al 200 %, accesibilidad y los presupuestos nativos de arranque, interacción, fotogramas y memoria. Esas comprobaciones no se consideran ejecutadas porque pasen las pruebas de Node o componentes. La estrategia del panel sigue siendo Playwright cuando se implemente su funcionalidad; este incremento no cambia el panel.

Antes de abrir un pull request, ejecuta `npm run ci` y revisa el diff para confirmar que no incluye secretos, datos personales reales ni artefactos generados.

## Convenciones de cambios

- Utiliza ramas cortas: `feature/descripcion`, `fix/descripcion`, `docs/descripcion` o `chore/descripcion`.
- Escribe commits según Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:` o `ci:`).
- Mantén cada pull request enfocada y vincúlala con la historia, requisito, incidencia o ADR correspondiente.
- Actualiza la documentación en el mismo cambio cuando se altere el comportamiento o una decisión.
- No añadas dependencias sin revisar licencia, mantenimiento, compatibilidad y seguridad.

## Propiedad de código

`.github/CODEOWNERS` asigna la revisión inicial al mantenedor conocido del repositorio. Cuando se incorporen las cuentas de los cinco miembros del equipo, se deben asignar responsables por área para que las partes críticas no dependan de una sola persona.
