# ADR-0012 — Alcance de plataformas, retención y pruebas

## Estado

Aceptada con condiciones de aprobación externa

## Contexto

El catálogo prioriza Android/iOS y el panel administrativo. Hay funcionalidades de cuenta, incidencias, ubicación, notificaciones y auditoría que requieren límites de plataforma, reglas de retención y pruebas completas.

## Decisión

- La plataforma de usuario comprometida es Android e iOS. El panel admin es web; no se construye web pública de usuario en este alcance. Una ampliación requiere nuevo ADR y requisitos de paridad/accesibilidad.
- No se almacena historial de ubicación; la ubicación se solicita solo al usar una función que la necesita y debe existir alternativa manual.
- Aplicar minimización: no conservar búsquedas ni datos de dispositivo que no sean necesarios; separar métricas agregadas de identidad cuando sea viable.
- La eliminación/desactivación de cuenta inicia borrado/anónimo de datos personales asociados, preservando únicamente registros cuya conservación haya sido aprobada y justificada. Los plazos precisos se acuerdan con responsables institucionales antes de datos reales.
- Expo Push Service se usará tras adaptador backend para Android/iOS. Se registrarán tokens por dispositivo con consentimiento y se eliminarán tokens inválidos/revocados; los avisos in-app son la fuente persistente, push es best-effort.
- Playwright cubrirá E2E del panel y Maestro los flujos E2E móviles en builds nativos Android/iOS. Se comenzará con smoke flows cuando haya pantallas funcionales; integración EAS es opcional porque su job Maestro documentado está en alpha. Expo documenta el uso de Maestro para builds Android y simulador iOS ([guía oficial](https://docs.expo.dev/tutorial/cicd/e2e-tests/)).
- No se fija un porcentaje global de cobertura hasta que existan pruebas de producto; cada criterio de aceptación deberá enlazarse a evidencia automatizada o a una validación manual documentada.
- La titularidad de cuentas Apple/Google y credenciales de publicación la decidirá el equipo/UCM antes de crear cuentas/certificados; no se publicará bajo una cuenta personal provisional.

## Alternativas consideradas

- Comprometer una web pública por compartir parte del stack.
- Mantener historial de ubicación por defecto.
- Usar push como único medio de consulta de avisos.
- Adoptar Detox u otra herramienta con integración nativa específica antes de demostrar una necesidad.

## Consecuencias

El alcance inicial queda delimitado. La retención legal y los titulares de cuentas son gates de fases posteriores; hasta resolverlos se trabaja con datos ficticios y no se distribuye públicamente. Los flujos Maestro se validan al incorporar las primeras pantallas funcionales, sin depender de un servicio de pago.

## Fecha

2026-10-01
