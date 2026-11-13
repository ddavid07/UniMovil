# ADR-0015 — Retirada de escaneos de vulnerabilidades de CI

## Estado

Aceptada

## Contexto

Los jobs de `npm audit --audit-level=high` y OSV-Scanner fallaban repetidamente por advisories transitivos de dependencias del stack Expo. Algunas correcciones sugeridas implicaban downgrades incompatibles o una actualización coordinada del SDK. Esto bloqueaba las PR incluso cuando los cambios propuestos no alteraban esas dependencias.

## Decisión

- Retirar de GitHub Actions el job de OSV-Scanner y el job de auditoría de vulnerabilidades de npm.
- Mantener `npm audit signatures`, que verifica firmas de publicación del registro npm y no analiza advisories.
- Mantener Dependabot Alerts/security updates, Dependency Review para bloquear vulnerabilidades altas/críticas nuevas, CodeQL y Gitleaks.
- Las alertas ya existentes permanecen abiertas en GitHub y deberán revisarse al actualizar el SDK o sus dependencias de forma coordinada; la retirada de los jobs no declara resueltos los advisories.

## Alternativas consideradas

- Ignorar advisories concretos mediante configuración de OSV.
- Mantener los jobs como informativos, aunque la configuración actual los marcaba como fallidos.
- Forzar downgrades u overrides que no respeten la compatibilidad del SDK.

## Consecuencias

La CI deja de bloquear cambios por el inventario transitivo actual. Se pierde la comprobación periódica de npm audit y OSV en Actions; las alertas de Dependabot y Dependency Review siguen detectando y limitando cambios de dependencias vulnerables.

## Fecha

2026-11-06
