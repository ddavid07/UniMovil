# Sprint 7 — comunicación y consulta de incidencias

> **Estado:** incremento implementado y comprobado contra Supabase local con datos sintéticos. ADR-0014–0018 están aceptados. La ausencia de proceso de moderación institucional se acepta como riesgo y no bloqueó el desarrollo local.

## Sprint Goal

Una persona registrada puede comunicar un problema de movilidad, adjuntar evidencia privada y consultar su historial; cualquier visitante puede consultar únicamente incidencias revisadas y autorizadas para su publicación.

## Historias seleccionadas para el plan

| ID     | Historia                                                                         | Resultado verificable                                                                                        |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| HU-050 | [Comunicar una incidencia](../../user-stories/05-incidents-and-notices.md)       | Reporte validado, ubicación elegida manualmente, identificador y estado inicial `received`.                  |
| HU-051 | [Adjuntar evidencias](../../user-stories/05-incidents-and-notices.md)            | Hasta tres imágenes aceptadas, procesadas y guardadas en Storage privado; la aplicación confirma cada carga. |
| HU-052 | [Consultar mis incidencias](../../user-stories/05-incidents-and-notices.md)      | Historial privado propio y detalle, con estados vacíos y estados de flujo comprensibles.                     |
| HU-053 | [Consultar incidencias públicas](../../user-stories/05-incidents-and-notices.md) | Mapa/lista solo con registros `published`, filtros y proyección pública que excluye información privada.     |

## Decisiones y dependencias

- Supabase local de Sprint 6, API NestJS, autenticación, sesión segura y autorización por propietario deben funcionar antes del corte vertical de incidencias. No crear una persistencia final en memoria.
- Aplicar [ADR-0016](../../adr/0016-private-incident-evidence-storage.md): bucket privado `incident-evidence`; carga y descarga mediadas por API; JPEG/PNG/WebP; máximo 3 imágenes por incidencia y 5 MiB por imagen; validación del contenido, eliminación EXIF y nombre aleatorio. Ningún adjunto se incluye en la consulta pública.
- Aplicar [ADR-0018](../../adr/0018-incident-visibility-and-moderation.md): cada reporte empieza con estado operativo `received` y publicación `private`. El estado operativo y la publicación son campos separados. Solo rol de gestión asignado por servidor puede publicar o retirar.
- La consola y operaciones de gestión HU-054–056 pertenecen al Sprint 8. En Sprint 7, la consulta pública se prueba con un fixture sintético insertado localmente; no se afirma que haya incidencias reales revisadas. La publicación desde el flujo de usuario permanece prohibida.
- La persona elige ubicación mediante un lugar conocido y corrige sus coordenadas dentro de la cobertura cartográfica aproximada del campus. No capturar ubicación del dispositivo automáticamente. El límite OSM no se presenta como linde oficial.
- Categorías iniciales: `access_obstruction`, `lift_or_elevator`, `adapted_access_or_service`, `parking`, `bicycle_resource` y `other`. Prioridad percibida: `low`, `normal` o `high`, opcional y rotulada como impresión de quien informa, no nivel de urgencia oficial.
- La descripción es obligatoria, entre 1 y 2.000 caracteres. El servidor valida campos y coordenadas; la interfaz mantiene el texto al corregir errores.
- El riesgo de no disponer de proyecto gestionado, política de retención/borrado o proceso institucional de revisión se acepta para completar el Sprint con datos ficticios y Storage local; no se crea servicio remoto ni se introducen incidencias reales.

## Contrato funcional de referencia

- `POST /incidents` recibe un formulario multipart autenticado con categoría, descripción, prioridad percibida opcional, coordenada manual confirmada y hasta tres imágenes. La identidad del autor procede de la sesión validada, nunca del cuerpo de la solicitud.
- El API valida y procesa los archivos primero, crea el reporte solo si todos han quedado en Storage y confirma con identificador público opaco, fecha y estado `received`; la publicación sigue `private`. Usa una clave de idempotencia por envío. Si falla una parte, compensa borrando los objetos ya subidos y no confirma una incidencia con adjuntos incompletos.
- `GET /me/incidents` solo devuelve incidencias del usuario autenticado, detalle y estado. El modelo admite los estados de HU-055 (`received`, `under_review`, `in_progress`, `resolved`, `closed`) para lectura; transiciones y respuestas de gestión quedan en Sprint 8.
- `GET /incidents` es anónimo y devuelve solo campos autorizados para registros `published` no cerrados. El API valida filtros por categoría y estado; la aplicación filtra la zona por radio aproximado desde un lugar seleccionado del campus. La proyección no devuelve email/autor, identificador interno, prioridad privada, adjuntos ni notas internas.
- La zona se interpreta como un radio seleccionable de 250, 500 o 1.000 metros desde un recurso del catálogo local; la interfaz calcula la distancia geográfica sin crear una taxonomía administrativa.
- La carga de evidencia ocurre dentro del envío multipart, antes de confirmar la incidencia. Si falla, la incidencia no se confirma como si el archivo estuviera adjunto; la persona puede reintentar el envío o quitar ese archivo. Los objetos huérfanos por fallo de compensación quedan privados y se registran para limpieza/reintento, sin URL accesible al cliente.

## Trabajo y secuencia

| ID  | Actividad y entregable                                                                                                                                                   | Dependencia             | Área funcional      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------- |
| T1  | Verificar readiness de Supabase local, API/auth Sprint 6, Storage privado, roles y pruebas de cuenta propia. Resolver fallos previos antes de exponer flujo de reportes. | Sprint 6, ADR-0014/0015 | API y seguridad     |
| T2  | Refinar HU-050–053 con categorías, campos, límites de texto/archivo, ubicación, estados y datos públicos conforme a este plan y ADR-0016/0018.                           | T1                      | Producto            |
| T3  | Diseñar contratos y modelo para reportes, estados, publicación, historial y evidencias; crear migraciones Drizzle y restricciones de integridad.                         | T2                      | Dominio y datos     |
| T4  | Implementar creación autenticada, validación, ID público, estado inicial privado, consulta propia y errores recuperables.                                                | T3                      | API                 |
| T5  | Implementar carga segura de imagen: autorización, límites, MIME real, decode, stripping EXIF, nombre aleatorio, bucket privado y compensación ante fallo.                | T3–T4                   | API y Storage       |
| T6  | Construir formulario móvil/web con ubicación manual mediante catálogo/coordenadas editables, preview/quitar adjuntos, estado ocupado, reintento y confirmación.          | T4–T5                   | Clientes            |
| T7  | Construir historial propio y estados; completar feed público filtrado por categoría, estado y radio de zona, con mapa/lista de incidencias y estado vacío real.          | T4–T6                   | Clientes/API        |
| T8  | Probar aislamiento, publicación, exposición de datos, archivo y estados de error; instrumentar logs sin PII ni contenido del reporte.                                    | T4–T7                   | Calidad y seguridad |
| T9  | Añadir integración Supabase local a CI, documentar configuración local y riesgos aceptados, actualizar historias/backlog/fuentes/guía y revisar incremento.              | T8                      | CI y documentación  |

## Responsabilidades funcionales

| Responsabilidad                | Trabajo                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Product Owner                  | Validar categorías, campos visibles, uso de prioridad percibida y política aprobada antes de aceptar datos reales. |
| Scrum Master                   | Mantener visibles las dependencias de moderación, titularidad, retención y seguridad; adaptar Sprint Backlog.      |
| Developers — API/datos         | Crear modelo, transiciones, autorización, persistencia y consulta pública minimizada.                              |
| Developers — clientes          | Entregar formulario, historial y feed accesibles en móvil/web, con ubicación corregible y estados recuperables.    |
| Developers — seguridad/calidad | Verificar archivos, aislamiento, sesión, privacidad, pruebas de abuso y recuperación.                              |

## Archivos y documentación afectados

Crear `apps/mobile/src/features/incidents/` y los módulos de dominio/API en `apps/api/src/`; extender `packages/contracts/`, migraciones Drizzle y configuración privada local de Storage. Incorporar límites y validación en un único contrato compartido cuando sea posible.

Actualizar HU-050–053 y sus criterios; HU-006 para las consecuencias del borrado una vez que hay incidencias; Product Backlog; ADR si una decisión aceptada debe sustituirse; guía de desarrollo, `.env.example`, OpenAPI, pruebas y política de datos/retención. No incluir fotos o datos reales en fixtures ni repositorio.

## Verificación y Definition of Done

- Dominio/API: transiciones permitidas, identificador opaco, propiedad desde identidad validada, estado privado por defecto, publicación solo por rol autorizado y feed filtrado.
- DB/Storage: migración limpia; constraints e índices geoespaciales necesarios; bucket privado; borrado de objetos asociados; fallo de almacenamiento no deja reporte con adjunto fantasma.
- Seguridad: acceso cruzado a reportes/archivos da denegación; usuario no puede publicar; feed público no contiene autor, correo, notas ni fotos; roles no provienen de metadatos editables por el cliente.
- Archivos: formatos permitidos, magic bytes falsos, MIME inconsistente, SVG, imagen corrupta, 5 MiB exactos y exceso, cuarta imagen, EXIF/GPS, nombre original, reintento y fallo de subida.
- Cliente: validación y persistencia del formulario ante error, ubicación manual dentro/fuera del área, selector y ajuste de coordenadas, selección/eliminación de imágenes, estado ocupado/reintento, historial vacío y feed vacío.
- E2E web y Android: iniciar sesión, comunicar reporte, adjuntar imagen sintética, consultar propio, verificar que cuenta B no lo ve, y consultar feed con fixture publicado sin campos privados. Probar además viewport móvil y escritorio.
- Calidad: formato, lint, TypeScript en todas las workspaces, unitarias, integración/e2e API con Supabase local, export web y navegador, export Android/iOS y build/ejecución Android. No declarar build nativo iOS sin macOS/Xcode.
- El trabajo con Supabase local y datos sintéticos se completa sin depender de aprobaciones externas. La prueba local no se presenta como despliegue de producción.

## Riesgos y respuesta

| Riesgo                                            | Respuesta                                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fuga de evidencia, EXIF o ubicación precisa       | Strip EXIF, bucket privado, descarga mediada, autorización por cada solicitud y pruebas negativas.                                                             |
| Spam o contenido abusivo                          | Requerir cuenta, aceptar privado por defecto, limitar campos y no publicar automáticamente. La moderación de producto queda en Sprint 8.                       |
| Fallo entre Postgres y Storage                    | Operaciones idempotentes, estados de carga y compensación/reintento; no confirmar adjunto incompleto.                                                          |
| Sin proceso institucional de retención/moderación | Riesgo aceptado: completar el desarrollo local con fixtures sintéticos; el API mantiene privados los reportes de usuario y no publica desde una cuenta normal. |
| Puntos se interpretan como verificados o exactos  | Selección explícita, punto corregible, nota de cobertura cartográfica aproximada y minimización pública revisada.                                              |

## Ceremonias y resultado

Seguir metodología Scrum; este plan no sustituye actas ni registra eventos que no se hayan celebrado. El resultado técnico se registra aquí y en el backlog con evidencia local.

## Resultado de implementación local

- El reporte autenticado valida categoría, descripción, coordenadas y prioridad opcional; inicia privado en `received`, admite clave de idempotencia y se asocia a la identidad validada por el API.
- Las imágenes pasan validación real y normalización WebP con eliminación de EXIF, quedan en un bucket Storage privado y se descargan mediante un endpoint que vuelve a comprobar propiedad. Los fallos de compensación quedan en una cola de limpieza reintentable.
- El historial propio devuelve datos de la cuenta, estado y coordenadas; la consulta pública expone una proyección minimizada de registros publicados y activos.
- El feed ofrece filtros de categoría, estado y radio desde un lugar seleccionado. Se añadió una fixture local sintética con texto explícito de que no representa una incidencia real.
- Evidencia de `npm run test:local-supabase`: health, consulta anónima/proyección, validación de filtros, registro y confirmación requerida, aislamiento entre cuentas, sesiones BFF/CSRF/renovación, recuperación de contraseña, carga de evidencia, privacidad del bucket e idempotencia, y borrado de cuenta/evidencias.
- Verificación adicional: build nativo Android 36 iniciado sobre Metro local; se revisaron el mapa, la pantalla de cuenta y el feed/formulario de incidencias. La fixture pública aparece identificada como sintética; la API local responde desde el emulador y el acceso autenticado nativo obtiene perfil y favoritos.
- Recorrido web local con Chromium: se abrió el feed público sintético, se seleccionó una referencia del campus, se envió una incidencia privada y apareció en el historial propio. La cuenta y su incidencia de prueba se eliminaron al terminar; el recorrido de API con Supabase también verifica carga de imágenes privadas.
- No se configuró moderación institucional, servicio gestionado ni publicación de incidencias reales. Esta ausencia se acepta como riesgo del incremento local y no bloqueó las pruebas con datos sintéticos.
