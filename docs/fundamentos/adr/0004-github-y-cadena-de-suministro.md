# ADR-0004 — GitHub y cadena de suministro

## Estado

Aceptada

## Contexto

El proyecto será desarrollado por cinco personas y debe mantener una configuración reproducible, revisable y segura. Se toma como referencia la configuración de `verification-engine`.

## Decisión

- Proteger `main`.
- Utilizar pull requests y al menos una revisión.
- Exigir CI antes de fusionar.
- Prohibir force pushes y borrado de `main`.
- Utilizar Dependabot para npm y GitHub Actions.
- Utilizar CODEOWNERS.
- Utilizar workflows separados para CI, seguridad y Scorecard.
- Declarar permisos mínimos en Actions.
- Fijar acciones de GitHub por SHA.
- Activar CodeQL, secret scanning, Dependency Review, OSV-Scanner y OpenSSF Scorecard cuando estén disponibles.
- No versionar secretos ni datos reales.

## Alternativas consideradas

- Permitir pushes directos a `main`.
- Copiar toda la configuración avanzada de `verification-engine`.
- Utilizar acciones sin fijar versión.
- Ejecutar todos los controles únicamente de forma manual.

## Consecuencias

### Positivas

- Mejor trazabilidad y revisión.
- Menor riesgo de introducir secretos o dependencias vulnerables.
- CI reproducible y visible para el equipo.
- Configuración adecuada para un repositorio académico abierto.

### Negativas

- Más configuración inicial.
- Los workflows necesitan mantenimiento.
- Algunas comprobaciones pueden requerir configuración adicional del plan de GitHub.

## Fecha

2026-09-29
