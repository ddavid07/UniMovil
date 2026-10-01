# ADR-0014 — Repositorio público y controles de GitHub

## Estado

Aceptada

## Contexto

La fase de fundamentos requiere protección de `main`, CodeQL y secret scanning. El repositorio personal utiliza GitHub Free, donde las funciones deseadas están disponibles gratuitamente para repositorios públicos. Antes de exponerlo se debía comprobar el árbol actual y el historial completo de todas las ramas.

## Decisión

- Hacer público `ddavid07/UniMovil` tras comprobar con Gitleaks el historial completo y revisar los ficheros versionados. No se encontraron secretos ni datos privados reales. Los logs de Actions pasan a ser públicos junto con el repositorio.
- Mantener la licencia Apache 2.0 y aclarar que no otorga derechos sobre marcas, servicios o datos de la UCM.
- Activar Dependabot alerts y security updates, secret scanning y push protection. Habilitar la comunicación privada de vulnerabilidades.
- Ejecutar CodeQL sobre JavaScript/TypeScript, Dependency Review en pull requests, OSV-Scanner y Gitleaks. OpenSSF Scorecard publica métricas para el repositorio.
- Proteger `main`: pull request obligatorio, una aprobación, aprobación por CODEOWNER y de alguien distinto de quien hizo el último push, checks obligatorios (CI, auditoría npm, Gitleaks, CodeQL y Dependency Review), resolución de conversaciones, historial lineal, sin force push ni borrado y restricciones aplicadas también a administradores.
- Permitir solo squash merge y borrar automáticamente las ramas fusionadas.
- No fusionar bumps de dependencias móviles que mezclen generaciones de Expo/React Native. Las actualizaciones del SDK se harán de forma coordinada y con validación de Android e iOS.

## Alertas de dependencias conocidas

Permanecen abiertas dos alertas moderadas transitivas en Expo:

- `decode-uri-component` (`GHSA-vcc3-ghjq-m6fr`): npm propone un downgrade incompatible de `expo-router`; la corrección debe coordinarse con la versión de Expo/`query-string` y el formato CommonJS/ESM.
- `uuid` (`GHSA-w5hq-g745-h8pq`): llega por `xcode` y la cadena de configuración de Expo; npm propone downgrades incompatibles. El uso observado en la dependencia transitiva es `uuid.v4()` sin el argumento `buf` al que se refiere el advisory, pero el hallazgo no se descarta.

Los PRs automáticos de actualizaciones parciales se cerraron al fallar los bundles nativos por incompatibilidades del SDK. OSV sigue visible como job informativo; `npm audit` bloquea severidad alta/crítica y Dependency Review bloquea altas/críticas nuevas en PRs. No se fuerza una resolución que degrade o rompa la aplicación.

## Alternativas consideradas

- Mantener el repo privado y contratar un plan de pago para disponer de controles equivalentes.
- Usar únicamente escáneres ejecutados en GitHub Actions, sin controles nativos ni protección de rama.
- Forzar overrides/downgrades o fusionar los PRs automáticos sin completar builds Android e iOS.

## Consecuencias

El código, el historial y los logs de Actions son visibles públicamente y cualquiera puede hacer forks. El proyecto obtiene protecciones nativas, revisión obligatoria y análisis automatizados sin coste adicional. La visibilidad pública no sustituye la revisión de licencias, privacidad, marcas ni seguridad. Dos advisories moderados siguen pendientes de una actualización compatible del SDK.

## Fecha

2026-10-01
