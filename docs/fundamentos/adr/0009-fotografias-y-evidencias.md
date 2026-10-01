# ADR-0009 — Fotografías y evidencias de incidencias

## Estado

Aceptada

## Contexto

Las incidencias pueden llevar fotografías potencialmente identificativas o con metadatos sensibles. Se necesita carga controlada, moderación y borrado sin publicar automáticamente archivos aportados.

## Decisión

- Utilizar Supabase Storage con bucket privado para evidencias.
- La carga se autoriza y orquesta desde la API; no se entrega al cliente una service key.
- Validar extensión, MIME real, tamaño y límites de cantidad; normalizar/reprocesar imágenes y eliminar EXIF/GPS antes de almacenarlas.
- Mantener evidencia no aprobada privada. Solo una evidencia aprobada podrá servirse según política explícita; usar URLs temporales cuando el acceso no deba ser permanente.
- Registrar relación, propietario, estado de moderación y auditoría; al retirar/borrar incidencia aplicar la política de borrado correspondiente.
- Aplicar límites configurables de tamaño, formatos y cantidad; fijar sus valores al trazar requisitos y probar la experiencia móvil, sin aceptar valores definidos por el cliente.

## Alternativas consideradas

- Guardar imágenes en la base de datos.
- Usar un bucket público.
- Incorporar un proveedor de medios separado.

## Consecuencias

Se mantiene coherencia operativa con Supabase y el control de acceso es explícito. El backend debe proteger credenciales privilegiadas, validar contenido real y gestionar expiración/borrado. Los límites concretos y plazos se fijarán mediante requisitos y revisión de privacidad, no se establecen arbitrariamente aquí.

## Fecha

2026-10-01
