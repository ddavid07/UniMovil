# ADR-0007 — Identidad y autorización

## Estado

Aceptada

## Contexto

UniMovil necesita consulta pública y cuentas para acciones como favoritos e incidencias, además de roles internos de gestión. La API es la frontera de negocio y Supabase ya está aceptado como plataforma de datos.

## Decisión

- Utilizar Supabase Auth para identidad y credenciales.
- Móvil y panel enviarán tokens a la API NestJS; la API verificará identidad en cada operación protegida.
- Los roles `public`, `registered`, `manager` y `admin` serán datos/reglas de UniMovil controlados en backend; no se confiará en roles editables desde el cliente ni en la relación con la UCM.
- Comenzar con correo y contraseña, verificación de correo, recuperación segura y revocación/cierre de sesión. No incorporar acceso social/institucional hasta que exista requisito y responsable de integración.
- Las respuestas de registro y recuperación no revelarán si una dirección está registrada.
- El ciclo de baja seguirá las reglas de minimización y eliminación/anonimización del ADR-0012; los plazos que requieran aprobación se fijarán antes de datos reales.

## Alternativas consideradas

- Implementar identidad y almacenamiento de contraseñas en UniMovil.
- Adoptar un proveedor de identidad independiente de Supabase.
- Autorizar operaciones de negocio directamente desde el cliente contra Supabase.

## Consecuencias

Supabase reduce carga operativa y ofrece flujos gestionados; UniMovil conserva control de autorización en su backend. El proveedor queda abstraído detrás de un módulo de identidad para permitir migración. Deben verificarse JWT, límites de intentos, recuperación, sesiones, MFA administrativa y secretos antes de operar.

## Fecha

2026-10-01
