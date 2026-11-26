# Sprint 12 — preferencias, rutas guardadas y notificaciones

- **Estado:** Plan futuro propuesto, pendiente de refinamiento y aceptación de las decisiones necesarias.

## Sprint Goal y valor

### Sprint Goal

Una persona puede conservar de forma privada sus preferencias y rutas, compartir un enlace que no revele sus datos personales y recibir avisos seleccionados sin duplicados ni notificaciones fuera de sus permisos.

## Sprint Backlog

### Historias candidatas

| ID     | Historia                                                                                                                 | Resultado esperado                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| HU-007 | [Gestionar permisos del dispositivo](../../requirements/user-stories/01-account-access.md)                               | Permisos de ubicación y notificaciones explicados y controlables por separado; revocación del sistema atendida. |
| HU-017 | [Compartir un lugar o ubicación](../../requirements/user-stories/02-campus-map-search-and-places.md)                     | Enlace estable a contenido público sin coordenadas o datos privados del usuario.                                |
| HU-029 | [Guardar rutas habituales](../../requirements/user-stories/03-routes-and-transit.md)                                     | Crear, editar, repetir y borrar rutas asociadas a la cuenta, sin ubicación continua.                            |
| HU-061 | [Consultar búsquedas y rutas recientes](../../requirements/user-stories/06-personalization-and-notifications.md)         | Historial privado, editable/borrable según preferencia y política aprobada.                                     |
| HU-062 | [Configurar preferencias de movilidad](../../requirements/user-stories/06-personalization-and-notifications.md)          | Preferencias privadas que orientan el orden, no impiden alternativas disponibles.                               |
| HU-063 | [Configurar notificaciones](../../requirements/user-stories/06-personalization-and-notifications.md)                     | Categorías y horario de silencio coordinados con las preferencias y permisos del dispositivo.                   |
| HU-064 | [Recibir una notificación relevante](../../requirements/user-stories/06-personalization-and-notifications.md)            | Aviso vinculado a evento existente, sin duplicados y con destino funcional.                                     |
| HU-065 | [Cambiar idioma y preferencias de presentación](../../requirements/user-stories/06-personalization-and-notifications.md) | Idioma/unidades aplicados consistentemente en pantallas soportadas.                                             |
| HU-066 | [Compartir una ruta](../../requirements/user-stories/06-personalization-and-notifications.md)                            | Enlace de origen/destino/modo con recálculo y protección de identidad/historial.                                |

HU-060 se resuelve en el Sprint 6 y es una dependencia de integración. HU-040 mantiene sus preferencias específicas de accesibilidad separadas de las preferencias generales HU-062.

## Alcance, decisiones y dependencias

### Cliente público web

Las rutas/enlaces compartidos, preferencias, historial y favoritos disponibles para una cuenta tendrán la experiencia web correspondiente, con sesión protegida según el Sprint 6. Para HU-064 se evaluará por separado el soporte de notificaciones en navegadores y sus permisos; no se asumirá que el proveedor elegido para móvil funciona en web. Ante falta de soporte o permiso, las notificaciones permanecen configurables como no disponibles sin bloquear avisos dentro de la aplicación.

### Puertas de entrada y alcance

- Requiere cuenta/controles del Sprint 6, avisos del Sprint 9 y datos/catálogos de los Sprints 10–11.
- Refinar permisos separados de ubicación/notificaciones, conservación y borrado del historial, campos incluidos en enlaces, idioma base, unidades y origen de cada evento notificable.
- Antes de integrar push, aceptar ADR que compare soporte de Expo Push u otra alternativa en Android/iOS y web: permisos, token, cifrado/rotación, retención, entregabilidad, costes, caducidad, deduplicación, restricciones de navegador y entorno. La decisión remota de Expo Push no está aceptada localmente.
- Si no existe proveedor, notificación/evento de origen o permiso, mostrar contenido en la app y mantener la funcionalidad push como pendiente; no simular entregas del dispositivo.
- Los enlaces compartidos solo contienen identificadores públicos y datos mínimos necesarios; no contienen token de sesión, historial, perfil ni coordenadas precisas no seleccionadas explícitamente.

## Responsabilidades por rol

| Rol           | Responsabilidades en el Sprint                                                           |
| ------------- | ---------------------------------------------------------------------------------------- |
| Product Owner | Validar qué eventos son útiles y qué información puede incluir cada enlace/notificación. |
| Scrum Master  | Exponer dependencias de proveedor, permisos y calendario de contenido.                   |
| Developers    | Mantener aislamiento, sincronización y borrado de la información personal.               |
| Developers    | Implementar preferencias, enlaces, traducciones y estados de permiso en móvil y web.     |
| Developers    | Gestionar eventos idempotentes, registro de dispositivo y autorización.                  |
| Developers    | Probar exposición de datos y accesibilidad en todos los flujos.                          |

## Plan inicial y seguimiento

### Plan de trabajo

| ID  | Actividad y entregable                                                                                                                                   | Depende de          | Área funcional           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| T1  | Refinar reglas de historial, preferencia, rutas guardadas, consentimiento, enlaces y mensajes de notificación.                                           | Historias; S6/S9–11 | PO + Developers          |
| T2  | Definir esquema privado para preferencias/historial y política de retención, sincronización, borrado y recuperación.                                     | T1, privacidad      | API/datos                |
| T3  | Diseñar formato/versionado de enlaces y resolver identificadores sin exponer datos de sesión o ubicación privada.                                        | T1                  | Móvil/deep links         |
| T4  | Comparar proveedores/eventos de notificación en móvil y web y aceptar ADR; implementar permisos opt-in y registro seguro solo tras decisión.             | T1, eventos del S9  | Arquitectura + seguridad |
| T5  | Implementar CRUD/sincronización de rutas y preferencias, lista de recientes y eliminación individual/total, con endpoints privados y vistas móvil/web.   | T2                  | API + clientes           |
| T6  | Implementar enlaces universales/web, validación/recalculo de ruta y fallback si destino o camino han cambiado, sin exponer datos de cuenta.              | T3, motor de rutas  | Móvil + web              |
| T7  | Implementar preferencias de categorías, horario de silencio y deduplicación en superficies compatibles; enlazar avisos/incidencias autorizados al abrir. | T4, eventos válidos | API + clientes           |
| T8  | Aplicar idioma y unidades a todas las pantallas móviles y web del alcance y revisar traducciones incompletas.                                            | T1                  | Clientes                 |
| T9  | Probar privacidad, borrado, sincronización, enlaces alterados, permisos denegados, duplicados, expiración y preferencias no disponibles.                 | T5–T8               | Calidad/seguridad        |
| T10 | Actualizar historias, ADR, privacidad, enlaces, guía, backlog; validar CI, build web y builds nativos iOS/Android.                                       | T9                  | Documentación/calidad    |

### Archivos previstos

`apps/mobile/src/features/` y el cliente web definido por ADR para preferencias, rutas, enlaces e idioma; `apps/api/src/` para operaciones privadas y eventos; `packages/contracts/` para esquemas; configuración de notificaciones solo cuando ADR lo apruebe. Actualizar historias 02/03/06/08, ADR, guía de privacidad, enlaces y pruebas de cliente web/móvil.

## Riesgos y respuestas

| Riesgo                                                         | Probabilidad / impacto | Mitigación y respuesta                                                                            | Seguimiento     |
| -------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- | --------------- |
| Enlace revela datos privados o deja de funcionar               | Media / Alta           | Allowlist de campos, formato versionado, validación del servidor y pruebas con enlace manipulado. | Seguridad       |
| Notificación llega tras revocar permiso o desactivar categoría | Media / Alta           | Comprobar preferencias antes de enviar, revocar tokens y probar carreras/caducidad.               | API             |
| Push se duplica o queda sin evento verificado                  | Media / Alta           | Clave idempotente de evento y registro del resultado; deshabilitar categoría sin origen fiable.   | API + datos     |
| Historial personal se conserva sin propósito                   | Media / Alta           | Definir minimización/retención, ofrecer borrado y excluir ubicación continua.                     | PO + privacidad |
| Localización/traducción incompleta presenta texto roto         | Media / Media          | Catálogo de mensajes, detección en pruebas y mantener español como idioma base.                   | Móvil + calidad |

## Verificación, documentación y Definition of Done

### Pruebas y Definition of Done

Pruebas API verifican aislamiento y eliminación; pruebas de enlace validan campos, versión y recalculo; pruebas móviles cubren permisos, estados, horario de silencio, lectores de pantalla y unidades/idioma; pruebas del proveedor se ejecutan en entorno de test sin tokens reales en logs. Comprobar que ningún evento no autorizado genera un envío.

DoD requiere proveedor/ADR aceptado para push si HU-064 se cierra, criterios demostrables, CI y docs sincronizados, consentimiento efectivo, build web y builds nativos Android/iOS y aprobación funcional. Si falta proveedor o evento, se marca como bloqueado/pendiente en el backlog y no se declara HU-064 completada.
