# ADR-0005: toolchain y estándares de desarrollo

- **Estado:** Aceptada
- **Fecha:** 2026-11-23
- **Decisores:** Equipo UniMovil

## Contexto

El repositorio comienza sin manifiestos ni configuración de aplicación en la rama local de trabajo. El equipo necesita instalaciones reproducibles, reglas de código comunes y comprobaciones que funcionen en los equipos de desarrollo y en CI.

## Decisión

### Toolchain

- Node.js **26.13.1 LTS** y npm **11.20.0**, fijados en `.node-version` y `package.json`. Se actualizarán dentro de la rama LTS con cambios de seguridad; una actualización mayor se evaluará mediante PR.
- npm workspaces para el monorepo y un único `package-lock.json`; `packageManager` fija npm 11.20.0.
- TypeScript **6.0.3** como lenguaje de la aplicación, API y administración. Todos los paquetes tendrán `strict: true` y compartirán las reglas base.
- Expo SDK estable; no se usarán versiones canary o beta para la aplicación principal.
- El mapa nativo se probará con development builds de Expo. Las dependencias compatibles con Expo se instalarán con `npx expo install` y se verificará su compatibilidad antes de integrar.

### Estándares de código y repositorio

- Código, comentarios técnicos, nombres de variables, carpetas y archivos: inglés. Textos de interfaz, historias y documentación del proyecto: español.
- ESLint **10.15.0** para análisis estático y Prettier **3.10.1** para formato, con configuración compartida y comprobada en CI. Sin reglas de formato manuales por editor.
- Dos espacios, UTF-8 y finales de línea LF mediante `.editorconfig`; los archivos generados o vendorizados se excluirán de los formateadores.
- Nombres descriptivos y consistentes; evitar abreviaturas no estándar, lógica de dominio dentro de componentes de interfaz y secretos en el repositorio.
- Conventional Commits para mensajes (`feat`, `fix`, `docs`, `test`, `build`, `ci`, `chore`). Cada cambio funcional conserva los IDs HU relacionados en PR o commit cuando aplique.
- Jest **29.7.0** y React Native Testing Library **14.1.0** ejecutan pruebas centradas en comportamiento observable: unitarias para búsqueda y normalización; componentes para estados de pantalla e interacción; integración para API cuando exista. Las comprobaciones de plataforma se realizarán en development builds.

## Alternativas consideradas

- **Node Current o una versión EOL:** descartadas para tener una base soportada y reproducible.
- **Varios gestores y lockfiles:** descartados para evitar instalaciones no deterministas.
- **JavaScript sin tipado estricto:** descartado por el tamaño previsto del modelo de dominio y la posibilidad de compartir tipos.
- **Expo Go como entorno único:** descartado porque el motor MapLibre necesita código nativo y configuración de compilación.

## Consecuencias

- El primer Sprint debe establecer los manifiestos, lockfile, `.node-version`, configuración TypeScript, ESLint, Prettier y `.editorconfig`.
- Node 26 está en la línea LTS; el repositorio debe actualizar el parche de forma controlada y mantener compatibilidad con Expo y NestJS.
- No se fijan aquí umbrales de cobertura sin una base de código. El Sprint 1 añadirá pruebas representativas y hará obligatorias las comprobaciones que ya sean estables.

## Referencias

- [Versiones y soporte LTS de Node.js](https://nodejs.org/en/about/previous-releases)
- [Versiones Expo y requisitos de Node.js](https://docs.expo.dev/versions/latest/)
- [TypeScript: opción `strict`](https://www.typescriptlang.org/tsconfig/strict.html)
- [MapLibre React Native con Expo](https://maplibre.org/maplibre-react-native/docs/setup/expo/)
