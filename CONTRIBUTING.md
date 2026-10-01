# Contribuir a UniMovil

## Requisitos locales

- Node.js `24.21.0` (versión fijada en `.node-version`).
- npm `12.2.0` (versión fijada en `package.json`).
- Git.

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

La CI verifica también las firmas del registro npm (`npm audit signatures`), el inventario de licencias (`npm run licenses:check`) y la alineación de dependencias con el SDK Expo. El workflow de seguridad comprueba dependencias, secretos y reglas de seguridad ESLint. OSV-Scanner informa dos avisos transitivos heredados, uno con CVSS 7.5; el job es temporalmente no bloqueante y los hallazgos se mantienen visibles. `npm audit` bloquea los avisos que npm clasifica como altos o críticos.

La estrategia E2E queda fijada: Playwright para `apps/admin` y Maestro para Android/iOS en builds nativos. Los flujos se añadirán con las primeras pantallas funcionales; no se activan builds E2E en cada PR mientras la aplicación siga siendo un esqueleto.

Antes de abrir un pull request, ejecuta `npm run ci` y revisa el diff para confirmar que no incluye secretos, datos personales reales ni artefactos generados.

## Convenciones de cambios

- Utiliza ramas cortas: `feature/descripcion`, `fix/descripcion`, `docs/descripcion` o `chore/descripcion`.
- Escribe commits según Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:` o `ci:`).
- Mantén cada pull request enfocada y vincúlala con la historia, requisito, incidencia o ADR correspondiente.
- Actualiza la documentación en el mismo cambio cuando se altere el comportamiento o una decisión.
- No añadas dependencias sin revisar licencia, mantenimiento, compatibilidad y seguridad.

## Propiedad de código

`.github/CODEOWNERS` asigna la revisión inicial al mantenedor conocido del repositorio. Cuando se incorporen las cuentas de los cinco miembros del equipo, se deben asignar responsables por área para que las partes críticas no dependan de una sola persona.
