# ADR-0013 — CI y cadena de suministro

## Estado

Reemplazada por [ADR-0014](0014-repositorio-publico-y-controles-github.md)

## Contexto

El proyecto necesita checks reproducibles, análisis de dependencias y secretos y disciplina de revisión. El remoto actual `ddavid07/UniMovil` es privado en GitHub Free.

## Decisión

- GitHub Actions ejecutará en pull requests y pushes a `main`: instalación con `npm ci`, formato, lint, typecheck, tests, build y escaneo de seguridad.
- Workflows usarán `permissions` mínimos, acciones externas fijadas por SHA, `timeout-minutes`, `concurrency` para cancelar ejecuciones obsoletas y `persist-credentials: false` en checkout.
- Dependabot semanal actualizará npm y Actions en grupos controlados.
- Controles sin coste/plan avanzado: `npm audit` (fallo en high/critical según npm), verificación de firmas npm, control de licencias del lockfile, OSV-Scanner, Gitleaks y reglas de seguridad ESLint. OSV encuentra actualmente dos avisos transitivos ([`decode-uri-component`](https://osv.dev/GHSA-vcc3-ghjq-m6fr) y [`uuid`](https://osv.dev/GHSA-w5hq-g745-h8pq); este último con CVSS 7.5 en OSV aunque npm lo clasifica como moderado); el job OSV es informativo/no bloqueante hasta evaluar una actualización compatible con Expo, pero conserva el detalle en el log. No se ignoran ni se declaran resueltos.
- No se declara activo CodeQL alojado, secret scanning/push protection nativo, Dependency Review ni protección de `main`: GitHub limita esas funciones para este remoto privado/plan. No cambiar visibilidad ni contratar plan sin decisión del titular.
- En cuanto se disponga de repositorio público apropiadamente saneado o plan compatible, activar protección de `main` (PR, aprobación, checks obligatorios, sin force push/borrado, conversaciones resueltas, squash) y las funciones nativas compatibles.
- La CI no impondrá un porcentaje global de cobertura mientras no haya una línea base útil; los checks de suites pasan a ser bloqueantes conforme se incorporen pruebas reales.

## Alternativas consideradas

- Cambiar el repositorio a público para obtener funciones gratuitas.
- Contratar GitHub Team/Advanced Security.
- Omitir análisis automatizado hasta que exista producto.

## Consecuencias

Se obtiene CI y escaneo ejecutable ya, sin exponer el repositorio ni crear coste. Parte de la gobernanza remota no puede imponerse técnicamente en el plan actual; la política queda documentada y debe reevaluarse ante cambios de plan/visibilidad.

## Fecha

2026-10-01
