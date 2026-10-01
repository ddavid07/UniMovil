# ADR-0010 — Entornos y estrategia de despliegue

## Estado

Aceptada con selección de hosting condicionada

## Contexto

La API, el panel, PostgreSQL/PostGIS, autenticación y Storage necesitan aislamiento de datos y secretos por entorno. No se han confirmado presupuesto, titularidad institucional ni requisitos de residencia de datos suficientes para contratar un proveedor concreto.

## Decisión

- Mantener Supabase como plataforma gestionada de PostgreSQL/PostGIS, Auth y Storage.
- Provisionar proyectos separados de Supabase para desarrollo/integración y publicación; nunca compartir credenciales o datos reales entre ellos.
- Desplegar API y panel como servicios independientes, con despliegue reproducible desde CI, TLS, health checks, logs sin datos personales, secretos por entorno y restauración ensayada.
- No fijar aún el vendedor de hosting para API/panel: antes de provisionar publicación se compararán región UE adecuada, coste total, gestión de secretos, backups, logs, portabilidad y titularidad de cuenta. ADR o actualización de este ADR registrará la selección.
- Mantener configuración y adaptadores portables; no introducir dependencias del proveedor en dominio/contratos.
- Usar datos ficticios en integración. Promover cambios mediante migraciones revisadas y despliegue controlado.

## Alternativas consideradas

- Autoalojar PostgreSQL y servicios desde el principio.
- Usar Supabase también para servir API/panel.
- Elegir un proveedor de hosting concreto antes de conocer presupuesto, región y titularidad.

## Consecuencias

La decisión cierra arquitectura y separación de responsabilidades sin comprometer al equipo a un gasto ni a una cuenta de titularidad no acordada. La selección del hosting y dominio es una condición previa al despliegue público, no al desarrollo local ni a la integración.

## Fecha

2026-10-01
