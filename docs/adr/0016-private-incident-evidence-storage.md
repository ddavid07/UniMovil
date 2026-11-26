# ADR-0016: almacenamiento privado de evidencias de incidencias

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0003, ADR-0014 y ADR-0015

## Contexto

HU-051 permite adjuntar fotografías a incidencias. Las imágenes pueden contener rostros, matrículas, ubicación precisa o metadatos EXIF. Deben permanecer privadas, asociarse a una incidencia y no aparecer en la consulta pública de HU-053.

## Decisión

- Guardar evidencias en un bucket Supabase Storage privado, en la misma región aprobada que la base de datos. No crear buckets públicos ni guardar archivos binarios en Git o en tablas PostgreSQL.
- El cliente enviará el archivo al API NestJS autenticado. El API comprobará propiedad de la incidencia, tamaño y tipo real del archivo, eliminará metadatos EXIF y generará un nombre aleatorio antes de guardarlo. El cliente nunca recibirá credenciales de servicio ni acceso público al bucket.
- Para la primera versión admitir JPEG, PNG y WebP, con un máximo de 3 imágenes por incidencia y 5 MiB por imagen. Rechazar SVG, archivos cuyo contenido no coincida con el tipo declarado y formatos no procesables.
- La API solo servirá una evidencia tras comprobar que la persona es propietaria de la incidencia o cuenta con rol de gestión. Las respuestas no incluirán enlaces públicos persistentes; se utilizará una descarga autenticada mediada por el API.
- Una incidencia y sus adjuntos tendrán estados de carga explícitos. Un fallo parcial no marcará la evidencia como recibida; la repetición será idempotente y la persona podrá retirar archivos antes de enviar.
- La eliminación de una incidencia eliminará sus objetos asociados. El borrado de cuenta eliminará favoritos y perfil; el tratamiento de incidencias y evidencias asociadas seguirá la política de retención aprobada, sin conservar datos identificables por defecto.
- La implementación del Sprint usa imágenes sintéticas en Storage local. La política institucional de retención y respuesta ante exposición se acepta como riesgo externo para el incremento; no bloquea el desarrollo y no se habilita aquí almacenamiento gestionado de imágenes reales.

## Alternativas consideradas

- **Bucket público o URLs permanentes:** descartadas porque permitirían acceso fuera de la autorización de la aplicación.
- **Subida directa desde el cliente con una clave de servicio:** descartada porque expondría credenciales privilegiadas. Las URLs de carga firmadas quedan aplazadas hasta que una necesidad de rendimiento lo justifique y se revisen sus permisos y revocación.
- **Archivos en PostgreSQL:** descartados porque las evidencias son objetos binarios y Storage ofrece control de acceso específico.
- **Conservar EXIF original:** descartado para reducir la divulgación accidental de coordenadas y metadatos del dispositivo.

## Consecuencias

- NestJS tendrá que validar y procesar imágenes, autorizar cada lectura y coordinar estados de base de datos y Storage ante fallos parciales.
- Las pruebas cubrirán MIME falsificado, tamaño y cantidad límite, archivo corrupto, metadatos EXIF, acceso entre cuentas, repetición, interrupción, borrado y ausencia de exposición pública.
- Los límites elegidos son valores iniciales de producto; cualquier cambio requiere actualizar criterios, límites del API y pruebas.
- La política institucional de retención, el canal de notificación ante incidentes y la titularidad de un bucket gestionado no se resuelven en el entorno local. Se registran como riesgo aceptado para este Sprint y quedan fuera de la configuración ejecutada.

## Referencias

- [HU-051: adjuntar evidencias](../requirements/user-stories/05-incidents-and-notices.md)
- [HU-090: proteger datos de cuenta](../requirements/user-stories/08-security-privacy-and-quality.md)
- [Supabase Storage: control de acceso](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage: buckets y URLs firmadas](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase Storage: servir objetos privados](https://supabase.com/docs/guides/storage/serving/downloads)
