# Sprint 8 — gestión de incidencias y auditoría

- **Estado:** En curso (corte parcial de API, contratos, migración y `apps/admin` implementado y verificado con lint, typecheck, build de `apps/admin` y pruebas unitarias en Node `26.13.1`; pendiente la parte de cliente público web/móvil y la ejecución local con Docker/Supabase).

## Sprint Goal y valor

### Sprint Goal propuesto

Un gestor autorizado puede revisar una incidencia, cambiarla por una transición válida y dejar un registro consultable de quién actuó y cuándo, sin exponer información privada.

## Sprint Backlog

### Historias candidatas refinadas; todavía no seleccionadas

| ID     | Historia                                                                                                          | Resultado esperado                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| HU-054 | [Gestionar una incidencia](../../requirements/user-stories/05-incidents-and-notices.md)                           | Cola filtrable, clasificación diferenciada de la prioridad percibida y moderación explícita de publicación. |
| HU-055 | [Actualizar el estado de una incidencia](../../requirements/user-stories/05-incidents-and-notices.md)             | Estados definidos, transiciones permitidas, respuesta privada al informante e historial.                    |
| HU-056 | [Confirmar que sigue activa](../../requirements/user-stories/05-incidents-and-notices.md)                         | Una respuesta vigente por cuenta e incidencia, caducidad a 30 días y consulta agregada.                     |
| HU-077 | [Consultar auditoría administrativa](../../requirements/user-stories/07-administration-and-data.md)               | Consulta administrativa de eventos de incidencias, de solo lectura y sin contenido sensible.                |
| HU-097 | [Mantener trazabilidad de cambios relevantes](../../requirements/user-stories/08-security-privacy-and-quality.md) | Primer corte de trazabilidad limitado a acciones de gestión de incidencias.                                 |

## Alcance, decisiones y dependencias

### Alcance y condiciones de entrada

- El Sprint 7 debe entregar datos de incidencias persistidos y una API autenticada, con publicación pública separada de información privada.
- El refinamiento funcional de estados, transiciones, roles de producto, datos visibles y confirmaciones está registrado en las historias HU-054–056, HU-077 y HU-097. La matriz técnica de autorización y su aplicación en servidor siguen siendo trabajo de Developers.
- No se inventa un SLA ni se atribuye autoridad institucional. En esta propuesta, los roles y datos de prueba son sintéticos y locales; el alta de gestores reales, el uso de incidencias reales y la publicación real requieren autorización operativa.
- La política de conservación y borrado excepcional de auditoría sigue pendiente de aprobación competente. La propuesta se limita a Supabase local con datos sintéticos y no habilita un servicio remoto ni una política de retención para producción.
- Los estados y la publicación son independientes. Una incidencia nueva permanece privada y ninguna transición de estado la publica automáticamente.
- La vista administrativa es privada y utiliza la API; no usa `initial-data.ts` como sistema operativo ni autoriza por ocultar botones en el cliente.
- No se implementa una eliminación ordinaria de registros de auditoría; su retención y borrado excepcional requieren política aprobada.

### Refinamiento funcional del Product Owner

El refinamiento concreta el comportamiento de producto que se propone para las cinco historias candidatas. No constituye la selección del Sprint Backlog, una decisión de arquitectura ni un resultado de Sprint Planning; los Developers aún deben valorar capacidad, dependencias y forma de implementación.

| Actor              | Puede                                                                                                                                                  | Límites                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Público            | Consultar únicamente la proyección de incidencias publicadas.                                                                                          | No consulta reportes privados, evidencias, informantes ni datos de gestión.                               |
| Usuario registrado | Consultar sus propios reportes; confirmar una incidencia publicada que pueda ver o su propio reporte privado.                                          | No clasifica, asigna, cambia estados ni publica.                                                          |
| Gestor             | Consultar la cola y el detalle, corregir clasificación, asignar responsables, tramitar estados, moderar publicación y consultar evidencias necesarias. | No consulta la auditoría administrativa ni asigna roles.                                                  |
| Administrador      | Tramitar incidencias, consultar las evidencias necesarias y consultar auditoría administrativa.                                                        | La cuenta debe recibir el rol desde una operación autorizada del servidor; el perfil no concede permisos. |

La asignación operativa se realiza a una cuenta con rol de gestor. Los roles se conceden en servidor; para desarrollo se usarán identidades sintéticas.

- La cola muestra por defecto los casos recibidos, en revisión y en proceso; permite filtrar por estado, categoría y asignación, y ordena los activos por fecha de actualización ascendente. Esto no establece un plazo de atención.
- El estado inicial sigue siendo recibido y privado. Publicar o retirar requiere una acción explícita, una revisión y una proyección pública segura. Identificador público opaco, categoría, zona aproximada, resumen aprobado, estado público y fecha de actualización son los únicos datos de la proyección; no se exponen autoría, correo, adjuntos, respuestas privadas ni ubicación precisa.
- La prioridad percibida se conserva separada de la prioridad de gestión. Un caso en proceso debe tener responsable. Los duplicados se vinculan a una incidencia principal; los cierres por duplicidad o invalidez requieren motivo.
- Las transiciones permitidas, sus significados y las condiciones de cierre o reapertura están en HU-055. Cerrada es terminal; resuelta puede reabrirse por decisión de gestión. No hay transiciones automáticas ni SLA.
- Las confirmaciones de HU-056 caducan a los 30 días y gestión ve agregados vigentes, no la identidad de quien responde. No alteran estado, prioridad ni publicación.
- El historial privado del informante es el único canal de actualización incluido en esta propuesta; no se incluyen correo ni notificaciones push.
- La auditoría de HU-077 y HU-097 cubre en este corte las acciones de gestión de incidencias y accesos a evidencias. No representa cobertura de auditoría de otros dominios ni establece una duración de conservación.

### Cliente público web

La aplicación administrativa seguirá separada y será la única interfaz para la cola de gestión y auditoría. La web pública de este Sprint solo presenta al informante los estados y mensajes que puede consultar, bajo la autorización del servidor, en paridad con móvil; no expone notas internas ni acciones administrativas.

## Responsabilidades por rol

| Rol           | Responsabilidades en el Sprint                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Product Owner | Mantener ordenadas las historias, precisar los resultados funcionales y validar la información visible al informante. |
| Scrum Master  | Facilitar inspección/adaptación y visibilizar bloqueos de definición de roles y conservación.                         |
| Developers    | Integrar cola de trabajo y consultas de auditoría sin lógica de permisos únicamente cliente.                          |
| Developers    | Enforzar roles y transiciones, crear eventos de auditoría y proteger evidencias.                                      |
| Developers    | Presentar en web/móvil el estado público/propio y errores sin datos internos.                                         |
| Developers    | Cubrir permisos, trazabilidad, contratos y evidencia de las plataformas.                                              |

## Plan inicial y seguimiento

### Plan de trabajo

| ID  | Actividad y entregable                                                                                                                       | Depende de           | Área funcional         | Estado en rama actual                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Revisar el refinamiento funcional con Developers durante Sprint Planning y acordar el alcance seleccionable según capacidad y dependencias.  | Historias + Sprint 7 | PO + Developers        | Refinamiento PO registrado                                                                                                                                                   |
| T2  | Traducir los permisos de producto a una matriz técnica aplicada en servidor; proponer un ADR solo si surge una decisión técnica no cubierta. | T1, ADR de identidad | Seguridad/arquitectura | Implementado (`account_roles`, `RolesGuard`, `AuthService.resolveRole`)                                                                                                      |
| T3  | Diseñar contratos, eventos de auditoría, consulta paginada y esquema; excluir contraseñas, tokens, fotos privadas y datos innecesarios.      | T2                   | API/datos              | Implementado (`packages/contracts`, migración `0004`, `IncidentAuditService`)                                                                                                |
| T4  | Implementar endpoints de gestión con autorización en servidor y control optimista/transaccional de estado.                                   | T3                   | API                    | Implementado (`IncidentManagementController` / `Service`, concurrencia `revision`, evidencia auditada)                                                                       |
| T5  | Conectar la vista de administración al API; agregar cola, búsqueda, filtros, detalle, motivo y estados vacíos/error.                         | T4                   | Admin                  | Implementado (`apps/admin` React/Vite/TS)                                                                                                                                    |
| T6  | Mostrar en móvil y web los cambios de estado que puede ver el informante, sin revelar notas internas ni identidad personal de otros actores. | T4                   | Clientes/API           | Pendiente en `apps/mobile` (soporte API `GET /me/incidents/:id` y confirmaciones ya añadido)                                                                                 |
| T7  | Registrar eventos auditables y construir vista de consulta con filtros y paginación, solo para rol autorizado.                               | T3, T4               | API + admin            | Implementado (`GET /admin/audit-events`, `AuditLogView`)                                                                                                                     |
| T8  | Probar transiciones inválidas, concurrencia, acceso por rol, logs/auditoría y no divulgación de adjuntos.                                    | T4–T7                | Calidad/seguridad      | Unitarias API (`24/24`), unitarias admin (`5/5`), Jest (`64/64`), lint, typecheck y `admin:build` en verde; `test:local-supabase` pendiente de Docker local (cubierta en CI) |
| T9  | Actualizar historias, backlog, OpenAPI, guía de roles, retención y documentación; probar cliente web, builds Android/iOS y CI.               | T8                   | Calidad/documentación  | Documentación y Wiki sincronizadas para este corte; CI/web/builds nativos pendientes                                                                                         |

### Archivos previstos para la implementación del Sprint

`apps/admin/src/` para vistas y cliente API; `apps/api/src/` para módulos, políticas y auditoría; `packages/contracts/` para estados y esquemas; `apps/mobile/src/features/incidents/` y el cliente web público definido en el Sprint 3 para el historial propio. Actualizar historias 05/07/08, Product Backlog, ADR aplicables, OpenAPI, pruebas y documentación operativa.

## Riesgos y respuestas

### Riesgos y respuesta

| Riesgo                                                  | Probabilidad / impacto | Mitigación y respuesta                                                                                           | Seguimiento     |
| ------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------- |
| Un rol débil habilita modificación administrativa       | Baja / Crítica         | Autorización central en cada endpoint; pruebas negativas por acción y denegación por defecto.                    | Seguridad       |
| Transiciones no acordadas causan estados inconsistentes | Media / Alta           | Modelo de estados explícito y pruebas de transición; mantener cambio pendiente si falta definición de autoridad. | PO + API        |
| Auditoría contiene datos personales o credenciales      | Media / Crítica        | Lista de campos permitidos, redacción, controles y pruebas de secretos; no capturar payloads completos.          | Seguridad       |
| Vistas admin continúan usando mocks                     | Media / Alta           | Pruebas de contrato y modo de error cuando API no responde; no presentar seed como registro real.                | Admin + calidad |

## Verificación, documentación y Definition of Done

### Verificación y Definition of Done

Probar cada estado/acción válida e inválida, aislamiento entre gestores y público, concurrencia, auditoría inmutable desde la app y la ausencia de secretos. Verificar que la vista de usuario diferencia estado público y nota interna. Validar roles y flujos en API, panel, móvil y tests de contrato.

DoD: criterios satisfechos; migraciones reproducibles; CI y pruebas de seguridad verdes; administración y clientes públicos accesibles; estados del informante comprobados en web y móvil; documentación del flujo, roles y conservación alineada; build web y builds nativos Android/iOS; aceptación del incremento por Product Owner. Una vista que opere solo sobre datos en memoria no cumple el objetivo.
